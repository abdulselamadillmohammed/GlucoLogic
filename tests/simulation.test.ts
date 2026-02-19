import { describe, expect, it } from "vitest";
import { buildTrend, simulateT2D } from "../src/model/simulation";

describe("simulateT2D", () => {
  it("increases glucose with larger meal and lower sensitivity", () => {
    const lowLoad = simulateT2D({
      meal_size: 30,
      activity: 60,
      insulin_sensitivity: 0.85,
      beta_cell_function: 0.9,
      inflammation: 0.1
    });

    const highLoad = simulateT2D({
      meal_size: 90,
      activity: 20,
      insulin_sensitivity: 0.35,
      beta_cell_function: 0.45,
      inflammation: 0.8
    });

    expect(highLoad.glucose_level).toBeGreaterThan(lowLoad.glucose_level);
    expect(highLoad.insulin_effectiveness).toBeLessThan(lowLoad.insulin_effectiveness);
  });

  it("returns bounded risk scores", () => {
    const out = simulateT2D({
      meal_size: 100,
      activity: 0,
      insulin_sensitivity: 0,
      beta_cell_function: 0,
      inflammation: 1
    });

    expect(out.risk_scores.heart).toBeGreaterThanOrEqual(0);
    expect(out.risk_scores.kidney).toBeLessThanOrEqual(1);
  });

  it("builds deterministic trend points", () => {
    const trend = buildTrend({
      meal_size: 60,
      activity: 40,
      insulin_sensitivity: 0.7,
      beta_cell_function: 0.8,
      inflammation: 0.3
    });

    expect(trend.length).toBe(25);
    expect(trend[0]?.t).toBe(0);
    expect(trend[24]?.t).toBe(6);
  });
});
