import type { ReactNode } from "react";

interface MetricChipProps {
  label: string;
  value: string;
  status: "good" | "warn" | "bad";
  icon?: ReactNode;
  explanation?: string;
}

const statusClass = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  bad: "border-rose-200 bg-rose-50 text-rose-700"
};

export function MetricChip({ label, value, status, icon, explanation }: MetricChipProps) {
  return (
    <div
      title={explanation}
      className={`rounded-2xl border px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.06)] ${statusClass[status]}`}
    >
      <p className="text-[11px] uppercase tracking-widest opacity-80">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold">{value}</p>
        {explanation ? (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current/30 text-[10px] opacity-80">
            ?
          </span>
        ) : null}
      </div>
    </div>
  );
}
