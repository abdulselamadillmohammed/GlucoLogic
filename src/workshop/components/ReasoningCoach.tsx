import { useMemo, useState } from "react";
import { SUBFACTOR_LABELS } from "../logic/subfactors";
import type { CaseEntry, Subfactor } from "../logic/types";

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface Props {
  selectedSubfactor: Subfactor | null;
  reasoningText: string;
  onReasoningText: (text: string) => void;
  caseEntry: CaseEntry;
}

export function ReasoningCoach({ selectedSubfactor, reasoningText, onReasoningText, caseEntry }: Props) {
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  const focusedTarget = useMemo(() => {
    if (!selectedSubfactor) return null;
    return caseEntry.learningTargets.find((item) => item.subfactor === selectedSubfactor) ?? null;
  }, [caseEntry.learningTargets, selectedSubfactor]);

  const datasetNote = selectedSubfactor && !focusedTarget ? "Not stated in dataset." : null;

  const startSpeech = () => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setUnsupported(true);
      return;
    }

    setUnsupported(false);
    const recognizer = new Ctor();
    recognizer.lang = "en-US";
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0]?.transcript ?? "";
      const merged = `${reasoningText}${reasoningText ? " " : ""}${transcript}`.trim();
      onReasoningText(merged);
    };
    recognizer.onend = () => setListening(false);

    setListening(true);
    recognizer.start();
  };

  return (
    <section className="glass coach-card">
      <header className="panel-header coach-header">
        <h3>Reasoning Coach</h3>
        <p>Select a subfactor bubble to view explanation and hints.</p>
      </header>

      <div className="coach-meta">
        <p>
          <span className="meta-label">Focused subfactor:</span>{" "}
          {selectedSubfactor ? SUBFACTOR_LABELS[selectedSubfactor] : "None selected"}
        </p>
        {focusedTarget ? (
          <p>
            <span className="meta-label">Hint:</span> {focusedTarget.goal}
          </p>
        ) : null}
        {datasetNote ? (
          <p>
            <span className="meta-label">Dataset notes:</span> {datasetNote}
          </p>
        ) : null}
      </div>

      <label className="field-label">
        <span>Your reasoning</span>
        <textarea
          value={reasoningText}
          onChange={(event) => onReasoningText(event.target.value)}
          placeholder="Type your clinical justification here..."
        />
      </label>

      <div className="speech-row">
        <button type="button" className={`speech-btn ${listening ? "listening" : ""}`} onClick={startSpeech} disabled={unsupported}>
          <span className="mic-dot" />
          {listening ? "Listening..." : "Speech to text"}
        </button>
        {unsupported ? <small>Speech recognition is not supported in this browser.</small> : null}
      </div>
    </section>
  );
}
