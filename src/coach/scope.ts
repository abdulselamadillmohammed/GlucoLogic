import type { KnowledgeBase } from "./types";

function normalize(text: string) {
  return text.toLowerCase().trim();
}

export function isOutOfScope(question: string, kb: KnowledgeBase): boolean {
  const q = normalize(question);
  if (!q) return false;

  const regexes = kb.rules.outOfScopePatterns.map((pattern) => new RegExp(pattern, "i"));
  return regexes.some((regex) => regex.test(q));
}

export function refusalMessage(kb: KnowledgeBase) {
  return kb.rules.refusalMessage;
}
