"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import UniversalProvider from "@walletconnect/universal-provider";
import { createAppKit } from "@reown/appkit/react";
import { mainnet } from "@reown/appkit/networks";
import { type AppKit } from "@reown/appkit";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

const metadata = {
  name: "PayWhen",
  description: "PayWhen — Intent-based payment protocol",
  url: "https://paywhen.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const modal = createAppKit({
  adapters: [],
  networks: [mainnet],
  projectId,
  metadata,
  features: { analytics: true },
});

interface ReownContextType {
  open: () => void;
  isConnected: boolean;
  address: string | null;
}

const ReownContext = createContext<ReownContextType>({
  open: () => {},
  isConnected: false,
  address: null,
});

export function ReownProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<UniversalProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const { open: appKitOpen } = useAppKit();

  useEffect(() => {
    async function initProvider() {
      try {
        const up = await UniversalProvider.init({ projectId, metadata });
        setProvider(up);
        if (up.session) handleSession(up.session);
      } catch (error) {
        console.warn("Reown Universal Provider init error:", error);
      }
    }
    initProvider();
  }, []);

  useEffect(() => {
    const unsubscribe = modal.subscribeState((state: any) => {
      if (state.selectedNetworkId && provider?.session) handleSession(provider.session);
    });
    return () => unsubscribe();
  }, [provider]);

  const handleSession = (session: any) => {
    setIsConnected(true);
    // TODO: parse Stacks address from session.namespaces if needed
  };

  const open = async () => {
    await appKitOpen();
  };

  const disconnect = async () => {
    if (provider) await provider.disconnect();
    await modal.disconnect();
    setIsConnected(false);
    setAddress(null);
  };

  return (
    <ReownContext.Provider value={{ open, isConnected, address }}>
      {children}
    </ReownContext.Provider>
  );
}

export const useReown = () => useContext(ReownContext);
