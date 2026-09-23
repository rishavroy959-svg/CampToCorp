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
  const borderStyles = {
    default: "border-campus-border",
    warning: "border-amber-200 bg-amber-50/20",
    danger: "border-rose-200 bg-rose-50/20",
    success: "border-emerald-200 bg-emerald-50/20",
  }[variant];

  return (
    <div
      className={`card-squarespace relative overflow-hidden flex flex-col justify-between ${borderStyles} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-campus-text-secondary">
            {title}
          </span>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-campus-text-primary">
            {metric}
          </div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-campus-border text-campus-primary">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-campus-text-secondary">{subtitle}</span>
          )}
          {trend && (
            <div
              className={`inline-flex items-center gap-1 font-medium ${
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
