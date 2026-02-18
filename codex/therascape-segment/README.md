# TheraScape Segment

TheraScape is a standalone React + TypeScript + Vite module that demonstrates visual medication reasoning with local mock data only.

## In Scope
- Progressive case disclosure with step navigation
- Drag medication chips into a patient-center selection zone
- Domain intensity map across six domains
- Reasoning checklist + confidence slider + local rule-based feedback
- Unit tests for scoring/comparator logic

## Out of Scope
- Backend integration
- Real-world guideline logic
- Authentication, deployment, or monorepo-wide tooling changes

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

## Demo Flow (Hackathon)
1. Select Case A or Case B from the case selector.
2. Click `Next` to reveal additional case details step-by-step.
3. Drag at least 3 medication pills from the palette into the patient center.
4. Watch six domain nodes update intensity and status (Glow/Warning/Stable).
5. Select reasoning nodes, set confidence, and submit.
6. Review correctness score, missing/extra nodes, medication match, and calibration indicator.
