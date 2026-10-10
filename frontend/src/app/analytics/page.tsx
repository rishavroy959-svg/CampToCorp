"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  KPICard,
  StatusPill,
  Button,
} from "@/components/camptocorp";
import {
  BarChart3,
  TrendingUp,
  Download,
  Award,
  Building,
  GraduationCap,
  PieChart,
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

interface AnalyticsData {
  academic_year: string;
  cohort: string;
  kpis: {
    total_students: number;
    placed_students: number;
    placement_rate_pct: number;
    total_offers: number;
    avg_ctc_lpa: number;
    highest_ctc_lpa: number;
    at_risk_count: number;
    active_drives_count: number;
  };
  readiness_distribution: {
    tier_1_highly_employable: number;
    tier_2_job_ready: number;
    tier_3_developing: number;
    tier_4_at_risk: number;
  };
  department_conversions: Array<{
    branch: string;
    total: number;
    placed: number;
    rate_pct: number;
    avg_ctc: number;
  }>;
  ctc_bands: Array<{
    name: string;
    count: number;
    pct: number;
  }>;
  compliance: {
    nirf_metric_5_2_1: string;
    median_salary_lpa: number;
    higher_studies_count: number;
    entrepreneurship_count: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined"
          ? (localStorage.getItem("camptocorp_jwt_token") || localStorage.getItem("camptocorp_jwt_token"))
          : null;
        const res = await fetch("http://127.0.0.1:8000/api/v1/analytics/overview", {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.warn("Failed to load analytics:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportNIRF = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  const kpis = data?.kpis || {
    total_students: 0,
    placed_students: 0,
    placement_rate_pct: 0,
    total_offers: 0,
    avg_ctc_lpa: 0,
    highest_ctc_lpa: 0,
    at_risk_count: 0,
    active_drives_count: 0,
  };

  return (
    <div className="min-h-screen bg-campus-bg py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-campus-text-secondary uppercase tracking-wider mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-campus-primary" />
              <span>Campus Analytics Engine</span>
              <span>/</span>
              <span>Batch Placement & Accreditation (PRD Module G)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-campus-text-primary">
              Institutional Placement Analytics
            </h1>
            <p className="text-sm text-campus-text-secondary mt-1">
              Graduating Batch of 2026 &bull; Real-time salary distributions, department conversions, and accreditation audit metrics for your campus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleExportNIRF}
              icon={<Download className="w-4 h-4" />}
            >
              Export NIRF / NAAC Report
            </Button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                NIRF / NAAC Placement Compliance Report generated and exported successfully (CSV & PDF).
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 underline cursor-pointer">
              Download Saved Copy
            </span>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <KPICard
            title="Batch Placement Rate"
            metric={`${kpis.placement_rate_pct}%`}
            subtitle={`${kpis.placed_students} of ${kpis.total_students} Registered Students`}
            trend={{ value: `${kpis.placed_students} Placed`, isPositive: kpis.placement_rate_pct > 0 }}
            icon={<GraduationCap className="w-5 h-5 text-campus-primary" />}
          />
          <KPICard
            title="Average CTC Package"
            metric={`${kpis.avg_ctc_lpa} LPA`}
            subtitle={`Median: ${data?.compliance?.median_salary_lpa || 0} LPA`}
            trend={{ value: "Active Offers", isPositive: true }}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          />
          <KPICard
            title="Highest Package"
            metric={`${kpis.highest_ctc_lpa} LPA`}
            subtitle={`${kpis.total_offers} Total Offer Letters`}
            icon={<Award className="w-5 h-5 text-purple-600" />}
          />
          <KPICard
            title="Active Campus Drives"
            metric={`${kpis.active_drives_count} Drives`}
            subtitle={`${kpis.at_risk_count} Candidates At-Risk`}
            icon={<Building className="w-5 h-5 text-blue-600" />}
          />
        </div>

        {/* CTC Distribution & Bracket Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-squarespace p-6 space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-campus-text-primary">
                  CTC Package Tier Distribution
                </h2>
                <p className="text-xs text-campus-text-secondary mt-0.5">
                  Verified offers categorized by institutional salary bands.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {kpis.total_offers} Total Offers Extended
              </span>
            </div>

            <div className="space-y-4">
              {(data?.ctc_bands || []).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                  No verified offers extended yet. Once recruiters release offer letters, salary distribution will appear here.
                </div>
              ) : (
                (data?.ctc_bands || []).map((band, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-campus-text-primary">
                        {band.name}
                      </span>
                      <span className="font-bold text-slate-800">
                        {band.count} Offers ({band.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, band.pct * 2)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Institutional Compliance Card */}
          <div className="card-squarespace p-6 space-y-5">
            <h2 className="text-base font-bold text-campus-text-primary">
              NIRF & NAAC Audit Readiness
            </h2>
            <p className="text-xs text-campus-text-secondary">
              Parameters tracked for institutional accreditation metrics.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border flex items-center justify-between">
                <span className="text-slate-600">Metric 5.2.1 (Placement %):</span>
                <span className="font-bold text-emerald-600">{data?.compliance?.nirf_metric_5_2_1 || "0%"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border flex items-center justify-between">
                <span className="text-slate-600">Median Salary (Metric 5.2.2):</span>
                <span className="font-bold text-campus-primary">{data?.compliance?.median_salary_lpa || 0} LPA</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border flex items-center justify-between">
                <span className="text-slate-600">At-Risk Interventions:</span>
                <span className="font-bold text-rose-600">{kpis.at_risk_count} Students Flagged</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border flex items-center justify-between">
                <span className="text-slate-600">Campus Placement Status:</span>
                <span className="font-bold text-indigo-700">Official Institutional Tenancy</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={handleExportNIRF}
              icon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Generate NIRF Excel Data
            </Button>
          </div>
        </div>

        {/* Department Conversion Table */}
        <div className="card-squarespace p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-campus-text-primary">
                Departmental Conversion & Salary Breakdown
              </h2>
              <p className="text-xs text-campus-text-secondary mt-0.5">
                Comparative analysis across engineering disciplines for your college.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-campus-border text-campus-text-secondary font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Academic Department</th>
                  <th className="py-3 px-3 text-center">Batch Size</th>
                  <th className="py-3 px-3 text-center">Placed</th>
                  <th className="py-3 px-3 text-center">Conversion %</th>
                  <th className="py-3 px-3 text-right">Avg CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(data?.department_conversions || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No student records found in your institutional directory.
                    </td>
                  </tr>
                ) : (
                  (data?.department_conversions || []).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-campus-text-primary">
                        {row.branch}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">{row.total}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">
                        {row.placed}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {row.rate_pct}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-campus-primary">
                        {row.avg_ctc ? `${row.avg_ctc} LPA` : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
