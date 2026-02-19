import { describe, expect, it } from "vitest";
import { nextHintIndex } from "../src/coach/coachEngine";

describe("hint ladder", () => {
  it("progresses hint index one step at a time", () => {
    expect(nextHintIndex(-1, 3)).toBe(0);
    expect(nextHintIndex(0, 3)).toBe(1);
    expect(nextHintIndex(1, 3)).toBe(2);
  });

  it("clamps at final hint", () => {
    expect(nextHintIndex(2, 3)).toBe(2);
    expect(nextHintIndex(10, 3)).toBe(2);
  });
});
