import { describe, expect, it } from "vitest";
import configData from "../src/data/therascape.config.json";
import { compareReasoning } from "../src/logic/comparator";
import { computeGroupStatuses, computeSubfactorStatuses, getExplanation } from "../src/logic/reasoningEngine";
import { computeReasoningScore } from "../src/logic/scoring";
import type { TheraScapeConfig } from "../src/logic/types";

const config = configData as TheraScapeConfig;

describe("reasoning engine", () => {
  it("computes group statuses and subfactor statuses", () => {
    const caseOne = config.cases[0];
    const groups = computeGroupStatuses(config, caseOne.patient, "sglt2_emp");
    const cardiorenal = groups.find((entry) => entry.groupId === "cardiorenal");

    const subfactors = computeSubfactorStatuses(config, caseOne.patient, "sglt2_emp", "cardiorenal");
    const ckd = subfactors.find((entry) => entry.subfactorId === "ckd");

    expect(cardiorenal).toBeDefined();
    expect(ckd).toBeDefined();
    expect(["green", "yellow", "red"]).toContain(ckd?.status);
  });

  it("returns explanation with hint ladder", () => {
    const explanation = getExplanation(config, "hypoglycemia_history", "dpp4_sita");

    expect(explanation?.subfactor).toBe("Hypoglycemia risk profile");
    expect(explanation?.hints.length).toBeGreaterThan(1);
  });
});

describe("scoring", () => {
  it("scores selected groups and subfactors", () => {
    const score = computeReasoningScore(
      ["glycemia", "cardiorenal"],
      ["a1c_gap", "heart_failure", "extra_node"],
      ["glycemia", "cardiorenal", "hypoglycemia"],
      ["a1c_gap", "heart_failure"]
    );

    expect(score.groupScore).toBe(67);
    expect(score.subfactorScore).toBe(100);
    expect(score.totalScore).toBe(84);
    expect(score.missingGroups).toContain("hypoglycemia");
    expect(score.extraSubfactors).toContain("extra_node");
  });

  it("computes calibration label", () => {
    const feedback = compareReasoning(["glycemia"], ["a1c_gap"], ["glycemia", "weight"], ["a1c_gap"], 95);

    expect(feedback.score.totalScore).toBe(75);
    expect(feedback.calibrationLabel).toBe("overconfident");
  });
});
