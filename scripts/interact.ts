import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();
  const address = walletClient.account.address;
  console.log("Wallet address:", address);
}

main().catch(console.error);
