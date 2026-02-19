import { evidence } from "../data/evidence";

export interface SimulationInputs {
  /**
   * UI value in grams of carbohydrate.
   * Kept as meal_size key to avoid broad cross-module breaking changes.
   */
  meal_size: number;
  /**
   * UI value in minutes of moderate activity.
   * Kept as activity key to avoid broad cross-module breaking changes.
   */
  activity: number;
  insulin_sensitivity: number;
  beta_cell_function: number;
  inflammation: number;
}

export interface RiskScores {
  heart: number;
  kidney: number;
  eye: number;
  nerves: number;
  brain: number;
}

export interface SimulationOutputs {
  glucose_level: number;
  insulin_level: number;
  hepatic_output: number;
  peripheral_uptake: number;
  insulin_effectiveness: number;
  fasting_glucose: number;
  postprandial_glucose: number;
  risk_scores: RiskScores;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const roundTo = (value: number, digits = 2) => Number(value.toFixed(digits));

function normalizeInputs(inputs: SimulationInputs) {
  const carbs = clamp(inputs.meal_size, evidence.sliders.carbs_g.min, evidence.sliders.carbs_g.max);
  const activityMin = clamp(inputs.activity, evidence.sliders.activity_min.min, evidence.sliders.activity_min.max);

  return {
    carbs,
    activityMin,
    carbLoad: carbs / evidence.model_constants.normalization_factors.carbs_divisor_g,
    activitySupport: activityMin / evidence.model_constants.normalization_factors.activity_divisor_min,
    sensitivity: clamp(inputs.insulin_sensitivity, 0, 1),
    beta: clamp(inputs.beta_cell_function, 0, 1),
    inflammation: clamp(inputs.inflammation, 0, 1)
  };
}

/**
 * Deterministic educational model with smooth monotonic response:
 * - carbs increase post-meal glucose excursion
 * - activity and sensitivity increase uptake
 * - lower beta-cell function weakens insulin response and slows recovery
 * This is not a clinical prediction model.
 */
export function simulateT2D(inputs: SimulationInputs): SimulationOutputs {
  const n = normalizeInputs(inputs);
  const insulin_effectiveness = clamp(
    0.24 + n.sensitivity * 0.56 + n.activitySupport * 0.22 - n.inflammation * 0.2,
    0,
    1
  );
  const hepatic_output = clamp(0.3 + n.inflammation * 0.34 + (1 - insulin_effectiveness) * 0.38, 0.1, 1);
  const peripheral_uptake = clamp(0.18 + n.activitySupport * 0.34 + insulin_effectiveness * 0.46, 0.1, 1);

  const fasting_glucose = clamp(
    evidence.model_constants.baseline_glucose_mgdl_default + hepatic_output * 58 + (1 - insulin_effectiveness) * 24,
    evidence.model_constants.plausible_ranges.glucose_mgdl.min,
    evidence.model_constants.plausible_ranges.glucose_mgdl.max
  );

  const insulin_level = clamp(0.18 + n.beta * 0.75 + n.carbLoad * 0.33 - n.inflammation * 0.12, 0, 1.6);
  const mealExcursion = n.carbLoad * (82 - n.activitySupport * 14);
  const betaPenalty = (1 - n.beta) * 26;
  const postprandial_glucose = clamp(
    fasting_glucose + mealExcursion + betaPenalty - peripheral_uptake * 14,
    evidence.model_constants.plausible_ranges.glucose_mgdl.min,
    evidence.model_constants.plausible_ranges.glucose_mgdl.max
  );
  const glucose_level = roundTo((fasting_glucose * 0.45 + postprandial_glucose * 0.55), 0);

  const chronicLoad = clamp((glucose_level - 95) / 140, 0, 1);
  const riskBase = chronicLoad * 0.65 + n.inflammation * 0.25 + (1 - insulin_effectiveness) * 0.15;

  return {
    glucose_level: Number(glucose_level),
    insulin_level: roundTo(insulin_level, 2),
    hepatic_output: roundTo(hepatic_output, 2),
    peripheral_uptake: roundTo(peripheral_uptake, 2),
    insulin_effectiveness: roundTo(insulin_effectiveness, 2),
    fasting_glucose: roundTo(fasting_glucose, 0),
    postprandial_glucose: roundTo(postprandial_glucose, 0),
    risk_scores: {
      heart: roundTo(clamp(riskBase + 0.06, 0, 1), 2),
      kidney: roundTo(clamp(riskBase + 0.1 + hepatic_output * 0.08, 0, 1), 2),
      eye: roundTo(clamp(riskBase + 0.07, 0, 1), 2),
      nerves: roundTo(clamp(riskBase + 0.09, 0, 1), 2),
      brain: roundTo(clamp(riskBase + 0.04, 0, 1), 2)
    }
  };
}

export interface TrendPoint {
  t: number;
  glucose: number;
  insulin: number;
}

export function buildTrend(inputs: SimulationInputs, hours = evidence.model_constants.time_window_hours): TrendPoint[] {
  const base = simulateT2D(inputs);
  const n = normalizeInputs(inputs);
  const points: TrendPoint[] = [];
  const dt = evidence.model_constants.time_step_hours;
  const totalSteps = Math.floor(hours / dt);
  const glucoseMin = evidence.model_constants.plausible_ranges.glucose_mgdl.min;
  const glucoseMax = evidence.model_constants.plausible_ranges.glucose_mgdl.max;
  const insulinMin = evidence.model_constants.plausible_ranges.insulin_arb.min;
  const insulinMax = evidence.model_constants.plausible_ranges.insulin_arb.max;

  for (let step = 0; step <= totalSteps; step += 1) {
    const h = roundTo(step * dt, 2);
    const mealPulse = Math.exp(-Math.pow((h - 1.3) / 0.95, 2));
    const glucoseDecay = Math.exp(-h / (2.9 + (1 - n.sensitivity) * 1.3 + (1 - n.beta) * 1.2));
    const insulinDecay = Math.exp(-h / 2.2);
    const glucoseDelta = Math.max(0, base.postprandial_glucose - base.fasting_glucose);

    const glucose = base.fasting_glucose + glucoseDelta * mealPulse * 0.84 + glucoseDelta * glucoseDecay * 0.16;
    const insulin =
      base.insulin_level * 36 * insulinDecay +
      n.carbLoad * 24 * mealPulse +
      n.beta * 20 * Math.exp(-Math.pow((h - 1.1) / 1.05, 2));

    points.push({
      t: h,
      glucose: roundTo(clamp(glucose, glucoseMin, glucoseMax), 0),
      insulin: roundTo(clamp(insulin, insulinMin, insulinMax), 0)
    });
  }

  return points;
}
