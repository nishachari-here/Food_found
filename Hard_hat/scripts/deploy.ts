import hre from "hardhat";

async function main() {
  // In Hardhat 3, we ensure the network is connected to get the viem helpers
  const { viem } = await hre.network.connect();

  const [deployer] = await viem.getWalletClients();
  console.log(`Deploying with account: ${deployer.account.address}`);

  // Deploying the contract
  const traceability = await viem.deployContract("OrganicTraceability");

  console.log(
    `OrganicTraceability deployed to: ${traceability.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });