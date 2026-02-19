import type { Edge, Node } from "reactflow";

export const complicationsNodes: Node[] = [
  { id: "hyper", position: { x: 20, y: 120 }, data: { label: "Chronic hyperglycemia" }, style: { background: "#3a1f2f", color: "#ffe5ee", border: "1px solid #fb7185" } },
  { id: "vascular", position: { x: 230, y: 120 }, data: { label: "Endothelial + metabolic stress" }, style: { background: "#26203f", color: "#e0e7ff", border: "1px solid #a5b4fc" } },
  { id: "organs", position: { x: 450, y: 120 }, data: { label: "Heart / Kidney / Eye / Nerve / Brain" }, style: { background: "#132a3f", color: "#d9f5ff", border: "1px solid #65f0ff" } }
];

export const complicationsEdges: Edge[] = [
  { id: "ce1", source: "hyper", target: "vascular", style: { stroke: "#fb7185" } },
  { id: "ce2", source: "vascular", target: "organs" }
];
