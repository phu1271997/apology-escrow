"use client";

import React, { useState } from "react";
import { useWallet } from "../lib/walletContext";
import { submitApology } from "../lib/contractApi";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApologyFormProps {
  caseId: string;
  onSuccess: () => void;
}

export default function ApologyForm({ caseId, onSuccess }: ApologyFormProps) {
  const { getWriteClient } = useWallet();
  const [apologyText, setApologyText] = useState("");
  const [apologyUrl, setApologyUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const textStripped = apologyText.trim();
    const urlStripped = apologyUrl.trim();

    if (!textStripped && !urlStripped) {
      toast.error("You must provide either apology text or reference URL!");
      return;
    }

    if (urlStripped && !urlStripped.startsWith("http://") && !urlStripped.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    if (textStripped.length > 10000) {
      toast.error("Text exceeds 10,000 characters limit!");
      return;
    }

    const toastId = toast.loading("Submitting apology to GenLayer...");
    setLoading(true);
    try {
      await submitApology(getWriteClient, {
        caseId,
        apologyText: textStripped,
        apologyUrl: urlStripped,
      });
      toast.success("Apology submitted successfully! Case status updated to SUBMITTED.", { id: toastId });
      setApologyText("");
      setApologyUrl("");
      onSuccess();
    } catch (err: any) {
      toast.error(`Submission failed: ${err.message || err}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-brand-card border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl animate-fade-in">
      <h3 className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
        Submit Apology Evidence
      </h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
          Apology Statement Text
        </label>
        <textarea
          value={apologyText}
          onChange={(e) => setApologyText(e.target.value)}
          placeholder="Write your apology statement here. Owning the wrongdoing, naming details, and stating remedy actions helps score higher."
          className="bg-black/40 border border-white/5 focus:border-brand-accent/40 rounded-xl p-3 text-sm text-white focus:outline-none transition min-h-[120px] resize-y"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
          Public URL Evidence (Optional)
        </label>
        <input
          type="text"
          value={apologyUrl}
          onChange={(e) => setApologyUrl(e.target.value)}
          placeholder="https://twitter.com/your-account/status/123"
          className="bg-black/40 border border-white/5 focus:border-brand-accent/40 rounded-xl p-3 text-sm text-white focus:outline-none transition"
          disabled={loading}
        />
        <span className="text-[9px] text-zinc-500 leading-normal">
          GenVM Oracle will scrape and render this URL to verify public Reach Adequacy and authorship.
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-cyan to-brand-cyanHover text-slate-950 font-black rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-cyan/10"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publishing to Ledger...
          </>
        ) : (
          <>
            Submit Apology for Evaluation
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
