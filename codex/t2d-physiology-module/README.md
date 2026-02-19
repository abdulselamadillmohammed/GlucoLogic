# T2D Physiology Module (Standalone)

Self-contained interactive module under `codex/t2d-physiology-module`.

## Route in this standalone module
- `/learn/t2d` (primary)
- `/learn/t2d-physiology` redirects to `/learn/t2d`

## Features
- Light, clean, optimistic medical aesthetic with glass cards
- Sticky top TOC with smooth-scroll tabs and scroll spy
- Scroll progress indicator + section challenge completion progress
- Subtle parallax gradient background with calm drift
- Sectioned interactive learning flow:
  - Normal Regulation
  - Insulin Resistance
  - Beta-cell Compensation -> Failure
  - Systemic Complications
- Story-section guiding questions + fade-up reveal
- Organ click micro-diagram drawer (original SVGs)
- Section micro-challenges with instant feedback
- Reusable components:
  - `InteractiveBodyMap`
  - `PathwayDiagram`
  - `MetricChip`
  - `RiskMeter`
  - `MiniTrendChart`
  - `InfoDrawer`
  - `ScenarioControls`
- Deterministic simulation model + tests
- Diagram source pipeline (`mermaid -> svg -> reactflow`)

## Run locally
```bash
cd codex/t2d-physiology-module
npm install
npm run dev
```

## Enable GlucoCoach via server proxy
1. Create `codex/t2d-physiology-module/.env` from `codex/t2d-physiology-module/.env.example`.
2. Set `OPENAI_API_KEY` in that module `.env` file.
3. Restart `npm run dev`.

The browser calls local `/api/glucocoach`; the API key stays on the local Vite server and is not exposed to client code.

## Quality
```bash
npm run lint
npm run test
npm run build
```

## Diagram pipeline
```bash
npm run diagrams:build
```

## Later integration into main app (not done here)
1. Copy `src/pages/T2DPhysiology.tsx` and dependent component/model/diagram folders into your app.
2. Register route `/learn/t2d` in your main router (optional alias `/learn/t2d-physiology`).
3. If your main app already has Tailwind/theme tokens, merge only needed class tokens from `src/styles.css`.
4. Move simulation tests into your existing test setup.
