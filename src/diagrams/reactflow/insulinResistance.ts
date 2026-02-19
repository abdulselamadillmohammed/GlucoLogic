import type { Edge, Node } from "reactflow";

export const resistanceNodes: Node[] = [
  { id: "stress", position: { x: 20, y: 120 }, data: { label: "Visceral fat / inflammation / FFA" }, style: { background: "#2b1834", color: "#fbe4ff", border: "1px solid #f472b6" } },
  { id: "ir", position: { x: 225, y: 120 }, data: { label: "Insulin receptor signaling" }, style: { background: "#261e44", color: "#dbeafe", border: "1px solid #93c5fd" } },
  { id: "glut4", position: { x: 430, y: 120 }, data: { label: "GLUT4 translocation" }, style: { background: "#132a3f", color: "#d9f5ff", border: "1px solid #65f0ff" } },
  { id: "uptake", position: { x: 430, y: 220 }, data: { label: "Peripheral glucose uptake" }, style: { background: "#132a3f", color: "#d9f5ff", border: "1px solid #65f0ff" } }
];

export const resistanceEdges: Edge[] = [
  { id: "re1", source: "stress", target: "ir", style: { stroke: "#f472b6" } },
  { id: "re2", source: "ir", target: "glut4" },
  { id: "re3", source: "glut4", target: "uptake" }
];
