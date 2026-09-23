"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KPICard,
  SkillTag,
  Button,
  StatusPill,
} from "@/components/campuslink";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Sliders,
  Sparkles,
  Download,
  Filter,
  ArrowRight,
  Send,
  Building,
  Calendar,
} from "lucide-react";

interface Candidate {
  id: number;
  rank: number;
  name: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  fitScore: number;
  skillsMatched: string[];
  skillsMissing: string[];
  invited: boolean;
}

export default function RecruiterDashboardPage() {
  const [skillWeight, setSkillWeight] = useState(50);
  const [cgpaWeight, setCgpaWeight] = useState(20);
  const [assessmentWeight, setAssessmentWeight] = useState(15);
  const [projectWeight, setProjectWeight] = useState(15);

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 1,
      rank: 1,
      name: "Aarav Patel",
      rollNo: "22CS014",
      branch: "CSE",
      cgpa: 8.8,
      fitScore: 94,
      skillsMatched: ["Python", "FastAPI", "Docker", "PostgreSQL"],
      skillsMissing: ["Kafka"],
      invited: true,
    },
    {
      id: 2,
      rank: 2,
      name: "Divya Krishnan",
      rollNo: "22IT008",
      branch: "IT",
      cgpa: 9.1,
      fitScore: 92,
      skillsMatched: ["Python", "Kubernetes", "Linux", "Docker"],
      skillsMissing: ["Go"],
      invited: true,
    },
    {
      id: 3,
      rank: 3,
      name: "Rahul Verma",
      rollNo: "22CS032",
      branch: "CSE",
      cgpa: 8.4,
      fitScore: 89,
      skillsMatched: ["FastAPI", "Docker", "PostgreSQL", "Redis"],
      skillsMissing: ["Kubernetes", "Terraform"],
      invited: false,
    },
    {
      id: 4,
      rank: 4,
      name: "Meera Nair",
      rollNo: "22EC019",
      branch: "ECE",
      cgpa: 8.6,
      fitScore: 86,
      skillsMatched: ["Python", "Linux", "C++"],
      skillsMissing: ["Distributed Systems", "Cloud"],
      invited: false,
    },
    {
      id: 5,
      rank: 5,
      name: "Aditya Roy",
      rollNo: "22CS095",
      branch: "CSE",
      cgpa: 8.2,
      fitScore: 83,
      skillsMatched: ["Docker", "PostgreSQL", "FastAPI"],
      skillsMissing: ["Microservices", "CI/CD"],
      invited: false,
    },
  ]);

  const handleInvite = (id: number) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, invited: true } : c))
    );
  };

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>Corporate Recruiter Portal</span>
              <span>/</span>
              <span>Google Cloud Hiring Workspace (PRD Module D)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              Site Reliability Engineer (Campus 2026)
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              Recruiter: Priya Sen &bull; CTC: <span className="font-bold text-campus-primary">32.0 LPA</span> &bull; Venue: Auditorium Hall A
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/matching">
              <Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4" />}>
                Open Full AI Matcher
              </Button>
            </Link>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <KPICard
            title="Total Applicants"
            metric="142 Candidates"
            subtitle="Campus Batch 2026"
            icon={<Users className="w-5 h-5 text-campus-primary" />}
          />
          <KPICard
            title="Criteria Eligible"
            metric="48 Students"
            subtitle="CGPA ≥ 8.0, 0 Backlogs"
            variant="success"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          />
          <KPICard
            title="Shortlisted Pool"
            metric="24 Students"
            subtitle="Top Ranked by AI Fit"
            icon={<Sparkles className="w-5 h-5 text-purple-600" />}
          />
          <KPICard
            title="Interview Slots"
            metric="8 Panels"
            subtitle="Oct 18, 2026 (Full Day)"
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
          />
        </div>

        {/* Custom Weightage Slider Box & Funnel Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Weight Tuner (PRD FR-D2) */}
          <div className="card-squarespace p-6 space-y-5 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-campus-accent" />
              <h2 className="text-base font-bold text-campus-text-primary">
                Candidate Scoring Weights
              </h2>
            </div>
            <p className="text-xs text-campus-text-secondary">
              Tune AI ranking priority for your technical requisition in real-time.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Technical Skills Match</span>
                  <span className="text-campus-primary font-bold">{skillWeight}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="70"
                  value={skillWeight}
                  onChange={(e) => setSkillWeight(Number(e.target.value))}
                  className="w-full accent-campus-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Academic CGPA</span>
                  <span className="text-campus-primary font-bold">{cgpaWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={cgpaWeight}
                  onChange={(e) => setCgpaWeight(Number(e.target.value))}
                  className="w-full accent-campus-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Mock Assessments</span>
                  <span className="text-campus-primary font-bold">{assessmentWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={assessmentWeight}
                  onChange={(e) => setAssessmentWeight(Number(e.target.value))}
                  className="w-full accent-campus-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>GitHub & Practical Projects</span>
                  <span className="text-campus-primary font-bold">{projectWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={projectWeight}
                  onChange={(e) => setProjectWeight(Number(e.target.value))}
                  className="w-full accent-campus-primary cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                <span>Total Weight:</span>
                <span className="font-bold text-campus-text-primary">
                  {skillWeight + cgpaWeight + assessmentWeight + projectWeight}%
                </span>
              </div>
            </div>
          </div>

          {/* Hiring Funnel & Pipeline Overview */}
          <div className="card-squarespace p-6 space-y-6 lg:col-span-2">
            <div>
              <h2 className="text-base font-bold text-campus-text-primary">
                Application Pipeline Funnel
              </h2>
              <p className="text-xs text-campus-text-secondary mt-0.5">
                Conversion stages from campus applicant pool to confirmed offers.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-xs font-semibold text-slate-600">Total Applied</span>
                <div className="text-2xl font-extrabold text-slate-800 mt-1">142</div>
                <span className="text-[11px] text-slate-500">100% Cohort</span>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-center">
                <span className="text-xs font-semibold text-blue-700">Eligible</span>
                <div className="text-2xl font-extrabold text-blue-700 mt-1">48</div>
                <span className="text-[11px] text-blue-600">33.8% Pass Filter</span>
              </div>

              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 text-center">
                <span className="text-xs font-semibold text-purple-700">Shortlisted</span>
                <div className="text-2xl font-extrabold text-purple-700 mt-1">24</div>
                <span className="text-[11px] text-purple-600">16.9% Selected</span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
                <span className="text-xs font-semibold text-emerald-700">Target Offers</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">4</div>
                <span className="text-[11px] text-emerald-600">2.8% Conversion</span>
              </div>
            </div>

            {/* Requisition Meta */}
            <div className="p-4 rounded-xl border border-campus-border bg-slate-50/50 space-y-2 text-xs">
              <div className="font-bold text-campus-text-primary">Requisition Specs:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-campus-text-secondary">
                <div>&bull; Min CGPA: <span className="font-semibold text-slate-800">8.0</span></div>
                <div>&bull; Max Backlogs: <span className="font-semibold text-slate-800">0</span></div>
                <div>&bull; Branches: <span className="font-semibold text-slate-800">CSE, IT, ECE</span></div>
                <div>&bull; Mandatory Skills: <span className="font-semibold text-slate-800">Python, Docker</span></div>
                <div>&bull; Interview Panels: <span className="font-semibold text-slate-800">4 Panels</span></div>
                <div>&bull; Slot: <span className="font-semibold text-slate-800">FULL_DAY</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranked Candidate Shortlist */}
        <div className="card-squarespace p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-campus-text-primary">
                Ranked Candidate Shortlist Preview
              </h2>
              <p className="text-xs text-campus-text-secondary mt-0.5">
                Automatically evaluated and ranked based on current requisition parameters.
              </p>
            </div>

            <Link href="/matching">
              <Button variant="secondary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                View Full AI Explainability & SHAP Factors
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-4 rounded-xl border border-campus-border bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-campus-primary/10 flex items-center justify-center font-extrabold text-campus-primary text-sm shrink-0">
                    #{cand.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-campus-text-primary">{cand.name}</span>
                      <span className="text-xs font-mono text-campus-text-secondary">
                        ({cand.rollNo})
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cand.fitScore}% Fit
                      </span>
                    </div>

                    <div className="text-xs text-campus-text-secondary mt-0.5">
                      {cand.branch} &bull; CGPA: <span className="font-semibold text-slate-800">{cand.cgpa}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {cand.skillsMatched.map((s) => (
                        <SkillTag key={s} name={s} state="matched" />
                      ))}
                      {cand.skillsMissing.map((s) => (
                        <SkillTag key={s} name={s} state="missing" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {cand.invited ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Interview Invited
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleInvite(cand.id)}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Invite to Tech Round
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
