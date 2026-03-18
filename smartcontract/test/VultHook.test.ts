import { expect } from "chai";
import { ethers } from "hardhat";
import { MockERC20, MockERC4626Vault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * VultHook Unit Tests
 *
 * These tests cover the admin/access-control and state-management layer of VultHook.
 * Full hook integration tests (afterAddLiquidity, afterSwap, beforeSwap) require
 * a Uniswap v4 PoolManager fork or the v4-template test harness and are documented
 * as future work in the test plan below.
 *
 * What IS tested here:
 *  - Owner-only access control on setVaultForAsset
 *  - Owner-only access control on transferOwnership
 *  - Vault mapping state management
 *  - Zero-address validation
 *  - Event emissions
 *  - Constructor sets owner correctly
 *  - Ownership transfer flow
 */

describe("VultHook — Admin & State Management", function () {
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let asset: MockERC20;
  let vault: MockERC4626Vault;
  let vultHook: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock ERC20
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    asset = await MockERC20Factory.deploy("Mock USDC", "USDC", 6);
    await asset.waitForDeployment();

    // Deploy mock ERC4626 vault
    const MockVaultFactory = await ethers.getContractFactory("MockERC4626Vault");
    vault = await MockVaultFactory.deploy(await asset.getAddress());
    await vault.waitForDeployment();

    // Deploy VultHook with a mock pool manager address (owner acts as pool manager for unit tests)
    // We use a minimal deployment — the hook's core logic (afterSwap etc.) requires PoolManager
    // callbacks, so we test admin functions directly here.
    const VultHookFactory = await ethers.getContractFactory("VultHook");
    vultHook = await VultHookFactory.deploy(owner.address);
    await vultHook.waitForDeployment();
  });

  describe("Constructor", function () {
    it("Should set deployer as owner", async function () {
      expect(await vultHook.owner()).to.equal(owner.address);
    });

    it("Should initialize with no vault mappings", async function () {
      expect(await vultHook.assetToVault(await asset.getAddress())).to.equal(ethers.ZeroAddress);
    });
  });

  describe("setVaultForAsset", function () {
    it("Should allow owner to set vault for an asset", async function () {
      const assetAddr = await asset.getAddress();
      const vaultAddr = await vault.getAddress();

      await vultHook.setVaultForAsset(assetAddr, vaultAddr);
      expect(await vultHook.assetToVault(assetAddr)).to.equal(vaultAddr);
    });

    it("Should emit VaultSet event", async function () {
      const assetAddr = await asset.getAddress();
      const vaultAddr = await vault.getAddress();

      await expect(vultHook.setVaultForAsset(assetAddr, vaultAddr))
        .to.emit(vultHook, "VaultSet")
        .withArgs(assetAddr, vaultAddr);
    });

    it("Should allow owner to update vault mapping", async function () {
      const assetAddr = await asset.getAddress();
      const vaultAddr = await vault.getAddress();

      await vultHook.setVaultForAsset(assetAddr, vaultAddr);
      expect(await vultHook.assetToVault(assetAddr)).to.equal(vaultAddr);

      // Update to a different address
      await vultHook.setVaultForAsset(assetAddr, user2.address);
      expect(await vultHook.assetToVault(assetAddr)).to.equal(user2.address);
    });

    it("Should allow owner to remove vault mapping (set to zero)", async function () {
      const assetAddr = await asset.getAddress();
      const vaultAddr = await vault.getAddress();

      await vultHook.setVaultForAsset(assetAddr, vaultAddr);
      await vultHook.setVaultForAsset(assetAddr, ethers.ZeroAddress);
      expect(await vultHook.assetToVault(assetAddr)).to.equal(ethers.ZeroAddress);
    });

    it("Should revert when non-owner tries to set vault", async function () {
      const assetAddr = await asset.getAddress();
      const vaultAddr = await vault.getAddress();

      await expect(
        vultHook.connect(user1).setVaultForAsset(assetAddr, vaultAddr)
      ).to.be.revertedWithCustomError(vultHook, "OnlyOwner");
    });

    it("Should revert when asset is zero address", async function () {
      const vaultAddr = await vault.getAddress();

      await expect(
        vultHook.setVaultForAsset(ethers.ZeroAddress, vaultAddr)
      ).to.be.revertedWithCustomError(vultHook, "ZeroAddress");
    });

    it("Should handle multiple asset-vault mappings independently", async function () {
      const assetAddr = await asset.getAddress();
      const vaultAddr = await vault.getAddress();

      // Deploy a second mock asset
      const MockERC20Factory = await ethers.getContractFactory("MockERC20");
      const asset2 = await MockERC20Factory.deploy("Mock WETH", "WETH", 18);
      const asset2Addr = await asset2.getAddress();

      await vultHook.setVaultForAsset(assetAddr, vaultAddr);
      await vultHook.setVaultForAsset(asset2Addr, user1.address);

      expect(await vultHook.assetToVault(assetAddr)).to.equal(vaultAddr);
      expect(await vultHook.assetToVault(asset2Addr)).to.equal(user1.address);
    });
  });

  describe("transferOwnership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await vultHook.transferOwnership(user1.address);
      expect(await vultHook.owner()).to.equal(user1.address);
    });

    it("Should emit OwnershipTransferred event", async function () {
      await expect(vultHook.transferOwnership(user1.address))
        .to.emit(vultHook, "OwnershipTransferred")
        .withArgs(owner.address, user1.address);
    });

    it("Should revert when non-owner tries to transfer", async function () {
      await expect(
        vultHook.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWithCustomError(vultHook, "OnlyOwner");
    });

    it("Should revert when transferring to zero address", async function () {
      await expect(
        vultHook.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(vultHook, "ZeroAddress");
    });

    it("Should allow new owner to call admin functions after transfer", async function () {
      await vultHook.transferOwnership(user1.address);

      const assetAddr = await asset.getAddress();
      const vaultAddr = await vault.getAddress();

      // New owner can set vaults
      await vultHook.connect(user1).setVaultForAsset(assetAddr, vaultAddr);
      expect(await vultHook.assetToVault(assetAddr)).to.equal(vaultAddr);

      // Old owner cannot
      await expect(
        vultHook.setVaultForAsset(assetAddr, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(vultHook, "OnlyOwner");
    });
  });

  describe("Constants", function () {
    it("Should have MIN_YIELD_THRESHOLD set to 1000", async function () {
      expect(await vultHook.MIN_YIELD_THRESHOLD()).to.equal(1000);
    });
  });

  describe("getHookPermissions", function () {
    it("Should return correct permissions", async function () {
      const perms = await vultHook.getHookPermissions();
      expect(perms.afterAddLiquidity).to.be.true;
      expect(perms.beforeSwap).to.be.true;
      expect(perms.afterSwap).to.be.true;
      expect(perms.beforeInitialize).to.be.false;
      expect(perms.afterInitialize).to.be.false;
      expect(perms.beforeAddLiquidity).to.be.false;
      expect(perms.beforeRemoveLiquidity).to.be.false;
      expect(perms.afterRemoveLiquidity).to.be.false;
      expect(perms.beforeDonate).to.be.false;
      expect(perms.afterDonate).to.be.false;
    });
  });
});
