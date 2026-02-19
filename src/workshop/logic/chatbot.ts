import type { CaseEntry, DrugsDataset } from "./types";

const OUT_OF_SCOPE = "That’s not in the scope of my knowledge base.";
const GREETING = "Hello, what can I do for you today?";

function normalize(input: string) {
  return input.trim().toLowerCase();
}

function isGreeting(text: string) {
  return text === "hi" || text === "hello";
}

export function chatReply(message: string, drugs: DrugsDataset, selectedCase: CaseEntry) {
  const normalized = normalize(message);
  if (!normalized) return OUT_OF_SCOPE;
  if (isGreeting(normalized)) return GREETING;

  const searchable = [
    selectedCase.title,
    selectedCase.prompt.chief,
    ...selectedCase.prompt.summaryBullets,
    ...selectedCase.fullHistory.history,
    ...drugs.classes.map((cls) => cls.className),
    ...drugs.classes.flatMap((cls) => cls.drugs.map((drug) => drug.genericName))
  ]
    .join(" ")
    .toLowerCase();

  if (!searchable.includes(normalized.split(" ")[0])) {
    return OUT_OF_SCOPE;
  }

  const matchingClass = drugs.classes.find((cls) => normalized.includes(cls.className.toLowerCase()));
  if (matchingClass) {
    return `${matchingClass.className}: dataset-only summary available. Open the class card Sources section for citations.`;
  }

  const matchingDrug = drugs.classes.flatMap((cls) => cls.drugs).find((drug) => normalized.includes(drug.genericName.toLowerCase()));
  if (matchingDrug) {
    return `${matchingDrug.genericName}: use class/drug card Sources to review cited facts.`;
  }

  if (normalized.includes("insulin resistance") || normalized.includes("insulin")) {
    return "Dataset scope recognizes insulin and insulin resistance as different topics. If a detail is absent in the dataset, it is not supported.";
  }

  return OUT_OF_SCOPE;
}

export { GREETING, OUT_OF_SCOPE };
