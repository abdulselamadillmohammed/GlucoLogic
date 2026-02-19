import diabeticRetinopathyHallmarksPng from "../assets/diagrams/Diabetic Retinopathy Hallmarks.png";
import dualMechanismIncretinMimeticsGutBrainSignalingPng from "../assets/diagrams/Dual Mechanism of Incretin Mimetics in Gut-Brain Signaling.png";
import healthyVsTypeIIDiabetesPng from "../assets/diagrams/Healthy vs. Type II Diabetes.png";
import insulinPathwayPng from "../assets/diagrams/Insulin Pathway.png";
import neuronalControlPeripheralInsulinSensitivityGlucoseMetabolismPng from "../assets/diagrams/Neuronal Control of Peripheral Insulin Sensitivity and Glucose Metabolism.png";
import pancreaticIsletOfLangerhansPng from "../assets/diagrams/Pancreatic Islet of Langerhans.png";
import regulationOfBloodGlucosePng from "../assets/diagrams/Regulation of Blood Glucose.png";
import regulationOfInsulinReleasePng from "../assets/diagrams/Regulation of Insulin Release.png";
import secretionAndMetabolismOfGipAndGlp1IncretinHormonesPng from "../assets/diagrams/Secretion and Metabolism of GIP and GLP‐1 Incretin Hormones.png";

export type DiagramSectionId = "normal" | "resistance" | "beta" | "complications";
export type DiagramTriggerType = "primaryButton" | "nodeClick" | "organClick" | "learnMoreCard";

export interface DiagramDefinition {
  id: string;
  title: string;
  sectionId: DiagramSectionId;
  triggerType: DiagramTriggerType;
  image: string | null;
  shortExplanation: string;
  alt: string;
  expectedFileName: string;
}

export const DIAGRAMS: Record<string, DiagramDefinition> = {
  normalPrimary: {
    id: "normal-primary-regulation-blood-glucose",
    title: "Regulation of Blood Glucose",
    sectionId: "normal",
    triggerType: "primaryButton",
    image: regulationOfBloodGlucosePng,
    shortExplanation:
      "This diagram compares the major pathways that stabilize glucose during fasting and post-meal periods. Use it as the overview anchor before drilling into pancreas or islet details. It helps connect chart behavior to system-level regulation.",
    alt: "Regulation of blood glucose diagram",
    expectedFileName: "Regulation of Blood Glucose.png"
  },
  normalInsulinRelease: {
    id: "normal-node-insulin-release",
    title: "Regulation of Insulin Release",
    sectionId: "normal",
    triggerType: "nodeClick",
    image: regulationOfInsulinReleasePng,
    shortExplanation:
      "This diagram focuses on beta-cell sensing and insulin pulse release dynamics. Open it when exploring pancreas-related controls to connect mechanism with glucose peak behavior. It reinforces why secretion timing matters for recovery.",
    alt: "Regulation of insulin release diagram",
    expectedFileName: "Regulation of Insulin Release.png"
  },
  normalIslet: {
    id: "normal-node-islet",
    title: "Pancreatic Islet of Langerhans",
    sectionId: "normal",
    triggerType: "nodeClick",
    image: pancreaticIsletOfLangerhansPng,
    shortExplanation:
      "This diagram highlights islet architecture and endocrine cell context. It supports beta-cell discussions by linking structure with secretion capacity. Use it alongside progression changes to understand compensation limits.",
    alt: "Pancreatic islet of Langerhans diagram",
    expectedFileName: "Pancreatic Islet of Langerhans.png"
  },
  resistancePrimary: {
    id: "resistance-primary-healthy-vs-type2",
    title: "Healthy vs. Type II Diabetes",
    sectionId: "resistance",
    triggerType: "primaryButton",
    image: healthyVsTypeIIDiabetesPng,
    shortExplanation:
      "This side-by-side visual contrasts healthy regulation with insulin-resistant physiology. It provides a quick conceptual bridge between controls and observed trend shifts. Use it first before opening pathway-level details.",
    alt: "Healthy versus Type II Diabetes comparison diagram",
    expectedFileName: "Healthy vs. Type II Diabetes.png"
  },
  resistancePathway: {
    id: "resistance-node-insulin-pathway",
    title: "Insulin Pathway",
    sectionId: "resistance",
    triggerType: "nodeClick",
    image: insulinPathwayPng,
    shortExplanation:
      "This diagram traces insulin receptor signaling into downstream uptake pathways. It is useful when GLUT4-related behavior appears weaker in the simulation. Compare it with the resistance chart to explain slower glucose clearance.",
    alt: "Insulin pathway diagram",
    expectedFileName: "Insulin Pathway.png"
  },
  betaIsletTimeline: {
    id: "beta-timeline-islet",
    title: "Pancreatic Islet of Langerhans",
    sectionId: "beta",
    triggerType: "nodeClick",
    image: pancreaticIsletOfLangerhansPng,
    shortExplanation:
      "In the beta progression section, this islet diagram helps explain compensation-to-failure transition. Use it while changing stage to connect declining reserve with weaker insulin response. It anchors the timeline to tissue context.",
    alt: "Pancreatic islet timeline diagram",
    expectedFileName: "Pancreatic Islet of Langerhans.png"
  },
  betaIncretinSecretion: {
    id: "beta-learnmore-incretin-secretion",
    title: "Secretion and Metabolism of GIP and GLP-1 Incretin Hormones",
    sectionId: "beta",
    triggerType: "learnMoreCard",
    image: secretionAndMetabolismOfGipAndGlp1IncretinHormonesPng,
    shortExplanation:
      "This enrichment diagram adds context on incretin secretion and metabolism. It is intentionally optional so core mechanism learning remains clear. Use it after mastering the primary beta progression flow.",
    alt: "Secretion and metabolism of GIP and GLP-1 incretin hormones diagram",
    expectedFileName: "Secretion and Metabolism of GIP and GLP-1 Incretin Hormones.png"
  },
  betaIncretinDualMechanism: {
    id: "beta-learnmore-dual-mechanism",
    title: "Dual Mechanism of Incretin Mimetics in Gut-Brain Signaling",
    sectionId: "beta",
    triggerType: "learnMoreCard",
    image: dualMechanismIncretinMimeticsGutBrainSignalingPng,
    shortExplanation:
      "This supplementary diagram extends into gut-brain signaling mechanisms. It is labeled as enrichment content so it does not compete with the core beta timeline. Open it when you want deeper systems context.",
    alt: "Dual mechanism of incretin mimetics in gut-brain signaling diagram",
    expectedFileName: "Dual Mechanism of Incretin Mimetics in Gut-Brain Signaling.png"
  },
  complicationsEye: {
    id: "complications-organ-eye-retinopathy",
    title: "Diabetic Retinopathy Hallmarks",
    sectionId: "complications",
    triggerType: "organClick",
    image: diabeticRetinopathyHallmarksPng,
    shortExplanation:
      "This diagram highlights hallmark retinal changes associated with chronic glycemic exposure. Use it while adjusting chronic exposure to connect trend behavior with organ-level vulnerability. It is opened from eye interactions in the body map.",
    alt: "Diabetic retinopathy hallmark diagram",
    expectedFileName: "Diabetic Retinopathy Hallmarks.png"
  },
  complicationsNeuro: {
    id: "complications-organ-neuro-control",
    title: "Neuronal Control of Peripheral Insulin Sensitivity and Glucose Metabolism",
    sectionId: "complications",
    triggerType: "organClick",
    image: neuronalControlPeripheralInsulinSensitivityGlucoseMetabolismPng,
    shortExplanation:
      "This diagram supports brain and peripheral nerve exploration in complications. It links neuro-regulatory pathways with glucose and sensitivity patterns. Use it after selecting brain or nerves to connect risk trends with mechanism.",
    alt: "Neuronal control of peripheral insulin sensitivity and glucose metabolism diagram",
    expectedFileName: "Neuronal Control of Peripheral Insulin Sensitivity and Glucose Metabolism.png"
  }
};

export function getDiagram(key: keyof typeof DIAGRAMS) {
  return DIAGRAMS[key];
}
