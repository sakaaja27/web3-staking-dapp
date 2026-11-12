import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "BrmDapp — Stake Tokens & Earn Real Rewards",
  description:
    "Stake STK tokens on Sepolia testnet and earn rewards over time — simple, transparent, fully on-chain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${instrumentSerif.variable} scroll-smooth h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0c0f] text-slate-100 font-sans overflow-x-hidden selection:bg-teal-400 selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
