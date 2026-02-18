import { DOMAIN_ORDER } from "./types";
import type {
  DomainEffects,
  DomainKey,
  DrugData,
  NodeComparison,
  PatientProfile,
  ScoreResult
} from "./types";

export function derivePatientBaseline(patient: PatientProfile): DomainEffects {
  const cardio = patient.ascvd || patient.hf ? 2 : 1;
  const renal = patient.egfr < 60 ? 2 : 1;
  const weight = patient.bmi >= 30 ? 2 : 1;
  const hypo =
    patient.hypoglycemiaRisk === "high"
      ? 2
      : patient.hypoglycemiaRisk === "medium"
        ? 1
        : 0;
  const cost =
    patient.costSensitivity === "high"
      ? 2
      : patient.costSensitivity === "medium"
        ? 1
        : 0;
  const a1cGap = patient.a1c >= 9 ? 3 : patient.a1c >= 8 ? 2 : 1;

  return {
    cardiovascularRisk: cardio,
    renalFunction: renal,
    weightBmi: weight,
    hypoglycemiaRisk: hypo,
    costAccess: cost,
    a1cGap
  };
}

export function computeDomainIntensities(
  baseline: DomainEffects,
  selectedDrugs: DrugData[]
): DomainEffects {
  const result: DomainEffects = { ...baseline };

  for (const drug of selectedDrugs) {
    for (const key of DOMAIN_ORDER) {
      result[key] += drug.effects[key];
    }
  }

  return result;
}

export function clampEffects(effects: DomainEffects): DomainEffects {
  const clamped = {} as Record<DomainKey, number>;
  for (const key of DOMAIN_ORDER) {
    clamped[key] = Math.max(-6, Math.min(6, effects[key]));
  }
  return clamped as DomainEffects;
}

export function computeCaseScore(
  nodeComparison: NodeComparison,
  selectedMeds: string[],
  recommendedMeds: string[]
): ScoreResult {
  const expectedCount =
    nodeComparison.matchedNodes.length + nodeComparison.missingNodes.length;
  const nodeScore =
    expectedCount === 0
      ? 0
      : Math.round((nodeComparison.matchedNodes.length / expectedCount) * 100);

  const recommendedSet = new Set(recommendedMeds);
  const hitCount = selectedMeds.filter((med) => recommendedSet.has(med)).length;
  const medScore =
    recommendedMeds.length === 0
      ? 0
      : Math.round((hitCount / recommendedMeds.length) * 100);

  const totalScore = Math.round(nodeScore * 0.6 + medScore * 0.4);

  return {
    nodeScore,
    medScore,
    totalScore
  };
}
