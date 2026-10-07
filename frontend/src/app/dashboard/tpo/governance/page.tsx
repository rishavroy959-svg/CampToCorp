"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Shield,
  Lock,
  Key,
  Users,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Clock,
  Globe,
  Smartphone,
  Laptop,
  Search,
  Filter,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  UserX,
  UserCheck,
  Activity,
  FileText
} from "lucide-react";

interface AuditLog {
  id: number;
  actor_id: number | null;
  actor_email: string;
  actor_role: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  details: string | null;
  created_at: string;
}

interface ActiveSession {
  id: number;
  session_id: string;
  user_id: number;
  device_info: string | null;
  ip_address: string | null;
  is_revoked: boolean;
  created_at: string;
  last_active_at: string;
  expires_at: string;
}

interface GovernanceStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  pending_verification: number;
  active_sessions: number;
  failed_logins_24h: number;
  security_events_24h: number;
  compliance_score_pct: number;
}

export default function IdentityAccessGovernancePage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<"audit" | "sessions" | "lifecycle">("audit");

  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters for audit logs
  const [actionFilter, setActionFilter] = useState<string>("");
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  // Sample managed user state for lifecycle demo
  const [targetUserId, setTargetUserId] = useState<string>("2");
  const [targetUserStatus, setTargetUserStatus] = useState<string>("ACTIVE");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchGovernanceData = async () => {
    setRefreshing(true);
    setErrorMsg(null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      // 1. Fetch Stats
      const statsRes = await fetch("http://127.0.0.1:8000/api/v1/governance/stats", {
        headers,
        credentials: "include",
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch Audit Logs
      const params = new URLSearchParams();
      if (actionFilter) params.append("action", actionFilter);
      if (searchEmail) params.append("actor_email", searchEmail);
      params.append("page_size", "40");

      const logsRes = await fetch(`http://127.0.0.1:8000/api/v1/governance/audit-logs?${params.toString()}`, {
        headers,
        credentials: "include",
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);
      }

      // 3. Fetch Active Sessions
      const sessionsRes = await fetch("http://127.0.0.1:8000/api/v1/governance/sessions", {
        headers,
        credentials: "include",
      });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData || []);
      }
    } catch (err: any) {
      console.warn("Error fetching governance data:", err);
      setErrorMsg("Failed to connect to the backend governance services. Ensure the API server is active.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
  }, [actionFilter, searchEmail]);

  const handleRevokeSession = async (sessionId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/governance/sessions/revoke", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (res.ok) {
        setSuccessMsg(`Session ${sessionId.slice(0, 8)}... successfully terminated!`);
        fetchGovernanceData();
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.detail || "Failed to revoke session.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to contact revocation server.");
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!confirm("Are you sure you want to terminate all other active concurrent sessions?")) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/governance/sessions/revoke", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ revoke_all_others: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(data.message || "All other sessions revoked.");
        fetchGovernanceData();
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.detail || "Failed to terminate sessions.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to contact revocation server.");
    }
  };

  const handleUpdateUserStatus = async (userId: number, newStatus: string) => {
    setStatusUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/governance/users/${userId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: userId,
          new_status: newStatus,
          reason: `Policy lifecycle modification applied by TPO Officer (${user?.fullName || "Admin"})`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`User #${userId} status updated to ${newStatus}. ${newStatus === "SUSPENDED" ? "All active sessions immediately revoked." : ""}`);
        fetchGovernanceData();
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.detail || "Failed to update lifecycle status.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to apply governance policy.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("SUCCESS")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (action.includes("FAILED") || action.includes("LOCKED")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (action.includes("REVOKED") || action.includes("CHANGE")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (action.includes("REFRESH")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                Enterprise Identity & Access Governance (IAM / IAG)
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Zero Trust Architecture
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Identity & Access Governance Command Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Cryptographic Token Rotation, Real-Time Security Audit Logs, Concurrent Session Control & ABAC Lifecycle Policies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchGovernanceData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh Telemetry</span>
            </button>
            <Link
              href="/dashboard/tpo"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
            >
              <span>Back to Command Center</span>
            </Link>
          </div>
        </div>

        {/* Notifications & Banners */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Security Alert / Communication Warning</p>
              <p className="text-rose-700 text-xs mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Policy Applied Successfully</p>
              <p className="text-emerald-700 text-xs mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Governance Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Posture</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats?.compliance_score_pct ?? 98}%</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">SOC-2 Ready</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Zero Trust attribute authorization enforced</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Device Sessions</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Laptop className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats?.active_sessions ?? sessions.length}</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Rotating Refresh</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Opaque cryptographic 256-bit hashes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Brute-Force Shield (24h)</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats?.failed_logins_24h ?? 0}</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">5-Attempt Lockout</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">15-minute automatic IP/account defense</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Events (24h)</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats?.security_events_24h ?? auditLogs.length}</span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Immutable</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Tamper-evident audit ledger entries</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "audit"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Immutable Security Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "sessions"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Active Sessions & Device Fingerprints ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("lifecycle")}
            className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "lifecycle"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Identity Lifecycle & Offboarding (JML)</span>
          </button>
        </div>

        {/* TAB 1: IMMUTABLE AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter by actor email or IP address..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="bg-white text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                >
                  <option value="">All Security Events</option>
                  <option value="AUTH_LOGIN_SUCCESS">AUTH_LOGIN_SUCCESS</option>
                  <option value="AUTH_LOGIN_FAILED">AUTH_LOGIN_FAILED</option>
                  <option value="AUTH_LOCKED_OUT">AUTH_LOCKED_OUT</option>
                  <option value="TOKEN_REFRESH">TOKEN_REFRESH</option>
                  <option value="USER_REGISTERED">USER_REGISTERED</option>
                  <option value="AUTH_LOGOUT">AUTH_LOGOUT</option>
                  <option value="SESSION_REVOKED">SESSION_REVOKED</option>
                  <option value="USER_STATUS_CHANGE">USER_STATUS_CHANGE</option>
                </select>
              </div>
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Actor Email & Role</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Context / Payload Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No security audit logs found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{log.actor_email}</div>
                          {log.actor_role && (
                            <span className="text-[10px] text-slate-400">{log.actor_role}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : log.status === "BLOCKED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {log.ip_address || "127.0.0.1"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details || ""}>
                          {log.details ? log.details : <span className="text-slate-300 italic">None</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE SESSIONS & DEVICE REVOCATION */}
        {activeTab === "sessions" && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Connected Device & Session Registry</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect issued refresh token sessions. Revoking a session immediately halts all token rotation.
                </p>
              </div>
              <button
                onClick={handleRevokeAllOthers}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Terminate All Other Sessions</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.length === 0 ? (
                <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
                  No active identity sessions found.
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      sess.is_revoked
                        ? "border-slate-200 opacity-60 bg-slate-50/50"
                        : "border-slate-200/80 shadow-xs hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          sess.is_revoked ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-600"
                        }`}>
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {sess.device_info ? sess.device_info.slice(0, 45) : "Browser Client"}
                            </span>
                            {sess.is_revoked ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                REVOKED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-slate-400">ID: {sess.session_id.slice(0, 16)}...</span>
                        </div>
                      </div>

                      {!sess.is_revoked && (
                        <button
                          onClick={() => handleRevokeSession(sess.session_id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500 font-mono">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">IP Address</span>
                        <span className="text-slate-700">{sess.ip_address || "127.0.0.1"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">Last Active</span>
                        <span className="text-slate-700">{new Date(sess.last_active_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: USER LIFECYCLE & JML OFFBOARDING */}
        {activeTab === "lifecycle" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">User Lifecycle Governance (Joiner - Mover - Leaver)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enforce institutional boundaries. Suspending an account instantly terminates all active sessions, revokes refresh tokens, and blocks API access.
              </p>
            </div>

            {/* Interactive Policy Tool */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 max-w-xl space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Manage User Status & Access Killswitch
              </span>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target User ID</label>
                  <input
                    type="number"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-white text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 2 (Student Aarav Patel)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Lifecycle State</label>
                  <select
                    value={targetUserStatus}
                    onChange={(e) => setTargetUserStatus(e.target.value)}
                    className="w-full bg-white text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE (Full Authorized Access)</option>
                    <option value="SUSPENDED">SUSPENDED (Immediate Session Kill & Block)</option>
                    <option value="ALUMNI">ALUMNI (Graduated Student - Read Only Records)</option>
                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION (Restricted)</option>
                  </select>
                </div>

                <button
                  onClick={() => handleUpdateUserStatus(parseInt(targetUserId), targetUserStatus)}
                  disabled={statusUpdating}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {statusUpdating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  <span>Apply Identity Governance Policy</span>
                </button>
              </div>
            </div>

            {/* Policy Reference Matrix */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Identity Governance Role & Attribute Matrix (ABAC & RBAC)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                  <span className="font-bold text-emerald-800 block">Student Identity</span>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    ABAC bounded to own records (`user.id == student.user_id`). Edge middleware blocks access to `/dashboard/tpo`.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100">
                  <span className="font-bold text-indigo-800 block">Placement Officer (TPO)</span>
                  <p className="text-indigo-700 text-[11px] mt-0.5">
                    Administrative authority over institution cohort. Access to audit logs, session killswitch, and scheduling.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100">
                  <span className="font-bold text-amber-800 block">Alumni / Offboarded</span>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    Drive applications disabled. Historical offer certificates accessible in read-only encrypted vault.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
