'use client'

import { useAccount } from "wagmi";
import { useIsRegistered } from "@/hooks/useVaultFactory";
import RegisterForm from "@/components/RegisterForm";
import Link from "next/link";

export default function Home() {
  const { isConnected } = useAccount();
  const { data: isRegistered } = useIsRegistered();

  return (
    <main className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto pt-32 p-6 min-h-screen">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />

      {!isConnected ? (
        <div className="text-center py-20">
          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
            Yield-Native <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              Liquidity Hooks
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-6 max-w-2xl mx-auto">
            Welcome to the future of capital efficiency on Base. ForgeX stacks ERC-4626 vault yield with Uniswap v4 swap fees — powered by AI-driven strategy optimization.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400">
              <span className="text-primary font-bold">ERC-4626</span> Vaults
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400">
              <span className="text-secondary font-bold">Uniswap v4</span> Hooks
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400">
              <span className="text-accent font-bold">AI-Powered</span> Analytics
            </div>
          </div>
          <appkit-button />
        </div>
      ) : !isRegistered ? (
        <RegisterForm />
      ) : (
        <div className="text-center py-20">
          <h1 className="text-5xl font-black tracking-tighter mb-6">Welcome Back</h1>
          <p className="text-gray-400 mb-8">Manage your vaults and explore AI-powered yield strategies.</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-primary text-white rounded-2xl font-black hover:shadow-[0_0_20px_rgba(255,0,122,0.4)] transition-all"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/vaults"
              className="px-8 py-4 bg-secondary/20 border border-secondary/30 text-secondary rounded-2xl font-black hover:bg-secondary/30 transition-all"
            >
              View Vaults
            </Link>
          </div>
        </div>
      )}

      <footer className="mt-20 p-8 text-center text-gray-600 text-xs font-bold tracking-widest uppercase">
        &copy; 2026 ForgeX Protocol &bull; Vult Systems &bull; Built on Base
      </footer>
    </main>
  );
}
