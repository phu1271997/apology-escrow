import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "./lib/walletContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApologyEscrow | On-Chain Reconciliation & Sincere Apology Verification",
  description: "An on-chain conflict resolution protocol built on GenLayer. Lock deposits and use multi-model AI consensus to verify apologies, dispute outcomes, and pull withdraw resolved balances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="antialiased bg-brand-dark text-white min-h-screen selection:bg-brand-accent selection:text-white">
        <WalletProvider>
          {children}
          <Toaster richColors position="bottom-right" theme="dark" />
        </WalletProvider>
      </body>
    </html>
  );
}
