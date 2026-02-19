import type {
  GroupConfig,
  GroupStatus,
  PatientProfile,
  StatusColor,
  SubfactorConfig,
  SubfactorStatus,
  TheraScapeConfig
} from "./types";

const BASELINE_LEVEL = {
  low: 1,
  medium: 2,
  high: 3
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getDrugImpact(config: TheraScapeConfig, selectedDrugId?: string) {
  if (!selectedDrugId) {
    return null;
  }

  for (const drugClass of config.drugLibrary.classes) {
    const drug = drugClass.drugs.find((entry) => entry.drugId === selectedDrugId);
    if (drug) {
      return {
        classId: drugClass.classId,
        classLabel: drugClass.label,
        drugLabel: drug.label,
        impact: {
          ...drugClass.impactGrid,
          ...drug.impactGrid
        }
      };
    }
  }

  return null;
}

function baselineRisk(patient: PatientProfile, subfactorId: string): number {
  switch (subfactorId) {
    case "a1c_gap":
      return patient.a1c - patient.targetA1c >= 1.5 ? 3 : patient.a1c - patient.targetA1c >= 0.7 ? 2 : 1;
    case "symptomatic_hyperglycemia":
      return patient.symptomaticHyperglycemia ? 3 : 1;
    case "ascvd":
      return patient.ascvd ? 3 : 1;
    case "heart_failure":
      return patient.hf ? 3 : 1;
    case "ckd":
      return patient.ckdStage >= 3 ? 3 : 1;
    case "weight_bmi":
      return patient.bmi >= 35 ? 3 : patient.bmi >= 30 ? 2 : 1;
    case "nafld_mash":
      return patient.nafld ? 3 : 1;
    case "hypoglycemia_history":
      return BASELINE_LEVEL[patient.hypoglycemiaRisk];
    case "access_cost":
      return BASELINE_LEVEL[patient.costSensitivity];
    case "gi_intolerance":
      return patient.giIntolerance ? 3 : 1;
    case "infection_risk":
      return patient.infectionRisk ? 3 : 1;
    case "fluid_volume_risk":
      return patient.fluidVolumeRisk ? 3 : 1;
    case "contraindications":
      return patient.history.contraindications.length > 0 ? 3 : 1;
    case "renal_adjustment":
      return patient.egfr < 45 ? 3 : patient.egfr < 60 ? 2 : 1;
    default:
      return 1;
  }
}

function statusFromScore(score: number): StatusColor {
  if (score <= 1.4) return "green";
  if (score <= 2.2) return "yellow";
  return "red";
}

function computeSubfactorScore(
  patient: PatientProfile,
  subfactor: SubfactorConfig,
  impact: Record<string, number> | null
): number {
  const baseline = baselineRisk(patient, subfactor.subfactorId);
  const impactValue = impact?.[subfactor.parameterKey] ?? 0;

  return clamp(baseline - impactValue * 0.7, 0.5, 3);
}

export function computeSubfactorStatuses(
  config: TheraScapeConfig,
  patient: PatientProfile,
  selectedDrugId: string | undefined,
  groupId: string
): SubfactorStatus[] {
  const group = config.reasoningGroups.find((entry) => entry.groupId === groupId);
  if (!group) {
    return [];
  }

  const selected = getDrugImpact(config, selectedDrugId);

  return group.subfactors.map((subfactor) => {
    const score = computeSubfactorScore(patient, subfactor, selected?.impact ?? null);
    return {
      subfactorId: subfactor.subfactorId,
      label: subfactor.label,
      score,
      status: statusFromScore(score)
    };
  });
}

export function computeGroupStatuses(
  config: TheraScapeConfig,
  patient: PatientProfile,
  selectedDrugId?: string
): GroupStatus[] {
  return config.reasoningGroups.map((group) => {
    const subfactors = computeSubfactorStatuses(config, patient, selectedDrugId, group.groupId);
    const mean = subfactors.reduce((sum, current) => sum + current.score, 0) / Math.max(1, subfactors.length);

    return {
      groupId: group.groupId,
      label: group.label,
      status: statusFromScore(mean),
      score: mean
    };
  });
}

export function getExplanation(
  config: TheraScapeConfig,
  subfactorId: string,
  selectedDrugId?: string
) {
  for (const group of config.reasoningGroups) {
    const subfactor = group.subfactors.find((entry) => entry.subfactorId === subfactorId);
    if (subfactor) {
      const selected = getDrugImpact(config, selectedDrugId);
      const selectedLine = selected
        ? `Current selection: ${selected.drugLabel} from ${selected.classLabel}.`
        : "No medication is selected yet; reason from baseline risk first.";

      return {
        group: group.label,
        subfactor: subfactor.label,
        summary: [...subfactor.explanation.summary, selectedLine],
        prompt: subfactor.explanation.prompt,
        whyThisMatters: subfactor.explanation.whyThisMatters,
        hints: subfactor.explanation.hints
      };
    }
  }

  return null;
}

export function getGroup(config: TheraScapeConfig, groupId: string): GroupConfig | undefined {
  return config.reasoningGroups.find((entry) => entry.groupId === groupId);
}

export function getDrugForClass(config: TheraScapeConfig, classId: string) {
  return config.drugLibrary.classes.find((entry) => entry.classId === classId);
}
