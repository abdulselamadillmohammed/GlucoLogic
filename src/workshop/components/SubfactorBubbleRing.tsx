import { SUBFACTOR_LABELS } from "../logic/subfactors";
import type { ReactNode } from "react";
import type { Effect, Subfactor } from "../logic/types";
import { RingLayout } from "./RingLayout";
import { SubfactorBubble } from "./SubfactorBubble";

interface Props {
  effects: Record<Subfactor, Effect>;
  selectedSubfactor: Subfactor | null;
  animationTick: number;
  centerContent: ReactNode;
  onSelectSubfactor: (subfactor: Subfactor) => void;
  onOpenInfo: (subfactor: Subfactor) => void;
}

const ANGLES: Record<Subfactor, number> = {
  glycemia: -90,
  cardiorenal: -30,
  weight: 30,
  hypoglycemia: 90,
  access_cost: 150,
  safety_tolerability: -150
};

export function SubfactorBubbleRing({
  effects,
  selectedSubfactor,
  animationTick,
  centerContent,
  onSelectSubfactor,
  onOpenInfo
}: Props) {
  const items = (Object.keys(SUBFACTOR_LABELS) as Subfactor[]).map((subfactor) => ({
    id: subfactor,
    angle: ANGLES[subfactor],
    node: (
      <SubfactorBubble
        label={SUBFACTOR_LABELS[subfactor]}
        effect={effects[subfactor]}
        selected={selectedSubfactor === subfactor}
        animationKey={animationTick}
        onClick={() => {
          onSelectSubfactor(subfactor);
          onOpenInfo(subfactor);
        }}
      />
    )
  }));

  return (
    <>
      <RingLayout centerContent={centerContent} items={items} />
      <p className="ring-hint">Click a badge to drill down and toggle it for scoring.</p>
    </>
  );
}
