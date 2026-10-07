"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ReadinessRing,
  SkillTag,
  ExplainabilityCard,
  StatusPill,
  Button,
  CompanyLogo,
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
  ChevronDown,
} from "lucide-react";

interface DriveItem {
  id: number;
  company_name: string;
  role_title: string;
  ctc_lpa: number;
  drive_date: string;
  venue: string;
  min_cgpa: number;
  allowed_branches: string[];
  required_skills: string[];
  max_backlogs_allowed: number;
}

interface StudentItem {
  id: number;
  full_name: string;
  roll_number: string;
  branch: string;
  cgpa: number;
  skills: string[];
  active_backlogs: number;
  readiness_score: number;
  readiness_level: string;
}

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
  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterEligible, setFilterEligible] = useState(false);
  const [filterShortlisted, setFilterShortlisted] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState<number | null>(null);
  const [overrideModal, setOverrideModal] = useState<CandidateMatch | null>(null);
  const [overrideNote, setOverrideNote] = useState("");

  // Load real drives and students on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined"
          ? (localStorage.getItem("campuslink_jwt_token") || localStorage.getItem("camptocorp_jwt_token"))
          : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [resDrives, resStudents] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/drives/", { cache: "no-store", headers }),
          fetch("http://127.0.0.1:8000/api/v1/students/", { cache: "no-store", headers }),
        ]);

        const drivesList: DriveItem[] = resDrives.ok ? await resDrives.json() : [];
        const studentsList: StudentItem[] = resStudents.ok ? await resStudents.json() : [];

        setDrives(drivesList);
        setStudents(studentsList);

        if (drivesList.length > 0) {
          setSelectedDriveId(drivesList[0].id);
        }
      } catch (err) {
        console.warn("Could not load drives/students:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Compute matches whenever selectedDrive or students change
  const selectedDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];

  useEffect(() => {
    if (!selectedDrive || students.length === 0) {
      setCandidates([]);
      setActiveCandidateId(null);
      return;
    }

    const driveReqSkills = (selectedDrive.required_skills || []).map((s) => s.toLowerCase());
    const minCgpa = selectedDrive.min_cgpa || 6.0;
    const allowedBranches = selectedDrive.allowed_branches || [];
    const maxBacklogs = selectedDrive.max_backlogs_allowed ?? 0;

    const matchedList: CandidateMatch[] = students.map((stu) => {
      const studentSkills = (stu.skills || []).map((s) => s.toLowerCase());
      const matched = (stu.skills || []).filter((s) =>
        driveReqSkills.some((req) => req.includes(s.toLowerCase()) || s.toLowerCase().includes(req))
      );
      const missing = (selectedDrive.required_skills || []).filter(
        (req) => !studentSkills.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
      );

      const branchEligible =
        allowedBranches.length === 0 ||
        allowedBranches.some((b) => stu.branch?.toUpperCase().includes(b.toUpperCase()));
      const cgpaEligible = (stu.cgpa || 0) >= minCgpa;
      const backlogEligible = (stu.active_backlogs || 0) <= maxBacklogs;

      const isEligible = branchEligible && cgpaEligible && backlogEligible;

      let ineligibilityReason: string | undefined = undefined;
      if (!branchEligible) {
        ineligibilityReason = `Branch '${stu.branch}' not in allowed list [${allowedBranches.join(", ")}]`;
      } else if (!cgpaEligible) {
        ineligibilityReason = `CGPA (${stu.cgpa}) is below minimum cutoff of ${minCgpa}`;
      } else if (!backlogEligible) {
        ineligibilityReason = `Active backlogs (${stu.active_backlogs}) exceed allowed maximum of ${maxBacklogs}`;
      }

      // Calculate fit score
      const skillMatchRatio = driveReqSkills.length > 0 ? matched.length / driveReqSkills.length : 0.8;
      const cgpaRatio = Math.min(1.0, (stu.cgpa || 7.0) / 10.0);
      const rawFit = (skillMatchRatio * 50) + (cgpaRatio * 30) + ((stu.readiness_score || 50) * 0.2);
      const fitScore = Math.round(Math.min(99.0, Math.max(20.0, rawFit)) * 10) / 10;

      const factors: Array<{ factor: string; impact: "positive" | "negative" | "neutral"; detail: string }> = [
        {
          factor: `CGPA (${stu.cgpa || 0})`,
          impact: cgpaEligible ? "positive" : "negative",
          detail: cgpaEligible ? `Exceeds ${minCgpa} cutoff` : `Below ${minCgpa} minimum`,
        },
        {
          factor: "Technical Stack",
          impact: matched.length > 0 ? "positive" : "neutral",
          detail: `${matched.length} verified match(es)`,
        },
      ];

      if (!branchEligible) {
        factors.push({ factor: "Branch Filter", impact: "negative", detail: ineligibilityReason || "Branch mismatch" });
      }

      return {
        id: stu.id,
        studentId: stu.id,
        name: stu.full_name,
        rollNumber: stu.roll_number,
        branch: stu.branch,
        cgpa: stu.cgpa,
        fitScore,
        isEligible,
        ineligibilityReason,
        matchedSkills: matched,
        partialSkills: [],
        missingSkills: missing,
        explanation: isEligible
          ? `Candidate clears academic cutoffs with ${stu.cgpa} CGPA and aligns with ${matched.length} target technical requirements.`
          : ineligibilityReason || "Does not meet minimum criteria.",
        factors,
        isShortlisted: isEligible && fitScore >= 65,
        overrideApplied: false,
      };
    });

    // Sort by fitScore descending
    matchedList.sort((a, b) => b.fitScore - a.fitScore);
    setCandidates(matchedList);
    if (matchedList.length > 0) {
      setActiveCandidateId(matchedList[0].id);
    }
  }, [selectedDriveId, drives, students]);

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
        {/* Drive Selector & Header */}
        {drives.length > 0 && selectedDrive ? (
          <div className="card-squarespace p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <CompanyLogo companyName={selectedDrive.company_name} size="xl" className="rounded-2xl shrink-0 mt-1" />
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-2">
                  <Building className="w-3.5 h-3.5 text-campus-primary" />
                  <span>Drive AI Candidate Matching</span>
                  <span>/</span>
                  <div className="relative inline-block">
                    <select
                      value={selectedDrive.id}
                      onChange={(e) => setSelectedDriveId(parseInt(e.target.value, 10))}
                      className="bg-transparent font-bold text-campus-primary focus:outline-none cursor-pointer pr-4"
                    >
                      {drives.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.company_name} — {d.role_title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
                  {selectedDrive.role_title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-campus-text-secondary">
                  <span className="inline-flex items-center gap-1 font-semibold text-campus-primary">
                    <DollarSign className="w-3.5 h-3.5" /> CTC: {selectedDrive.ctc_lpa} LPA
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date: {selectedDrive.drive_date}
                  </span>
                  <span>Min CGPA: {selectedDrive.min_cgpa}</span>
                  <span>Branches: {(selectedDrive.allowed_branches || []).join(", ") || "All"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => alert(`Confirmed shortlist export for ${candidates.filter((c) => c.isShortlisted).length} candidates.`)}
              >
                Export Shortlist ({candidates.filter((c) => c.isShortlisted).length})
              </Button>
            </div>
          </div>
        ) : (
          <div className="card-squarespace p-12 text-center space-y-4">
            <Building className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">No Recruitment Drives Scheduled</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no active drives in your institutional portal. Schedule a drive in the TPO portal to run autonomous AI candidate matching.
              </p>
            </div>
            <Link href="/dashboard/tpo?tab=drive_wizard">
              <Button variant="primary" size="sm">
                Schedule New Drive
              </Button>
            </Link>
          </div>
        )}

        {/* Filters and Controls */}
        {drives.length > 0 && (
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
                Shortlisted Only
              </button>
            </div>

            <div className="text-xs text-campus-text-secondary">
              Showing <span className="font-semibold text-campus-text-primary">{filtered.length}</span> of{" "}
              {candidates.length} candidates
            </div>
          </div>
        )}

        {/* Master-Detail Split Screen Layout */}
        {drives.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Candidate Shortlist */}
            <div className="lg:col-span-7 space-y-4">
              {loading ? (
                <div className="card-squarespace p-12 text-center text-xs text-slate-500">
                  Calculating AI alignment scores across campus directory...
                </div>
              ) : filtered.length === 0 ? (
                <div className="card-squarespace p-12 text-center space-y-2 border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-700">No candidates match current filters</p>
                  <p className="text-xs text-slate-500">Try adjusting your eligibility or shortlist filters above.</p>
                </div>
              ) : (
                filtered.map((candidate) => {
                  const isSelected = candidate.id === activeCandidateId;

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setActiveCandidateId(candidate.id)}
                      className={`card-squarespace p-5 cursor-pointer transition-all border ${
                        isSelected
                          ? "border-campus-primary shadow-md ring-1 ring-campus-primary/30"
                          : "border-campus-border hover:border-slate-300"
                      } ${!candidate.isEligible ? "opacity-75 bg-slate-50/50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-campus-text-primary text-base">
                              {candidate.name}
                            </h3>
                            <span className="text-xs font-semibold text-slate-500">
                              ({candidate.rollNumber})
                            </span>
                            {candidate.overrideApplied && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Overridden
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-campus-text-secondary flex items-center gap-3">
                            <span>Branch: {candidate.branch}</span>
                            <span>&bull;</span>
                            <span>CGPA: {candidate.cgpa}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-campus-text-secondary uppercase tracking-wider font-semibold">
                              Fit Score
                            </div>
                            <div className="text-lg font-black text-campus-primary">
                              {candidate.fitScore}%
                            </div>
                          </div>
                          <ReadinessRing score={candidate.fitScore} size={44} strokeWidth={4} />
                        </div>
                      </div>

                      {/* Matching Skills Badges */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {candidate.matchedSkills.map((s, i) => (
                          <SkillTag key={i} name={s} status="matched" />
                        ))}
                        {candidate.missingSkills.map((s, i) => (
                          <SkillTag key={i} name={s} status="missing" />
                        ))}
                      </div>

                      {/* Card Footer: Shortlist Toggle */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {candidate.isEligible ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Deterministically Eligible
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> {candidate.ineligibilityReason}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleShortlist(candidate.id)}
                            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                              candidate.isShortlisted
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {candidate.isShortlisted ? "✓ Shortlisted" : "+ Shortlist"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Explainable Detail Card */}
            <div className="lg:col-span-5 sticky top-24">
              {activeCandidate ? (
                <div className="space-y-4">
                  <ExplainabilityCard
                    title={`${activeCandidate.name} Alignment — ${selectedDrive.role_title}`}
                    explanation={activeCandidate.explanation}
                    factors={activeCandidate.factors}
                    confidenceScore={activeCandidate.fitScore}
                  />

                  <div className="card-squarespace p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">TPO Discretionary Override</span>
                      <button
                        onClick={() => setOverrideModal(activeCandidate)}
                        className="text-xs font-bold text-campus-primary hover:underline"
                      >
                        {activeCandidate.isShortlisted ? "Remove from Shortlist" : "Force Shortlist Candidate"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Officers can override deterministic eligibility or AI recommendations with documented audit rationale.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="card-squarespace p-12 text-center text-xs text-slate-500">
                  Select a candidate from the left panel to inspect explainability factors.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Override Modal */}
        {overrideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="font-bold text-base text-slate-900">
                Override Shortlist: {overrideModal.name}
              </h3>
              <p className="text-xs text-slate-600">
                You are about to manually {overrideModal.isShortlisted ? "remove" : "shortlist"} this candidate. Please provide a brief audit rationale:
              </p>
              <textarea
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="e.g. Exceptional open-source portfolio or academic waiver granted..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setOverrideModal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleApplyOverride}>
                  Confirm Override
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
