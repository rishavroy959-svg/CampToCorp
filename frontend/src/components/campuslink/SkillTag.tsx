import React from "react";
import { Check, AlertCircle, X } from "lucide-react";

export type SkillMatchStatus = "matched" | "partial" | "missing";

interface SkillTagProps {
  name: string;
  status?: SkillMatchStatus;
  showIcon?: boolean;
  className?: string;
}

export const SkillTag: React.FC<SkillTagProps> = ({
  name,
  status = "matched",
  showIcon = true,
  className = "",
}) => {
  const styles = {
    matched: {
      container: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: <Check className="w-3.5 h-3.5 text-emerald-600" />,
      label: "Matched",
    },
    partial: {
      container: "bg-amber-50 text-amber-800 border-amber-200",
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
      label: "Partial",
    },
    missing: {
      container: "bg-red-50 text-red-800 border-red-200",
      icon: <X className="w-3.5 h-3.5 text-red-600" />,
      label: "Missing",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${styles.container} ${className}`}
      title={`${name} (${styles.label})`}
    >
      {showIcon && styles.icon}
      <span>{name}</span>
    </span>
  );
};
