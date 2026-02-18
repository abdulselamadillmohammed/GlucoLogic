import { useEffect } from "react";
import type { ExplanationData } from "../logic/types";

type JournalModalProps = {
  open: boolean;
  explanation: ExplanationData | null;
  onClose: () => void;
};

export function JournalModal({ open, explanation, onClose }: JournalModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !explanation) {
    return null;
  }

  return (
    <div className="journal-overlay" role="dialog" aria-modal="true" aria-label="Subfactor explanation">
      <button type="button" className="journal-backdrop" aria-label="Close" onClick={onClose} />

      <section className="journal-modal">
        <button type="button" className="journal-close" onClick={onClose} aria-label="Close">
          x
        </button>

        <article className="journal-paper">
          <h3>{explanation.title}</h3>
          <p>{explanation.whyItMatters}</p>
          <p>Prompt: {explanation.suggestionPrompt}</p>
          {explanation.note ? <p>Clinical note: {explanation.note}</p> : null}

          <h4>Hints</h4>
          {explanation.hints.slice(0, 3).map((hint) => (
            <p key={hint}>{hint}</p>
          ))}
        </article>
      </section>
    </div>
  );
}
