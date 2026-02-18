import { useMemo, useState } from "react";
import { DndContext, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import casesData from "./data/cases.mock.json";
import drugsData from "./data/drugs.mock.json";
import { CaseStepper } from "./components/CaseStepper";
import { DomainMap } from "./components/DomainMap";
import { DrugPalette } from "./components/DrugPalette";
import { ReasoningPanel } from "./components/ReasoningPanel";
import { TheraScapeCanvas } from "./components/TheraScapeCanvas";
import {
  clampEffects,
  computeCaseScore,
  computeDomainIntensities,
  derivePatientBaseline
} from "./logic/scoring";
import { compareReasoningNodes } from "./logic/comparator";
import type { CaseData, DrugData, FeedbackResult } from "./logic/types";

const cases = casesData as CaseData[];
const drugs = drugsData as DrugData[];
const drugMap = new Map(drugs.map((drug) => [drug.drugId, drug]));

if (cases.length === 0) {
  throw new Error("Mock case data is required.");
}

function App() {
  const [caseId, setCaseId] = useState<string>(cases[0].caseId);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDrugIds, setSelectedDrugIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);

  const activeCase = useMemo(
    () => cases.find((item) => item.caseId === caseId) ?? cases[0],
    [caseId]
  );

  const selectedDrugs = useMemo(
    () =>
      selectedDrugIds
        .map((id) => drugMap.get(id))
        .filter((drug): drug is DrugData => Boolean(drug)),
    [selectedDrugIds]
  );

  const baseline = useMemo(() => derivePatientBaseline(activeCase.patient), [activeCase]);

  const domainIntensities = useMemo(
    () => computeDomainIntensities(baseline, selectedDrugs),
    [baseline, selectedDrugs]
  );

  const handleCaseChange = (nextCaseId: string) => {
    setCaseId(nextCaseId);
    setStepIndex(0);
    setSelectedDrugIds([]);
    setFeedback(null);
  };

  const handleReset = () => {
    setStepIndex(0);
    setSelectedDrugIds([]);
    setFeedback(null);
  };

  const handleAddDrug = (drugId: string) => {
    setSelectedDrugIds((prev) => (prev.includes(drugId) ? prev : [...prev, drugId]));
  };

  const handleRemoveDrug = (drugId: string) => {
    setSelectedDrugIds((prev) => prev.filter((id) => id !== drugId));
  };

  const { setNodeRef, isOver } = useDroppable({
    id: "patient-center"
  });

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === "patient-center") {
      handleAddDrug(String(event.active.id));
    }
  };

  const handleSubmitReasoning = (nodes: string[], confidence: number) => {
    const nodeComparison = compareReasoningNodes(nodes, activeCase.expectedReasoningNodes);
    const score = computeCaseScore(nodeComparison, selectedDrugIds, activeCase.recommendedMeds);

    const calibrationGap = Math.abs(confidence - score.totalScore);
    const calibration =
      calibrationGap <= 15
        ? "Well calibrated"
        : calibrationGap <= 35
          ? "Moderately calibrated"
          : "Poorly calibrated";

    setFeedback({
      ...score,
      ...nodeComparison,
      confidence,
      calibration,
      selectedMeds: selectedDrugIds,
      recommendedMeds: activeCase.recommendedMeds
    });
  };

  const patientFields = activeCase.steps.slice(0, stepIndex + 1);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="app-shell">
        <header className="hero">
          <h1>TheraScape</h1>
          <p>Visual therapeutic landscape for medication selection reasoning</p>
        </header>

        <CaseStepper
          cases={cases}
          activeCaseId={activeCase.caseId}
          stepIndex={stepIndex}
          onCaseChange={handleCaseChange}
          onStepChange={setStepIndex}
          onReset={handleReset}
        />

        <div className="workspace">
          <section className="canvas-zone">
            <TheraScapeCanvas>
              <div ref={setNodeRef} className={`patient-center ${isOver ? "over" : ""}`}>
                <h2>{activeCase.title}</h2>
                <ul>
                  {patientFields.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}:</strong> {step.content}
                    </li>
                  ))}
                </ul>
                <div className="selected-drugs">
                  {selectedDrugs.length === 0 ? (
                    <span className="hint">Drop medications here</span>
                  ) : (
                    selectedDrugs.map((drug) => (
                      <button
                        key={drug.drugId}
                        type="button"
                        className="chip"
                        onClick={() => handleRemoveDrug(drug.drugId)}
                      >
                        {drug.name} x
                      </button>
                    ))
                  )}
                </div>
              </div>
              <DomainMap baseline={baseline} intensity={clampEffects(domainIntensities)} />
            </TheraScapeCanvas>

            <DrugPalette drugs={drugs} selectedDrugIds={selectedDrugIds} />
          </section>

          <ReasoningPanel
            options={activeCase.reasoningNodeOptions}
            expectedCount={activeCase.expectedReasoningNodes.length}
            onSubmit={handleSubmitReasoning}
            feedback={feedback}
          />
        </div>
      </div>
    </DndContext>
  );
}

export default App;
