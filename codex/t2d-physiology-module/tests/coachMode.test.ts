import { describe, expect, it } from "vitest";
import knowledge from "../src/coach/knowledge.t2d.json";
import { answerQuestion, createCoachState } from "../src/coach/coachEngine";
import type { CoachContext, KnowledgeBase } from "../src/coach/types";

const kb = knowledge as KnowledgeBase;

const context: CoachContext = {
  currentSectionId: "resistance",
  currentOrganId: "liver",
  sliders: {
    meal_size: 70,
    activity: 30,
    insulin_sensitivity: 0.48,
    beta_cell_function: 0.74,
    inflammation: 0.56,
    chronic_exposure: 40
  },
  outputs: {
    glucose_level: 186,
    insulin_level: 0.88,
    hepatic_output: 0.73,
    peripheral_uptake: 0.42,
    risk_scores: { heart: 54, kidney: 59, eye: 50, nerves: 57, brain: 49 }
  },
  lastAction: "changed inflammation to 56"
};

describe("coach mode behavior", () => {
  it("explain mode is grounded and not forced-socratic", () => {
    const { answer } = answerQuestion("explain", "why is glucose still high", context, createCoachState(), kb);
    expect(answer.refused).toBe(false);
    expect(answer.text).toContain("What it means here:");
    expect(answer.text).toContain("In your simulation right now:");
    expect(answer.text).toContain("insulin_sensitivity");
    expect(answer.text.toLowerCase()).not.toContain("guiding question:");
    expect(answer.text.toLowerCase()).not.toContain("hint 1:");
  });

  it("socratic mode provides a guiding question", () => {
    const { answer } = answerQuestion("socratic", "explain resistance here", context, createCoachState(), kb);
    expect(answer.refused).toBe(false);
    expect(answer.text.toLowerCase()).toContain("guiding question:");
  });

  it("challenge mode returns mini goal + success condition + observation cue", () => {
    const { answer } = answerQuestion("challenge", "give me a task", context, createCoachState(), kb);
    expect(answer.refused).toBe(false);
    expect(answer.text).toContain("Mini goal");
    expect(answer.text).toContain("Success condition:");
    expect(answer.text).toContain("Observation cue:");
  });

  it("hint ladder responds only in socratic mode", () => {
    const explainHint = answerQuestion("explain", "help", context, createCoachState(), kb, "hint");
    expect(explainHint.answer.text).toContain("Hint is available only in Socratic mode");

    const first = answerQuestion("socratic", "help", context, createCoachState(), kb, "hint");
    expect(first.answer.text).toContain("Hint 1:");
  });
});
