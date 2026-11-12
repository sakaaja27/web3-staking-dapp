"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { getAddress, parseEther, formatEther } from "viem";
import { STAKING_TOKEN_ABI, STAKING_ABI } from "./abi";

const stakingTokenAddress = process.env.NEXT_PUBLIC_STAKING_TOKEN_ADDRESS;
const stakingAddress = process.env.NEXT_PUBLIC_STAKING_ADDRESS;

if (!stakingTokenAddress || !stakingAddress) {
  throw new Error(
    "Missing NEXT_PUBLIC_STAKING_TOKEN_ADDRESS or NEXT_PUBLIC_STAKING_ADDRESS",
  );
}

const STAKING_TOKEN_ADDRESS = getAddress(stakingTokenAddress);
const STAKING_ADDRESS = getAddress(stakingAddress);

export default function Home() {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: STAKING_TOKEN_ADDRESS,
    abi: STAKING_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: stakedBalance, refetch: refetchStakedBalance } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: earnedRewards, refetch: refetchEarned } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "earned",
    args: address ? [address] : undefined,
  });

  const { writeContractAsync } = useWriteContract();

  const handleApproveAndStake = async () => {
    if (!stakeAmount || isNaN(Number(stakeAmount))) return;
    try {
      setLoading(true);
      setTxStatus("Approving STK tokens...");
      const parsed = parseEther(stakeAmount);
      await writeContractAsync({
        address: STAKING_TOKEN_ADDRESS,
        abi: STAKING_TOKEN_ABI,
        functionName: "approve",
        args: [STAKING_ADDRESS, parsed],
      });

      setTxStatus("Staking STK tokens...");
      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "stake",
        args: [parsed],
      });

      setStakeAmount("");
      setTxStatus("Successfully staked!");
      refetchTokenBalance();
      refetchStakedBalance();
    } catch (err: any) {
      console.error(err);
      setTxStatus("Transaction failed: " + (err?.shortMessage || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) return;
    try {
      setLoading(true);
      setTxStatus("Withdrawing staked tokens...");
      const parsed = parseEther(withdrawAmount);
      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "withdraw",
        args: [parsed],
      });
      setWithdrawAmount("");
      setTxStatus("Successfully withdrawn!");
      refetchTokenBalance();
      refetchStakedBalance();
    } catch (err: any) {
      console.error(err);
      setTxStatus("Transaction failed: " + (err?.shortMessage || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      setLoading(true);
      setTxStatus("Claiming rewards...");
      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "claimReward",
      });
      setTxStatus("Successfully claimed rewards!");
      refetchEarned();
      refetchTokenBalance();
    } catch (err: any) {
      console.error(err);
      setTxStatus("Transaction failed: " + (err?.shortMessage || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-xl">
              ⟠
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">STAKE<span className="text-indigo-400">FI</span></span>
              <span className="block text-xs text-slate-400 font-medium">Decentralized Staking Protocol</span>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero / Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        {!isConnected ? (
          <div className="max-w-md mx-auto text-center py-20 px-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-bold">
              🔒
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Connect your Ethereum wallet using RainbowKit to access high-yield staking pools and manage your rewards.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Status notification banner if active */}
            {txStatus && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 text-sm flex items-center justify-between animate-pulse">
                <span>{txStatus}</span>
                <button onClick={() => setTxStatus("")} className="text-xs text-indigo-400 hover:text-white">Dismiss</button>
              </div>
            )}

            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">Wallet Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {tokenBalance ? Number(formatEther(tokenBalance)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"}
                  </span>
                  <span className="text-sm font-bold text-indigo-400">STK</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-violet-500/5 rounded-full blur-xl pointer-events-none"></div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">Staked Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {stakedBalance ? Number(formatEther(stakedBalance)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"}
                  </span>
                  <span className="text-sm font-bold text-violet-400">STK</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">Earned Rewards</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-emerald-400">
                      {earnedRewards ? Number(formatEther(earnedRewards)).toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0.00"}
                    </span>
                    <span className="text-sm font-bold text-emerald-500">STK</span>
                  </div>
                </div>
                <button
                  disabled={loading || !earnedRewards || earnedRewards === BigInt(0)}
                  onClick={handleClaimReward}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-lg shadow-emerald-900/20 text-sm cursor-pointer"
                >
                  Claim Rewards
                </button>
              </div>
            </div>

            {/* Action Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stake Panel */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Stake Tokens</h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">Pool #1</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <label className="text-xs text-slate-400 font-medium">Amount to Stake</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition text-lg font-medium pr-16"
                      />
                      <button
                        onClick={() => tokenBalance && setStakeAmount(formatEther(tokenBalance))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 bg-indigo-500/10 rounded-lg"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  disabled={loading || !stakeAmount || Number(stakeAmount) <= 0}
                  onClick={handleApproveAndStake}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  {loading ? "Processing..." : "Approve & Stake"}
                </button>
              </div>

              {/* Withdraw Panel */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Unstake Tokens</h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">Instant</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <label className="text-xs text-slate-400 font-medium">Amount to Withdraw</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition text-lg font-medium pr-16"
                      />
                      <button
                        onClick={() => stakedBalance && setWithdrawAmount(formatEther(stakedBalance))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400 hover:text-violet-300 px-2 py-1 bg-violet-500/10 rounded-lg"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  disabled={loading || !withdrawAmount || Number(withdrawAmount) <= 0}
                  onClick={handleWithdraw}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition cursor-pointer border border-slate-700/50"
                >
                  {loading ? "Processing..." : "Withdraw Staked"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>StakeFi Protocol &copy; 2026 &bull; Secure Smart Contract Staking</p>
      </footer>
    </div>
  );
}
