import { expect } from "chai";
import { ethers } from "hardhat";
import {
  PaymentFactory,
  ConditionalPayment,
  IERC20,
  IConditionOracle,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("IntentRemit End-to-End", function () {
  let factory: PaymentFactory;
  let owner: HardhatEthersSigner;
  let sender: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;
  let approver: HardhatEthersSigner;
  let mockToken: any;
  let mockOracle: any;

  const TOTAL_AMOUNT = ethers.parseEther("100");
  const IMMEDIATE_AMOUNT = ethers.parseEther("60");
  const LOCKED_AMOUNT = ethers.parseEther("40");
  const GOAL = "School Fees";

  beforeEach(async function () {
    [owner, sender, recipient, approver] = await ethers.getSigners();

    // Deploy Factory
    const PaymentFactory = await ethers.getContractFactory("PaymentFactory");
    factory = await PaymentFactory.deploy();

    // Deploy Mock Token (for cUSD simulation)
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    mockToken = await ERC20Mock.deploy("Mock cUSD", "cUSD");
    await mockToken.mint(sender.address, ethers.parseEther("1000"));

    // Deploy Mock Oracle
    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy();
  });

  describe("Native CELO Payments", function () {
    it("Should create a split payment and execute immediate release", async function () {
      const executeAt = (await time.latest()) + time.duration.days(7);
      const conditionData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [executeAt],
      );

      const tx = await factory.connect(sender).createPayment(
        recipient.address,
        ethers.ZeroAddress,
        TOTAL_AMOUNT,
        IMMEDIATE_AMOUNT,
        GOAL,
        0, // TIMESTAMP
        conditionData,
        { value: TOTAL_AMOUNT },
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => (log as any).fragment?.name === "PaymentCreated",
      );
      const paymentAddress = (event as any).args.paymentAddress;

      const payment = await ethers.getContractAt(
        "ConditionalPayment",
        paymentAddress,
      );

      // Execute Immediate
      const initialBal = await ethers.provider.getBalance(recipient.address);
      await payment.connect(recipient).executeImmediate();
      const finalBal = await ethers.provider.getBalance(recipient.address);

      // Use closeTo for native balance checks to account for gas costs
      expect(finalBal - initialBal).to.be.closeTo(
        IMMEDIATE_AMOUNT,
        ethers.parseEther("0.01"),
      );

      const status = await payment.getStatus();
      expect(status._immediateExecuted).to.be.true;
      expect(status._balance).to.equal(LOCKED_AMOUNT);
    });

    it("Should execute locked portion after timestamp", async function () {
      const executeAt = (await time.latest()) + time.duration.days(7);
      const conditionData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [executeAt],
      );

      const tx = await factory.connect(sender).createPayment(
        recipient.address,
        ethers.ZeroAddress,
        TOTAL_AMOUNT,
        0, // NO IMMEDIATE
        GOAL,
        0, // TIMESTAMP
        conditionData,
        { value: TOTAL_AMOUNT },
      );

      const receipt = await tx.wait();
      const paymentAddress = (
        receipt?.logs.find(
          (log) => (log as any).fragment?.name === "PaymentCreated",
        ) as any
      ).args.paymentAddress;
      const payment = await ethers.getContractAt(
        "ConditionalPayment",
        paymentAddress,
      );

      // Fast forward time
      await time.increaseTo(executeAt + 1);

      await payment.connect(recipient).executeLocked();

      const status = await payment.getStatus();
      expect(status._lockedExecuted).to.be.true;

      const balance = await ethers.provider.getBalance(
        await payment.getAddress(),
      );
      expect(balance).to.equal(0n);
    });
  });

  describe("ERC20 (cUSD) Payments", function () {
    it("Should handle cUSD split payments correctly", async function () {
      const executeAt = (await time.latest()) + time.duration.days(7);
      const conditionData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [executeAt],
      );

      await mockToken
        .connect(sender)
        .approve(await factory.getAddress(), TOTAL_AMOUNT);

      const tx = await factory.connect(sender).createPayment(
        recipient.address,
        await mockToken.getAddress(),
        TOTAL_AMOUNT,
        IMMEDIATE_AMOUNT,
        GOAL,
        0, // TIMESTAMP
        conditionData,
      );

      const receipt = await tx.wait();
      const paymentAddress = (
        receipt?.logs.find(
          (log) => (log as any).fragment?.name === "PaymentCreated",
        ) as any
      ).args.paymentAddress;
      const payment = await ethers.getContractAt(
        "ConditionalPayment",
        paymentAddress,
      );

      // Execute Immediate
      await payment.connect(recipient).executeImmediate();
      expect(await mockToken.balanceOf(recipient.address)).to.equal(
        IMMEDIATE_AMOUNT,
      );

      // Execute Locked
      await time.increaseTo(executeAt);
      await payment.connect(recipient).executeLocked();
      expect(await mockToken.balanceOf(recipient.address)).to.equal(
        TOTAL_AMOUNT,
      );
    });
  });

  describe("Oracle Conditions", function () {
    it("Should execute based on modular oracle condition", async function () {
      const oracleData = ethers.hexlify(ethers.randomBytes(32));
      const conditionData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "bytes"],
        [await mockOracle.getAddress(), oracleData],
      );

      const tx = await factory.connect(sender).createPayment(
        recipient.address,
        ethers.ZeroAddress,
        TOTAL_AMOUNT,
        0, // No immediate
        GOAL,
        3, // ORACLE
        conditionData,
        { value: TOTAL_AMOUNT },
      );

      const receipt = await tx.wait();
      const paymentAddress = (
        receipt?.logs.find(
          (log) => (log as any).fragment?.name === "PaymentCreated",
        ) as any
      ).args.paymentAddress;
      const payment = await ethers.getContractAt(
        "ConditionalPayment",
        paymentAddress,
      );

      // Condition not met yet
      await expect(
        payment.connect(recipient).executeLocked(),
      ).to.be.rejectedWith("Condition not met");

      // Meet condition via mock
      await mockOracle.setCondition(oracleData, true);
      await payment.connect(recipient).executeLocked();

      const status = await payment.getStatus();
      expect(status._lockedExecuted).to.be.true;
    });
  });
});
