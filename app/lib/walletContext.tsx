"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createDemoClient, createMetaMaskClient, createReadClient, WalletMode } from "./genlayerClient";
import { getOrCreateAccount } from "./wallet";
import { toast } from "sonner";

interface WalletContextType {
  walletMode: WalletMode;
  walletAddress: string;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  refreshBalance: () => Promise<void>;
  switchWalletMode: (mode: WalletMode) => void;
  connectMetaMask: () => Promise<void>;
  requestFaucet: () => Promise<void>;
  getWriteClient: () => any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletMode, setWalletMode] = useState<WalletMode>("demo");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("0");

  const refreshBalance = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const readClient = createReadClient();
      const bal = await readClient.getBalance({ address: walletAddress as `0x${string}` });
      // Convert wei to GEN
      const balEth = (Number(bal) / 1e18).toFixed(4);
      setBalance(balEth);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  }, [walletAddress]);

  const requestFaucet = useCallback(async () => {
    if (!walletAddress) return;
    const toastId = toast.loading("Requesting test GEN from faucet...");
    try {
      const client = createDemoClient() as any;
      // SDK's client or custom faucet request
      if (typeof client.requestFromFaucet === "function") {
        await client.requestFromFaucet(walletAddress);
      } else {
        // Fallback endpoint if sdk requestFromFaucet is missing
        await fetch(`https://faucet.studionet.genlayer.com/api/faucet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: walletAddress }),
        });
      }
      toast.success("Faucet request successful! +10 GEN", { id: toastId });
      // Wait a bit for chain to update and refresh balance
      setTimeout(refreshBalance, 2000);
    } catch (err: any) {
      toast.error(`Faucet request failed: ${err.message || err}`, { id: toastId });
    }
  }, [walletAddress, refreshBalance]);

  // Handle Demo Mode Initialization
  useEffect(() => {
    if (walletMode === "demo") {
      const wallet = getOrCreateAccount();
      if (wallet) {
        setWalletAddress(wallet.account.address);
        setIsConnected(true);
      }
    } else {
      // MetaMask check
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const checkConnection = async () => {
          try {
            const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
              setIsConnected(true);
            } else {
              setWalletAddress("");
              setIsConnected(false);
            }
          } catch {
            setIsConnected(false);
          }
        };
        checkConnection();
      } else {
        setWalletAddress("");
        setIsConnected(false);
      }
    }
  }, [walletMode]);

  // Refresh balance on wallet address update
  useEffect(() => {
    if (walletAddress) {
      refreshBalance();
      
      // Auto-faucet check for Demo Mode
      if (walletMode === "demo") {
        const autoFaucet = async () => {
          try {
            const readClient = createReadClient();
            const bal = await readClient.getBalance({ address: walletAddress as `0x${string}` });
            // If balance is low (< 5 GEN), request faucet automatically
            if (bal < BigInt(5e18)) {
               const demoClient = createDemoClient() as any;
               await demoClient.requestFromFaucet(walletAddress);
               setTimeout(refreshBalance, 2000);
            }
          } catch (e) {
            console.error("Auto faucet failed", e);
          }
        };
        autoFaucet();
      }
    }
  }, [walletAddress, walletMode, refreshBalance]);

  const switchWalletMode = (mode: WalletMode) => {
    setWalletMode(mode);
    if (mode === "demo") {
      const wallet = getOrCreateAccount();
      if (wallet) {
        setWalletAddress(wallet.account.address);
        setIsConnected(true);
        toast.info("Switched to Demo Wallet Mode (Auto-Funded)");
      }
    } else {
      setWalletAddress("");
      setIsConnected(false);
      toast.info("Switched to MetaMask Mode. Please connect your wallet.");
    }
  };

  const connectMetaMask = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      toast.error("MetaMask or compatible wallet extension not detected!");
      return;
    }
    
    setIsConnecting(true);
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        toast.success("Connected to MetaMask!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect MetaMask");
    } finally {
      setIsConnecting(false);
    }
  };

  const getWriteClient = useCallback(() => {
    if (walletMode === "demo") {
      return createDemoClient();
    } else {
      if (!walletAddress) {
        throw new Error("MetaMask wallet is not connected.");
      }
      return createMetaMaskClient(walletAddress as `0x${string}`);
    }
  }, [walletMode, walletAddress]);

  return (
    <WalletContext.Provider
      value={{
        walletMode,
        walletAddress,
        isConnected,
        isConnecting,
        balance,
        refreshBalance,
        switchWalletMode,
        connectMetaMask,
        requestFaucet,
        getWriteClient,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
