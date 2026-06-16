"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DimensionScoreBarsProps {
  scores: {
    responsibility: number;
    specificity: number;
    sincerity: number;
    remedy_or_correction: number;
    no_deflection: number;
  };
}

export default function DimensionScoreBars({ scores }: DimensionScoreBarsProps) {
  const data = [
    { name: "Responsibility", score: scores.responsibility },
    { name: "Specificity", score: scores.specificity },
    { name: "Sincerity", score: scores.sincerity },
    { name: "Remedy/Correction", score: scores.remedy_or_correction },
    { name: "No Deflection (Gate)", score: scores.no_deflection },
  ];

  // Deflection gating: if < 60, fail.
  const isDeflectionFailed = scores.no_deflection < 60;

  return (
    <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-bold text-zinc-400 mb-4 tracking-wide uppercase">
        AI Evaluation Scores (5 Dimensions)
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis type="number" domain={[0, 100]} stroke="#71717a" />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#71717a"
              width={120}
              tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: "bold" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f0c1b",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => {
                let fill = "#8b5cf6"; // Default purple
                
                if (entry.name.includes("Gate")) {
                  fill = entry.score >= 60 ? "#10b981" : "#ef4444"; // Green if pass gate, red if fail
                } else if (entry.name === "Sincerity") {
                  fill = "#06b6d4"; // Cyan
                }
                
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {isDeflectionFailed && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-black text-red-400 uppercase tracking-wider">
            Gating threshold triggered
          </span>
          <p className="text-[10px] text-zinc-400">
            The apology failed because the <strong>No Deflection</strong> score was below 60, indicating victim blaming or insincerity.
          </p>
        </div>
      )}
    </div>
  );
}
