import { useState } from "react";
import { chatReply } from "../logic/chatbot";
import { evaluateReasoning } from "../logic/comparator";
import type { CaseEntry, DrugEntry, DrugsDataset, SourceIndexEntry } from "../logic/types";

interface Props {
  drugs: DrugsDataset;
  selectedCase: CaseEntry;
  selectedDrug: DrugEntry | null;
  reasoningText: string;
  sourceIndex: SourceIndexEntry[];
}

export function GlucoCoachChat({ drugs, selectedCase, selectedDrug, reasoningText, sourceIndex }: Props) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<string[]>([
    "Reasoning coach ready for '[object Object]'. Ask a question to get scored feedback."
  ]);

  const send = () => {
    const response = chatReply(message, drugs, selectedCase);
    setConversation((prev) => [...prev, `You: ${message}`, `GlucoCoach: ${response}`]);
    setMessage("");
  };

  const evaluate = () => {
    const result = evaluateReasoning(selectedCase, selectedDrug, reasoningText, sourceIndex);
    const bullets = result.bullets.length ? result.bullets.map((item) => `• ${item}`).join(" ") : "• Not stated in dataset.";
    const sources = result.citedSourceIds.join(", ");
    setConversation((prev) => [
      ...prev,
      `Evaluation: ${result.verdict} (${result.score}%). ${bullets} Sources: ${sources}`
    ]);
  };

  return (
    <section className="glass chatbot-card">
      <h3>Feedback chatbot</h3>
      <p>Send any message to evaluate your current reasoning and get coaching in one step.</p>
      <div className="chat-log">
        {conversation.slice(-6).map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
      <div className="chat-row">
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask: What should I improve next?" />
        <button type="button" onClick={send}>
          Send
        </button>
      </div>
      <button type="button" className="evaluate-btn" onClick={evaluate}>
        Evaluate reasoning
      </button>
    </section>
  );
}
