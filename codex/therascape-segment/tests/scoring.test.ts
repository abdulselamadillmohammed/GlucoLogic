import { describe, expect, it } from "vitest";
import { compareReasoningNodes } from "../src/logic/comparator";
import {
  clampEffects,
  computeCaseScore,
  computeDomainIntensities,
  derivePatientBaseline
} from "../src/logic/scoring";
import type { DrugData, PatientProfile } from "../src/logic/types";

describe("scoring logic", () => {
  it("derives baseline from patient profile", () => {
    const patient: PatientProfile = {
      a1c: 9.4,
      comorbidities: ["ASCVD"],
      egfr: 42,
      hf: false,
      ascvd: true,
      bmi: 34,
      hypoglycemiaRisk: "medium",
      costSensitivity: "high"
    };

    const baseline = derivePatientBaseline(patient);

    expect(baseline.cardiovascularRisk).toBe(2);
    expect(baseline.renalFunction).toBe(2);
    expect(baseline.a1cGap).toBe(3);
  });

  it("adds drug effects and clamps domain intensity", () => {
    const baseline = {
      cardiovascularRisk: 3,
      renalFunction: 3,
      weightBmi: 3,
      hypoglycemiaRisk: 3,
      costAccess: 3,
      a1cGap: 3
    };

    const drugs: DrugData[] = [
      {
        drugId: "x",
        name: "X",
        class: "C",
        notes: "",
        effects: {
          cardiovascularRisk: -2,
          renalFunction: -2,
          weightBmi: -1,
          hypoglycemiaRisk: 1,
          costAccess: 2,
          a1cGap: -3
        }
      }
    ];

    const intensity = computeDomainIntensities(baseline, drugs);
    const clamped = clampEffects({ ...intensity, a1cGap: 12 });

    expect(intensity.cardiovascularRisk).toBe(1);
    expect(intensity.costAccess).toBe(5);
    expect(clamped.a1cGap).toBe(6);
  });

  it("scores nodes and meds using weighted totals", () => {
    const comparison = compareReasoningNodes(["A", "B", "X"], ["A", "B", "C"]);
    const score = computeCaseScore(comparison, ["m1", "m2"], ["m1", "m3"]);

    expect(score.nodeScore).toBe(67);
    expect(score.medScore).toBe(50);
    expect(score.totalScore).toBe(60);
  });
});
