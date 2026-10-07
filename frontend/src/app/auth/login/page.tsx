"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/types";
import {
  Shield,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  BookOpen,
  Hash,
  Award,
  Calendar,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-600">
          Loading authentication portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginCustom } = useAuth();

  const queryRole = (searchParams.get("role") as UserRole) || "STUDENT";
  const queryMode = searchParams.get("mode") === "register" ? "register" : "signin";
  const [authMode, setAuthMode] = useState<"signin" | "register">(queryMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    queryRole === "PLACEMENT_OFFICER" ? "PLACEMENT_OFFICER" : "STUDENT"
  );

  // Common Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Detailed Role-Specific Registration Fields
  const [colleges, setColleges] = useState<Array<{ id: number; name: string; code: string; city?: string }>>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | "new">(1);
  const [collegeName, setCollegeName] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeCity, setCollegeCity] = useState("");
  const [branch, setBranch] = useState("Computer Science Engineering (CSE)");
  const [rollNumber, setRollNumber] = useState("");
  const [cgpa, setCgpa] = useState("8.50");
  const [batchYear, setBatchYear] = useState("2026");
  const [designation, setDesignation] = useState("Head of Training & Placement Cell");
  const [phone, setPhone] = useState("");
  const [instituteCode, setInstituteCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch available colleges list
  React.useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/colleges/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setColleges(data);
          // Default to GITA or first college if available
          const gita = data.find((c) => c.code === "GITA") || data[0];
          setSelectedCollegeId(gita.id);
          setCollegeName(gita.name);
          setCollegeCode(gita.code);
          setInstituteCode(gita.code);
        }
      })
      .catch((err) => console.warn("Failed to fetch colleges:", err));
  }, []);

  // Handle Authentication & Detailed Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    if (authMode === "register") {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (selectedCollegeId === "new" && (!collegeName.trim() || !collegeCode.trim())) {
        setErrorMsg("Please provide both College Name and unique College Code (e.g. GITA).");
        return;
      }
      if (selectedRole === "STUDENT" && (!rollNumber.trim() || !cgpa.trim())) {
        setErrorMsg("Please enter your Student Roll Number and CGPA.");
        return;
      }
    }

    setLoading(true);

    try {
      if (authMode === "register") {
        const payload: any = {
          email: email.trim(),
          password: password.trim(),
          full_name: fullName.trim(),
          role: selectedRole,
          department: selectedRole === "STUDENT" ? branch : designation,
          phone_number: phone.trim() || undefined,
          roll_number: selectedRole === "STUDENT" ? rollNumber.trim() : undefined,
          cgpa: selectedRole === "STUDENT" && cgpa ? parseFloat(cgpa) : undefined,
          batch_year: selectedRole === "STUDENT" && batchYear ? parseInt(batchYear) : undefined,
        };

        if (typeof selectedCollegeId === "number") {
          payload.college_id = selectedCollegeId;
          const chosen = colleges.find((c) => c.id === selectedCollegeId);
          payload.institution_name = chosen?.name || collegeName;
          payload.institution_code = chosen?.code || collegeCode;
        } else {
          payload.college_name = collegeName.trim();
          payload.college_code = collegeCode.trim().toUpperCase();
          payload.institution_name = collegeName.trim();
          payload.institution_code = collegeCode.trim().toUpperCase();
        }

        const regRes = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!regRes.ok) {
          const errData = await regRes.json().catch(() => ({}));
          throw new Error(errData.detail || "Registration failed. Please check your credentials.");
        }

        const data = await regRes.json();
        const registeredUser = data.user;

        if (selectedRole === "STUDENT") {
          setSuccessMsg(`Account created for ${fullName.trim()}! Your profile is pending verification by your College TPO. Entering student portal...`);
        } else {
          setSuccessMsg(`TPO Account created for ${fullName.trim()} at ${registeredUser.institution_name}! Entering TPO Command Center...`);
        }

        loginCustom(
          {
            id: registeredUser.id,
            email: registeredUser.email,
            fullName: registeredUser.full_name,
            role: registeredUser.role,
            institution: registeredUser.institution_name,
            college_id: registeredUser.college_id ?? null,
            college_name: registeredUser.institution_name ?? null,
            college_code: registeredUser.institution_code ?? null,
            status: registeredUser.status,
            title: selectedRole === "STUDENT" 
              ? `${branch} (${batchYear}) • ${registeredUser.institution_name}` 
              : `${designation} • ${registeredUser.institution_name}`,
          },
          data.access_token,
          data.session_id
        );

        setTimeout(() => {
          if (registeredUser.role === "STUDENT") router.push("/dashboard/student");
          else router.push("/dashboard/tpo");
        }, 600);
      } else {
        // Sign In Flow with Real Cryptographic Verification & Brute-Force Shield
        const loginRes = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
            device_info: typeof navigator !== "undefined" ? `${navigator.userAgent.slice(0, 80)}` : "Browser Session",
          }),
        });

        if (!loginRes.ok) {
          const errData = await loginRes.json().catch(() => ({}));
          if (loginRes.status === 423) {
            throw new Error(`🔒 ${errData.detail || "Account temporarily locked due to consecutive failed attempts."}`);
          }
          if (loginRes.status === 403) {
            throw new Error(`🚫 ${errData.detail || "Account suspended or deactivated by access governance policy."}`);
          }
          throw new Error(errData.detail || "Incorrect email or password.");
        }

        const data = await loginRes.json();
        const backendUser = data.user;

        setSuccessMsg(`Identity verified! Welcome back, ${backendUser.full_name}.`);

        loginCustom(
          {
            id: backendUser.id,
            email: backendUser.email,
            fullName: backendUser.full_name,
            role: backendUser.role,
            institution: backendUser.institution_name,
            college_id: backendUser.college_id ?? null,
            college_name: backendUser.institution_name ?? null,
            college_code: backendUser.institution_code ?? null,
            status: backendUser.status,
            title: backendUser.role === "STUDENT" ? "Student Candidate" : "Placement Officer (TPO)",
          },
          data.access_token,
          data.session_id
        );

        setTimeout(() => {
          if (backendUser.role === "STUDENT") router.push("/dashboard/student");
          else router.push("/dashboard/tpo");
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl mx-auto w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              CampusLink
            </span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {authMode === "signin" ? "Sign In to CampusLink" : "Create a CampusLink Account"}
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {authMode === "signin"
              ? "Access your placement operations command center or student readiness portal"
              : "Register your institutional details and academic profile"}
          </p>
        </div>

        {/* Role Portal Tabs (Student vs TPO) */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-300/60 shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedRole("STUDENT")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRole === "STUDENT"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("PLACEMENT_OFFICER")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              selectedRole === "PLACEMENT_OFFICER"
                ? "bg-white text-indigo-700 shadow-sm border border-indigo-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Institute TPO Portal</span>
          </button>
        </div>

        {/* Main Auth & Registration Box */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Sub-header toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
              {selectedRole === "STUDENT" ? "🎓 Student Candidate Portal" : "🏛️ Institute Placement Officer"}
            </span>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "signin" ? "register" : "signin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline transition-all"
            >
              {authMode === "signin" ? "Need an account? Register Here" : "Already registered? Sign In"}
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* REGISTER MODE: Detailed Role-Specific Registration Fields */}
            {authMode === "register" ? (
              <>
                {/* Full Name & Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={selectedRole === "STUDENT" ? "e.g. Rahul Verma" : "e.g. Dr. Rajesh Sharma"}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {selectedRole === "STUDENT" ? "Student Email Address" : "Official TPO Email"} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={selectedRole === "STUDENT" ? "rahul@university.edu" : "tpo@college.edu"}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* College / Institution Selection */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Select Your College / University <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-indigo-600 font-semibold">Institutional Tenancy</span>
                  </div>
                  
                  <div className="relative">
                    <Building className="w-4 h-4 text-indigo-500 absolute left-3 top-3" />
                    <select
                      value={selectedCollegeId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "new") {
                          setSelectedCollegeId("new");
                          setCollegeName("");
                          setCollegeCode("");
                        } else {
                          const numId = parseInt(val);
                          setSelectedCollegeId(numId);
                          const found = colleges.find((c) => c.id === numId);
                          if (found) {
                            setCollegeName(found.name);
                            setCollegeCode(found.code);
                            setInstituteCode(found.code);
                          }
                        }
                      }}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900 shadow-sm"
                    >
                      {colleges.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code}){c.city ? ` — ${c.city}` : ""}
                        </option>
                      ))}
                      <option value="new">+ Register a New College / Institute</option>
                    </select>
                  </div>

                  {selectedCollegeId === "new" && (
                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          New College Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          placeholder="e.g. Gandhi Institute for Technological Advancement"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Unique Code (e.g. GITA) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={collegeCode}
                          onChange={(e) => {
                            setCollegeCode(e.target.value.toUpperCase());
                            setInstituteCode(e.target.value.toUpperCase());
                          }}
                          placeholder="e.g. GITA"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-bold uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* STUDENT SPECIFIC FIELDS */}
                {selectedRole === "STUDENT" && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Branch / Major <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                          >
                            <option value="Computer Science Engineering (CSE)">Computer Science (CSE)</option>
                            <option value="Information Technology (IT)">Information Technology (IT)</option>
                            <option value="Electronics & Communication (ECE)">Electronics & Comm (ECE)</option>
                            <option value="Mechanical Engineering (MECH)">Mechanical Eng (MECH)</option>
                            <option value="Electrical Engineering (EE)">Electrical Eng (EE)</option>
                            <option value="AI & Data Science (AI/DS)">AI & Data Science (AI/DS)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Roll Number / Student ID <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="e.g. 22CS045"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Current CGPA <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            required
                            value={cgpa}
                            onChange={(e) => setCgpa(e.target.value)}
                            placeholder="8.50"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Graduation / Batch Year <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <select
                            value={batchYear}
                            onChange={(e) => setBatchYear(e.target.value)}
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                          >
                            <option value="2026">2026 Batch</option>
                            <option value="2027">2027 Batch</option>
                            <option value="2025">2025 Batch</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* PLACEMENT OFFICER SPECIFIC FIELDS */}
                {selectedRole === "PLACEMENT_OFFICER" && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Official Designation <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="Head of Placement Cell"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Official Contact Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Institute Accreditation Code / NIRF ID
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={instituteCode}
                          onChange={(e) => setInstituteCode(e.target.value)}
                          placeholder="e.g. NIRF-2026-NITD"
                          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Set Account Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* SIGN IN MODE */
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === "STUDENT" ? "student@university.edu" : "tpo@college.edu"}
                      className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Password reset instructions sent to registered email.")}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Gateway Demo Accounts for Evaluation / Testing */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Demo Testing Gateway Accounts
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                      Evaluation Only
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("tpo@campuslink.edu");
                        setPassword("password123");
                        setSelectedRole("PLACEMENT_OFFICER");
                      }}
                      className="p-2.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50/50 text-left transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                        <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">Dr. Rajesh Sharma</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Demo NIT TPO Officer</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("aarav.patel@campuslink.edu");
                        setPassword("password123");
                        setSelectedRole("STUDENT");
                      }}
                      className="p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50/50 text-left transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Aarav Patel</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Demo NIT Student</div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                selectedRole === "STUDENT"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
              } ${loading ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.01]"}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {authMode === "signin"
                      ? `Sign In to ${selectedRole === "STUDENT" ? "Student" : "TPO"} Portal`
                      : `Complete Registration & Enter ${selectedRole === "STUDENT" ? "Student" : "TPO"} Portal`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              Protected by CampusLink Institutional Authentication & Role-Based Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
