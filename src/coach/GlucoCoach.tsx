import { useEffect, useId, useMemo, useRef, useState } from "react";
import knowledge from "./knowledge.t2d.json";
import { answerQuestion, createCoachState } from "./coachEngine";
import type { ChatMessage, CoachContext, CoachMode, CoachState, KnowledgeBase } from "./types";

interface GlucoCoachProps {
  context: CoachContext;
}

const kb = knowledge as KnowledgeBase;

const MODE_LABEL: Record<CoachMode, string> = {
  explain: "Explain",
  socratic: "Socratic",
  challenge: "Challenge"
};

async function requestCoachProxy(payload: {
  mode: CoachMode;
  action: "respond" | "hint";
  question: string;
  context: CoachContext;
  messages: Array<{ role: "user" | "coach"; text: string }>;
}) {
  const response = await fetch("/api/glucocoach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const body = (await response.json()) as { text?: string; refused?: boolean; error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Proxy request failed.");
  }
  return { text: body.text ?? "I can clarify this after one more control change.", refused: Boolean(body.refused) };
}

export function GlucoCoach({ context }: GlucoCoachProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CoachMode>("explain");
  const [thinking, setThinking] = useState(false);
  const [scopeTooltipOpen, setScopeTooltipOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "hello",
      role: "coach",
      text: "Hi, I'm GlucoCoach. Ask about what you see and I'll explain it using your current simulation state."
    }
  ]);
  const [coachState, setCoachState] = useState<CoachState>(createCoachState());

  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const scopeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const scopeTooltipId = useId();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const root = panelRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"
        )
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!scopeTooltipOpen) return;
    function onWindowClick(event: MouseEvent) {
      if (!scopeButtonRef.current?.contains(event.target as Node)) {
        setScopeTooltipOpen(false);
      }
    }
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, [scopeTooltipOpen]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  function pushMessage(role: "user" | "coach", text: string, nextMode?: CoachMode) {
    setMessages((current) => [
      ...current,
      {
        id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        text,
        mode: nextMode
      }
    ]);
  }

  function toHistory(existing: ChatMessage[]) {
    return existing.map((m) => ({ role: m.role, text: m.text }));
  }

  async function askWithFallback(
    nextMode: CoachMode,
    action: "respond" | "hint",
    question: string,
    history: Array<{ role: "user" | "coach"; text: string }>
  ) {
    try {
      return await requestCoachProxy({
        mode: nextMode,
        action,
        question,
        context,
        messages: history
      });
    } catch {
      const fallback = answerQuestion(nextMode, question, context, coachState, kb, action);
      setCoachState(fallback.state);
      return { text: fallback.answer.text, refused: fallback.answer.refused };
    }
  }

  async function send(nextMode: CoachMode) {
    const userText = input.trim();
    const userPayload = userText || `[${MODE_LABEL[nextMode]} in ${context.currentSectionId}]`;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: "user",
      text: userPayload,
      mode: nextMode
    };
    setMessages((current) => [...current, userMessage]);
    setThinking(true);

    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 620);
    });

    const history = [...toHistory(messages), { role: "user" as const, text: userPayload }];
    const result = await askWithFallback(nextMode, "respond", userText, history);
    pushMessage("coach", result.text, nextMode);

    setThinking(false);
    setInput("");
  }

  async function requestHint() {
    if (mode !== "socratic") return;
    const hintPrompt = input.trim() || "Need a hint for this current state.";
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: "user",
      text: "Hint please",
      mode
    };
    setMessages((current) => [...current, userMessage]);
    setThinking(true);

    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 540);
    });

    const history = [...toHistory(messages), { role: "user" as const, text: "Hint please" }];
    const result = await askWithFallback(mode, "hint", hintPrompt, history);
    pushMessage("coach", result.text, mode);
    setThinking(false);
  }

  const scopeTooltipText = useMemo(
    () =>
      "Allowed topics: normal regulation, insulin resistance, beta-cell progression, complications, and glossary terms. Out of scope: I can only help with Type 2 Diabetes physiology concepts inside this module.",
    []
  );

  return (
    <>
      <button
        type="button"
        className="focus-ring fixed bottom-5 right-5 z-40 rounded-full border border-[#7ad1f0] bg-white px-4 py-3 text-sm font-semibold text-[#2E3A8C] shadow-[0_14px_30px_rgba(15,23,42,0.14)] transition hover:-translate-y-[1px]"
        onClick={() => setOpen(true)}
      >
        GlucoCoach
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/20">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute bottom-0 right-0 h-[min(88vh,720px)] w-[min(470px,100vw)] rounded-t-2xl border border-[#d9e8f4] bg-[rgba(255,255,255,0.95)] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:bottom-4 sm:right-4 sm:rounded-2xl"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cfe5f6] bg-[#eef8ff] text-sm font-semibold text-[#2E3A8C]">
                  GC
                </div>
                <div>
                  <h2 id={titleId} className="m-0 text-lg font-semibold text-[#2E3A8C]">GlucoCoach</h2>
                  <p className="m-0 text-xs text-[#64748B]">AI physiology tutor (scoped)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    ref={scopeButtonRef}
                    type="button"
                    aria-describedby={scopeTooltipOpen ? scopeTooltipId : undefined}
                    className="focus-ring rounded-full border border-[#bfddf1] bg-[#f3f9ff] px-2 py-1 text-xs font-semibold text-[#2E3A8C]"
                    onClick={(event) => {
                      event.stopPropagation();
                      setScopeTooltipOpen((value) => !value);
                    }}
                  >
                    Scoped
                  </button>
                  {scopeTooltipOpen ? (
                    <div
                      id={scopeTooltipId}
                      role="tooltip"
                      className="absolute right-0 top-8 w-64 rounded-xl border border-[#d6e6f3] bg-white p-2 text-xs text-[#334155] shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
                    >
                      {scopeTooltipText}
                    </div>
                  ) : null}
                </div>
                <button type="button" className="focus-ring soft-btn" onClick={() => setOpen(false)}>Close</button>
              </div>
            </div>

            <div ref={listRef} className="mt-3 h-[44vh] overflow-y-auto rounded-xl border border-[#d7e6f3] bg-white p-3">
              {messages.map((message) => (
                <div key={message.id} className={`mb-2 flex ${message.role === "coach" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${message.role === "coach" ? "bg-[#eef7ff] text-[#1f3350]" : "bg-[#0FB9B1] text-white"}`}>
                    {message.text.split("\n").map((line) => (
                      <p key={line} className="m-0 mb-1 last:mb-0">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {thinking ? (
                <div className="mb-2 flex justify-start">
                  <div className="max-w-[90%] rounded-xl bg-[#eef7ff] px-3 py-2 text-sm text-[#1f3350]">
                    GlucoCoach is thinking
                    <span className="inline-block animate-pulse">...</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(["explain", "socratic", "challenge"] as CoachMode[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`focus-ring soft-btn ${mode === value ? "primary" : ""}`}
                  onClick={() => setMode(value)}
                >
                  {MODE_LABEL[value]}
                </button>
              ))}
              {mode === "socratic" ? (
                <button type="button" className="focus-ring soft-btn" disabled={thinking} onClick={() => void requestHint()}>
                  Hint
                </button>
              ) : null}
              <button
                type="button"
                className="focus-ring soft-btn warn"
                onClick={() => {
                  setMessages([
                    {
                      id: "hello-reset",
                      role: "coach",
                      text: "Reset complete. Ask about the current simulation and I'll reason through it with you."
                    }
                  ]);
                  setCoachState(createCoachState());
                }}
              >
                Reset chat
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                ref={inputRef}
                className="focus-ring flex-1 rounded-xl border border-[#cde0ef] bg-white px-3 py-2 text-sm text-[#0F172A]"
                placeholder="Ask about what you see here..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !thinking) {
                    void send(mode);
                  }
                }}
              />
              <button type="button" className="focus-ring soft-btn primary" disabled={thinking} onClick={() => void send(mode)}>
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
