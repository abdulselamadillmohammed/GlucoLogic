import { drugsDataset } from "./data";
import { NOT_STATED } from "./types";

const allowedStrings = new Set<string>();

function collectStrings(input: unknown) {
  if (typeof input === "string") {
    allowedStrings.add(input);
    return;
  }
  if (!input || typeof input !== "object") return;
  if (Array.isArray(input)) {
    input.forEach(collectStrings);
    return;
  }
  Object.values(input as Record<string, unknown>).forEach(collectStrings);
}

collectStrings(drugsDataset);

export function guardDatasetContent(text: string, context: string) {
  if (text === NOT_STATED) return text;
  if (allowedStrings.has(text)) return text;

  if (import.meta.env.DEV) {
    throw new Error(`Content guard violation in ${context}: "${text}" is not present in data/drugs.json`);
  }

  return NOT_STATED;
}
