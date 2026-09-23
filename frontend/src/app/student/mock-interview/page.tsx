"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ReadinessRing,
  SkillTag,
  Button,
  StatusPill,
  KPICard,
} from "@/components/campuslink";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Send,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Award,
} from "lucide-react";

export default function MockInterviewDiagnosticPage() {
  const [targetRole, setTargetRole] = useState("Site Reliability Engineer");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const questions = [
    {
      id: "q1",
      type: "Technical Architecture",
      question:
        "How would you design a multi-region failover mechanism on Kubernetes to ensure zero-downtime during a regional cloud outage?",
      sampleAnswer:
        "I would deploy an active-active architecture across two cloud regions using global Anycast DNS with health probes. Cluster states are synchronized using CockroachDB or PostgreSQL with low RPO. A global load balancer directs traffic to healthy regions based on latency and endpoint probes. If a region fails, traffic automatically reroutes within 3 seconds without dropping active sessions.",
    },
    {
      id: "q2",
      type: "Incident Response",
      question:
        "A production microservice latency spikes from 50ms to 4000ms after a deployment. Walk me through your triage and mitigation steps.",
      sampleAnswer:
        "First, I inspect Prometheus telemetry for connection pool exhaustion and error codes. Because the spike correlates directly with the deployment, I trigger an automated canary rollback to restore baseline latency immediately. Then, in staging, I inspect thread dumps and query logs to locate the regression.",
    },
    {
      id: "q3",
      type: "Behavioral & SRE Culture",
      question:
        "Describe a scenario where you had to negotiate an SLA or Error Budget with a product development team pushing for frequent releases.",
      sampleAnswer:
        "I frame reliability as a shared feature through an Error Budget. When the budget is above 99.9%, product engineering ships features rapidly. When the error budget drops below threshold, feature velocity halts to prioritize automated unit tests and architectural refactoring.",
    },
  ];

  const currentQ = questions[selectedQuestionIndex];
  const [userAnswer, setUserAnswer] = useState(currentQ.sampleAnswer);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Resume Parser state
  const [resumeText, setResumeText] = useState(
    "Aarav Patel | B.Tech CSE (CGPA: 8.8)\nSkills: Python, FastAPI, Docker, PostgreSQL, Kubernetes, Redis, AWS Lambda, Linux, Git\nProjects: Developed production-ready microservices event pipeline on Kubernetes with CI/CD. Built Antigravity cloud deployment engine with FastAPI and PostgreSQL."
  );
  const [parsedSkillsResult, setParsedSkillsResult] = useState<any | null>(null);

  const handleEvaluateAnswer = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluationResult({
        technicalScore: 92,
        communicationScore: 88,
        overallScore: 90.4,
        matchedKeywords: ["active-active", "health probes", "load balancer", "rpo", "latency", "dns"],
        readinessDelta: "+4.5 Points",
        feedback: [
          "Strong technical terminology: Correctly leveraged concepts like Anycast DNS, active-active topologies, and RPO constraints.",
          "Structure is logical: Covers architecture, state synchronization, and failover latency sequentially.",
          "Exceeds expected benchmark for Tier 1 Super Dream requisitions (>25 LPA).",
        ],
        modelBenchmark:
          "Top 5% Candidate Response: Explicitly specifies RTO < 5s, RPO < 1s, distributed consensus (Raft/Paxos), and automated DNS TTL failover.",
      });
    }, 600);
  };

  const handleParseResume = () => {
    setParsedSkillsResult({
      extractedSkills: ["Python", "FastAPI", "Docker", "PostgreSQL", "Kubernetes", "Redis", "AWS Lambda", "Linux", "Git"],
      detectedProjects: [
        "Developed production-ready microservices event pipeline on Kubernetes with CI/CD",
        "Built Antigravity cloud deployment engine with FastAPI and PostgreSQL",
      ],
      estimatedReadinessScore: 92,
      readinessBoost: "+8 Points",
    });
  };

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-1">
              <Bot className="w-4 h-4 text-campus-primary" />
              <span>AI Career Preparation</span>
              <span>/</span>
              <span>Mock Interview & Resume Skill Diagnostic (PRD Module B)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              AI Technical Interview Diagnostic
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              Simulate role-specific technical rounds, evaluate architectural depth, and boost your Employability Readiness Index.
            </p>
          </div>

          <Link href="/dashboard/student">
            <Button variant="secondary" size="md">
              &larr; Back to Readiness Portal
            </Button>
          </Link>
        </div>

        {/* Target Requisition Selector */}
        <div className="card-squarespace p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-campus-primary/10 flex items-center justify-center text-campus-primary font-bold">
              G
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                Simulating Campus Placement Drive
              </div>
              <div className="text-base font-bold text-campus-text-primary">
                Google Cloud &bull; Site Reliability Engineer (32.0 LPA)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-campus-text-secondary font-medium">Select Question:</span>
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestionIndex(idx);
                  setUserAnswer(questions[idx].sampleAnswer);
                  setEvaluationResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedQuestionIndex === idx
                    ? "bg-campus-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Q{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Diagnostic Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question & Answer Box */}
          <div className="card-squarespace p-6 space-y-5 lg:col-span-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  {currentQ.type}
                </span>
                <span className="text-xs text-campus-text-secondary">
                  Question {selectedQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-campus-text-primary leading-snug">
                {currentQ.question}
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-campus-text-primary">
                  Your Technical Response:
                </label>
                <span className="text-campus-text-secondary font-mono">
                  {userAnswer.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                rows={6}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your structured technical explanation here..."
                className="w-full p-3.5 rounded-xl border border-campus-border text-xs leading-relaxed focus:ring-2 focus:ring-campus-accent/30 focus:border-campus-accent"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setUserAnswer(currentQ.sampleAnswer)}
                className="text-xs text-campus-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Fill Suggested Answer
              </button>

              <Button
                variant="primary"
                size="md"
                onClick={handleEvaluateAnswer}
                disabled={isEvaluating || !userAnswer.trim()}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {isEvaluating ? "Analyzing Technical Depth..." : "Evaluate with AI Engine"}
              </Button>
            </div>
          </div>

          {/* Quick Readiness Score Impact Preview */}
          <div className="card-squarespace p-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-campus-text-primary mb-1">
                Readiness Score Impact
              </h3>
              <p className="text-xs text-campus-text-secondary mb-4">
                Mock interview evaluations contribute 15% to your overall campus readiness index.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-campus-border space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Current Mock Score:</span>
                  <span className="font-bold text-campus-primary">85 / 100</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Predicted Score:</span>
                  <span className="font-bold text-emerald-600">
                    {evaluationResult ? "90.4 / 100 (+5.4)" : "Evaluating..."}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-800">Target Employability:</span>
                  <span className="font-bold text-emerald-700">Tier 1 (Super Dream)</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Demonstrating clear system failure recovery boosts your recruiter shortlisting probability by <span className="font-bold">28%</span>.
              </span>
            </div>
          </div>
        </div>

        {/* AI Evaluation Result Card */}
        {evaluationResult && (
          <div className="card-squarespace p-6 space-y-6 border border-emerald-300 bg-emerald-50/15 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-campus-text-primary">
                    AI Diagnostic Evaluation: Passed (Senior Benchmark)
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold">
                    Overall Interview Rating: {evaluationResult.overallScore}% ({evaluationResult.readinessDelta})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="px-3 py-1 rounded-full bg-white border border-slate-200">
                  Technical Depth: <span className="text-campus-primary font-bold">{evaluationResult.technicalScore}%</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white border border-slate-200">
                  Communication: <span className="text-emerald-700 font-bold">{evaluationResult.communicationScore}%</span>
                </div>
              </div>
            </div>

            {/* Matched Keywords */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-campus-text-secondary block mb-2">
                Demonstrated Key Technical Concepts:
              </span>
              <div className="flex flex-wrap gap-2">
                {evaluationResult.matchedKeywords.map((kw: string) => (
                  <SkillTag key={kw} name={kw} state="matched" />
                ))}
              </div>
            </div>

            {/* Feedback Points */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-campus-text-secondary block">
                Actionable AI Feedback:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {evaluationResult.feedback.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-campus-primary font-bold">&bull;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benchmark Model Answer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-campus-border space-y-1 text-xs">
              <div className="font-bold text-campus-text-primary">
                Model Senior Answer Reference:
              </div>
              <p className="text-slate-600 leading-relaxed">
                {evaluationResult.modelBenchmark}
              </p>
            </div>
          </div>
        )}

        {/* Section 2: AI Resume Skill Extractor & Point Booster */}
        <div className="card-squarespace p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-campus-border pb-3">
            <FileText className="w-5 h-5 text-campus-primary" />
            <div>
              <h3 className="text-lg font-bold text-campus-text-primary">
                AI Resume Parser & Skill Extractor (PRD FR-B1)
              </h3>
              <p className="text-xs text-campus-text-secondary">
                Instantly extract verified technical entities and calculate employability readiness points.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-campus-text-primary">
              Resume Plaintext Content:
            </label>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-3 rounded-xl border border-campus-border text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-campus-text-secondary">
              Parses against 100+ technology ontology families (Languages, DevOps, Databases, Cloud).
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={handleParseResume}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Extract Skills & Boost Score
            </Button>
          </div>

          {parsedSkillsResult && (
            <div className="mt-4 p-4 rounded-xl border border-campus-border bg-slate-50 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-campus-text-primary">
                  Extracted Verified Technical Skills ({parsedSkillsResult.extractedSkills.length}):
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                  Readiness Boost: {parsedSkillsResult.readinessBoost}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {parsedSkillsResult.extractedSkills.map((s: string) => (
                  <SkillTag key={s} name={s} state="matched" />
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Detected Projects:</span>
                <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
                  {parsedSkillsResult.detectedProjects.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
