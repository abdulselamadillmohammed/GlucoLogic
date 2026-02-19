interface InteractiveBodyMapProps {
  risks: {
    heart: number;
    kidney: number;
    eye: number;
    nerves: number;
    brain: number;
  };
  activeOrgan: string;
  onSelectOrgan: (organ: "heart" | "kidney" | "eye" | "nerves" | "brain") => void;
}

const ORGANS = [
  { key: "brain", label: "Brain", x: 92, y: 24 },
  { key: "eye", label: "Eye", x: 133, y: 46 },
  { key: "heart", label: "Heart", x: 88, y: 96 },
  { key: "kidney", label: "Kidney", x: 118, y: 130 },
  { key: "nerves", label: "Nerves", x: 66, y: 164 }
] as const;

function organTone(value: number) {
  if (value < 0.35) return "#10B981";
  if (value < 0.65) return "#F59E0B";
  return "#EF4444";
}

export function InteractiveBodyMap({ risks, activeOrgan, onSelectOrgan }: InteractiveBodyMapProps) {
  return (
    <div className="glass-panel p-4">
      <p className="mb-2 text-xs uppercase tracking-widest text-[#64748B]">Systemic Effects Map</p>
      <svg viewBox="0 0 210 220" className="mx-auto w-full max-w-[250px]">
        <rect x="70" y="34" width="70" height="152" rx="35" fill="rgba(220,236,249,0.85)" stroke="#bdd3e7" />
        {ORGANS.map((organ) => {
          const value = risks[organ.key];
          return (
            <g key={organ.key}>
              <circle
                cx={organ.x}
                cy={organ.y}
                r={activeOrgan === organ.key ? 13 : 10}
                fill={organTone(value)}
                opacity="0.92"
                style={{ cursor: "pointer" }}
                onClick={() => onSelectOrgan(organ.key)}
              />
              <text x={organ.x + 14} y={organ.y + 4} fontSize="9" fill="#1f3a56">
                {organ.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-[#64748B]">Click an organ to open a focused mini-diagram and explanation.</p>
    </div>
  );
}
