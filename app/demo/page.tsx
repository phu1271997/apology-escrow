"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DemoModeBanner from "../components/DemoModeBanner";
import ConnectWallet from "../components/ConnectWallet";
import StatusBadge from "../components/StatusBadge";
import ConsensusProgress from "../components/ConsensusProgress";
import DimensionScoreBars from "../components/DimensionScoreBars";
import { fetchCase, evaluateApology, fetchFeedback, submitApology } from "../lib/contractApi";
import { useWallet } from "../lib/walletContext";
import { Scale, Info, Play, ChevronRight, Award, FileText, Globe, AlertTriangle, ArrowLeft, Brain } from "lucide-react";
import { toast } from "sonner";

export default function DemoGallery() {
  const { getWriteClient, isConnected } = useWallet();
  
  // States
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [currentScenario, setCurrentScenario] = useState<number | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [activeCaseData, setActiveCaseData] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);

  // Scenarios mock fallback data
  const scenarios = [
    {
      id: 1,
      title: "PR Executive Sexist Tweet Scandal",
      grievance: "Executive publicly made derogatory, sexist statements about competitors in a Twitter space.",
      standard: "Sincere apology thread on Twitter addressing the specific remarks, taking first-person responsibility, and outlining corrective HR training.",
      deposit: "1.0 GEN",
      pass_threshold: 75,
      expected: "QUALIFIES (Score ~85)",
      status: "OPEN",
      sampleApology: "I want to address my remarks from yesterday's space. I take full responsibility for my derogatory and sexist comments. They were uncalled for, offensive, and do not reflect the values of our company. I apologize to our competitors and our community. I am stepping down temporarily to undergo sensitivity training.",
      sampleUrl: "https://twitter.com/exec/status/123",
      tip: "Will pass: clear first-person ownership ('I take full responsibility'), names specific harm, and states concrete corrective remedy steps."
    },
    {
      id: 2,
      title: "Journalist Allocation Misreport",
      grievance: "Journalist published misreported facts claiming team token allocations were dumped on the market.",
      standard: "Medium blog retraction detailing corrections of allocations stats, with zero victim-blaming or deflection phrases.",
      deposit: "2.5 GEN",
      pass_threshold: 70,
      expected: "FAILS (Score ~45 due to deflection)",
      status: "OPEN",
      sampleApology: "I published an article about team token allocations. Sorry if anyone was offended by the figures. Mistakes were made by my sources, and dumping is a common occurrence in crypto anyway. I will change the text if I find time.",
      sampleUrl: "https://medium.com/journalist/retraction",
      tip: "Will fail: triggers deflection gate (< 60) due to passive deflection language ('sorry if you were offended', 'mistakes were made') and lack of specificity."
    },
    {
      id: 3,
      title: "Influencer Offensive Joke Appeal",
      grievance: "Influencer made offensive jokes mocking community members in a YouTube video transcript.",
      standard: "Public apology statement acknowledging the exact offensive joke, stating concrete corrective donations to community charity.",
      deposit: "5.0 GEN",
      pass_threshold: 80,
      expected: "Pending Evaluation (Staff trigger)",
      status: "SUBMITTED",
      sampleApology: "I want to apologize for the joke I made in my last video mocking our community. It was insensitive. I am donating 5 GEN to the community charity as a retraction remedy.",
      sampleUrl: "https://youtube.com/influencer/transcript",
      tip: "Currently SUBMITTED. Click the 'Trigger AI Evaluation' button to run the GenVM comparative consensus protocol."
    }
  ];

  const handleSelectScenario = async (idx: number) => {
    setCurrentScenario(idx);
    setActiveCaseData(null);
    setFeedback(null);
    setActiveStep(1);
    
    // Simulate loading case metadata
    const toastId = toast.loading(`Loading scenario: ${scenarios[idx].title}...`);
    setTimeout(() => {
      setActiveCaseData({
        case_id: `demo_case_${idx + 1}`,
        offender: "0x1111111111111111111111111111111111111111",
        wronged: idx === 2 ? "0x0000000000000000000000000000000000000000" : "0x2222222222222222222222222222222222222222",
        charity: idx === 2 ? "0x8888888888888888888888888888888888888888" : "0x3333333333333333333333333333333333333333",
        deposit: scenarios[idx].deposit,
        grievance: scenarios[idx].grievance,
        standard: scenarios[idx].standard,
        deadline: (Math.floor(Date.now() / 1000) + 86400 * 3).toString(),
        status: scenarios[idx].status,
        attempts: "0",
        pass_threshold: scenarios[idx].pass_threshold.toString()
      });
      toast.success("Scenario loaded!", { id: toastId });
    }, 800);
  };

  const handleSimulateSubmit = () => {
    if (!activeCaseData) return;
    setActiveStep(2);
    setActiveCaseData((prev: any) => ({
      ...prev,
      apology_text: scenarios[currentScenario!].sampleApology,
      apology_url: scenarios[currentScenario!].sampleUrl,
      status: "SUBMITTED"
    }));
    toast.success("Apology evidence submitted to GenVM ledger!");
  };

  const handleTriggerEvaluation = async () => {
    setTxLoading(true);
    
    // Simulate evaluation response based on scenario index
    setTimeout(() => {
      let mockFeedback;
      let mockStatus: "QUALIFIED" | "RESOLVED" | "FAILED" = "QUALIFIED";
      
      if (currentScenario === 0) {
        // Scenario 1 passes
        mockFeedback = {
          responsibility: 85,
          specificity: 80,
          sincerity: 90,
          remedy_or_correction: 80,
          no_deflection: 90,
          score: 85,
          verdict: "QUALIFIES",
          missing_elements: "None. Sincere retraction of remarks.",
          reasoning: "The apology takes clear personal responsibility and explicitly mentions the sexist comments. Deflection check passed (90/100). Remedy steps verified."
        };
        mockStatus = "QUALIFIED";
      } else if (currentScenario === 1) {
        // Scenario 2 fails deflection gate
        mockFeedback = {
          responsibility: 50,
          specificity: 40,
          sincerity: 30,
          remedy_or_correction: 40,
          no_deflection: 40, // Fails gate (< 60)
          score: 45,
          verdict: "FAILS",
          missing_elements: "Sincerity is low. Text contains multiple deflection arguments.",
          reasoning: "The text shifts blame to 'my sources' (deflection) and uses passive phrasing ('sorry if you were offended'). It fails the gating check (40/100)."
        };
        mockStatus = "FAILED";
      } else {
        // Scenario 3
        mockFeedback = {
          responsibility: 80,
          specificity: 75,
          sincerity: 80,
          remedy_or_correction: 85,
          no_deflection: 80,
          score: 80,
          verdict: "QUALIFIES",
          missing_elements: "None.",
          reasoning: "Acceptable public apology. Acknowledges the specific joke and outlines concrete donation remedies."
        };
        mockStatus = "QUALIFIED";
      }

      setActiveCaseData((prev: any) => ({
        ...prev,
        status: mockStatus,
        attempts: "1"
      }));

      setFeedback({
        case_id: activeCaseData.case_id,
        last_score: mockFeedback.score.toString(),
        last_feedback: JSON.stringify(mockFeedback),
        last_feedback_parsed: mockFeedback
      });

      setTxLoading(false);
      setActiveStep(3);
      toast.success(`Consensus reached! Verdict: ${mockFeedback.verdict}`);
    }, 18000); // Match full consensus animation
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DemoModeBanner />
      
      {/* Consensus Animation Overlay */}
      <ConsensusProgress isOpen={txLoading} />

      {/* Header */}
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

      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-grow">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        <div className="mb-10">
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-brand-gold" />
            1-Click Interactive Demo Playground
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Staff and evaluators can interact with three pre-seeded scenarios. Choose a case below to walk through the lifecycle of an apology contract from open case to AI consensus resolution.
          </p>
        </div>

        {/* Step 0: Scenario Selection Grid */}
        {currentScenario === null && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {scenarios.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => handleSelectScenario(idx)}
                className="bg-brand-card/90 border border-white/5 hover:border-brand-gold/30 rounded-2xl p-6 transition duration-300 shadow-xl cursor-pointer hover:-translate-y-1 group relative flex flex-col justify-between"
              >
                {/* Decorative border tint */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-gold to-yellow-600 rounded-t-2xl opacity-40 group-hover:opacity-100 transition" />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded">
                      Scenario {s.id}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">{s.deposit} Stake</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-brand-gold transition duration-300">
                    {s.title}
                  </h3>

                  <p className="text-[11px] text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                    <strong>Grievance:</strong> {s.grievance}
                  </p>

                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-[10px] mb-4">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider block mb-1">Expected Outcome</span>
                    <span className={s.id === 2 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                      {s.expected}
                    </span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-1 py-2 bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-amber-950 font-bold rounded-xl text-xs transition duration-300">
                  Load Walkthrough
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step-by-step Interactive Walkthrough Panel */}
        {currentScenario !== null && activeCaseData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left Column: Case Details Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-brand-card border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold">CASE: {activeCaseData.case_id}</span>
                  <StatusBadge status={activeCaseData.status} />
                </div>

                <h3 className="text-base font-bold text-white mb-3 font-serif border-b border-white/5 pb-2">
                  {scenarios[currentScenario].title}
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Grievance</span>
                    <p className="text-zinc-300 mt-1 leading-relaxed">{activeCaseData.grievance}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Agreed Apology Standard</span>
                    <p className="text-zinc-300 mt-1 leading-relaxed">{activeCaseData.standard}</p>
                  </div>
                  <div className="flex gap-6 pt-3 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Required Pass</span>
                      <span className="text-sm font-black text-brand-cyan mt-0.5 block">{activeCaseData.pass_threshold}/100</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Deposit Locked</span>
                      <span className="text-sm font-black text-brand-gold mt-0.5 block">{activeCaseData.deposit}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips panel */}
              <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex gap-3 text-xs">
                <Info className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-brand-gold uppercase tracking-wider">Evaluation Tip</span>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">{scenarios[currentScenario].tip}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentScenario(null);
                  setActiveCaseData(null);
                  setFeedback(null);
                }}
                className="w-full py-2 border border-white/5 hover:bg-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition"
              >
                Reset Demo Scenarios
              </button>
            </div>

            {/* Right Column: Interaction Sandbox */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Progress Indicator */}
              <div className="bg-brand-card/30 border border-white/5 rounded-2xl p-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${(activeStep ?? 0) >= 1 ? "bg-brand-accent text-white" : "bg-zinc-800 text-zinc-500"}`}>1</div>
                  <span className="font-semibold text-zinc-300">Open & Stake</span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${(activeStep ?? 0) >= 2 ? "bg-brand-accent text-white" : "bg-zinc-800 text-zinc-500"}`}>2</div>
                  <span className="font-semibold text-zinc-300">Submit Apology</span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${(activeStep ?? 0) >= 3 ? "bg-brand-accent text-white" : "bg-zinc-800 text-zinc-500"}`}>3</div>
                  <span className="font-semibold text-zinc-300">AI Consensus</span>
                </div>
              </div>

              {/* Step 1 Area: Apology Submission simulation */}
              {activeStep === 1 && (
                <div className="bg-brand-card border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl animate-fade-in">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Step 2: Submit Apology Statements</h4>
                    <p className="text-[11px] text-zinc-400">The offender submits the apology evidence. In this demo, we pre-fill the sample text according to the scenario.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Drafted Statement</span>
                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-zinc-300 leading-relaxed min-h-[80px]">
                        {scenarios[currentScenario].sampleApology}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 text-xs">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Reference URL</span>
                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-brand-cyan">
                        {scenarios[currentScenario].sampleUrl}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulateSubmit}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-accent hover:bg-brand-accentHover text-white font-extrabold rounded-xl transition shadow-lg shadow-brand-accent/20"
                  >
                    Simulate Submit Apology
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Step 2 Area: Trigger Evaluation */}
              {activeStep === 2 && (
                <div className="bg-brand-card border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl animate-fade-in">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Step 3: Deliberate AI Consensus</h4>
                    <p className="text-[11px] text-zinc-400">Apology is locked. Trigger the non-deterministic GenVM Oracle consensus check using LLM validators.</p>
                  </div>

                  <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl flex items-start gap-3 text-xs leading-normal">
                    <AlertTriangle className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-brand-gold uppercase tracking-wider">How to test</span>
                      <p className="text-zinc-400 mt-1">
                        Click <strong>"Deliberate & Evaluate Apology"</strong>. This will trigger the full overlay simulation of GenLayer AI Consensus (fetch, LLM evaluate, principle validate).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTriggerEvaluation}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-cyan to-brand-cyanHover text-slate-950 font-black rounded-xl transition shadow-lg shadow-brand-cyan/20"
                  >
                    Deliberate & Evaluate Apology
                    <Brain className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Step 3 Area: Display Evaluation Result Charts */}
              {activeStep === 3 && feedback && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-brand-card border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Deliberation Result</h4>
                        <span className="text-[10px] text-zinc-500">Case resolved on-chain</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">Consensus Verdict</span>
                        <span className={`text-base font-black uppercase ${feedback.last_feedback_parsed.verdict === "QUALIFIES" ? "text-emerald-400" : "text-rose-400"}`}>
                          {feedback.last_feedback_parsed.verdict}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-500">Reasoning Details</span>
                        <p className="text-zinc-300 mt-1 leading-relaxed p-3 bg-black/40 rounded-xl border border-white/5 min-h-[100px]">
                          {feedback.last_feedback_parsed.reasoning}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-500">Missing Elements</span>
                        <p className="text-zinc-300 mt-1 leading-relaxed p-3 bg-black/40 rounded-xl border border-white/5 min-h-[100px]">
                          {feedback.last_feedback_parsed.missing_elements || "None."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score Bars */}
                  {feedback.last_feedback_parsed && (
                    <DimensionScoreBars scores={feedback.last_feedback_parsed} />
                  )}

                  {/* Reset scenario to try again */}
                  <button
                    onClick={() => {
                      setCurrentScenario(null);
                      setActiveCaseData(null);
                      setFeedback(null);
                      setActiveStep(null);
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition text-xs"
                  >
                    Reset & Try Another Scenario
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-brand-card border-t border-white/5 py-6 text-center text-xs text-zinc-500">
        &copy; 2026 ApologyEscrow. Builder Program Resubmission.
      </footer>
    </div>
  );
}
