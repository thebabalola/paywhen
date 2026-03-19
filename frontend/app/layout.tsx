import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/context/Web3Provider";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { template: "%s | ForgeX: Vult", default: "ForgeX: Vult — Yield-Native Liquidity Hooks on Base" },
  description:
    "ForgeX stacks ERC-4626 vault yield with Uniswap v4 swap fees into a single AI-driven strategy on Base. Stack more. Earn more.",
  keywords: ["ForgeX", "Vult", "ERC-4626", "Uniswap v4", "yield hooks", "Base", "DeFi", "AI vault"],
  authors: [{ name: "ForgeX Protocol" }],
  creator: "ForgeX Protocol",
  openGraph: {
    type: "website",
    title: "ForgeX: Vult — Yield-Native Liquidity Hooks",
    description: "Stack ERC-4626 vault yield with Uniswap v4 swap fees. AI-driven strategy optimization on Base.",
    siteName: "ForgeX: Vult",
    images: [{ url: "/logo.svg", width: 44, height: 44, alt: "ForgeX Logo" }],
  },
  twitter: {
    card: "summary",
    title: "ForgeX: Vult",
    description: "Yield-Native Liquidity Hooks on Base. ERC-4626 + Uniswap v4 + AI.",
    images: ["/logo.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo.svg",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#090A06" }],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Web3Provider>
          <ClientLayout>{children}</ClientLayout>
        </Web3Provider>
      </body>
    </html>
  );
}
