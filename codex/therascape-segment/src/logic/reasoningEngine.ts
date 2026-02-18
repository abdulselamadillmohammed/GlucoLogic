import type {
  ClassProfile,
  ExplanationData,
  GroupStatus,
  Patient,
  StatusColor,
  SubfactorStatus,
  TheraScapeConfig
} from "./types";

const ratingWeight: Record<string, number> = {
  avoid: 2,
  caution: 1,
  neutral: 0,
  benefit: -1,
  strong_benefit: -2
};

const groupParameterMap: Record<string, string[]> = {
  glycemia: ["glucose_efficacy"],
  cardiorenal: ["ascvd_mace", "hf_chf", "stroke", "ckd"],
  weight: ["weight", "nafld_mash"],
  hypoglycemia: ["hypoglycemia"],
  access: ["access_cost"],
  safety: ["renal_adjustment", "gi_adverse", "other_considerations"]
};

const subfactorParameterMap: Record<string, string[]> = {
  a1c_gap: ["glucose_efficacy"],
  symptomatic_hyperglycemia: ["glucose_efficacy"],
  ascvd: ["ascvd_mace", "stroke"],
  hf: ["hf_chf", "fluid_status"],
  ckd: ["ckd"],
  weight_loss_goal: ["weight", "nafld_mash"],
  hypo_risk: ["hypoglycemia"],
  affordability: ["access_cost"],
  renal_adjustment: ["renal_adjustment"],
  gi_tolerability: ["gi_adverse"],
  infection_risk: ["other_considerations"],
  fluid_status: ["hf_chf", "other_considerations"]
};

function toStatus(score: number): StatusColor {
  if (score <= -1) {
    return "green";
  }
  if (score >= 1) {
    return "red";
  }
  return "yellow";
}

function getClassProfile(config: TheraScapeConfig, selectedClassId: string | null): ClassProfile | null {
  if (!selectedClassId) {
    return null;
  }
  return config.impactGrid.classProfiles.find((profile) => profile.classId === selectedClassId) ?? null;
}

function scorePatientBaseline(patient: Patient, groupId: string): number {
  switch (groupId) {
    case "glycemia":
      return patient.a1c - patient.targetA1c >= 1.5 || patient.symptomaticHyperglycemia ? 1 : 0;
    case "cardiorenal":
      return patient.ascvd || patient.heartFailure || patient.ckdStage >= 3 ? 1 : 0;
    case "weight":
      return patient.bmi >= 30 ? 1 : 0;
    case "hypoglycemia":
      return patient.hypoglycemiaHighRisk ? 1 : 0;
    case "access":
      return patient.costSensitive ? 1 : 0;
    case "safety":
      return patient.egfr < 45 || patient.gastroparesis || patient.recurrentGenitalInfections ? 1 : 0;
    default:
      return 0;
  }
}

function computeImpactScore(parameters: string[], profile: ClassProfile | null): number {
  if (!profile) {
    return 0;
  }

  return parameters.reduce((sum, key) => {
    const rating = profile.profile[key] ?? "neutral";
    return sum + (ratingWeight[rating] ?? 0);
  }, 0);
}

function applyFlagScore(
  patient: Patient,
  profile: ClassProfile | null,
  targetSubfactorId: string
): number {
  if (!profile?.flags?.length) {
    return 0;
  }

  return profile.flags.reduce((sum, flag) => {
    if (flag.subfactorId !== targetSubfactorId) {
      return sum;
    }

    const trigger = flag.trigger.patient;
    const isMatch =
      (trigger.egfrLt !== undefined ? patient.egfr < trigger.egfrLt : true) &&
      (trigger.recurrentGenitalInfections !== undefined
        ? patient.recurrentGenitalInfections === trigger.recurrentGenitalInfections
        : true) &&
      (trigger.gastroparesis !== undefined
        ? patient.gastroparesis === trigger.gastroparesis
        : true) &&
      (trigger.heartFailure !== undefined
        ? patient.heartFailure === trigger.heartFailure
        : true);

    if (!isMatch) {
      return sum;
    }

    if (flag.severity === "red") {
      return sum + 2;
    }
    if (flag.severity === "yellow") {
      return sum + 1;
    }
    return sum - 1;
  }, 0);
}

export function computeGroupStatuses(
  config: TheraScapeConfig,
  patient: Patient,
  selectedClassId: string | null
): GroupStatus[] {
  const profile = getClassProfile(config, selectedClassId);

  return config.uiTaxonomy.groups.map((group) => {
    const baseline = scorePatientBaseline(patient, group.groupId);
    const impact = computeImpactScore(groupParameterMap[group.groupId] ?? [], profile);
    return {
      groupId: group.groupId,
      status: toStatus(baseline + impact)
    };
  });
}

export function computeSubfactorStatuses(
  config: TheraScapeConfig,
  patient: Patient,
  selectedClassId: string | null,
  groupId: string
): SubfactorStatus[] {
  const profile = getClassProfile(config, selectedClassId);
  const group = config.uiTaxonomy.groups.find((item) => item.groupId === groupId);

  if (!group) {
    return [];
  }

  return group.subfactors.map((subfactor) => {
    const baseGroupScore = scorePatientBaseline(patient, groupId);
    const impact = computeImpactScore(subfactorParameterMap[subfactor.subfactorId] ?? [], profile);
    const flags = applyFlagScore(patient, profile, subfactor.subfactorId);

    return {
      subfactorId: subfactor.subfactorId,
      label: subfactor.label,
      status: toStatus(baseGroupScore + impact + flags)
    };
  });
}

export function getExplanation(
  config: TheraScapeConfig,
  subfactorId: string,
  selectedClassId: string | null,
  patient: Patient
): ExplanationData | null {
  for (const group of config.uiTaxonomy.groups) {
    const found = group.subfactors.find((subfactor) => subfactor.subfactorId === subfactorId);
    if (!found) {
      continue;
    }

    let note: string | undefined;
    const profile = getClassProfile(config, selectedClassId);

    if (profile?.flags?.length) {
      const matchedFlag = profile.flags.find((flag) => {
        if (flag.subfactorId !== subfactorId) {
          return false;
        }
        const trigger = flag.trigger.patient;
        return (
          (trigger.egfrLt !== undefined ? patient.egfr < trigger.egfrLt : true) &&
          (trigger.recurrentGenitalInfections !== undefined
            ? patient.recurrentGenitalInfections === trigger.recurrentGenitalInfections
            : true) &&
          (trigger.gastroparesis !== undefined
            ? patient.gastroparesis === trigger.gastroparesis
            : true) &&
          (trigger.heartFailure !== undefined
            ? patient.heartFailure === trigger.heartFailure
            : true)
        );
      });

      if (matchedFlag) {
        note = matchedFlag.message;
      }
    }

    return {
      ...found.explainTemplate,
      note
    };
  }

  return null;
}
