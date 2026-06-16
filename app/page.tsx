"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DemoModeBanner from "./components/DemoModeBanner";
import ConnectWallet from "./components/ConnectWallet";
import CaseCard from "./components/CaseCard";
import { fetchCase } from "./lib/contractApi";
import { Scale, HeartHandshake, Eye, BookOpen, PlusCircle, Compass, Play, Brain, ArrowRight } from "lucide-react";

export default function Home() {
  const [featuredCases, setFeaturedCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sample cases for preview
  useEffect(() => {
    const loadFeatured = async () => {
      setLoading(true);
      const list = [];
      // Attempt to fetch case_0, case_1, case_2
      for (const id of ["case_0", "case_1", "case_2"]) {
        try {
          const data = await fetchCase(id);
          list.push(data);
        } catch {
          // If contract is not deployed yet or seeded, fallback to mock data
        }
      }

      // If empty, supply high quality mock cases matching the seed design
      if (list.length === 0) {
        list.push(
          {
            case_id: "case_0",
            offender: "0x1111111111111111111111111111111111111111",
            wronged: "0x2222222222222222222222222222222222222222",
            charity: "0x3333333333333333333333333333333333333333",
            deposit: (1 * 1e18).toString(),
            grievance: "Executive publicly made derogatory statements about competitors.",
            standard: "Sincere apology thread on Twitter addressing the specific statements.",
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
            grievance: "Journalist published misreported facts regarding team token allocations.",
            standard: "Medium article retraction with detailed corrections of all allocation stats.",
            deadline: (Math.floor(Date.now() / 1000) - 86400).toString(), // Past deadline
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
            grievance: "Social media influencer made offensive jokes mocking community members.",
            standard: "Video transcription apology stating corrective steps and donations.",
            deadline: (Math.floor(Date.now() / 1000) + 86400 * 5).toString(),
            status: "SUBMITTED",
            attempts: "1",
            pass_threshold: "80",
          }
        );
      }
      setFeaturedCases(list);
      setLoading(false);
    };

    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Demo banner */}
      <DemoModeBanner />

      {/* Header / Navbar */}
      <header className="bg-brand-dark/40 border-b border-white/5 backdrop-blur-md sticky top-0 z-40 transition px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Scale className="h-6 w-6 text-brand-accent group-hover:rotate-12 transition duration-300" />
            <span className="font-serif font-black text-lg tracking-tight bg-gradient-to-r from-white via-zinc-100 to-brand-accent bg-clip-text text-transparent">
              ApologyEscrow
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold text-zinc-400">
            <Link href="/explore" className="hover:text-white transition">Explore</Link>
            <Link href="/open" className="hover:text-white transition">Open Case</Link>
            <Link href="/demo" className="hover:text-white transition text-brand-gold">Try Demo</Link>
            <Link href="/treasury" className="hover:text-white transition">Treasury</Link>
          </nav>

          <ConnectWallet />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-accent mb-6 animate-pulse">
          <HeartHandshake className="h-3.5 w-3.5" />
          The Court of Public Opinion, Automated
        </div>

        <h1 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight leading-tight max-w-3xl mb-6">
          Reconciliation Guaranteed by <span className="bg-gradient-to-r from-brand-cyan to-brand-accent bg-clip-text text-transparent">AI Consensus</span>
        </h1>
        
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-10">
          Lock penalty deposits on-chain. Return them ONLY if the offender publishes a genuine, sincere public apology or retraction verified via multi-model validator voting.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/open"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-accent hover:bg-brand-accentHover text-white font-extrabold rounded-xl transition shadow-lg shadow-brand-accent/20"
          >
            <PlusCircle className="h-5 w-5" />
            Open Apology Case
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-gold to-yellow-600 hover:from-brand-goldHover hover:to-yellow-500 text-amber-950 font-black rounded-xl transition shadow-lg shadow-brand-gold/10"
          >
            <Play className="h-4 w-4" />
            Try 1-Click Demo
          </Link>
          <Link
            href="/explore"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold rounded-xl transition"
          >
            <Compass className="h-5 w-5" />
            Browse Cases
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-card/30 border-y border-white/5 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black text-white font-serif">100%</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-1">Autonomous</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black text-brand-cyan font-serif">5+</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-1">Dimensions Scored</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black text-brand-gold font-serif">Zero-Trust</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-1">Consensus Principle</span>
          </div>
        </div>
      </section>

      {/* Core Tagline Pitch (Truct 1 requirement) */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white font-serif">
          Why Dies Without GenLayer?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-10">
          <div className="bg-brand-card/60 border border-white/5 rounded-2xl p-6">
            <div className="h-10 w-10 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl flex items-center justify-center text-brand-cyan mb-4">
              <Compass className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Live Web Scraping</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Only Intelligent Contracts can execute non-deterministic HTTP rendering to scrape live Twitter/Medium updates and run-time assets.
            </p>
          </div>

          <div className="bg-brand-card/60 border border-white/5 rounded-2xl p-6">
            <div className="h-10 w-10 bg-brand-accent/10 border border-brand-accent/20 rounded-xl flex items-center justify-center text-brand-accent mb-4">
              <Brain className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Subjective AI Decisions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standard EVMs cannot evaluate language. GenLayer lets LLMs judge if apologies are sincere or merely evasive public relations spin.
            </p>
          </div>

          <div className="bg-brand-card/60 border border-white/5 rounded-2xl p-6">
            <div className="h-10 w-10 bg-brand-gold/10 border border-brand-gold/20 rounded-xl flex items-center justify-center text-brand-gold mb-4">
              <Scale className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Consensus Principle</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero trust. Comparative validator prompt checks prevent the offender from cheating by biasing a single sympathetic LLM evaluator node.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Cases Section */}
      <section className="bg-brand-card/20 border-t border-white/5 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white font-serif">Featured Cases</h2>
              <p className="text-xs text-zinc-400 mt-1">Real-time public reconciliation cases on studionet</p>
            </div>
            <Link href="/explore" className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1">
              View All Cases
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-brand-card/50 h-64 rounded-2xl border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCases.map((c, idx) => (
                <CaseCard key={c.case_id || idx} c={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-brand-card border-t border-white/5 py-8 px-6 text-center text-xs text-zinc-500 font-medium leading-relaxed">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 ApologyEscrow. Built for the GenLayer Builder Program.</span>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="hover:text-white transition">Demo Guide</Link>
            <Link href="https://github.com/phu1271997/apology-escrow" target="_blank" className="hover:text-white transition">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
