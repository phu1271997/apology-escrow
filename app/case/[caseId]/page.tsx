"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import DemoModeBanner from "../../components/DemoModeBanner";
import ConnectWallet from "../../components/ConnectWallet";
import StatusBadge, { CaseStatus } from "../../components/StatusBadge";
import DimensionScoreBars from "../../components/DimensionScoreBars";
import ConsensusProgress from "../../components/ConsensusProgress";
import ApologyForm from "../../components/ApologyForm";
import DisputePanel from "../../components/DisputePanel";
import { fetchCase, fetchFeedback, evaluateApology, claimOnDeadline, fetchReputation } from "../../lib/contractApi";
import { useWallet } from "../../lib/walletContext";
import { ArrowLeft, Coins, Calendar, Loader2, Play, Brain, Scale, ShieldCheck, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default function CaseDetail({ params }: PageProps) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const { isConnected, walletAddress, getWriteClient, refreshBalance } = useWallet();

  // State
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [offenderRep, setOffenderRep] = useState<number>(0);
  const [txLoading, setTxLoading] = useState(false);

  const loadCaseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCase(caseId);
      setCaseData(data);

      try {
        const feedback = await fetchFeedback(caseId);
        setFeedbackData(feedback);
      } catch {
        // Ignored if feedback doesn't exist
      }

      if (data.offender) {
        const rep = await fetchReputation(data.offender);
        setOffenderRep(rep);
      }
    } catch (err: any) {
      toast.error(`Error loading case: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCaseDetails();
  }, [loadCaseDetails]);

  const handleEvaluate = async () => {
    const toastId = toast.loading("Invoking AI Consensus deliberation...");
    setTxLoading(true);
    try {
      await evaluateApology(getWriteClient, caseId);
      toast.success("Consensus reached! State updated on-chain.", { id: toastId });
      loadCaseDetails();
      refreshBalance();
    } catch (err: any) {
      toast.error(`Evaluation failed: ${err.message || err}`, { id: toastId });
    } finally {
      setTxLoading(false);
    }
  };

  const handleClaimOnDeadline = async () => {
    const toastId = toast.loading("Processing deadline settlement...");
    setTxLoading(true);
    try {
      await claimOnDeadline(getWriteClient, caseId);
      toast.success("Deposit settled according to protocol rules!", { id: toastId });
      loadCaseDetails();
      refreshBalance();
    } catch (err: any) {
      toast.error(`Settlement failed: ${err.message || err}`, { id: toastId });
    } finally {
      setTxLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DemoModeBanner />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-accent animate-spin" />
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col min-h-screen">
        <DemoModeBanner />
        <main className="max-w-xl w-full mx-auto px-6 py-20 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-serif">Case Not Found</h2>
          <p className="text-xs text-zinc-400 mt-2">The requested case does not exist or has not been deployed on this chain.</p>
          <Link href="/explore" className="btn btn-primary mt-6 text-xs">Back to Explore</Link>
        </main>
      </div>
    );
  }

  const depositGEN = (Number(caseData.deposit) / 1e18).toFixed(2);
  const deadlineDate = new Date(Number(caseData.deadline) * 1000).toLocaleString();
  const disputeDeadlineDate = caseData.dispute_deadline ? new Date(Number(caseData.dispute_deadline) * 1000).toLocaleString() : "";

  // Checking role permissions
  const isOffender = walletAddress && walletAddress.toLowerCase() === caseData.offender.toLowerCase();
  const isWronged = walletAddress && walletAddress.toLowerCase() === caseData.wronged.toLowerCase();

  // Timeline stage check
  const getTimelineStages = (status: CaseStatus) => {
    const list = [
      { name: "Open", active: true, desc: "Waiting apology" },
      { name: "Submitted", active: status !== "OPEN", desc: "AI evaluating" },
      { name: "Qualified", active: status === "QUALIFIED" || status === "DISPUTED" || (status === "RESOLVED" && Number(caseData.attempts) > 0), desc: "Dispute open" },
      { name: "Resolved", active: status === "RESOLVED", desc: "Settlement final" },
    ];
    return list;
  };

  const timeline = getTimelineStages(caseData.status);

  // Checks for claim triggers
  const nowUnix = Math.floor(Date.now() / 1000);
  const isDeadlinePassed = nowUnix > Number(caseData.deadline);
  const isDisputeWindowPassed = caseData.dispute_deadline ? nowUnix > Number(caseData.dispute_deadline) : false;

  return (
    <div className="flex flex-col min-h-screen">
      <DemoModeBanner />
      
      {/* AI deliberation overlay animation */}
      <ConsensusProgress isOpen={txLoading} />

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

      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Case Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Link href="/explore" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Explore
          </Link>

          {/* Core metadata panel */}
          <div className="bg-brand-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">{caseData.case_id}</span>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-white mt-1 leading-tight">{caseData.grievance}</h2>
              </div>
              <StatusBadge status={caseData.status} />
            </div>

            {/* Locked Stake & Timelines */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-white/5 py-4 mb-6">
              <div className="flex items-start gap-2.5">
                <Coins className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Locked deposit</span>
                  <span className="text-sm font-black text-white mt-0.5">{depositGEN} GEN</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Calendar className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Apology deadline</span>
                  <span className="text-sm font-black text-zinc-300 mt-0.5">{deadlineDate.split(",")[0]}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-brand-cyan shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Pass threshold</span>
                  <span className="text-sm font-black text-brand-cyan mt-0.5">{caseData.pass_threshold}/100</span>
                </div>
              </div>
            </div>

            {/* Standard */}
            <div className="space-y-2 mb-6">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Agreed Apology Standard</span>
              <p className="text-xs text-zinc-300 bg-black/40 border border-white/5 p-4 rounded-xl leading-relaxed font-serif">
                {caseData.standard}
              </p>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Offender</span>
                <span className="font-mono text-brand-accent mt-1 select-all break-all">{caseData.offender}</span>
                <span className="text-[9px] text-zinc-500 mt-1">Reputation Score: {offenderRep >= 0 ? `+${offenderRep}` : offenderRep}</span>
              </div>
              <div className="flex flex-col bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                <span className="text-[9px] text-zinc-500 uppercase">Wronged Party</span>
                <span className="font-mono text-brand-cyan mt-1 select-all break-all">{caseData.wronged}</span>
              </div>
            </div>
          </div>

          {/* Timeline workflow step indicators */}
          <div className="bg-brand-card border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">Case Settlement Timeline</h3>
            <div className="grid grid-cols-4 gap-2 relative">
              {timeline.map((stage, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs ${stage.active ? "bg-brand-accent text-white border-brand-accent" : "bg-zinc-950 text-zinc-500 border-zinc-800"}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${stage.active ? "text-white" : "text-zinc-500"}`}>
                    {stage.name}
                  </span>
                  <span className="text-[8px] text-zinc-500 mt-0.5 block">{stage.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submission and Dispute Panels */}
          {caseData.status === "OPEN" && isOffender && (
            <ApologyForm caseId={caseId} onSuccess={loadCaseDetails} />
          )}

          {caseData.status === "QUALIFIED" && isWronged && (
            <DisputePanel caseId={caseId} depositAmount={caseData.deposit} onSuccess={loadCaseDetails} />
          )}
        </div>

        {/* Right Column: AI Evaluations / Actions / Verdicts */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Evaluation Action Panel */}
          {(caseData.status === "SUBMITTED" || caseData.status === "DISPUTED") && (
            <div className="bg-brand-card border border-white/5 rounded-3xl p-6 text-center space-y-4 shadow-xl">
              <Brain className="h-10 w-10 text-brand-cyan mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Apology Awaiting Deliberation
              </h3>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Apology content has been locked. Click below to trigger the non-deterministic evaluation on GenLayer studionet.
              </p>
              <button
                onClick={handleEvaluate}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-cyan to-brand-cyanHover text-slate-950 font-black rounded-xl transition shadow-lg shadow-brand-cyan/20 text-xs"
              >
                Deliberate & Evaluate Apology
              </button>
            </div>
          )}

          {/* Deadline Claims Action Panel */}
          {((caseData.status === "QUALIFIED" && isDisputeWindowPassed) ||
            ((caseData.status === "OPEN" || caseData.status === "SUBMITTED" || caseData.status === "FAILED") && isDeadlinePassed)) && (
            <div className="bg-brand-card border border-red-500/10 rounded-3xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
              <Scale className="h-10 w-10 text-red-400 mx-auto" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Settle Locked Deposit
              </h3>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Timelines have expired. Anyone can trigger final settlement to credit the respective wallets according to the contract invariants.
              </p>
              <button
                onClick={handleClaimOnDeadline}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold rounded-xl transition shadow-lg shadow-red-900/25 text-xs"
              >
                Settle Locked Deposit
              </button>
            </div>
          )}

          {/* Display Feedback (if any) */}
          {feedbackData && feedbackData.last_feedback_parsed && (
            <div className="space-y-6">
              <div className="bg-brand-card border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-[9px] uppercase font-bold text-zinc-500">Consensus Verdict</span>
                  <span className={`text-base font-black uppercase mt-0.5 block ${feedbackData.last_feedback_parsed.verdict === "QUALIFIES" ? "text-emerald-400" : "text-rose-400"}`}>
                    {feedbackData.last_feedback_parsed.verdict}
                  </span>
                </div>
                
                <div className="text-xs space-y-3 leading-relaxed">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Reasoning</span>
                    <p className="text-zinc-300 mt-1">{feedbackData.last_feedback_parsed.reasoning}</p>
                  </div>
                  {feedbackData.last_feedback_parsed.missing_elements && (
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">Missing Elements</span>
                      <p className="text-zinc-300 mt-1">{feedbackData.last_feedback_parsed.missing_elements}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Score horizontal bars */}
              <DimensionScoreBars scores={feedbackData.last_feedback_parsed} />
            </div>
          )}

          {/* Submission Preview Panel */}
          {caseData.status !== "OPEN" && (
            <div className="bg-brand-card border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Submitted Evidence</h4>
              <div className="text-xs space-y-3">
                {caseData.apology_url && (
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Scraped URL</span>
                    <a href={caseData.apology_url} target="_blank" className="font-mono text-brand-cyan mt-1 block truncate hover:underline">
                      {caseData.apology_url}
                    </a>
                  </div>
                )}
                {caseData.apology_text && (
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Submitted Statement</span>
                    <p className="text-zinc-300 mt-1 p-3 bg-black/40 rounded-xl border border-white/5 min-h-[80px] break-words">
                      {caseData.apology_text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </main>

      <footer className="bg-brand-card border-t border-white/5 py-6 text-center text-xs text-zinc-500 mt-auto">
        &copy; 2026 ApologyEscrow. Builder Program.
      </footer>
    </div>
  );
}
