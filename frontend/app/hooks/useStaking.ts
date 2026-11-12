"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { getAddress, parseEther } from "viem";
import { STAKING_TOKEN_ABI, STAKING_ABI } from "../abi";

const stakingTokenAddress = process.env.NEXT_PUBLIC_STAKING_TOKEN_ADDRESS;
const stakingAddress = process.env.NEXT_PUBLIC_STAKING_ADDRESS;

if (!stakingTokenAddress || !stakingAddress) {
  throw new Error("Missing staking contract addresses");
}

const STAKING_TOKEN_ADDRESS = getAddress(stakingTokenAddress);
const STAKING_ADDRESS = getAddress(stakingAddress);

export function useStaking() {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const { writeContractAsync } = useWriteContract();

  const token = useReadContract({
    address: STAKING_TOKEN_ADDRESS,
    abi: STAKING_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });
  const staked = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });
  const earned = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "earned",
    args: address ? [address] : undefined,
  });

  async function runTransaction(status: string, action: () => Promise<void>, success: string) {
    try {
      setLoading(true);
      setTxStatus(status);
      await action();
      setTxStatus(success);
      await Promise.all([token.refetch(), staked.refetch(), earned.refetch()]);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown transaction error";
      setTxStatus(`Transaction failed: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleStake = () => {
    if (!stakeAmount || Number(stakeAmount) <= 0 || Number.isNaN(Number(stakeAmount))) return;
    const amount = parseEther(stakeAmount);
    return runTransaction(
      "Approving STK tokens...",
      async () => {
        await writeContractAsync({ address: STAKING_TOKEN_ADDRESS, abi: STAKING_TOKEN_ABI, functionName: "approve", args: [STAKING_ADDRESS, amount] });
        setTxStatus("Staking STK tokens...");
        await writeContractAsync({ address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: "stake", args: [amount] });
        setStakeAmount("");
      },
      "Successfully staked!",
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0 || Number.isNaN(Number(withdrawAmount))) return;
    const amount = parseEther(withdrawAmount);
    return runTransaction(
      "Withdrawing staked tokens...",
      async () => {
        await writeContractAsync({ address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: "withdraw", args: [amount] });
        setWithdrawAmount("");
      },
      "Successfully withdrawn!",
    );
  };

  const handleClaim = () =>
    runTransaction(
      "Claiming rewards...",
      () => writeContractAsync({ address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: "claimReward" }).then(() => undefined),
      "Successfully claimed rewards!",
    );

  return {
    isConnected,
    tokenBalance: token.data,
    stakedBalance: staked.data,
    earnedRewards: earned.data,
    stakeAmount,
    withdrawAmount,
    loading,
    txStatus,
    setStakeAmount,
    setWithdrawAmount,
    setTxStatus,
    handleStake,
    handleWithdraw,
    handleClaim,
  };
}
