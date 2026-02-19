export type GlossaryCategory = "Core Mechanisms" | "Complications";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  whyItMatters: string;
  category: GlossaryCategory;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: "insulin-resistance",
    term: "Insulin resistance",
    definition: "Reduced response to insulin, requiring greater hormone output for similar glucose lowering.",
    whyItMatters: "It shifts the whole system toward higher glucose and compensatory insulin strain.",
    category: "Core Mechanisms"
  },
  {
    id: "glut4",
    term: "GLUT4",
    definition: "Transporter that moves to the cell membrane and increases glucose uptake.",
    whyItMatters: "When signaling weakens, GLUT4 traffic drops and post-meal glucose stays elevated.",
    category: "Core Mechanisms"
  },
  {
    id: "hepatic-glucose-output",
    term: "Hepatic glucose output",
    definition: "Liver-released glucose, often elevated when insulin suppression is impaired.",
    whyItMatters: "It is a major driver of fasting and pre-meal glucose burden.",
    category: "Core Mechanisms"
  },
  {
    id: "beta-cell-compensation",
    term: "Beta-cell compensation",
    definition: "Early increase in insulin secretion while resistance is developing.",
    whyItMatters: "The compensation phase can mask progression before decline becomes obvious.",
    category: "Core Mechanisms"
  },
  {
    id: "glucotoxicity",
    term: "Glucotoxicity",
    definition: "Cell stress caused by persistent high glucose exposure.",
    whyItMatters: "It accelerates dysfunction across signaling, beta-cell function, and risk pathways.",
    category: "Complications"
  },
  {
    id: "lipotoxicity",
    term: "Lipotoxicity",
    definition: "Cell stress from chronic excess free fatty acids and lipid byproducts.",
    whyItMatters: "It compounds insulin resistance and inflammatory load in the model.",
    category: "Complications"
  },
  {
    id: "microvascular-stress",
    term: "Microvascular stress",
    definition: "Accumulated strain in small vessels exposed to prolonged dysglycemia.",
    whyItMatters: "It links chronic exposure to organ-level risk trends for eye, kidney, and nerves.",
    category: "Complications"
  },
  {
    id: "chronic-exposure",
    term: "Chronic exposure",
    definition: "Long-duration glycemic burden represented by the exposure control in this module.",
    whyItMatters: "Raising exposure increases systemic risk scores and reveals organ tradeoffs.",
    category: "Complications"
  }
];
