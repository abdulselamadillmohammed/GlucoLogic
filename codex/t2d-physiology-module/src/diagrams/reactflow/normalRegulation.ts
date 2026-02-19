import type { Edge, Node } from "reactflow";

export const normalNodes: Node[] = [
  { id: "meal", position: { x: 30, y: 120 }, data: { label: "Meal input" }, style: { background: "#10233b", color: "#d9f5ff", border: "1px solid #4dd3ff" } },
  { id: "blood", position: { x: 210, y: 120 }, data: { label: "Blood glucose" }, style: { background: "#112b44", color: "#d9f5ff", border: "1px solid #4dd3ff" } },
  { id: "pancreas", position: { x: 220, y: 20 }, data: { label: "Pancreas insulin release" }, style: { background: "#132a3f", color: "#d9f5ff", border: "1px solid #65f0ff" } },
  { id: "liver", position: { x: 410, y: 45 }, data: { label: "Liver output suppression" }, style: { background: "#132a3f", color: "#d9f5ff", border: "1px solid #65f0ff" } },
  { id: "muscle", position: { x: 410, y: 185 }, data: { label: "Muscle uptake" }, style: { background: "#132a3f", color: "#d9f5ff", border: "1px solid #65f0ff" } }
];

export const normalEdges: Edge[] = [
  { id: "e1", source: "meal", target: "blood" },
  { id: "e2", source: "blood", target: "pancreas" },
  { id: "e3", source: "pancreas", target: "liver" },
  { id: "e4", source: "pancreas", target: "muscle" },
  { id: "e5", source: "liver", target: "blood" },
  { id: "e6", source: "muscle", target: "blood" }
];
