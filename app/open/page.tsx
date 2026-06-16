"use client";

import React, { useState } from "react";
import Link from "next/link";
import DemoModeBanner from "../components/DemoModeBanner";
import ConnectWallet from "../components/ConnectWallet";
import { openCase } from "../lib/contractApi";
import { useWallet } from "../lib/walletContext";
import { ArrowLeft, ChevronRight, ChevronLeft, PlusCircle, CheckCircle, Scale, Coins, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function OpenCase() {
  const { isConnected, getWriteClient, refreshBalance } = useWallet();
  const router = useRouter();

  // Wizard steps
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [grievance, setGrievance] = useState("");
  const [standard, setStandard] = useState("");
  const [passThreshold, setPassThreshold] = useState(70);
  const [deadlineDays, setDeadlineDays] = useState(3);
  const [wrongedAddr, setWrongedAddr] = useState("");
  const [charityAddr, setCharityAddr] = useState("0x3333333333333333333333333333333333333333");
  const [depositAmount, setDepositAmount] = useState("1.0");

  const standardTemplates = [
    {
      title: "Twitter retraction",
      text: "Publish a Twitter/X thread owning the specific statement. Tag the wronged party, acknowledge the exact harm, and state corrective HR actions. Keep it pinned for 7 days."
    },
    {
      title: "Medium blog apology",
      text: "Publish a Medium post of at least 500 words detail-correcting all misreported allocation figures, without passive phrasing or source shifting."
    },
    {
      title: "Press release retraction",
      text: "Publish a public press release retraction stating corrective amends and confirming donations, verified by the contract address handle."
    }
  ];

  const handleNext = () => {
    if (step === 1 && !grievance.trim()) {
      toast.error("Please describe your grievance first!");
      return;
    }
    if (step === 2 && !standard.trim()) {
      toast.error("Please define the apology standard!");
      return;
    }
    if (step === 4) {
      if (!wrongedAddr.trim() && !charityAddr.trim()) {
        toast.error("You must set either a Wronged Party address or a Fallback Charity address!");
        return;
      }
      // Simple address validation checks
      const addressRegex = /^0x[0-9a-fA-F]{40}$/;
      if (wrongedAddr.trim() && !addressRegex.test(wrongedAddr.trim())) {
        toast.error("Wronged Party address is invalid! Must be 0x followed by 40 hex characters.");
        return;
      }
      if (charityAddr.trim() && !addressRegex.test(charityAddr.trim())) {
        toast.error("Charity address is invalid! Must be 0x followed by 40 hex characters.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleOpen = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }

    const toastId = toast.loading("Opening apology case on-chain...");
    setLoading(true);
    try {
      const hash = await openCase(getWriteClient, {
        wronged: wrongedAddr.trim() || "0x0000000000000000000000000000000000000000",
        charity: charityAddr.trim() || "0x0000000000000000000000000000000000000000",
        grievance: grievance.trim(),
        standard: standard.trim(),
        passThreshold,
        deadlineDays,
        depositAmount,
      });

      toast.success("Apology case opened successfully! Locked deposit secured.", { id: toastId });
      refreshBalance();
      
      // Redirect to explore page after 2 seconds
      setTimeout(() => {
        router.push("/explore");
      }, 2000);
    } catch (err: any) {
      toast.error(`Failed to open case: ${err.message || err}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

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

      <main className="max-w-3xl w-full mx-auto px-6 py-10 flex-grow">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Wizard Progress Bar */}
        <div className="mb-10 bg-brand-card border border-white/5 p-4 rounded-2xl">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-extrabold uppercase mb-2">
            <span>Step {step} of 5</span>
            <span>{Math.round((step / 5) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
            <div className="bg-brand-accent h-full transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        {/* Wizard Content Panel */}
        <div className="bg-brand-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl min-h-[350px] flex flex-col justify-between animate-fade-in">
          
          {/* STEP 1: GRIEVANCE */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold font-serif text-white">Step 1: Describe the Wrongdoing</h2>
              <p className="text-xs text-zinc-400">Specify exactly what occurred. The AI consensus will check submissions against this grievance context.</p>
              
              <div className="flex flex-col gap-1.5 pt-4">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Grievance Description</label>
                <textarea
                  value={grievance}
                  onChange={(e) => setGrievance(e.target.value)}
                  placeholder="Example: The offender publicly leaked proprietary code on their personal blog..."
                  className="bg-black/40 border border-white/5 focus:border-brand-accent/40 rounded-xl p-3.5 text-sm text-white focus:outline-none transition min-h-[140px] resize-y"
                />
              </div>
            </div>
          )}

          {/* STEP 2: APOLOGY STANDARD */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold font-serif text-white">Step 2: Define Apology Standard</h2>
              <p className="text-xs text-zinc-400">Specify the retraction requirements (e.g. pinned Tweet, blog post, video transcript).</p>
              
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Apology Standard Requirements</label>
                <textarea
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  placeholder="Example: Pinned Tweet apologizing in first person, Tagging @wronged, kept pinned for 7 days..."
                  className="bg-black/40 border border-white/5 focus:border-brand-accent/40 rounded-xl p-3.5 text-sm text-white focus:outline-none transition min-h-[120px] resize-y"
                />
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-2">Or select from templates</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {standardTemplates.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => setStandard(t.text)}
                      className="p-3 bg-black/20 hover:bg-brand-accent/5 border border-white/5 hover:border-brand-accent/20 rounded-xl text-left cursor-pointer transition"
                    >
                      <span className="text-xs font-bold text-white block mb-1">{t.title}</span>
                      <p className="text-[10px] text-zinc-400 line-clamp-2">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: THRESHOLDS & DEADLINES */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold font-serif text-white">Step 3: Threshold & Deadlines</h2>
              <p className="text-xs text-zinc-400">Setup pass scoring thresholds and timelines for apology submission.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Required Pass Score</span>
                    <span className="font-extrabold text-brand-cyan">{passThreshold}/100</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={passThreshold}
                    onChange={(e) => setPassThreshold(Number(e.target.value))}
                    className="w-full accent-brand-cyan bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-500 leading-normal">
                    AI dimensions must average this score. Gate criterion (No Deflection) must exceed 60 separately.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Deadline Window</span>
                    <span className="font-extrabold text-white">{deadlineDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(Number(e.target.value))}
                    className="w-full accent-brand-accent bg-zinc-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-500 leading-normal">
                    Offender must submit the retraction before this window expires.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: WALLET ADDRESSES */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold font-serif text-white">Step 4: Wronged Party & Fallback Charity</h2>
              <p className="text-xs text-zinc-400">Set who receives the locked penalty deposit if the offender fails or misses the deadline.</p>
              
              <div className="space-y-4 pt-4">
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Wronged Party Address (EOA)</label>
                  <input
                    type="text"
                    value={wrongedAddr}
                    onChange={(e) => setWrongedAddr(e.target.value)}
                    placeholder="0x..."
                    className="bg-black/40 border border-white/5 focus:border-brand-accent/40 rounded-xl p-3 text-white focus:outline-none transition font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Fallback Charity Address (Optional)</label>
                  <input
                    type="text"
                    value={charityAddr}
                    onChange={(e) => setCharityAddr(e.target.value)}
                    placeholder="0x..."
                    className="bg-black/40 border border-white/5 focus:border-brand-accent/40 rounded-xl p-3 text-white focus:outline-none transition font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & LOCK DEPOSIT */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold font-serif text-white">Step 5: Lock Penalty Deposit</h2>
              <p className="text-xs text-zinc-400">Review case parameters. Confirm deposit to open on-chain contract.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/40 p-4 rounded-2xl border border-white/5 text-xs leading-normal">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-zinc-500 font-medium">Wronged Party:</span>
                    <span className="font-mono text-brand-cyan">{wrongedAddr ? `${wrongedAddr.substring(0, 6)}...` : "None"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-zinc-500 font-medium">Threshold:</span>
                    <span className="font-bold text-white">{passThreshold}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Timeline:</span>
                    <span className="font-bold text-white">{deadlineDays} Days</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Penalty Deposit Amount (GEN)</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-3 h-4 w-4 text-brand-gold" />
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 focus:border-brand-accent/40 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none font-bold"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {!isConnected && (
                <div className="p-3 bg-red-950/20 border border-red-900/20 rounded-xl flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  Please connect your wallet to proceed with locking deposits.
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-8">
            {step > 1 ? (
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-2 border border-white/5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white font-bold transition text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition text-xs"
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleOpen}
                disabled={loading || !isConnected}
                className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accentHover text-white font-black rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-accent/25 text-xs"
              >
                {loading ? "Locking & Deploying..." : "Confirm & Lock Deposit"}
                <PlusCircle className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>
      </main>

      <footer className="bg-brand-card border-t border-white/5 py-6 text-center text-xs text-zinc-500 mt-auto">
        &copy; 2026 ApologyEscrow. Builder Program.
      </footer>
    </div>
  );
}
