import { useState } from "react";
import { evidence, template, type SectionKey } from "../data/evidence";
import type { TrendPoint } from "../model/simulation";

interface MiniTrendChartProps {
  data: TrendPoint[];
  section?: SectionKey;
  glucoseLabel?: string;
  insulinLabel?: string;
  betaCellFunction?: number;
  carbsGrams?: number;
  activityMinutes?: number;
  insulinSensitivity?: number;
}

function smoothPath(points: Array<[number, number]>) {
  if (points.length < 2) return "";
  const [first, ...rest] = points;
  let d = `M ${first[0]} ${first[1]}`;
  for (let i = 0; i < rest.length; i += 1) {
    const prev = points[i];
    const curr = rest[i];
    const midX = (prev[0] + curr[0]) / 2;
    d += ` Q ${midX} ${prev[1]} ${curr[0]} ${curr[1]}`;
  }
  return d;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundedRange(minRaw: number, maxRaw: number, lowBound: number, highBound: number, minSpan: number) {
  const rawSpan = Math.max(minSpan, maxRaw - minRaw);
  const pad = Math.max(8, rawSpan * 0.16);
  const min = Math.max(lowBound, Math.floor((minRaw - pad) / 10) * 10);
  const max = Math.min(highBound, Math.ceil((maxRaw + pad) / 10) * 10);
  if (max - min < minSpan) {
    return { min, max: Math.min(highBound, min + minSpan) };
  }
  return { min, max };
}

export function MiniTrendChart({
  data,
  section = "normal",
  glucoseLabel = "Glucose",
  insulinLabel = "Insulin",
  betaCellFunction = 0.8,
  carbsGrams = 0,
  activityMinutes = 0,
  insulinSensitivity = 0.8
}: MiniTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 720;
  const height = 380;
  const pad = { top: 26, right: 62, bottom: 40, left: 52 };

  const maxX = Math.max(1, ...data.map((p) => p.t));
  const glucoseValues = data.map((p) => p.glucose);
  const insulinValues = data.map((p) => p.insulin);
  const gMinRaw = Math.min(...glucoseValues);
  const gMaxRaw = Math.max(...glucoseValues);
  const iMinRaw = Math.min(...insulinValues);
  const iMaxRaw = Math.max(...insulinValues);
  const gRange = roundedRange(
    gMinRaw,
    gMaxRaw,
    evidence.model_constants.plausible_ranges.glucose_mgdl.min,
    evidence.model_constants.plausible_ranges.glucose_mgdl.max,
    70
  );
  const iMin = Math.max(0, Math.floor(iMinRaw - 8));
  const iMax = Math.ceil(iMaxRaw + 8);

  const xOf = (t: number) => pad.left + (t / maxX) * (width - pad.left - pad.right);
  const yGlucose = (value: number) => height - pad.bottom - ((value - gRange.min) / Math.max(1, gRange.max - gRange.min)) * (height - pad.top - pad.bottom);
  const yInsulin = (value: number) => height - pad.bottom - ((value - iMin) / Math.max(1, iMax - iMin)) * (height - pad.top - pad.bottom);

  const points = data.map((p) => ({
    x: xOf(p.t),
    g: yGlucose(p.glucose),
    i: yInsulin(p.insulin)
  }));

  const glucosePath = smoothPath(points.map((p) => [p.x, p.g]));
  const insulinPath = smoothPath(points.map((p) => [p.x, p.i]));
  const baseline = data[0]?.glucose ?? 0;
  const peakIndex = data.reduce((best, point, idx) => (point.glucose > data[best].glucose ? idx : best), 0);
  const peakPoint = data[peakIndex];
  const baselineRecoveryIndex = data.findIndex((point, idx) => idx > peakIndex && point.glucose <= baseline + 5);
  const insulinResponse =
    betaCellFunction >= evidence.thresholds.insulin_response.strong_min
      ? "strong"
      : betaCellFunction >= evidence.thresholds.insulin_response.moderate_min
        ? "moderate"
        : "weak";
  const hoverPoint = hoverIndex !== null ? points[hoverIndex] : null;
  const hoveredData = hoverIndex !== null ? data[hoverIndex] : null;
  const risk126Y = clamp(yGlucose(evidence.thresholds.glucose.bands.fasting_bad), pad.top, height - pad.bottom);
  const risk180Y = clamp(yGlucose(evidence.thresholds.glucose.bands.post_meal_warn), pad.top, height - pad.bottom);
  const whyGlucose = template(evidence.explanations.why_glucose_changed_template.text, {
    carbs_g: Math.round(carbsGrams),
    activity_min: Math.round(activityMinutes),
    insulin_sensitivity_pct: Math.round(insulinSensitivity * 100),
    beta_cell_function_pct: Math.round(betaCellFunction * 100)
  });

  return (
    <div className="glass-panel p-4">
      <div className="mb-3 rounded-xl border border-[#d8e7f5] bg-white/80 p-3 text-sm text-[#334155]">
        <p className="m-0 font-semibold text-[#2E3A8C]">What this graph shows</p>
        <p className="m-0 mt-1">{evidence.explanations.what_this_graph_shows[section]}</p>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <article className="rounded-xl border border-[#d5e6f4] bg-white/80 px-3 py-2 text-xs text-[#334155]">
          <p className="m-0 text-[11px] uppercase tracking-wider text-[#64748B]">Glucose peak</p>
          <p className="m-0 mt-1 font-semibold text-[#0F172A]">{peakPoint?.glucose ?? 0} mg/dL at {peakPoint?.t ?? 0}h</p>
          <p className="m-0 mt-1 text-[11px] text-[#64748B]">Peak rises with higher carb load and weaker uptake support.</p>
        </article>
        <article className="rounded-xl border border-[#d5e6f4] bg-white/80 px-3 py-2 text-xs text-[#334155]">
          <p className="m-0 text-[11px] uppercase tracking-wider text-[#64748B]">Time-to-baseline</p>
          <p className="m-0 mt-1 font-semibold text-[#0F172A]">
            {baselineRecoveryIndex >= 0 ? `${data[baselineRecoveryIndex].t}h (within +5 mg/dL)` : "Not reached in current window"}
          </p>
          <p className="m-0 mt-1 text-[11px] text-[#64748B]">Slower recovery usually indicates lower sensitivity, lower activity, or lower beta-cell reserve.</p>
        </article>
        <article className="rounded-xl border border-[#d5e6f4] bg-white/80 px-3 py-2 text-xs text-[#334155]">
          <p className="m-0 text-[11px] uppercase tracking-wider text-[#64748B]">Insulin response</p>
          <p className="m-0 mt-1 font-semibold text-[#0F172A]">{insulinResponse} (beta-cell function {(betaCellFunction * 100).toFixed(0)}%)</p>
          <p className="m-0 mt-1 text-[11px] text-[#64748B]">Classification comes from evidence thresholds and is deterministic for identical inputs.</p>
        </article>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-[#334155]">
        <div className="flex gap-3">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#3DA9FC]" />{glucoseLabel}</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#8B5CF6]" />{insulinLabel}</span>
        </div>
        <span className="text-[#64748B]">Risk bands: &ge;{evidence.thresholds.glucose.bands.fasting_bad} fasting, &ge;{evidence.thresholds.glucose.bands.post_meal_warn} post-meal</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        onMouseMove={(event) => {
          const bounds = (event.currentTarget as SVGElement).getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width) * width;
          const nearest = points.reduce((best, p, idx) => (Math.abs(p.x - x) < Math.abs(points[best].x - x) ? idx : best), 0);
          setHoverIndex(nearest);
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="glucoseLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3DA9FC" />
            <stop offset="100%" stopColor="#0FB9B1" />
          </linearGradient>
          <linearGradient id="glucoseArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(61,169,252,0.28)" />
            <stop offset="100%" stopColor="rgba(61,169,252,0.03)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={width} height={height} rx="18" fill="#F8FCFF" />
        <rect x={pad.left} y={pad.top} width={width - pad.left - pad.right} height={Math.max(0, risk180Y - pad.top)} fill="rgba(239,68,68,0.08)" />
        <rect x={pad.left} y={risk180Y} width={width - pad.left - pad.right} height={Math.max(0, risk126Y - risk180Y)} fill="rgba(245,158,11,0.1)" />

        <line x1={pad.left} y1={yGlucose(baseline)} x2={width - pad.right} y2={yGlucose(baseline)} stroke="#93b4cc" strokeDasharray="4 4" />
        <line x1={pad.left} y1={yGlucose(evidence.thresholds.glucose.bands.post_meal_warn)} x2={width - pad.right} y2={yGlucose(evidence.thresholds.glucose.bands.post_meal_warn)} stroke="rgba(239,68,68,0.5)" strokeDasharray="3 4" />
        <line x1={pad.left} y1={yGlucose(evidence.thresholds.glucose.bands.fasting_bad)} x2={width - pad.right} y2={yGlucose(evidence.thresholds.glucose.bands.fasting_bad)} stroke="rgba(245,158,11,0.45)" strokeDasharray="3 4" />

        <path
          d={`${glucosePath} L ${points[points.length - 1]?.x ?? 0} ${height - pad.bottom} L ${points[0]?.x ?? 0} ${height - pad.bottom} Z`}
          fill="url(#glucoseArea)"
          className="transition-all duration-300"
        />
        <path d={glucosePath} fill="none" stroke="url(#glucoseLine)" strokeWidth="3.2" className="transition-all duration-300" />
        <path d={insulinPath} fill="none" stroke="#8B5CF6" strokeWidth="2.4" strokeDasharray="5 4" className="transition-all duration-300" />

        <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} stroke="#c3d5e6" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="#c3d5e6" />
        <line x1={width - pad.right} y1={pad.top} x2={width - pad.right} y2={height - pad.bottom} stroke="#d4e1ec" />

        <text x={pad.left - 8} y={pad.top - 6} textAnchor="start" fontSize="10" fill="#64748B">mg/dL</text>
        <text x={width - pad.right + 8} y={pad.top - 6} textAnchor="start" fontSize="10" fill="#64748B">Ins</text>
        <text x={pad.left + 4} y={yGlucose(baseline) - 6} fontSize="10" fill="#64748B">Baseline {baseline}</text>
        <text x={width - pad.right + 8} y={yInsulin(iMax)} fontSize="10" fill="#64748B">{iMax}</text>
        <text x={width - pad.right + 8} y={yInsulin(iMin)} fontSize="10" fill="#64748B">{iMin}</text>

        <circle cx={points[peakIndex]?.x ?? 0} cy={points[peakIndex]?.g ?? 0} r="4.4" fill="#0FB9B1" />
        <text x={(points[peakIndex]?.x ?? 0) + 6} y={(points[peakIndex]?.g ?? 0) - 8} fontSize="10" fill="#0F172A">
          Peak {peakPoint?.glucose ?? 0}
        </text>

        {hoverPoint ? (
          <g>
            <line x1={hoverPoint.x} y1={pad.top} x2={hoverPoint.x} y2={height - pad.bottom} stroke="#94A3B8" strokeDasharray="3 4" />
            <circle cx={hoverPoint.x} cy={hoverPoint.g} r="4" fill="#3DA9FC" />
            <circle cx={hoverPoint.x} cy={hoverPoint.i} r="3.5" fill="#8B5CF6" />
            <rect x={hoverPoint.x + 8} y={Math.min(hoverPoint.g, hoverPoint.i) - 30} width="136" height="42" rx="8" fill="rgba(255,255,255,0.94)" stroke="#c7d5e3" />
            <text x={hoverPoint.x + 14} y={Math.min(hoverPoint.g, hoverPoint.i) - 16} fontSize="10" fill="#0F172A">{hoveredData?.t ?? 0}h</text>
            <text x={hoverPoint.x + 14} y={Math.min(hoverPoint.g, hoverPoint.i) - 4} fontSize="10" fill="#334155">G {hoveredData?.glucose ?? 0} mg/dL</text>
            <text x={hoverPoint.x + 82} y={Math.min(hoverPoint.g, hoverPoint.i) - 4} fontSize="10" fill="#334155">I {hoveredData?.insulin ?? 0}</text>
          </g>
        ) : null}
      </svg>

      <div className="mt-3 rounded-xl border border-[#d8e7f5] bg-white/80 p-3 text-xs text-[#334155]">
        <p className="m-0 font-semibold text-[#2E3A8C]">Why did glucose change?</p>
        <p className="m-0 mt-1 leading-relaxed">{whyGlucose}</p>
      </div>
    </div>
  );
}
