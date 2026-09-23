import React from "react";

export type PillVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary";

interface StatusPillProps {
  label: string;
  variant?: PillVariant;
  dot?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  variant = "neutral",
  dot = true,
  className = "",
}) => {
  const styles: Record<
    PillVariant,
    { bg: string; text: string; border: string; dotColor: string }
  > = {
    success: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dotColor: "bg-emerald-500",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dotColor: "bg-amber-500",
    },
    danger: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dotColor: "bg-rose-500",
    },
    info: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dotColor: "bg-blue-500",
    },
    primary: {
      bg: "bg-slate-100",
      text: "text-campus-primary",
      border: "border-slate-200",
      dotColor: "bg-campus-primary",
    },
    neutral: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
      dotColor: "bg-slate-400",
    },
  };

  const current = styles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor}`} />}
      {label}
    </span>
  );
};
