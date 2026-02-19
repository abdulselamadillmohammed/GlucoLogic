# /learn/t2d-physiology Extension Notes

This route is implemented in `src/pages/T2DPhysiology.tsx` for standalone module development.

To extend:
- Add new physiology sections in `SECTION_META` and render branch blocks.
- Expand simulation in `src/model/simulation.ts` with deterministic formulas.
- Add new body-map organs in `InteractiveBodyMap` and corresponding explanation entries.
- Add new pathway diagrams in:
  - `src/diagrams/mermaid`
  - `src/diagrams/svg`
  - `src/diagrams/reactflow`
