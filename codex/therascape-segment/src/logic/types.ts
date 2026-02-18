export const DOMAIN_ORDER = [
  "cardiovascularRisk",
  "renalFunction",
  "weightBmi",
  "hypoglycemiaRisk",
  "costAccess",
  "a1cGap"
] as const;

export type DomainKey = (typeof DOMAIN_ORDER)[number];

export type DomainEffects = Record<DomainKey, number>;

export const DOMAIN_LABELS: Record<DomainKey, string> = {
  cardiovascularRisk: "Cardiovascular Risk",
  renalFunction: "Renal Function",
  weightBmi: "Weight/BMI",
  hypoglycemiaRisk: "Hypoglycemia Risk",
  costAccess: "Cost/Access",
  a1cGap: "A1C Gap"
};

export type RiskLevel = "low" | "medium" | "high";

export type PatientProfile = {
  a1c: number;
  comorbidities: string[];
  egfr: number;
  hf: boolean;
  ascvd: boolean;
  bmi: number;
  hypoglycemiaRisk: RiskLevel;
  costSensitivity: RiskLevel;
};

export type CaseStep = {
  title: string;
  content: string;
};

export type CaseData = {
  caseId: string;
  title: string;
  steps: CaseStep[];
  patient: PatientProfile;
  reasoningNodeOptions: string[];
  expectedReasoningNodes: string[];
  recommendedMeds: string[];
  exclusions?: string[];
};

export type DrugData = {
  drugId: string;
  name: string;
  class: string;
  effects: DomainEffects;
  notes: string;
};

export type NodeComparison = {
  matchedNodes: string[];
  missingNodes: string[];
  extraNodes: string[];
};

export type ScoreResult = {
  nodeScore: number;
  medScore: number;
  totalScore: number;
};

export type FeedbackResult = NodeComparison &
  ScoreResult & {
    confidence: number;
    calibration: string;
    selectedMeds: string[];
    recommendedMeds: string[];
  };
