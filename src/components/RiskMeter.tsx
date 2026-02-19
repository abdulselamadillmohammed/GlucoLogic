interface RiskMeterProps {
  label: string;
  value: number;
  explanation?: string;
}

export function RiskMeter({ label, value, explanation }: RiskMeterProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const tone = pct < 35 ? "bg-emerald-500" : pct < 65 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-1" title={explanation}>
      <div className="flex items-center justify-between text-xs text-[#334155]">
        <span>{label}</span>
        <span className="inline-flex items-center gap-1">
          {pct}%
          {explanation ? <span className="text-[10px] opacity-70">?</span> : null}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#e7eff7]">
        <div className={`h-2 rounded-full ${tone} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
