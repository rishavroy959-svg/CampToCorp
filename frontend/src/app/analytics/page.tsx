"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  KPICard,
  StatusPill,
  Button,
} from "@/components/campuslink";
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
} from "lucide-react";

export default function AnalyticsPage() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportNIRF = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
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
              Graduating Batch of 2026 &bull; Real-time salary distributions, department conversions, and accreditation audit metrics.
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
                NIRF / NAAC Placement Compliance Report 2025–2026 generated and exported successfully (CSV & PDF).
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
            metric="76.4%"
            subtitle="344 of 450 Graduating Students"
            trend={{ value: "+12.4% YoY", isPositive: true }}
            icon={<GraduationCap className="w-5 h-5 text-campus-primary" />}
          />
          <KPICard
            title="Average CTC Package"
            metric="12.8 LPA"
            subtitle="Median: 10.5 LPA"
            trend={{ value: "+18.2% YoY", isPositive: true }}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          />
          <KPICard
            title="Highest Package"
            metric="44.0 LPA"
            subtitle="Google Cloud (SRE)"
            icon={<Award className="w-5 h-5 text-purple-600" />}
          />
          <KPICard
            title="Recruiting Partners"
            metric="64 Companies"
            subtitle="28 Fortune 500 Orgs"
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
                  Offers categorized by institutional salary bands.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                412 Total Offers Extended
              </span>
            </div>

            <div className="space-y-4">
              {[
                {
                  tier: "Super Dream (> 20.0 LPA)",
                  count: 42,
                  pct: 10.2,
                  color: "bg-purple-600",
                  textColor: "text-purple-700",
                  bgColor: "bg-purple-50",
                  borderColor: "border-purple-200",
                  companies: "Google Cloud, Microsoft IDC, Goldman Sachs",
                },
                {
                  tier: "Dream (10.0 – 20.0 LPA)",
                  count: 156,
                  pct: 37.8,
                  color: "bg-blue-600",
                  textColor: "text-blue-700",
                  bgColor: "bg-blue-50",
                  borderColor: "border-blue-200",
                  companies: "Cisco Systems, Qualcomm, Amazon Web Services",
                },
                {
                  tier: "Regular (5.0 – 10.0 LPA)",
                  count: 146,
                  pct: 35.4,
                  color: "bg-emerald-600",
                  textColor: "text-emerald-700",
                  bgColor: "bg-emerald-50",
                  borderColor: "border-emerald-200",
                  companies: "Accenture, TCS Digital, Cognizant GenC Next",
                },
                {
                  tier: "Mass / Foundation (< 5.0 LPA)",
                  count: 68,
                  pct: 16.5,
                  color: "bg-slate-400",
                  textColor: "text-slate-700",
                  bgColor: "bg-slate-50",
                  borderColor: "border-slate-200",
                  companies: "Campus pool drives and service cohorts",
                },
              ].map((tier, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-campus-text-primary">
                      {tier.tier}
                    </span>
                    <span className="font-bold text-slate-800">
                      {tier.count} Offers ({tier.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${tier.color} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${tier.pct * 2}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-campus-text-secondary">
                    Key recruiters: {tier.companies}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Compliance Card */}
          <div className="card-squarespace p-6 space-y-5">
            <h2 className="text-base font-bold text-campus-text-primary">
              NIRF & NAAC Audit Readiness
            </h2>
            <p className="text-xs text-campus-text-secondary">
              Parameters tracked for Ministry of Education accreditation metrics.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border flex items-center justify-between">
                <span className="text-slate-600">Metric 5.2.1 (Placement %):</span>
                <span className="font-bold text-emerald-600">76.4% (Pass)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border flex items-center justify-between">
                <span className="text-slate-600">Median Salary (Metric 5.2.2):</span>
                <span className="font-bold text-campus-primary">10.5 LPA</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border flex items-center justify-between">
                <span className="text-slate-600">Higher Studies Progression:</span>
                <span className="font-bold text-slate-700">38 Students (8.4%)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-campus-border flex items-center justify-between">
                <span className="text-slate-600">Multi-Offer Candidates:</span>
                <span className="font-bold text-purple-700">68 Students</span>
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
                Comparative analysis across all engineering faculties.
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
                  <th className="py-3 px-3 text-right">Highest CTC</th>
                  <th className="py-3 px-4 text-right">At-Risk Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  {
                    dept: "Computer Science & Engineering",
                    batch: 130,
                    placed: 120,
                    pct: 92.3,
                    avg: "16.4 LPA",
                    highest: "44.0 LPA",
                    atRisk: 4,
                  },
                  {
                    dept: "Information Technology",
                    batch: 70,
                    placed: 59,
                    pct: 84.2,
                    avg: "14.1 LPA",
                    highest: "32.0 LPA",
                    atRisk: 3,
                  },
                  {
                    dept: "Electronics & Communication",
                    batch: 120,
                    placed: 88,
                    pct: 73.3,
                    avg: "11.8 LPA",
                    highest: "26.0 LPA",
                    atRisk: 11,
                  },
                  {
                    dept: "Mechanical Engineering",
                    batch: 130,
                    placed: 77,
                    pct: 59.2,
                    avg: "8.4 LPA",
                    highest: "16.0 LPA",
                    atRisk: 16,
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-campus-text-primary">
                      {row.dept}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">{row.batch}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">
                      {row.placed}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {row.pct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-campus-primary">
                      {row.avg}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-800">
                      {row.highest}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          row.atRisk > 10
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {row.atRisk} Students
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
