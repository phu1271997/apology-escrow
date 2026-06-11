"use client";

import React from "react";
import { useWallet } from "../lib/walletContext";
import { Wallet, Coins, ArrowRightLeft, Gift } from "lucide-react";

export default function ConnectWallet() {
  const {
    walletMode,
    walletAddress,
    isConnected,
    isConnecting,
    balance,
    connectMetaMask,
    requestFaucet,
  } = useWallet();

  const shortAddress = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : "";

  if (!isConnected) {
    return (
      <button
        onClick={connectMetaMask}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl font-bold transition shadow-lg shadow-brand-accent/20"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect MetaMask"}
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Wallet info */}
      <div className="flex items-center gap-3 bg-brand-card/90 border border-white/5 rounded-xl px-4 py-2 shadow-inner">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
            {walletMode === "demo" ? "Demo Account" : "MetaMask Wallet"}
          </span>
          <span className="text-xs font-mono text-brand-cyan font-bold">
            {shortAddress}
          </span>
        </div>
        
        <div className="h-6 w-px bg-white/10" />

        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
            Balance
          </span>
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <Coins className="h-3.5 w-3.5 text-brand-gold" />
            {balance} GEN
          </span>
        </div>
      </div>

      {/* Action Faucet (if Demo Mode) */}
      {walletMode === "demo" && (
        <button
          onClick={requestFaucet}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-gold to-yellow-600 hover:from-brand-goldHover hover:to-yellow-500 text-amber-950 rounded-xl font-extrabold transition shadow-lg shadow-yellow-900/10 text-sm"
        >
          <Gift className="h-4 w-4" />
          Request Faucet (+10 GEN)
        </button>
      )}
    </div>
  );
}
