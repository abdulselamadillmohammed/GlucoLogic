import type { Edge, Node } from "reactflow";

export const betaNodes: Node[] = [
  { id: "load", position: { x: 20, y: 120 }, data: { label: "Insulin resistance load" }, style: { background: "#2b1834", color: "#fbe4ff", border: "1px solid #f472b6" } },
  { id: "comp", position: { x: 220, y: 70 }, data: { label: "Compensation phase" }, style: { background: "#173949", color: "#d9f5ff", border: "1px solid #67e8f9" } },
  { id: "decline", position: { x: 220, y: 185 }, data: { label: "Beta-cell decline" }, style: { background: "#3c1d2f", color: "#ffe5ee", border: "1px solid #fb7185" } },
  { id: "state", position: { x: 440, y: 120 }, data: { label: "Prediabetes -> Overt T2D" }, style: { background: "#261e44", color: "#dbeafe", border: "1px solid #93c5fd" } }
];

export const betaEdges: Edge[] = [
  { id: "be1", source: "load", target: "comp" },
  { id: "be2", source: "load", target: "decline", style: { stroke: "#fb7185" } },
  { id: "be3", source: "comp", target: "state" },
  { id: "be4", source: "decline", target: "state", style: { stroke: "#fb7185" } }
];
