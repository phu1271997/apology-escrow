"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge, { CaseStatus } from "./StatusBadge";
import { fetchReputation } from "../lib/contractApi";
import { Scale, Calendar, Coins, ArrowRight, User } from "lucide-react";

interface CaseCardProps {
  c: {
    case_id: string;
    offender: string;
    wronged: string;
    charity: string;
    deposit: string;
    grievance: string;
    standard: string;
    deadline: string;
    status: CaseStatus;
    attempts: string;
    pass_threshold: string;
  };
}

export default function CaseCard({ c }: CaseCardProps) {
  const [reputation, setReputation] = useState<number>(0);

  useEffect(() => {
    if (c.offender) {
      fetchReputation(c.offender)
        .then(setReputation)
        .catch(() => {});
    }
  }, [c.offender]);

  const depositGEN = (Number(c.deposit) / 1e18).toFixed(2);
  const deadlineDate = new Date(Number(c.deadline) * 1000).toLocaleDateString();

  return (
    <div className="bg-brand-card/90 border border-white/5 hover:border-brand-accent/20 rounded-2xl p-6 transition duration-300 shadow-lg relative flex flex-col justify-between animate-fade-in group">
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
            {c.case_id}
          </span>
          <StatusBadge status={c.status} />
        </div>

        {/* Grievance Tagline */}
        <h4 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-brand-cyan transition duration-300">
          {c.grievance.length > 60 ? `${c.grievance.substring(0, 60)}...` : c.grievance}
        </h4>

        {/* Stake and Deadline Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-white/5">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-brand-gold" />
            <div className="flex flex-col">
              <span className="text-[8px] text-zinc-500 font-bold uppercase leading-none">Locked Deposit</span>
              <span className="text-xs font-black text-white mt-0.5">{depositGEN} GEN</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <div className="flex flex-col">
              <span className="text-[8px] text-zinc-500 font-bold uppercase leading-none">Deadline</span>
              <span className="text-xs font-black text-zinc-300 mt-0.5">{deadlineDate}</span>
            </div>
          </div>
        </div>

        {/* Offender and Reputation Badging */}
        <div className="flex items-center gap-2 mb-6">
          <User className="h-4 w-4 text-zinc-500" />
          <div className="flex flex-col leading-none">
            <span className="text-[8px] text-zinc-500 font-bold uppercase">Offender</span>
            <span className="text-[10px] text-brand-cyan font-mono mt-0.5">
              {c.offender.substring(0, 6)}...{c.offender.substring(c.offender.length - 4)}
            </span>
          </div>
          
          <div className="h-4 w-px bg-white/10 mx-1" />

          <div className="flex flex-col leading-none">
            <span className="text-[8px] text-zinc-500 font-bold uppercase">Reputation</span>
            <span className={`text-[10px] font-bold mt-0.5 ${reputation >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {reputation >= 0 ? `+${reputation}` : reputation}
            </span>
          </div>
        </div>
      </div>

      {/* Explore Case Action */}
      <Link
        href={`/case/${c.case_id}`}
        className="w-full flex items-center justify-center gap-1 py-2 bg-white/5 hover:bg-brand-accent/10 border border-white/5 group-hover:border-brand-accent/20 text-zinc-300 group-hover:text-white rounded-xl text-xs font-bold transition duration-300"
      >
        Explore Case
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition duration-300" />
      </Link>
    </div>
  );
}
