import type { ReasoningFeedback } from "../logic/types";

interface ExplanationContent {
  group: string;
  subfactor: string;
  summary: string[];
  prompt: string;
  whyThisMatters: string;
  hints: string[];
}

interface ExplanationPanelProps {
  content: ExplanationContent | null;
  confidence: number;
  feedback: ReasoningFeedback | null;
  onConfidenceChange: (value: number) => void;
  onSubmit: () => void;
}

export function ExplanationPanel({ content, confidence, feedback, onConfidenceChange, onSubmit }: ExplanationPanelProps) {
  return (
    <aside className="reasoning-panel">
      <h2>Explanation Panel</h2>
      {content ? (
        <>
          <p className="eyebrow">
            {content.group} / {content.subfactor}
          </p>
          {content.summary.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="prompt">Reasoning suggestion: {content.prompt}</p>
          <p className="why">Why this matters: {content.whyThisMatters}</p>

          <details>
            <summary>Hint</summary>
            <ol>
              {content.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ol>
          </details>
        </>
      ) : (
        <p>Select a subfactor bubble to open guided explanation and hint ladder.</p>
      )}

      <label className="confidence-wrap">
        Confidence: <strong>{confidence}%</strong>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={confidence}
          onChange={(event) => onConfidenceChange(Number(event.target.value))}
        />
      </label>

      <button type="button" className="submit-btn" onClick={onSubmit}>
        Submit Reasoning
      </button>

      {feedback ? (
        <div className="feedback-box">
          <p>Total score: {feedback.score.totalScore}%</p>
          <p>Group score: {feedback.score.groupScore}%</p>
          <p>Subfactor score: {feedback.score.subfactorScore}%</p>
          <p>Missing groups: {feedback.score.missingGroups.join(", ") || "None"}</p>
          <p>Missing subfactors: {feedback.score.missingSubfactors.join(", ") || "None"}</p>
          <p>Extra groups: {feedback.score.extraGroups.join(", ") || "None"}</p>
          <p>Extra subfactors: {feedback.score.extraSubfactors.join(", ") || "None"}</p>
          <p>
            Calibration: {feedback.calibrationLabel} ({feedback.calibrationDelta > 0 ? "+" : ""}
            {feedback.calibrationDelta})
          </p>
        </div>
      ) : null}
    </aside>
  );
}
