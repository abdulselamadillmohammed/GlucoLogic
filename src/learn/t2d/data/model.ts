import type { ControlsState, ModelOutputs } from "../types";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

/**
 * Educational deterministic model for demo interactions.
 * Same inputs always produce same outputs. Values are bounded and not clinical-grade.
 */
export function runT2DModel(input: ControlsState): ModelOutputs {
  const meal = clamp(input.mealSize, 0, 100) / 100;
  const activity = clamp(input.activity, 0, 100) / 100;

  const stressPenalty =
    (input.stressors.visceralFat ? 0.1 : 0) +
    (input.stressors.inflammation ? 0.12 : 0) +
    (input.stressors.sedentary ? 0.1 : 0) +
    (input.stressors.highFFA ? 0.1 : 0);

  const stagePenalty = (input.stage - 1) * 0.08;

  const insulinSensitivity = clamp(input.insulinSensitivity - stressPenalty - stagePenalty, 0.1, 1);
  const betaCellFunction = clamp(input.betaCellFunction - (input.stage - 1) * 0.12, 0.1, 1);
  const inflammation = clamp(input.inflammation + (input.stressors.inflammation ? 0.18 : 0), 0, 1);
  const ffa = clamp(input.ffaLoad + (input.stressors.highFFA ? 0.2 : 0), 0, 1);

  const hepaticOutputIndex = clamp(0.35 + inflammation * 0.3 + (1 - insulinSensitivity) * 0.35 + ffa * 0.15, 0.1, 1);
  const peripheralUptakeIndex = clamp(0.2 + activity * 0.35 + insulinSensitivity * 0.4 - ffa * 0.15, 0.1, 1);

  const fastingGlucose = clamp(82 + hepaticOutputIndex * 75 + (1 - betaCellFunction) * 22, 70, 260);
  const postMealPeak = clamp(fastingGlucose + meal * 95 - peripheralUptakeIndex * 28 + (1 - betaCellFunction) * 20, 95, 380);

  const insulinPeak = clamp(10 + betaCellFunction * 38 + meal * 30 - (input.stage > 2 ? (input.stage - 2) * 10 : 0), 5, 100);

  const glucoseCurve = Array.from({ length: 25 }, (_, i) => {
    const t = i * 5;
    const mealPulse = meal * Math.exp(-Math.pow((t - 35) / 24, 2));
    const decay = Math.exp(-t / 120);
    const value = fastingGlucose + mealPulse * 120 - peripheralUptakeIndex * 20 * (1 - decay);
    return { t, v: Math.round(clamp(value, 70, 380)) };
  });

  const insulinCurve = Array.from({ length: 25 }, (_, i) => {
    const t = i * 5;
    const pulse = Math.exp(-Math.pow((t - 30) / 22, 2));
    const value = 6 + insulinPeak * pulse * (0.45 + betaCellFunction * 0.55);
    return { t, v: Math.round(clamp(value, 5, 100)) };
  });

  const chronicLoad = clamp((postMealPeak - 140) / 220 + input.exposure / 200 + inflammation * 0.2, 0, 1);

  return {
    glucoseCurve,
    insulinCurve,
    metrics: {
      fastingGlucose: Math.round(fastingGlucose),
      postMealPeak: Math.round(postMealPeak),
      hepaticOutputIndex: Number(hepaticOutputIndex.toFixed(2)),
      peripheralUptakeIndex: Number(peripheralUptakeIndex.toFixed(2))
    },
    risks: {
      heart: Math.round(clamp(chronicLoad * 92 + 5, 0, 100)),
      kidney: Math.round(clamp(chronicLoad * 96 + hepaticOutputIndex * 7, 0, 100)),
      eye: Math.round(clamp(chronicLoad * 90 + 4, 0, 100)),
      nerves: Math.round(clamp(chronicLoad * 94 + 5, 0, 100)),
      brain: Math.round(clamp(chronicLoad * 86 + 6, 0, 100))
    }
  };
}
