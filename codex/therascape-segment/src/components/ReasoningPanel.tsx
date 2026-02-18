import { useMemo, useState } from "react";
import type { FeedbackResult } from "../logic/types";

type ReasoningPanelProps = {
  options: string[];
  expectedCount: number;
  onSubmit: (selectedNodes: string[], confidence: number) => void;
  feedback: FeedbackResult | null;
};

export function ReasoningPanel({
  options,
  expectedCount,
  onSubmit,
  feedback
}: ReasoningPanelProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(50);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (node: string) => {
    setSelected((prev) =>
      prev.includes(node) ? prev.filter((item) => item !== node) : [...prev, node]
    );
  };

  return (
    <aside className="reasoning-panel">
      <h3>Reasoning Justification</h3>
      <p className="subtext">Select drivers behind your treatment choice.</p>

      <div className="node-list">
        {options.map((node) => (
          <label key={node} className="node-item">
            <input
              type="checkbox"
              checked={selectedSet.has(node)}
              onChange={() => toggle(node)}
            />
            {node}
          </label>
        ))}
      </div>

      <label className="slider-label" htmlFor="confidence">
        Confidence: {confidence}
      </label>
      <input
        id="confidence"
        type="range"
        min={0}
        max={100}
        value={confidence}
        onChange={(event) => setConfidence(Number(event.target.value))}
      />

      <button type="button" className="submit-btn" onClick={() => onSubmit(selected, confidence)}>
        Submit Reasoning
      </button>

      {feedback ? (
        <section className="feedback">
          <h4>Feedback</h4>
          <p>Correctness: {feedback.totalScore}%</p>
          <p>Node Match: {feedback.nodeScore}%</p>
          <p>Medication Match: {feedback.medScore}%</p>
          <p>Calibration: {feedback.calibration}</p>
          <p>Expected Nodes: {expectedCount}</p>
          <p>Missing Nodes: {feedback.missingNodes.join(", ") || "None"}</p>
          <p>Extra Nodes: {feedback.extraNodes.join(", ") || "None"}</p>
        </section>
      ) : null}
    </aside>
  );
}
