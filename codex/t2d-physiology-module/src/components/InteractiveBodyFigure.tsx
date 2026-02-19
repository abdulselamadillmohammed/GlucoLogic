import { useState } from "react";
import bodySilhouetteSvg from "../diagrams/svg/body_silhouette.svg";

type OrganKey = "heart" | "kidney" | "eye" | "nerves" | "brain";

interface InteractiveBodyFigureProps {
  risks: Record<OrganKey, number>;
  activeOrgan: string;
  onSelectOrgan: (organ: OrganKey) => void;
}

type Hotspot = {
  key: OrganKey;
  label: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
};

const HOTSPOTS: Hotspot[] = [
  { key: "brain", label: "Brain", x: 50, y: 10, labelX: 62, labelY: 8 },
  { key: "eye", label: "Eye", x: 54, y: 17, labelX: 65, labelY: 16 },
  { key: "heart", label: "Heart", x: 46, y: 33, labelX: 26, labelY: 33 },
  { key: "kidney", label: "Kidney", x: 54, y: 48, labelX: 65, labelY: 49 },
  { key: "nerves", label: "Nerves", x: 48, y: 75, labelX: 24, labelY: 75 }
];

function tone(value: number) {
  if (value < 0.35) return { fill: "#10B981", glow: "rgba(16,185,129,0.35)" };
  if (value < 0.65) return { fill: "#F59E0B", glow: "rgba(245,158,11,0.38)" };
  return { fill: "#FF7A70", glow: "rgba(255,122,112,0.42)" };
}

export function InteractiveBodyFigure({ risks, activeOrgan, onSelectOrgan }: InteractiveBodyFigureProps) {
  const [hovered, setHovered] = useState<OrganKey | null>(null);

  return (
    <div className="glass-panel p-4">
      <p className="mb-2 text-xs uppercase tracking-widest text-[#64748B]">Systemic Effects Body Map</p>
      <div className="body-figure-wrap">
        <img src={bodySilhouetteSvg} alt="Simplified human body silhouette" className="body-figure-silhouette" />
        {HOTSPOTS.map((hotspot) => {
          const t = tone(risks[hotspot.key]);
          const isActive = activeOrgan === hotspot.key;
          const isHovered = hovered === hotspot.key;
          return (
            <div key={hotspot.key} className="body-hotspot-group" style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}>
              <button
                type="button"
                className={`body-hotspot focus-ring ${isActive ? "active" : ""}`}
                onMouseEnter={() => setHovered(hotspot.key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelectOrgan(hotspot.key)}
                aria-label={`${hotspot.label} hotspot`}
                style={{ ["--hotspot-color" as string]: t.fill, ["--hotspot-glow" as string]: t.glow }}
              />
              <span
                className={`body-hotspot-label ${isActive || isHovered ? "highlight" : ""}`}
                style={{ left: `${hotspot.labelX - hotspot.x}%`, top: `${hotspot.labelY - hotspot.y}%` }}
              >
                {hotspot.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="body-risk-legend">
        <span className="legend-dot" style={{ background: "#10B981" }} />
        <span>Low</span>
        <span className="legend-dot" style={{ background: "#F59E0B" }} />
        <span>Moderate</span>
        <span className="legend-dot" style={{ background: "#FF7A70" }} />
        <span>High</span>
      </div>
      <p className="mt-2 text-xs text-[#64748B]">Hover to inspect risk zones. Click an organ to open a focused mini-diagram and explanation.</p>
    </div>
  );
}
