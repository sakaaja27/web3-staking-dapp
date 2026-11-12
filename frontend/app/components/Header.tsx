import { ConnectWalletButton } from "./ConnectWalletButton";
import { StarburstIcon } from "./icons";

export function Header({ isConnected }: { isConnected: boolean }) {
  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/15 backdrop-blur-md group-hover:scale-105 transition-transform">
            <StarburstIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
            BrmDapp
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1 bg-[#1a1b21]/80 border border-white/10 backdrop-blur-xl px-2 py-1.5 rounded-full shadow-2xl">
          <a href="#home" className="px-4 py-1.5 text-xs font-semibold text-white bg-white/10 rounded-full">
            Home
          </a>
          <a href="#how-it-works" className="px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#staking" className="px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
            Staking
          </a>
          <a href="#faq" className="px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!isConnected && (
            <span className="hidden sm:inline-block text-xs font-medium text-zinc-400">
              Login
            </span>
          )}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
