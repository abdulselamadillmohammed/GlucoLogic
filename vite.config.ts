import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

type CoachMode = "explain" | "socratic" | "challenge";
type CoachAction = "respond" | "hint";

interface CoachRequestBody {
  mode: CoachMode;
  action: CoachAction;
  question: string;
  context: {
    currentSectionId: string;
    currentOrganId?: string | null;
    sliders: Record<string, number>;
    outputs: Record<string, unknown>;
    lastAction?: string;
  };
  messages: Array<{ role: "user" | "coach"; text: string }>;
}

const refusalMessage = "Out of scope: I can only help with Type 2 Diabetes physiology concepts inside this module.";
const outOfScopePatterns = [
  /\b(type\s*1|t1d)\b/i,
  /\bdiagnos(e|is|ing)|am i diabetic|should i worry\b/i,
  /\bmedication|drug dose|prescription|insulin units|metformin|ozempic|sulfonylurea\b/i,
  /\bmeal plan|diet plan|calories|supplements|workout plan\b/i,
  /\bmy lab|my blood sugar|my symptoms|for me personally|personal advice\b/i,
  /\bcancer|asthma|thyroid|pregnancy|covid|infection treatment\b/i
];

function outOfScope(question: string) {
  return outOfScopePatterns.some((pattern) => pattern.test(question));
}

async function readJsonBody(req: NodeJS.ReadableStream): Promise<CoachRequestBody> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as CoachRequestBody;
}

function modeInstruction(mode: CoachMode, action: CoachAction) {
  if (mode === "challenge") {
    return "Return exactly 3 lines: 1 mini goal, 1 success condition, 1 observation cue.";
  }
  if (mode === "socratic" && action === "hint") {
    return "Return exactly 1 line starting with 'Hint:' and make it progressively specific based on prior hints in messages.";
  }
  if (mode === "socratic") {
    return "Return 2 lines max: 1 short explanation line and 1 guiding question.";
  }
  return "Return 4-7 short lines using this format: 'What it means here:' then 'In your simulation right now:' with 2-4 grounded lines using context values. Optionally add one 'Try this:' line.";
}

function extractOutputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string" && payload.output_text.trim().length > 0) return payload.output_text;

  const output = Array.isArray(payload.output) ? payload.output : [];
  const parts: string[] = [];
  for (const item of output as Array<Record<string, unknown>>) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const chunk of content as Array<Record<string, unknown>>) {
      if (chunk.type === "output_text" && typeof chunk.text === "string") parts.push(chunk.text);
    }
  }
  return parts.join("\n").trim();
}

function glucoCoachProxy(): Plugin {
  const handle = async (req: any, res: any) => {
    if (req.url !== "/api/glucocoach" || req.method !== "POST") return false;

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "OPENAI_API_KEY is not set in this module environment." }));
        return true;
      }

      const body = await readJsonBody(req);
      const question = body.question.trim();

      if (outOfScope(question)) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ text: refusalMessage, refused: true }));
        return true;
      }

      const model = process.env.GLUCOCOACH_MODEL || "gpt-4.1-mini";
      const systemPrompt = [
        "You are GlucoCoach, a concise tutor for a Type 2 Diabetes physiology learning module.",
        "Scope: normal regulation, insulin resistance, beta-cell compensation/failure, and complications (heart/kidney/eye/nerves/brain).",
        "Never give medication recommendations, diagnosis, or personal medical advice.",
        `If out of scope, reply exactly: ${refusalMessage}`,
        "Ground explanations in provided simulation context values and use cause-effect reasoning.",
        modeInstruction(body.mode, body.action)
      ].join("\n");

      const contextBlock = JSON.stringify(body.context);
      const recentMessages = body.messages.slice(-8).map((m) => `${m.role}: ${m.text}`).join("\n");
      const userPrompt = [
        `Mode: ${body.mode}`,
        `Action: ${body.action}`,
        `Current question: ${question || "(no explicit question, infer from mode + context)"}`,
        `Simulation context: ${contextBlock}`,
        `Recent chat:\n${recentMessages}`
      ].join("\n\n");

      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          input: [
            { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
            { role: "user", content: [{ type: "input_text", text: userPrompt }] }
          ]
        })
      });

      const payload = (await upstream.json()) as Record<string, unknown>;
      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: String(payload.error ?? "OpenAI request failed.") }));
        return true;
      }

      const text = extractOutputText(payload);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ text: text || "I can clarify this if you adjust one control and ask again.", refused: false }));
      return true;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected proxy error." }));
      return true;
    }
  };

  return {
    name: "glucocoach-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handle(req, res).then((handled) => {
          if (!handled) next();
        });
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handle(req, res).then((handled) => {
          if (!handled) next();
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), glucoCoachProxy()]
});
