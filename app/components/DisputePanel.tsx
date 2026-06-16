"use client";

import React, { useState } from "react";
import { useWallet } from "../lib/walletContext";
import { disputeQualification } from "../lib/contractApi";
import { Scale, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DisputePanelProps {
  caseId: string;
  depositAmount: string; // in wei
  onSuccess: () => void;
}

export default function DisputePanel({ caseId, depositAmount, onSuccess }: DisputePanelProps) {
  const { getWriteClient } = useWallet();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Dispute stake is 50% of deposit
  const depositWei = BigInt(depositAmount);
  const stakeWei = depositWei / BigInt(2);
  const stakeGEN = (Number(stakeWei) / 1e18).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Please explain your reason for disputing this qualified apology!");
      return;
    }

    const toastId = toast.loading("Staking and filing dispute...");
    setLoading(true);
    try {
      await disputeQualification(getWriteClient, {
        caseId,
        reason: reason.trim(),
        stakeAmount: (Number(stakeWei) / 1e18).toString(),
      });
      toast.success("Dispute filed successfully! Case status updated to DISPUTED.", { id: toastId });
      setReason("");
      onSuccess();
    } catch (err: any) {
      toast.error(`Dispute failed: ${err.message || err}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-brand-card border border-red-800/10 rounded-2xl p-6 space-y-5 shadow-xl animate-fade-in relative overflow-hidden">
      {/* Red warning gradient tint */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-amber-600" />

      <h3 className="text-sm font-bold text-red-400 tracking-wide uppercase flex items-center gap-2">
        <Scale className="h-4 w-4 animate-pulse" />
        Dispute Apology Qualification
      </h3>

      <p className="text-[10px] text-zinc-400 leading-normal">
        If you believe this apology fails the required standard (e.g. was posted on a fake profile, deleted immediately, or bypasses reach conditions), you may file a challenge.
      </p>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
          Dispute Reason
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="State your arguments. The AI consensus will re-evaluate the apology text and public webpage with this challenge context."
          className="bg-black/40 border border-white/5 focus:border-red-500/40 rounded-xl p-3 text-sm text-white focus:outline-none transition min-h-[100px] resize-y"
          disabled={loading}
        />
      </div>

      {/* Stake Warning Box */}
      <div className="p-3 bg-red-950/20 border border-red-900/20 rounded-xl flex justify-between items-center text-xs">
        <span className="text-zinc-400 font-medium">Staking Requirement:</span>
        <span className="font-extrabold text-red-400">{stakeGEN} GEN</span>
      </div>

      <p className="text-[9px] text-zinc-500 leading-normal">
        * Solvency rule: Overturning qualification returns your stake + credit of 50% deposit. Upholding qualification forfeits your stake to the oracle pool.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Staking Stake & Submitting...
          </>
        ) : (
          <>
            File Dispute Challenge
            <Scale className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
