import { useState } from "react";
import type { ExplanationData, ReasoningScore } from "../logic/types";

type ExplanationPanelProps = {
  explanation: ExplanationData | null;
  noteText: string;
  onNoteTextChange: (value: string) => void;
  onSpeechToText: () => void;
  onEvaluate: () => void;
  score: ReasoningScore | null;
};

export function ExplanationPanel({
  explanation,
  noteText,
  onNoteTextChange,
  onSpeechToText,
  onEvaluate,
  score
}: ExplanationPanelProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <aside className="reasoning-panel">
      <h3>Reasoning Justification</h3>

      {explanation ? (
        <>
          <h4>{explanation.title}</h4>
          <p>{explanation.whyItMatters}</p>
          <p className="prompt">Prompt: {explanation.suggestionPrompt}</p>
          {explanation.note ? <p className="flag-note">Clinical note: {explanation.note}</p> : null}

          <button type="button" className="hint-toggle" onClick={() => setShowHints((v) => !v)}>
            Hint {showHints ? "-" : "+"}
          </button>

          {showHints ? (
            <div className="hint-list">
              {explanation.hints.slice(0, 3).map((hint) => (
                <p key={hint}>{hint}</p>
              ))}
            </div>
          ) : null}

          <p className="one-liner">Why this matters: {explanation.whyItMatters}</p>
        </>
      ) : (
        <p className="subtext">Select a subfactor bubble to view explanation and hints.</p>
      )}

      <label htmlFor="reasoning-note">Your reasoning</label>
      <textarea
        id="reasoning-note"
        value={noteText}
        onChange={(event) => onNoteTextChange(event.target.value)}
        rows={6}
        placeholder="Type your clinical justification here..."
      />

      <button type="button" className="submit-btn" onClick={onSpeechToText}>
        Add speech-to-text
      </button>
      <button type="button" className="submit-btn secondary" onClick={onEvaluate}>
        Evaluate reasoning
      </button>

      {score ? (
        <section className="feedback">
          <h4>Feedback</h4>
          <p>Total: {score.totalScore}%</p>
          <p>Groups: {score.groupScore}%</p>
          <p>Subfactors: {score.subfactorScore}%</p>
          <p>Missing Groups: {score.missingGroups.join(", ") || "None"}</p>
          <p>Missing Subfactors: {score.missingSubfactors.join(", ") || "None"}</p>
          <p>Extra Groups: {score.extraGroups.join(", ") || "None"}</p>
          <p>Extra Subfactors: {score.extraSubfactors.join(", ") || "None"}</p>
        </section>
      ) : null}
    </aside>
  );
}
