"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ReadinessRing,
  SkillTag,
  StatusPill,
  Button,
  KPICard,
  PlacementCalendar,
  CompanyLogo,
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
  Flame,
  Star,
  Target,
  MessageSquare,
  Bot,
  Search,
  MapPin,
} from "lucide-react";
import { StudentAIChatBot } from "@/components/chat/StudentAIChatBot";


export interface CertificationItem {
  name: string;
  issuer?: string;
  issue_date?: string;
  credential_id?: string;
  file_name?: string;
  file_url?: string;
  file_size?: number;
  uploaded_at?: string;
}

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
  certifications: (string | CertificationItem)[];
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
  required_skills?: string[];
  company_rating?: number;
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

function StudentDashboardContent() {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromQuery = searchParams.get("tab") as any;

  const [activeTabState, setActiveTabState] = useState<"overview" | "calendar" | "profile" | "drives" | "applications" | "offers" | "ai-mentor">(
    tabFromQuery && ["overview", "calendar", "profile", "drives", "applications", "offers", "ai-mentor"].includes(tabFromQuery)
      ? tabFromQuery
      : "overview"
  );

  const activeTab = (tabFromQuery && ["overview", "calendar", "profile", "drives", "applications", "offers", "ai-mentor"].includes(tabFromQuery))
    ? tabFromQuery
    : activeTabState;

  const setActiveTab = (newTab: "overview" | "calendar" | "profile" | "drives" | "applications" | "offers" | "ai-mentor") => {
    setActiveTabState(newTab);
    router.replace(`/dashboard/student?tab=${newTab}`, { scroll: false });
  };
  
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
  const [newCertIssuer, setNewCertIssuer] = useState("");
  const [newCertFile, setNewCertFile] = useState<File | null>(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [certUploadError, setCertUploadError] = useState<string | null>(null);
  const [previewCertModal, setPreviewCertModal] = useState<{ name: string; url: string; file_name?: string } | null>(null);
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

  // Certification Helpers & Handlers
  const getCertName = (cert: string | CertificationItem): string => {
    return typeof cert === "string" ? cert : cert.name;
  };

  const getCertIssuer = (cert: string | CertificationItem): string | undefined => {
    return typeof cert === "string" ? undefined : cert.issuer;
  };

  const getCertFile = (cert: string | CertificationItem): { name?: string; url?: string; size?: number } | null => {
    if (typeof cert === "string") return null;
    if (cert.file_name || cert.file_url) {
      return { name: cert.file_name, url: cert.file_url, size: cert.file_size };
    }
    return null;
  };

  const handleAddCert = async () => {
    const certName = newCertInput.trim();
    if (!certName) {
      setCertUploadError("Please provide a certification title (e.g. AWS Solutions Architect).");
      return;
    }
    setCertUploadError(null);
    setIsUploadingCert(true);

    try {
      let uploadedUrl: string | undefined = undefined;
      let originalFileName: string | undefined = undefined;
      let fileSize: number | undefined = undefined;

      if (newCertFile) {
        originalFileName = newCertFile.name;
        fileSize = newCertFile.size;

        try {
          const formData = new FormData();
          formData.append("file", newCertFile);
          const uploadRes = await fetch(`http://127.0.0.1:8000/api/v1/students/${profile.id}/certificate/upload`, {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedUrl = uploadData.file_url;
          } else {
            uploadedUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(newCertFile);
            });
          }
        } catch {
          uploadedUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(newCertFile);
          });
        }
      }

      const newCertObj: CertificationItem = {
        name: certName,
        issuer: newCertIssuer.trim() || undefined,
        file_name: originalFileName,
        file_url: uploadedUrl,
        file_size: fileSize,
        uploaded_at: new Date().toISOString(),
      };

      setProfile((prev) => {
        const filtered = prev.certifications.filter(
          (c) => getCertName(c).toLowerCase() !== certName.toLowerCase()
        );
        return {
          ...prev,
          certifications: [...filtered, newCertObj],
        };
      });

      setNewCertInput("");
      setNewCertIssuer("");
      setNewCertFile(null);
    } catch (err: any) {
      setCertUploadError(err?.message || "Failed to process certificate.");
    } finally {
      setIsUploadingCert(false);
    }
  };

  const handleUploadProofForCert = async (certItem: string | CertificationItem, file: File) => {
    const certName = getCertName(certItem);
    try {
      let uploadedUrl: string | undefined = undefined;
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${profile.id}/certificate/upload`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrl = data.file_url;
        } else {
          uploadedUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        }
      } catch {
        uploadedUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      const updatedObj: CertificationItem = {
        name: certName,
        issuer: getCertIssuer(certItem),
        file_name: file.name,
        file_url: uploadedUrl,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      };

      setProfile((prev) => ({
        ...prev,
        certifications: prev.certifications.map((c) =>
          getCertName(c).toLowerCase() === certName.toLowerCase() ? updatedObj : c
        ),
      }));
    } catch (err) {
      console.warn("Error attaching certificate:", err);
    }
  };

  const handleRemoveCert = (certToRemove: string | CertificationItem) => {
    const targetName = getCertName(certToRemove);
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => getCertName(c) !== targetName),
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

  const handleRemoveProject = (indexToRemove: number) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== indexToRemove),
    }));
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

  // Direct Apply to Drive (used by Placement Calendar and instant action triggers)
  const handleDirectApply = async (driveId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drive_id: driveId,
          student_id: profile.id,
          resume_url: resumeFileName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.detail || "Eligibility check failed for this recruitment drive.",
        };
      }

      await loadAllData();
      return {
        success: true,
        message: data.message || "Application successfully confirmed and registered!",
      };
    } catch (err: any) {
      return {
        success: false,
        message: "Failed to connect to application server. Please try again.",
      };
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
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute top-72 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Top Student Identity & Command Header */}
        <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
          {/* Top Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar & Bio */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                {profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Candidate • Batch {profile.batch_year}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified by TPO
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {profile.full_name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                  <span className="text-slate-800 font-bold">B.Tech {profile.branch}</span>
                  <span>•</span>
                  <span>Roll: <strong>{profile.roll_number}</strong></span>
                  <span>•</span>
                  <span className="text-indigo-600 font-bold">CGPA: {profile.cgpa.toFixed(2)}/10.0</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">0 Active Backlogs</span>
                </div>
              </div>
            </div>

            {/* Right: Profile Completeness Meter & Quick Action */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 min-w-[200px] flex-1 sm:flex-initial">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700">Profile Readiness</span>
                  <span className="font-black text-indigo-600">{completenessPct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completenessPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {completenessPct >= 90 ? "✨ Profile 100% Drive-Ready" : "Complete projects to reach 100%"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("ai-mentor")}
                  className="px-3.5 py-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 transition-colors shadow-2xs flex items-center gap-2 font-bold text-xs cursor-pointer"
                  title="Launch AI Career Advisor"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">AI Career Advisor</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Modern Tab Bar */}
        <div className="bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200/90 flex items-center gap-1 overflow-x-auto shadow-2xs">
          {[
            { id: "overview", label: "Readiness Radar", icon: <TrendingUp className="w-4 h-4" /> },
            {
              id: "calendar",
              label: `Placement Calendar (${drives.length})`,
              icon: <Calendar className="w-4 h-4" />,
              badge: drives.some((d) => {
                const parts = d.drive_date?.split("-").map(Number);
                if (!parts || parts.length !== 3) return false;
                const dDate = new Date(parts[0], parts[1] - 1, parts[2]);
                const now = new Date();
                const ref = now.getFullYear() < 2026 ? new Date(2026, 8, 30) : now;
                const diff = Math.ceil((dDate.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
                return diff >= 10 && diff <= 15;
              }) ? "10–15d Alert!" : undefined,
            },
            { id: "profile", label: "Profile & Resume Builder", icon: <BookOpen className="w-4 h-4" /> },
            { id: "drives", label: `Drive Discovery (${drives.length})`, icon: <Building className="w-4 h-4" /> },
            { id: "applications", label: `Application Tracker (${applications.length})`, icon: <Clock className="w-4 h-4" /> },
            { id: "offers", label: `Offer Desk (${offers.length})`, icon: <Award className="w-4 h-4" /> },
            {
              id: "ai-mentor",
              label: "AI Mentor",
              icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
              badge: "AI Powered",
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap text-xs font-bold cursor-pointer ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-xs border border-indigo-200/90"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-white/70 hover:shadow-2xs border border-transparent"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    tab.id === "calendar"
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-indigo-600 text-white"
                  }`}>
                    {tab.badge}
                  </span>
                )}
                <span
                  className={`absolute bottom-0.5 left-3 right-3 h-[2px] bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-transform duration-200 origin-center ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & READINESS RING */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in" id="readiness-overview-section">
            {/* AI Co-Pilot Interactive Highlight Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white shadow-xl border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-base text-white">CampusLink AI Placement Mentor is Active</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      Live Grounded in Placement DB
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Personalized insights based on your CGPA ({profile.cgpa.toFixed(2)}) and verified skills. 
                    Practice mock interviews, ask about upcoming company drive cutoffs, or get immediate ATS resume tips.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 relative z-10">
                <button
                  type="button"
                  onClick={() => setActiveTab("ai-mentor")}
                  className="btn-gradient text-xs py-2.5 px-5 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Launch AI Mentor Console</span>
                </button>
              </div>
            </div>

            {/* Visual Readiness Ring & Factor Meters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Circular Readiness Ring */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500" />

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Composite Employability Index
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    Employability Score
                  </h2>
                </div>

                <div className="relative py-2 flex items-center justify-center">
                  <div className="absolute w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <ReadinessRing score={profile.readiness_score} size={175} strokeWidth={12} showLabel={true} />
                </div>

                <div className="space-y-2 max-w-xs">
                  <div className="text-xs font-black text-indigo-800 bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-200 px-3.5 py-1 rounded-full inline-block shadow-2xs">
                    ✨ {profile.readiness_level.replace("_", " ")}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Your readiness index qualifies your profile for <strong className="text-slate-800">Super Dream (&gt;20 LPA)</strong> and high-tier engineering recruitment drives.
                  </p>
                </div>
              </div>

              {/* 4 Factor Meters */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs relative overflow-hidden space-y-5 lg:col-span-2 hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500" />

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Employability Factor Breakdown (Weightage Formula)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated against university benchmarks: 50% Verified Skills, 20% Academic CGPA, 15% Assessments, 15% Projects.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">Verified Skills Mastery (50% Weight)</span>
                      <span className="font-black text-indigo-600">94 / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-full rounded-full transition-all duration-700" style={{ width: "94%" }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      High competence verified in: {profile.skills.slice(0, 4).join(", ")}.
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">Academic CGPA Standing (20% Weight)</span>
                      <span className="font-black text-emerald-600">{Math.round(profile.cgpa * 10)} / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.round(profile.cgpa * 10)}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      CGPA {profile.cgpa.toFixed(2)} with {profile.active_backlogs} active backlogs (Clean Record).
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">Assessment & Coding Diagnostic (15% Weight)</span>
                      <span className="font-black text-violet-600">85 / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-600 to-purple-500 h-full rounded-full transition-all duration-700" style={{ width: "85%" }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Cleared internal algorithmic benchmarks & problem-solving screens.
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">Project Portfolio & Production Code (15% Weight)</span>
                      <span className="font-black text-amber-600">90 / 100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-700" style={{ width: "90%" }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {profile.projects.length} verified projects with live deployment repositories.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div
                onClick={() => setActiveTab("calendar")}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group shadow-xs hover:border-indigo-300"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Placement Radar</div>
                    <div className="text-[10px] font-bold text-indigo-600">10–15d Prep Matrix</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Visiting companies, ratings, and targeted skill gap roadmaps.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("profile")}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group shadow-xs"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Profile & Resume</div>
                    <div className="text-[10px] font-bold text-indigo-600">{completenessPct}% Profile Completeness</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upgrade CGPA, verified skills, and tailor your ATS resume.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("drives")}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group shadow-xs"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Discover Drives</div>
                    <div className="text-[10px] font-bold text-blue-600">{drives.length} Active Drives</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Deterministic eligibility and 1-click verified application.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("applications")}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group shadow-xs"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600" />
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Applications</div>
                    <div className="text-[10px] font-bold text-purple-600">{applications.length} In Pipeline</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Round-by-round advancement, test times, and venue guidance.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("offers")}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group shadow-xs"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Offer Desk</div>
                    <div className="text-[10px] font-bold text-emerald-600">{offers.length} Released Offers</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  CTC breakdown, accept/decline offers, and upload agreements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: PLACEMENT CALENDAR & 10-15 DAY ADVANCE PREPARATION */}
        {/* ========================================================================= */}
        {activeTab === "calendar" && (
          <div className="space-y-6 animate-fade-in">
            <PlacementCalendar
              drives={drives}
              studentSkills={profile.skills || []}
              studentCgpa={profile.cgpa || 8.8}
              studentBranch={profile.branch || "CSE"}
              studentBacklogs={profile.active_backlogs || 0}
              appliedDriveIds={applications.map((a) => a.drive_id)}
              onApply={handleDirectApply}
            />
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
                          <span className="text-[10px] text-slate-500 font-medium">Verified Email</span>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                        <div className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium flex items-center justify-between">
                          <span>{profile.phone}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Primary Contact</span>
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
                    </div>
                  </div>
                )}

                {/* Primary Domain Portfolio */}
                <div className="pt-4 border-t border-campus-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-campus-text-primary">Skills & Domain Portfolio</h4>
                    {!isEditingProfile ? (
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Locked &bull; Click &quot;Upgrade Academic Details&quot; to edit
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Editing Mode Active
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs">
                    <label className="block font-semibold text-slate-700 mb-1">Primary Career Domain</label>
                    {isEditingProfile ? (
                      <select
                        value={editDomain}
                        onChange={(e) => setEditDomain(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-campus-border bg-white font-medium text-xs focus:ring-1 focus:ring-campus-primary"
                      >
                        <option value="Full Stack Development">Full Stack Development</option>
                        <option value="Cloud / DevOps Engineering">Cloud / DevOps Engineering</option>
                        <option value="Data Science & Machine Learning">Data Science & Machine Learning</option>
                        <option value="Core Systems & Embedded">Core Systems & Embedded Engineering</option>
                        <option value="Product & Technology Consulting">Product & Technology Consulting</option>
                      </select>
                    ) : (
                      <div className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-between">
                        <span>{editDomain || profile.primary_domain}</span>
                        <span className="text-[10px] text-slate-500 font-normal">Active Specialization</span>
                      </div>
                    )}
                  </div>

                  {/* Technical Skills Tag Manager */}
                  <div className="text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-slate-700">Verified Technical Skills (Multi-Select Tags)</label>
                      <span className="text-[10px] text-slate-400 font-mono">{profile.skills.length} skills listed</span>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-campus-border bg-slate-50/50 min-h-[46px]">
                      {profile.skills.length === 0 ? (
                        <span className="text-slate-400 text-[11px]">No technical skills listed.</span>
                      ) : (
                        profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-campus-border text-campus-primary shadow-2xs"
                          >
                            {skill}
                            {isEditingProfile && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                                title={`Remove ${skill}`}
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))
                      )}
                    </div>

                    {isEditingProfile && (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add technical skill (e.g. AWS, Redis, GraphQL)..."
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                          className="flex-1 p-2 rounded-lg border border-campus-border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-campus-primary"
                        />
                        <Button variant="secondary" size="sm" type="button" onClick={handleAddSkill}>
                          Add Skill
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Certifications Manager */}
                  <div className="text-xs space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-semibold text-slate-800 text-xs">
                          Industry Certifications & Credentials
                        </label>
                        <p className="text-[11px] text-slate-400">
                          {isEditingProfile
                            ? "Upload certificate proofs (PDF, PNG, JPG) or credential titles to verify skills."
                            : "Verified industry credentials and proof documents linked to your profile."}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {profile.certifications.length} Credentials
                      </span>
                    </div>

                    {/* Certifications List */}
                    <div className="space-y-2 p-3 rounded-xl border border-campus-border bg-slate-50/50 min-h-[50px]">
                      {profile.certifications.length === 0 ? (
                        <div className="text-center py-3 text-slate-400 text-[11px]">
                          {isEditingProfile
                            ? "No certifications added yet. Use the upload form below to add certificates and proofs."
                            : "No certifications added yet. Click 'Upgrade Academic Details' above to add verified credentials."}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {profile.certifications.map((cert, idx) => {
                            const certName = getCertName(cert);
                            const certIssuer = getCertIssuer(cert);
                            const certFile = getCertFile(cert);

                            return (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg border border-campus-border bg-white shadow-2xs flex flex-col justify-between gap-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                                      <Award className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-800 text-xs truncate" title={certName}>
                                        {certName}
                                      </div>
                                      {certIssuer && (
                                        <div className="text-[10px] text-slate-400 truncate">
                                          {certIssuer}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {isEditingProfile && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCert(cert)}
                                      className="text-slate-300 hover:text-rose-600 font-bold text-sm leading-none p-1 rounded hover:bg-rose-50 transition-colors"
                                      title="Delete certification"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10px]">
                                  {certFile ? (
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Proof Attached
                                      </span>
                                      {certFile.url && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setPreviewCertModal({
                                              name: certName,
                                              url: certFile.url || "",
                                              file_name: certFile.name,
                                            })
                                          }
                                          className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline truncate cursor-pointer"
                                        >
                                          <Eye className="w-3 h-3 text-blue-500" />
                                          <span className="truncate max-w-[120px]">{certFile.name || "View Document"}</span>
                                        </button>
                                      )}
                                    </div>
                                  ) : isEditingProfile ? (
                                    <label className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
                                      <UploadCloud className="w-3 h-3" />
                                      <span>Attach certificate file</span>
                                      <input
                                        type="file"
                                        accept=".pdf,image/png,image/jpeg,image/jpg"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleUploadProofForCert(cert, file);
                                        }}
                                      />
                                    </label>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">Verified Credential</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Add Certificate & Upload Document Form - ONLY when isEditingProfile is true */}
                    {isEditingProfile && (
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
                        <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-campus-primary" />
                          Add New Certificate & Upload Proof Document
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              placeholder="Certificate Title (e.g. AWS Solutions Architect, Docker Certified)..."
                              value={newCertInput}
                              onChange={(e) => setNewCertInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCert())}
                              className="w-full p-2 rounded-lg border border-campus-border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-campus-primary"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Issuing Org (e.g. AWS, Cisco)..."
                              value={newCertIssuer}
                              onChange={(e) => setNewCertIssuer(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCert())}
                              className="w-full p-2 rounded-lg border border-campus-border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-campus-primary"
                            />
                          </div>
                        </div>

                        {/* File Upload Selector */}
                        <div>
                          {!newCertFile ? (
                            <label
                              htmlFor="cert-file-input"
                              className="border-2 border-dashed border-slate-300 hover:border-campus-primary/70 rounded-xl p-3 bg-white hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-center gap-2 text-slate-600 block text-center"
                            >
                              <UploadCloud className="w-4 h-4 text-campus-primary" />
                              <span className="font-semibold text-xs">Choose or Drop Certificate Proof Document</span>
                              <span className="text-[10px] text-slate-400">(PDF, PNG, JPG up to 10MB)</span>
                              <input
                                id="cert-file-input"
                                type="file"
                                accept=".pdf,image/png,image/jpeg,image/jpg"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 10 * 1024 * 1024) {
                                      setCertUploadError("File size exceeds 10MB limit.");
                                      return;
                                    }
                                    setCertUploadError(null);
                                    setNewCertFile(file);
                                    if (!newCertInput.trim()) {
                                      const clean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                                      setNewCertInput(clean.charAt(0).toUpperCase() + clean.slice(1));
                                    }
                                  }
                                }}
                              />
                            </label>
                          ) : (
                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-xs">
                              <div className="flex items-center gap-2 truncate">
                                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="truncate">
                                  <span className="font-bold text-slate-800">{newCertFile.name}</span>
                                  <span className="text-[10px] text-slate-500 ml-2 font-mono">
                                    ({(newCertFile.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNewCertFile(null)}
                                className="text-slate-400 hover:text-rose-600 font-bold px-2 py-0.5 rounded text-sm hover:bg-rose-50"
                                title="Remove selected file"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>

                        {certUploadError && (
                          <div className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            {certUploadError}
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            disabled={isUploadingCert}
                            onClick={handleAddCert}
                            icon={<Plus className="w-3.5 h-3.5" />}
                          >
                            {isUploadingCert ? "Uploading..." : "Add & Upload Certification"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Projects & Certifications */}
                <div className="pt-4 border-t border-campus-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-campus-text-primary">Featured Projects & Live Proofs</h4>
                    {!isEditingProfile ? (
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Locked &bull; Click &quot;Upgrade Academic Details&quot; to edit
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => setShowProjModal(true)}
                      >
                        Add Project
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    {profile.projects.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-[11px] bg-slate-50/50 rounded-xl border border-campus-border">
                        {isEditingProfile
                          ? "No featured projects added. Click 'Add Project' above to add portfolio items."
                          : "No featured projects listed. Click 'Upgrade Academic Details' to add projects."}
                      </div>
                    ) : (
                      profile.projects.map((proj, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-campus-border bg-slate-50/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-campus-text-primary text-xs">{proj.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                                {proj.tech}
                              </span>
                              {isEditingProfile && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProject(idx)}
                                  className="text-slate-400 hover:text-rose-600 font-bold text-sm leading-none p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Remove project"
                                >
                                  ×
                                </button>
                              )}
                            </div>
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
                      ))
                    )}
                  </div>
                </div>

                {/* Unified Save Action Bar at the very bottom */}
                {isEditingProfile && (
                  <div className="pt-3 border-t border-campus-border">
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-blue-900 font-medium">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Ready to apply changes? Save to update your official academic credentials.</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
                            setEditDomain(profile.primary_domain);
                            setIsEditingProfile(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Save className="w-3.5 h-3.5" />}
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                        >
                          {isSavingProfile ? "Saving..." : "Save Academic Upgrades"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
            <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      driveFilter === f.id
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20"
                        : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search company or role..."
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>

            {/* Drive Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDrives.length === 0 ? (
                <div className="col-span-2 rounded-3xl border border-slate-200/90 bg-white/95 p-12 text-center text-xs text-slate-500 shadow-xs">
                  <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No recruitment drives found</p>
                  <p className="mt-1 text-slate-500">Try adjusting your search criteria or filter options.</p>
                </div>
              ) : (
                filteredDrives.map((drive) => {
                  const { isEligible, reasons } = checkDriveEligibility(drive);
                  const isAlreadyApplied = applications.some((a) => a.drive_id === drive.id);

                  return (
                    <div
                      key={drive.id}
                      className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 shadow-xs hover:shadow-xl hover:border-indigo-300/80 transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group"
                    >
                      {/* Top Accent Gradient Bar */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-90 group-hover:h-2 transition-all duration-300" />

                      <div className="space-y-4 pt-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <CompanyLogo
                              companyName={drive.company_name}
                              size="xl"
                              className="rounded-2xl shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div>
                              <h3 className="font-black text-lg text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                {drive.company_name}
                              </h3>
                              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 border border-indigo-100">
                                <span>{drive.role_title}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                              {drive.ctc_lpa} LPA
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Fixed + Variable</span>
                          </div>
                        </div>

                        {/* Drive Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate"><strong className="text-slate-700">Date:</strong> {drive.drive_date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate"><strong className="text-slate-700">Venue:</strong> {drive.venue}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate"><strong className="text-slate-700">Min CGPA:</strong> {drive.min_cgpa.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            <span className="truncate"><strong className="text-slate-700">Branches:</strong> {drive.allowed_branches.join(", ")}</span>
                          </div>
                        </div>

                        {/* Deterministic Eligibility Status Badge */}
                        <div>
                          {isEligible ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Eligible to Apply (All Benchmarks Cleared)</span>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-800 space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Ineligible for this Drive:</span>
                              </div>
                              <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5">
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
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Deadline: <strong>{drive.deadline || "Open"}</strong></span>
                        </span>

                        {isAlreadyApplied ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Applied
                          </span>
                        ) : isEligible ? (
                          <button
                            type="button"
                            onClick={() => setApplyModalDrive(drive)}
                            className="btn-gradient text-xs py-2 px-4 shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                          >
                            <span>Apply Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          >
                            Ineligible
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE APPLICATION & ROUND TRACKER */}
        {/* ========================================================================= */}
        {activeTab === "applications" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>Live Application & Round Tracker</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time visual timeline of your active hiring pipelines and upcoming round notifications.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/80 self-start sm:self-auto">
                {applications.length} Active {applications.length === 1 ? "Pipeline" : "Pipelines"}
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-12 text-center text-xs text-slate-500 shadow-xs space-y-3">
                <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <p className="font-black text-slate-800 text-base">No applications submitted yet</p>
                  <p className="text-slate-500 text-xs mt-1">Explore available recruitment opportunities in Drive Discovery to submit applications.</p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("drives")}
                    className="btn-gradient text-xs py-2 px-5 font-bold shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse Eligible Drives</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all space-y-6 relative overflow-hidden group"
                  >
                    {/* Top Accent Gradient Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 opacity-90 group-hover:h-2 transition-all duration-300" />

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 pt-1">
                      <div className="flex items-center gap-3.5">
                        <CompanyLogo companyName={app.company_name} size="lg" className="rounded-xl shrink-0" />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900">{app.company_name}</h3>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80">
                              {app.role_title}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-black border border-emerald-200">
                              {app.ctc_lpa} LPA
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Applied on: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recently"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-xs font-black text-indigo-700 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span>Stage: {app.current_round_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Round Pipeline Stepper */}
                    <div className="overflow-x-auto py-3">
                      <div className="flex items-center min-w-[580px] justify-between relative px-4">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-10 right-10 h-1 bg-slate-200 rounded-full -z-0" />

                        {roundPipelineSteps.map((step, idx) => {
                          const status = getStepStatus(app.current_status, step.key);

                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10 text-center max-w-[90px]">
                              <div
                                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                                  status === "completed"
                                    ? "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-100"
                                    : status === "current"
                                    ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white ring-4 ring-indigo-100 shadow-lg shadow-indigo-500/30 animate-pulse-subtle"
                                    : "bg-white border-2 border-slate-300 text-slate-400"
                                }`}
                              >
                                {status === "completed" ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  idx + 1
                                )}
                              </div>
                              <span
                                className={`text-[11px] mt-2 font-bold leading-tight ${
                                  status === "current"
                                    ? "text-indigo-700 font-extrabold"
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
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 border border-indigo-100/90 text-xs space-y-3">
                      <div className="flex items-center gap-2 font-black text-slate-800">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Upcoming Round Guidelines from Placement Cell:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/60 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Date & Slot</span>
                          <span className="font-extrabold text-slate-800 text-xs">{app.round_date || "To be announced"} • {app.round_slot || "Full Day"}</span>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/60 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Venue / Virtual Link</span>
                          <span className="font-extrabold text-slate-800 text-xs truncate block">{app.venue_or_link || "Auditorium Hall A"}</span>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/60 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Guidelines</span>
                          <span className="font-medium text-slate-700 text-xs block">{app.instructions || "Bring college ID and updated resume."}</span>
                        </div>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Offer & Acceptance Desk</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official campus placement offers extended by university recruitment partners with verified financial terms.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{offers.length} Official {offers.length === 1 ? "Offer" : "Offers"} Recorded</span>
              </span>
            </div>

            {offerActionMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{offerActionMsg}</span>
              </div>
            )}

            {offers.length === 0 ? (
              <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-12 text-center text-xs text-slate-500 shadow-xs space-y-3">
                <Award className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <p className="font-black text-slate-800 text-base">No offer letters on record yet</p>
                  <p className="text-slate-500 text-xs mt-1">Offers will appear here once selection rounds conclude and results are officially published by the TPO.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="rounded-3xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 p-6 sm:p-7 shadow-md hover:shadow-xl transition-all space-y-6 relative overflow-hidden"
                  >
                    {/* Top Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100/80 pb-4 pt-1">
                      <div className="flex items-center gap-3.5">
                        <CompanyLogo companyName={offer.company_name} size="xl" className="rounded-2xl shrink-0" />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-2xl font-black text-slate-900">{offer.company_name}</h3>
                            <span className="text-xs px-3 py-0.5 rounded-full font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                              {offer.role_title}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Placement Offer
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>Location: <strong>{offer.job_location || "Bengaluru / Hyderabad"}</strong></span>
                            <span>•</span>
                            <span>Joining: <strong>{offer.joining_date || "July 2026"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent block">
                          {offer.ctc_lpa} LPA
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Cost to Company</span>
                      </div>
                    </div>

                    {/* Financial Terms & Breakdown Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white/90 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Base Salary</span>
                        <span className="text-base font-black text-slate-900">{offer.base_salary_lpa || (offer.ctc_lpa * 0.8).toFixed(1)} LPA</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Fixed Annual Pay</span>
                      </div>
                      <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white/90 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Joining Bonus</span>
                        <span className="text-base font-black text-slate-900">{offer.joining_bonus_lpa || "2.0"} LPA</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">1st Year Retention</span>
                      </div>
                      <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white/90 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Service Bond</span>
                        <span className="text-base font-black text-slate-900">{offer.bond_period_months ? `${offer.bond_period_months} Months` : "None"}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">University Standard</span>
                      </div>
                      <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white/90 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status</span>
                        <span className={`text-xs font-black inline-flex items-center gap-1 mt-0.5 px-2.5 py-0.5 rounded-full ${
                          offer.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${offer.status === "ACCEPTED" ? "bg-emerald-600" : "bg-amber-600 animate-pulse"}`} />
                          {offer.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-3 border-t border-emerald-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="text-[11px] text-slate-500 font-medium">
                        College Policy: Accepting this offer locks your placement record adhering to university TPO guidelines.
                      </div>

                      <div className="flex items-center gap-3">
                        {offer.status === "ACCEPTED" ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Offer Accepted & Confirmed
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOfferAction(offer.id, "DECLINED")}
                              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Decline Offer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOfferAction(offer.id, "ACCEPTED")}
                              className="btn-gradient text-xs py-2 px-5 font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Offer</span>
                            </button>
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

        {/* ========================================================================= */}
        {/* TAB 7: AI PLACEMENT MENTOR & INTERACTIVE ASSISTANT */}
        {/* ========================================================================= */}
        {activeTab === "ai-mentor" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Card */}
            <div className="rounded-3xl p-7 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
              {/* Background ambient orbs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
                    <Sparkles className="w-7 h-7 text-indigo-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">AI Placement & Career Intelligence Center</h2>
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Grounded
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200/90 mt-1 max-w-2xl leading-relaxed">
                      Real-time career advisor synchronized with university database records, placement eligibility benchmarks, and technical interview drills.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] text-white">
                      <span className="bg-white/10 px-3 py-1 rounded-xl border border-white/10 font-bold backdrop-blur-sm">
                        Candidate: {profile.full_name}
                      </span>
                      <span className="bg-white/10 px-3 py-1 rounded-xl border border-white/10 font-bold backdrop-blur-sm">
                        CGPA: {profile.cgpa.toFixed(2)} ({profile.branch})
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-400/30 font-black backdrop-blur-sm">
                        Readiness: {profile.readiness_score}/100 ({profile.readiness_level.replace("_", " ")})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                  <Link
                    href="/student/mock-interview"
                    className="btn-gradient py-2.5 px-5 rounded-xl text-white font-bold text-xs shadow-md shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Full AI Mock Interview</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 3 Interactive Quick Intelligence Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Eligible Drives */}
              <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-90" />
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-600" />
                      Drive Eligibility
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {drives.filter(d => checkDriveEligibility(d).isEligible).length} Eligible
                    </span>
                  </div>
                  <h3 className="font-black text-base text-slate-900">Upcoming Recruitment Matches</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Based on your CGPA ({profile.cgpa.toFixed(2)}) and {profile.branch} branch, you qualify for top tier campus drives including Google Cloud, AWS, and Goldman Sachs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("drives")}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-slate-200/90 hover:border-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <span>Explore Eligible Drives</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                </button>
              </div>

              {/* Card 2: Skill Gap Radar */}
              <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 opacity-90" />
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-amber-500" />
                      Skill Gap Diagnostic
                    </span>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {profile.skills.length} Verified
                    </span>
                  </div>
                  <h3 className="font-black text-base text-slate-900">Target: SRE & Cloud Roles</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Adding <code className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Docker</code> or <code className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Kubernetes</code> will elevate your shortlisting match to 96%.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-amber-800 border border-slate-200/90 hover:border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <span>Update Verified Skills</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                </button>
              </div>

              {/* Card 3: AI Mock Room */}
              <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Interview Drills
                    </span>
                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      AI Powered
                    </span>
                  </div>
                  <h3 className="font-black text-base text-slate-900">Technical & Scenario Q&A</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Simulate real-time technical rounds for Site Reliability Engineer and Full-Stack roles with instant NLP evaluations.
                  </p>
                </div>
                <Link
                  href="/student/mock-interview"
                  className="w-full py-2.5 rounded-xl btn-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span>Launch Mock Interview</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </Link>
              </div>
            </div>

            {/* Embedded Live Interactive AI Placement Chat Studio */}
            <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <span>Interactive Placement Chat Assistant</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ask questions below or use the floating assistant bubble available anywhere in your portal.
                  </p>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  AI Model Active
                </span>
              </div>

              {/* Chat Quick Action Chips */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">Frequently Asked Placement Questions (Click to Ask):</span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Which campus drives am I eligible for?",
                    "How can I improve my placement readiness score?",
                    "What are my skill gaps for SRE / Dev roles?",
                    "Give me an interview scenario question",
                    "ATS resume optimization tips",
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const floatingBtn = document.querySelector('button[aria-label="Open AI Placement ChatBot"]') as HTMLButtonElement;
                        if (floatingBtn) floatingBtn.click();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-50/90 hover:bg-indigo-50 text-indigo-900 font-semibold text-xs border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Chat Guidance Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-purple-50/60 border border-indigo-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-700 space-y-0.5">
                  <div className="font-black text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Always-On AI Placement Assistant</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    The CampusLink AI ChatBot at the bottom right maintains your full student profile context and can answer eligibility questions, evaluate mock answers, and suggest resume tweaks!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const floatingBtn = document.querySelector('button[aria-label="Open AI Placement ChatBot"]') as HTMLButtonElement;
                    if (floatingBtn) floatingBtn.click();
                  }}
                  className="btn-gradient px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Bot className="w-4 h-4" />
                  <span>Open AI Assistant</span>
                </button>
              </div>
            </div>
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
                      <li key={idx} className="font-medium">
                        {getCertName(cert)}
                        {getCertIssuer(cert) ? ` — ${getCertIssuer(cert)}` : ""}
                      </li>
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

        {/* Certificate Document Preview Modal */}
        {previewCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl border border-campus-border">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{previewCertModal.name}</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{previewCertModal.file_name || "Certificate Proof Document"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {previewCertModal.url && (
                    <a
                      href={previewCertModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-campus-border hover:bg-slate-50 flex items-center gap-1 font-semibold text-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open File
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewCertModal(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 font-bold text-lg leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 min-h-[350px] flex items-center justify-center">
                {previewCertModal.url && (previewCertModal.url.startsWith("data:image/") || previewCertModal.file_name?.match(/\.(png|jpe?g|webp)$/i)) ? (
                  <img
                    src={previewCertModal.url}
                    alt={previewCertModal.name}
                    className="max-h-[500px] w-auto mx-auto object-contain rounded-lg p-2"
                  />
                ) : previewCertModal.url ? (
                  <iframe
                    src={previewCertModal.url}
                    title={previewCertModal.name}
                    className="w-full h-[500px] rounded-lg border-0 bg-white"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400 text-xs">
                    No preview available for this document.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Apply Confirmation Modal */}
        {applyModalDrive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="card-squarespace max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-campus-border pb-3">
                <h3 className="text-base font-bold text-campus-text-primary">
                  Confirm Drive Application
                </h3>
                <button
                  onClick={() => setApplyModalDrive(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
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
                <div className="p-3 rounded-lg bg-slate-50 border border-campus-border flex items-center gap-3">
                  <CompanyLogo companyName={applyModalDrive.company_name} size="md" className="rounded-lg shrink-0" />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="font-bold text-campus-text-primary text-sm truncate">
                      {applyModalDrive.company_name}
                    </div>
                    <div className="text-slate-600 truncate">Role: {applyModalDrive.role_title} &bull; Package: {applyModalDrive.ctc_lpa} LPA</div>
                    <div className="text-[11px] text-slate-500 truncate">Date: {applyModalDrive.drive_date} &bull; Venue: {applyModalDrive.venue}</div>
                  </div>
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
        
        {/* Floating Interactive Placement AI Assistant */}
        <StudentAIChatBot
          studentProfile={{
            id: profile.id,
            full_name: profile.full_name,
            cgpa: profile.cgpa,
            branch: profile.branch,
            readiness_score: profile.readiness_score,
            readiness_level: profile.readiness_level,
            skills: profile.skills,
          }}
          onTriggerAction={(act) => {
            if (act === "VIEW_DRIVES") setActiveTab("drives");
            else if (act === "VIEW_READINESS") setActiveTab("overview");
            else if (act === "VIEW_APPLICATIONS") setActiveTab("applications");
            else if (act === "EDIT_PROFILE") setActiveTab("profile");
            else if (act === "UPLOAD_RESUME") {
              setActiveTab("profile");
              setShowResumeModal(true);
            } else if (act === "ADD_PROJECT") {
              setActiveTab("profile");
              setShowProjModal(true);
            }
          }}
        />
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-campus-bg">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-800">Loading Student Dashboard...</div>
          </div>
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}

