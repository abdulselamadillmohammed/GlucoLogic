import { refusalMessage, isOutOfScope } from "./scope";
import { retrieveConcepts, retrievalConfidence } from "./retrieval";
import type { CoachAction, CoachAnswer, CoachContext, CoachMode, CoachState, KnowledgeBase } from "./types";

export function createCoachState(): CoachState {
  return { hintIndexByConcept: {} };
}

export function nextHintIndex(current: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(total - 1, current + 1);
}

function sectionLabel(sectionId: string) {
  const map: Record<string, string> = {
    overview: "Overview",
    normal: "Normal Regulation",
    resistance: "Insulin Resistance",
    beta: "Beta Cell Failure",
    complications: "Complications",
    glossary: "Glossary"
  };

  return map[sectionId] ?? sectionId;
}

function hasContextValues(context: CoachContext) {
  const values = [
    context.sliders.meal_size,
    context.sliders.activity,
    context.sliders.insulin_sensitivity,
    context.sliders.beta_cell_function,
    context.sliders.inflammation,
    context.sliders.chronic_exposure,
    context.outputs.glucose_level,
    context.outputs.insulin_level,
    context.outputs.hepatic_output,
    context.outputs.peripheral_uptake
  ];
  return values.every((value) => Number.isFinite(value));
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function buildGroundedObservation(context: CoachContext) {
  const sensitivity = context.sliders.insulin_sensitivity;
  const betaFunction = context.sliders.beta_cell_function;
  const hepaticOutput = context.outputs.hepatic_output;
  const uptake = context.outputs.peripheral_uptake;
  const glucose = context.outputs.glucose_level;
  const insulin = context.outputs.insulin_level;
  const exposure = context.sliders.chronic_exposure;
  const kidneyRisk = context.outputs.risk_scores.kidney;
  const heartRisk = context.outputs.risk_scores.heart;

  const lines = [
    `insulin_sensitivity is ${formatPercent(sensitivity)} and beta_cell_function is ${formatPercent(betaFunction)}.`,
    `Because sensitivity is ${sensitivity < 0.55 ? "reduced" : "moderate"}, peripheral_uptake is ${uptake.toFixed(2)} while hepatic_output is ${hepaticOutput.toFixed(2)}.`,
    `glucose_level is ${glucose.toFixed(0)} and insulin_level is ${insulin.toFixed(2)}, so glucose ${glucose > 165 ? "stays elevated longer" : "is closer to controlled range"}.`,
    `With chronic_exposure at ${Math.round(exposure)}%, kidney risk (${kidneyRisk}) and heart risk (${heartRisk}) reflect cumulative load.`
  ];

  return lines;
}

function explainTryThis(context: CoachContext) {
  if (context.currentSectionId === "normal") {
    return `Try this: raise activity by 10 and watch peripheral_uptake before the glucose peak.`;
  }
  if (context.currentSectionId === "resistance") {
    return "Try this: toggle a stressor and compare hepatic_output versus peripheral_uptake first.";
  }
  if (context.currentSectionId === "beta") {
    return "Try this: increase stage and watch fasting glucose drift before post-meal spikes widen.";
  }
  if (context.currentSectionId === "complications") {
    return "Try this: increase chronic exposure and compare kidney and heart risk slope changes.";
  }
  return "Try this: move one control and compare glucose_level with insulin_level together.";
}

function fallbackLowConfidenceMessage() {
  return "I'm not confident this is covered in this module. Try asking about glucose regulation, insulin resistance, beta-cell function, or complications.";
}

function maybeGlossaryLine(question: string, kb: KnowledgeBase) {
  const q = question.toLowerCase();
  const glossaryMatches = kb.concepts.filter(
    (concept) =>
      Boolean(concept.glossaryDefinition) &&
      (q.includes(concept.title.toLowerCase()) || concept.tags.some((tag) => q.includes(tag.toLowerCase())))
  );

  if (glossaryMatches.length === 0) return null;
  const concept = glossaryMatches[0];
  return `${concept.title}: ${concept.glossaryDefinition}`;
}

export function answerQuestion(
  mode: CoachMode,
  question: string,
  context: CoachContext,
  state: CoachState,
  kb: KnowledgeBase,
  action: CoachAction = "respond"
): { answer: CoachAnswer; state: CoachState } {
  const q = question.trim();
  const fallbackQuery = q || `${context.currentSectionId} ${context.currentOrganId ?? ""}`.trim();

  if (action === "hint" && mode !== "socratic") {
    return {
      answer: {
        text: "Hint is available only in Socratic mode. Switch to Socratic and press Hint.",
        conceptIds: [],
        refused: false
      },
      state
    };
  }

  if (isOutOfScope(fallbackQuery, kb)) {
    return {
      answer: {
        text: refusalMessage(kb),
        conceptIds: [],
        refused: true
      },
      state
    };
  }

  let hits = retrieveConcepts(fallbackQuery, context, kb, 4);
  let confidence = retrievalConfidence(hits);

  if ((mode === "challenge" || action === "hint") && confidence < 0.35) {
    hits = retrieveConcepts(`${context.currentSectionId} ${context.currentOrganId ?? ""}`.trim(), context, kb, 4);
    confidence = retrievalConfidence(hits);
  }

  if (confidence < 0.35) {
    return {
      answer: {
        text: fallbackLowConfidenceMessage(),
        conceptIds: [],
        refused: false,
        lowConfidence: true
      },
      state
    };
  }

  const top = hits[0].concept;
  const nextState = {
    ...state,
    hintIndexByConcept: { ...state.hintIndexByConcept }
  };

  if (mode === "socratic" && action === "hint") {
    const currentIndex = nextState.hintIndexByConcept[top.id] ?? -1;
    const hintIndex = nextHintIndex(currentIndex, top.hints.length);
    nextState.hintIndexByConcept[top.id] = hintIndex;

    return {
      answer: {
        text: `Hint ${hintIndex + 1}: ${top.hints[hintIndex]}`,
        conceptIds: [top.id],
        refused: false
      },
      state: nextState
    };
  }

  if (mode === "challenge") {
    const challenge = top.challenges[0] ?? "Adjust one control and explain what changed first in glucose vs insulin.";
    const sectionGoal = sectionLabel(context.currentSectionId);
    const success =
      context.currentSectionId === "complications"
        ? "Success condition: raise one organ risk by at least 10 points while describing the driver."
        : "Success condition: move one control and explain which metric shifts first and why.";
    const cue =
      context.currentSectionId === "resistance"
        ? "Observation cue: watch hepatic_output and peripheral_uptake diverge."
        : "Observation cue: watch glucose_level and insulin_level timing.";
    return {
      answer: {
        text: `Mini goal (${sectionGoal}): ${challenge}\n${success}\n${cue}`,
        conceptIds: [top.id],
        refused: false
      },
      state: nextState
    };
  }

  const glossaryLine = maybeGlossaryLine(fallbackQuery, kb);
  if (!hasContextValues(context)) {
    return {
      answer: {
        text: "What it means here: This concept shapes how glucose and insulin respond in the simulation.\nI can explain, but try moving one control first so I can tie it to your simulation.",
        conceptIds: [top.id],
        refused: false
      },
      state: nextState
    };
  }

  if (mode === "socratic") {
    const questionLine =
      context.currentSectionId === "resistance"
        ? "Guiding question: if insulin_sensitivity drops further, does glucose rise because uptake falls, output rises, or both?"
        : context.currentSectionId === "beta"
          ? "Guiding question: as beta_cell_function declines, which changes first in your run: fasting glucose or post-meal peak?"
          : "Guiding question: which variable moved first after your last control change?";
    const text = `${top.shortExplanation}\n${questionLine}`;
    return {
      answer: {
        text,
        conceptIds: hits.map((hit) => hit.concept.id),
        refused: false
      },
      state: nextState
    };
  }

  const observationLines = buildGroundedObservation(context);
  const selectedObservations =
    context.currentSectionId === "complications"
      ? [observationLines[0], observationLines[1], observationLines[3]]
      : [observationLines[0], observationLines[1], observationLines[2]];
  const explainLines = [
    `What it means here: ${top.shortExplanation}`,
    "In your simulation right now:",
    `- ${selectedObservations[0]}`,
    `- ${selectedObservations[1]}`,
    `- ${selectedObservations[2]}`
  ];

  if (glossaryLine && explainLines.length < 6) explainLines.push(`- Glossary tie-in: ${glossaryLine}`);
  explainLines.push(explainTryThis(context));

  return {
    answer: {
      text: explainLines.join("\n"),
      conceptIds: hits.map((hit) => hit.concept.id),
      refused: false
    },
    state: nextState
  };
}
