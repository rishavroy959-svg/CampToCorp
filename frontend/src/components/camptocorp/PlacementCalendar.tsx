"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Building,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  Target,
  Sparkles,
  BookOpen,
  Check,
  X,
  Info,
  Award,
  Layers,
  FileText,
  MapPin,
  TrendingUp,
  Send,
} from "lucide-react";

export interface CalendarDrive {
  id: number;
  company_name: string;
  role_title: string;
  job_description?: string;
  job_type?: string;
  category?: string;
  ctc_lpa: number;
  base_salary_lpa?: number;
  min_cgpa: number;
  allowed_branches: string[];
  max_backlogs_allowed: number;
  min_tenth_percentage?: number;
  min_twelfth_percentage?: number;
  location?: string;
  deadline?: string;
  drive_date: string;
  slot: string;
  venue: string;
  status: string;
  required_skills?: string[];
  company_rating?: number;
}

interface PlacementCalendarProps {
  drives: CalendarDrive[];
  studentSkills: string[];
  studentCgpa: number;
  studentBranch: string;
  studentBacklogs: number;
  onApply?: (driveId: number) => Promise<{ success: boolean; message: string }> | void;
  appliedDriveIds?: number[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const PlacementCalendar: React.FC<PlacementCalendarProps> = ({
  drives = [],
  studentSkills = [],
  studentCgpa = 8.8,
  studentBranch = "CSE",
  studentBacklogs = 0,
  onApply,
  appliedDriveIds = [],
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "10_15_days" | "top_rated" | "eligible" | "high_match">("all");
  const [selectedDrive, setSelectedDrive] = useState<CalendarDrive | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic Month & Year Navigation State (Default to October 2026 where campus placement season starts)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  // In-modal application status
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [localAppliedIds, setLocalAppliedIds] = useState<number[]>(appliedDriveIds);

  // Synchronize local applied IDs if prop changes
  React.useEffect(() => {
    setLocalAppliedIds(appliedDriveIds);
  }, [appliedDriveIds]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleCurrentSeason = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // October
  };

  // Simulated base reference date (aligned with 2026 academic placement season: 2026-09-30)
  const referenceDate = useMemo(() => {
    const now = new Date();
    if (now.getFullYear() < 2026) {
      return new Date("2026-09-30T00:00:00");
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Calculate days remaining from reference date to drive date
  const getDaysLeft = (driveDateStr: string): number => {
    try {
      const parts = driveDateStr.split("-").map(Number);
      if (parts.length !== 3) return 999;
      const driveDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const diffTime = driveDate.getTime() - referenceDate.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 999;
    }
  };

  // Skill analysis helper
  const analyzeSkills = (requiredSkills: string[] = []) => {
    if (!requiredSkills || requiredSkills.length === 0) {
      return { matched: [], missing: [], matchPct: 100 };
    }
    const studentSkillsLower = studentSkills.map((s) => s.toLowerCase().trim());
    const matched = requiredSkills.filter((req) =>
      studentSkillsLower.includes(req.toLowerCase().trim())
    );
    const missing = requiredSkills.filter(
      (req) => !studentSkillsLower.includes(req.toLowerCase().trim())
    );
    const matchPct = Math.round((matched.length / requiredSkills.length) * 100);
    return { matched, missing, matchPct };
  };

  // Eligibility check helper
  const checkEligibility = (drive: CalendarDrive) => {
    const cgpaOk = studentCgpa >= drive.min_cgpa;
    const branchOk =
      !drive.allowed_branches ||
      drive.allowed_branches.length === 0 ||
      drive.allowed_branches.includes(studentBranch);
    const backlogsOk = studentBacklogs <= drive.max_backlogs_allowed;
    const isEligible = cgpaOk && branchOk && backlogsOk;
    return { isEligible, cgpaOk, branchOk, backlogsOk };
  };

  // Actionable prep advice generation based on missing skills
  const getSkillPrepPlan = (missingSkills: string[], companyName: string, role: string) => {
    if (missingSkills.length === 0) {
      return {
        headline: "High Readiness Level — Profile Strongly Aligned!",
        advice: [
          `Your skills fully match ${companyName}'s target profile for ${role}.`,
          "Prioritize speed coding on Medium/Hard LeetCode problems (Graphs, DP, Trees).",
          `Review ${companyName}'s company-specific behavioral questions and STAR method responses.`,
          "Conduct 1-on-1 mock technical interviews focusing on system architecture.",
        ],
      };
    }

    const adviceList: string[] = [];
    const skillMap: Record<string, string> = {
      "c++": "Brush up C++ STL (vector, map, priority_queue), memory management, and RAII principles.",
      java: "Revise Java Collections framework, multithreading basics, and OOP design patterns.",
      python: "Practice Pythonic data structures, generators, list comprehensions, and async basics.",
      "data structures": "Solve at least 15 medium problems on Trees, Linked Lists, and Hash Maps.",
      algorithms: "Master Binary Search, Dynamic Programming, Two Pointers, and DFS/BFS traversals.",
      "system design": "Study High-Level Architecture: Load Balancers, Redis Caching, and DB Indexing.",
      sql: "Practice SQL Window Functions (ROW_NUMBER, RANK), complex JOINs, and query optimization.",
      postgresql: "Review PostgreSQL indexing (B-Tree, GIN), ACID guarantees, and transaction isolation.",
      docker: "Practice writing Dockerfiles, multi-stage builds, and basic container networking.",
      kubernetes: "Understand Pods, Services, Deployments, and ConfigMaps architecture.",
      fastapi: "Review asynchronous endpoint creation, Pydantic schemas, and JWT middleware.",
      networking: "Revise OSI 7 layers, TCP 3-way handshake, DNS resolution, and HTTP/HTTPS status codes.",
      linux: "Brush up essential Bash commands, file permissions (chmod), process grep, and SSH keys.",
    };

    missingSkills.forEach((skill) => {
      const lower = skill.toLowerCase().trim();
      if (skillMap[lower]) {
        adviceList.push(skillMap[lower]);
      } else {
        adviceList.push(`Dedicate 2-3 hours to core conceptual revision and interview cheat-sheets for '${skill}'.`);
      }
    });

    return {
      headline: `Targeted Preparation Needed (${missingSkills.length} Key Skill Gap${missingSkills.length > 1 ? "s" : ""})`,
      advice: adviceList.slice(0, 4),
    };
  };

  // Direct Apply Handler
  const handleApplyClick = async (drive: CalendarDrive) => {
    if (localAppliedIds.includes(drive.id)) return;
    setIsApplying(true);
    setApplyMessage(null);

    try {
      if (onApply) {
        const res = await onApply(drive.id);
        if (res && typeof res === "object") {
          if (res.success) {
            setApplyMessage({
              type: "success",
              text: res.message || `Application successfully confirmed! Your profile has been sent to ${drive.company_name}.`,
            });
            setLocalAppliedIds((prev) => [...prev, drive.id]);
          } else {
            setApplyMessage({
              type: "error",
              text: res.message || "Eligibility verification failed for this placement drive.",
            });
          }
        } else {
          setApplyMessage({
            type: "success",
            text: `Application confirmed! Your profile has been submitted for ${drive.company_name}.`,
          });
          setLocalAppliedIds((prev) => [...prev, drive.id]);
        }
      }
    } catch (err: any) {
      setApplyMessage({
        type: "error",
        text: err?.message || "Failed to submit application. Please verify your connection to server.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  // Filtered drives
  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      const days = getDaysLeft(drive.drive_date);
      const { isEligible } = checkEligibility(drive);
      const { matchPct } = analyzeSkills(drive.required_skills);
      const rating = drive.company_rating || 4.5;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = drive.company_name.toLowerCase().includes(q);
        const matchesRole = drive.role_title.toLowerCase().includes(q);
        const matchesSkill = (drive.required_skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesSkill) return false;
      }

      // Filter chips
      if (selectedFilter === "10_15_days") {
        return days >= 10 && days <= 15;
      }
      if (selectedFilter === "top_rated") {
        return rating >= 4.5;
      }
      if (selectedFilter === "eligible") {
        return isEligible;
      }
      if (selectedFilter === "high_match") {
        return matchPct >= 60;
      }
      return true;
    });
  }, [drives, selectedFilter, searchQuery, studentSkills, studentCgpa, studentBranch, studentBacklogs]);

  // Identify drives in the critical 10-15 day alert window
  const criticalDrives = useMemo(() => {
    return drives.filter((d) => {
      const days = getDaysLeft(d.drive_date);
      return days >= 10 && days <= 15;
    });
  }, [drives]);

  // Drives in the currently displayed month
  const drivesInViewedMonth = useMemo(() => {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return drives.filter((d) => d.drive_date && d.drive_date.startsWith(monthStr));
  }, [drives, currentYear, currentMonth]);

  // Dynamic Calendar days grid for ANY selected month & year
  const calendarDays = useMemo(() => {
    // Total days in current month
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Day of the week for day 1 (0=Sun, 1=Mon, ..., 6=Sat)
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    // Monday-based lead offset: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
    const leadOffset = (firstDayOfWeek + 6) % 7;

    // Total days in previous month
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const daysArray: {
      dayNum: number;
      dateStr: string;
      drives: CalendarDrive[];
      is10To15: boolean;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    const refDateStr = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}-${String(
      referenceDate.getDate()
    ).padStart(2, "0")}`;

    // 1. Leading offset days from previous month
    for (let i = leadOffset - 1; i >= 0; i--) {
      const prevDay = totalDaysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`;
      const dayDrives = drives.filter((d) => d.drive_date === dateStr);
      const daysLeft = getDaysLeft(dateStr);
      const is10To15 = daysLeft >= 10 && daysLeft <= 15;
      daysArray.push({
        dayNum: prevDay,
        dateStr,
        drives: dayDrives,
        is10To15,
        isCurrentMonth: false,
        isToday: dateStr === refDateStr,
      });
    }

    // 2. Days in the current selected month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayDrives = drives.filter((d) => d.drive_date === dateStr);
      const daysLeft = getDaysLeft(dateStr);
      const is10To15 = daysLeft >= 10 && daysLeft <= 15;
      daysArray.push({
        dayNum: day,
        dateStr,
        drives: dayDrives,
        is10To15,
        isCurrentMonth: true,
        isToday: dateStr === refDateStr,
      });
    }

    // 3. Trailing days from next month to complete the row
    const remainingCells = (7 - (daysArray.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`;
      const dayDrives = drives.filter((d) => d.drive_date === dateStr);
      const daysLeft = getDaysLeft(dateStr);
      const is10To15 = daysLeft >= 10 && daysLeft <= 15;
      daysArray.push({
        dayNum: nextDay,
        dateStr,
        drives: dayDrives,
        is10To15,
        isCurrentMonth: false,
        isToday: dateStr === refDateStr,
      });
    }

    return daysArray;
  }, [currentYear, currentMonth, drives, referenceDate]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Institutional Notice Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-indigo-500/25 relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-bold border border-white/10">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-300" />
            <span>Official University Placement Drive Schedule</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            Placement & Company Visit Calendar
          </h2>
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            Get advance 10–15 day visibility into visiting recruiters, verified company ratings, and AI-powered skill gap roadmaps tailored to your profile.
          </p>
        </div>

        {/* Security / TPO Authority Pill */}
        <div className="flex flex-col gap-2 shrink-0 relative z-10">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <div className="font-black text-amber-300">Managed Exclusively by TPO</div>
              <div className="text-[10px] text-amber-300/80">Student View is Read-Only • Official College Schedule</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Critical 10-15 Day Advance Notice Alert Box */}
      {criticalDrives.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 shadow-sm text-amber-950">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-200/90 text-amber-900 shrink-0 shadow-xs">
                <Flame className="w-6 h-6 text-amber-600 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                    High Priority Prep Radar
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-amber-950">
                    {criticalDrives.length} Company Drive{criticalDrives.length > 1 ? "s" : ""} Visiting in 10–15 Days!
                  </h3>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Companies visiting within this window have strict technical criteria. Check your skill gaps and start targeted preparation today:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {criticalDrives.map((d) => {
                    const days = getDaysLeft(d.drive_date);
                    const { missing } = analyzeSkills(d.required_skills);
                    const isAlreadyApplied = localAppliedIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDrive(d);
                          setApplyMessage(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-amber-200 text-xs font-bold text-slate-800 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer"
                      >
                        <Building className="w-3.5 h-3.5 text-campus-primary" />
                        <span>{d.company_name}</span>
                        <span className="text-amber-600 font-extrabold">({days} days left)</span>
                        <span className="inline-flex items-center text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          ⭐ {d.company_rating || 4.5}
                        </span>
                        {isAlreadyApplied ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Applied ✓
                          </span>
                        ) : missing.length > 0 ? (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">
                            {missing.length} skill gap{missing.length > 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedFilter("10_15_days")}
              className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View 10-15 Day Prep Plan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Controls Bar: Search, Filters & View Toggle */}
      <div className="card-squarespace p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Drives ({drives.length})
          </button>
          <button
            onClick={() => setSelectedFilter("10_15_days")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedFilter === "10_15_days"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>10–15 Days Window ({criticalDrives.length})</span>
          </button>
          <button
            onClick={() => setSelectedFilter("top_rated")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedFilter === "top_rated"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Top Rated (≥ 4.5)</span>
          </button>
          <button
            onClick={() => setSelectedFilter("eligible")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedFilter === "eligible"
                ? "bg-campus-primary text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Eligible for You</span>
          </button>
          <button
            onClick={() => setSelectedFilter("high_match")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              selectedFilter === "high_match"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>High Skill Match (≥ 60%)</span>
          </button>
        </div>

        {/* View Toggle & Search */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Search company or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-campus-border bg-slate-50 focus:bg-white focus:outline-none focus:border-campus-primary w-40 sm:w-52"
          />

          <div className="flex items-center rounded-lg border border-campus-border bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-white text-campus-primary font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📅 Month Grid
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "timeline" ? "bg-white text-campus-primary font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📋 Prep Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN VIEW: Calendar Grid or Timeline Roadmap */}
      {viewMode === "grid" ? (
        <div className="card-squarespace p-6 space-y-4 bg-white">
          {/* Dynamic Month Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Month Navigator Arrows & Dropdowns */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-campus-border rounded-xl p-1 shadow-2xs">
                  <button
                    onClick={handlePrevMonth}
                    title="Previous Month"
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    <select
                      value={currentMonth}
                      onChange={(e) => setCurrentMonth(Number(e.target.value))}
                      className="font-black text-sm md:text-base text-campus-text-primary bg-transparent focus:outline-none cursor-pointer py-0.5"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={m} value={idx}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(Number(e.target.value))}
                      className="font-black text-sm md:text-base text-campus-text-primary bg-transparent focus:outline-none cursor-pointer py-0.5"
                    >
                      {[2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleNextMonth}
                    title="Next Month"
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Return to October 2026 Season button */}
                {(currentMonth !== 9 || currentYear !== 2026) && (
                  <button
                    onClick={handleCurrentSeason}
                    className="px-2.5 py-1.5 rounded-lg bg-campus-primary text-white text-xs font-bold hover:bg-campus-primary-hover transition-all cursor-pointer shadow-2xs"
                  >
                    Current Season (Oct 2026)
                  </button>
                )}

                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {drivesInViewedMonth.length} Drives in {MONTH_NAMES[currentMonth]}
                </span>
              </div>

              <p className="text-xs text-campus-text-secondary">
                Use arrows to browse all placement months. Dates in gold highlight your critical 10–15 day preparation radar. Click any drive to inspect skills or apply.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs flex-wrap font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 animate-pulse" />
                <span className="text-slate-600">10–15d Window</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-50 border border-blue-300" />
                <span className="text-slate-600">Company Visit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-900" />
                <span className="text-slate-600">Today (Ref Date)</span>
              </div>
            </div>
          </div>

          {/* Weekday Labels (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-500 py-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Dynamic Month Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell) => {
              const hasDrives = cell.drives.length > 0;
              const is10To15 = cell.is10To15;
              const isCurrent = cell.isCurrentMonth;
              const isToday = cell.isToday;

              return (
                <div
                  key={cell.dateStr}
                  className={`min-h-28 p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    !isCurrent
                      ? "border-dashed border-slate-200 bg-slate-50/50 text-slate-400 opacity-60"
                      : is10To15
                      ? "border-amber-300 bg-linear-to-b from-amber-50/80 to-orange-50/30 shadow-xs ring-1 ring-amber-300/40"
                      : hasDrives
                      ? "border-blue-200 bg-blue-50/30"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? "px-1.5 py-0.5 rounded bg-slate-900 text-white font-black"
                          : is10To15
                          ? "text-amber-900"
                          : hasDrives
                          ? "text-campus-primary"
                          : isCurrent
                          ? "text-slate-600"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.dayNum} {!isCurrent && `(${cell.dateStr.slice(5, 7)})`}
                    </span>
                    {is10To15 && isCurrent && (
                      <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-200 text-amber-900 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-amber-700" />
                        10-15d
                      </span>
                    )}
                  </div>

                  {/* Drives scheduled on this date */}
                  <div className="space-y-1 my-1">
                    {cell.drives.map((drive) => {
                      const { missing, matchPct } = analyzeSkills(drive.required_skills);
                      const rating = drive.company_rating || 4.5;
                      const daysLeft = getDaysLeft(drive.drive_date);
                      const isAlreadyApplied = localAppliedIds.includes(drive.id);

                      return (
                        <div
                          key={drive.id}
                          onClick={() => {
                            setSelectedDrive(drive);
                            setApplyMessage(null);
                          }}
                          className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-xs ${
                            isAlreadyApplied
                              ? "bg-emerald-50 border-emerald-300"
                              : daysLeft >= 10 && daysLeft <= 15
                              ? "bg-amber-100/90 border-amber-300 hover:border-amber-400"
                              : "bg-white border-blue-200 hover:border-campus-primary"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] truncate text-slate-900">
                              {drive.company_name}
                            </span>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded shrink-0 flex items-center">
                              ★{rating}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-campus-primary">{drive.ctc_lpa}L</span>
                            {isAlreadyApplied ? (
                              <span className="px-1 rounded font-bold bg-emerald-200 text-emerald-900">
                                Applied ✓
                              </span>
                            ) : (
                              <span
                                className={`px-1 rounded font-bold ${
                                  matchPct >= 60 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {matchPct}% Match
                              </span>
                            )}
                          </div>
                          {missing.length > 0 && !isAlreadyApplied && (
                            <div className="text-[9px] text-rose-600 font-semibold truncate mt-0.5">
                              ⚠️ Need: {missing[0]}
                              {missing.length > 1 ? ` +${missing.length - 1}` : ""}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Day Status */}
                  <div className="text-[10px] text-slate-400 text-right">
                    {hasDrives ? `${cell.drives.length} drive` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 5. MAIN VIEW: Timeline & Detailed Preparation Cards */
        <div className="space-y-4">
          {filteredDrives.length === 0 ? (
            <div className="card-squarespace p-8 text-center space-y-2 bg-white">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Placement Drives Match the Selected Filter</h4>
              <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => setSelectedFilter("all")}
                className="mt-2 text-xs font-bold text-campus-primary hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredDrives.map((drive) => {
              const daysLeft = getDaysLeft(drive.drive_date);
              const is10To15 = daysLeft >= 10 && daysLeft <= 15;
              const isImminent = daysLeft > 0 && daysLeft < 10;
              const { matched, missing, matchPct } = analyzeSkills(drive.required_skills);
              const { isEligible, cgpaOk, branchOk, backlogsOk } = checkEligibility(drive);
              const rating = drive.company_rating || 4.5;
              const prep = getSkillPrepPlan(missing, drive.company_name, drive.role_title);
              const isApplied = localAppliedIds.includes(drive.id);

              return (
                <div
                  key={drive.id}
                  className={`card-squarespace p-6 border transition-all ${
                    is10To15
                      ? "border-amber-300 bg-linear-to-r from-amber-50/40 via-white to-white shadow-xs hover:border-amber-400"
                      : "border-campus-border hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left: Company, Role & Visit Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base md:text-lg font-black text-campus-text-primary">
                          {drive.company_name}
                        </h3>

                        {/* Verified Rating Badge */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold shadow-2xs">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{rating} / 5.0</span>
                          <span className="text-[10px] text-amber-700 font-medium ml-0.5">
                            ({rating >= 4.6 ? "Tier-1 Recruiter" : "Verified Recruiter"})
                          </span>
                        </div>

                        {/* Countdown Badge */}
                        {is10To15 ? (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-white text-xs font-black shadow-xs animate-pulse">
                            <Flame className="w-3.5 h-3.5" />
                            <span>Arriving in {daysLeft} Days (10–15d Window)</span>
                          </div>
                        ) : isImminent ? (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-black shadow-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Urgent: In {daysLeft} Days</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>In {daysLeft} Days</span>
                          </div>
                        )}

                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          {drive.job_type || "FULL_TIME"}
                        </span>
                      </div>

                      {/* Role & Key Parameters */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-600">
                        <div>
                          <span className="font-semibold text-slate-800">Role: </span>
                          <span className="font-medium text-slate-700">{drive.role_title}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">Package: </span>
                          <span className="font-bold text-campus-primary text-sm">{drive.ctc_lpa} LPA</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">Drive Date: </span>
                          <span className="font-bold text-slate-800">{drive.drive_date}</span>
                          <span className="text-slate-500 ml-1">({drive.slot})</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">Venue: </span>
                          <span className="font-medium text-slate-700">{drive.venue}</span>
                        </div>
                      </div>

                      {/* Eligibility Bar */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
                        <span className="font-bold text-slate-600">Eligibility Criteria:</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            cgpaOk ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          Min CGPA: {drive.min_cgpa} {cgpaOk ? "✅ (Yours: " + studentCgpa + ")" : "❌"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            branchOk ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          Branches: {drive.allowed_branches.join(", ")} {branchOk ? "✅" : "❌"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            backlogsOk ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          Max Backlogs: {drive.max_backlogs_allowed} {backlogsOk ? "✅" : "❌"}
                        </span>
                      </div>

                      {/* SKILL GAP ANALYSIS SECTION */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 mt-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-campus-primary" />
                            <span className="text-xs font-bold text-slate-900">
                              Personalized Skill Match & Gap Analysis
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">Skill Readiness:</span>
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded ${
                                matchPct >= 70
                                  ? "bg-emerald-100 text-emerald-800"
                                  : matchPct >= 50
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {matchPct}% ({matched.length}/{drive.required_skills?.length || 0} skills)
                            </span>
                          </div>
                        </div>

                        {/* Matched vs Missing Skills Pills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Matched */}
                          <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-1.5">
                            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Skills You Already Have ({matched.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {matched.length > 0 ? (
                                matched.map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                                  >
                                    {s} ✓
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">None matched yet</span>
                              )}
                            </div>
                          </div>

                          {/* Missing / Gap */}
                          <div className="p-2.5 rounded-lg bg-white border border-amber-300 space-y-1.5">
                            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Missing Skills to Prepare ({missing.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {missing.length > 0 ? (
                                missing.map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold"
                                  >
                                    {s} ⚠️
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-bold">
                                  🎉 No skill gaps! 100% matched.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 10-15 Day Preparation Strategy Roadmap */}
                        <div className="pt-2 border-t border-slate-200/80">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>10–15 Day Preparation Strategy: {prep.headline}</span>
                          </div>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {prep.advice.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-campus-primary font-bold">Day {idx * 3 + 1}–{idx * 3 + 3}:</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Overview Card */}
                    <div className="flex flex-col gap-2.5 shrink-0 sm:w-56">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1 text-xs">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Eligibility Verdict</div>
                        <div
                          className={`font-black text-sm ${
                            isEligible ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {isEligible ? "✅ Fully Eligible" : "⚠️ Eligibility Pending"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isEligible ? "You meet all academic criteria" : "Review CGPA or backlog criteria"}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedDrive(drive);
                          setApplyMessage(null);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-campus-primary text-white font-bold text-xs hover:bg-campus-primary-hover transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Inspect Prep Syllabus</span>
                      </button>

                      {isEligible && (
                        <button
                          onClick={() => handleApplyClick(drive)}
                          disabled={isApplied || isApplying}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isApplied
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-not-allowed"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          {isApplied ? "Applied ✓" : "Quick Register / Apply"}
                        </button>
                      )}

                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                          `Campus Drive: ${drive.company_name} (${drive.role_title})`
                        )}&dates=${drive.drive_date.replace(/-/g, "")}T090000Z/${drive.drive_date.replace(
                          /-/g,
                          ""
                        )}T180000Z&details=${encodeURIComponent(
                          `Package: ${drive.ctc_lpa} LPA. Venue: ${drive.venue}. Rating: ${rating}/5. Required skills: ${(drive.required_skills || []).join(", ")}`
                        )}&location=${encodeURIComponent(drive.venue)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 px-3 rounded-xl border border-campus-border text-slate-700 hover:bg-slate-50 font-semibold text-[11px] transition-all flex items-center justify-center gap-1 text-center"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>Add to Google Calendar</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 6. MODAL: Detailed Preparation Guide & Working Confirm Application */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-campus-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-campus-text-primary">
                    {selectedDrive.company_name}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-extrabold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {selectedDrive.company_rating || 4.5} Rating
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {selectedDrive.role_title} • {selectedDrive.ctc_lpa} LPA Package • Drive Date: {selectedDrive.drive_date}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDrive(null);
                  setApplyMessage(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Modal Application Notification Feedback */}
            {applyMessage && (
              <div
                className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-fade-in ${
                  applyMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-rose-50 border-rose-300 text-rose-900"
                }`}
              >
                {applyMessage.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{applyMessage.text}</span>
              </div>
            )}

            {/* Countdown & Venue Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Days Remaining</div>
                <div className="text-base font-black text-amber-700 mt-0.5">
                  {getDaysLeft(selectedDrive.drive_date)} Days
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Assigned Venue</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                  {selectedDrive.venue}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Slot Timing</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {selectedDrive.slot}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Min CGPA Cutoff</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {selectedDrive.min_cgpa} CGPA
                </div>
              </div>
            </div>

            {/* Job Description */}
            {selectedDrive.job_description && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Role Description</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedDrive.job_description}
                </p>
              </div>
            )}

            {/* Comprehensive Skill-by-Skill Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Required Technical Stack & Preparation Focus
                </h4>
                {(() => {
                  const { matchPct } = analyzeSkills(selectedDrive.required_skills);
                  return (
                    <span className="text-xs font-extrabold text-campus-primary bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      Your Skill Match: {matchPct}%
                    </span>
                  );
                })()}
              </div>

              {(() => {
                const { matched, missing } = analyzeSkills(selectedDrive.required_skills);
                const prep = getSkillPrepPlan(missing, selectedDrive.company_name, selectedDrive.role_title);

                return (
                  <div className="space-y-3">
                    {/* Missing Skills alert */}
                    {missing.length > 0 ? (
                      <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/70 text-xs space-y-2">
                        <div className="font-bold text-amber-950 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Focus Areas: Skills to Master in the Next 10–15 Days</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {missing.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-xs shadow-2xs"
                            >
                              {s} (Action Required)
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>All required skills are present in your student profile!</span>
                      </div>
                    )}

                    {/* Day-by-Day Preparation Plan */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-campus-primary" />
                        <span>Recommended 10–15 Day Study Schedule:</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-700">
                        {prep.advice.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200">
                            <span className="font-extrabold text-campus-primary shrink-0">
                              Phase {idx + 1} (Days {idx * 3 + 1}–{idx * 3 + 3}):
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Institutional Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] leading-relaxed flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Schedule and company details are verified by the Central Placement Office. For questions regarding slot changes or special exemptions, contact the TPO Coordinator.
              </span>
            </div>

            {/* Modal Actions with Live Confirm Application */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-campus-border">
              <div className="text-xs text-slate-500">
                {localAppliedIds.includes(selectedDrive.id) ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Resume attached & registered
                  </span>
                ) : (
                  <span>Ready to appear for this drive?</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedDrive(null);
                    setApplyMessage(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-campus-border text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {applyMessage?.type === "success" ? "Done" : "Close"}
                </button>

                <button
                  onClick={() => handleApplyClick(selectedDrive)}
                  disabled={isApplying || localAppliedIds.includes(selectedDrive.id)}
                  className={`px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    localAppliedIds.includes(selectedDrive.id)
                      ? "bg-emerald-100 border border-emerald-300 text-emerald-800 cursor-not-allowed"
                      : isApplying
                      ? "bg-campus-primary/70 text-white cursor-wait"
                      : "bg-campus-primary text-white hover:bg-campus-primary-hover hover:scale-[1.02]"
                  }`}
                >
                  {isApplying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : localAppliedIds.includes(selectedDrive.id) ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Application Submitted ✓</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
