"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ReadinessRing,
  SkillTag,
  ExplainabilityCard,
  StatusPill,
  KPICard,
  Button,
} from "@/components/campuslink";
import { ArrowLeft, Users, Calendar, Award, AlertTriangle } from "lucide-react";

export default function DesignSystemPage() {
  const [demoScore, setDemoScore] = useState<number>(78);

  return (
    <div className="min-h-screen bg-campus-bg py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-campus-border pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-campus-primary hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              CampusLink Design System & Component Library
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              Inspired by Squarespace principles — High Contrast, Editorial Typography, and Explainable AI.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-mono bg-white px-3 py-1.5 rounded-md border border-campus-border text-campus-text-secondary">
              Design Doc v1.0
            </span>
          </div>
        </div>

        {/* Section 1: Color Palette & Tokens */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-campus-text-primary">1. Color Tokens</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <div className="card-squarespace p-3 text-center">
              <div className="h-12 w-full rounded-md bg-[#1B4F72] mb-2 shadow-xs" />
              <div className="text-xs font-bold text-campus-text-primary">Primary</div>
              <div className="text-[11px] font-mono text-campus-text-secondary">#1B4F72</div>
            </div>
            <div className="card-squarespace p-3 text-center">
              <div className="h-12 w-full rounded-md bg-[#2874A6] mb-2 shadow-xs" />
              <div className="text-xs font-bold text-campus-text-primary">Primary Hover</div>
              <div className="text-[11px] font-mono text-campus-text-secondary">#2874A6</div>
            </div>
            <div className="card-squarespace p-3 text-center">
              <div className="h-12 w-full rounded-md bg-[#3498DB] mb-2 shadow-xs" />
              <div className="text-xs font-bold text-campus-text-primary">Accent</div>
              <div className="text-[11px] font-mono text-campus-text-secondary">#3498DB</div>
            </div>
            <div className="card-squarespace p-3 text-center">
              <div className="h-12 w-full rounded-md bg-[#16A34A] mb-2 shadow-xs" />
              <div className="text-xs font-bold text-campus-text-primary">Success (86-100)</div>
              <div className="text-[11px] font-mono text-campus-text-secondary">#16A34A</div>
            </div>
            <div className="card-squarespace p-3 text-center">
              <div className="h-12 w-full rounded-md bg-[#D97706] mb-2 shadow-xs" />
              <div className="text-xs font-bold text-campus-text-primary">Warning (41-70)</div>
              <div className="text-[11px] font-mono text-campus-text-secondary">#D97706</div>
            </div>
            <div className="card-squarespace p-3 text-center">
              <div className="h-12 w-full rounded-md bg-[#DC2626] mb-2 shadow-xs" />
              <div className="text-xs font-bold text-campus-text-primary">Danger (0-40)</div>
              <div className="text-[11px] font-mono text-campus-text-secondary">#DC2626</div>
            </div>
          </div>
        </section>

        {/* Section 2: Circular Readiness Rings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-campus-text-primary">
                2. Circular Readiness Rings (4-Tier Employability Model)
              </h2>
              <p className="text-xs text-campus-text-secondary">
                Maps scores directly to Not Ready, Developing, Ready, and Highly Employable tiers.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-campus-border">
              <span className="text-xs font-medium text-campus-text-secondary">Interactive slider:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={demoScore}
                onChange={(e) => setDemoScore(Number(e.target.value))}
                className="w-32 cursor-pointer"
              />
              <span className="text-xs font-bold text-campus-primary w-8">{demoScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 card-squarespace">
            <div className="flex flex-col items-center">
              <ReadinessRing score={32} size={110} />
              <span className="text-[11px] text-campus-text-secondary mt-2">Score 32 (Tier 1)</span>
            </div>
            <div className="flex flex-col items-center">
              <ReadinessRing score={58} size={110} />
              <span className="text-[11px] text-campus-text-secondary mt-2">Score 58 (Tier 2)</span>
            </div>
            <div className="flex flex-col items-center">
              <ReadinessRing score={78} size={110} />
              <span className="text-[11px] text-campus-text-secondary mt-2">Score 78 (Tier 3)</span>
            </div>
            <div className="flex flex-col items-center">
              <ReadinessRing score={94} size={110} />
              <span className="text-[11px] text-campus-text-secondary mt-2">Score 94 (Tier 4)</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100 pl-4">
              <ReadinessRing score={demoScore} size={120} />
              <span className="text-[11px] font-semibold text-campus-primary mt-2">Live Demo</span>
            </div>
          </div>
        </section>

        {/* Section 3: Explainability Cards */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-campus-text-primary">
              3. Explainability Card (Non-Negotiable AI Justification)
            </h2>
            <p className="text-xs text-campus-text-secondary">
              Natural-language explanation paired with contributing feature factors and placement officer overrides.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ExplainabilityCard
              title="Recruiter Fit Recommendation (Cloud Engineer)"
              confidenceScore={0.88}
              explanation="Matched: Candidate meets the CGPA criteria (8.4/10) and exhibits strong proficiency in Python and Docker. However, a slight skill gap in AWS cloud architecture was observed compared to benchmark requirements."
              factors={[
                { factor: "CGPA (8.4)", impact: "positive", detail: "Exceeds 7.5 threshold" },
                { factor: "Docker & Python", impact: "positive", detail: "Exact semantic skill match" },
                { factor: "AWS Cloud", impact: "negative", detail: "Missing certification/project" },
                { factor: "Mock Interview", impact: "positive", detail: "88/100 communication score" },
              ]}
              overrideAllowed={true}
              onOverride={() => alert("Officer override modal opened with audit logging.")}
            />

            <ExplainabilityCard
              title="Readiness Diagnostic (Student Portal)"
              explanation="Below Threshold: Your overall readiness is Developing (58/100). While your academic fundamentals and Data Structures are solid, you lack mock-interview experience and real-world project deployments."
              factors={[
                { factor: "Data Structures", impact: "positive", detail: "High aptitude benchmark" },
                { factor: "Mock Assessment", impact: "negative", detail: "Completed 0 of 2 required" },
                { factor: "Portfolio Projects", impact: "negative", detail: "Only 1 verified repository" },
              ]}
              overrideAllowed={false}
            />
          </div>
        </section>

        {/* Section 4: Skill Tags & Status Pills */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-campus-text-primary">
            4. Skill Match Tags & Semantic Status Pills
          </h2>
          <div className="card-squarespace space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary mb-3">
                Skill Match Tags (3-State Validation)
              </div>
              <div className="flex flex-wrap gap-2.5">
                <SkillTag name="Python" status="matched" />
                <SkillTag name="FastAPI" status="matched" />
                <SkillTag name="PostgreSQL" status="matched" />
                <SkillTag name="Docker" status="partial" />
                <SkillTag name="Kubernetes" status="partial" />
                <SkillTag name="AWS Lambda" status="missing" />
                <SkillTag name="GraphQL" status="missing" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary mb-3">
                Semantic Status Pills
              </div>
              <div className="flex flex-wrap gap-3">
                <StatusPill label="Offer Accepted" variant="success" />
                <StatusPill label="Pending Verification" variant="warning" />
                <StatusPill label="Schedule Conflict" variant="danger" />
                <StatusPill label="Drive Active" variant="info" />
                <StatusPill label="Documentation Complete" variant="primary" />
                <StatusPill label="Unplaced" variant="neutral" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: KPI Stat Cards & Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-campus-text-primary">
            5. KPI Stat Cards & Squarespace Buttons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <KPICard
              title="Students Ready"
              metric="428"
              subtitle="78% of registered cohort"
              trend={{ value: "+12% this week", isPositive: true }}
              icon={<Users className="w-5 h-5" />}
            />
            <KPICard
              title="Active Drives"
              metric="6"
              subtitle="0 schedule conflicts"
              icon={<Calendar className="w-5 h-5" />}
            />
            <KPICard
              title="Offers Extended"
              metric="184"
              subtitle="Avg CTC: 12.4 LPA"
              trend={{ value: "+24 vs last year", isPositive: true }}
              icon={<Award className="w-5 h-5" />}
              variant="success"
            />
            <KPICard
              title="At-Risk Cohort"
              metric="42"
              subtitle="Escalated to mentors"
              trend={{ value: "-8 resolved", isPositive: true }}
              icon={<AlertTriangle className="w-5 h-5" />}
              variant="danger"
            />
          </div>

          <div className="card-squarespace flex flex-wrap items-center gap-4 pt-6">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Action</Button>
            <Button variant="primary" isLoading={true}>
              Loading State
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
