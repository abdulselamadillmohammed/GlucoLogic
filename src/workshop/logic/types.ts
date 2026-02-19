export type Effect = "positive" | "neutral" | "negative" | "not_stated";

export type Subfactor =
  | "glycemia"
  | "safety_tolerability"
  | "cardiorenal"
  | "weight"
  | "hypoglycemia"
  | "access_cost";

export interface SourceRef {
  sourceId: string;
}

export interface SourceIndexEntry {
  sourceId: string;
  pdf: string;
  page: number;
  where: string;
}

export interface ClassEffectEntry {
  effect: Effect;
  evidence: SourceRef[];
}

export interface DrugEffectEntry {
  effect: Effect;
  sources: SourceRef[];
}

export interface ClassSummary {
  glycemia: ClassEffectEntry;
  weight: ClassEffectEntry;
  hypoglycemia: ClassEffectEntry;
  cardiorenal: ClassEffectEntry;
  safety_tolerability: ClassEffectEntry;
  access_cost: ClassEffectEntry;
}

export interface TextFact {
  text: string;
  sources: SourceRef[];
}

export interface DrugEntry {
  drugId: string;
  genericName: string;
  route: string;
  keyNotes: TextFact[];
  effects: Record<Subfactor, DrugEffectEntry>;
  adverseEffects: TextFact[];
  cautions: TextFact[];
}

export interface DrugClass {
  classId: string;
  className: string;
  classSummary: ClassSummary;
  drugs: DrugEntry[];
}

export interface DrugsDataset {
  classes: DrugClass[];
  sourcesIndex: SourceIndexEntry[];
}

export interface CasePrompt {
  chief: string;
  summaryBullets: string[];
  vitalsLabs: {
    a1c: string;
    egfr: string;
    bmi: string;
    bp: string;
    lipids: string;
  };
}

export interface CaseEntry {
  caseId: string;
  title: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  prompt: CasePrompt;
  fullHistory: {
    history: string[];
    meds: string[];
    comorbidities: string[];
    constraints: string[];
  };
  learningTargets: Array<{
    subfactor: Subfactor;
    goal: string;
    sources: SourceRef[];
  }>;
  allowedDrugClassIds: string[];
  sources: SourceRef[];
}

export interface CasesDataset {
  cases: CaseEntry[];
}

export interface BubbleState {
  subfactor: Subfactor;
  effect: Effect;
}
