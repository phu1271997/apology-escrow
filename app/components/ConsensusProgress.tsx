"use client";

import React, { useState, useEffect } from "react";
import { Brain, Search, Hammer, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConsensusProgressProps {
  isOpen: boolean;
}

export default function ConsensusProgress({ isOpen }: ConsensusProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Scraping Published Web Content",
      desc: "GenVM Oracle fetching live URL apology evidence from Twitter/Medium on-chain...",
      icon: Search,
      color: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20",
    },
    {
      title: "Executing Multi-Model AI Deliberations",
      desc: "Leader LLM evaluating apology sincerity, responsibility, and deflection gating criteria...",
      icon: Brain,
      color: "text-brand-accent bg-brand-accent/10 border-brand-accent/20",
    },
    {
      title: "Running Semantic Equivalence Consensus",
      desc: "Validators checking leader evaluation against comparative principle guidelines...",
      icon: Hammer,
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    {
      title: "Finalizing Settlement & Ledger State",
      desc: "Consensus reached. Finalizing status updates and preparing payouts...",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 4500); // 18 seconds total flow simulation

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-brand-dark/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6"
        >
          <div className="max-w-md w-full text-center flex flex-col items-center">
            {/* Spinning Radar glow */}
            <div className="relative h-24 w-24 mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-brand-accent/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-brand-cyan/30 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-brand-card border border-white/5 flex items-center justify-center shadow-lg shadow-black/55">
                <Brain className="h-10 w-10 text-brand-accent animate-pulse" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-white via-zinc-200 to-brand-accent bg-clip-text text-transparent">
              GenLayer AI Consensus Active
            </h2>
            <p className="text-xs text-zinc-400 mb-8 max-w-sm">
              Please wait. This transaction executes non-deterministic AI queries verified by validators.
            </p>

            {/* Steps checklist */}
            <div className="space-y-4 w-full text-left">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isPending = idx > currentStep;

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 p-3 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "bg-brand-card border-brand-accent/20 scale-[1.02]"
                        : isCompleted
                        ? "bg-brand-card/30 border-emerald-500/10 opacity-70"
                        : "border-transparent opacity-40"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${
                        isActive
                          ? step.color
                          : isCompleted
                          ? "text-emerald-500 bg-emerald-950/20 border-emerald-800/20"
                          : "text-zinc-500 bg-zinc-950/20 border-zinc-800/20"
                      }`}
                    >
                      {isCompleted ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <StepIcon className={`h-5 w-5 ${isActive ? "animate-spin" : ""}`} />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${isActive ? "text-brand-cyan" : "text-white"}`}>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                        {step.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Glowing progress line at bottom */}
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-8">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-brand-cyan to-brand-accent h-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
