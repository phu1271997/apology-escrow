"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import DemoModeBanner from "../../components/DemoModeBanner";
import ConnectWallet from "../../components/ConnectWallet";
import ReputationBadge from "../../components/ReputationBadge";
import { fetchReputation } from "../../lib/contractApi";
import { Scale, ArrowLeft, User, ShieldAlert, Award, Compass } from "lucide-react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function ReputationProfile({ params }: PageProps) {
  const resolvedParams = use(params);
  const address = resolvedParams.address;
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReputation = async () => {
      setLoading(true);
      try {
        const rep = await fetchReputation(address);
        setScore(rep);
      } catch (err: any) {
        toast.error(`Error loading reputation: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };
    loadReputation();
  }, [address]);

  return (
    <div className="flex flex-col min-h-screen">
      <DemoModeBanner />

      <header className="bg-brand-dark/40 border-b border-white/5 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-brand-accent" />
            <span className="font-serif font-black text-base bg-gradient-to-r from-white to-brand-accent bg-clip-text text-transparent">
              ApologyEscrow
            </span>
          </Link>
          <ConnectWallet />
        </div>
      </header>

      <main className="max-w-xl w-full mx-auto px-6 py-10 flex-grow">
        <Link href="/explore" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Explore
        </Link>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="bg-brand-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl text-center space-y-6 animate-fade-in relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-32 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="h-16 w-16 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl flex items-center justify-center text-brand-accent mx-auto">
              <User className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white font-serif">Trust Profile</h2>
              <span className="text-xs font-mono text-brand-cyan select-all block mt-1 break-all">
                {address}
              </span>
            </div>

            <div className="py-4 border-y border-white/5 flex justify-center">
              <ReputationBadge score={score} />
            </div>

            <div className="text-xs text-zinc-400 space-y-3 leading-relaxed text-left bg-black/30 p-4 rounded-2xl border border-white/5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Reputation Scoring Model</span>
              <p>
                - <strong>+1 point</strong> for each case successfully qualified and resolved without disputes.
              </p>
              <p>
                - <strong>-1 point</strong> for each failed evaluation attempt during submissions.
              </p>
              <p>
                - <strong>-3 points</strong> if a qualified apology is disputed and overturned by the AI jury.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/explore" className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition text-xs border border-white/5">
                <Compass className="h-4 w-4" />
                Browse More Profiles
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-brand-card border-t border-white/5 py-6 text-center text-xs text-zinc-500 mt-auto">
        &copy; 2026 ApologyEscrow. Builder Program.
      </footer>
    </div>
  );
}
