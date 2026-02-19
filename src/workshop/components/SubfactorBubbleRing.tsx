import { effectToFill } from "../logic/effects";
import { SUBFACTOR_LABELS } from "../logic/subfactors";
import type { Effect, Subfactor } from "../logic/types";

interface Props {
  effects: Record<Subfactor, Effect>;
  selectedSubfactor: Subfactor | null;
  onSelectSubfactor: (subfactor: Subfactor) => void;
}

const positions: Record<Subfactor, string> = {
  glycemia: "bubble-top",
  safety_tolerability: "bubble-left",
  cardiorenal: "bubble-right",
  weight: "bubble-bottom-right",
  hypoglycemia: "bubble-bottom",
  access_cost: "bubble-bottom-left"
};

export function SubfactorBubbleRing({ effects, selectedSubfactor, onSelectSubfactor }: Props) {
  return (
    <div className="bubble-ring">
      {(Object.keys(SUBFACTOR_LABELS) as Subfactor[]).map((subfactor) => {
        const fill = effectToFill(effects[subfactor]);
        const selected = selectedSubfactor === subfactor;
        return (
          <button
            key={subfactor}
            type="button"
            className={`bubble ${positions[subfactor]} ${selected ? "selected" : ""} ${fill.pulse ? "pulse-outline" : ""}`}
            title={effects[subfactor] === "not_stated" ? "Not stated in dataset" : undefined}
            onClick={() => onSelectSubfactor(subfactor)}
          >
            <span
              className="bubble-fill"
              style={{
                background: fill.color,
                height: `${fill.level}%`
              }}
            />
            <span className="bubble-label">{SUBFACTOR_LABELS[subfactor]}</span>
          </button>
        );
      })}
      <p className="ring-hint">Click a badge to drill down and toggle it for scoring.</p>
    </div>
  );
}
