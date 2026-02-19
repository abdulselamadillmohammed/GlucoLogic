import type { CoachContext, KnowledgeBase, RetrievalResult } from "./types";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "to", "in", "on", "for", "of", "with", "what", "how", "why", "is", "are", "this", "that", "about"
]);

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractActionTokens(lastAction?: string) {
  if (!lastAction) return [];
  return tokenize(lastAction).map(normalizeToken);
}

export function retrieveConcepts(
  question: string,
  context: CoachContext,
  kb: KnowledgeBase,
  limit = 4
): RetrievalResult[] {
  const tokens = tokenize(question);
  const normalizedQuestionTokens = tokens.map(normalizeToken);
  const actionTokens = extractActionTokens(context.lastAction);
  const hasQuestionText = question.trim().length > 0;
  const organToken = normalizeToken(context.currentOrganId ?? "");

  const ranked = kb.concepts.map((concept) => {
    const normalizedTags = concept.tags.map((tag) => normalizeToken(tag));
    const normalizedTitle = tokenize(concept.title).map(normalizeToken);

    const tagOverlap = normalizedTags.filter((tag) => normalizedQuestionTokens.includes(tag)).length;
    const titleOverlap = normalizedTitle.filter((token) => normalizedQuestionTokens.includes(token)).length;
    const overlapScore = tagOverlap * 3 + titleOverlap * 2;

    const sectionBoost = concept.sectionIds.includes(context.currentSectionId) ? 4 : 0;
    const organInTags = organToken ? normalizedTags.includes(organToken) : false;
    const organInConceptIds = concept.organIds?.map(normalizeToken).includes(organToken) ?? false;
    const organBoost = organToken && (organInTags || organInConceptIds) ? 4 : 0;

    const questionTouchesAction =
      !hasQuestionText || normalizedQuestionTokens.some((token) => actionTokens.includes(token));
    const actionOverlap =
      actionTokens.length === 0 || !questionTouchesAction
        ? 0
        : normalizedTags.filter((tag) => actionTokens.includes(tag)).length +
          normalizedTitle.filter((token) => actionTokens.includes(token)).length;
    const actionBoost = Math.min(3, actionOverlap);

    const hasSemanticOverlap = overlapScore > 0 || actionBoost > 0;
    const allowContextOnlyFallback = !hasQuestionText;
    const score = hasSemanticOverlap || allowContextOnlyFallback ? overlapScore + sectionBoost + organBoost + actionBoost : 0;
    const confidenceBase = overlapScore + actionBoost;
    const confidence = score <= 0 ? 0 : Math.min(1, (confidenceBase + sectionBoost * 0.3 + organBoost * 0.3) / 10);

    return { concept, score, overlapScore, sectionBoost, organBoost, actionBoost, confidence };
  });

  return ranked
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function retrievalConfidence(results: RetrievalResult[]) {
  if (results.length === 0) return 0;
  const top = results[0];
  return Math.min(1, Math.max(0, top.confidence));
}
