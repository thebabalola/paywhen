'use client'

import { useState } from "react";
import { useAccount } from "wagmi";
import { useUserVaults, useIsRegistered } from "@/hooks/useVaultFactory";
import VaultCard from "@/components/VaultCard";
import CreateVaultModal from "@/components/CreateVaultModal";
import AIInsights from "@/components/AIInsights";
import Link from "next/link";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: isRegistered } = useIsRegistered();
  const { data: userVaults, refetch: refetchVaults } = useUserVaults();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-32 p-6">
        <h2 className="text-3xl font-black mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Please connect your wallet to access the dashboard.</p>
        <appkit-button />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-32 p-6">
        <h2 className="text-3xl font-black mb-4">Not Registered</h2>
        <p className="text-gray-400 mb-6">You need to register before accessing the dashboard.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
          Go to Registration
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="text-accent text-xs font-bold tracking-widest uppercase mb-2">Portfolio Overview</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Dashboard</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-secondary text-white rounded-2xl font-black hover:shadow-[0_0_20px_rgba(14,167,203,0.4)] transition-all"
        >
          + New Vault
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-gray-500 text-xs font-bold uppercase">Total Vaults</div>
          <div className="text-2xl font-black text-white">{userVaults?.length ?? 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-gray-500 text-xs font-bold uppercase">Network</div>
          <div className="text-2xl font-black text-primary">Base</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-gray-500 text-xs font-bold uppercase">Protocol</div>
          <div className="text-2xl font-black text-secondary">Vult</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-gray-500 text-xs font-bold uppercase">Wallet</div>
          <div className="text-sm font-mono text-gray-300 truncate">{address?.slice(0, 8)}...{address?.slice(-6)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vaults grid */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-black mb-4">Your Vaults</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userVaults && userVaults.length > 0 ? (
              userVaults.map((vault: string, index: number) => (
                <VaultCard
                  key={vault}
                  vaultAddress={vault as `0x${string}`}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center rounded-3xl border-2 border-dashed border-white/5">
                <div className="text-gray-500 font-bold mb-4">No vaults yet.</div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-primary font-black uppercase tracking-tighter hover:underline"
                >
                  Create your first vault &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights panel */}
        <div>
          <h2 className="text-xl font-black mb-4">AI Analysis</h2>
          <AIInsights />
        </div>
      </div>

      <CreateVaultModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => refetchVaults()}
      />
    </div>
  );
}
