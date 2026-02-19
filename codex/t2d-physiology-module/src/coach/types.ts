export type CoachMode = "explain" | "socratic" | "challenge";
export type CoachAction = "respond" | "hint";

export interface CoachContext {
  currentSectionId: string;
  currentOrganId?: string | null;
  sliders: {
    meal_size: number;
    activity: number;
    insulin_sensitivity: number;
    beta_cell_function: number;
    inflammation: number;
    chronic_exposure: number;
  };
  outputs: {
    glucose_level: number;
    insulin_level: number;
    hepatic_output: number;
    peripheral_uptake: number;
    risk_scores: {
      heart: number;
      kidney: number;
      eye: number;
      nerves: number;
      brain: number;
    };
  };
  lastAction?: string;
}

export interface KnowledgeConcept {
  id: string;
  title: string;
  tags: string[];
  sectionIds: string[];
  organIds?: string[];
  shortExplanation: string;
  misconceptions: string[];
  hints: string[];
  challenges: string[];
  glossaryDefinition?: string;
}

export interface KnowledgeRules {
  scopeTagsAllowed: string[];
  outOfScopePatterns: string[];
  refusalMessage: string;
}

export interface KnowledgeBase {
  concepts: KnowledgeConcept[];
  rules: KnowledgeRules;
}

export interface RetrievalResult {
  concept: KnowledgeConcept;
  score: number;
  overlapScore: number;
  sectionBoost: number;
  organBoost: number;
  actionBoost: number;
  confidence: number;
}

export interface CoachState {
  hintIndexByConcept: Record<string, number>;
}

export interface CoachAnswer {
  text: string;
  conceptIds: string[];
  refused: boolean;
  lowConfidence?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "coach";
  text: string;
  mode?: CoachMode;
}
