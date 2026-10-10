"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  // Clean Header for Authentication Pages (Login/Register)
  if (pathname?.startsWith("/auth")) {
    return (
      <header className="sticky top-0 z-50 glass-navbar px-6 py-3.5 shadow-xs bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800">
              CampToCorp
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg border border-indigo-200/80 transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </header>
    );
  }

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
                CampToCorp
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
                <Link
                  href="/dashboard/tpo/governance"
                  className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    pathname === "/dashboard/tpo/governance"
                      ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Access Governance</span>
                  <span
                    className={`absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
                      pathname === "/dashboard/tpo/governance" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
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
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-campus-border py-2 z-50 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-campus-text-primary">
                    Notifications
                  </span>
                </div>
                <div className="px-4 py-6 text-center text-xs text-slate-500">
                  You are all caught up. No new alerts.
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

          {/* Dropdown Menu: signed-in account + Log Out only */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-campus-border py-2 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center gap-2">
                {currentMeta.icon}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-campus-text-primary truncate">
                    {user?.fullName || "Guest User"}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {user?.email || currentMeta.label}
                  </div>
                </div>
              </div>

              <div className="p-1.5">
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
