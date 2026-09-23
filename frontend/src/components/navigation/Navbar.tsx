"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, PRESET_PERSONAS } from "@/lib/auth-context";
import { UserRole } from "@/types";
import {
  ChevronDown,
  User,
  Shield,
  GraduationCap,
  Briefcase,
  Users,
  LogOut,
  Sparkles,
  Bell,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setDropdownOpen(false);

    // Redirect to corresponding dashboard
    if (role === "PLACEMENT_OFFICER") router.push("/dashboard/tpo");
    else if (role === "STUDENT") router.push("/dashboard/student");
    else if (role === "RECRUITER") router.push("/dashboard/recruiter");
    else if (role === "MENTOR") router.push("/dashboard/mentor");
  };

  const roleMeta: Record<
    UserRole,
    { label: string; icon: React.ReactNode; color: string; badgeColor: string }
  > = {
    PLACEMENT_OFFICER: {
      label: "Placement Officer",
      icon: <Shield className="w-3.5 h-3.5 text-blue-600" />,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      badgeColor: "bg-blue-600",
    },
    STUDENT: {
      label: "Student",
      icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      badgeColor: "bg-emerald-600",
    },
    RECRUITER: {
      label: "Recruiter",
      icon: <Briefcase className="w-3.5 h-3.5 text-purple-600" />,
      color: "text-purple-700 bg-purple-50 border-purple-200",
      badgeColor: "bg-purple-600",
    },
    MENTOR: {
      label: "Faculty Mentor",
      icon: <Users className="w-3.5 h-3.5 text-amber-600" />,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      badgeColor: "bg-amber-600",
    },
  };

  const currentRole = user?.role || "PLACEMENT_OFFICER";
  const currentMeta = roleMeta[currentRole];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-campus-border px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-campus-primary flex items-center justify-center text-white font-bold text-base shadow-xs">
              C
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold tracking-tight text-campus-primary">CampusLink</span>
              <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full bg-slate-100 text-campus-text-secondary font-medium border border-campus-border">
                CampToCorp
              </span>
            </div>
          </Link>

          {/* Role-specific Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-campus-text-secondary">
            {currentRole === "PLACEMENT_OFFICER" && (
              <>
                <Link
                  href="/dashboard/tpo"
                  className={`hover:text-campus-primary transition-colors ${
                    pathname === "/dashboard/tpo" ? "text-campus-primary font-semibold" : ""
                  }`}
                >
                  Command Center
                </Link>
                <Link
                  href="/drives"
                  className={`hover:text-campus-primary transition-colors ${
                    pathname.startsWith("/drives") ? "text-campus-primary font-semibold" : ""
                  }`}
                >
                  Drives & Schedule
                </Link>
                <Link
                  href="/matching"
                  className={`hover:text-campus-primary transition-colors ${
                    pathname === "/matching" ? "text-campus-primary font-semibold" : ""
                  }`}
                >
                  AI Shortlisting
                </Link>
                <Link
                  href="/analytics"
                  className={`hover:text-campus-primary transition-colors ${
                    pathname === "/analytics" ? "text-campus-primary font-semibold" : ""
                  }`}
                >
                  Analytics & At-Risk
                </Link>
              </>
            )}

            {currentRole === "STUDENT" && (
              <>
                <Link
                  href="/dashboard/student"
                  className={`hover:text-campus-primary transition-colors ${
                    pathname === "/dashboard/student" ? "text-campus-primary font-semibold" : ""
                  }`}
                >
                  My Readiness
                </Link>
                <Link
                  href="/student/drives"
                  className="hover:text-campus-primary transition-colors"
                >
                  Eligible Drives
                </Link>
                <Link
                  href="/student/applications"
                  className="hover:text-campus-primary transition-colors"
                >
                  Offers & Status
                </Link>
              </>
            )}

            {currentRole === "RECRUITER" && (
              <>
                <Link
                  href="/dashboard/recruiter"
                  className="hover:text-campus-primary transition-colors text-campus-primary font-semibold"
                >
                  Job Openings
                </Link>
                <Link
                  href="/matching"
                  className="hover:text-campus-primary transition-colors"
                >
                  Ranked Candidates
                </Link>
              </>
            )}

            {currentRole === "MENTOR" && (
              <>
                <Link
                  href="/dashboard/mentor"
                  className="hover:text-campus-primary transition-colors text-campus-primary font-semibold"
                >
                  At-Risk Students
                </Link>
                <Link
                  href="/analytics"
                  className="hover:text-campus-primary transition-colors"
                >
                  Department Conversion
                </Link>
              </>
            )}

            <Link
              href="/design-system"
              className="hover:text-campus-primary transition-colors text-campus-accent font-medium text-xs border border-campus-border rounded-md px-2 py-0.5"
            >
              Design Tokens
            </Link>
          </nav>
        </div>

        {/* Right Action Icons: Notification Center & Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl border border-campus-border bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4 text-campus-text-primary" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-campus-border py-2 z-50 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-campus-text-primary">
                    Placement Alerts (PRD Area 6)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                    3 New
                  </span>
                </div>

                <div className="p-1 space-y-1 max-h-72 overflow-y-auto">
                  <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 hover:bg-rose-50 transition-colors text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      Drive Schedule Collision
                    </div>
                    <p className="text-[11px] text-rose-700">
                      Google Cloud & AWS double-booked Auditorium Hall A on Oct 18.
                    </p>
                    <Link
                      href="/drives"
                      onClick={() => setNotifOpen(false)}
                      className="text-[10px] font-bold text-rose-800 underline block pt-0.5"
                    >
                      Resolve in Conflict Engine &rarr;
                    </Link>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      Candidate Shortlist Ready
                    </div>
                    <p className="text-[11px] text-blue-700">
                      AI ranker scored 48 eligible candidates for Google Cloud SRE drive.
                    </p>
                    <Link
                      href="/matching"
                      onClick={() => setNotifOpen(false)}
                      className="text-[10px] font-bold text-blue-800 underline block pt-0.5"
                    >
                      View Ranked Pool &rarr;
                    </Link>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-colors text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      At-Risk Student Escalation
                    </div>
                    <p className="text-[11px] text-amber-700">
                      4 candidates flagged with readiness score &lt; 40 points.
                    </p>
                    <Link
                      href="/dashboard/tpo"
                      onClick={() => setNotifOpen(false)}
                      className="text-[10px] font-bold text-amber-800 underline block pt-0.5"
                    >
                      Assign Faculty Mentors &rarr;
                    </Link>
                  </div>
                </div>

                <div className="border-t border-slate-100 px-3 py-1.5 text-center">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Automated Placement Notification Engine
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Persona Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-campus-border bg-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-campus-primary/10 flex items-center justify-center text-campus-primary font-semibold text-xs">
                {user ? user.fullName[0] : "U"}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-campus-text-primary leading-tight">
                  {user?.fullName || "Guest User"}
                </div>
                <div className="text-[10px] text-campus-text-secondary flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentMeta.badgeColor}`} />
                  {currentMeta.label}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-campus-text-secondary ml-1" />
            </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-campus-border py-2 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-campus-text-secondary">
                  Switch Persona (Quick Demo)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Simulate any of the 4 PRD stakeholder views
                </div>
              </div>

              <div className="p-1.5 space-y-1">
                {(Object.keys(PRESET_PERSONAS) as UserRole[]).map((r) => {
                  const p = PRESET_PERSONAS[r];
                  const m = roleMeta[r];
                  const isCurrent = user?.role === r;

                  return (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? "bg-slate-100 font-semibold text-campus-primary"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {m.icon}
                        <div>
                          <div>{p.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{m.label}</div>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] bg-campus-primary text-white px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 p-1.5 mt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In with Different Account
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                    router.push("/auth/login");
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
);
};
