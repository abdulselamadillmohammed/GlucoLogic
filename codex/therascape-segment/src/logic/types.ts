export type StatusColor = "neutral" | "green" | "yellow" | "red";
export type Rating = "avoid" | "caution" | "neutral" | "benefit" | "strong_benefit";

export type ExplainTemplate = {
  title: string;
  whyItMatters: string;
  suggestionPrompt: string;
  hints: string[];
};

export type SubfactorConfig = {
  subfactorId: string;
  label: string;
  explainTemplate: ExplainTemplate;
};

export type GroupConfig = {
  groupId: string;
  label: string;
  icon: string;
  subfactors: SubfactorConfig[];
};

export type DrugOption = {
  drugId: string;
  label: string;
};

export type DrugClass = {
  classId: string;
  label: string;
  drugs: DrugOption[];
};

export type Profile = Record<string, Rating>;

export type TriggerPatientRule = {
  egfrLt?: number;
  recurrentGenitalInfections?: boolean;
  gastroparesis?: boolean;
  heartFailure?: boolean;
};

export type ImpactFlag = {
  id: string;
  trigger: { patient: TriggerPatientRule };
  severity: StatusColor;
  subfactorId: string;
  message: string;
  teachingNote: string;
};

export type ClassProfile = {
  classId: string;
  profile: Profile;
  flags?: ImpactFlag[];
};

export type FullHistory = {
  labs: string[];
  comorbidities: string[];
  constraints: string[];
  priorMeds: string[];
  contraindications: string[];
};

export type Patient = {
  a1c: number;
  targetA1c: number;
  symptomaticHyperglycemia?: boolean;
  ascvd: boolean;
  heartFailure: boolean;
  ckdStage: number;
  egfr: number;
  bmi: number;
  hypoglycemiaHighRisk: boolean;
  costSensitive: boolean;
  gastroparesis: boolean;
  recurrentGenitalInfections: boolean;
  fullHistory: FullHistory;
};

export type CaseEntry = {
  caseId: string;
  title: string;
  patient: Patient;
  expected: {
    drivers: string[];
    subfactors: string[];
  };
};

export type TheraScapeConfig = {
  meta: {
    appModule: string;
    version: string;
    sourceNotes: Array<{ id: string; summary: string; citations: string[] }>;
  };
  uiTaxonomy: {
    groups: GroupConfig[];
  };
  drugLibrary: {
    classes: DrugClass[];
  };
  impactGrid: {
    parameters: string[];
    ratings: Rating[];
    classProfiles: ClassProfile[];
  };
  cases: CaseEntry[];
};

export type GroupStatus = {
  groupId: string;
  status: StatusColor;
};

export type SubfactorStatus = {
  subfactorId: string;
  label: string;
  status: StatusColor;
};

export type ExplanationData = {
  title: string;
  whyItMatters: string;
  suggestionPrompt: string;
  hints: string[];
  note?: string;
};

export type ReasoningScore = {
  groupScore: number;
  subfactorScore: number;
  totalScore: number;
  missingGroups: string[];
  missingSubfactors: string[];
  extraGroups: string[];
  extraSubfactors: string[];
};
