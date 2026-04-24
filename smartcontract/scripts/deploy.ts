import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deploying PayWhen contracts with the account:", deployerAddress);

  // Deploy PaymentFactory
  console.log("\n1. Deploying PaymentFactory...");
  const PaymentFactory = await ethers.getContractFactory("PaymentFactory");
  const paymentFactory = await PaymentFactory.deploy();
  await paymentFactory.waitForDeployment();
  const factoryAddress = await paymentFactory.getAddress();
  console.log("PaymentFactory deployed to:", factoryAddress);

  // Deploy a sample VaultAdapter (optional)
  console.log("\n2. Deploying VaultAdapter...");
  const VaultAdapter = await ethers.getContractFactory("VaultAdapter");
  const vaultAdapter = await VaultAdapter.deploy(ethers.ZeroAddress, "PayWhen Vault");
  await vaultAdapter.waitForDeployment();
  const vaultAddress = await vaultAdapter.getAddress();
  console.log("VaultAdapter deployed to:", vaultAddress);

  // Register vault with factory
  console.log("\n3. Registering vault adapter...");
  const tx = await paymentFactory.setVaultAdapter(vaultAddress, true);
  await tx.wait();
  console.log("Vault adapter registered");

  console.log("\n=== Deployment Complete ===");
  console.log("PaymentFactory:", factoryAddress);
  console.log("VaultAdapter:", vaultAddress);
  console.log("\nSupported networks: Celo Alfajores, Celo Mainnet");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
