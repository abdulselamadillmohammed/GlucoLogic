import type { T2DSection, T2DView, T2DZoom } from "../types";

export interface DiagramDescriptor {
  section: T2DSection;
  view: T2DView;
  zoom: T2DZoom;
  file: string;
  hotspotIds: string[];
  subtopics: string[];
}

const makeFile = (section: T2DSection, view: T2DView, zoom: T2DZoom) =>
  `t2d_${section}_${view}_${zoom}.svg`;

const normalOrgan = [
  "t2d-normal-organ-pancreas",
  "t2d-normal-organ-liver",
  "t2d-normal-organ-muscle",
  "t2d-normal-organ-adipose",
  "t2d-normal-organ-blood"
];
const normalTissue = ["t2d-normal-tissue-islet", "t2d-normal-tissue-hepatocyte", "t2d-normal-tissue-myocyte"];
const normalCell = ["t2d-normal-cell-insulin-receptor", "t2d-normal-cell-glut4", "t2d-normal-cell-hepatic-output"];

const resistanceOrgan = [
  "t2d-resistance-organ-adipose",
  "t2d-resistance-organ-liver",
  "t2d-resistance-organ-muscle",
  "t2d-resistance-organ-blood"
];
const resistanceTissue = ["t2d-resistance-tissue-adipose", "t2d-resistance-tissue-liver", "t2d-resistance-tissue-muscle"];
const resistanceCell = ["t2d-resistance-cell-insulin-receptor", "t2d-resistance-cell-glut4", "t2d-resistance-cell-pi3k"];

const betaOrgan = ["t2d-beta-organ-pancreas", "t2d-beta-organ-blood"];
const betaTissue = ["t2d-beta-tissue-islet", "t2d-beta-tissue-beta-cell", "t2d-beta-tissue-amyloid"];
const betaCell = ["t2d-beta-cell-compensation", "t2d-beta-cell-stress", "t2d-beta-cell-failure"];

const compOrgan = [
  "t2d-complications-organ-heart",
  "t2d-complications-organ-kidney",
  "t2d-complications-organ-eye",
  "t2d-complications-organ-nerves",
  "t2d-complications-organ-brain"
];
const compTissue = ["t2d-complications-tissue-endothelium", "t2d-complications-tissue-basement-membrane", "t2d-complications-tissue-neural-fiber"];
const compCell = ["t2d-complications-cell-ros", "t2d-complications-cell-age", "t2d-complications-cell-inflammatory-signal"];

export const diagrams: DiagramDescriptor[] = [
  { section: "normal", view: "anatomy", zoom: "organ", file: makeFile("normal", "anatomy", "organ"), hotspotIds: normalOrgan, subtopics: ["Pancreatic release", "Hepatic suppression", "Peripheral uptake"] },
  { section: "normal", view: "anatomy", zoom: "tissue", file: makeFile("normal", "anatomy", "tissue"), hotspotIds: normalTissue, subtopics: ["Islet", "Liver lobule", "Muscle bundle"] },
  { section: "normal", view: "anatomy", zoom: "cell", file: makeFile("normal", "anatomy", "cell"), hotspotIds: normalCell, subtopics: ["Receptor", "GLUT4", "Hepatic node"] },
  { section: "normal", view: "flow", zoom: "organ", file: makeFile("normal", "flow", "organ"), hotspotIds: normalOrgan, subtopics: ["Meal input", "Insulin transport", "Uptake loop"] },
  { section: "normal", view: "flow", zoom: "tissue", file: makeFile("normal", "flow", "tissue"), hotspotIds: normalTissue, subtopics: ["Islet pulse", "Hepatic switch", "Myocyte uptake"] },
  { section: "normal", view: "flow", zoom: "cell", file: makeFile("normal", "flow", "cell"), hotspotIds: normalCell, subtopics: ["Signal cascade", "GLUT4 trafficking"] },
  { section: "normal", view: "signal", zoom: "organ", file: makeFile("normal", "signal", "organ"), hotspotIds: ["t2d-normal-organ-blood", "t2d-normal-organ-pancreas"], subtopics: ["Glucose curve", "Insulin curve"] },
  { section: "normal", view: "signal", zoom: "tissue", file: makeFile("normal", "signal", "tissue"), hotspotIds: normalTissue, subtopics: ["Tissue uptake timing"] },
  { section: "normal", view: "signal", zoom: "cell", file: makeFile("normal", "signal", "cell"), hotspotIds: normalCell, subtopics: ["Cell response"] },

  { section: "resistance", view: "anatomy", zoom: "organ", file: makeFile("resistance", "anatomy", "organ"), hotspotIds: resistanceOrgan, subtopics: ["Adipose stress", "Liver overproduction", "Muscle uptake loss"] },
  { section: "resistance", view: "anatomy", zoom: "tissue", file: makeFile("resistance", "anatomy", "tissue"), hotspotIds: resistanceTissue, subtopics: ["Inflammatory tissue", "Fat-liver axis"] },
  { section: "resistance", view: "anatomy", zoom: "cell", file: makeFile("resistance", "anatomy", "cell"), hotspotIds: resistanceCell, subtopics: ["Receptor weakening", "GLUT4 deficit"] },
  { section: "resistance", view: "flow", zoom: "organ", file: makeFile("resistance", "flow", "organ"), hotspotIds: resistanceOrgan, subtopics: ["Reduced uptake path"] },
  { section: "resistance", view: "flow", zoom: "tissue", file: makeFile("resistance", "flow", "tissue"), hotspotIds: resistanceTissue, subtopics: ["Inflammation loop"] },
  { section: "resistance", view: "flow", zoom: "cell", file: makeFile("resistance", "flow", "cell"), hotspotIds: resistanceCell, subtopics: ["PI3K-AKT reduction"] },
  { section: "resistance", view: "signal", zoom: "organ", file: makeFile("resistance", "signal", "organ"), hotspotIds: ["t2d-resistance-organ-blood"], subtopics: ["Higher glucose", "Higher insulin"] },
  { section: "resistance", view: "signal", zoom: "tissue", file: makeFile("resistance", "signal", "tissue"), hotspotIds: resistanceTissue, subtopics: ["Tissue signal lag"] },
  { section: "resistance", view: "signal", zoom: "cell", file: makeFile("resistance", "signal", "cell"), hotspotIds: resistanceCell, subtopics: ["Cell signal attenuation"] },

  { section: "beta", view: "anatomy", zoom: "organ", file: makeFile("beta", "anatomy", "organ"), hotspotIds: betaOrgan, subtopics: ["Pancreatic focus"] },
  { section: "beta", view: "anatomy", zoom: "tissue", file: makeFile("beta", "anatomy", "tissue"), hotspotIds: betaTissue, subtopics: ["Islet remodeling"] },
  { section: "beta", view: "anatomy", zoom: "cell", file: makeFile("beta", "anatomy", "cell"), hotspotIds: betaCell, subtopics: ["Compensation path"] },
  { section: "beta", view: "flow", zoom: "organ", file: makeFile("beta", "flow", "organ"), hotspotIds: betaOrgan, subtopics: ["Compensation to decline"] },
  { section: "beta", view: "flow", zoom: "tissue", file: makeFile("beta", "flow", "tissue"), hotspotIds: betaTissue, subtopics: ["Islet stress sequence"] },
  { section: "beta", view: "flow", zoom: "cell", file: makeFile("beta", "flow", "cell"), hotspotIds: betaCell, subtopics: ["Cell stress signal"] },
  { section: "beta", view: "signal", zoom: "organ", file: makeFile("beta", "signal", "organ"), hotspotIds: ["t2d-beta-organ-blood"], subtopics: ["Fasting rise", "Post-meal peak"] },
  { section: "beta", view: "signal", zoom: "tissue", file: makeFile("beta", "signal", "tissue"), hotspotIds: betaTissue, subtopics: ["Islet output trend"] },
  { section: "beta", view: "signal", zoom: "cell", file: makeFile("beta", "signal", "cell"), hotspotIds: betaCell, subtopics: ["Declining secretion"] },

  { section: "complications", view: "anatomy", zoom: "organ", file: makeFile("complications", "anatomy", "organ"), hotspotIds: compOrgan, subtopics: ["Heart", "Kidney", "Eye", "Nerves", "Brain"] },
  { section: "complications", view: "anatomy", zoom: "tissue", file: makeFile("complications", "anatomy", "tissue"), hotspotIds: compTissue, subtopics: ["Endothelium", "Membrane", "Neural tissue"] },
  { section: "complications", view: "anatomy", zoom: "cell", file: makeFile("complications", "anatomy", "cell"), hotspotIds: compCell, subtopics: ["ROS", "AGE", "Inflammation"] },
  { section: "complications", view: "flow", zoom: "organ", file: makeFile("complications", "flow", "organ"), hotspotIds: compOrgan, subtopics: ["Risk propagation"] },
  { section: "complications", view: "flow", zoom: "tissue", file: makeFile("complications", "flow", "tissue"), hotspotIds: compTissue, subtopics: ["Microvascular flow"] },
  { section: "complications", view: "flow", zoom: "cell", file: makeFile("complications", "flow", "cell"), hotspotIds: compCell, subtopics: ["Cell stress route"] },
  { section: "complications", view: "signal", zoom: "organ", file: makeFile("complications", "signal", "organ"), hotspotIds: compOrgan, subtopics: ["Risk bars"] },
  { section: "complications", view: "signal", zoom: "tissue", file: makeFile("complications", "signal", "tissue"), hotspotIds: compTissue, subtopics: ["Tissue risk trend"] },
  { section: "complications", view: "signal", zoom: "cell", file: makeFile("complications", "signal", "cell"), hotspotIds: compCell, subtopics: ["Cell stress score"] }
];

export function getDiagram(section: T2DSection, view: T2DView, zoom: T2DZoom) {
  return diagrams.find((d) => d.section === section && d.view === view && d.zoom === zoom);
}

export function getSectionHotspotUniverse(section: T2DSection) {
  return Array.from(new Set(diagrams.filter((d) => d.section === section).flatMap((d) => d.hotspotIds)));
}

export const sectionOrder: T2DSection[] = ["normal", "resistance", "beta", "complications"];
