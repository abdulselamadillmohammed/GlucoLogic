import evidencePack from "./evidencePack.t2d.json";

type ThresholdDirection = "higherIsWorse" | "lowerIsWorse";

export type SectionKey = "normal" | "resistance" | "beta" | "complications";

type ThresholdConfig = {
  label: string;
  unit: string;
  direction: ThresholdDirection;
  warn: number;
  bad: number;
};

type EvidencePack = {
  sliders: {
    carbs_g: {
      label: string;
      min: number;
      max: number;
      step: number;
      mapping_notes: string;
    };
    activity_min: {
      label: string;
      min: number;
      max: number;
      step: number;
      mapping_notes: string;
    };
  };
  model_constants: {
    baseline_glucose_mgdl_default: number;
    time_window_hours: number;
    time_step_hours: number;
    plausible_ranges: {
      glucose_mgdl: { min: number; max: number };
      insulin_arb: { min: number; max: number };
      risk_score: { min: number; max: number };
    };
    normalization_factors: {
      carbs_divisor_g: number;
      activity_divisor_min: number;
    };
  };
  thresholds: {
    glucose: ThresholdConfig & {
      bands: {
        fasting_warn: number;
        fasting_bad: number;
        post_meal_warn: number;
        post_meal_bad: number;
      };
    };
    insulin_level: ThresholdConfig;
    insulin_effectiveness: ThresholdConfig;
    hepatic_output: ThresholdConfig;
    peripheral_uptake: ThresholdConfig;
    risk_score: ThresholdConfig & {
      ranges: {
        low_max: number;
        moderate_max: number;
        high_max: number;
      };
    };
    insulin_sensitivity: ThresholdConfig;
    beta_cell_function: ThresholdConfig;
    inflammation: ThresholdConfig;
    insulin_response: {
      strong_min: number;
      moderate_min: number;
    };
  };
  definitions: {
    insulin_sensitivity: { text: string };
    beta_cell_function: { text: string };
    hepatic_glucose_output: { text: string };
    peripheral_uptake: { text: string };
  };
  explanations: {
    what_this_graph_shows: Record<SectionKey, string>;
    why_glucose_changed_template: { text: string };
  };
};

export const evidence = evidencePack as EvidencePack;

export function template(text: string, map: Record<string, string | number>) {
  return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_m, key) => String(map[key] ?? ""));
}
