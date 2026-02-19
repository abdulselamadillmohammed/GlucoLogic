import { evidence } from "../data/evidence";

export type StatusTone = "good" | "warn" | "bad";

type Direction = "higherIsWorse" | "lowerIsWorse";

interface ThresholdRule {
  key: string;
  label: string;
  direction: Direction;
  warn: number;
  bad: number;
  unit?: string;
}

export interface StatusContext {
  lastAction?: string;
  sliders?: {
    meal_size?: number;
    activity?: number;
    insulin_sensitivity?: number;
    beta_cell_function?: number;
    inflammation?: number;
    chronic_exposure?: number;
  };
}

export interface MetricStatusResult {
  status: StatusTone;
  ruleLabel: string;
  thresholdSummary: string;
  explanation: string;
}

export const STATUS_RULES: Record<
  | "glucose"
  | "fastingGlucose"
  | "postprandialGlucose"
  | "insulinLevel"
  | "insulinEffectiveness"
  | "hepaticOutput"
  | "peripheralUptake"
  | "riskScore"
  | "insulinSensitivity"
  | "betaCellFunction"
  | "inflammation",
  ThresholdRule
> = {
  glucose: {
    key: "glucose",
    label: evidence.thresholds.glucose.label,
    direction: evidence.thresholds.glucose.direction,
    warn: evidence.thresholds.glucose.warn,
    bad: evidence.thresholds.glucose.bad,
    unit: evidence.thresholds.glucose.unit
  },
  fastingGlucose: {
    key: "fastingGlucose",
    label: "Fasting glucose",
    direction: evidence.thresholds.glucose.direction,
    warn: evidence.thresholds.glucose.bands.fasting_warn,
    bad: evidence.thresholds.glucose.bands.fasting_bad,
    unit: evidence.thresholds.glucose.unit
  },
  postprandialGlucose: {
    key: "postprandialGlucose",
    label: "Post-meal glucose",
    direction: evidence.thresholds.glucose.direction,
    warn: evidence.thresholds.glucose.bands.post_meal_warn,
    bad: evidence.thresholds.glucose.bands.post_meal_bad,
    unit: evidence.thresholds.glucose.unit
  },
  insulinLevel: {
    key: "insulinLevel",
    label: evidence.thresholds.insulin_level.label,
    direction: evidence.thresholds.insulin_level.direction,
    warn: evidence.thresholds.insulin_level.warn,
    bad: evidence.thresholds.insulin_level.bad,
    unit: evidence.thresholds.insulin_level.unit
  },
  insulinEffectiveness: {
    key: "insulinEffectiveness",
    label: evidence.thresholds.insulin_effectiveness.label,
    direction: evidence.thresholds.insulin_effectiveness.direction,
    warn: evidence.thresholds.insulin_effectiveness.warn,
    bad: evidence.thresholds.insulin_effectiveness.bad,
    unit: evidence.thresholds.insulin_effectiveness.unit
  },
  hepaticOutput: {
    key: "hepaticOutput",
    label: evidence.thresholds.hepatic_output.label,
    direction: evidence.thresholds.hepatic_output.direction,
    warn: evidence.thresholds.hepatic_output.warn,
    bad: evidence.thresholds.hepatic_output.bad,
    unit: evidence.thresholds.hepatic_output.unit
  },
  peripheralUptake: {
    key: "peripheralUptake",
    label: evidence.thresholds.peripheral_uptake.label,
    direction: evidence.thresholds.peripheral_uptake.direction,
    warn: evidence.thresholds.peripheral_uptake.warn,
    bad: evidence.thresholds.peripheral_uptake.bad,
    unit: evidence.thresholds.peripheral_uptake.unit
  },
  riskScore: {
    key: "riskScore",
    label: evidence.thresholds.risk_score.label,
    direction: evidence.thresholds.risk_score.direction,
    warn: evidence.thresholds.risk_score.warn,
    bad: evidence.thresholds.risk_score.bad,
    unit: evidence.thresholds.risk_score.unit
  },
  insulinSensitivity: {
    key: "insulinSensitivity",
    label: evidence.thresholds.insulin_sensitivity.label,
    direction: evidence.thresholds.insulin_sensitivity.direction,
    warn: evidence.thresholds.insulin_sensitivity.warn,
    bad: evidence.thresholds.insulin_sensitivity.bad,
    unit: evidence.thresholds.insulin_sensitivity.unit
  },
  betaCellFunction: {
    key: "betaCellFunction",
    label: evidence.thresholds.beta_cell_function.label,
    direction: evidence.thresholds.beta_cell_function.direction,
    warn: evidence.thresholds.beta_cell_function.warn,
    bad: evidence.thresholds.beta_cell_function.bad,
    unit: evidence.thresholds.beta_cell_function.unit
  },
  inflammation: {
    key: "inflammation",
    label: evidence.thresholds.inflammation.label,
    direction: evidence.thresholds.inflammation.direction,
    warn: evidence.thresholds.inflammation.warn,
    bad: evidence.thresholds.inflammation.bad,
    unit: evidence.thresholds.inflammation.unit
  }
};

function formatValue(value: number, rule: ThresholdRule) {
  const rounded = value > 1 ? Math.round(value) : Number(value.toFixed(2));
  return rule.unit ? `${rounded} ${rule.unit}` : `${rounded}`;
}

function inferLikelyDriver(context?: StatusContext) {
  if (!context) return "Likely driver: current slider mix.";
  if (context.lastAction) return `Likely driver: ${context.lastAction}.`;
  const sliders = context.sliders;
  if (!sliders) return "Likely driver: current slider mix.";

  if ((sliders.meal_size ?? 0) > evidence.sliders.carbs_g.max * 0.58) return "Likely driver: higher carbohydrate load is increasing glucose excursion.";
  if ((sliders.activity ?? 100) < evidence.sliders.activity_min.max * 0.4) return "Likely driver: lower activity support can reduce peripheral uptake.";
  if ((sliders.inflammation ?? 0) > 0.55) return "Likely driver: higher inflammation weakens insulin effectiveness.";
  if ((sliders.chronic_exposure ?? 0) > 60) return "Likely driver: chronic exposure is pushing risk upward.";
  return "Likely driver: combined carbohydrate load, activity support, sensitivity, and beta-cell reserve.";
}

export function getMetricStatus(
  ruleName: keyof typeof STATUS_RULES,
  value: number,
  context?: StatusContext
): MetricStatusResult {
  const rule = STATUS_RULES[ruleName];
  const status =
    rule.direction === "higherIsWorse"
      ? value >= rule.bad
        ? "bad"
        : value >= rule.warn
          ? "warn"
          : "good"
      : value <= rule.bad
        ? "bad"
        : value <= rule.warn
          ? "warn"
          : "good";

  const thresholdSummary =
    rule.direction === "higherIsWorse"
      ? `Warn >= ${formatValue(rule.warn, rule)}; Bad >= ${formatValue(rule.bad, rule)}`
      : `Warn <= ${formatValue(rule.warn, rule)}; Bad <= ${formatValue(rule.bad, rule)}`;

  const explanation =
    status === "good"
      ? `${rule.label} is currently ${formatValue(value, rule)}. It is in the expected range. ${thresholdSummary} ${inferLikelyDriver(context)}`
      : `${rule.label} is currently ${formatValue(value, rule)} and crossed a threshold. ${thresholdSummary} ${inferLikelyDriver(context)}`;

  return { status, ruleLabel: rule.label, thresholdSummary, explanation };
}
