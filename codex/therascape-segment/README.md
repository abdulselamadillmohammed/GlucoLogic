# GlucoLogic TheraScape Segment

Standalone React + TypeScript + Vite segment implementing a complication-centric therapeutic reasoning UI.

## New Interaction Model
- Level 1: `ReasoningRing` with six clickable reasoning groups around the patient:
  - Glycemia
  - Cardiorenal Health
  - Weight
  - Hypoglycemia
  - Access/Cost
  - Safety/Tolerability
- Level 2: `SubfactorPanel` drill-down bubble set for the selected group.
- Level 3: `ExplanationPanel` with summary, guided question prompt, why-this-matters line, and progressive `Hint` ladder.

## Class-first Drug Workflow
1. Choose a medication class in the left panel.
2. Drag a class chip into patient center to stage it.
3. `DrugSelectorModal` opens with drugs in that class.
4. Select drug and watch ring/subfactor statuses update.

## Patient Card + History Drawer
- Clicking patient center opens `PatientHistoryDrawer` with labs, comorbidities, constraints, prior meds, and contraindications.

## Config-driven Engine
Config source: `src/data/therascape.config.json`

Engine functions:
- `computeGroupStatuses(config, patient, selectedDrugId)`
- `computeSubfactorStatuses(config, patient, selectedDrugId, groupId)`
- `getExplanation(config, subfactorId, selectedDrugId)`

## Scoring
- Learner marks driver groups/subfactors from bubbles.
- `compareReasoning(...)` computes missing/extra groups/subfactors, total score, and confidence calibration.

## Run
```bash
cd codex/therascape-segment
npm install
npm run dev
```

## Quality
```bash
npm run lint
npm run test
npm run build
```
