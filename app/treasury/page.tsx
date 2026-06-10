"use client";

import React from "react";
import Link from "next/link";
import DemoModeBanner from "../components/DemoModeBanner";
import ConnectWallet from "../components/ConnectWallet";
import WithdrawWidget from "../components/WithdrawWidget";
import { Scale, ArrowLeft, ArrowUpRight, Coins, Gift, Landmark } from "lucide-react";

export default function TreasuryPage() {
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

      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-grow">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        <div className="mb-10">
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Landmark className="h-6 w-6 text-brand-cyan" />
            Treasury Portal
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Settle, claim, and withdraw funds. All resolved apology deposits and staked dispute rewards are safely claimed using pull withdrawal architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Withdraw widget */}
          <div className="md:col-span-1">
            <WithdrawWidget />
          </div>

          {/* Right: History info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-brand-card border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Solvency & Staking Rules
              </h4>
              
              <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex gap-3">
                  <Coins className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-white block">Standard Resolution Payouts</span>
                    <p className="text-zinc-400 mt-1">
                      If the AI consensus validates the apology as genuine, the deposit is credited back to the offender's claimable balance. If it fails or timeline expires, it is credited to the wronged party (or charity).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex gap-3">
                  <Scale className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-white block">Dispute Settlement Stakes</span>
                    <p className="text-zinc-400 mt-1">
                      Wronged parties must stake 50% of the deposit to challenge qualification. Overturning qualification returns their stake + 50% deposit. Upholding qualification forfeits their stake to the contract admin as reward.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-brand-card border-t border-white/5 py-6 text-center text-xs text-zinc-500 mt-auto">
        &copy; 2026 ApologyEscrow. Builder Program.
      </footer>
    </div>
  );
}
