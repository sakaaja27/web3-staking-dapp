import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther } from "viem";
import { network } from "hardhat";

describe("StakingToken", async function () {
  const { viem } = await network.create();

  it("Should mint initial supply to owner", async function () {
    const [owner] = await viem.getWalletClients();
    const initialSupply = parseEther("1000");
    const token = await viem.deployContract("StakingToken", [initialSupply]);

    const balance = await token.read.balanceOf([owner.account.address]);
    assert.equal(balance, initialSupply);
  });

  it("Should allow owner to mint new tokens", async function () {
    const [owner, recipient] = await viem.getWalletClients();
    const initialSupply = parseEther("1000");
    const mintAmount = parseEther("500");
    const token = await viem.deployContract("StakingToken", [initialSupply]);

    await token.write.mint([recipient.account.address, mintAmount]);

    const balance = await token.read.balanceOf([recipient.account.address]);
    assert.equal(balance, mintAmount);
  });
});
