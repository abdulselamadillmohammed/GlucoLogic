import { effectToFill } from "../logic/effects";
import type { CSSProperties } from "react";
import type { Effect } from "../logic/types";

interface Props {
  label: string;
  effect: Effect;
  selected: boolean;
  animationKey: number;
  onClick: () => void;
}

export function SubfactorBubble({ label, effect, selected, animationKey, onClick }: Props) {
  const fill = effectToFill(effect);
  return (
    <button
      type="button"
      className={`bubble ${selected ? "selected" : ""} ${fill.pulse ? "pulse-outline" : ""}`}
      title={effect === "not_stated" ? "Not stated in dataset" : undefined}
      onClick={onClick}
    >
      <span
        key={animationKey}
        className="fillLayer"
        style={
          {
            "--fill-height": `${fill.level}%`,
            "--fill-color": fill.color
          } as CSSProperties
        }
      />
      <span className="bubble-label">{label}</span>
    </button>
  );
}
