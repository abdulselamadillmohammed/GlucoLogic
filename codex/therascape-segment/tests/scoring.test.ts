import { describe, expect, it } from "vitest";
import configData from "../src/data/therascape.config.json";
import {
  computeGroupStatuses,
  computeSubfactorStatuses,
  getExplanation
} from "../src/logic/reasoningEngine";
import { computeReasoningScore } from "../src/logic/scoring";
import type { TheraScapeConfig } from "../src/logic/types";

const config = configData as TheraScapeConfig;

describe("reasoning model", () => {
  it("computes group and subfactor status for a selected class", () => {
    const caseA = config.cases[0];

    const groups = computeGroupStatuses(config, caseA.patient, "sglt2");
    const subfactors = computeSubfactorStatuses(config, caseA.patient, "sglt2", "cardiorenal");

    expect(groups.some((item) => item.groupId === "cardiorenal")).toBe(true);
    expect(subfactors.some((item) => item.subfactorId === "ckd")).toBe(true);
  });

  it("returns explanation with hints", () => {
    const caseB = config.cases[1];
    const explanation = getExplanation(config, "hypo_risk", "su", caseB.patient);

    expect(explanation?.title).toBe("Hypoglycemia risk");
    expect(explanation?.hints.length).toBeGreaterThan(1);
  });

  it("scores selected drivers and subfactors", () => {
    const score = computeReasoningScore(
      ["glycemia", "weight"],
      ["a1c_gap", "weight_loss_goal", "extra"],
      ["glycemia", "weight", "hypoglycemia"],
      ["a1c_gap", "weight_loss_goal"]
    );

    expect(score.groupScore).toBe(67);
    expect(score.subfactorScore).toBe(100);
    expect(score.totalScore).toBe(82);
    expect(score.missingGroups).toContain("hypoglycemia");
    expect(score.extraSubfactors).toContain("extra");
  });
});
