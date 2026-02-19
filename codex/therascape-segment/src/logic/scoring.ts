import type { ReasoningScore } from "./types";

function percentage(matches: number, expectedTotal: number): number {
  if (expectedTotal === 0) return 100;
  return Math.round((matches / expectedTotal) * 100);
}

export function computeReasoningScore(
  selectedGroups: string[],
  selectedSubfactors: string[],
  expectedGroups: string[],
  expectedSubfactors: string[]
): ReasoningScore {
  const uniqueSelectedGroups = Array.from(new Set(selectedGroups));
  const uniqueSelectedSubfactors = Array.from(new Set(selectedSubfactors));

  const groupMatches = uniqueSelectedGroups.filter((group) => expectedGroups.includes(group)).length;
  const subfactorMatches = uniqueSelectedSubfactors.filter((subfactor) => expectedSubfactors.includes(subfactor)).length;

  const missingGroups = expectedGroups.filter((group) => !uniqueSelectedGroups.includes(group));
  const extraGroups = uniqueSelectedGroups.filter((group) => !expectedGroups.includes(group));
  const missingSubfactors = expectedSubfactors.filter((subfactor) => !uniqueSelectedSubfactors.includes(subfactor));
  const extraSubfactors = uniqueSelectedSubfactors.filter((subfactor) => !expectedSubfactors.includes(subfactor));

  const groupScore = percentage(groupMatches, expectedGroups.length);
  const subfactorScore = percentage(subfactorMatches, expectedSubfactors.length);
  const totalScore = Math.round(groupScore * 0.5 + subfactorScore * 0.5);

  return {
    groupScore,
    subfactorScore,
    totalScore,
    missingGroups,
    extraGroups,
    missingSubfactors,
    extraSubfactors
  };
}
