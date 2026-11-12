import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther } from "viem";
import { network } from "hardhat";

describe("Staking", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  it("Should allow staking and earning rewards", async function () {
    const [owner, user] = await viem.getWalletClients();

    const token = await viem.deployContract("StakingToken", [parseEther("10000")]);
    const staking = await viem.deployContract("Staking", [token.address, token.address]);

    await token.write.transfer([user.account.address, parseEther("1000")]);
    await token.write.approve([staking.address, parseEther("1000")], { account: user.account });

    await staking.write.stake([parseEther("500")], { account: user.account });
    assert.equal(await staking.read.balanceOf([user.account.address]), parseEther("500"));

    await publicClient.request({
      method: "evm_increaseTime",
      params: [100],
    });
    await publicClient.request({
      method: "evm_mine",
      params: [],
    });

    const earned = await staking.read.earned([user.account.address]);
    assert.ok(earned > 0n);

    await token.write.transfer([staking.address, parseEther("1000")]);

    const balanceBefore = await token.read.balanceOf([user.account.address]);
    await staking.write.claimReward({ account: user.account });
    const balanceAfter = await token.read.balanceOf([user.account.address]);

    assert.ok(balanceAfter > balanceBefore);
  });

  it("Should allow withdrawing staked tokens", async function () {
    const [owner, user] = await viem.getWalletClients();

    const token = await viem.deployContract("StakingToken", [parseEther("10000")]);
    const staking = await viem.deployContract("Staking", [token.address, token.address]);

    await token.write.transfer([user.account.address, parseEther("1000")]);
    await token.write.approve([staking.address, parseEther("1000")], { account: user.account });

    await staking.write.stake([parseEther("400")], { account: user.account });
    assert.equal(await staking.read.balanceOf([user.account.address]), parseEther("400"));

    const userBalanceBefore = await token.read.balanceOf([user.account.address]);
    await staking.write.withdraw([parseEther("150")], { account: user.account });
    const userBalanceAfter = await token.read.balanceOf([user.account.address]);

    assert.equal(await staking.read.balanceOf([user.account.address]), parseEther("250"));
    assert.equal(userBalanceAfter - userBalanceBefore, parseEther("150"));
  });
});
