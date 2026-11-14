"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";
import { formatEther, getAddress, parseAbiItem, type AbiEvent } from "viem";
import { STAKING_ABI } from "../abi";

const stakingAddress = process.env.NEXT_PUBLIC_STAKING_ADDRESS;
const STAKING_ADDRESS = stakingAddress ? getAddress(stakingAddress) : undefined;

// Staking contract was deployed at block 12,117,243 on Sepolia
const SEPOLIA_DEPLOYMENT_BLOCK = 12117240n;

export type TransactionType = "Stake" | "Unstake" | "Claim Reward";

export interface StakingTransaction {
  id: string;
  type: TransactionType;
  amount: bigint;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
  logIndex: number;
  timestamp?: number; // In unix seconds
}

function formatStkAmount(amount: bigint): string {
  const val = Number(formatEther(amount));
  if (val === 0) return "0 STK";
  return `${val.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })} STK`;
}

function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return "—";
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - timestamp);

  if (diff < 20) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface TransactionHistoryProps {
  refreshTrigger?: number;
}

export function TransactionHistory({ refreshTrigger }: TransactionHistoryProps) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [transactions, setTransactions] = useState<StakingTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache block timestamps across refreshes to avoid duplicate RPC calls
  const blockTimestampCache = useRef<Map<string, number>>(new Map());

  const fetchHistory = useCallback(async () => {
    if (!publicClient || !address || !STAKING_ADDRESS) {
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determine starting block (safely handling local chains & Sepolia)
      let fromBlock = SEPOLIA_DEPLOYMENT_BLOCK;
      let currentBlock = 0n;
      try {
        currentBlock = await publicClient.getBlockNumber();
        if (currentBlock < SEPOLIA_DEPLOYMENT_BLOCK) {
          fromBlock = 0n; // Local Hardhat chain
        }
      } catch {
        fromBlock = 0n;
      }

      // Helper to fetch logs with fallback if block range is too wide
      const queryLogs = async (eventAbi: string) => {
        const parsedEvent = parseAbiItem(eventAbi) as AbiEvent;
        try {
          return await publicClient.getLogs({
            address: STAKING_ADDRESS,
            event: parsedEvent,
            args: { user: address },
            fromBlock,
            toBlock: "latest",
          });
        } catch (initialErr) {
          console.warn(`Querying full range failed for event, attempting fallback range:`, initialErr);
          // If the RPC rejects a wide range, fall back to recent 25,000 blocks
          const fallbackStart = currentBlock > 25000n ? currentBlock - 25000n : 0n;
          return await publicClient.getLogs({
            address: STAKING_ADDRESS,
            event: parsedEvent,
            args: { user: address },
            fromBlock: fallbackStart,
            toBlock: "latest",
          });
        }
      };

      // Query all 3 events
      const [stakedLogs, withdrawnLogs, rewardLogs] = await Promise.all([
        queryLogs("event Staked(address indexed user, uint256 amount)"),
        queryLogs("event Withdrawn(address indexed user, uint256 amount)"),
        queryLogs("event RewardPaid(address indexed user, uint256 reward)"),
      ]);

      const items: StakingTransaction[] = [
        ...stakedLogs.map((log) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: "Stake" as const,
          amount: (log.args as { amount?: bigint }).amount ?? 0n,
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
        })),
        ...withdrawnLogs.map((log) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: "Unstake" as const,
          amount: (log.args as { amount?: bigint }).amount ?? 0n,
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
        })),
        ...rewardLogs.map((log) => ({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: "Claim Reward" as const,
          amount: (log.args as { reward?: bigint }).reward ?? 0n,
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
        })),
      ];

      // Sort by most recent first (block number descending, then log index descending)
      items.sort((a, b) => {
        if (b.blockNumber !== a.blockNumber) {
          return b.blockNumber > a.blockNumber ? 1 : -1;
        }
        return b.logIndex - a.logIndex;
      });

      // Fetch block timestamps for unique blocks
      const uniqueBlocks = Array.from(new Set(items.map((i) => i.blockNumber)));
      const missingBlocks = uniqueBlocks.filter(
        (b) => !blockTimestampCache.current.has(b.toString()),
      );

      if (missingBlocks.length > 0) {
        await Promise.all(
          missingBlocks.map(async (blockNum) => {
            try {
              const block = await publicClient.getBlock({ blockNumber: blockNum });
              blockTimestampCache.current.set(blockNum.toString(), Number(block.timestamp));
            } catch (blockErr) {
              console.warn("Could not fetch block timestamp for", blockNum, blockErr);
            }
          }),
        );
      }

      const enriched = items.map((item) => ({
        ...item,
        timestamp: blockTimestampCache.current.get(item.blockNumber.toString()),
      }));

      setTransactions(enriched);
    } catch (err: unknown) {
      console.error("Failed to load transaction history:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      if (rawMsg.includes("Failed to fetch") || rawMsg.includes("HTTP request failed")) {
        setError("Network connection to Sepolia RPC timed out. Please click Refresh to retry.");
      } else {
        setError(rawMsg.slice(0, 150));
      }
    } finally {
      setLoading(false);
    }
  }, [publicClient, address]);

  // Initial fetch and fetch when address or refreshTrigger changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  // Real-time event watchers for auto-refresh when new events are emitted
  useWatchContractEvent({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    eventName: "Staked",
    onLogs: (logs) => {
      const match = logs.some(
        (l) => (l.args as { user?: string })?.user?.toLowerCase() === address?.toLowerCase(),
      );
      if (match) fetchHistory();
    },
  });

  useWatchContractEvent({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    eventName: "Withdrawn",
    onLogs: (logs) => {
      const match = logs.some(
        (l) => (l.args as { user?: string })?.user?.toLowerCase() === address?.toLowerCase(),
      );
      if (match) fetchHistory();
    },
  });

  useWatchContractEvent({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    eventName: "RewardPaid",
    onLogs: (logs) => {
      const match = logs.some(
        (l) => (l.args as { user?: string })?.user?.toLowerCase() === address?.toLowerCase(),
      );
      if (match) fetchHistory();
    },
  });

  const explorerUrl =
    publicClient?.chain?.blockExplorers?.default?.url || "https://sepolia.etherscan.io";

  return (
    <div className="bg-[#14161b]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 text-lg shadow-sm">
            📜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Transaction History
              </h3>
              {isConnected && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-semibold border border-white/10">
                  {transactions.length}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Past stake, unstake, and reward events for your wallet
            </p>
          </div>
        </div>

        {isConnected && (
          <button
            onClick={() => fetchHistory()}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
            title="Refresh transaction history"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-400" : "text-zinc-400"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        )}
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchHistory()}
            className="text-xs text-rose-300 hover:text-white underline font-semibold cursor-pointer ml-3 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* State rendering */}
      {!isConnected ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-2xl mb-3 text-zinc-500">
            🔒
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">Wallet Not Connected</h4>
          <p className="text-xs text-zinc-500 max-w-sm">
            Connect your wallet to view your personal staking and reward transaction history.
          </p>
        </div>
      ) : loading && transactions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 border-2 border-teal-400/20 border-t-teal-400 rounded-full animate-spin mb-3" />
          <p className="text-xs text-zinc-400">Fetching on-chain transaction history from Sepolia...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-2xl mb-3 text-zinc-500">
            📭
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">No transactions yet</h4>
          <p className="text-xs text-zinc-500 max-w-sm">
            You haven't performed any staking, unstaking, or reward claims yet with this wallet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Transaction Hash</th>
                <th className="py-3 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {transactions.map((tx) => {
                const isStake = tx.type === "Stake";
                const isUnstake = tx.type === "Unstake";
                const isReward = tx.type === "Claim Reward";

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Column 1: Type badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {isStake && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-brand-accent-teal border border-teal-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                          Stake
                        </span>
                      )}
                      {isUnstake && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-brand-accent-purple border border-purple-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          Unstake
                        </span>
                      )}
                      {isReward && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-brand-accent-green border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Claim Reward
                        </span>
                      )}
                    </td>

                    {/* Column 2: Amount */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-white">
                        {formatStkAmount(tx.amount)}
                      </span>
                    </td>

                    {/* Column 3: Transaction Hash */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <a
                        href={`${explorerUrl}/tx/${tx.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-zinc-400 group-hover:text-teal-300 hover:underline transition-colors inline-flex items-center gap-1.5"
                        title="View transaction on block explorer"
                      >
                        <span>
                          {tx.transactionHash.slice(0, 6)}...{tx.transactionHash.slice(-4)}
                        </span>
                        <svg
                          className="w-3 h-3 text-zinc-500 group-hover:text-teal-300 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </td>

                    {/* Column 4: Timestamp */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-right">
                      <span
                        className="text-xs text-zinc-400"
                        title={tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : undefined}
                      >
                        {formatRelativeTime(tx.timestamp)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
