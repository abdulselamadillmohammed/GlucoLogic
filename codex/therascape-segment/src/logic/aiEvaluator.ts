type CoachChatInput = {
  caseTitle: string;
  userMessage: string;
  selectedGroups: string[];
  selectedSubfactors: string[];
  selectedMeds: string[];
  reasoningNote: string;
  confidence: number;
  comparisonSummary?: string;
  chatHistory: Array<{ role: "assistant" | "user"; text: string }>;
};

type FastApiResponse = {
  reply?: string;
  detail?: string;
  error?: string;
};

function getBackendBaseUrl() {
  return (import.meta.env.VITE_FASTAPI_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

export async function getCoachChatReply(input: CoachChatInput): Promise<string> {
  const enabled = import.meta.env.VITE_ENABLE_GEMINI_CHAT !== "false";
  if (!enabled) {
    return "Skipped: VITE_ENABLE_GEMINI_CHAT=false.";
  }

  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}/reasoning-chat/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        case_title: input.caseTitle,
        user_message: input.userMessage,
        selected_groups: input.selectedGroups,
        selected_subfactors: input.selectedSubfactors,
        selected_meds: input.selectedMeds,
        reasoning_note: input.reasoningNote,
        confidence: input.confidence,
        comparison_summary: input.comparisonSummary ?? "",
        chat_history: input.chatHistory
      })
    });

    const data = (await response.json()) as FastApiResponse;

    if (!response.ok) {
      if (response.status === 429) {
        return "Backend unavailable: Gemini returned 429 (rate limit or insufficient quota).";
      }
      if (response.status === 404) {
        return `Backend unavailable: endpoint not found at ${url}`;
      }
      return `Backend unavailable (${response.status}): ${
        data.detail || data.error || "Request failed."
      }`;
    }

    return data.reply || "Backend returned no reply text.";
  } catch {
    return `Backend unavailable: could not reach ${url}.`;
  }
}
