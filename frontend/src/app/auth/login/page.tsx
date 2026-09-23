"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, PRESET_PERSONAS } from "@/lib/auth-context";
import { UserRole } from "@/types";
import { Button } from "@/components/campuslink";
import {
  Shield,
  GraduationCap,
  Briefcase,
  Users,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Default fallback login as Placement Officer
      login("PLACEMENT_OFFICER");
      router.push("/dashboard/tpo");
    }, 600);
  };

  const handleQuickPersona = (role: UserRole) => {
    login(role);
    if (role === "PLACEMENT_OFFICER") router.push("/dashboard/tpo");
    else if (role === "STUDENT") router.push("/dashboard/student");
    else if (role === "RECRUITER") router.push("/dashboard/recruiter");
    else if (role === "MENTOR") router.push("/dashboard/mentor");
  };

  const personaCards = [
    {
      role: "PLACEMENT_OFFICER" as UserRole,
      title: "Placement Officer (TPO)",
      name: "Dr. Rajesh Sharma",
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      desc: "Full placement command dashboard, drive conflict resolution, and season metrics.",
      badge: "Administrative Authority",
      accent: "hover:border-blue-300",
    },
    {
      role: "STUDENT" as UserRole,
      title: "Student Candidate",
      name: "Aarav Patel (CS '26)",
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      desc: "Personal readiness ring (0-100), AI skill-gap diagnostics, and active job drives.",
      badge: "Employability Profiling",
      accent: "hover:border-emerald-300",
    },
    {
      role: "RECRUITER" as UserRole,
      title: "Recruiting Lead",
      name: "Priya Sen (Microsoft IDC)",
      icon: <Briefcase className="w-5 h-5 text-purple-600" />,
      desc: "Instant JD requirements extraction, pre-screened eligible pools, and candidate scoring.",
      badge: "Hiring Pipeline",
      accent: "hover:border-purple-300",
    },
    {
      role: "MENTOR" as UserRole,
      title: "Faculty Mentor",
      name: "Prof. Anita Desai",
      icon: <Users className="w-5 h-5 text-amber-600" />,
      desc: "At-risk student escalation list (top 20% cohort) and branch-wise placement tracking.",
      badge: "Student Support",
      accent: "hover:border-amber-300",
    },
  ];

  return (
    <div className="min-h-screen bg-campus-bg flex flex-col justify-center py-12 px-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Brand header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-campus-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <span className="text-2xl font-bold tracking-tight text-campus-primary">CampusLink</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
            Sign In to Your Placement Portal
          </h1>
          <p className="mt-2 text-sm text-campus-text-secondary">
            Select a demo role below for 1-click evaluation access, or enter your credentials.
          </p>
        </div>

        {/* 1-Click Quick Demo Personas (PRD Personas) */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-campus-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
              Instant 1-Click Demo Personas (PRD Defined)
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {personaCards.map((p) => (
              <div
                key={p.role}
                onClick={() => handleQuickPersona(p.role)}
                className={`card-squarespace p-5 cursor-pointer border border-campus-border transition-all hover:shadow-md hover:-translate-y-0.5 ${p.accent}`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {p.badge}
                  </span>
                </div>

                <div className="text-base font-bold text-campus-text-primary">{p.name}</div>
                <div className="text-xs font-medium text-campus-primary mb-2">{p.title}</div>
                <p className="text-xs text-campus-text-secondary leading-relaxed mb-4">{p.desc}</p>

                <div className="text-xs font-semibold text-campus-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Sign in as {p.title.split(" ")[0]} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-campus-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-campus-bg px-3 text-campus-text-secondary font-medium">
              Or sign in with email
            </span>
          </div>
        </div>

        {/* Manual Login Form */}
        <div className="card-squarespace max-w-md mx-auto p-6 sm:p-8">
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-campus-text-primary mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@campuslink.edu"
                  className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-campus-border bg-white focus:outline-none focus:ring-2 focus:ring-campus-primary/20 focus:border-campus-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-campus-text-primary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-campus-border bg-white focus:outline-none focus:ring-2 focus:ring-campus-primary/20 focus:border-campus-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
