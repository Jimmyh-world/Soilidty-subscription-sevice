const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of SubscriptionPlatform...");

  // Get the deployer signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get the contract factory with signer
  const SubscriptionPlatform = await ethers.getContractFactory("SubscriptionPlatform", deployer);

  // Deploy the contract
  console.log("Deploying SubscriptionPlatform...");
  const subscriptionPlatform = await SubscriptionPlatform.deploy();

  // Wait for deployment to be mined
  await subscriptionPlatform.waitForDeployment();

  const contractAddress = await subscriptionPlatform.getAddress();
  console.log("SubscriptionPlatform deployed to:", contractAddress);

  // Log deployment details
  console.log("\n=== Deployment Summary ===");
  console.log("Contract: SubscriptionPlatform");
  console.log("Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await ethers.getSigners())[0].address);

  // If we're on Sepolia, wait a bit for block confirmations before verification
  if (hre.network.name === "sepolia") {
    console.log("\nWaiting for block confirmations...");
    await subscriptionPlatform.deploymentTransaction().wait(5);

    console.log("\n=== Verification Command ===");
    console.log(`npx hardhat verify --network sepolia ${contractAddress}`);

    console.log("\n=== Contract Interaction Examples ===");
    console.log("// Create a service (fee: 0.1 ETH, period: 30 days)");
    console.log(`await contract.createService("${ethers.parseEther("0.1")}", ${30 * 24 * 60 * 60});`);
    console.log("");
    console.log("// Subscribe to service 1");
    console.log(`await contract.subscribe(1, { value: "${ethers.parseEther("0.1")}" });`);
    console.log("");
    console.log("// Check if address has active subscription");
    console.log(`await contract.hasActiveSubscription(1, "0x...");`);
  }

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((contractAddress) => {
    console.log(`\n✅ Deployment completed successfully!`);
    console.log(`📋 Contract Address: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });