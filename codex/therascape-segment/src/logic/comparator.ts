import { computeReasoningCompleteness, computeReasoningScore } from "./scoring";
import type { CalibrationLevel, ReasoningComparatorResult } from "./types";

type ComparatorInput = {
  selectedGroups: string[];
  selectedSubfactors: string[];
  expectedGroups: string[];
  expectedSubfactors: string[];
  confidence: number;
};

function getCalibrationLevel(gap: number): CalibrationLevel {
  if (Math.abs(gap) <= 10) {
    return "well-calibrated";
  }
  return gap > 0 ? "overconfident" : "underconfident";
}

export function compareReasoningSelection(input: ComparatorInput): ReasoningComparatorResult {
  const score = computeReasoningScore(
    input.selectedGroups,
    input.selectedSubfactors,
    input.expectedGroups,
    input.expectedSubfactors
  );

  const completeness = computeReasoningCompleteness(
    input.selectedGroups,
    input.selectedSubfactors,
    input.expectedGroups,
    input.expectedSubfactors
  );

  const calibrationGap = input.confidence - score.totalScore;
  const calibrationLevel = getCalibrationLevel(calibrationGap);

  const ruleTraces = [
    `Group match: ${score.groupScore}% using ${input.expectedGroups.length} expected drivers.`,
    `Subfactor match: ${score.subfactorScore}% using ${input.expectedSubfactors.length} expected subfactors.`,
    `Completeness reflects matched expected nodes only: ${completeness}%.`,
    `Calibration gap = confidence (${input.confidence}%) - correctness (${score.totalScore}%) = ${calibrationGap}%.`,
    `Calibration status: ${calibrationLevel.replace("-", " ")}.`
  ];

  return {
    score,
    completeness,
    confidence: input.confidence,
    calibrationGap,
    calibrationLevel,
    ruleTraces
  };
}
