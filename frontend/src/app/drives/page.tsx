"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  StatusPill,
  Button,
  KPICard,
} from "@/components/campuslink";
import {
  Calendar,
  AlertTriangle,
  Clock,
  MapPin,
  Building,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  Layers,
  Tag,
  X,
  Check,
} from "lucide-react";

interface DriveScheduleItem {
  id: number;
  companyName: string;
  roleTitle: string;
  ctcLpa: number;
  driveDate: string;
  slot: "MORNING" | "AFTERNOON" | "FULL_DAY";
  venue: string;
  panelsCount: number;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  jobDescription?: string;
  minCgpa?: number;
  allowedBranches?: string[];
  maxBacklogsAllowed?: number;
  requiredSkills?: string[];
  hasConflict: boolean;
  conflictSeverity?: "CRITICAL" | "WARNING";
  conflictDescription?: string;
  conflictingCompany?: string;
  alternativeSuggestions?: {
    type: string;
    date: string;
    slot: string;
    venue: string;
    confidence: string;
    rationale: string;
  }[];
}

export default function DrivesPage() {
  const [drives, setDrives] = useState<DriveScheduleItem[]>([
    {
      id: 1,
      companyName: "Google Cloud",
      roleTitle: "Site Reliability Engineer",
      ctcLpa: 32.0,
      driveDate: "2026-10-18",
      slot: "FULL_DAY",
      venue: "Auditorium Hall A",
      panelsCount: 4,
      status: "UPCOMING",
      hasConflict: true,
      conflictSeverity: "CRITICAL",
      conflictDescription: "Venue Collision: Auditorium Hall A is simultaneously reserved by Amazon Web Services on 2026-10-18.",
      conflictingCompany: "Amazon Web Services",
      alternativeSuggestions: [
        {
          type: "SAME_DAY_DIFFERENT_VENUE",
          date: "2026-10-18",
          slot: "FULL_DAY",
          venue: "CS Lab Complex 1",
          confidence: "Optimal (Zero Venue Overlap)",
          rationale: "Switch venue to CS Lab Complex 1 (capacity: 120 seats, 4 private interview cabins available).",
        },
        {
          type: "NEXT_AVAILABLE_DAY",
          date: "2026-10-19",
          slot: "FULL_DAY",
          venue: "Auditorium Hall A",
          confidence: "Recommended",
          rationale: "Postpone drive by 24 hours to 2026-10-19 where Auditorium Hall A has 100% full-day vacancy.",
        },
      ],
    },
    {
      id: 2,
      companyName: "Amazon Web Services",
      roleTitle: "Cloud Support Associate",
      ctcLpa: 22.0,
      driveDate: "2026-10-18",
      slot: "FULL_DAY",
      venue: "Auditorium Hall A",
      panelsCount: 3,
      status: "UPCOMING",
      hasConflict: true,
      conflictSeverity: "CRITICAL",
      conflictDescription: "Venue Double-Booking at Auditorium Hall A with Google Cloud.",
      conflictingCompany: "Google Cloud",
    },
    {
      id: 3,
      companyName: "Microsoft IDC",
      roleTitle: "Cloud Software Engineer",
      ctcLpa: 28.5,
      driveDate: "2026-10-15",
      slot: "FULL_DAY",
      venue: "Auditorium Hall A",
      panelsCount: 5,
      status: "ACTIVE",
      hasConflict: false,
    },
    {
      id: 4,
      companyName: "Goldman Sachs",
      roleTitle: "Quantitative Technology Analyst",
      ctcLpa: 26.0,
      driveDate: "2026-10-22",
      slot: "MORNING",
      venue: "Main Conference Hall",
      panelsCount: 3,
      status: "UPCOMING",
      hasConflict: false,
    },
    {
      id: 5,
      companyName: "Qualcomm India",
      roleTitle: "Embedded Software Engineer",
      ctcLpa: 21.5,
      driveDate: "2026-10-24",
      slot: "AFTERNOON",
      venue: "ECE Seminar Room",
      panelsCount: 4,
      status: "UPCOMING",
      hasConflict: false,
    },
  ]);

  const [activeConflictModal, setActiveConflictModal] = useState<DriveScheduleItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"LOGISTICS" | "JD_ELIGIBILITY">("LOGISTICS");
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCtc, setNewCtc] = useState("18.0");
  const [newDate, setNewDate] = useState("2026-10-25");
  const [newSlot, setNewSlot] = useState<"MORNING" | "AFTERNOON" | "FULL_DAY">("FULL_DAY");
  const [newVenue, setNewVenue] = useState("Auditorium Hall B");
  const [newPanels, setNewPanels] = useState(3);
  const [newJobDescription, setNewJobDescription] = useState("");
  const [newMinCgpa, setNewMinCgpa] = useState(7.0);
  const [newAllowedBranches, setNewAllowedBranches] = useState<string[]>(["CSE", "IT"]);
  const [newMaxBacklogs, setNewMaxBacklogs] = useState(0);
  const [newRequiredSkills, setNewRequiredSkills] = useState<string[]>(["Python", "DSA", "SQL"]);
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const totalConflicts = drives.filter((d) => d.hasConflict).length;

  const handleApplyAlternative = (
    driveId: number,
    alt: { date: string; slot: string; venue: string }
  ) => {
    setDrives((prev) =>
      prev.map((d) => {
        if (d.id === driveId) {
          return {
            ...d,
            driveDate: alt.date,
            slot: alt.slot as any,
            venue: alt.venue,
            hasConflict: false,
            conflictDescription: undefined,
          };
        }
        // Also clear conflict on the colliding twin if resolved
        if (d.id === 2 && driveId === 1) {
          return { ...d, hasConflict: false, conflictDescription: undefined };
        }
        return d;
      })
    );
    setActiveConflictModal(null);
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !newRequiredSkills.includes(trimmed)) {
      setNewRequiredSkills([...newRequiredSkills, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setNewRequiredSkills(newRequiredSkills.filter((s) => s !== skill));
  };

  const toggleBranch = (branch: string) => {
    if (newAllowedBranches.includes(branch)) {
      setNewAllowedBranches(newAllowedBranches.filter((b) => b !== branch));
    } else {
      setNewAllowedBranches([...newAllowedBranches, branch]);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check collision against existing drives
    const conflict = drives.find(
      (d) => d.driveDate === newDate && d.venue.toLowerCase() === newVenue.toLowerCase()
    );

    const drivePayload = {
      company_name: newCompany,
      role_title: newRole,
      job_description: newJobDescription || `${newCompany} is hiring for ${newRole} with a package of ${newCtc} LPA.`,
      ctc_lpa: parseFloat(newCtc) || 15.0,
      base_salary_lpa: (parseFloat(newCtc) || 15.0) * 0.8,
      min_cgpa: newMinCgpa,
      allowed_branches: newAllowedBranches.length > 0 ? newAllowedBranches : ["CSE", "IT"],
      max_backlogs_allowed: newMaxBacklogs,
      required_skills: newRequiredSkills,
      drive_date: newDate,
      slot: newSlot,
      venue: newVenue,
      interview_panels_count: newPanels,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/drives/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer jwt-token-placement_officer",
        },
        body: JSON.stringify(drivePayload),
      });

      if (res.ok) {
        const createdData = await res.json();
        const newDriveItem: DriveScheduleItem = {
          id: createdData.id,
          companyName: createdData.company_name,
          roleTitle: createdData.role_title,
          ctcLpa: createdData.ctc_lpa,
          driveDate: createdData.drive_date,
          slot: createdData.slot,
          venue: createdData.venue,
          panelsCount: createdData.interview_panels_count,
          status: createdData.status || "UPCOMING",
          jobDescription: createdData.job_description,
          minCgpa: createdData.min_cgpa,
          allowedBranches: createdData.allowed_branches,
          maxBacklogsAllowed: createdData.max_backlogs_allowed,
          requiredSkills: createdData.required_skills,
          hasConflict: createdData.has_conflict,
          conflictSeverity: createdData.has_conflict ? "CRITICAL" : undefined,
          conflictDescription: createdData.conflict_summary || (conflict ? `Venue collision at ${newVenue} on ${newDate}` : undefined),
        };
        setDrives([newDriveItem, ...drives]);
      } else {
        // Fallback local drive creation
        const newDriveItem: DriveScheduleItem = {
          id: drives.length + 1,
          companyName: newCompany,
          roleTitle: newRole,
          ctcLpa: parseFloat(newCtc) || 15.0,
          driveDate: newDate,
          slot: newSlot,
          venue: newVenue,
          panelsCount: newPanels,
          status: "UPCOMING",
          jobDescription: newJobDescription,
          minCgpa: newMinCgpa,
          allowedBranches: newAllowedBranches,
          maxBacklogsAllowed: newMaxBacklogs,
          requiredSkills: newRequiredSkills,
          hasConflict: !!conflict,
          conflictSeverity: conflict ? "CRITICAL" : undefined,
          conflictDescription: conflict
            ? `Double-booking at '${newVenue}' with ${conflict.companyName} on ${newDate}.`
            : undefined,
        };
        setDrives([newDriveItem, ...drives]);
      }
    } catch {
      // Offline fallback
      const newDriveItem: DriveScheduleItem = {
        id: drives.length + 1,
        companyName: newCompany,
        roleTitle: newRole,
        ctcLpa: parseFloat(newCtc) || 15.0,
        driveDate: newDate,
        slot: newSlot,
        venue: newVenue,
        panelsCount: newPanels,
        status: "UPCOMING",
        jobDescription: newJobDescription,
        minCgpa: newMinCgpa,
        allowedBranches: newAllowedBranches,
        maxBacklogsAllowed: newMaxBacklogs,
        requiredSkills: newRequiredSkills,
        hasConflict: !!conflict,
        conflictSeverity: conflict ? "CRITICAL" : undefined,
        conflictDescription: conflict
          ? `Double-booking at '${newVenue}' with ${conflict.companyName} on ${newDate}.`
          : undefined,
      };
      setDrives([newDriveItem, ...drives]);
    } finally {
      setIsSubmitting(false);
      setCreateModalOpen(false);
      setNotificationMsg(`Recruitment Drive for ${newCompany} (${newRole}) created successfully!`);
      setTimeout(() => setNotificationMsg(null), 6000);
      setNewCompany("");
      setNewRole("");
      setNewJobDescription("");
    }
  };

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {notificationMsg && (
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs px-2 py-1 rounded hover:bg-emerald-100 transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5 text-campus-primary" />
              <span>Placement Lifecycle</span>
              <span>/</span>
              <span>Scheduling Engine (PRD Module E)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              Recruitment Drive Calendar & Conflict Engine
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              Automated multi-drive schedule collision detector, venue allocation, and conflict-free slot recommender.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setCreateModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Schedule New Drive
          </Button>
        </div>

        {/* Top KPI Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <KPICard
            title="Total Drives Scheduled"
            metric={drives.length}
            subtitle="Current recruitment phase"
            icon={<Building className="w-5 h-5" />}
          />
          <KPICard
            title="Schedule Collisions"
            metric={totalConflicts}
            subtitle={totalConflicts > 0 ? "Requires resolution" : "Zero collisions"}
            variant={totalConflicts > 0 ? "danger" : "success"}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <KPICard
            title="Venues Allocated"
            metric="4 / 5"
            subtitle="Campus venue capacity"
            icon={<MapPin className="w-5 h-5" />}
          />
          <KPICard
            title="Avg Offer Benchmark"
            metric="26.0 LPA"
            subtitle="Tier 1 recruiting partners"
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        {/* Drive Schedule Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-campus-text-primary">
              Scheduled Recruitment Drives
            </h2>
            {totalConflicts > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                {totalConflicts} Active Drive Collision(s) Detected
              </span>
            )}
          </div>

          <div className="space-y-4">
            {drives.map((d) => (
              <div
                key={d.id}
                className={`card-squarespace p-6 transition-all border ${
                  d.hasConflict
                    ? "border-rose-300 bg-rose-50/15 ring-1 ring-rose-200"
                    : "border-campus-border hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Company & Timing */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${
                        d.hasConflict
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-campus-primary border border-slate-200"
                      }`}
                    >
                      {d.companyName[0]}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-campus-text-primary">
                          {d.companyName}
                        </h3>
                        {d.hasConflict && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white uppercase tracking-wider">
                            Collision Alert
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-medium text-campus-primary mt-0.5">
                        {d.roleTitle} &bull; <span className="font-semibold">{d.ctcLpa} LPA</span>
                      </div>

                      {/* Schedule Meta */}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-campus-text-secondary">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-campus-primary" /> {d.driveDate}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Slot: {d.slot}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {d.venue}
                        </span>
                        <span>Panels: {d.panelsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {d.hasConflict ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setActiveConflictModal(d)}
                        icon={<Sparkles className="w-4 h-4" />}
                      >
                        Resolve Conflict
                      </Button>
                    ) : (
                      <Link href="/matching">
                        <Button variant="secondary" size="sm">
                          View Shortlist
                        </Button>
                      </Link>
                    )}

                    <StatusPill
                      label={d.status}
                      variant={d.status === "ACTIVE" ? "success" : "primary"}
                    />
                  </div>
                </div>

                {/* Conflict Banner if detected */}
                {d.hasConflict && (
                  <div className="mt-4 pt-4 border-t border-rose-200/70 flex items-start justify-between gap-4 text-xs text-rose-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{d.conflictDescription}</span>
                    </div>
                    <button
                      onClick={() => setActiveConflictModal(d)}
                      className="text-xs font-bold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer"
                    >
                      View Suggested Free Slots &rarr;
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conflict Resolution Drawer Modal (PRD FR-E5) */}
        {activeConflictModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-xl w-full p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-campus-border pb-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-campus-text-primary">
                    Resolve Schedule Collision
                  </h3>
                </div>
                <button
                  onClick={() => setActiveConflictModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                <div className="font-bold">Detected Clash Details:</div>
                <p>{activeConflictModal.conflictDescription}</p>
                <div className="text-[11px] text-rose-700 mt-1">
                  Both drives cannot share {activeConflictModal.venue} simultaneously on {activeConflictModal.driveDate}.
                </div>
              </div>

              {/* AI Auto-Proposed Conflict-Free Alternatives (PRD FR-E5) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-campus-accent" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                    AI Auto-Proposed Conflict-Free Alternatives
                  </h4>
                </div>

                <div className="space-y-3">
                  {(activeConflictModal.alternativeSuggestions || []).map((alt, i) => (
                    <div
                      key={i}
                      className="card-squarespace p-4 border border-campus-border bg-white hover:border-campus-primary transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-campus-text-primary">
                            {alt.venue} ({alt.slot})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            {alt.confidence}
                          </span>
                        </div>
                        <p className="text-xs text-campus-text-secondary">{alt.rationale}</p>
                        <div className="text-[11px] font-mono text-campus-primary">
                          Target Date: {alt.date}
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApplyAlternative(activeConflictModal.id, alt)}
                      >
                        Auto-Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => setActiveConflictModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule New Drive Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-campus-primary/10 flex items-center justify-center text-campus-primary font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-campus-text-primary">Create Recruitment Drive</h3>
                    <p className="text-xs text-campus-text-secondary">Placement Officer Drive Scheduler & Requisition Creator</p>
                  </div>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Step / Tab Switcher */}
              <div className="flex border-b border-campus-border">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("LOGISTICS")}
                  className={`flex-1 pb-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                    activeModalTab === "LOGISTICS"
                      ? "border-campus-primary text-campus-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>1. Schedule & Venue Logistics</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("JD_ELIGIBILITY")}
                  className={`flex-1 pb-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all ${
                    activeModalTab === "JD_ELIGIBILITY"
                      ? "border-campus-primary text-campus-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>2. Job Description & Eligibility Criteria</span>
                </button>
              </div>

              <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
                {activeModalTab === "LOGISTICS" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-campus-text-primary mb-1">Company Name *</label>
                        <input
                          type="text"
                          required
                          value={newCompany}
                          onChange={(e) => setNewCompany(e.target.value)}
                          placeholder="e.g., Atlassian India"
                          className="w-full p-2.5 rounded-lg border border-campus-border focus:ring-2 focus:ring-campus-primary/20 focus:border-campus-primary outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-campus-text-primary mb-1">Role Title *</label>
                        <input
                          type="text"
                          required
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          placeholder="e.g., Software Development Engineer"
                          className="w-full p-2.5 rounded-lg border border-campus-border focus:ring-2 focus:ring-campus-primary/20 focus:border-campus-primary outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-campus-text-primary mb-1">Package (CTC in LPA) *</label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          value={newCtc}
                          onChange={(e) => setNewCtc(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-campus-border"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-campus-text-primary mb-1">Interview Panels Count</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newPanels}
                          onChange={(e) => setNewPanels(parseInt(e.target.value) || 1)}
                          className="w-full p-2.5 rounded-lg border border-campus-border"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-campus-text-primary mb-1">Drive Date *</label>
                        <input
                          type="date"
                          required
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-campus-border"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-campus-text-primary mb-1">Slot Allocation *</label>
                        <select
                          value={newSlot}
                          onChange={(e) => setNewSlot(e.target.value as any)}
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white"
                        >
                          <option value="FULL_DAY">FULL_DAY (09:00 - 18:00)</option>
                          <option value="MORNING">MORNING (09:00 - 13:00)</option>
                          <option value="AFTERNOON">AFTERNOON (14:00 - 18:00)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-campus-text-primary mb-1">Campus Venue *</label>
                        <select
                          value={newVenue}
                          onChange={(e) => setNewVenue(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white"
                        >
                          <option value="Auditorium Hall A">Auditorium Hall A (150 Seats)</option>
                          <option value="Auditorium Hall B">Auditorium Hall B (120 Seats)</option>
                          <option value="CS Lab Complex 1">CS Lab Complex 1 (100 Desks)</option>
                          <option value="ECE Seminar Room">ECE Seminar Room (80 Seats)</option>
                          <option value="Main Conference Hall">Main Conference Hall (60 Seats)</option>
                        </select>
                      </div>
                    </div>

                    {/* Real-time Conflict Preview Box */}
                    {(() => {
                      const detectedCollision = drives.find(
                        (d) => d.driveDate === newDate && d.venue.toLowerCase() === newVenue.toLowerCase()
                      );
                      if (detectedCollision) {
                        return (
                          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 text-rose-800 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Venue Overlap Collision Detected</span>
                            </div>
                            <p className="text-[11px] text-rose-700">
                              {detectedCollision.companyName} is already scheduled at {newVenue} on {newDate}. The platform will automatically flag this drive with AI-proposed conflict-free alternatives upon creation.
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-[11px] font-semibold">
                            Conflict Check: {newVenue} has 100% vacancy on {newDate}. Zero calendar collision!
                          </span>
                        </div>
                      );
                    })()}

                    <div className="pt-2 flex justify-between items-center">
                      <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => setActiveModalTab("JD_ELIGIBILITY")}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Next: Job Description & Eligibility
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Job Description Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-campus-text-primary">Job Description (JD)</label>
                        <span className="text-[10px] text-campus-text-secondary">Role scope & technical responsibilities</span>
                      </div>
                      <textarea
                        rows={4}
                        value={newJobDescription}
                        onChange={(e) => setNewJobDescription(e.target.value)}
                        placeholder="Enter role responsibilities, team details, technology stack, and expectations..."
                        className="w-full p-2.5 rounded-lg border border-campus-border font-sans focus:ring-2 focus:ring-campus-primary/20 focus:border-campus-primary outline-hidden"
                      />
                    </div>

                    {/* Hard Eligibility Filters */}
                    <div className="space-y-3 p-3.5 rounded-xl border border-campus-border bg-slate-50/60">
                      <div className="flex items-center gap-2 font-bold text-campus-text-primary">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-campus-primary" />
                        <span>Hard Eligibility Criteria Filters (PRD FR-B3)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Minimum CGPA Cutoff: <span className="font-bold text-campus-primary">{newMinCgpa}</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="5.0"
                              max="9.5"
                              step="0.1"
                              value={newMinCgpa}
                              onChange={(e) => setNewMinCgpa(parseFloat(e.target.value))}
                              className="w-full accent-campus-primary cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-700 w-8">{newMinCgpa}</span>
                          </div>
                          <div className="flex gap-1.5 mt-1.5">
                            {[6.5, 7.0, 7.5, 8.0].map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setNewMinCgpa(v)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  newMinCgpa === v
                                    ? "bg-campus-primary text-white border-campus-primary"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Max Active Backlogs</label>
                          <select
                            value={newMaxBacklogs}
                            onChange={(e) => setNewMaxBacklogs(parseInt(e.target.value))}
                            className="w-full p-2 rounded-lg border border-campus-border bg-white"
                          >
                            <option value={0}>0 Backlogs (Strict Zero)</option>
                            <option value={1}>Up to 1 Backlog Allowed</option>
                            <option value={2}>Up to 2 Backlogs Allowed</option>
                          </select>
                        </div>
                      </div>

                      {/* Allowed Branches Toggle Badges */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">Eligible Branches</label>
                        <div className="flex flex-wrap gap-2">
                          {["CSE", "IT", "ECE", "MECH", "CIVIL", "EE"].map((branch) => {
                            const isSelected = newAllowedBranches.includes(branch);
                            return (
                              <button
                                key={branch}
                                type="button"
                                onClick={() => toggleBranch(branch)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                  isSelected
                                    ? "bg-campus-primary text-white border-campus-primary shadow-xs"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {isSelected ? `✓ ${branch}` : `+ ${branch}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Required Skills Tag Input */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Mandatory Technical Skills</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill(skillInput);
                              }
                            }}
                            placeholder="Type skill & press Enter (e.g. Docker, Python)..."
                            className="flex-1 p-2 rounded-lg border border-campus-border bg-white outline-hidden"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => handleAddSkill(skillInput)}
                          >
                            Add
                          </Button>
                        </div>

                        {/* Chips List */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {newRequiredSkills.map((sk) => (
                            <span
                              key={sk}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-campus-primary/10 text-campus-primary border border-campus-primary/20"
                            >
                              <span>{sk}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(sk)}
                                className="hover:text-rose-600 font-bold ml-0.5"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Quick Add Suggestions */}
                        <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px] text-slate-500">
                          <span>Suggestions:</span>
                          {["Python", "FastAPI", "React", "Docker", "PostgreSQL", "Kubernetes", "AWS"].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleAddSkill(s)}
                              className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 hover:bg-slate-300"
                            >
                              +{s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setActiveModalTab("LOGISTICS")}
                      >
                        ← Back to Logistics
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          disabled={isSubmitting || !newCompany || !newRole}
                          icon={<Sparkles className="w-3.5 h-3.5" />}
                        >
                          {isSubmitting ? "Creating & Detecting Conflicts..." : "Confirm & Schedule Drive"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
