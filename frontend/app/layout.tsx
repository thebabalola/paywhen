import "./globals.css";
import { ReownProvider } from "@/context/ReownProvider";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReownProvider>
          <header>
            <WalletConnectButton />
          </header>
          <main>{children}</main>
        </ReownProvider>
      </body>
    </html>
  );
}
