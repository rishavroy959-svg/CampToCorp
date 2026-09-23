"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KPICard,
  StatusPill,
  Button,
  ReadinessRing,
} from "@/components/campuslink";
import {
  Users,
  AlertTriangle,
  GraduationCap,
  CheckCircle2,
  Calendar,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";

interface Mentee {
  id: number;
  rollNo: string;
  name: string;
  cgpa: number;
  readinessScore: number;
  primaryRisk: string;
  rejectionsCount: number;
  lastMeetingDate?: string;
  currentAction?: string;
  status: "CRITICAL" | "MODERATE" | "IMPROVING";
}

export default function MentorDashboardPage() {
  const [mentees, setMentees] = useState<Mentee[]>([
    {
      id: 1,
      rollNo: "22CS089",
      name: "Vikram Malhotra",
      cgpa: 5.9,
      readinessScore: 34,
      primaryRisk: "Failed 3 coding rounds; struggling with Trees & Graphs.",
      rejectionsCount: 3,
      lastMeetingDate: "2026-09-18",
      currentAction: "Enrolled in LeetCode Medium DSA Sprint",
      status: "CRITICAL",
    },
    {
      id: 2,
      rollNo: "22CS112",
      name: "Ananya Iyer",
      cgpa: 6.1,
      readinessScore: 36,
      primaryRisk: "No live deployed projects; resume lacks CI/CD verification.",
      rejectionsCount: 1,
      lastMeetingDate: "2026-09-20",
      currentAction: "Portfolio repository review pending",
      status: "CRITICAL",
    },
    {
      id: 3,
      rollNo: "22CS044",
      name: "Sahil Qureshi",
      cgpa: 6.3,
      readinessScore: 39,
      primaryRisk: "Missing Cloud & SQL skills required for Tier 2 drives.",
      rejectionsCount: 2,
      lastMeetingDate: "2026-09-15",
      currentAction: "Assigned AWS Cloud Foundations self-paced course",
      status: "MODERATE",
    },
    {
      id: 4,
      rollNo: "22CS076",
      name: "Devika Nair",
      cgpa: 6.8,
      readinessScore: 54,
      primaryRisk: "Nervous in behavioral HR rounds; mock interview required.",
      rejectionsCount: 1,
      lastMeetingDate: "2026-09-22",
      currentAction: "Mock HR interview scheduled for Friday",
      status: "IMPROVING",
    },
  ]);

  const [activeModalMentee, setActiveModalMentee] = useState<Mentee | null>(null);
  const [interventionNote, setInterventionNote] = useState("");
  const [strategy, setStrategy] = useState("1on1");

  const handleSaveIntervention = (menteeId: number) => {
    setMentees((prev) =>
      prev.map((m) => {
        if (m.id === menteeId) {
          const actionText =
            strategy === "1on1"
              ? "1-on-1 Counseling Scheduled"
              : strategy === "bootcamp"
              ? "Enrolled in DSA Bootcamp"
              : "Resume & Portfolio Remedial Overhaul";
          return {
            ...m,
            currentAction: actionText,
            status: "IMPROVING",
            lastMeetingDate: new Date().toISOString().split("T")[0],
          };
        }
        return m;
      })
    );
    setActiveModalMentee(null);
    setInterventionNote("");
  };

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Department Mentorship Portal</span>
              <span>/</span>
              <span>Faculty Coordinator View (PRD Module I)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              Prof. Anita Desai
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              Department Placement Coordinator &bull; Computer Science & Engineering &bull; 42 Mentees
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <GraduationCap className="w-3.5 h-3.5" />
              Batch 2026 (7th Sem)
            </span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <KPICard
            title="Assigned Mentees"
            metric="42 Students"
            subtitle="CSE Cohort 2026"
            icon={<Users className="w-5 h-5 text-campus-primary" />}
          />
          <KPICard
            title="Dept Placement Rate"
            metric="92.3%"
            subtitle="120 of 130 placed"
            trend={{ value: "+5.1% YoY", isPositive: true }}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          />
          <KPICard
            title="At-Risk Mentees"
            metric="4 Flagged"
            subtitle="Readiness < 40 / Low CGPA"
            variant="danger"
            icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          />
          <KPICard
            title="Interventions Done"
            metric="18 Recorded"
            subtitle="This semester"
            icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
          />
        </div>

        {/* High Priority Intervention Alert Banner */}
        <div className="card-squarespace p-5 border border-amber-300 bg-amber-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Department At-Risk Cohort Notice (PRD FR-I2)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                4 students have scored below the 40-point readiness threshold or faced repeated rejections in Tier 2 drives. Timely faculty intervention significantly boosts conversion before campus pool drives close.
              </p>
            </div>
          </div>
        </div>

        {/* Mentees Deep-Dive Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-campus-text-primary">
              Mentees Requiring Immediate Attention
            </h2>
            <span className="text-xs text-campus-text-secondary">
              Sorted by Severity & Readiness Index
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentees.map((m) => (
              <div
                key={m.id}
                className="card-squarespace p-6 border border-campus-border hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-campus-text-primary">
                          {m.name}
                        </h3>
                        <span className="text-xs font-mono text-campus-text-secondary">
                          ({m.rollNo})
                        </span>
                      </div>
                      <div className="text-xs text-campus-text-secondary mt-0.5">
                        CGPA: <span className="font-semibold text-slate-800">{m.cgpa}</span> &bull; Rejections:{" "}
                        <span className="font-semibold text-rose-600">{m.rejectionsCount}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.status === "CRITICAL"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : m.status === "MODERATE"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {/* Readiness & Primary Diagnosis */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-campus-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-campus-text-secondary">Readiness Score</span>
                      <span className="font-bold text-rose-600">{m.readinessScore} / 100</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      Risk Diagnosis: <span className="font-normal text-slate-600">{m.primaryRisk}</span>
                    </div>
                  </div>

                  {/* Active Action */}
                  {m.currentAction && (
                    <div className="mt-3 text-xs text-campus-primary font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-campus-accent" />
                      <span>Current Plan: {m.currentAction}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-campus-text-secondary">
                  <span>Last met: {m.lastMeetingDate || "Never"}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveModalMentee(m)}
                  >
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Modal (PRD FR-I4) */}
        {activeModalMentee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <h3 className="text-lg font-bold text-campus-text-primary">
                  Faculty Mentorship Intervention
                </h3>
                <button
                  onClick={() => setActiveModalMentee(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-1 p-3 rounded-xl bg-slate-50 border border-campus-border">
                <div className="font-bold text-campus-text-primary">
                  Mentee: {activeModalMentee.name} ({activeModalMentee.rollNo})
                </div>
                <div className="text-slate-600">
                  Readiness: {activeModalMentee.readinessScore}/100 &bull; CGPA: {activeModalMentee.cgpa}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-campus-text-primary">
                  Select Intervention Plan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStrategy("1on1")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      strategy === "1on1"
                        ? "border-campus-primary bg-campus-primary/5 font-bold text-campus-primary"
                        : "border-campus-border text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    1-on-1 Counseling
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrategy("bootcamp")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      strategy === "bootcamp"
                        ? "border-campus-primary bg-campus-primary/5 font-bold text-campus-primary"
                        : "border-campus-border text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    DSA Bootcamp
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrategy("portfolio")}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      strategy === "portfolio"
                        ? "border-campus-primary bg-campus-primary/5 font-bold text-campus-primary"
                        : "border-campus-border text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Portfolio Overhaul
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-campus-text-primary mb-1 mt-2">
                    Action Plan & Counseling Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={interventionNote}
                    onChange={(e) => setInterventionNote(e.target.value)}
                    placeholder="e.g. Conducted 30-min deep dive on binary search tree traversal. Student given 5 LeetCode medium targets for Friday review..."
                    className="w-full p-2.5 rounded-lg border border-campus-border text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => setActiveModalMentee(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveIntervention(activeModalMentee.id)}
                >
                  Confirm & Log Action
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
