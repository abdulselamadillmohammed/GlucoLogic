export interface SourceRef {
  pdf_file: string;
  page_number: number | null;
  table_or_section: string;
}

export interface DrugEntry {
  genericName: string;
  route: string;
  keyEffects: {
    mace: string;
    hf: string;
    ckd: string;
  };
  adverseEffects: string[];
  dosingNotes: string[];
  contraCautions: string[];
  sources: SourceRef[];
}

export interface DrugClassEntry {
  classId: string;
  className: string;
  classSummary: {
    glucoseLoweringEfficacy: string;
    hypoglycemiaRisk: string;
    weightEffect: string;
    cvEffects: string;
    kidneyEffects: string;
    mashEffects: string;
    keyConsiderations: string[];
  };
  classSummarySources: SourceRef[];
  drugs: DrugEntry[];
}

export interface DrugsDataset {
  generatedAt: string;
  note: string;
  classes: DrugClassEntry[];
}

export type ConfidenceLevel = "Low" | "Med" | "High";

export const NOT_STATED = "Not stated in dataset";
