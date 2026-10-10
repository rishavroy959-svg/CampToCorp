import React from "react";
import { ReadinessLevel } from "@/types";

interface ReadinessRingProps {
  score: number; // 0 to 100
  size?: number; // width & height in px, default 140
  strokeWidth?: number; // default 10
  showLabel?: boolean;
  className?: string;
}

export function getReadinessTier(score: number): {
  level: ReadinessLevel;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  if (score >= 86) {
    return {
      level: "HIGHLY_EMPLOYABLE",
      label: "Highly Employable",
      color: "#16A34A",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
    };
  } else if (score >= 71) {
    return {
      level: "READY",
      label: "Ready",
      color: "#2563EB",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
    };
  } else if (score >= 41) {
    return {
      level: "DEVELOPING",
      label: "Developing",
      color: "#D97706",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
    };
  } else {
    return {
      level: "NOT_READY",
      label: "Not Ready",
      color: "#DC2626",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
    };
  }
}

export const ReadinessRing: React.FC<ReadinessRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  showLabel = true,
  className = "",
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const tier = getReadinessTier(normalizedScore);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tier.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tracking-tight text-campus-text-primary">
            {normalizedScore}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-campus-text-secondary">
            / 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-3 text-center">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${tier.bgColor} ${tier.textColor} ${tier.borderColor}`}
          >
            {tier.label}
          </span>
        </div>
      )}
    </div>
  );
};
