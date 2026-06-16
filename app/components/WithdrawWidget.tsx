"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../lib/walletContext";
import { fetchWithdrawable, withdrawFunds } from "../lib/contractApi";
import { ArrowUpRight, Gift, Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WithdrawWidget() {
  const { isConnected, walletAddress, getWriteClient, refreshBalance } = useWallet();
  const [withdrawable, setWithdrawable] = useState<string>("0.0");
  const [loading, setLoading] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);

  const loadWithdrawable = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const balance = await fetchWithdrawable(walletAddress);
      setWithdrawable(balance);
    } catch (err) {
      console.error("Error loading withdrawable funds:", err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadWithdrawable();
    }
  }, [isConnected, walletAddress, loadWithdrawable]);

  const handleWithdraw = async () => {
    if (Number(withdrawable) <= 0) {
      toast.error("No balance available to withdraw!");
      return;
    }

    const toastId = toast.loading("Processing pull withdrawal...");
    setTxLoading(true);
    try {
      await withdrawFunds(getWriteClient);
      toast.success("Withdrawal successful! Tokens sent to your wallet.", { id: toastId });
      setWithdrawable("0.0");
      refreshBalance();
    } catch (err: any) {
      toast.error(`Withdrawal failed: ${err.message || err}`, { id: toastId });
    } finally {
      setTxLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-brand-card/90 border border-white/5 rounded-2xl p-6 text-center">
        <p className="text-xs text-zinc-400">Connect wallet to view your withdrawable funds.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-brand-card to-brand-card/90 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fade-in">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 h-24 w-24 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xs font-bold text-zinc-400 tracking-wide uppercase">
            Withdrawable Balance
          </h3>
          <span className="text-2xl font-black text-white flex items-center gap-1.5 mt-1">
            <Coins className="h-6 w-6 text-brand-gold" />
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            ) : (
              `${withdrawable} GEN`
            )}
          </span>
        </div>
        <button
          onClick={loadWithdrawable}
          className="text-[10px] uppercase font-bold text-brand-cyan hover:underline"
        >
          Refresh
        </button>
      </div>

      <p className="text-[10px] text-zinc-400 mb-6 leading-relaxed">
        ApologyEscrow utilizes a secure Pull Withdrawal pattern. Refunded deposits or won dispute stakes are credited to your claimable balance here instead of direct payouts.
      </p>

      <button
        onClick={handleWithdraw}
        disabled={txLoading || Number(withdrawable) <= 0}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-accent to-purple-700 hover:from-brand-accentHover hover:to-purple-600 text-white font-extrabold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-accent/20"
      >
        {txLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Settling Transaction...
          </>
        ) : (
          <>
            Withdraw to Wallet
            <ArrowUpRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
