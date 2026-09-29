import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Users, Calendar } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Squarespace-Inspired High Contrast */}
      <section className="relative bg-white pt-20 pb-24 px-6 border-b border-campus-border">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-campus-border text-xs font-semibold text-campus-primary mb-8 shadow-xs">
            <Sparkles className="w-4 h-4 text-campus-accent" />
            <span>AI-Powered Campus-to-Corporate Placement & Analytics</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-campus-text-primary leading-[1.15] mb-6">
            From Campus to Career — <br className="hidden sm:block" />
            <span className="text-campus-primary">Powered by Explainable AI</span>
          </h1>

          <p className="text-lg md:text-xl text-campus-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Eliminate chaotic spreadsheets, missed drive conflicts, and opaque shortlisting. 
            CampusLink unifies readiness scoring, intelligent recruiter matching, and real-time placement analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard/tpo" className="btn-primary text-base px-6 py-3 w-full sm:w-auto shadow-md">
              Placement Officer Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard/student" className="btn-secondary text-base px-6 py-3 w-full sm:w-auto">
              Student Career Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Strip with Large Editorial Numbers */}
      <section id="metrics" className="bg-campus-bg py-14 px-6 border-b border-campus-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold text-campus-primary mb-1">100%</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-campus-text-secondary">Conflict Detection</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-campus-primary mb-1">&lt; 30s</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-campus-text-secondary">AI Candidate Ranking</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-campus-primary mb-1">4-Tier</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-campus-text-secondary">Readiness Scoring</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-campus-primary mb-1">Top 20%</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-campus-text-secondary">At-Risk Student Alerts</div>
          </div>
        </div>
      </section>

      {/* Role-Based Portals Showcase (Strictly TPO & Student) */}
      <section id="personas" className="py-20 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-campus-text-primary mb-3">
            Two Unified Portals for Campus Placement
          </h2>
          <p className="text-campus-text-secondary text-base">
            Engineered exclusively for College Placement Officers and Graduating Students.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Placement Officer */}
          <div className="card-squarespace flex flex-col justify-between p-8 border border-campus-border hover:shadow-lg transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-campus-primary flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-campus-text-primary mb-3">College Placement Officer (TPO)</h3>
              <p className="text-campus-text-secondary text-sm leading-relaxed mb-6">
                Centralized command center for managing on-campus recruitment drives, automated venue collision detection, verified student candidate eligibility, and batch-wide placement statistics.
              </p>
            </div>
            <Link href="/dashboard/tpo" className="btn-primary text-sm flex items-center justify-center gap-2">
              Launch TPO Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Student */}
          <div className="card-squarespace flex flex-col justify-between p-8 border border-campus-border hover:shadow-lg transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-campus-success flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-campus-text-primary mb-3">Student Placement Portal</h3>
              <p className="text-campus-text-secondary text-sm leading-relaxed mb-6">
                Personalized employability readiness index (0–100), transparent skill-gap diagnostics, real-time tracking of eligible placement drives, and application status.
              </p>
            </div>
            <Link href="/dashboard/student" className="btn-secondary text-sm flex items-center justify-center gap-2">
              Launch Student Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-campus-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-campus-text-secondary">
          <div>
            &copy; 2026 CampusLink (CampToCorp). Inspired by Squarespace design principles.
          </div>
          <div className="flex gap-6">
            <span>Next.js 14</span>
            <span>FastAPI</span>
            <span>PostgreSQL + pgvector</span>
            <span>Sentence-Transformers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
