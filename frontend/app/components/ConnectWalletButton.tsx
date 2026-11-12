"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { ReactNode } from "react";

type ConnectWalletButtonProps = {
  className?: string;
  children?: ReactNode;
};

export function ConnectWalletButton({
  className = "px-5 py-2 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 transition-all rounded-full shadow-lg hover:shadow-white/20 active:scale-95 cursor-pointer",
  children,
}: ConnectWalletButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && !chain.unsupported;

        if (!ready) {
          return null;
        }

        if (!connected) {
          return (
            <button type="button" onClick={openConnectModal} className={className}>
              {children ?? "Connect Wallet"}
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={`${className} bg-amber-300 hover:bg-amber-200`}
            >
              Wrong network
            </button>
          );
        }

        return (
          <button type="button" onClick={openAccountModal} className={className}>
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
