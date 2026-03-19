'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useUserVaults, useIsRegistered } from "@/hooks/useVaultFactory";
import VaultCard from "@/components/VaultCard";
import CreateVaultModal from "@/components/CreateVaultModal";
import AIInsights from "@/components/AIInsights";
import Link from "next/link";
import Image from "next/image";
import { Layers, Network, Cpu, Wallet, Plus, TrendingUp } from "lucide-react";

import type { Variants } from "framer-motion";
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: isRegistered } = useIsRegistered();
  const { data: userVaults, refetch: refetchVaults } = useUserVaults();
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* ── Not connected ── */
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20 px-6 gap-5 text-center">
        <Image src="/logo.svg" alt="ForgeX" width={48} height={48} />
        <h2 style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }} className="text-3xl font-black">
          Connect your wallet
        </h2>
        <p style={{ color: "var(--foreground-muted)" }}>Connect to access your vault dashboard.</p>
        <appkit-button />
      </div>
    );
  }

  /* ── Not registered ── */
  if (!isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-20 px-6 gap-5 text-center">
        <Image src="/logo.svg" alt="ForgeX" width={48} height={48} />
        <h2 style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }} className="text-3xl font-black">
          Not registered
        </h2>
        <p style={{ color: "var(--foreground-muted)" }}>You need to register before accessing the dashboard.</p>
        <Link href="/" className="btn btn-primary">Go to Registration</Link>
      </div>
    );
  }

  const vaultCount = userVaults?.length ?? 0;

  const STATS = [
    { label: "Total Vaults",  value: String(vaultCount),                icon: Layers,   color: "var(--primary)" },
    { label: "Network",       value: "Base",                            icon: Network,  color: "var(--primary)" },
    { label: "Protocol",      value: "Vult",                            icon: TrendingUp, color: "var(--accent)" },
    { label: "Wallet",        value: address ? `${address.slice(0,6)}…${address.slice(-4)}` : "—",
                                                                        icon: Wallet,   color: "var(--foreground-muted)" },
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-5 py-8">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <span className="label block mb-2">Portfolio Overview</span>
            <h1 style={{ color: "var(--foreground)", letterSpacing: "-0.04em" }} className="text-5xl font-black">
              Dashboard
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={15} /> New Vault
          </button>
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <motion.div
              key={label}
              variants={item}
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              className="rounded-2xl p-5 flex items-center gap-4"
            >
              <div
                style={{ background: "var(--primary-muted)", borderRadius: 10 }}
                className="w-9 h-9 shrink-0 flex items-center justify-center"
              >
                <Icon size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div className="min-w-0">
                <p className="label mb-1">{label}</p>
                <p
                  style={{ color, fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" }}
                  className="truncate font-mono"
                >
                  {value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Vaults column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{ color: "var(--foreground)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}
              >
                Your Vaults
              </h2>
              <span className="pill pill-primary">{vaultCount} active</span>
            </div>

            {vaultCount > 0 ? (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {userVaults!.map((vault: string, index: number) => (
                  <motion.div key={vault} variants={item}>
                    <VaultCard vaultAddress={vault as `0x${string}`} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ border: "2px dashed var(--border)", borderRadius: 20 }}
                className="py-20 flex flex-col items-center justify-center text-center gap-4"
              >
                <div
                  style={{ background: "var(--primary-muted)", borderRadius: 14 }}
                  className="w-12 h-12 flex items-center justify-center"
                >
                  <Layers size={22} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <p style={{ color: "var(--foreground-muted)", fontWeight: 700, marginBottom: 6 }}>
                    No vaults yet
                  </p>
                  <p style={{ color: "var(--foreground-dim)", fontSize: 13 }}>
                    Create your first vault to start stacking yield.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary flex items-center gap-2 mt-2"
                >
                  <Plus size={14} /> Create Vault
                </button>
              </motion.div>
            )}
          </div>

          {/* AI panel */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 style={{ color: "var(--foreground)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
                AI Analysis
              </h2>
              <span
                style={{ background: "rgba(200,191,162,0.08)", color: "var(--accent)", border: "1px solid rgba(200,191,162,0.15)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}
              >
                <Cpu size={9} className="inline mr-1" />
                LIVE
              </span>
            </div>
            <AIInsights />
          </div>
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
