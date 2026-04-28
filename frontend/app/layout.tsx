import type { Metadata, Viewport } from "next";
import "./globals.css";
import Web3Provider from "@/context/Web3Provider";
import ClientLayout from "@/components/ClientLayout";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | PayWhen",
    default: "PayWhen — Conditional Payment Protocol",
  },
  description:
    "PayWhen is an intent-based payment protocol that allows users to define conditions under which funds are automatically executed on-chain.",
  keywords: [
    "PayWhen",
    "conditional payments",
    "escrow",
    "Celo",
    "DeFi",
    "smart contracts",
  ],
  authors: [{ name: "PayWhen Protocol" }],
  creator: "PayWhen Protocol",
  openGraph: {
    type: "website",
    title: "PayWhen — Conditional Payment Protocol",
    description:
      "Intent-based conditional payments with on-chain escrow and automatic execution.",
    siteName: "PayWhen",
    images: [
      { url: "/paywhen-banner.png", width: 1200, height: 630, alt: "PayWhen Banner" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PayWhen — Conditional Payments",
    description:
      "PayWhen: Define conditions, hold in escrow, automatic execution.",
    images: ["/paywhen-banner.png"],
  },
  icons: {
    icon: "/paywhen.svg",
    shortcut: "/paywhen.svg",
    apple: "/paywhen.svg",
  },
  robots: { index: true, follow: true },
  // THIS IS THE FIX: Moving the verification into the metadata object
  other: {
    "talentapp:project_verification":
      "f7c5e13669525ccc934a994861757841cddf441819478b371dcf13769e6007339ceb2d37e7efe588b1eac0eea0904cae3bd30cbd8c9402c9228c58eb2344069a",
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#090A06" }],
  width: "device-width",
  initialScale: 1,
};

// It's better to export this as a property of the metadata object or keep it as is
export const metadataBase = new URL("https://paywhen.vercel.app");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black selection:bg-green-500/30">
        <Web3Provider>
          <Navbar />
          <ClientLayout>{children}</ClientLayout>
        </Web3Provider>
      </body>
    </html>
  );
}
