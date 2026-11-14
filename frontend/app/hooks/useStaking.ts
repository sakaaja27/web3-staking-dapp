"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
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
  const publicClient = usePublicClient();

  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Real-time ticking state for earned rewards
  const [realtimeEarned, setRealtimeEarned] = useState<bigint>(0n);
  const [optimisticEarned, setOptimisticEarned] = useState<bigint | null>(null);

  const { writeContractAsync } = useWriteContract();

  // On-chain reads with automated background polling
  const token = useReadContract({
    address: STAKING_TOKEN_ADDRESS,
    abi: STAKING_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 4000,
    },
  });

  const staked = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 4000,
    },
  });

  const earned = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "earned",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 2500,
    },
  });

  const totalSupply = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "totalSupply",
    query: {
      refetchInterval: 5000,
    },
  });

  // Sync on-chain earned data into local state when not in an optimistic transaction state
  useEffect(() => {
    if (optimisticEarned !== null) {
      setRealtimeEarned(optimisticEarned);
    } else if (earned.data !== undefined) {
      setRealtimeEarned(earned.data);
    }
  }, [earned.data, optimisticEarned]);

  // Real-time per-second ticker for accrued rewards
  useEffect(() => {
    const stakedAmount = staked.data ?? 0n;
    const total = totalSupply.data ?? 0n;

    if (stakedAmount === 0n || total === 0n) return;

    // Contract REWARD_RATE_PER_SECOND = 1e15 (0.001 STK/sec per staked unit)
    const perSecond = (stakedAmount * 1000000000000000n) / total;
    if (perSecond === 0n) return;

    const interval = setInterval(() => {
      setRealtimeEarned((prev) => prev + perSecond);
    }, 1000);

    return () => clearInterval(interval);
  }, [staked.data, totalSupply.data]);

  // Refetch all contract state
  const refetchAll = async () => {
    await Promise.all([
      token.refetch(),
      staked.refetch(),
      earned.refetch(),
      totalSupply.refetch(),
    ]);
  };

  async function runTransaction(status: string, action: () => Promise<void>, success: string) {
    try {
      setLoading(true);
      setTxStatus(status);
      await action();
      setTxStatus(success);
      setRefreshTrigger((prev) => prev + 1);

      // Immediate refetch
      await refetchAll();

      // Second sync refetch 1.5s later to handle RPC node propagation delay
      setTimeout(() => {
        refetchAll();
        setRefreshTrigger((prev) => prev + 1);
      }, 1500);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown transaction error";
      setTxStatus(`Transaction failed: ${message}`);
    } finally {
      setLoading(false);
      setOptimisticEarned(null);
    }
  }

  const handleStake = () => {
    if (!stakeAmount || Number(stakeAmount) <= 0 || Number.isNaN(Number(stakeAmount))) return;
    const amount = parseEther(stakeAmount);
    return runTransaction(
      "Approving STK tokens...",
      async () => {
        const approveHash = await writeContractAsync({
          address: STAKING_TOKEN_ADDRESS,
          abi: STAKING_TOKEN_ABI,
          functionName: "approve",
          args: [STAKING_ADDRESS, amount],
        });

        if (publicClient) {
          setTxStatus("Confirming approval on-chain...");
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }

        setTxStatus("Staking STK tokens...");
        const stakeHash = await writeContractAsync({
          address: STAKING_ADDRESS,
          abi: STAKING_ABI,
          functionName: "stake",
          args: [amount],
        });

        if (publicClient) {
          setTxStatus("Confirming stake on-chain...");
          await publicClient.waitForTransactionReceipt({ hash: stakeHash });
        }

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
        const withdrawHash = await writeContractAsync({
          address: STAKING_ADDRESS,
          abi: STAKING_ABI,
          functionName: "withdraw",
          args: [amount],
        });

        if (publicClient) {
          setTxStatus("Confirming withdrawal on-chain...");
          await publicClient.waitForTransactionReceipt({ hash: withdrawHash });
        }

        setWithdrawAmount("");
      },
      "Successfully withdrawn!",
    );
  };

  const handleClaim = () =>
    runTransaction(
      "Claiming rewards...",
      async () => {
        // Optimistically set rewards to 0 immediately so UI updates without waiting
        setOptimisticEarned(0n);
        setRealtimeEarned(0n);

        const claimHash = await writeContractAsync({
          address: STAKING_ADDRESS,
          abi: STAKING_ABI,
          functionName: "claimReward",
        });

        if (publicClient) {
          setTxStatus("Confirming claim on-chain...");
          await publicClient.waitForTransactionReceipt({ hash: claimHash });
        }
      },
      "Successfully claimed rewards!",
    );

  // Return real-time earned value once data is available
  const effectiveEarned =
    earned.data === undefined && optimisticEarned === null ? undefined : realtimeEarned;

  return {
    isConnected,
    tokenBalance: token.data,
    stakedBalance: staked.data,
    earnedRewards: effectiveEarned,
    stakeAmount,
    withdrawAmount,
    loading,
    txStatus,
    refreshTrigger,
    setStakeAmount,
    setWithdrawAmount,
    setTxStatus,
    handleStake,
    handleWithdraw,
    handleClaim,
  };
}
