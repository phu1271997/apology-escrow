"use client";

import React from "react";
import { Award, ShieldCheck, Star, AwardIcon } from "lucide-react";

interface ReputationBadgeProps {
  score: number;
}

export default function ReputationBadge({ score }: ReputationBadgeProps) {
  const getBadgeDetails = (val: number) => {
    if (val >= 5) {
      return {
        level: "Platinum",
        color: "from-slate-300 via-zinc-100 to-slate-400 text-slate-900 border-slate-200",
        shadow: "shadow-slate-500/20",
        icon: Star,
      };
    } else if (val >= 3) {
      return {
        level: "Gold",
        color: "from-amber-400 via-yellow-100 to-amber-500 text-amber-950 border-amber-300",
        shadow: "shadow-amber-500/20",
        icon: Award,
      };
    } else if (val >= 1) {
      return {
        level: "Silver",
        color: "from-zinc-400 via-zinc-100 to-zinc-500 text-zinc-950 border-zinc-300",
        shadow: "shadow-zinc-500/10",
        icon: ShieldCheck,
      };
    } else {
      return {
        level: "Bronze",
        color: "from-orange-600 via-orange-300 to-orange-700 text-orange-950 border-orange-500",
        shadow: "shadow-orange-700/10",
        icon: AwardIcon,
      };
    }
  };

  const badge = getBadgeDetails(score);
  const Icon = badge.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-br border shadow-md ${badge.color} ${badge.shadow}`}>
      <Icon className="h-4 w-4 animate-bounce" />
      <div className="flex flex-col items-start leading-none">
        <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-75">Trust Badge</span>
        <span className="text-xs font-black">{badge.level} ({score >= 0 ? `+${score}` : score})</span>
      </div>
    </div>
  );
}
