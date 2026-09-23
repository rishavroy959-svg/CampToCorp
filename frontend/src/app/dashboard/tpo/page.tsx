"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KPICard,
  ReadinessRing,
  StatusPill,
  Button,
} from "@/components/campuslink";
import {
  GraduationCap,
  Building,
  Award,
  AlertTriangle,
  Calendar,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Users,
  ChevronRight,
  Download,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface AtRiskStudent {
  id: number;
  rollNo: string;
  name: string;
  branch: string;
  cgpa: number;
  readinessScore: number;
  primaryGap: string;
  interviewsAttended: number;
  status: "NEEDS_COUNSELING" | "ENROLLED_BOOTCAMP" | "MENTOR_ASSIGNED" | "RESOLVED";
  assignedMentor?: string;
}

export default function TPODashboardPage() {
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [atRiskList, setAtRiskList] = useState<AtRiskStudent[]>([
    {
      id: 1,
      rollNo: "22CS089",
      name: "Vikram Malhotra",
      branch: "CSE",
      cgpa: 5.9,
      readinessScore: 34,
      primaryGap: "Core DSA & Algorithms (Failed 3 coding screens)",
      interviewsAttended: 0,
      status: "NEEDS_COUNSELING",
    },
    {
      id: 2,
      rollNo: "22EC045",
      name: "Sneha Mukherjee",
      branch: "ECE",
      cgpa: 6.2,
      readinessScore: 38,
      primaryGap: "Embedded C & System Design Fundamentals",
      interviewsAttended: 1,
      status: "ENROLLED_BOOTCAMP",
      assignedMentor: "Prof. Anita Desai",
    },
    {
      id: 3,
      rollNo: "22IT012",
      name: "Rohan Verma",
      branch: "IT",
      cgpa: 6.4,
      readinessScore: 39,
      primaryGap: "System Design & Cloud Infrastructure",
      interviewsAttended: 0,
      status: "NEEDS_COUNSELING",
    },
    {
      id: 4,
      rollNo: "22ME078",
      name: "Karan Johar",
      branch: "MECH",
      cgpa: 5.7,
      readinessScore: 28,
      primaryGap: "Quantitative Aptitude & Communication",
      interviewsAttended: 0,
      status: "MENTOR_ASSIGNED",
      assignedMentor: "Prof. R. Venkat",
    },
    {
      id: 5,
      rollNo: "22CS112",
      name: "Ananya Iyer",
      branch: "CSE",
      cgpa: 6.1,
      readinessScore: 36,
      primaryGap: "Full Stack Development & Project Portfolio",
      interviewsAttended: 1,
      status: "ENROLLED_BOOTCAMP",
      assignedMentor: "Prof. Anita Desai",
    },
  ]);

  const [activeInterventionModal, setActiveInterventionModal] = useState<AtRiskStudent | null>(null);
  const [interventionAction, setInterventionAction] = useState<"mentor" | "bootcamp" | "counseling">("mentor");
  const [interventionNote, setInterventionNote] = useState("");

  const handleApplyIntervention = (studentId: number) => {
    setAtRiskList((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const newStatus =
            interventionAction === "mentor"
              ? "MENTOR_ASSIGNED"
              : interventionAction === "bootcamp"
              ? "ENROLLED_BOOTCAMP"
              : "NEEDS_COUNSELING";
          return {
            ...s,
            status: newStatus,
            assignedMentor: interventionAction === "mentor" ? "Prof. Anita Desai" : s.assignedMentor,
          };
        }
        return s;
      })
    );
    setActiveInterventionModal(null);
    setInterventionNote("");
  };

  const filteredStudents = atRiskList.filter((s) => {
    const matchesBranch = selectedBranch === "ALL" || s.branch === selectedBranch;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.primaryGap.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-campus-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Campus Placement Lifecycle</span>
              <span>/</span>
              <span>TPO Command Center (PRD Module C & G)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              Placement Command Dashboard
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              Executive overview of student employability tiers, active recruitment drives, and early intervention alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/drives">
              <Button variant="secondary" size="md" icon={<Calendar className="w-4 h-4" />}>
                Drive Calendar
              </Button>
            </Link>
            <Link href="/matching">
              <Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4" />}>
                AI Candidate Shortlisting
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Core KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Batch Placement Rate"
            metric="76.4%"
            subtitle="344 / 450 Students Placed"
            trend={{ value: "+12.4% YoY", isPositive: true }}
            icon={<GraduationCap className="w-5 h-5 text-campus-primary" />}
          />
          <KPICard
            title="Active Drives"
            metric="6 Scheduled"
            subtitle="Next: Google Cloud (Oct 18)"
            icon={<Building className="w-5 h-5 text-blue-600" />}
          />
          <KPICard
            title="Total Offers Extended"
            metric="412 Offers"
            subtitle="Avg CTC: 12.8 LPA (Max: 44.0 LPA)"
            trend={{ value: "+8.2% CTC", isPositive: true }}
            icon={<Award className="w-5 h-5 text-emerald-600" />}
          />
          <KPICard
            title="At-Risk Cohort (Tier 4)"
            metric="34 Students"
            subtitle="Readiness < 40 / Needs Action"
            variant="danger"
            icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          />
        </div>

        {/* Batch Employability Distribution & Drive Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employability Tiers Breakdown (PRD Module B) */}
          <div className="card-squarespace p-6 space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-campus-text-primary">
                  Employability Readiness Tiers (Batch of 2026)
                </h2>
                <p className="text-xs text-campus-text-secondary mt-0.5">
                  AI composite score based on verified skills (50%), CGPA (20%), assessments (15%), and projects (15%).
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                450 Total Students
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center space-y-1">
                <span className="text-xs font-semibold text-emerald-800">Tier 1: Highly Ready</span>
                <div className="text-2xl font-extrabold text-emerald-700">168</div>
                <div className="text-[11px] text-emerald-600">Score 86-100 (37%)</div>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 text-center space-y-1">
                <span className="text-xs font-semibold text-blue-800">Tier 2: Job Ready</span>
                <div className="text-2xl font-extrabold text-blue-700">142</div>
                <div className="text-[11px] text-blue-600">Score 71-85 (32%)</div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-center space-y-1">
                <span className="text-xs font-semibold text-amber-800">Tier 3: Developing</span>
                <div className="text-2xl font-extrabold text-amber-700">106</div>
                <div className="text-[11px] text-amber-600">Score 41-70 (24%)</div>
              </div>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 text-center space-y-1">
                <span className="text-xs font-semibold text-rose-800">Tier 4: At-Risk</span>
                <div className="text-2xl font-extrabold text-rose-700">34</div>
                <div className="text-[11px] text-rose-600">Score 0-40 (7%)</div>
              </div>
            </div>

            {/* Department-wise Conversion Progress */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                Departmental Placement Conversion Rates
              </div>
              <div className="space-y-2.5">
                {[
                  { dept: "Computer Science & Engineering (CSE)", placed: 120, total: 130, pct: 92.3 },
                  { dept: "Information Technology (IT)", placed: 59, total: 70, pct: 84.2 },
                  { dept: "Electronics & Communication (ECE)", placed: 88, total: 120, pct: 73.3 },
                  { dept: "Mechanical Engineering (MECH)", placed: 77, total: 130, pct: 59.2 },
                ].map((d) => (
                  <div key={d.dept} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-campus-text-primary">{d.dept}</span>
                      <span className="text-campus-text-secondary">
                        {d.placed}/{d.total} ({d.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-campus-primary h-2 rounded-full transition-all duration-700"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Schedule Widget */}
          <div className="card-squarespace p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-campus-text-primary">Upcoming Drives</h2>
              <Link
                href="/drives"
                className="text-xs font-semibold text-campus-accent hover:underline flex items-center gap-0.5"
              >
                Calendar <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  company: "Microsoft IDC",
                  role: "Cloud Software Engineer",
                  date: "2026-10-15",
                  slot: "FULL_DAY",
                  venue: "Auditorium Hall A",
                  status: "ACTIVE",
                },
                {
                  company: "Google Cloud",
                  role: "Site Reliability Engineer",
                  date: "2026-10-18",
                  slot: "FULL_DAY",
                  venue: "Auditorium Hall A",
                  status: "UPCOMING",
                  hasConflict: true,
                },
                {
                  company: "Goldman Sachs",
                  role: "Quantitative Analyst",
                  date: "2026-10-22",
                  slot: "MORNING",
                  venue: "Main Conference Hall",
                  status: "UPCOMING",
                },
                {
                  company: "Qualcomm India",
                  role: "Embedded SW Engineer",
                  date: "2026-10-24",
                  slot: "AFTERNOON",
                  venue: "ECE Seminar Room",
                  status: "UPCOMING",
                },
              ].map((drive, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all text-xs ${
                    drive.hasConflict
                      ? "border-rose-300 bg-rose-50/30"
                      : "border-campus-border bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-campus-text-primary">{drive.company}</div>
                      <div className="text-[11px] text-campus-text-secondary">{drive.role}</div>
                    </div>
                    {drive.hasConflict ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                        Collision
                      </span>
                    ) : (
                      <StatusPill label={drive.status} variant={drive.status === "ACTIVE" ? "success" : "primary"} />
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-campus-text-secondary flex items-center justify-between">
                    <span>{drive.date} &bull; {drive.slot}</span>
                    <span className="font-medium text-slate-700">{drive.venue}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/drives" className="block w-full">
              <Button variant="outline" size="sm" className="w-full">
                Manage All 6 Placement Drives
              </Button>
            </Link>
          </div>
        </div>

        {/* At-Risk Intervention Queue (PRD FR-I1 to FR-I5) */}
        <div className="card-squarespace p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h2 className="text-xl font-bold text-campus-text-primary">
                  At-Risk Student Intervention Engine (PRD Module I)
                </h2>
              </div>
              <p className="text-xs text-campus-text-secondary mt-1">
                Automated identification of candidates needing faculty mentorship, remedial bootcamps, and counseling before recruitment drives close.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or gap..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-campus-border bg-white"
                />
              </div>

              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg border border-campus-border bg-white font-medium"
              >
                <option value="ALL">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-campus-border text-campus-text-secondary font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Branch</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3 text-center">Readiness</th>
                  <th className="py-3 px-4">Primary Skill Gap / Risk Indicator</th>
                  <th className="py-3 px-3">Remedial Status</th>
                  <th className="py-3 px-4 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-campus-text-primary">{student.name}</div>
                      <div className="text-[11px] text-campus-text-secondary font-mono">
                        {student.rollNo}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{student.branch}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-rose-600">{student.cgpa.toFixed(1)}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        {student.readinessScore} / 100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{student.primaryGap}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          student.status === "MENTOR_ASSIGNED"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : student.status === "ENROLLED_BOOTCAMP"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {student.status.replace("_", " ")}
                      </span>
                      {student.assignedMentor && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {student.assignedMentor}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveInterventionModal(student)}
                      >
                        Intervene
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Faculty / Remedial Intervention (PRD FR-I4) */}
        {activeInterventionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="text-lg font-bold text-campus-text-primary">
                    Initiate Remedial Intervention
                  </h3>
                </div>
                <button
                  onClick={() => setActiveInterventionModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-campus-border text-xs space-y-1">
                <div className="font-bold text-campus-text-primary">
                  {activeInterventionModal.name} ({activeInterventionModal.rollNo})
                </div>
                <div className="text-slate-600">
                  {activeInterventionModal.branch} &bull; CGPA: {activeInterventionModal.cgpa} &bull; Readiness Score:{" "}
                  <span className="font-bold text-rose-600">{activeInterventionModal.readinessScore}/100</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Primary Diagnosis: {activeInterventionModal.primaryGap}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-campus-text-primary">
                  Select Intervention Strategy:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterventionAction("mentor")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      interventionAction === "mentor"
                        ? "border-campus-primary bg-campus-primary/5 font-bold text-campus-primary"
                        : "border-campus-border hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    Assign Faculty Mentor
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterventionAction("bootcamp")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      interventionAction === "bootcamp"
                        ? "border-campus-primary bg-campus-primary/5 font-bold text-campus-primary"
                        : "border-campus-border hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    Enroll in Coding Sprint
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterventionAction("counseling")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      interventionAction === "counseling"
                        ? "border-campus-primary bg-campus-primary/5 font-bold text-campus-primary"
                        : "border-campus-border hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    Schedule 1-on-1 Counseling
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-campus-text-primary mb-1 mt-2">
                    Action Plan & Notes for Student Record:
                  </label>
                  <textarea
                    rows={3}
                    value={interventionNote}
                    onChange={(e) => setInterventionNote(e.target.value)}
                    placeholder="e.g. Assigned to Prof. Anita Desai for twice-weekly DSA mock review and LeetCode medium sprint..."
                    className="w-full p-2.5 rounded-lg border border-campus-border text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => setActiveInterventionModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApplyIntervention(activeInterventionModal.id)}
                >
                  Record & Dispatch Intervention
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
