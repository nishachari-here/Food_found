import hre from "hardhat";

async function main() {
  // 1. Connect to the network
  const { viem } = await hre.network.connect();

  // 2. Get the wallet client (your deployer account)
  const [deployer] = await viem.getWalletClients();
  console.log(`Deploying with account: ${deployer.account.address}`);

  // 3. Deploy the updated OrganicTraceability contract
  const traceability = await viem.deployContract("OrganicTraceability");

  console.log(`OrganicTraceability deployed to: ${traceability.address}`);
  
  // Optional: Initial registration to test it works
  // const hash = await traceability.write.registerProduct([
  //   "Organic Heirloom Tomatoes", 
  //   "ipfs://metadata-link", 
  //   "Ojai, CA", 
  //   1200n, 1n, 94n
  // ]);
  // console.log(`Test product registered. TX: ${hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });