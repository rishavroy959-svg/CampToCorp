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
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCtc, setNewCtc] = useState("18.0");
  const [newDate, setNewDate] = useState("2026-10-25");
  const [newSlot, setNewSlot] = useState<"MORNING" | "AFTERNOON" | "FULL_DAY">("FULL_DAY");
  const [newVenue, setNewVenue] = useState("Auditorium Hall B");

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

  const handleCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    // Check collision against existing drives
    const conflict = drives.find(
      (d) => d.driveDate === newDate && d.venue.toLowerCase() === newVenue.toLowerCase()
    );

    const newDrive: DriveScheduleItem = {
      id: drives.length + 1,
      companyName: newCompany,
      roleTitle: newRole,
      ctcLpa: parseFloat(newCtc) || 15.0,
      driveDate: newDate,
      slot: newSlot,
      venue: newVenue,
      panelsCount: 3,
      status: "UPCOMING",
      hasConflict: !!conflict,
      conflictSeverity: conflict ? "CRITICAL" : undefined,
      conflictDescription: conflict
        ? `Double-booking at '${newVenue}' with ${conflict.companyName} on ${newDate}.`
        : undefined,
    };

    setDrives([newDrive, ...drives]);
    setCreateModalOpen(false);
    setNewCompany("");
    setNewRole("");
  };

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <h3 className="text-lg font-bold text-campus-text-primary">Schedule Recruitment Drive</h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDrive} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-campus-text-primary mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g., Atlassian"
                    className="w-full p-2.5 rounded-lg border border-campus-border"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-campus-text-primary mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g., Software Development Engineer"
                    className="w-full p-2.5 rounded-lg border border-campus-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-campus-text-primary mb-1">Package (CTC in LPA)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newCtc}
                      onChange={(e) => setNewCtc(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-campus-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-campus-text-primary mb-1">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-campus-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-campus-text-primary mb-1">Slot</label>
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
                    <label className="block font-semibold text-campus-text-primary mb-1">Venue</label>
                    <select
                      value={newVenue}
                      onChange={(e) => setNewVenue(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-campus-border bg-white"
                    >
                      <option value="Auditorium Hall A">Auditorium Hall A</option>
                      <option value="Auditorium Hall B">Auditorium Hall B</option>
                      <option value="CS Lab Complex 1">CS Lab Complex 1</option>
                      <option value="ECE Seminar Room">ECE Seminar Room</option>
                      <option value="Main Conference Hall">Main Conference Hall</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Check Conflicts & Schedule
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
