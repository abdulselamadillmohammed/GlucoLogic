import type { SourceRef, SourceIndexEntry, TextFact } from "./types";

export function hasSources(sources: SourceRef[], index: SourceIndexEntry[]) {
  if (!sources.length) return false;
  const sourceIds = new Set(index.map((entry) => entry.sourceId));
  return sources.every((source) => sourceIds.has(source.sourceId));
}

export function assertFactHasSources(fact: TextFact, index: SourceIndexEntry[], context: string) {
  if (!hasSources(fact.sources, index)) {
    throw new Error(`Uncited fact in ${context}: "${fact.text}"`);
  }
}

export function ensureDatasetClaim(text: string, allowedTexts: Set<string>, context: string) {
  if (text === "Not stated in dataset") return text;
  if (allowedTexts.has(text)) return text;
  if (import.meta.env.DEV) {
    throw new Error(`datasetGuard blocked non-dataset text in ${context}`);
  }
  return "Not stated in dataset";
}
