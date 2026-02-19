import { useState } from "react";
import type { ChatMessage, ReasoningComparatorResult, ReasoningScore } from "../logic/types";

type ExplanationPanelProps = {
  explanation: {
    title: string;
    whyItMatters: string;
    suggestionPrompt: string;
    hints: string[];
    note?: string;
  } | null;
  noteText: string;
  onNoteTextChange: (value: string) => void;
  onSpeechToText: () => void;
  onEvaluate: () => void;
  score: ReasoningScore | null;
  comparison: ReasoningComparatorResult | null;
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onChatSend: () => void;
  chatSending: boolean;
};

export function ExplanationPanel({
  explanation,
  noteText,
  onNoteTextChange,
  onSpeechToText,
  onEvaluate,
  score,
  comparison,
  chatMessages,
  chatInput,
  onChatInputChange,
  onChatSend,
  chatSending
}: ExplanationPanelProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <aside className="reasoning-panel">
      <h3>Reasoning Coach</h3>

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

      <section className="feedback-chatbot">
        <h4>Feedback chatbot</h4>
        <p className="subtext">
          Send any message to evaluate your current reasoning and get coaching in one step.
        </p>

        <div className="chat-log" aria-live="polite">
          {chatMessages.map((message) => (
            <p key={message.id} className={`chat-message ${message.role}`}>
              {message.text}
            </p>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            type="text"
            value={chatInput}
            onChange={(event) => onChatInputChange(event.target.value)}
            disabled={chatSending}
            placeholder="Ask: What should I improve next?"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !chatSending) {
                event.preventDefault();
                onChatSend();
              }
            }}
          />
          <button type="button" className="ghost-btn" onClick={onChatSend} disabled={chatSending}>
            {chatSending ? "Analyzing..." : "Send"}
          </button>
        </div>
      </section>

      <button type="button" className="submit-btn" onClick={onSpeechToText}>
        Add speech-to-text
      </button>
      <button type="button" className="submit-btn secondary" onClick={onEvaluate}>
        Evaluate reasoning
      </button>

      {score ? (
        <section className="feedback">
          <h4>Latest Scoring Snapshot</h4>
          <p>Total: {score.totalScore}%</p>
          <p>Groups: {score.groupScore}%</p>
          <p>Subfactors: {score.subfactorScore}%</p>
          <p>Missing Groups: {score.missingGroups.join(", ") || "None"}</p>
          <p>Missing Subfactors: {score.missingSubfactors.join(", ") || "None"}</p>
          <p>Extra Groups: {score.extraGroups.join(", ") || "None"}</p>
          <p>Extra Subfactors: {score.extraSubfactors.join(", ") || "None"}</p>
          {comparison ? (
            <p>
              Calibration: {comparison.calibrationLevel.replace("-", " ")} (gap {comparison.calibrationGap}%)
            </p>
          ) : null}

          {comparison ? (
            <details className="trace-panel">
              <summary>Why this feedback?</summary>
              <ul>
                {comparison.ruleTraces.map((trace) => (
                  <li key={trace}>{trace}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}
    </aside>
  );
}
