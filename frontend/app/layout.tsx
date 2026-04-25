import "./globals.css";
import Web3Provider from "@/context/Web3Provider";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <header>
            <WalletConnectButton />
          </header>
          <main>{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
