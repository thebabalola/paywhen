"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useIsRegistered } from "@/hooks/useVaultFactory";

export default function Navbar() {
  const { isConnected } = useAccount();
  const { data: isRegistered } = useIsRegistered();

  return (
    <header className="fixed top-0 left-0 right-0 p-4 px-6 flex justify-between items-center max-w-7xl mx-auto w-full z-50 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="text-2xl font-black text-primary flex items-center gap-2 tracking-tighter">
        <div className="w-8 h-8 bg-primary rounded-md shadow-[0_0_15px_rgba(255,0,122,0.4)]" />
        FORGEX <span className="text-secondary">:</span> VULT
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        {isConnected && isRegistered && (
          <>
            <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/vaults" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
              Vaults
            </Link>
          </>
        )}
      </nav>

      <div className="flex gap-4 items-center">
        <appkit-button />
      </div>
    </header>
  );
}
