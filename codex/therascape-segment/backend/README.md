# FastAPI Reasoning Backend

This backend powers the reasoning chatbot using Gemini from a Python FastAPI service.

## 1) Create and activate isolated Python environment

```bash
cd codex/therascape-segment/backend
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

## 2) Install dependencies

```bash
pip install -r requirements.txt
```

## 3) Configure Gemini API key

Create `backend/.env` from `backend/.env.example` and set:

```bash
GEMINI_API_KEY=your_real_key
GEMINI_MODEL=gemini-1.5-flash-latest
```

Notes:
- The server also checks `codex/therascape-segment/.env` for `VITE_GEMINI_API_KEY` as fallback.
- Preferred is `backend/.env` so frontend and backend secrets are separated.

## 4) Run server

```bash
uvicorn main:app --reload
```

Server URL:
- `http://127.0.0.1:8000`
- Chat endpoint: `POST /reasoning-chat/`
- Health endpoint: `GET /health`

## 5) Frontend wiring

In `codex/therascape-segment/.env`:

```bash
VITE_ENABLE_GEMINI_CHAT=true
VITE_FASTAPI_URL=http://127.0.0.1:8000
```

Then restart Vite dev server.
