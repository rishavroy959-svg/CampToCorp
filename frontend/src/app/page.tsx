"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  ShieldCheck,
  GraduationCap,
  Users,
  Calendar,
  Zap,
  TrendingUp,
  BrainCircuit,
  Award,
  AlertTriangle,
  Building2,
  ChevronRight,
  Target,
  FileCheck2,
  Laptop2,
  Cpu,
  RefreshCw,
  SearchCheck,
  Star,
  Flame,
} from "lucide-react";

// Mock Data for Live Interactive Simulator
const SIMULATOR_STUDENTS = [
  {
    id: "1",
    name: "Priya Sharma",
    avatar: "PS",
    role: "AI / ML Specialist",
    cgpa: 9.3,
    readiness: 94,
    skills: ["Python", "PyTorch", "Transformers", "LLMs", "Vector DBs"],
    badge: "Platinum Tier",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    id: "2",
    name: "Arjun Patel",
    avatar: "AP",
    role: "Full Stack Engineer",
    cgpa: 8.7,
    readiness: 88,
    skills: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    badge: "Gold Tier",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    id: "3",
    name: "Sneha Reddy",
    avatar: "SR",
    role: "Cloud & DevOps Specialist",
    cgpa: 8.2,
    readiness: 81,
    skills: ["Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
    badge: "Gold Tier",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
];

const SIMULATOR_COMPANIES = [
  {
    id: "google",
    name: "Google Cloud",
    role: "AI & ML Platform Engineer",
    ctc: "₹34 LPA",
    requiredSkills: ["Python", "PyTorch", "Transformers", "Distributed Systems"],
    minCgpa: 8.5,
    tagColor: "from-blue-600 to-indigo-600",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    role: "Full Stack Systems SDE",
    ctc: "₹28 LPA",
    requiredSkills: ["TypeScript", "Next.js", "FastAPI", "Cloud Architecture"],
    minCgpa: 8.0,
    tagColor: "from-indigo-600 to-violet-600",
  },
  {
    id: "amazon",
    name: "Amazon AWS",
    role: "Cloud & Infrastructure SDE-1",
    ctc: "₹26 LPA",
    requiredSkills: ["Kubernetes", "AWS", "Docker", "Go/Python"],
    minCgpa: 7.5,
    tagColor: "from-amber-600 to-orange-600",
  },
];

const READINESS_TIERS = [
  {
    tier: "Platinum Tier",
    range: "90 - 100",
    color: "from-purple-600 to-indigo-600",
    border: "border-purple-200",
    bg: "bg-purple-50/50",
    textColor: "text-purple-700",
    studentCount: 84,
    avgPackage: "₹26.5 LPA",
    tagline: "Dream & Marquee Product Offers",
    traits: [
      "Mastery in advanced system design and algorithms",
      "Production-grade open-source contributions",
      "Zero active backlogs & consistent > 8.5 CGPA",
      "Explainable AI shortlisting probability > 92%",
    ],
  },
  {
    tier: "Gold Tier",
    range: "75 - 89",
    color: "from-emerald-600 to-teal-600",
    border: "border-emerald-200",
    bg: "bg-emerald-50/50",
    textColor: "text-emerald-700",
    studentCount: 312,
    avgPackage: "₹14.2 LPA",
    tagline: "Super-Dream & High-Growth Tech",
    traits: [
      "Strong competence in Full-Stack and Backend",
      "Proven hackathon and live project execution",
      "Clear technical interview communication",
      "Ready for Tier-1 corporate screening rounds",
    ],
  },
  {
    tier: "Silver Tier",
    range: "55 - 74",
    color: "from-blue-600 to-cyan-600",
    border: "border-blue-200",
    bg: "bg-blue-50/50",
    textColor: "text-blue-700",
    studentCount: 420,
    avgPackage: "₹8.5 LPA",
    tagline: "Core IT & Scaled Placement Drives",
    traits: [
      "Solid core fundamentals with minor gaps in system design",
      "Recommended targeted module in DSA & cloud tools",
      "Eligible for mass & premium IT recruitment drives",
      "Automated weekly skill booster recommendations",
    ],
  },
  {
    tier: "Bronze Tier",
    range: "< 55 (At-Risk)",
    color: "from-rose-600 to-amber-600",
    border: "border-rose-200",
    bg: "bg-rose-50/50",
    textColor: "text-rose-700",
    studentCount: 68,
    avgPackage: "Intervention",
    tagline: "Early Faculty Mentorship & Alerts",
    traits: [
      "Early warning triggered to TPO & Department Mentor",
      "Automated diagnostic roadmap to clear backlogs",
      "Mock coding assessments with AI feedback loop",
      "Dedicated 30-day placement rehabilitation plan",
    ],
  },
];

export default function HomePage() {
  const [selectedStudent, setSelectedStudent] = useState(SIMULATOR_STUDENTS[0]);
  const [selectedCompany, setSelectedCompany] = useState(SIMULATOR_COMPANIES[0]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  // Dynamic Match Score Calculation for Simulator
  const calculateMatch = () => {
    let score = 70;
    // Check skill intersection
    const matchingSkills = selectedStudent.skills.filter((s) =>
      selectedCompany.requiredSkills.some(
        (req) => req.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(req.toLowerCase())
      )
    );
    score += matchingSkills.length * 6;
    if (selectedStudent.cgpa >= selectedCompany.minCgpa) {
      score += 8;
    }
    return Math.min(score, 98);
  };

  const currentMatchScore = calculateMatch();

  const handleSimulate = (student: typeof SIMULATOR_STUDENTS[0], company: typeof SIMULATOR_COMPANIES[0]) => {
    setIsCalculating(true);
    setSelectedStudent(student);
    setSelectedCompany(company);
    setTimeout(() => {
      setIsCalculating(false);
    }, 400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-6 bg-mesh-hero border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto text-center">
          {/* Top Sparkling Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-indigo-200/80 shadow-xs mb-8 hover:scale-105 transition-transform backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
            </span>
            <span className="text-xs font-bold text-slate-800 tracking-wide">
              CAMPTOCORP 2.0 • AI-Powered Campus-to-Corporate Lifecycle
            </span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
            Campus Placements,{" "}
            <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500">
              Intelligently Unified.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Eliminate spreadsheet chaos, drive collisions, and opaque shortlisting. 
            CampToCorp orchestrates <strong className="text-slate-800 font-semibold">explainable AI candidate matching</strong>, 
            automated conflict-free drive scheduling, and 4-tier student employability analytics.
          </p>

          {/* Dual Role Gateway Cards: Student & Institute Placement Officer */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-14 text-left">
            {/* Student Candidate Gateway Card */}
            <div className="group relative bg-white/95 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-emerald-200/90 shadow-lg shadow-emerald-500/5 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Student Portal
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                Student Candidate Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Access your personal employability readiness score (0–100), AI skill diagnostics, live eligible placement drives, and 24/7 AI Career Mentor.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/auth/login?role=STUDENT"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Student Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dashboard/student"
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Enter Student Portal</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                </Link>
              </div>
            </div>

            {/* Institute Placement Officer (TPO) Gateway Card */}
            <div className="group relative bg-white/95 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-indigo-200/90 shadow-lg shadow-indigo-500/5 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Shield className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  Institute TPO Portal
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                Placement Officer (TPO) Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Full placement command center, autonomous venue conflict resolution, explainable AI candidate shortlists, policy enforcement & student tracking.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/auth/login?role=PLACEMENT_OFFICER"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>TPO Officer Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dashboard/tpo"
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold border border-indigo-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Enter TPO Portal</span>
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-xs backdrop-blur-md hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-indigo-600 mb-0.5">100%</div>
              <div className="text-xs font-bold text-slate-700">Zero Schedule Collisions</div>
              <div className="text-[11px] text-slate-500">Autonomous venue scheduler</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-xs backdrop-blur-md hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-violet-600 mb-0.5">&lt; 30s</div>
              <div className="text-xs font-bold text-slate-700">AI Vector Ranking</div>
              <div className="text-[11px] text-slate-500">Sentence-Transformers MiniLM</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-xs backdrop-blur-md hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-emerald-600 mb-0.5">4-Tier</div>
              <div className="text-xs font-bold text-slate-700">Readiness Radar</div>
              <div className="text-[11px] text-slate-500">Holistic skill gap diagnostics</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-xs backdrop-blur-md hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-cyan-600 mb-0.5">₹34 LPA</div>
              <div className="text-xs font-bold text-slate-700">Top Tier-1 Package</div>
              <div className="text-[11px] text-slate-500">Google Cloud / Microsoft drives</div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIQUE INTERACTIVE FEATURE: Live AI Candidate Matchmaker Simulator */}
      <section id="interactive-demo" className="relative z-10 py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Interactive Live Engine Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Try the Explainable AI Matchmaker
          </h2>
          <p className="text-slate-600 text-sm">
            Select a candidate profile and target company drive to watch the real-time embedding match calculation.
          </p>
        </div>

        {/* Simulator Card Box */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-2">
                camptocorp-ai://engine/vector-match-v2.py
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Model: Sentence-Transformers (all-MiniLM-L6-v2)
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Step 1: Select Student Candidate */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 1: Choose Student Candidate
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600">3 Profiles</span>
                </div>

                <div className="space-y-2.5">
                  {SIMULATOR_STUDENTS.map((student) => {
                    const isSelected = selectedStudent.id === student.id;
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSimulate(student, selectedCompany)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? "bg-indigo-50/80 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                              {student.avatar}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{student.name}</div>
                              <div className="text-[11px] text-slate-500">{student.role}</div>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${student.badgeColor}`}>
                            {student.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-100">
                          <span>CGPA: <strong>{student.cgpa}</strong></span>
                          <span>•</span>
                          <span>Readiness: <strong className="text-indigo-600">{student.readiness}%</strong></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Company Drive */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 2: Choose Target Drive
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600">Top Recruiters</span>
                </div>

                <div className="space-y-2.5">
                  {SIMULATOR_COMPANIES.map((company) => {
                    const isSelected = selectedCompany.id === company.id;
                    return (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleSimulate(selectedStudent, company)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? "bg-indigo-50/80 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            {company.name}
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {company.ctc}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mb-2">{company.role}</div>
                        <div className="flex flex-wrap gap-1">
                          {company.requiredSkills.slice(0, 3).map((sk) => (
                            <span key={sk} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Match Result & Explainability Radar */}
              <div className="lg:col-span-4 bg-slate-50/90 rounded-2xl p-5 border border-slate-200/90">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-indigo-600" />
                    AI Match Telemetry
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    Real-Time
                  </span>
                </div>

                {isCalculating ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">Calculating semantic embeddings...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Big Score Display */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="text-xs text-slate-500 font-medium">Match Fit Score</div>
                        <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                          <span className="text-indigo-600">{currentMatchScore}%</span>
                          <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          currentMatchScore >= 85
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {currentMatchScore >= 85 ? "🔥 High Match" : "⚡ Strong Contender"}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">Zero Eligibility Flags</div>
                      </div>
                    </div>

                    {/* Breakdown bars */}
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-700 font-medium mb-1">
                          <span>Technical Skill Alignment</span>
                          <span className="font-bold text-slate-900">
                            {selectedStudent.skills.filter(s => selectedCompany.requiredSkills.includes(s)).length > 0 ? "96%" : "82%"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${currentMatchScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 font-medium mb-1">
                          <span>Academic CGPA Threshold</span>
                          <span className="font-bold text-slate-900">
                            {selectedStudent.cgpa >= selectedCompany.minCgpa ? "100% (Passed)" : "Borderline"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full w-[95%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 font-medium mb-1">
                          <span>Drive Readiness Index</span>
                          <span className="font-bold text-slate-900">{selectedStudent.readiness}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-violet-500 h-full rounded-full"
                            style={{ width: `${selectedStudent.readiness}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Explainability Statement */}
                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-slate-700 leading-relaxed">
                      <strong className="text-indigo-800 font-bold block mb-1">
                        Explainable AI Justification:
                      </strong>
                      Candidate {selectedStudent.name} exceeds {selectedCompany.name}&apos;s baseline CGPA ({selectedCompany.minCgpa}). 
                      Strong semantic match across key technologies. High candidate conversion probability.
                    </div>

                    <Link
                      href="/matching"
                      className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Open Full AI Shortlisting Engine</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Tier Student Readiness Radar Section */}
      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 mb-3">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>Structured Student Profiling</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            The 4-Tier Employability Matrix
          </h2>
          <p className="text-slate-600 text-sm">
            Every candidate is automatically scored across technical assessments, project complexity, 
            academic consistency, and interview readiness.
          </p>
        </div>

        {/* Tier Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {READINESS_TIERS.map((tier, idx) => {
            const isActive = activeTierIndex === idx;
            return (
              <button
                key={tier.tier}
                onClick={() => setActiveTierIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isActive
                    ? `bg-white shadow-lg ${tier.border} ring-2 ring-indigo-500/20`
                    : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-semibold text-slate-500 mb-1">Score: {tier.range}</div>
                <div className="font-extrabold text-sm sm:text-base text-slate-900">{tier.tier}</div>
                <div className="text-xs font-bold text-indigo-600 mt-1">{tier.studentCount} Students</div>
              </button>
            );
          })}
        </div>

        {/* Selected Tier Spotlight Card */}
        {(() => {
          const t = READINESS_TIERS[activeTierIndex];
          return (
            <div className={`rounded-3xl border ${t.border} bg-white p-8 shadow-xl relative overflow-hidden`}>
              <div className="grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${t.bg} ${t.textColor} border ${t.border}`}>
                      {t.tier}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Average Bracket: <strong className="text-slate-800">{t.avgPackage}</strong>
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{t.tagline}</h3>
                  <div className="space-y-2.5 pt-2">
                    {t.traits.map((trait, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Cohort Distribution
                  </div>
                  <div className="text-5xl font-black text-slate-900 mb-2">{t.studentCount}</div>
                  <div className="text-xs text-slate-600 mb-6">
                    Candidates currently active in {t.tier} for Batch 2026
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/analytics"
                      className="btn-primary text-xs py-2.5 w-full flex items-center justify-center gap-1.5"
                    >
                      <span>Inspect Cohort in Analytics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Conflict-Free Scheduling Engine Feature */}
      <section className="relative z-10 py-16 px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>Zero Double-Booking Guarantee</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Autonomous Conflict-Free Drive Scheduling
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Campus recruitment involves dozens of concurrent companies demanding identical labs, auditoriums, 
                and interview slots. CampToCorp automatically runs constraint-satisfaction heuristics to eliminate 
                venue overlaps and student eligibility collisions before drives are published.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900">Venue & Lab Collision Solver:</strong> Hall A, Seminar Room, and Computer Center schedules are continuously validated.
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900">Student Concurrency Protection:</strong> Prevents shortlisted students from being scheduled for two simultaneous interview panels.
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900">One-Click Conflict Resolver:</strong> Automatically suggests alternate venues or staggered time slots with zero manual recalculations.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/drives"
                  className="btn-primary text-xs py-3 px-6 shadow-sm inline-flex items-center gap-2"
                >
                  <span>Explore Drives & Calendar Matrix</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Conflict Solver HUD Preview */}
            <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">Drive Collision Solver Status</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  0 Active Collisions
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Event 1 */}
                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      Google Cloud SRE Drive
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Hall A • 10:00 AM – 01:00 PM • 94 Candidates</div>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-1 rounded-md">
                    Confirmed
                  </span>
                </div>

                {/* Event 2 (Resolved Conflict) */}
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      AWS Cloud Architect Drive
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Hall B (Re-routed) • 02:00 PM – 05:00 PM</div>
                  </div>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-2 py-1 rounded-md">
                    Auto-Resolved
                  </span>
                </div>

                {/* Event 3 */}
                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Microsoft Azure Assessment
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">CS Lab 1 & 2 • 09:30 AM – 11:30 AM</div>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded-md">
                    Scheduled
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Autonomous heuristic scan frequency: 15s</span>
                <span className="text-indigo-400 font-semibold">Constraint satisfaction: 100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Portals Showcase */}
      <section id="personas" className="relative z-10 py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-3">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Designed for College Ecosystems</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Two Unified Portals, One Common Goal
          </h2>
          <p className="text-slate-600 text-sm">
            Empowering College Placement Teams with institutional intelligence while providing Students with transparent career readiness guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Placement Officer */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md hover:shadow-xl hover:border-indigo-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                For College Leadership
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">
                Placement Officer (TPO) Command Hub
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Centralized command center for managing on-campus recruitment drives, automated venue collision detection, verified student candidate eligibility, and batch-wide placement statistics.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-time conflict detection across 50+ concurrent drives</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AI Shortlisting ranking with explainable candidate match cards</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>At-Risk student early alert and faculty mentor assignment</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/tpo"
              className="btn-primary text-sm py-3 px-6 w-full flex items-center justify-center gap-2"
            >
              <span>Launch TPO Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Student */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md hover:shadow-xl hover:border-emerald-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                For Graduating Students
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">
                Student Career Super-App
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Personalized employability readiness index (0–100), transparent skill-gap diagnostics, real-time tracking of eligible placement drives, and application status.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Personalized 4-tier readiness score with skill-gap breakdowns</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>One-click application to pre-filtered eligible drives</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Interactive AI Interview Mentor with real-time feedback</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/student"
              className="btn-secondary text-sm py-3 px-6 w-full flex items-center justify-center gap-2 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <span>Launch Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Participating Corporate Partners Bar */}
      <section className="relative z-10 py-12 px-6 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
            Trusted by Top Technology Companies & Enterprise Recruiters
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-75">
            <span className="text-base font-extrabold text-slate-700 hover:text-indigo-600 transition-colors">Google Cloud</span>
            <span className="text-base font-extrabold text-slate-700 hover:text-indigo-600 transition-colors">Microsoft</span>
            <span className="text-base font-extrabold text-slate-700 hover:text-indigo-600 transition-colors">Amazon AWS</span>
            <span className="text-base font-extrabold text-slate-700 hover:text-indigo-600 transition-colors">Goldman Sachs</span>
            <span className="text-base font-extrabold text-slate-700 hover:text-indigo-600 transition-colors">Atlassian</span>
            <span className="text-base font-extrabold text-slate-700 hover:text-indigo-600 transition-colors">Adobe</span>
            <span className="text-base font-extrabold text-slate-700 hover:text-indigo-600 transition-colors">Deloitte</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-slate-200 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              C
            </div>
            <div>
              &copy; 2026 CampToCorp (CampToCorp) — AI Placement & Analytics Platform.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-medium">
            <Link href="/dashboard/tpo" className="hover:text-indigo-600 transition-colors">TPO Hub</Link>
            <Link href="/dashboard/student" className="hover:text-indigo-600 transition-colors">Student Hub</Link>
            <Link href="/matching" className="hover:text-indigo-600 transition-colors">AI Matcher</Link>
            <Link href="/drives" className="hover:text-indigo-600 transition-colors">Drives</Link>
            <Link href="/analytics" className="hover:text-indigo-600 transition-colors">Analytics</Link>
            <Link href="/design-system" className="hover:text-indigo-600 transition-colors">Design System</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
