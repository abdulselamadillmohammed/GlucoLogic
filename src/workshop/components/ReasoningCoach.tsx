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
  stop: () => void;
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

  const hint = useMemo(() => {
    if (!selectedSubfactor) return "Select a subfactor bubble to view explanation and hints.";
    const target = caseEntry.learningTargets.find((item) => item.subfactor === selectedSubfactor);
    return target?.goal ?? "Not stated in dataset";
  }, [caseEntry, selectedSubfactor]);

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
      onReasoningText(`${reasoningText}${reasoningText ? " " : ""}${transcript}`.trim());
    };
    recognizer.onend = () => setListening(false);
    setListening(true);
    recognizer.start();
  };

  return (
    <section className="glass coach-card">
      <h3>Reasoning Coach</h3>
      <p>{hint}</p>
      {selectedSubfactor ? <small>Focused subfactor: {SUBFACTOR_LABELS[selectedSubfactor]}</small> : null}
      <label>
        <span>Your reasoning</span>
        <textarea
          value={reasoningText}
          onChange={(event) => onReasoningText(event.target.value)}
          placeholder="Type your clinical justification here..."
        />
      </label>
      <button type="button" className={listening ? "listening" : ""} onClick={startSpeech} disabled={unsupported}>
        Add speech-to-text
      </button>
      {unsupported ? <small>Speech recognition is not supported in this browser.</small> : null}
    </section>
  );
}
