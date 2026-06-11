"use client";

import React from "react";
import { useWallet } from "../lib/walletContext";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function DemoModeBanner() {
  const { walletMode, switchWalletMode } = useWallet();

  if (walletMode !== "demo") {
    return (
      <div className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 py-2 px-4 text-xs flex justify-between items-center z-50 relative">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          MetaMask Pro Mode Active (studionet)
        </span>
        <button
          onClick={() => switchWalletMode("demo")}
          className="text-brand-accent hover:text-brand-accentHover font-semibold transition"
        >
          Switch to Demo Mode (1-Click Test)
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-600/90 to-amber-700/90 text-white py-2 px-4 text-xs font-medium flex justify-between items-center shadow-lg shadow-amber-950/20 z-50 relative animate-fade-in">
      <span className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-100 animate-pulse" />
        <span>
          <strong>🎬 DEMO MODE ACTIVE:</strong> Using auto-generated test EOA. No browser extensions or real deposits required.
        </span>
      </span>
      <button
        onClick={() => switchWalletMode("metamask")}
        className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-amber-950 px-2.5 py-1 rounded font-bold transition shadow-sm"
      >
        <RefreshCw className="h-3 w-3" />
        MetaMask Pro Mode
      </button>
    </div>
  );
}
