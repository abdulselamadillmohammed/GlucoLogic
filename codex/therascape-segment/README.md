# GlucoLogic Segment

GlucoLogic is a standalone React + TypeScript + Vite module for complication-centric medication reasoning in Type 2 diabetes cases.

## Interaction Model
- Class-first workflow: drag a medication class icon into the patient center to lock it, then choose a drug icon from that class.
- Reasoning Group ring (Level 1): Glycemia, Cardiorenal Health, Weight, Hypoglycemia, Access/Cost, Safety/Tolerability.
- Subfactor bubble panel (Level 2): click a group to drill into subfactors.
- Explanation panel (Level 3): click a subfactor for teaching explanation, prompt, and progressive hints.
- Full patient card drawer: click patient center card to open complete history.
- Combined reasoning coach: each chatbot message triggers scoring + coaching in one flow.

## Data + Engine
- Config source: `src/data/therascape.config.json`
- Engine functions:
  - `computeGroupStatuses(patient, selectedClass)`
  - `computeSubfactorStatuses(patient, selectedClass, groupId)`
  - `getExplanation(subfactorId, selectedClass)`
- Scoring validates selected groups and subfactors against expected case drivers.
- Comparator includes:
  - Live reasoning completeness
  - Confidence calibration
  - Rule-trace feedback ("Why this feedback?")

## Gemini + FastAPI Chat Setup
- Chatbot calls a local FastAPI backend endpoint (`/reasoning-chat/`).
- Backend then calls Gemini from Python (`google-generativeai`).
- Frontend env (`codex/therascape-segment/.env`):
  - `VITE_ENABLE_GEMINI_CHAT=true`
  - `VITE_FASTAPI_URL=http://127.0.0.1:8000`
- Backend setup and run instructions are in `codex/therascape-segment/backend/README.md`.

## Theme
Brand palette applied globally:
- Blue Marguerite `#6E64C2`
- Mystic Blue `#5946B1`
- Cerise Pink `#EC3B82`
- Teal `#008081`
- Vintage Mint `#68AF9C`

Status semantics remain explicit:
- Green = positive impact
- Yellow = caution/neutral
- Red = negative impact

## Setup

```bash
cd codex/therascape-segment
npm install
npm run dev
```

## Scripts
- `npm run dev` starts Vite dev server
- `npm run build` type-checks and builds production bundle
- `npm run test` runs Vitest unit tests
- `npm run lint` runs ESLint
