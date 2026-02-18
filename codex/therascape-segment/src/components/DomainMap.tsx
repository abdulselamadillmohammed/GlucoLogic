import { DOMAIN_LABELS, DOMAIN_ORDER, type DomainEffects } from "../logic/types";

type DomainMapProps = {
  baseline: DomainEffects;
  intensity: DomainEffects;
};

const positions = [
  { x: 400, y: 70 },
  { x: 600, y: 170 },
  { x: 600, y: 380 },
  { x: 400, y: 490 },
  { x: 200, y: 380 },
  { x: 200, y: 170 }
];

export function DomainMap({ baseline, intensity }: DomainMapProps) {
  return (
    <svg
      className="domain-map"
      viewBox="0 0 800 560"
      role="img"
      aria-label="Domain intensity map"
    >
      {DOMAIN_ORDER.map((key, idx) => {
        const value = intensity[key];
        const base = baseline[key];
        const delta = value - base;
        const status = delta < 0 ? "benefit" : delta > 0 ? "risk" : "neutral";
        const intensityAlpha = Math.min(Math.abs(value) / 6, 1);
        return (
          <g key={key} transform={`translate(${positions[idx].x}, ${positions[idx].y})`}>
            <circle
              r="75"
              className={`domain-node ${status}`}
              style={{ opacity: 0.35 + intensityAlpha * 0.55 }}
            />
            <text y="-10" textAnchor="middle" className="domain-label">
              {DOMAIN_LABELS[key]}
            </text>
            <text y="18" textAnchor="middle" className="domain-score">
              {value > 0 ? `+${value}` : value}
            </text>
            <text y="40" textAnchor="middle" className="domain-delta">
              {delta < 0 ? "Glow" : delta > 0 ? "Warning" : "Stable"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
