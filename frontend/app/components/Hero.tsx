import { ConnectWalletButton } from "./ConnectWalletButton";
import { ArrowIcon, CursorIcon } from "./icons";

export function Hero() {
  return (
    <main id="home" className="relative z-10 pt-10 sm:pt-14 pb-12 flex-1 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full text-center relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          <span className="text-xs font-medium text-zinc-300">🔒 Testnet Live — Start Staking</span>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden lg:flex items-center gap-2 absolute -left-12 top-6 animate-float-slow">
            <div className="bg-teal-500/20 backdrop-blur-md border border-teal-400/40 text-teal-300 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>✓ Staked 500 STK</span>
              <CursorIcon className="text-teal-400" />
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 absolute -right-8 bottom-6 animate-float-alt">
            <div className="bg-pink-500/20 backdrop-blur-md border border-pink-400/40 text-pink-300 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <CursorIcon className="text-pink-400 -scale-x-100" />
              <span>✓ Claimed 12.3 STK</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-5">
            Stake Your Tokens
            <br />
            <span className="font-serif italic font-normal text-slate-100 tracking-normal text-5xl sm:text-7xl md:text-8xl">
              Earn Real Rewards
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
            Stake STK tokens on Sepolia testnet and earn rewards over time —
            simple, transparent, fully on-chain.
          </p>
        </div>

        <div className="hidden md:block absolute left-8 top-1/2 -translate-y-10 pointer-events-none opacity-80 animate-float-slow">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/40 to-indigo-400/30 border border-purple-400/30 backdrop-blur-md flex items-center justify-center -rotate-12 shadow-2xl">
            <span className="text-2xl">📢</span>
          </div>
        </div>
        <div className="hidden md:block absolute right-12 top-1/2 -translate-y-16 pointer-events-none opacity-80 animate-float-alt">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-bl from-teal-500/40 to-blue-500/30 border border-teal-400/30 backdrop-blur-md flex items-center justify-center rotate-12 shadow-2xl">
            <span className="text-2xl">🖥️</span>
          </div>
        </div>
      </div>

      <WalletDeck />
    </main>
  );
}

function WalletDeck() {
  const cards = [
    ["MetaMask", "Browser & Mobile", "🦊", "Most Popular", "Sepolia Network", "Instant Connect", "from-[#6c5dd3] to-[#483ba5]", "-12deg"],
    ["WalletConnect", "QR & Mobile App", "📱", "Scan to Connect", "Any Protocol", "End-to-End Safe", "from-[#f26a6a] to-[#d44848]", "-6deg"],
    ["Rainbow", "Ethereum & L2", "🌈", "Mobile Friendly", "Fast Gas", "Zero Slippage", "from-[#55cb63] to-[#399f45]", "6deg"],
    ["Trust Wallet", "Multi-chain Staking", "💎", "Multi-chain Support", "Sepolia Ready", "Multi-Asset", "from-[#3b6fe8] to-[#254ab8]", "12deg"],
  ];

  return (
    <div className="w-full mt-10 sm:mt-14 pt-4 px-2 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto deck-container">
        <div className="flex items-end justify-center -space-x-10 sm:-space-x-14 md:-space-x-16 pt-6 pb-2 min-h-[360px] sm:min-h-[420px]">
          {cards.slice(0, 2).map((card, index) => <WalletCard key={card[0]} data={card} index={index} />)}
          <article className="deck-card w-[215px] sm:w-[255px] md:w-[285px] h-[330px] sm:h-[395px] md:h-[430px] rounded-3xl p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-[#0db8a6] via-[#10b1a0] to-[#0a8679] border-2 border-white/40 shadow-glow-cyan text-white z-40">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none block">Coinbase Wallet</span>
                <p className="text-xs text-white/80 font-medium mt-1">Smart Wallet &amp; Extension</p>
              </div>
              <span className="bg-white/25 border border-white/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Recommended</span>
            </div>
            <div className="my-auto py-2 flex flex-col items-center">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-2xl">
                <span className="text-5xl sm:text-6xl">🛡️</span>
              </div>
              <ConnectWalletButton
                className="inline-flex items-center gap-1.5 bg-white text-zinc-950 text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-zinc-100 transition-colors cursor-pointer mt-3"
                children={<><span>Connect Wallet</span><ArrowIcon /></>}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-white/20">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />Active Pool</span>
              <span className="text-white bg-black/20 px-2 py-0.5 rounded-md">12.5% APR</span>
            </div>
          </article>
          {cards.slice(2).map((card, index) => <WalletCard key={card[0]} data={card} index={index + 3} />)}
        </div>
      </div>
    </div>
  );
}

function WalletCard({ data, index }: { data: string[]; index: number }) {
  const [name, subtitle, emoji, badge, left, right, gradient, rotation] = data;
  const widths = ["w-[185px] sm:w-[220px] md:w-[245px]", "w-[195px] sm:w-[230px] md:w-[260px]"];
  const heights = ["h-[280px] sm:h-[340px] md:h-[370px]", "h-[300px] sm:h-[360px] md:h-[390px]"];
  return (
    <article
      className={`deck-card ${widths[index === 0 || index === 3 ? 0 : 1]} ${heights[index === 0 || index === 3 ? 0 : 1]} rounded-3xl p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-b ${gradient} border border-white/20 shadow-xl text-white z-10`}
      style={{ transform: `rotate(${rotation}) translateY(-2px)` }}
    >
      <div><div className="flex items-center justify-between"><span className="font-bold text-lg sm:text-xl tracking-tight leading-none">{name}</span><span className="text-[11px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded-full">#{String(index + 1).padStart(2, "0")}</span></div><p className="text-[11px] text-white/70 mt-1">{subtitle}</p></div>
      <div className="relative py-4 flex flex-col items-center justify-center"><div className="w-24 h-20 sm:w-28 sm:h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"><span className="text-4xl">{emoji}</span></div><div className="mt-3 px-2.5 py-1 rounded-full bg-black/25 text-[10px] font-medium text-white/90">{badge}</div></div>
      <div className="flex items-center justify-between text-[11px] text-white/60 font-medium"><span>{left}</span><span>{right}</span></div>
    </article>
  );
}
