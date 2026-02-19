import type { CaseEntry, DrugEntry, Effect, Subfactor, SourceIndexEntry } from "./types";
import { SUBFACTOR_LABELS } from "./subfactors";

export interface ReasoningResult {
  verdict: "Correct" | "Partially correct" | "Not supported";
  score: number;
  bullets: string[];
  citedSourceIds: string[];
}

function effectMatchesGoal(effect: Effect, goal: string) {
  if (effect === "not_stated") return false;
  const lower = goal.toLowerCase();
  if (lower.includes("avoid") || lower.includes("reduce") || lower.includes("improve")) {
    return effect === "positive" || effect === "neutral";
  }
  return effect !== "negative";
}

function extractMentionedSubfactors(text: string): Subfactor[] {
  const lower = text.toLowerCase();
  return (Object.entries(SUBFACTOR_LABELS) as Array<[Subfactor, string]>)
    .filter(([subfactor, label]) => lower.includes(label.toLowerCase()) || lower.includes(subfactor.replace("_", " ")))
    .map(([subfactor]) => subfactor);
}

export function evaluateReasoning(
  caseEntry: CaseEntry,
  selectedDrug: DrugEntry | null,
  reasoningText: string,
  sourceIndex: SourceIndexEntry[]
): ReasoningResult {
  const mentioned = extractMentionedSubfactors(reasoningText);
  const targets = caseEntry.learningTargets.map((target) => target.subfactor);
  const covered = targets.filter((target) => mentioned.includes(target));
  const missing = targets.filter((target) => !mentioned.includes(target));
  const extras = mentioned.filter((target) => !targets.includes(target));

  let alignmentScore = 0;
  const alignBullets: string[] = [];
  const citedSourceIds = new Set<string>();

  for (const target of caseEntry.learningTargets) {
    target.sources.forEach((source) => citedSourceIds.add(source.sourceId));
    if (!selectedDrug) continue;
    const effect = selectedDrug.effects[target.subfactor].effect;
    selectedDrug.effects[target.subfactor].sources.forEach((source) => citedSourceIds.add(source.sourceId));
    if (effectMatchesGoal(effect, target.goal)) {
      alignmentScore += 1;
    } else {
      alignBullets.push(`${SUBFACTOR_LABELS[target.subfactor]} alignment is weak for this selected drug.`);
    }
  }

  const base = Math.max(0, covered.length - missing.length) + alignmentScore;
  const normalized = Math.max(0, Math.min(100, Math.round((base / Math.max(1, targets.length * 2)) * 100)));

  if (missing.length) {
    alignBullets.push(`Missing focus areas: ${missing.map((item) => SUBFACTOR_LABELS[item]).join(", ")}.`);
  }
  if (extras.length) {
    alignBullets.push(`Extra areas not part of case targets: ${extras.map((item) => SUBFACTOR_LABELS[item]).join(", ")}.`);
  }
  if (!selectedDrug) {
    alignBullets.push("No drug is administered yet, so effect alignment is incomplete.");
  }

  const verdict: ReasoningResult["verdict"] =
    normalized >= 75 ? "Correct" : normalized >= 40 ? "Partially correct" : "Not supported";

  const fallbackSource = sourceIndex[0]?.sourceId;
  if (!citedSourceIds.size && fallbackSource) citedSourceIds.add(fallbackSource);

  return {
    verdict,
    score: normalized,
    bullets: alignBullets.slice(0, 4),
    citedSourceIds: Array.from(citedSourceIds)
  };
}
