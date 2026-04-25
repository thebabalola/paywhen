import type { Metadata, Viewport } from "next";
import "./globals.css";
import Web3Provider from "@/context/Web3Provider";
import ClientLayout from "@/components/ClientLayout";

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
      { url: "/paywhen.svg", width: 44, height: 44, alt: "PayWhen Logo" },
    ],
  },
  twitter: {
    card: "summary",
    title: "PayWhen — Conditional Payments",
    description:
      "PayWhen: Define conditions, hold in escrow, automatic execution.",
    images: ["/paywhen.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/paywhen.svg",
  },
  robots: { index: true, follow: true },
  // Use nextScript to inject arbitrary meta tags safely
  nextScript: [
    {
      type: "meta",
      name: "talentapp:project_verification",
      content:
        "f7c5e13669525ccc934a994861757841cddf441819478b371dcf13769e6007339ceb2d37e7efe588b1eac0eea0904cae3bd30cbd8c9402c9228c58eb2344069a",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#090A06" }],
  width: "device-width",
  initialScale: 1,
};

export const metadataBase = new URL("https://paywhen.vercel.app");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Web3Provider>
          <ClientLayout>{children}</ClientLayout>
        </Web3Provider>
      </body>
    </html>
  );
}
