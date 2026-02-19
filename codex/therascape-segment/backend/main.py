from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable

import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="GlucoLogic Reasoning Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatHistoryItem(BaseModel):
    role: str = Field(pattern="^(assistant|user)$")
    text: str


class ReasoningChatRequest(BaseModel):
    case_title: str
    user_message: str
    selected_groups: list[str] = []
    selected_subfactors: list[str] = []
    selected_meds: list[str] = []
    reasoning_note: str = ""
    confidence: int = 0
    comparison_summary: str = ""
    chat_history: list[ChatHistoryItem] = []


class ReasoningChatResponse(BaseModel):
    reply: str


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"").strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def _bootstrap_env() -> None:
    backend_dir = Path(__file__).resolve().parent
    _load_env_file(backend_dir / ".env")
    _load_env_file(backend_dir.parent / ".env")


def _get_api_key() -> str:
    return os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY") or ""


def _get_model_candidates() -> list[str]:
    configured = os.getenv("GEMINI_MODEL") or os.getenv("VITE_GEMINI_MODEL")
    candidates = [
        configured,
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
    ]

    unique: list[str] = []
    for candidate in candidates:
        if candidate and candidate not in unique:
            unique.append(candidate)
    return unique


def _response_text(response: object) -> str:
    text = getattr(response, "text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()

    candidates = getattr(response, "candidates", None)
    if not candidates:
        return ""

    parts: list[str] = []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        for part in getattr(content, "parts", []) or []:
            part_text = getattr(part, "text", None)
            if isinstance(part_text, str) and part_text.strip():
                parts.append(part_text.strip())

    return "\n".join(parts).strip()


def _build_prompt(payload: ReasoningChatRequest) -> str:
    recent_history = payload.chat_history[-6:]
    history_block = (
        "\n".join(f"{item.role.upper()}: {item.text}" for item in recent_history)
        if recent_history
        else "No prior messages."
    )

    return "\n".join(
        [
            "You are a concise educational feedback chatbot for a mock therapeutic-reasoning app.",
            "Do not provide medical advice and do not assert real-world clinical claims.",
            "Use only supplied context and keep responses to 2-5 short sentences.",
            f"Case: {payload.case_title}",
            f"Selected reasoning groups: {', '.join(payload.selected_groups) or 'None'}",
            f"Selected subfactors: {', '.join(payload.selected_subfactors) or 'None'}",
            f"Selected meds: {', '.join(payload.selected_meds) or 'None'}",
            f"Learner note: {payload.reasoning_note or 'No note provided'}",
            f"Confidence: {payload.confidence}%",
            f"Current scoring snapshot: {payload.comparison_summary or 'No scoring snapshot yet.'}",
            f"Recent chat:\n{history_block}",
            f"New user message: {payload.user_message}",
            "Return only assistant reply text.",
        ]
    )


def _generate_with_gemini(prompt: str, models: Iterable[str]) -> str:
    last_error = "Gemini returned no reply text."

    for model_name in models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            text = _response_text(response)
            if text:
                return text
            last_error = f"Model {model_name} returned empty content."
        except Exception as exc:  # noqa: BLE001
            last_error = f"Model {model_name} failed: {exc}"

    raise RuntimeError(last_error)


_bootstrap_env()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/reasoning-chat/", response_model=ReasoningChatResponse)
async def reasoning_chat(payload: ReasoningChatRequest) -> ReasoningChatResponse:
    api_key = _get_api_key()
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing. Set backend/.env or codex/therascape-segment/.env.",
        )

    genai.configure(api_key=api_key)
    prompt = _build_prompt(payload)

    try:
        reply = _generate_with_gemini(prompt, _get_model_candidates())
        return ReasoningChatResponse(reply=reply)
    except RuntimeError as exc:
        detail = str(exc)
        status_code = 429 if "429" in detail else 500
        raise HTTPException(status_code=status_code, detail=detail) from exc
