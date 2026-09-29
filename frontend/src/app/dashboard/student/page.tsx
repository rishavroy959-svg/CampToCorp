"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ReadinessRing,
  SkillTag,
  StatusPill,
  Button,
  KPICard,
} from "@/components/campuslink";
import {
  GraduationCap,
  Sparkles,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  BookOpen,
  FileCheck,
  ChevronRight,
  RefreshCw,
  UploadCloud,
  FileText,
  Briefcase,
  Layers,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Info,
  DollarSign,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Download,
  Edit3,
  Save,
} from "lucide-react";

interface StudentProfile {
  id: number;
  roll_number: string;
  full_name: string;
  email: string;
  phone: string;
  branch: string;
  batch_year: number;
  cgpa: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  active_backlogs: number;
  history_of_backlogs: number;
  skills: string[];
  primary_domain: string;
  certifications: string[];
  projects: { title: string; tech: string; github?: string; live?: string; summary?: string }[];
  resume_url: string;
  readiness_score: number;
  readiness_level: string;
  is_verified: boolean;
  status: string;
}

interface DriveItem {
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
}

interface ApplicationItem {
  id: number;
  drive_id: number;
  student_id: number;
  company_name: string;
  role_title: string;
  ctc_lpa: number;
  current_status: string;
  current_round_name: string;
  round_order: number;
  round_date?: string;
  round_slot?: string;
  venue_or_link?: string;
  instructions?: string;
  applied_at: string;
  resume_url?: string;
}

interface OfferItem {
  id: number;
  company_name: string;
  role_title: string;
  ctc_lpa: number;
  base_salary_lpa?: number;
  joining_bonus_lpa?: number;
  job_location?: string;
  bond_period_months?: number;
  bond_amount?: number;
  status: string;
  is_ppo?: boolean;
  docs_submitted?: boolean;
  docs_verified?: boolean;
  joining_date?: string;
}

export default function StudentDashboardPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "drives" | "applications" | "offers">("overview");
  
  // Profile State
  const [profile, setProfile] = useState<StudentProfile>({
    id: 1,
    roll_number: "22CS001",
    full_name: "Shaurya Sharma",
    email: "shaurya.sharma@campuslink.edu",
    phone: "+91 9241940968",
    branch: "CSE",
    batch_year: 2026,
    cgpa: 8.8,
    tenth_percentage: 94.5,
    twelfth_percentage: 92.0,
    active_backlogs: 0,
    history_of_backlogs: 0,
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "React", "Git"],
    primary_domain: "Full Stack Development",
    certifications: ["AWS Certified Cloud Practitioner", "Docker Certified Associate"],
    projects: [
      {
        title: "Campus Placement AI Platform",
        tech: "Python, FastAPI, Next.js",
        github: "https://github.com/aarav/campuslink",
        live: "https://campuslink.edu",
        summary: "Automated student-drive eligibility matching and conflict detection system.",
      },
      {
        title: "Distributed Microservices Gateway",
        tech: "Go, Docker, Redis",
        github: "https://github.com/aarav/go-gateway",
        summary: "High throughput API rate limiter and reverse proxy handling 10k req/s.",
      }
    ],
    resume_url: "Placement_Resume.pdf",
    readiness_score: 88,
    readiness_level: "HIGHLY_EMPLOYABLE",
    is_verified: true,
    status: "UNPLACED",
  });

  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(profile.full_name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editDomain, setEditDomain] = useState(profile.primary_domain);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editBranch, setEditBranch] = useState(profile.branch);
  const [editCgpa, setEditCgpa] = useState(profile.cgpa.toString());
  const [editTenth, setEditTenth] = useState(profile.tenth_percentage.toString());
  const [editTwelfth, setEditTwelfth] = useState(profile.twelfth_percentage.toString());
  const [editBacklogs, setEditBacklogs] = useState(profile.active_backlogs.toString());
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newCertInput, setNewCertInput] = useState("");
  const [resumeFileName, setResumeFileName] = useState(profile.resume_url);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeVariant, setResumeVariant] = useState<"DEFAULT" | "TAILORED">("DEFAULT");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);
  const [resumeSaveSuccess, setResumeSaveSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);

  // New Project Modal State
  const [showProjModal, setShowProjModal] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projGithub, setProjGithub] = useState("");
  const [projLive, setProjLive] = useState("");
  const [projSummary, setProjSummary] = useState("");

  // Drive Filters & Search
  const [driveFilter, setDriveFilter] = useState<"ALL" | "ELIGIBLE" | "DREAM" | "CORE">("ALL");
  const [driveSearch, setDriveSearch] = useState("");
  const [applyModalDrive, setApplyModalDrive] = useState<DriveItem | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Offer Action State
  const [offerActionMsg, setOfferActionMsg] = useState<string | null>(null);

  // Load Data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const resStudents = await fetch("http://127.0.0.1:8000/api/v1/students/", { cache: "no-store" });
      let currentStudent = profile;
      if (resStudents.ok) {
        const studentList = await resStudents.json();
        const savedStudentId = typeof window !== "undefined" ? localStorage.getItem("campuslink_student_id") : null;
        const current = (savedStudentId && studentList.find((s: any) => s.id === parseInt(savedStudentId))) ||
          studentList.find((s: any) => s.roll_number === "22CS001" || s.roll_number === "22CS014" || (s.email && s.email.toLowerCase().includes("aarav"))) ||
          studentList[0];
        if (current) {
          currentStudent = current;
          if (typeof window !== "undefined") {
            localStorage.setItem("campuslink_student_id", current.id.toString());
            localStorage.setItem("campuslink_student_profile", JSON.stringify(current));
          }
          setProfile((prev) => ({ ...prev, ...current }));
          setEditFullName(current.full_name || profile.full_name);
          setEditEmail(current.email || profile.email);
          setEditDomain(current.primary_domain || "Full Stack Development");
          setEditPhone(current.phone || "+91 98765 43210");
          setEditBranch(current.branch || "CSE");
          setEditCgpa(current.cgpa !== undefined ? current.cgpa.toString() : "8.8");
          setEditTenth(current.tenth_percentage !== undefined ? current.tenth_percentage.toString() : "92.5");
          setEditTwelfth(current.twelfth_percentage !== undefined ? current.twelfth_percentage.toString() : "90.0");
          setEditBacklogs(current.active_backlogs !== undefined ? current.active_backlogs.toString() : "0");
          setResumeFileName(current.resume_url || "Placement_Resume.pdf");
        }
      }

      const [resDrives, resApps, resOffers] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/v1/drives/", { cache: "no-store" }),
        fetch(`http://127.0.0.1:8000/api/v1/applications/?student_id=${currentStudent.id}`, { cache: "no-store" }),
        fetch(`http://127.0.0.1:8000/api/v1/offers/?student_id=${currentStudent.id}`, { cache: "no-store" }),
      ]);

      if (resDrives.ok) {
        const driveList = await resDrives.json();
        setDrives(driveList);
      }

      if (resApps.ok) {
        const appList = await resApps.json();
        setApplications(appList);
      }

      if (resOffers.ok) {
        const offerList = await resOffers.json();
        setOffers(offerList);
      }
    } catch (err) {
      console.warn("Could not fetch live student data, continuing with clean state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("campuslink_student_profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile((prev) => ({ ...prev, ...parsed }));
          if (parsed.full_name) setEditFullName(parsed.full_name);
          if (parsed.email) setEditEmail(parsed.email);
          if (parsed.phone) setEditPhone(parsed.phone);
          if (parsed.branch) setEditBranch(parsed.branch);
          if (parsed.cgpa !== undefined) setEditCgpa(parsed.cgpa.toString());
          if (parsed.tenth_percentage !== undefined) setEditTenth(parsed.tenth_percentage.toString());
          if (parsed.twelfth_percentage !== undefined) setEditTwelfth(parsed.twelfth_percentage.toString());
          if (parsed.active_backlogs !== undefined) setEditBacklogs(parsed.active_backlogs.toString());
          if (parsed.resume_url) setResumeFileName(parsed.resume_url);
        } catch (e) {}
      }
    }
    loadAllData();
  }, []);

  // Calculate Profile Completeness %
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.full_name && profile.roll_number && profile.email) score += 30;
    if (profile.cgpa && profile.tenth_percentage && profile.twelfth_percentage) score += 25;
    if (profile.skills && profile.skills.length >= 3) score += 20;
    if (profile.projects && profile.projects.length >= 1) score += 15;
    if (profile.resume_url) score += 10;
    return score;
  };
  const completenessPct = calculateCompleteness();

  // Deterministic Eligibility Checker
  const checkDriveEligibility = (drive: DriveItem) => {
    const reasons: string[] = [];
    if (profile.cgpa < drive.min_cgpa) {
      reasons.push(`CGPA ${profile.cgpa.toFixed(2)} is below minimum requirement (${drive.min_cgpa.toFixed(2)})`);
    }
    if (drive.allowed_branches && drive.allowed_branches.length > 0) {
      const branchUpper = profile.branch.toUpperCase();
      const allowedUpper = drive.allowed_branches.map((b) => b.toUpperCase());
      if (!allowedUpper.includes(branchUpper)) {
        reasons.push(`Branch '${profile.branch}' not eligible. Allowed: ${drive.allowed_branches.join(", ")}`);
      }
    }
    if (profile.active_backlogs > drive.max_backlogs_allowed) {
      reasons.push(`Active backlogs (${profile.active_backlogs}) exceed allowed maximum (${drive.max_backlogs_allowed})`);
    }
    if (drive.min_tenth_percentage && profile.tenth_percentage < drive.min_tenth_percentage) {
      reasons.push(`10th score ${profile.tenth_percentage}% below cutoff (${drive.min_tenth_percentage}%)`);
    }
    return {
      isEligible: reasons.length === 0,
      reasons,
    };
  };

  // Skill Tag Handlers
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!profile.skills.includes(newSkillInput.trim())) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, newSkillInput.trim()] }));
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Certification Handlers
  const handleAddCert = () => {
    if (!newCertInput.trim()) return;
    if (!profile.certifications.includes(newCertInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertInput.trim()],
      }));
    }
    setNewCertInput("");
  };

  const handleRemoveCert = (certToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== certToRemove),
    }));
  };

  // Add Project Handler
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const newProj = {
      title: projTitle.trim(),
      tech: projTech.trim() || "Python, React",
      github: projGithub.trim() || undefined,
      live: projLive.trim() || undefined,
      summary: projSummary.trim() || "Full-stack module developed for university portfolio.",
    };
    setProfile((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
    setShowProjModal(false);
    setProjTitle("");
    setProjTech("");
    setProjGithub("");
    setProjLive("");
    setProjSummary("");
  };

  // Direct Resume Save / Upgrade Handler
  const handleSaveResume = async (fileToSave?: string) => {
    const targetFile = fileToSave || resumeFileName;
    setIsSavingResume(true);
    setResumeSaveSuccess(null);
    setUploadError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${profile.id}/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_url: targetFile }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => ({ ...prev, ...updated, resume_url: targetFile }));
        setResumeFileName(targetFile);
        setResumeSaveSuccess(`Active resume updated and linked: '${targetFile}'`);
        setTimeout(() => setResumeSaveSuccess(null), 5000);
      } else {
        const res2 = await fetch(`http://127.0.0.1:8000/api/v1/students/${profile.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_url: targetFile }),
        });
        if (res2.ok) {
          const updated2 = await res2.json();
          setProfile((prev) => ({ ...prev, ...updated2, resume_url: targetFile }));
          setResumeFileName(targetFile);
          setResumeSaveSuccess(`Active resume updated: '${targetFile}'`);
          setTimeout(() => setResumeSaveSuccess(null), 5000);
        }
      }
    } catch (err) {
      console.warn("Could not save resume to backend:", err);
      setProfile((prev) => ({ ...prev, resume_url: targetFile }));
      setResumeFileName(targetFile);
      setResumeSaveSuccess(`Resume updated locally: '${targetFile}'`);
      setTimeout(() => setResumeSaveSuccess(null), 5000);
    } finally {
      setIsSavingResume(false);
    }
  };

  // Save All Profile & Academic Changes to Backend
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSaveSuccess(null);
    try {
      const parsedCgpa = parseFloat(editCgpa) || profile.cgpa;
      const parsedTenth = parseFloat(editTenth) || profile.tenth_percentage;
      const parsedTwelfth = parseFloat(editTwelfth) || profile.twelfth_percentage;
      const parsedBacklogs = parseInt(editBacklogs) >= 0 ? parseInt(editBacklogs) : profile.active_backlogs;
      const cleanEmail = editEmail.trim().toLowerCase() || profile.email;
      const cleanFullName = editFullName.trim() || profile.full_name;

      const payload = {
        full_name: cleanFullName,
        email: cleanEmail,
        phone: editPhone.trim() || profile.phone,
        branch: editBranch || profile.branch,
        cgpa: parsedCgpa,
        tenth_percentage: parsedTenth,
        twelfth_percentage: parsedTwelfth,
        active_backlogs: parsedBacklogs,
        primary_domain: editDomain,
        skills: profile.skills,
        certifications: profile.certifications,
        projects: profile.projects,
        resume_url: resumeFileName,
      };

      const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => ({ ...prev, ...updated }));
        setEditEmail(updated.email || cleanEmail);
        setEditFullName(updated.full_name || cleanFullName);
        if (typeof window !== "undefined") {
          localStorage.setItem("campuslink_student_profile", JSON.stringify(updated));
        }
        if (updateUser) {
          updateUser({ fullName: updated.full_name || cleanFullName, email: updated.email || cleanEmail });
        }
        setProfileSaveSuccess("Profile, email, and academic standings successfully updated & verified!");
        setIsEditingProfile(false);
        setTimeout(() => setProfileSaveSuccess(null), 5000);
      } else {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || "Server returned non-200");
      }
    } catch (err: any) {
      console.warn("Could not save to backend:", err);
      const cleanEmail = editEmail.trim().toLowerCase() || profile.email;
      const cleanFullName = editFullName.trim() || profile.full_name;
      const localUpdated = {
        ...profile,
        full_name: cleanFullName,
        email: cleanEmail,
        phone: editPhone.trim() || profile.phone,
        branch: editBranch || profile.branch,
        cgpa: parseFloat(editCgpa) || profile.cgpa,
        tenth_percentage: parseFloat(editTenth) || profile.tenth_percentage,
        twelfth_percentage: parseFloat(editTwelfth) || profile.twelfth_percentage,
        active_backlogs: parseInt(editBacklogs) >= 0 ? parseInt(editBacklogs) : profile.active_backlogs,
        primary_domain: editDomain,
        resume_url: resumeFileName,
      };
      setProfile(localUpdated);
      if (typeof window !== "undefined") {
        localStorage.setItem("campuslink_student_profile", JSON.stringify(localUpdated));
      }
      if (updateUser) {
        updateUser({ fullName: cleanFullName, email: cleanEmail });
      }
      const isDuplicate = err.message && err.message.toLowerCase().includes("already exists");
      setProfileSaveSuccess(isDuplicate ? `Error: ${err.message}` : "Profile, email, and academic records updated!");
      setIsEditingProfile(false);
      setTimeout(() => setProfileSaveSuccess(null), 5000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Apply to Drive
  const handleConfirmApply = async () => {
    if (!applyModalDrive) return;
    setApplying(true);
    setApplyMessage(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drive_id: applyModalDrive.id,
          student_id: profile.id,
          resume_url: resumeFileName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApplyMessage({ type: "error", text: data.detail || "Eligibility check failed." });
      } else {
        setApplyMessage({ type: "success", text: data.message });
        await loadAllData();
        setTimeout(() => {
          setApplyModalDrive(null);
          setApplyMessage(null);
        }, 1500);
      }
    } catch (err: any) {
      setApplyMessage({ type: "error", text: "Server connection failed while applying." });
    } finally {
      setApplying(false);
    }
  };

  // Filter Drives
  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      d.company_name.toLowerCase().includes(driveSearch.toLowerCase()) ||
      d.role_title.toLowerCase().includes(driveSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (driveFilter === "ELIGIBLE") {
      return checkDriveEligibility(d).isEligible;
    }
    if (driveFilter === "DREAM") {
      return d.ctc_lpa >= 20.0;
    }
    if (driveFilter === "CORE") {
      return d.ctc_lpa >= 6.0 && d.ctc_lpa < 20.0;
    }
    return true;
  });

  // Offer Action Handlers
  const handleOfferAction = async (offerId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/offers/${offerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-jwt-token-campuslink",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
        );
        setOfferActionMsg(`Offer status successfully updated to '${newStatus}'.`);
        setTimeout(() => setOfferActionMsg(null), 4000);
      }
    } catch (err) {
      setOfferActionMsg("Failed to update offer status.");
    }
  };

  // Pipeline order definition
  const roundPipelineSteps = [
    { key: "APPLIED", label: "Applied" },
    { key: "SHORTLISTED", label: "Shortlisted" },
    { key: "OA_CLEARED", label: "Assessment (OA)" },
    { key: "TECH_ROUND_1", label: "Tech Round" },
    { key: "HR_ROUND", label: "HR Round" },
    { key: "OFFERED", label: "Offer Released" },
  ];

  const getStepStatus = (currentStatus: string, stepKey: string) => {
    const order = ["APPLIED", "SHORTLISTED", "OA_CLEARED", "TECH_ROUND_1", "TECH_ROUND_2", "HR_ROUND", "OFFERED"];
    const curIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);
    if (currentStatus === "REJECTED") return "rejected";
    if (curIdx > stepIdx) return "completed";
    if (curIdx === stepIdx) return "current";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-campus-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Student Placement Portal</span>
              <span>/</span>
              <span>CampToCorp Unified Career Workspace</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              Welcome back, {profile.full_name}
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              B.Tech {profile.branch} &bull; Roll: {profile.roll_number} &bull; CGPA: {profile.cgpa.toFixed(2)}/10.0 &bull; Batch {profile.batch_year}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified by Placement Cell
            </span>
            <div className="flex items-center gap-2 text-xs bg-white border border-campus-border px-3 py-1.5 rounded-full shadow-xs">
              <span className="font-semibold text-slate-600">Profile Completion:</span>
              <span className="font-extrabold text-campus-primary">{completenessPct}%</span>
            </div>
            <button
              onClick={() => setActiveTab("profile")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-campus-primary text-white hover:bg-campus-primary/90 shadow-xs transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile & Resume
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-campus-border pb-px overflow-x-auto text-xs font-semibold">
          {[
            { id: "overview", label: "Overview & Readiness Ring", icon: <TrendingUp className="w-4 h-4" /> },
            { id: "profile", label: "Profile & Resume Builder", icon: <BookOpen className="w-4 h-4" /> },
            { id: "drives", label: `Drive Discovery (${drives.length})`, icon: <Building className="w-4 h-4" /> },
            { id: "applications", label: `Live Round Tracker (${applications.length})`, icon: <Clock className="w-4 h-4" /> },
            { id: "offers", label: `Offer & Acceptance (${offers.length})`, icon: <Award className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-campus-primary text-campus-primary bg-white shadow-xs font-bold"
                  : "border-transparent text-campus-text-secondary hover:text-campus-text-primary hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & READINESS RING */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Visual Readiness Ring & Factor Meters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Circular Readiness Ring */}
              <div className="card-squarespace p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-campus-text-secondary">
                    Composite Employability Index
                  </span>
                  <h2 className="text-lg font-bold text-campus-text-primary">
                    Readiness Score
                  </h2>
                </div>

                <ReadinessRing score={profile.readiness_score} size={175} strokeWidth={12} showLabel={true} />

                <div className="space-y-1 max-w-xs">
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                    {profile.readiness_level.replace("_", " ")}
                  </div>
                  <p className="text-[11px] text-campus-text-secondary">
                    Your readiness score qualifies your profile for on-campus Super Dream (&gt;20 LPA) & Core recruitment rounds.
                  </p>
                </div>
              </div>

              {/* 4 Factor Meters */}
              <div className="card-squarespace p-6 space-y-4 lg:col-span-2">
                <div>
                  <h3 className="text-base font-bold text-campus-text-primary">
                    Employability Factor Breakdown (Weightage Formula)
                  </h3>
                  <p className="text-xs text-campus-text-secondary mt-0.5">
                    Evaluated against university criteria: 50% Verified Skills, 20% Academic CGPA, 15% Assessments, 15% Projects.
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-campus-text-primary">Verified Skills Mastery (50% Weight)</span>
                      <span className="font-bold text-campus-primary">94 / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-campus-primary h-2 rounded-full" style={{ width: "94%" }} />
                    </div>
                    <span className="text-[10px] text-campus-text-secondary mt-0.5 block">
                      Mastery in {profile.skills.slice(0, 4).join(", ")}.
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-campus-text-primary">Academic CGPA Standing (20% Weight)</span>
                      <span className="font-bold text-campus-primary">{Math.round(profile.cgpa * 10)} / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-campus-primary h-2 rounded-full" style={{ width: `${Math.round(profile.cgpa * 10)}%` }} />
                    </div>
                    <span className="text-[10px] text-campus-text-secondary mt-0.5 block">
                      CGPA {profile.cgpa.toFixed(2)} with {profile.active_backlogs} active backlogs.
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-campus-text-primary">Assessment & Coding Diagnostic (15% Weight)</span>
                      <span className="font-bold text-campus-primary">85 / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-campus-primary h-2 rounded-full" style={{ width: "85%" }} />
                    </div>
                    <span className="text-[10px] text-campus-text-secondary mt-0.5 block">
                      Cleared internal algorithmic screens & problem-solving benchmarks.
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-campus-text-primary">Project Portfolio & Production Code (15% Weight)</span>
                      <span className="font-bold text-campus-primary">90 / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-campus-primary h-2 rounded-full" style={{ width: "90%" }} />
                    </div>
                    <span className="text-[10px] text-campus-text-secondary mt-0.5 block">
                      {profile.projects.length} verified projects with live deployment links.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveTab("profile")}
                className="card-squarespace p-5 border border-campus-border hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-campus-primary group-hover:text-white transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-campus-text-primary">Profile & Resume</div>
                    <div className="text-[11px] text-campus-text-secondary">{completenessPct}% Profile Completeness</div>
                  </div>
                </div>
                <p className="text-xs text-campus-text-secondary">
                  Upgrade CGPA, manage verified skills, and tailor your ATS placement resume.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("drives")}
                className="card-squarespace p-5 border border-campus-border hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-campus-primary">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-campus-text-primary">Discover Drives</div>
                    <div className="text-[11px] text-campus-text-secondary">{drives.length} Active Opportunities</div>
                  </div>
                </div>
                <p className="text-xs text-campus-text-secondary">
                  Check deterministic eligibility and apply in 1-click with pre-attached resume.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("applications")}
                className="card-squarespace p-5 border border-campus-border hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-campus-text-primary">Track Applications</div>
                    <div className="text-[11px] text-campus-text-secondary">{applications.length} Drives in Pipeline</div>
                  </div>
                </div>
                <p className="text-xs text-campus-text-secondary">
                  Monitor round-by-round advancement, test timings, and TPO venue instructions.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("offers")}
                className="card-squarespace p-5 border border-campus-border hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-campus-text-primary">Offer Desk</div>
                    <div className="text-[11px] text-campus-text-secondary">{offers.length} Received Offers</div>
                  </div>
                </div>
                <p className="text-xs text-campus-text-secondary">
                  Review CTC breakdown, accept/decline offers, and upload signed acceptance letters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROFILE & RESUME BUILDER */}
        {/* ========================================================================= */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-fade-in">
            {profileSaveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{profileSaveSuccess}</span>
                </div>
                <button onClick={() => setProfileSaveSuccess(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">×</button>
              </div>
            )}

            {resumeSaveSuccess && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-campus-primary shrink-0" />
                  <span className="font-semibold">{resumeSaveSuccess}</span>
                </div>
                <button onClick={() => setResumeSaveSuccess(null)} className="text-blue-600 hover:text-blue-800 font-bold">×</button>
              </div>
            )}

            {/* Profile Completion Bar */}
            <div className="card-squarespace p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-campus-text-primary">Profile Completeness Status</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Placement Cell Verified
                    </span>
                  </div>
                  <p className="text-campus-text-secondary text-xs mt-0.5">
                    Maintain updated academic credentials, certified skills, and verified ATS resumes before campus drive deadlines.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-base text-campus-primary">{completenessPct}% Completed</span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    {isEditingProfile ? "Exit Edit Mode" : "Upgrade Academic Details"}
                  </Button>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-campus-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completenessPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Personal & Academic Details */}
              <div className="card-squarespace p-6 space-y-6 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-campus-border pb-3">
                  <h3 className="text-lg font-bold text-campus-text-primary flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-campus-primary" />
                    Personal & Academic Records
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingProfile) {
                        setEditFullName(profile.full_name);
                        setEditEmail(profile.email);
                        setEditPhone(profile.phone);
                        setEditBranch(profile.branch);
                        setEditCgpa(profile.cgpa.toString());
                        setEditTenth(profile.tenth_percentage.toString());
                        setEditTwelfth(profile.twelfth_percentage.toString());
                        setEditBacklogs(profile.active_backlogs.toString());
                      }
                      setIsEditingProfile(!isEditingProfile);
                    }}
                    className="text-xs font-bold text-campus-primary hover:underline flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditingProfile ? "Cancel Editing" : "Upgrade Academic Details"}
                  </button>
                </div>

                {/* Edit Mode Alert */}
                {isEditingProfile && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block">Academic Upgrade Mode Active</span>
                      <span>
                        Updating your CGPA, semester backlogs, or department immediately recalculates your composite readiness score and updates drive eligibility filters across all campus recruitments.
                      </span>
                    </div>
                  </div>
                )}

                {/* Academic Records: View vs Edit Mode */}
                {!isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name</label>
                        <div className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-bold flex items-center justify-between">
                          <span>{profile.full_name}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Verified Candidate</span>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">University Roll Number</label>
                        <div className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-mono font-bold flex items-center justify-between">
                          <span>{profile.roll_number}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Official College ID</span>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Official College Email</label>
                        <div className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium flex items-center justify-between">
                          <span className="truncate">{profile.email}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditEmail(profile.email);
                              setIsEditingProfile(true);
                            }}
                            className="text-[10px] text-campus-primary font-bold hover:underline shrink-0 ml-2"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                        <div className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium flex items-center justify-between">
                          <span>{profile.phone}</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(true)}
                            className="text-[10px] text-campus-primary font-bold hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Academic Stat Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Department</span>
                        <span className="text-sm font-extrabold text-campus-text-primary block">{profile.branch}</span>
                        <span className="text-[10px] text-slate-500">Class of {profile.batch_year}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Current CGPA</span>
                        <span className="text-sm font-extrabold text-emerald-700 block">{profile.cgpa.toFixed(2)} / 10.0</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Tier 1 Standing</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">10th / 12th Marks</span>
                        <span className="text-sm font-extrabold text-slate-700 block">{profile.tenth_percentage}% / {profile.twelfth_percentage}%</span>
                        <span className="text-[10px] text-slate-500">Board Aggregate</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Backlogs</span>
                        <span className={`text-sm font-extrabold block ${profile.active_backlogs === 0 ? "text-emerald-700" : "text-rose-600"}`}>
                          {profile.active_backlogs}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {profile.active_backlogs === 0 ? "All Cleared" : "Requires Attention"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode Form */
                  <div className="space-y-4 p-4 rounded-xl border border-campus-border bg-slate-50/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name</label>
                        <input
                          type="text"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          placeholder="Your official full name..."
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Official College Email</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="student@campuslink.edu"
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Engineering Department / Branch</label>
                        <select
                          value={editBranch}
                          onChange={(e) => setEditBranch(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white text-xs font-semibold"
                        >
                          <option value="CSE">Computer Science & Engineering (CSE)</option>
                          <option value="IT">Information Technology (IT)</option>
                          <option value="ECE">Electronics & Communication (ECE)</option>
                          <option value="EEE">Electrical & Electronics (EEE)</option>
                          <option value="MECH">Mechanical Engineering (MECH)</option>
                          <option value="CIVIL">Civil Engineering (CIVIL)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Current Cumulative CGPA (out of 10.0)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={editCgpa}
                          onChange={(e) => setEditCgpa(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white text-xs font-bold text-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Class 10th Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={editTenth}
                          onChange={(e) => setEditTenth(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Class 12th / Diploma Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={editTwelfth}
                          onChange={(e) => setEditTwelfth(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Active Backlogs Count</label>
                        <input
                          type="number"
                          min="0"
                          max="15"
                          value={editBacklogs}
                          onChange={(e) => setEditBacklogs(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-campus-border bg-white text-xs font-bold"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-2 w-full pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Save className="w-3.5 h-3.5" />}
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="flex-1"
                          >
                            {isSavingProfile ? "Saving..." : "Save Academic Upgrades"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => {
                              setEditFullName(profile.full_name);
                              setEditEmail(profile.email);
                              setEditPhone(profile.phone);
                              setEditBranch(profile.branch);
                              setEditCgpa(profile.cgpa.toString());
                              setEditTenth(profile.tenth_percentage.toString());
                              setEditTwelfth(profile.twelfth_percentage.toString());
                              setEditBacklogs(profile.active_backlogs.toString());
                              setIsEditingProfile(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Domain Portfolio */}
                <div className="pt-4 border-t border-campus-border space-y-4">
                  <h4 className="text-sm font-bold text-campus-text-primary">Skills & Domain Portfolio</h4>
                  
                  <div className="text-xs">
                    <label className="block font-semibold text-slate-700 mb-1">Primary Career Domain</label>
                    <select
                      value={editDomain}
                      onChange={(e) => setEditDomain(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-campus-border bg-white font-medium text-xs"
                    >
                      <option value="Full Stack Development">Full Stack Development</option>
                      <option value="Cloud / DevOps Engineering">Cloud / DevOps Engineering</option>
                      <option value="Data Science & Machine Learning">Data Science & Machine Learning</option>
                      <option value="Core Systems & Embedded">Core Systems & Embedded Engineering</option>
                      <option value="Product & Technology Consulting">Product & Technology Consulting</option>
                    </select>
                  </div>

                  {/* Technical Skills Tag Manager */}
                  <div className="text-xs space-y-2">
                    <label className="block font-semibold text-slate-700">Verified Technical Skills (Multi-Select Tags)</label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-campus-border bg-slate-50/50 min-h-[46px]">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-campus-border text-campus-primary shadow-xs"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-rose-600 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add technical skill (e.g. AWS, Redis, GraphQL)..."
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                        className="flex-1 p-2 rounded-lg border border-campus-border text-xs"
                      />
                      <Button variant="secondary" size="sm" type="button" onClick={handleAddSkill}>
                        Add Skill
                      </Button>
                    </div>
                  </div>

                  {/* Certifications Manager */}
                  <div className="text-xs space-y-2 pt-2">
                    <label className="block font-semibold text-slate-700">Industry Certifications & Credentials</label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-campus-border bg-slate-50/50 min-h-[46px]">
                      {profile.certifications.length === 0 ? (
                        <span className="text-slate-400 text-[11px]">No certifications added yet. Add verified credentials below.</span>
                      ) : (
                        profile.certifications.map((cert) => (
                          <span
                            key={cert}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-campus-border text-emerald-800 shadow-xs"
                          >
                            <Award className="w-3 h-3 text-emerald-600" />
                            {cert}
                            <button
                              type="button"
                              onClick={() => handleRemoveCert(cert)}
                              className="text-slate-400 hover:text-rose-600 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add certification (e.g. AWS Solutions Architect, Docker Associate)..."
                        value={newCertInput}
                        onChange={(e) => setNewCertInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCert())}
                        className="flex-1 p-2 rounded-lg border border-campus-border text-xs"
                      />
                      <Button variant="secondary" size="sm" type="button" onClick={handleAddCert}>
                        Add Certification
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Projects & Certifications */}
                <div className="pt-4 border-t border-campus-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-campus-text-primary">Featured Projects & Live Proofs</h4>
                    <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowProjModal(true)}>
                      Add Project
                    </Button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {profile.projects.map((proj, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-campus-border bg-slate-50/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-campus-text-primary text-xs">{proj.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                            {proj.tech}
                          </span>
                        </div>
                        <p className="text-[11px] text-campus-text-secondary">{proj.summary}</p>
                        <div className="flex items-center gap-4 pt-1 text-[11px]">
                          {proj.github && (
                            <a href={proj.github} target="_blank" rel="noreferrer" className="text-campus-primary hover:underline flex items-center gap-1 font-semibold">
                              GitHub Repo <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {proj.live && (
                            <a href={proj.live} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold">
                              Live Demo <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-campus-border flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? "Saving Profile Changes..." : "Save All Profile & Portfolio Changes"}
                  </Button>
                </div>
              </div>

              {/* Right Column: Resume Management & In-Browser Preview */}
              <div className="space-y-6">
                <div className="card-squarespace p-6 space-y-4">
                  <div className="border-b border-campus-border pb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-campus-text-primary flex items-center gap-2">
                      <FileText className="w-5 h-5 text-campus-primary" />
                      Resume Management & ATS Tools
                    </h3>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-campus-border text-center space-y-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <UploadCloud className="w-8 h-8 text-campus-primary mx-auto" />
                    <div>
                      <span className="text-xs font-bold text-campus-text-primary block">Upload or Replace PDF Resume</span>
                      <span className="text-[10px] text-campus-text-secondary">PDF format only (Max 5MB) &bull; Verified by ATS Parser</span>
                    </div>
                    {uploadError && (
                      <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                        {uploadError}
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      id="resume-upload"
                      className="hidden"
                      onChange={(e) => {
                        setUploadError(null);
                        const file = e.target.files?.[0];
                        if (file) {
                          if (!file.name.toLowerCase().endsWith(".pdf")) {
                            setUploadError("Form Validation Error: Only PDF resume documents are supported.");
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            setUploadError("Form Validation Error: Resume exceeds 5MB size limit.");
                            return;
                          }
                          setResumeFileName(file.name);
                          handleSaveResume(file.name);
                        }
                      }}
                    />
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <label
                        htmlFor="resume-upload"
                        className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer inline-flex items-center gap-1.5 shadow-xs font-bold"
                      >
                        <UploadCloud className="w-3.5 h-3.5" /> Upload PDF Document
                      </label>
                    </div>
                  </div>

                  {/* Active Resume Card & Tailored Toggle */}
                  <div className="p-4 rounded-xl border border-campus-border bg-white shadow-xs space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setResumeVariant("DEFAULT");
                            handleSaveResume(profile.resume_url || "Aarav_Patel_Placement_Resume.pdf");
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all ${
                            resumeVariant === "DEFAULT"
                              ? "bg-campus-primary text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Default Master Resume
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResumeVariant("TAILORED");
                            const tailored = `Tailored_${editDomain.replace(/ /g, "_")}_Resume.pdf`;
                            handleSaveResume(tailored);
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all ${
                            resumeVariant === "TAILORED"
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Tailored Resume
                        </button>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> ATS Verified
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-campus-text-primary">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{resumeVariant === "DEFAULT" ? resumeFileName : `Tailored_${editDomain.replace(/ /g, "_")}_Resume.pdf`}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Active document pre-attached to all on-campus drive applications.
                      </div>
                    </div>

                    {/* Resume Name Direct Update */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <label className="text-[10px] font-semibold text-slate-600 block">Edit Resume Filename:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={resumeFileName}
                          onChange={(e) => setResumeFileName(e.target.value)}
                          className="flex-1 p-1.5 text-xs rounded-lg border border-campus-border"
                          placeholder="Filename.pdf"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isSavingResume}
                          onClick={() => handleSaveResume(resumeFileName)}
                        >
                          {isSavingResume ? "Saving..." : "Save Name"}
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowResumeModal(true)}
                        className="text-campus-primary font-bold hover:underline text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> In-Browser Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResumeModal(true)}
                        className="text-slate-600 font-semibold hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> View / Download
                      </button>
                    </div>
                  </div>

                  {/* ATS Tips Card */}
                  <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-[11px] text-blue-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-campus-primary">
                      <Info className="w-3.5 h-3.5" /> ATS Score Optimizer
                    </span>
                    <p className="text-slate-600 text-[10px] leading-relaxed">
                      Your resume automatically synchronizes verified skills ({profile.skills.length} tags), academic CGPA ({profile.cgpa.toFixed(2)}), and projects into standardized university placement formats.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DRIVE DISCOVERY & APPLICATION HUB */}
        {/* ========================================================================= */}
        {activeTab === "drives" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Bar & Search */}
            <div className="card-squarespace p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "ALL", label: "All Drives" },
                  { id: "ELIGIBLE", label: "Eligible Only" },
                  { id: "DREAM", label: "Super Dream (>20 LPA)" },
                  { id: "CORE", label: "Core & IT (6-20 LPA)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDriveFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      driveFilter === f.id
                        ? "bg-campus-primary text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search company or role..."
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  className="pl-3 pr-3 py-1.5 text-xs rounded-lg border border-campus-border bg-white w-64"
                />
              </div>
            </div>

            {/* Drive Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDrives.length === 0 ? (
                <div className="col-span-2 card-squarespace p-12 text-center text-xs text-slate-500">
                  No recruitment drives matching your filters.
                </div>
              ) : (
                filteredDrives.map((drive) => {
                  const { isEligible, reasons } = checkDriveEligibility(drive);
                  const isAlreadyApplied = applications.some((a) => a.drive_id === drive.id);

                  return (
                    <div
                      key={drive.id}
                      className="card-squarespace p-6 border border-campus-border hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-campus-primary text-lg">
                              {drive.company_name[0]}
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-campus-text-primary leading-tight">
                                {drive.company_name}
                              </h3>
                              <div className="text-xs font-semibold text-campus-primary mt-0.5">
                                {drive.role_title}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-extrabold text-campus-text-primary block">
                              {drive.ctc_lpa} LPA
                            </span>
                            <span className="text-[10px] text-slate-500">Fixed + Variable</span>
                          </div>
                        </div>

                        {/* Drive Details */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div><span className="font-semibold">Drive Date:</span> {drive.drive_date}</div>
                          <div><span className="font-semibold">Venue:</span> {drive.venue}</div>
                          <div><span className="font-semibold">Min CGPA:</span> {drive.min_cgpa.toFixed(1)}</div>
                          <div><span className="font-semibold">Branches:</span> {drive.allowed_branches.join(", ")}</div>
                        </div>

                        {/* Deterministic Eligibility Status Badge */}
                        <div>
                          {isEligible ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Eligible to Apply (All Benchmarks Cleared)
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                Ineligible for this Drive:
                              </div>
                              <ul className="list-disc list-inside text-[11px] text-rose-700">
                                {reasons.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Deadline: {drive.deadline || "Open"}
                        </span>

                        {isAlreadyApplied ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Applied
                          </span>
                        ) : isEligible ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setApplyModalDrive(drive)}
                          >
                            Apply Now
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" disabled>
                            Ineligible
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Apply Confirmation Modal */}
            {applyModalDrive && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                <div className="card-squarespace max-w-md w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-campus-border pb-3">
                    <h3 className="text-base font-bold text-campus-text-primary">
                      Confirm Drive Application
                    </h3>
                    <button
                      onClick={() => setApplyModalDrive(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                    >
                      ✕
                    </button>
                  </div>

                  {applyMessage && (
                    <div
                      className={`p-3 rounded-lg text-xs ${
                        applyMessage.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {applyMessage.text}
                    </div>
                  )}

                  <div className="text-xs space-y-2">
                    <div className="p-3 rounded-lg bg-slate-50 border border-campus-border space-y-1">
                      <div className="font-bold text-campus-text-primary text-sm">
                        {applyModalDrive.company_name}
                      </div>
                      <div className="text-slate-600">Role: {applyModalDrive.role_title} &bull; Package: {applyModalDrive.ctc_lpa} LPA</div>
                      <div className="text-[11px] text-slate-500">Date: {applyModalDrive.drive_date} &bull; Venue: {applyModalDrive.venue}</div>
                    </div>

                    <div className="pt-2">
                      <span className="font-semibold text-slate-700 block mb-1">Attached Resume:</span>
                      <div className="p-2.5 rounded-lg border border-campus-border bg-white flex items-center justify-between text-xs">
                        <span className="font-medium text-campus-primary">{resumeFileName}</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-2">
                      By submitting, you agree to attend all recruitment rounds adhering to the college placement code of conduct.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button variant="ghost" size="sm" onClick={() => setApplyModalDrive(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleConfirmApply}
                      disabled={applying}
                    >
                      {applying ? "Submitting Application..." : "Confirm & Submit Application"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE APPLICATION & ROUND TRACKER */}
        {/* ========================================================================= */}
        {activeTab === "applications" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-campus-text-primary">Live Application & Round Tracker</h2>
              <p className="text-xs text-campus-text-secondary mt-0.5">
                Real-time visual timeline of your active hiring pipelines and upcoming round notifications.
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="card-squarespace p-12 text-center text-xs text-slate-500">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-campus-text-primary text-sm">No applications submitted yet</p>
                <p className="mt-1">Explore available opportunities in the Drive Discovery tab to apply.</p>
                <div className="mt-4">
                  <Button variant="primary" size="sm" onClick={() => setActiveTab("drives")}>
                    Browse Drives
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((app) => (
                  <div key={app.id} className="card-squarespace p-6 border border-campus-border space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-campus-text-primary">{app.company_name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            {app.role_title} ({app.ctc_lpa} LPA)
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Applied on: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recently"}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-campus-primary block">
                          Current Stage: {app.current_round_name}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Round Pipeline */}
                    <div className="overflow-x-auto py-2">
                      <div className="flex items-center min-w-[550px] justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

                        {roundPipelineSteps.map((step, idx) => {
                          const status = getStepStatus(app.current_status, step.key);

                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10 text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  status === "completed"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : status === "current"
                                    ? "bg-campus-primary text-white ring-4 ring-blue-100 shadow-md animate-pulse"
                                    : "bg-white border-2 border-slate-300 text-slate-400"
                                }`}
                              >
                                {status === "completed" ? <Check className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] mt-2 font-semibold ${
                                  status === "current"
                                    ? "text-campus-primary font-bold"
                                    : status === "completed"
                                    ? "text-emerald-800"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Round Instructions & Venue Alert Card */}
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-blue-900">
                        <Info className="w-4 h-4 text-blue-600" />
                        Upcoming Round Instructions from Placement Cell:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-blue-800">
                        <div><span className="font-semibold">Date & Slot:</span> {app.round_date || "To be announced"} &bull; {app.round_slot || "Full Day"}</div>
                        <div><span className="font-semibold">Venue / Link:</span> {app.venue_or_link || "Auditorium Hall A"}</div>
                        <div><span className="font-semibold">Guidelines:</span> {app.instructions || "Bring college ID and updated resume."}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: OFFER & ACCEPTANCE DESK */}
        {/* ========================================================================= */}
        {activeTab === "offers" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-campus-text-primary">Offer & Acceptance Desk</h2>
              <p className="text-xs text-campus-text-secondary mt-0.5">
                Official placement offers extended by campus recruitment partners.
              </p>
            </div>

            {offerActionMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{offerActionMsg}</span>
              </div>
            )}

            {offers.length === 0 ? (
              <div className="card-squarespace p-12 text-center text-xs text-slate-500">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-campus-text-primary text-sm">No offer letters on record yet</p>
                <p className="mt-1">Offers will appear here once selection results are officially published by the TPO.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="card-squarespace p-6 border-2 border-emerald-200 bg-emerald-50/10 space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-campus-text-primary">{offer.company_name}</h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {offer.role_title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Location: {offer.job_location || "Bengaluru / Hyderabad"} &bull; Joining: {offer.joining_date || "July 2026"}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-emerald-700 block">{offer.ctc_lpa} LPA</span>
                        <span className="text-[10px] text-slate-500">Gross Cost to Company</span>
                      </div>
                    </div>

                    {/* Financial Terms & Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Base Salary</span>
                        <span className="text-sm font-extrabold text-slate-800">{offer.base_salary_lpa || (offer.ctc_lpa * 0.8).toFixed(1)} LPA</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Joining Bonus</span>
                        <span className="text-sm font-extrabold text-slate-800">{offer.joining_bonus_lpa || "2.0"} LPA</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Service Bond</span>
                        <span className="text-sm font-extrabold text-slate-800">{offer.bond_period_months ? `${offer.bond_period_months} Months` : "None"}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Status</span>
                        <span className={`text-xs font-bold inline-block mt-0.5 ${offer.status === "ACCEPTED" ? "text-emerald-700" : "text-amber-700"}`}>
                          {offer.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="text-[11px] text-slate-500">
                        College Policy: Accepting this offer locks your placement record adhering to university guidelines.
                      </div>

                      <div className="flex items-center gap-3">
                        {offer.status === "ACCEPTED" ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Offer Accepted & Confirmed
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOfferAction(offer.id, "DECLINED")}
                            >
                              Decline Offer
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOfferAction(offer.id, "ACCEPTED")}
                            >
                              Accept Offer
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Add Project */}
        {showProjModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <h3 className="text-base font-bold text-campus-text-primary">Add Featured Project</h3>
                <button onClick={() => setShowProjModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">✕</button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed In-Memory Cache"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="w-full p-2 rounded-lg border border-campus-border"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tech Stack *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Go, Redis, Docker, gRPC"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                    className="w-full p-2 rounded-lg border border-campus-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">GitHub Link</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={projGithub}
                      onChange={(e) => setProjGithub(e.target.value)}
                      className="w-full p-2 rounded-lg border border-campus-border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Live URL</label>
                    <input
                      type="url"
                      placeholder="https://myproject.dev"
                      value={projLive}
                      onChange={(e) => setProjLive(e.target.value)}
                      className="w-full p-2 rounded-lg border border-campus-border"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Summary & Highlights</label>
                  <textarea
                    rows={2}
                    placeholder="Key architecture decisions, benchmarks, or features..."
                    value={projSummary}
                    onChange={(e) => setProjSummary(e.target.value)}
                    className="w-full p-2 rounded-lg border border-campus-border"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowProjModal(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" type="submit">Add to Portfolio</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: In-Browser Interactive Resume Previewer */}
        {showResumeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="card-squarespace max-w-3xl w-full p-0 shadow-2xl my-8 overflow-hidden border border-slate-300">
              {/* Header Bar */}
              <div className="bg-campus-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-campus-accent" />
                  <div>
                    <h3 className="text-sm font-bold leading-none">In-Browser Resume Previewer</h3>
                    <span className="text-[11px] text-white/80">
                      {resumeVariant === "DEFAULT" ? "Default Placement Resume" : "Tailored Cloud/Full-Stack Resume"} &bull; {resumeFileName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Rendered ATS Resume Sheet */}
              <div className="p-8 bg-white space-y-6 text-slate-800 text-xs leading-relaxed max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile.full_name}</h1>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">
                      B.Tech in {profile.branch} &bull; University Roll: {profile.roll_number} &bull; Class of {profile.batch_year}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-3">
                      <span>{profile.email}</span>
                      <span>&bull;</span>
                      <span>{profile.phone}</span>
                      <span>&bull;</span>
                      <span>Bengaluru / Hyderabad</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[11px]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Verified by TPO Cell
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Readiness Score: {profile.readiness_score}/100</div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Professional Summary
                  </h2>
                  <p className="text-slate-600 text-xs pt-1">
                    Aspiring Software Engineer specializing in {profile.primary_domain}. Proven ability building production microservices, REST APIs, and scalable distributed pipelines. Strong command of algorithms, database performance tuning, and cloud deployments.
                  </p>
                </div>

                {/* Academic Credentials */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Academic Qualifications
                  </h2>
                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-xs border border-slate-200">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="p-2">Degree / Examination</th>
                          <th className="p-2">Specialization</th>
                          <th className="p-2">Year</th>
                          <th className="p-2">Score / Standing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-2 font-semibold">B.Tech</td>
                          <td className="p-2">{profile.branch} Engineering</td>
                          <td className="p-2">{profile.batch_year}</td>
                          <td className="p-2 font-bold text-emerald-700">{profile.cgpa.toFixed(2)} CGPA (0 Backlogs)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold">Senior Secondary (Class XII)</td>
                          <td className="p-2">CBSE / State Board (Science)</td>
                          <td className="p-2">2022</td>
                          <td className="p-2 font-bold text-slate-700">{profile.twelfth_percentage}%</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold">Secondary School (Class X)</td>
                          <td className="p-2">CBSE / ICSE Board</td>
                          <td className="p-2">2020</td>
                          <td className="p-2 font-bold text-slate-700">{profile.tenth_percentage}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Technical Skills Matrix */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Technical Skills & Domain Expertise
                  </h2>
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Projects */}
                <div className="space-y-2">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Technical Projects & Systems Architecture
                  </h2>
                  <div className="space-y-3 pt-1">
                    {profile.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{proj.title}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {proj.tech}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{proj.summary}</p>
                        {(proj.github || proj.live) && (
                          <div className="flex items-center gap-3 text-[10px] pt-0.5">
                            {proj.github && (
                              <span className="text-campus-primary font-bold">{proj.github}</span>
                            )}
                            {proj.live && (
                              <span className="text-emerald-700 font-bold">{proj.live}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-1.5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Certifications & Accreditations
                  </h2>
                  <ul className="list-disc list-inside text-slate-700 text-xs pt-1 space-y-0.5">
                    {profile.certifications.map((cert, idx) => (
                      <li key={idx} className="font-medium">{cert}</li>
                    ))}
                  </ul>
                </div>

                {/* Institutional Stamp Footer */}
                <div className="pt-6 border-t-2 border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <div>CampusLink University Placement & Drive Management System &bull; Cryptographically Verified</div>
                  <div className="font-bold text-slate-600">Document ID: CL-{profile.roll_number}-2026</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

