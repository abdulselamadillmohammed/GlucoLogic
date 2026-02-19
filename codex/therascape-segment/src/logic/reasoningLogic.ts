import { computeBubbleColors, scoreToStatus, type BubbleColorSet } from "./colorComputation";
import type { GroupStatus, SubfactorStatus } from "./types";

export interface BubbleNodeModel {
  id: string;
  label: string;
  status: "green" | "yellow" | "red";
  score: number;
  selected: boolean;
  colors: BubbleColorSet;
}

export function buildGroupBubbleMap(statuses: GroupStatus[], selectedGroupIds: string[]): BubbleNodeModel[] {
  return statuses.map((status) => {
    const selected = selectedGroupIds.includes(status.groupId);
    const resolvedStatus = status.status ?? scoreToStatus(status.score);

    return {
      id: status.groupId,
      label: status.label,
      status: resolvedStatus,
      score: status.score,
      selected,
      colors: computeBubbleColors(resolvedStatus, selected)
    };
  });
}

export function buildSubfactorBubbleMap(statuses: SubfactorStatus[], selectedSubfactorIds: string[]): BubbleNodeModel[] {
  return statuses.map((status) => {
    const selected = selectedSubfactorIds.includes(status.subfactorId);
    const resolvedStatus = status.status ?? scoreToStatus(status.score);

    return {
      id: status.subfactorId,
      label: status.label,
      status: resolvedStatus,
      score: status.score,
      selected,
      colors: computeBubbleColors(resolvedStatus, selected)
    };
  });
}

export function computeReasoningSpread(bubbles: BubbleNodeModel[]) {
  const total = Math.max(1, bubbles.length);
  const green = bubbles.filter((b) => b.status === "green").length;
  const yellow = bubbles.filter((b) => b.status === "yellow").length;
  const red = bubbles.filter((b) => b.status === "red").length;

  return {
    greenPct: Math.round((green / total) * 100),
    yellowPct: Math.round((yellow / total) * 100),
    redPct: Math.round((red / total) * 100)
  };
}
