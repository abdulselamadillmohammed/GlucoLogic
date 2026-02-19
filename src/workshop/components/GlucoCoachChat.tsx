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

type MessageRole = "coach" | "user" | "system";
interface Message {
  role: MessageRole;
  text: string;
}

export function GlucoCoachChat({ drugs, selectedCase, selectedDrug, reasoningText, sourceIndex }: Props) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Message[]>([
    { role: "coach", text: "Reasoning coach ready. Ask a question to get scored feedback." }
  ]);

  const send = () => {
    if (!message.trim()) return;
    const response = chatReply(message, drugs, selectedCase);
    setConversation((prev) => [...prev, { role: "user", text: message }, { role: "coach", text: response }]);
    setMessage("");
  };

  const evaluate = () => {
    const result = evaluateReasoning(selectedCase, selectedDrug, reasoningText, sourceIndex);
    const bullets = result.bullets.length ? result.bullets.map((item) => `- ${item}`).join(" ") : "- Not stated in dataset.";
    const sources = result.citedSourceIds.join(", ");
    setConversation((prev) => [
      ...prev,
      { role: "system", text: `Evaluation: ${result.verdict} (${result.score}%). ${bullets} Sources: ${sources}` }
    ]);
  };

  return (
    <section className="glass chatbot-card">
      <header className="panel-header chatbot-header">
        <h3>Feedback chatbot</h3>
        <p>Send any message to evaluate your current reasoning and get coaching in one step.</p>
      </header>

      <div className="chat-log">
        {conversation.slice(-10).map((item, index) => (
          <div key={`${item.text}-${index}`} className={`chat-message ${item.role}`}>
            <span className="avatar-dot" />
            <p>{item.text}</p>
          </div>
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
