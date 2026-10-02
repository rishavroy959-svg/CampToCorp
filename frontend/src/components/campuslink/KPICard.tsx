import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  metric: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  metric,
  subtitle,
  trend,
  icon,
  variant = "default",
  className = "",
}) => {
  const variantStyles = {
    default: "border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md",
    warning: "border-amber-200 bg-amber-50/20 hover:border-amber-300 shadow-xs hover:shadow-md",
    danger: "border-rose-200 bg-rose-50/20 hover:border-rose-300 shadow-xs hover:shadow-md",
    success: "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 shadow-xs hover:shadow-md",
  }[variant];

  const topAccentBar = {
    default: "bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500",
    warning: "bg-gradient-to-r from-amber-400 to-orange-500",
    danger: "bg-gradient-to-r from-rose-500 to-red-600",
    success: "bg-gradient-to-r from-emerald-400 to-teal-600",
  }[variant];

  return (
    <div
      className={`card-squarespace relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${variantStyles} ${className}`}
    >
      {/* Top Gradient Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${topAccentBar}`} />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
            {title}
          </span>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {metric}
          </div>
        </div>
        {icon && (
          <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-600 shadow-2xs">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 font-medium">{subtitle}</span>
          )}
          {trend && (
            <div
              className={`inline-flex items-center gap-1 font-bold ${
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
