import { useState } from "react";
import { formatEther } from "viem";
import { TransactionHistory } from "./TransactionHistory";

export function SiteBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-teal-500/10 via-purple-500/5 to-transparent blur-[120px] rounded-full" />
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[350px] bg-pink-500/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
      <div className="absolute inset-0 bg-grid-dots opacity-40" />
    </div>
  );
}

export function StatsBar() {
  return (
    <section className="relative z-10 border-t border-white/[0.07] bg-black/40 backdrop-blur-md py-6 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          ["Sepolia Testnet", "NETWORK"],
          ["Contract Verified", "BLOCKSCOUT + SOURCIFY"],
          ["Open Source", "MIT LICENSE"],
          ["0 Real-World Value", "TESTNET ONLY"],
        ].map(([title, label], index) => (
          <div className="px-3" key={title}>
            <p
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                index === 2 ? "text-brand-accent-teal" : "text-white"
              }`}
            >
              {title}
            </p>
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-medium text-zinc-400 tracking-wide">
          Demo Project Testnet Only
        </span>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const items = [
    ["01", "Connect Wallet", "Link a supported wallet to the Sepolia network.", "🔗", "teal"],
    ["02", "Stake STK Tokens", "Approve and stake any amount to start earning immediately.", "⚡", "purple"],
    ["03", "Earn & Claim", "Watch rewards grow and claim them whenever you want.", "🎉", "emerald"],
  ];
  return (
    <section id="how-it-works" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-5">
            <span className="text-xs font-medium text-zinc-400">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            How It <span className="font-serif italic font-normal">Works</span>
          </h2>
          <p className="text-zinc-400">Start earning rewards in three simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(([step, title, desc, emoji, color]) => (
            <div
              key={step}
              className={`relative bg-gradient-to-b from-${color}-500/20 to-${color}-500/5 border border-${color}-500/20 rounded-2xl p-7`}
            >
              <span className="text-5xl font-black text-white/[0.06] absolute top-4 right-5">{step}</span>
              <span className="text-3xl block mb-4">{emoji}</span>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type StakingProps = ReturnType<typeof import("../hooks/useStaking").useStaking>;

export function StakingDashboard(props: StakingProps) {
  const {
    tokenBalance,
    stakedBalance,
    earnedRewards,
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
  } = props;

  const value = (amount: bigint | undefined, digits = 4) =>
    amount
      ? Number(formatEther(amount)).toLocaleString(undefined, { maximumFractionDigits: digits })
      : "0.00";

  const formatEarned = (amount: bigint | undefined) => {
    if (!amount) return "0.000000";
    const num = Number(formatEther(amount));
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    });
  };

  const isEarning = Boolean(stakedBalance && stakedBalance > 0n);

  return (
    <section id="staking" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Staking <span className="font-serif italic font-normal">Dashboard</span>
          </h2>
          <p className="text-zinc-400 text-sm">Manage your stakes, rewards, and withdrawals</p>
        </div>

        {txStatus && (
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/40 text-teal-200 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>{txStatus}</span>
            </div>
            <button
              onClick={() => setTxStatus("")}
              className="text-xs text-teal-400 hover:text-white cursor-pointer ml-3 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Wallet Balance */}
          <div className="bg-[#14161b]/80 border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span>💳</span>
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Wallet Balance</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-brand-accent-teal">
                {value(tokenBalance, 4)}
              </span>
              <span className="text-sm font-bold text-brand-accent-teal">STK</span>
            </div>
          </div>

          {/* Card 2: Staked Balance */}
          <div className="bg-[#14161b]/80 border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span>🔐</span>
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Staked Balance</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-brand-accent-purple">
                {value(stakedBalance, 4)}
              </span>
              <span className="text-sm font-bold text-brand-accent-purple">STK</span>
            </div>
          </div>

          {/* Card 3: Earned Rewards (Real-time live ticker) */}
          <div className="bg-[#14161b]/80 border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span>🎁</span>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Earned Rewards</p>
                </div>
                {isEarning && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-brand-accent-green font-mono">
                  {formatEarned(earnedRewards)}
                </span>
                <span className="text-sm font-bold text-brand-accent-green">STK</span>
              </div>
            </div>

            <button
              disabled={loading || !earnedRewards || earnedRewards === 0n}
              onClick={handleClaim}
              className="mt-4 w-full bg-brand-accent-green/20 border border-brand-accent-green/30 disabled:text-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed text-brand-accent-green font-semibold py-2.5 rounded-xl text-sm cursor-pointer hover:bg-brand-accent-green/30 transition shadow-sm"
            >
              {loading ? "⏳ Processing..." : "✨ Claim Rewards"}
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ActionCard
            title="Stake Tokens"
            badge="Pool #1"
            amount={stakeAmount}
            setAmount={setStakeAmount}
            max={tokenBalance}
            onSubmit={handleStake}
            loading={loading}
            accent="teal"
            submit="Approve & Stake →"
          />
          <ActionCard
            title="Unstake Tokens"
            badge="Instant"
            amount={withdrawAmount}
            setAmount={setWithdrawAmount}
            max={stakedBalance}
            onSubmit={handleWithdraw}
            loading={loading}
            accent="purple"
            submit="Withdraw Staked →"
          />
        </div>

        {/* Transaction History Section */}
        <TransactionHistory refreshTrigger={refreshTrigger} />
      </div>
    </section>
  );
}

function ActionCard({
  title,
  badge,
  amount,
  setAmount,
  max,
  onSubmit,
  loading,
  accent,
  submit,
}: {
  title: string;
  badge: string;
  amount: string;
  setAmount: (value: string) => void;
  max?: bigint;
  onSubmit: () => void | Promise<void>;
  loading: boolean;
  accent: "teal" | "purple";
  submit: string;
}) {
  return (
    <div className="bg-[#14161b]/80 border border-white/[0.08] rounded-2xl p-7 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full bg-${accent}-500/10 text-${accent}-300 border border-${accent}-500/20 font-semibold uppercase`}
          >
            {badge}
          </span>
        </div>
        <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Amount</label>
        <div className="relative mt-2 mb-6">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full bg-[#0b0c0f] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500/50 text-lg pr-16"
          />
          <button
            onClick={() => max && setAmount(formatEther(max))}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-${accent}-300 px-2 py-1 bg-${accent}-500/10 rounded-lg cursor-pointer`}
          >
            MAX
          </button>
        </div>
      </div>
      <button
        disabled={loading || !amount || Number(amount) <= 0}
        onClick={onSubmit}
        className={`w-full bg-${accent}-500/90 hover:bg-${accent}-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold py-3 rounded-xl cursor-pointer transition`}
      >
        {loading ? "⏳ Processing..." : submit}
      </button>
    </div>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    ["What is BrmDapp?", "BrmDapp is a decentralized staking protocol on Sepolia testnet."],
    ["How do I start staking?", "Connect your wallet, approve the STK allowance, and enter an amount to stake."],
    ["Is this real money?", "No. STK tokens on this Sepolia demo have zero real-world value."],
    ["Can I unstake anytime?", "Yes, withdrawals are instant with no lock-up period."],
    ["How are rewards calculated?", "Rewards accrue per-block based on your share of the staked pool."],
  ];
  return (
    <section id="faq" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Frequently Asked <span className="font-serif italic font-normal">Questions</span>
          </h2>
          <p className="text-zinc-400">Everything you need to know about BrmDapp</p>
        </div>
        <div className="space-y-3">
          {items.map(([question, answer], index) => (
            <div key={question} className="bg-[#14161b]/60 border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-white">{question}</span>
                <span className={`text-zinc-400 text-xl ${open === index ? "rotate-45" : ""}`}>+</span>
              </button>
              {open === index && <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">{answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="text-sm font-bold tracking-tight text-white">✦ BrmDapp</span>
        <p className="text-xs text-zinc-500">Sepolia testnet demo · Open source · No real-world value</p>
        <span className="text-xs text-zinc-500">© 2026 BrmDapp</span>
      </div>
    </footer>
  );
}
