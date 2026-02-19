import { describe, expect, it } from "vitest";
import casesData from "../data/workshop/cases.json";
import drugsData from "../data/workshop/drugs.json";
import { GREETING, OUT_OF_SCOPE, chatReply } from "../src/workshop/logic/chatbot";
import { assertFactHasSources } from "../src/workshop/logic/datasetGuard";
import { effectToFill } from "../src/workshop/logic/effects";
import type { CasesDataset, DrugsDataset } from "../src/workshop/logic/types";

const drugs = drugsData as DrugsDataset;
const cases = (casesData as CasesDataset).cases;

describe("chatbot constraints", () => {
  it("returns strict greeting", () => {
    const reply = chatReply("hello", drugs, cases[0]);
    expect(reply).toBe(GREETING);
  });

  it("refuses out-of-scope prompts", () => {
    const reply = chatReply("tell me about hypertension pathways", drugs, cases[0]);
    expect(reply).toBe(OUT_OF_SCOPE);
  });
});

describe("evidence and bubble mapping", () => {
  it("requires cited facts", () => {
    const fact = drugs.classes[0].drugs[0].keyNotes[0];
    expect(() => assertFactHasSources(fact, drugs.sourcesIndex, "test.fact")).not.toThrow();
  });

  it("maps effect to water fill style", () => {
    expect(effectToFill("positive").level).toBeGreaterThan(50);
    expect(effectToFill("negative").level).toBeGreaterThan(50);
    expect(effectToFill("not_stated").pulse).toBe(true);
  });
});
