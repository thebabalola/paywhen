import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying PayWhen contracts with account:", deployerAddress);

  // Deploy PaymentFactory
  console.log("\nDeploying PaymentFactory...");
  const PaymentFactory = await ethers.getContractFactory("PaymentFactory");
  const paymentFactory = await PaymentFactory.deploy();
  await paymentFactory.waitForDeployment();
  const factoryAddress = await paymentFactory.getAddress();
  console.log("PaymentFactory deployed to:", factoryAddress);

  console.log("\n=== Deployment Complete ===");
  console.log("PaymentFactory:", factoryAddress);
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Etherscan: npx hardhat verify --network <network> " + factoryAddress);
  console.log("2. Deploy individual ConditionalPayment contracts via PaymentFactory.createPayment()");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
