'use client'

import { useState } from "react";
import { useAccount } from "wagmi";
import { useUserVaults, useIsRegistered } from "@/hooks/useVaultFactory";
import VaultCard from "@/components/VaultCard";
import CreateVaultModal from "@/components/CreateVaultModal";
import Link from "next/link";

export default function VaultsPage() {
  const { isConnected } = useAccount();
  const { data: isRegistered } = useIsRegistered();
  const { data: userVaults, refetch: refetchVaults } = useUserVaults();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-32 p-6">
        <h2 className="text-3xl font-black mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Please connect your wallet to view vaults.</p>
        <appkit-button />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-32 p-6">
        <h2 className="text-3xl font-black mb-4">Not Registered</h2>
        <p className="text-gray-400 mb-6">Register to start creating vaults.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
          Go to Registration
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="text-accent text-xs font-bold tracking-widest uppercase mb-2">Vault Management</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Your Vaults</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-primary text-white rounded-2xl font-black hover:shadow-[0_0_20px_rgba(255,0,122,0.4)] transition-all"
        >
          + Create Vault
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userVaults && userVaults.length > 0 ? (
          userVaults.map((vault: string, index: number) => (
            <VaultCard
              key={vault}
              vaultAddress={vault as `0x${string}`}
              index={index}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-white/5">
            <div className="text-gray-500 font-bold mb-4 text-lg">No vaults created yet.</div>
            <p className="text-gray-600 mb-6">Create your first ERC-4626 vault to start earning yield.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-black hover:shadow-[0_0_20px_rgba(255,0,122,0.4)] transition-all"
            >
              Create Your First Vault
            </button>
          </div>
        )}
      </div>

      <CreateVaultModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => refetchVaults()}
      />
    </div>
  );
}
