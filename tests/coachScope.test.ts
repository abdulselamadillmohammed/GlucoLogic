import { describe, expect, it } from "vitest";
import knowledge from "../src/coach/knowledge.t2d.json";
import { isOutOfScope, refusalMessage } from "../src/coach/scope";
import type { KnowledgeBase } from "../src/coach/types";

const kb = knowledge as KnowledgeBase;

describe("coach scope filter", () => {
  it("allows in-scope physiology questions", () => {
    expect(isOutOfScope("How does GLUT4 change in insulin resistance?", kb)).toBe(false);
  });

  it("blocks out-of-scope medication or diagnosis questions", () => {
    expect(isOutOfScope("What metformin dose should I take?", kb)).toBe(true);
    expect(isOutOfScope("Can you diagnose me from my glucose?", kb)).toBe(true);
  });

  it("returns required refusal message", () => {
    expect(refusalMessage(kb)).toBe("Out of scope: I can only help with Type 2 Diabetes physiology concepts inside this module.");
  });
});
