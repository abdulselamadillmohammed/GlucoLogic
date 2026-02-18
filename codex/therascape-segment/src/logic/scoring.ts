import type { ReasoningScore } from "./types";

function compareSelections(selected: string[], expected: string[]) {
  const selectedSet = new Set(selected);
  const expectedSet = new Set(expected);

  const matched = selected.filter((item) => expectedSet.has(item));
  const missing = expected.filter((item) => !selectedSet.has(item));
  const extra = selected.filter((item) => !expectedSet.has(item));

  return { matched, missing, extra };
}

function toPercent(hit: number, expectedCount: number) {
  if (expectedCount === 0) {
    return 0;
  }
  return Math.round((hit / expectedCount) * 100);
}

export function computeReasoningScore(
  selectedGroups: string[],
  selectedSubfactors: string[],
  expectedGroups: string[],
  expectedSubfactors: string[]
): ReasoningScore {
  const groupComparison = compareSelections(selectedGroups, expectedGroups);
  const subfactorComparison = compareSelections(selectedSubfactors, expectedSubfactors);

  const groupScore = toPercent(groupComparison.matched.length, expectedGroups.length);
  const subfactorScore = toPercent(subfactorComparison.matched.length, expectedSubfactors.length);

  return {
    groupScore,
    subfactorScore,
    totalScore: Math.round(groupScore * 0.55 + subfactorScore * 0.45),
    missingGroups: groupComparison.missing,
    missingSubfactors: subfactorComparison.missing,
    extraGroups: groupComparison.extra,
    extraSubfactors: subfactorComparison.extra
  };
}
