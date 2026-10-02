"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth, PRESET_PERSONAS, ACTIVE_ROLES } from "@/lib/auth-context";
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

function StudentNavLinks({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const isStudentDashboard = pathname === "/dashboard/student";

  const isOverview = isStudentDashboard && currentTab === "overview";
  const isDrives = (isStudentDashboard && currentTab === "drives") || pathname === "/student/drives";
  const isApplications = (isStudentDashboard && (currentTab === "applications" || currentTab === "offers")) || pathname === "/student/applications";
  const isMockInterview = pathname === "/student/mock-interview";

  return (
    <>
      <Link
        href="/dashboard/student?tab=overview"
        className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center cursor-pointer ${
          isOverview
            ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
            : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
        }`}
      >
        <span>My Readiness</span>
        <span
          className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
            isOverview ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </Link>
      <Link
        href="/dashboard/student?tab=drives"
        className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center cursor-pointer ${
          isDrives
            ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
            : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
        }`}
      >
        <span>Eligible Drives</span>
        <span
          className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
            isDrives ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </Link>
      <Link
        href="/dashboard/student?tab=applications"
        className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center cursor-pointer ${
          isApplications
            ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
            : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
        }`}
      >
        <span>Offers & Status</span>
        <span
          className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
            isApplications ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </Link>
      <Link
        href="/student/mock-interview"
        className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center gap-1.5 cursor-pointer ${
          isMockInterview
            ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
            : "text-indigo-600 font-semibold hover:bg-indigo-50/60"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin group-hover:scale-110 transition-transform" style={{ animationDuration: '6s' }} />
        <span>AI Mentor</span>
        <span
          className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
            isMockInterview ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </Link>
    </>
  );
}

export const Navbar: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setDropdownOpen(false);

    // Redirect to corresponding dashboard (only Student or TPO)
    if (role === "STUDENT") router.push("/dashboard/student");
    else router.push("/dashboard/tpo");
  };

  const roleMeta: Record<
    UserRole,
    { label: string; icon: React.ReactNode; color: string; badgeColor: string }
  > = {
    PLACEMENT_OFFICER: {
      label: "Placement Officer (TPO)",
      icon: <Shield className="w-3.5 h-3.5 text-blue-600" />,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      badgeColor: "bg-blue-600",
    },
    STUDENT: {
      label: "Student Candidate",
      icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      badgeColor: "bg-emerald-600",
    },
    RECRUITER: {
      label: "Placement Officer (TPO)",
      icon: <Shield className="w-3.5 h-3.5 text-blue-600" />,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      badgeColor: "bg-blue-600",
    },
    MENTOR: {
      label: "Placement Officer (TPO)",
      icon: <Shield className="w-3.5 h-3.5 text-blue-600" />,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      badgeColor: "bg-blue-600",
    },
  };

  const currentRole = user?.role || "PLACEMENT_OFFICER";
  const currentMeta = roleMeta[currentRole];

  return (
    <header className="sticky top-0 z-50 glass-navbar px-6 py-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800">
                CampusLink
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Active
              </span>
            </div>
          </Link>

          {/* Role-specific Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600">
            {currentRole === "PLACEMENT_OFFICER" && (
              <>
                <Link
                  href="/dashboard/tpo"
                  className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center cursor-pointer ${
                    pathname === "/dashboard/tpo"
                      ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <span>Command Center</span>
                  <span
                    className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
                      pathname === "/dashboard/tpo" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
                <Link
                  href="/drives"
                  className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center cursor-pointer ${
                    pathname.startsWith("/drives")
                      ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <span>Drives & Schedule</span>
                  <span
                    className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
                      pathname.startsWith("/drives") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
                <Link
                  href="/matching"
                  className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center cursor-pointer ${
                    pathname === "/matching"
                      ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <span>AI Shortlisting</span>
                  <span
                    className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
                      pathname === "/matching" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
                <Link
                  href="/analytics"
                  className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center cursor-pointer ${
                    pathname === "/analytics"
                      ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <span>Analytics & At-Risk</span>
                  <span
                    className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
                      pathname === "/analytics" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </>
            )}

            {currentRole === "STUDENT" && (
              <Suspense
                fallback={
                  <>
                    <Link href="/dashboard/student?tab=overview" className="group relative px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-all duration-200 hover:-translate-y-0.5">
                      <span>My Readiness</span>
                      <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-indigo-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                    </Link>
                    <Link href="/dashboard/student?tab=drives" className="group relative px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-all duration-200 hover:-translate-y-0.5">
                      <span>Eligible Drives</span>
                      <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-indigo-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                    </Link>
                    <Link href="/dashboard/student?tab=applications" className="group relative px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-all duration-200 hover:-translate-y-0.5">
                      <span>Offers & Status</span>
                      <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-indigo-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                    </Link>
                    <Link href="/student/mock-interview" className="group relative px-3 py-1.5 rounded-lg text-indigo-600 font-semibold transition-all duration-200 hover:-translate-y-0.5">
                      <span>AI Mentor</span>
                      <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-indigo-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                    </Link>
                  </>
                }
              >
                <StudentNavLinks pathname={pathname} />
              </Suspense>
            )}

            <Link
              href="/design-system"
              className="group relative text-xs text-slate-600 hover:text-indigo-600 transition-all duration-200 border border-slate-200 hover:border-indigo-300 hover:-translate-y-0.5 hover:shadow-xs rounded-lg px-2.5 py-1 inline-flex items-center cursor-pointer"
            >
              <span>Design Tokens</span>
              <span className="absolute bottom-0.5 left-2 right-2 h-[1.5px] bg-indigo-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
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
                  Switch Dashboard
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Choose between Student and Placement Officer
                </div>
              </div>

              <div className="p-1.5 space-y-1">
                {ACTIVE_ROLES.map((r) => {
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
