"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ReadinessRing,
  SkillTag,
  ExplainabilityCard,
  StatusPill,
  Button,
} from "@/components/campuslink";
import {
  Briefcase,
  SlidersHorizontal,
  Sparkles,
  CheckCircle,
  XCircle,
  Filter,
  ArrowUpDown,
  Building,
  DollarSign,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface CandidateMatch {
  id: number;
  studentId: number;
  name: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  fitScore: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  explanation: string;
  factors: { factor: string; impact: "positive" | "negative" | "neutral"; detail: string }[];
  isShortlisted: boolean;
  overrideApplied: boolean;
  overrideReason?: string;
}

export default function MatchingScreen() {
  // Demo Active Drive Details per PRD
  const driveInfo = {
    company: "Microsoft IDC",
    role: "Cloud Software Engineer",
    ctc: "28.5 LPA",
    date: "2026-10-15",
    venue: "Auditorium Hall A",
    minCgpa: 7.5,
    allowedBranches: ["CSE", "IT", "ECE"],
    requiredSkills: ["Python", "FastAPI", "Docker", "PostgreSQL", "AWS"],
  };

  const [candidates, setCandidates] = useState<CandidateMatch[]>([
    {
      id: 1,
      studentId: 101,
      name: "Aarav Patel",
      rollNumber: "22CSE042",
      branch: "CSE",
      cgpa: 8.8,
      fitScore: 92.4,
      isEligible: true,
      matchedSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
      partialSkills: ["AWS (via Cloud)"],
      missingSkills: [],
      explanation:
        "High Fit Candidate: CGPA (8.8) comfortably exceeds the 7.5 threshold. Strong alignment in Python, FastAPI, and Docker with verified production projects. High mock interview rating (88/100).",
      factors: [
        { factor: "CGPA (8.8)", impact: "positive", detail: "Exceeds 7.5 cutoff" },
        { factor: "Technical Stack", impact: "positive", detail: "4 exact matches" },
        { factor: "Mock Interview", impact: "positive", detail: "Scored 88/100" },
      ],
      isShortlisted: true,
      overrideApplied: false,
    },
    {
      id: 2,
      studentId: 102,
      name: "Sneha Reddy",
      rollNumber: "22CSE089",
      branch: "CSE",
      cgpa: 8.2,
      fitScore: 84.0,
      isEligible: true,
      matchedSkills: ["Python", "PostgreSQL", "Docker"],
      partialSkills: ["FastAPI (via Flask)"],
      missingSkills: ["AWS"],
      explanation:
        "Ready Candidate: CGPA (8.2) meets criteria. Demonstrates backend proficiency with Python and PostgreSQL. Gap observed in cloud architecture (AWS).",
      factors: [
        { factor: "CGPA (8.2)", impact: "positive", detail: "Clears benchmark" },
        { factor: "Backend Stack", impact: "positive", detail: "Solid SQL & Python" },
        { factor: "AWS Cloud", impact: "negative", detail: "Missing certification" },
      ],
      isShortlisted: true,
      overrideApplied: false,
    },
    {
      id: 3,
      studentId: 103,
      name: "Karan Mehta",
      rollNumber: "22ECE015",
      branch: "ECE",
      cgpa: 7.9,
      fitScore: 68.5,
      isEligible: true,
      matchedSkills: ["Python"],
      partialSkills: ["Docker (via Linux)"],
      missingSkills: ["FastAPI", "PostgreSQL", "AWS"],
      explanation:
        "Developing Alignment: Meets ECE eligibility threshold with 7.9 CGPA. However, shows notable gaps in modern cloud frameworks (FastAPI, AWS).",
      factors: [
        { factor: "CGPA (7.9)", impact: "positive", detail: "Eligible for drive" },
        { factor: "Framework Gap", impact: "negative", detail: "Lacks FastAPI/PostgreSQL" },
      ],
      isShortlisted: false,
      overrideApplied: false,
    },
    {
      id: 4,
      studentId: 104,
      name: "Rohan Verma",
      rollNumber: "22MECH051",
      branch: "MECH",
      cgpa: 7.2,
      fitScore: 35.0,
      isEligible: false,
      ineligibilityReason: "Branch 'MECH' not in allowed list [CSE, IT, ECE] & CGPA (7.2) below 7.5",
      matchedSkills: ["Python"],
      partialSkills: [],
      missingSkills: ["FastAPI", "Docker", "PostgreSQL", "AWS"],
      explanation:
        "Ineligible for Shortlist: Branch 'MECH' and CGPA (7.2) fail deterministic eligibility rules. Basic Python capability noted, but candidate fails primary criteria.",
      factors: [
        { factor: "Branch Restriction", impact: "negative", detail: "MECH not allowed" },
        { factor: "CGPA Below Cutoff", impact: "negative", detail: "7.2 < 7.5" },
      ],
      isShortlisted: false,
      overrideApplied: false,
    },
  ]);

  const [filterEligible, setFilterEligible] = useState(false);
  const [filterShortlisted, setFilterShortlisted] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState<number | null>(1);
  const [overrideModal, setOverrideModal] = useState<CandidateMatch | null>(null);
  const [overrideNote, setOverrideNote] = useState("");

  const filtered = candidates.filter((c) => {
    if (filterEligible && !c.isEligible) return false;
    if (filterShortlisted && !c.isShortlisted) return false;
    return true;
  });

  const handleToggleShortlist = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isShortlisted: !c.isShortlisted } : c))
    );
  };

  const handleApplyOverride = () => {
    if (!overrideModal) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === overrideModal.id
          ? {
              ...c,
              isShortlisted: !c.isShortlisted,
              overrideApplied: true,
              overrideReason: overrideNote || "Placement Officer discretionary override",
              explanation: `[TPO Manual Override: '${overrideNote || "Discretionary shortlist"}'] — Original AI: ${c.explanation}`,
            }
          : c
      )
    );
    setOverrideModal(null);
    setOverrideNote("");
  };

  const activeCandidate = candidates.find((c) => c.id === activeCandidateId) || candidates[0];

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs & Drive Header */}
        <div className="card-squarespace p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-2">
              <Building className="w-3.5 h-3.5 text-campus-primary" />
              <span>Drive AI Candidate Matching</span>
              <span>/</span>
              <span className="text-campus-primary font-bold">{driveInfo.company}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              {driveInfo.role}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-campus-text-secondary">
              <span className="inline-flex items-center gap-1 font-semibold text-campus-primary">
                <DollarSign className="w-3.5 h-3.5" /> CTC: {driveInfo.ctc}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date: {driveInfo.date}
              </span>
              <span>Min CGPA: {driveInfo.minCgpa}</span>
              <span>Branches: {driveInfo.allowedBranches.join(", ")}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Re-running AI hybrid scoring across all eligible batch profiles...")}
              icon={<Sparkles className="w-4 h-4 text-campus-accent" />}
            >
              Re-run Scoring
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => alert(`Confirmed shortlisting for ${candidates.filter((c) => c.isShortlisted).length} candidates.`)}
            >
              Export Shortlist ({candidates.filter((c) => c.isShortlisted).length})
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>
            <button
              onClick={() => setFilterEligible(!filterEligible)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterEligible
                  ? "bg-campus-primary text-white border-campus-primary"
                  : "bg-white text-slate-700 border-campus-border hover:bg-slate-50"
              }`}
            >
              Eligible Only
            </button>
            <button
              onClick={() => setFilterShortlisted(!filterShortlisted)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterShortlisted
                  ? "bg-campus-primary text-white border-campus-primary"
                  : "bg-white text-slate-700 border-campus-border hover:bg-slate-50"
              }`}
            >
              Shortlisted ({candidates.filter((c) => c.isShortlisted).length})
            </button>
          </div>

          <div className="text-xs text-campus-text-secondary">
            Showing <span className="font-semibold text-campus-text-primary">{filtered.length}</span> of {candidates.length} candidates
          </div>
        </div>

        {/* Split Screen Layout (Design Doc Section 8.4) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left/Center: Ranked Candidate List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {filtered.map((c, index) => {
              const isActive = c.id === activeCandidateId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCandidateId(c.id)}
                  className={`card-squarespace p-5 cursor-pointer transition-all border ${
                    isActive
                      ? "ring-2 ring-campus-primary border-campus-primary"
                      : "hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-campus-text-secondary">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-campus-text-primary">
                            {c.name}
                          </h3>
                          <span className="text-xs font-mono text-campus-text-secondary">
                            {c.rollNumber}
                          </span>
                        </div>
                        <div className="text-xs text-campus-text-secondary mt-0.5">
                          {c.branch} &bull; CGPA: <span className="font-semibold text-campus-text-primary">{c.cgpa}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fit Score & Status Pill */}
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-campus-primary border border-blue-200">
                        <Sparkles className="w-3.5 h-3.5 text-campus-accent" />
                        <span>{c.fitScore}% Fit</span>
                      </div>
                      <div className="mt-1.5">
                        {c.isEligible ? (
                          <StatusPill label="Eligible" variant="success" />
                        ) : (
                          <StatusPill label="Ineligible" variant="danger" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills Strip */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                    {c.matchedSkills.map((s) => (
                      <SkillTag key={s} name={s} status="matched" />
                    ))}
                    {c.partialSkills.map((s) => (
                      <SkillTag key={s} name={s} status="partial" />
                    ))}
                    {c.missingSkills.map((s) => (
                      <SkillTag key={s} name={s} status="missing" />
                    ))}
                  </div>

                  {/* Quick Shortlist Toggle */}
                  <div className="mt-4 flex items-center justify-between pt-2">
                    <span className="text-xs text-campus-text-secondary">
                      {c.overrideApplied && (
                        <span className="text-amber-600 font-semibold">[Manual Override Applied]</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleShortlist(c.id);
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-all ${
                        c.isShortlisted
                          ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                          : "bg-white text-slate-700 border-campus-border hover:bg-slate-50"
                      }`}
                    >
                      {c.isShortlisted ? "Shortlisted" : "Add to Shortlist"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: AI Explainability Panel & Override Drawer (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="card-squarespace p-6 space-y-6">
              <div className="border-b border-campus-border pb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-campus-text-secondary">
                  Detailed AI Evaluation
                </span>
                <h3 className="text-xl font-bold text-campus-text-primary mt-1">
                  {activeCandidate.name} ({activeCandidate.rollNumber})
                </h3>
              </div>

              {/* Explainability Card (PRD Module D) */}
              <ExplainabilityCard
                title="AI Match Justification"
                confidenceScore={activeCandidate.fitScore / 100}
                explanation={activeCandidate.explanation}
                factors={activeCandidate.factors}
                overrideAllowed={true}
                onOverride={() => setOverrideModal(activeCandidate)}
              />

              {/* Skills Breakdown Box */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                  Job Requirement Breakdown ({driveInfo.requiredSkills.length} Core Skills)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                    <span className="font-semibold">Directly Matched:</span>
                    <span>{activeCandidate.matchedSkills.join(", ") || "None"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
                    <span className="font-semibold">Partial / Related:</span>
                    <span>{activeCandidate.partialSkills.join(", ") || "None"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-100">
                    <span className="font-semibold">Missing Gaps:</span>
                    <span>{activeCandidate.missingSkills.join(", ") || "None"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Officer Override Modal */}
        {overrideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-lg w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-campus-text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-campus-primary" />
                  Manual Shortlist Override
                </h3>
                <button
                  onClick={() => setOverrideModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-campus-text-secondary leading-relaxed">
                As a Placement Officer, you are about to override the AI decision for{" "}
                <span className="font-bold text-campus-text-primary">{overrideModal.name}</span>. 
                In compliance with PRD FR-D3, this action is audited with your justification.
              </p>

              <div>
                <label className="block text-xs font-semibold text-campus-text-primary mb-1">
                  Audit Justification / Rationale (Mandatory)
                </label>
                <textarea
                  rows={3}
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="e.g., Student has proven cloud experience in external Hackathon win; mock score cleared in departmental re-assessment."
                  className="w-full text-xs p-3 rounded-lg border border-campus-border focus:outline-none focus:ring-2 focus:ring-campus-primary/20 focus:border-campus-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setOverrideModal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleApplyOverride}>
                  Confirm Override & Save Audit Log
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
