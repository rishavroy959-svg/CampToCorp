"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ReadinessRing,
  SkillTag,
  StatusPill,
  Button,
  KPICard,
} from "@/components/campuslink";
import {
  GraduationCap,
  Sparkles,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  BookOpen,
  FileCheck,
  ChevronRight,
} from "lucide-react";

export default function StudentDashboardPage() {
  const [registeredDrives, setRegisteredDrives] = useState<number[]>([1, 2]);

  const handleRegister = (id: number) => {
    if (!registeredDrives.includes(id)) {
      setRegisteredDrives([...registeredDrives, id]);
    }
  };

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Student Career Portal</span>
              <span>/</span>
              <span>Employability & Readiness (PRD Module B)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              Welcome back, Aarav Patel
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              B.Tech Computer Science &bull; 7th Semester &bull; Roll: 22CS014 &bull; CGPA: 8.8 / 10
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Placement Eligible (0 Backlogs)
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<BookOpen className="w-4 h-4" />}
            >
              Update Resume
            </Button>
          </div>
        </div>

        {/* Hero Section: Circular Readiness Ring & Factor Meters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual: Readiness Ring */}
          <div className="card-squarespace p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                AI Composite Readiness Index
              </span>
              <h2 className="text-lg font-bold text-campus-text-primary">
                Employability Status
              </h2>
            </div>

            <ReadinessRing score={88} size={170} strokeWidth={12} showLabel={true} />

            <p className="text-xs text-campus-text-secondary max-w-xs">
              Your profile ranks in the <span className="font-bold text-emerald-700">Top 8%</span> of the graduating cohort. You qualify for Super Dream drives (&gt;20 LPA).
            </p>
          </div>

          {/* Factor Breakdown Meters (PRD FR-B2) */}
          <div className="card-squarespace p-6 space-y-4 lg:col-span-2">
            <div>
              <h3 className="text-base font-bold text-campus-text-primary">
                Employability Factor Breakdown
              </h3>
              <p className="text-xs text-campus-text-secondary mt-0.5">
                Composite evaluation formula: 50% Verified Skills, 20% Academic CGPA, 15% Assessments, 15% Projects.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-campus-text-primary">
                    Verified Core Skills Match (50% Weight)
                  </span>
                  <span className="font-bold text-campus-primary">94 / 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-campus-primary h-2 rounded-full" style={{ width: "94%" }} />
                </div>
                <span className="text-[11px] text-campus-text-secondary mt-1 block">
                  Strong mastery in Python, FastAPI, Docker, and PostgreSQL.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-campus-text-primary">
                    Academic CGPA & Consistency (20% Weight)
                  </span>
                  <span className="font-bold text-campus-primary">88 / 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-campus-primary h-2 rounded-full" style={{ width: "88%" }} />
                </div>
                <span className="text-[11px] text-campus-text-secondary mt-1 block">
                  8.8 CGPA exceeds the 8.0 Super Dream threshold.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-campus-text-primary">
                    Mock Assessment & Problem Solving (15% Weight)
                  </span>
                  <span className="font-bold text-campus-primary">82 / 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-campus-primary h-2 rounded-full" style={{ width: "82%" }} />
                </div>
                <span className="text-[11px] text-campus-text-secondary mt-1 block">
                  Scored in 92nd percentile on campus Data Structures & Algorithms diagnostic.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-campus-text-primary">
                    GitHub Projects & Production Experience (15% Weight)
                  </span>
                  <span className="font-bold text-campus-primary">88 / 100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-campus-primary h-2 rounded-full" style={{ width: "88%" }} />
                </div>
                <span className="text-[11px] text-campus-text-secondary mt-1 block">
                  3 verified full-stack repositories with CI/CD and unit tests.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Skill Diagnostic & Targeted Sprint (PRD FR-B3, FR-B4) */}
        <div className="card-squarespace p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-campus-accent" />
                <h2 className="text-xl font-bold text-campus-text-primary">
                  AI Skill Diagnostic & Target Roadmap
                </h2>
              </div>
              <p className="text-xs text-campus-text-secondary mt-1">
                Real-time ontology mapping against active placement job descriptions.
              </p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-campus-text-secondary font-medium">
              Target Tier: Tier 1 Super Dream (&gt;25 LPA)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Verified Matched Skills */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Verified Match (High Confidence)
              </span>
              <div className="flex flex-wrap gap-2">
                <SkillTag name="Python" state="matched" />
                <SkillTag name="FastAPI" state="matched" />
                <SkillTag name="PostgreSQL" state="matched" />
                <SkillTag name="Docker" state="matched" />
                <SkillTag name="React" state="matched" />
                <SkillTag name="Git" state="matched" />
              </div>
            </div>

            {/* Emerging Skills */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Emerging / Partial Match
              </span>
              <div className="flex flex-wrap gap-2">
                <SkillTag name="Kubernetes" state="partial" />
                <SkillTag name="AWS Lambda" state="partial" />
                <SkillTag name="Redis" state="partial" />
              </div>
            </div>

            {/* High-Impact Gaps */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Recommended Upskill Gaps
              </span>
              <div className="flex flex-wrap gap-2">
                <SkillTag name="Apache Kafka" state="missing" />
                <SkillTag name="System Design" state="missing" />
                <SkillTag name="Distributed Caching" state="missing" />
              </div>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 space-y-1">
              <div className="font-bold">AI Remedial Pathway:</div>
              <p>
                Complete the 14-day hands-on <span className="font-semibold underline">Apache Kafka & Event-Driven Architecture</span> module. This single skill upgrade increases your shortlist fit score for the upcoming <span className="font-bold">Google Cloud SRE</span> drive from 84% to 94%.
              </p>
            </div>
          </div>
        </div>

        {/* Eligible Recruitment Drives & Application Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-campus-text-primary">
              Eligible Recruitment Drives
            </h2>
            <span className="text-xs text-campus-text-secondary">
              Sorted by AI Profile Fit Score
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 1,
                company: "Google Cloud",
                role: "Site Reliability Engineer",
                ctc: 32.0,
                fitScore: 94,
                date: "2026-10-18",
                slot: "FULL_DAY",
                venue: "Auditorium Hall A",
                status: "Shortlisted for Tech Round 1",
                isShortlisted: true,
              },
              {
                id: 2,
                company: "Microsoft IDC",
                role: "Cloud Software Engineer",
                ctc: 28.5,
                fitScore: 91,
                date: "2026-10-15",
                slot: "FULL_DAY",
                venue: "Auditorium Hall A",
                status: "Coding Assessment Scheduled",
                isShortlisted: true,
              },
              {
                id: 3,
                company: "Amazon Web Services",
                role: "Cloud Support Associate",
                ctc: 22.0,
                fitScore: 86,
                date: "2026-10-18",
                slot: "FULL_DAY",
                venue: "CS Lab Complex 1",
                status: "Registration Open",
                isShortlisted: false,
              },
            ].map((drive) => (
              <div
                key={drive.id}
                className="card-squarespace p-5 border border-campus-border hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-campus-primary text-base border border-slate-200">
                      {drive.company[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-base text-campus-text-primary">
                          {drive.company}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {drive.fitScore}% Fit
                        </span>
                      </div>
                      <div className="text-xs text-campus-primary font-medium mt-0.5">
                        {drive.role} &bull; <span className="font-bold">{drive.ctc} LPA</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-campus-text-secondary mt-2">
                        <span>Date: {drive.date}</span>
                        <span>&bull;</span>
                        <span>{drive.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700 block">
                        {drive.status}
                      </span>
                    </div>

                    {registeredDrives.includes(drive.id) ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Registered
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRegister(drive.id)}
                      >
                        Apply / Register
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Pre-Placement Offer (PPO) Card */}
        <div className="card-squarespace p-6 border border-emerald-300 bg-emerald-50/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold">Active Offer on Record</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
              Verified PPO
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="text-base font-bold text-campus-text-primary">
                Cisco Systems &bull; Associate Software Engineer
              </div>
              <div className="text-xs text-campus-text-secondary mt-0.5">
                Offered CTC: <span className="font-bold text-campus-text-primary">18.0 LPA</span> &bull; Base: 14.5 LPA &bull; Stocks: 3.5 LPA &bull; Joining: July 2027
              </div>
            </div>

            <Button variant="outline" size="sm" icon={<FileCheck className="w-4 h-4" />}>
              View Offer Letter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
