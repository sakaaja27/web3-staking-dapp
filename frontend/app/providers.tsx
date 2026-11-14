'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http, fallback } from 'wagmi';
import {
  sepolia,
  hardhat,
  mainnet,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// Reliable public Sepolia RPCs (bypasses thirdweb endpoints that require client IDs or fail CORS)
const customSepoliaRpc = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
const sepoliaEndpoints = [
  customSepoliaRpc,
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://rpc.sepolia.org',
  'https://sepolia.drpc.org',
  'https://1rpc.io/sepolia',
  'https://rpc2.sepolia.org',
].filter(Boolean) as string[];

const config = getDefaultConfig({
  appName: 'Web3 Staking dApp',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64',
  chains: [sepolia, hardhat, mainnet],
  transports: {
    [sepolia.id]: fallback(
      sepoliaEndpoints.map((url) =>
        http(url, {
          timeout: 10_000,
          retryCount: 2,
        })
      )
    ),
    [hardhat.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
