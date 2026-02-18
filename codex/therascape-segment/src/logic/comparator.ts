import type { NodeComparison } from "./types";

export function compareReasoningNodes(
  selectedNodes: string[],
  expectedNodes: string[]
): NodeComparison {
  const selected = new Set(selectedNodes);
  const expected = new Set(expectedNodes);

  const matchedNodes = [...selected].filter((node) => expected.has(node));
  const missingNodes = [...expected].filter((node) => !selected.has(node));
  const extraNodes = [...selected].filter((node) => !expected.has(node));

  return {
    matchedNodes,
    missingNodes,
    extraNodes
  };
}
