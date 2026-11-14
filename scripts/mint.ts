import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();

  const tokenAddress = "0x333e1C77f7dC77Aaa8037D9d11A09A6c9E656ee1";
  const mintAmount = 1000000000000000000000n; // 1000 STK (18 desimal)

  const token = await viem.getContractAt("StakingToken", tokenAddress);
  const [owner] = await viem.getWalletClients();

  console.log("Minting to:", owner.account.address);

  const hash = await token.write.mint([owner.account.address, mintAmount]);
  console.log("Transaction hash:", hash);

  const publicClient = await viem.getPublicClient();
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Status:", receipt.status);

  const balance = await token.read.balanceOf([owner.account.address]);
  console.log("New balance:", balance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});