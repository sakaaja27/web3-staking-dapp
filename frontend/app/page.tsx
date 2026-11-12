"use client";

import { useStaking } from "./hooks/useStaking";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import {
  FaqSection,
  HowItWorks,
  SiteFooter,
  SiteBackground,
  StakingDashboard,
  StatsBar,
} from "./components/SiteSections";

export default function Home() {
  const staking = useStaking();

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <SiteBackground />
      <Header isConnected={staking.isConnected} />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <StakingDashboard {...staking} />
      <FaqSection />
      <SiteFooter />
    </div>
  );
}
