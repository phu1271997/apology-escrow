"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DemoModeBanner from "../components/DemoModeBanner";
import ConnectWallet from "../components/ConnectWallet";
import CaseCard from "../components/CaseCard";
import { fetchCase } from "../lib/contractApi";
import { Scale, Search, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAllCases = async () => {
    setLoading(true);
    setError("");
    const list = [];
    
    // We scan case_0 to case_10 on-chain
    for (let i = 0; i < 10; i++) {
      try {
        const data = await fetchCase(`case_${i}`);
        list.push(data);
      } catch {
        // Stop scanning on first missing case
        break;
      }
    }

    // Fallback Mock data if none are loaded
    if (list.length === 0) {
      list.push(
        {
          case_id: "case_0",
          offender: "0x1111111111111111111111111111111111111111",
          wronged: "0x2222222222222222222222222222222222222222",
          charity: "0x3333333333333333333333333333333333333333",
          deposit: (1 * 1e18).toString(),
          grievance: "Executive publicly made derogatory, sexist statements about competitors in a Twitter space.",
          standard: "Sincere apology thread on Twitter addressing the specific remarks, taking first-person responsibility, and outlining corrective HR training. Keep pinned 7 days.",
          deadline: (Math.floor(Date.now() / 1000) + 86400 * 2).toString(),
          status: "OPEN",
          attempts: "0",
          pass_threshold: "75",
        },
        {
          case_id: "case_1",
          offender: "0x5555555555555555555555555555555555555555",
          wronged: "0x6666666666666666666666666666666666666666",
          charity: "0x0000000000000000000000000000000000000000",
          deposit: (2.5 * 1e18).toString(),
          grievance: "Journalist published misreported facts claiming team token allocations were dumped on the market.",
          standard: "Medium blog retraction detailing corrections of allocations stats, with zero victim-blaming or deflection phrases.",
          deadline: (Math.floor(Date.now() / 1000) - 86400).toString(),
          status: "QUALIFIED",
          attempts: "1",
          pass_threshold: "70",
        },
        {
          case_id: "case_2",
          offender: "0x7777777777777777777777777777777777777777",
          wronged: "0x0000000000000000000000000000000000000000",
          charity: "0x8888888888888888888888888888888888888888",
          deposit: (5 * 1e18).toString(),
          grievance: "Social media influencer made offensive jokes mocking community members in a YouTube video transcript.",
          standard: "Public apology statement acknowledging the exact offensive joke, stating concrete corrective donations to community charity.",
          deadline: (Math.floor(Date.now() / 1000) + 86400 * 5).toString(),
          status: "SUBMITTED",
          attempts: "1",
          pass_threshold: "80",
        }
      );
    }
    
    setCases(list);
    setLoading(false);
  };

  useEffect(() => {
    loadAllCases();
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      loadAllCases();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchCase(query);
      setCases([data]);
    } catch {
      setError(`Case '${searchQuery}' not found on-chain. Try searching 'case_0', 'case_1', or 'case_2'.`);
      setCases([]);
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

      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-grow">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Search header bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-xl font-bold font-serif text-white">Explore Apology Cases</h2>
            <p className="text-xs text-zinc-400 mt-1">Review active grievances, apology evidence submissions, and AI resolutions.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search case_id..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-card/90 border border-white/5 focus:border-brand-accent/40 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl text-xs font-bold transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Error / empty panel */}
        {error && (
          <div className="p-4 bg-red-950/20 border border-red-900/20 rounded-2xl flex items-center gap-3 text-xs text-zinc-300 mb-8 max-w-xl animate-fade-in">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Case listing grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-brand-accent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {cases.map((c, idx) => (
              <CaseCard key={c.case_id || idx} c={c} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-brand-card border-t border-white/5 py-6 text-center text-xs text-zinc-500">
        &copy; 2026 ApologyEscrow. Builder Program.
      </footer>
    </div>
  );
}
