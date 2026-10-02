import React from "react";
import { Sparkles, SlidersHorizontal } from "lucide-react";

interface FactorContribution {
  factor: string;
  impact: "positive" | "negative" | "neutral";
  detail: string;
}

interface ExplainabilityCardProps {
  title?: string;
  explanation: string;
  factors?: FactorContribution[];
  confidenceScore?: number;
  overrideAllowed?: boolean;
  onOverride?: () => void;
  className?: string;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({
  title = "AI Decision Justification",
  explanation,
  factors = [],
  confidenceScore,
  overrideAllowed = false,
  onOverride,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 text-white shadow-sm shadow-indigo-500/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {title}
            </h4>
            {confidenceScore !== undefined && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {Math.round(confidenceScore * 100)}% match confidence
              </span>
            )}
          </div>

          <p className="mt-1.5 text-xs text-slate-700 leading-relaxed font-normal">
            {explanation}
          </p>

          {factors.length > 0 && (
            <div className="mt-3.5 space-y-1.5 pt-3 border-t border-blue-200/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">
                Key Contributing Factors
              </span>
              <div className="grid gap-1.5 mt-1 sm:grid-cols-2">
                {factors.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs bg-white/70 px-2.5 py-1.5 rounded-md border border-blue-100"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        f.impact === "positive"
                          ? "bg-emerald-500"
                          : f.impact === "negative"
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                    />
                    <span className="font-medium text-slate-800">{f.factor}:</span>
                    <span className="text-slate-600 truncate">{f.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {overrideAllowed && (
            <div className="mt-3.5 flex justify-end">
              <button
                type="button"
                onClick={onOverride}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white/90 hover:bg-white px-3 py-1.5 rounded-md border border-blue-200 transition-colors shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Override AI Decision
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
