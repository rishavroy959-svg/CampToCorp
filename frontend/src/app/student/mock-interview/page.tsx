"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ReadinessRing,
  SkillTag,
  Button,
  StatusPill,
  KPICard,
} from "@/components/camptocorp";
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
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute top-72 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Top Header Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>AI Career Preparation</span>
                <span>/</span>
                <span>Mock Interview & Resume Skill Diagnostic</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                AI Technical Interview Diagnostic
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Simulate role-specific technical rounds, evaluate architectural depth, and boost your Employability Readiness Index.
              </p>
            </div>

            <Link
              href="/dashboard/student"
              className="px-4 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>&larr; Back to Readiness Portal</span>
            </Link>
          </div>
        </div>

        {/* Target Requisition Selector */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
              G
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Simulating Campus Placement Drive
              </div>
              <div className="text-base font-black text-slate-900">
                Google Cloud &bull; Site Reliability Engineer (32.0 LPA)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Select Question:</span>
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestionIndex(idx);
                  setUserAnswer(questions[idx].sampleAnswer);
                  setEvaluationResult(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedQuestionIndex === idx
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25"
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
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 space-y-5 lg:col-span-2 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  {currentQ.type}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Question {selectedQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {currentQ.question}
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-800">
                  Your Technical Response:
                </label>
                <span className="text-slate-400 font-mono font-medium">
                  {userAnswer.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                rows={6}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your structured technical explanation here..."
                className="w-full p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 focus:bg-white text-xs leading-relaxed focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setUserAnswer(currentQ.sampleAnswer)}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Fill Suggested Answer</span>
              </button>

              <button
                type="button"
                onClick={handleEvaluateAnswer}
                disabled={isEvaluating || !userAnswer.trim()}
                className="btn-gradient text-xs py-2.5 px-5 font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isEvaluating ? "Analyzing Technical Depth..." : "Evaluate with AI Engine"}</span>
              </button>
            </div>
          </div>

          {/* Quick Readiness Score Impact Preview */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 mb-1">
                Readiness Score Impact
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Mock interview evaluations contribute 15% to your overall campus readiness index.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Current Mock Score:</span>
                  <span className="font-bold text-indigo-700">85 / 100</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Predicted Score:</span>
                  <span className="font-black text-emerald-600">
                    {evaluationResult ? "90.4 / 100 (+5.4)" : "Awaiting Evaluation..."}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-200 pt-2.5">
                  <span className="font-bold text-slate-800">Target Employability:</span>
                  <span className="font-black text-emerald-700">Tier 1 (Super Dream)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Demonstrating clear system failure recovery boosts your recruiter shortlisting probability by <strong className="font-bold text-indigo-900">28%</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* AI Evaluation Result Card */}
        {evaluationResult && (
          <div className="rounded-3xl p-6 sm:p-7 space-y-6 border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 shadow-md animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100/90 pb-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    AI Diagnostic Evaluation: Passed (Senior Benchmark)
                  </h3>
                  <span className="text-xs text-emerald-800 font-bold">
                    Overall Interview Rating: {evaluationResult.overallScore}% ({evaluationResult.readinessDelta})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  Technical Depth: <span className="text-indigo-600 font-black">{evaluationResult.technicalScore}%</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                  Communication: <span className="text-emerald-700 font-black">{evaluationResult.communicationScore}%</span>
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
        <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                AI Resume Parser & Skill Extractor
              </h3>
              <p className="text-xs text-slate-500">
                Instantly extract verified technical entities and calculate employability readiness points.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Resume Plaintext Content:
            </label>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 focus:bg-white text-xs font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-500">
              Parses against 100+ technology ontology families (Languages, DevOps, Databases, Cloud).
            </span>

            <button
              type="button"
              onClick={handleParseResume}
              className="btn-gradient text-xs py-2 px-5 font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Extract Skills & Boost Score</span>
            </button>
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
