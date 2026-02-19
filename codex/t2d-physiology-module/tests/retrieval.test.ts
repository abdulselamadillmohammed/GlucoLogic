import { describe, expect, it } from "vitest";
import knowledge from "../src/coach/knowledge.t2d.json";
import { retrievalConfidence, retrieveConcepts } from "../src/coach/retrieval";
import type { CoachContext, KnowledgeBase } from "../src/coach/types";

const kb = knowledge as KnowledgeBase;

const baseContext: CoachContext = {
  currentSectionId: "resistance",
  currentOrganId: "liver",
  sliders: {
    meal_size: 60,
    activity: 30,
    insulin_sensitivity: 0.5,
    beta_cell_function: 0.7,
    inflammation: 0.6,
    chronic_exposure: 45
  },
  outputs: {
    glucose_level: 190,
    insulin_level: 0.9,
    hepatic_output: 0.74,
    peripheral_uptake: 0.41,
    risk_scores: { heart: 55, kidney: 60, eye: 52, nerves: 58, brain: 50 }
  },
  lastAction: "changed inflammation to 60"
};

describe("coach retrieval", () => {
  it("ranks section and organ-relevant concepts highest", () => {
    const results = retrieveConcepts("why is hepatic output high with insulin resistance", baseContext, kb, 3);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].concept.id).toBe("resistance-hepatic-rise");
  });

  it("returns fewer/no concepts for unrelated words", () => {
    const results = retrieveConcepts("quantum planets poetry", baseContext, kb, 3);
    expect(results.length).toBe(0);
  });

  it("reports high confidence for relevant retrieval and low for empty retrieval", () => {
    const relevant = retrieveConcepts("insulin resistance liver output", baseContext, kb, 3);
    const unrelated = retrieveConcepts("quantum planets poetry", baseContext, kb, 3);

    expect(retrievalConfidence(relevant)).toBeGreaterThan(0.45);
    expect(retrievalConfidence(unrelated)).toBe(0);
  });
});
