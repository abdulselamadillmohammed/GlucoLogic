import { computeReasoningScore } from "./scoring";
import type { ReasoningFeedback } from "./types";

export function compareReasoning(
  selectedGroups: string[],
  selectedSubfactors: string[],
  expectedGroups: string[],
  expectedSubfactors: string[],
  confidence: number
): ReasoningFeedback {
  const score = computeReasoningScore(selectedGroups, selectedSubfactors, expectedGroups, expectedSubfactors);
  const calibrationDelta = Math.round(confidence - score.totalScore);

  const calibrationLabel: ReasoningFeedback["calibrationLabel"] =
    Math.abs(calibrationDelta) <= 10
      ? "calibrated"
      : calibrationDelta > 10
        ? "overconfident"
        : "underconfident";

  return {
    score,
    confidence,
    calibrationDelta,
    calibrationLabel
  };
}
