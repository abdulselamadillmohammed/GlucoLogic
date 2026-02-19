export type StatusColor = "green" | "yellow" | "red";

export type GroupId =
  | "glycemia"
  | "cardiorenal"
  | "weight"
  | "hypoglycemia"
  | "access_cost"
  | "safety";

export interface PatientHistory {
  labs: string[];
  comorbidities: string[];
  constraints: string[];
  priorMeds: string[];
  contraindications: string[];
}

export interface PatientProfile {
  a1c: number;
  targetA1c: number;
  symptomaticHyperglycemia: boolean;
  ascvd: boolean;
  hf: boolean;
  ckdStage: number;
  egfr: number;
  bmi: number;
  nafld: boolean;
  hypoglycemiaRisk: "low" | "medium" | "high";
  costSensitivity: "low" | "medium" | "high";
  giIntolerance: boolean;
  infectionRisk: boolean;
  fluidVolumeRisk: boolean;
  history: PatientHistory;
}

export interface CaseStep {
  step: number;
  label: string;
  revealedFields: string[];
}

export interface CaseConfig {
  caseId: string;
  title: string;
  steps: CaseStep[];
  patient: PatientProfile;
  expected: {
    groups: GroupId[];
    subfactors: string[];
  };
}

export interface ExplanationBlock {
  summary: string[];
  prompt: string;
  whyThisMatters: string;
  hints: string[];
}

export interface SubfactorConfig {
  subfactorId: string;
  label: string;
  parameterKey:
    | "glucose_efficacy"
    | "ascvd_mace"
    | "hf_chf"
    | "stroke"
    | "ckd_benefit"
    | "renal_adjustment"
    | "hypoglycemia_risk"
    | "weight_effect"
    | "nafld_mash"
    | "gi_adverse"
    | "infection_risk"
    | "fluid_volume_risk"
    | "contraindications"
    | "access_cost";
  explanation: ExplanationBlock;
}

export interface GroupConfig {
  groupId: GroupId;
  label: string;
  subfactors: SubfactorConfig[];
}

export interface ImpactGrid {
  glucose_efficacy: number;
  ascvd_mace: number;
  hf_chf: number;
  stroke: number;
  ckd_benefit: number;
  renal_adjustment: number;
  hypoglycemia_risk: number;
  weight_effect: number;
  nafld_mash: number;
  gi_adverse: number;
  infection_risk: number;
  fluid_volume_risk: number;
  contraindications: number;
  access_cost: number;
}

export interface DrugConfig {
  drugId: string;
  label: string;
  notes: string;
  impactGrid: ImpactGrid;
}

export interface DrugClassConfig {
  classId: string;
  label: string;
  description: string;
  impactGrid: ImpactGrid;
  drugs: DrugConfig[];
}

export interface TheraScapeConfig {
  meta: {
    appModule: string;
    sourceNotes: string[];
  };
  reasoningGroups: GroupConfig[];
  drugLibrary: {
    classes: DrugClassConfig[];
  };
  cases: CaseConfig[];
}

export interface GroupStatus {
  groupId: GroupId;
  label: string;
  status: StatusColor;
  score: number;
}

export interface SubfactorStatus {
  subfactorId: string;
  label: string;
  status: StatusColor;
  score: number;
}

export interface ReasoningScore {
  groupScore: number;
  subfactorScore: number;
  totalScore: number;
  missingGroups: string[];
  extraGroups: string[];
  missingSubfactors: string[];
  extraSubfactors: string[];
}

export interface ReasoningFeedback {
  score: ReasoningScore;
  confidence: number;
  calibrationDelta: number;
  calibrationLabel: "underconfident" | "calibrated" | "overconfident";
}
