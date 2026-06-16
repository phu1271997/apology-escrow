"use client";

import React from "react";
import { Info, Send, ShieldCheck, ShieldAlert, CheckCircle, Scale } from "lucide-react";

export type CaseStatus = "OPEN" | "SUBMITTED" | "QUALIFIED" | "FAILED" | "RESOLVED" | "DISPUTED";

interface StatusBadgeProps {
  status: CaseStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    OPEN: {
      bg: "bg-blue-950/40 text-blue-400 border-blue-800/40",
      icon: Info,
      text: "Open (Waiting)",
    },
    SUBMITTED: {
      bg: "bg-amber-950/40 text-amber-400 border-amber-800/40",
      icon: Send,
      text: "Submitted",
    },
    QUALIFIED: {
      bg: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40",
      icon: ShieldCheck,
      text: "Qualified (disputable)",
    },
    FAILED: {
      bg: "bg-rose-950/40 text-rose-400 border-rose-800/40",
      icon: ShieldAlert,
      text: "Failed (Retrying)",
    },
    RESOLVED: {
      bg: "bg-purple-950/40 text-purple-400 border-purple-800/40",
      icon: CheckCircle,
      text: "Resolved (Final)",
    },
    DISPUTED: {
      bg: "bg-yellow-950/40 text-yellow-500 border-yellow-800/40 animate-pulse",
      icon: Scale,
      text: "Disputed",
    },
  };

  const current = styles[status] || styles.OPEN;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${current.bg} shadow-sm`}>
      <Icon className="h-3.5 w-3.5" />
      {current.text}
    </span>
  );
}
