"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMiniPay } from "@/hooks/useMiniPay";

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { isMiniPay } = useMiniPay();

  return (
    <header
      style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", borderBottom: "1px solid var(--border)" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between gap-6">

        {/* Logo + Wordmark */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <img src="/paywhen.svg" alt="PayWhen Logo" className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span
            style={{ letterSpacing: "0.16em", lineHeight: 1 }}
            className="text-2xl font-black uppercase hidden sm:block"
          >
            <span className="text-primary">PAY</span>
            <span className="text-foreground-muted mx-1.5">WHEN</span>
          </span>
        </Link>

        {/* Right: wallet + theme */}
        <div className="flex items-center gap-4">
          {!isMiniPay && (
            <div className="scale-90 sm:scale-100">
              <appkit-button />
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
