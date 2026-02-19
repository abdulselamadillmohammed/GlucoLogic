import { useMemo, useState } from "react";
import { DndContext, DragOverlay, useDroppable, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import configData from "../data/therascape.config.json";
import { CaseStepper } from "../components/CaseStepper";
import { BubbleMap } from "../components/BubbleMap";
import { ClassPalette } from "../components/ClassPalette";
import { DrugSelectorModal } from "../components/DrugSelectorModal";
import { ExplanationPanel } from "../components/ExplanationPanel";
import { PatientHistoryDrawer } from "../components/PatientHistoryDrawer";
import { TheraScapeCanvas } from "../components/TheraScapeCanvas";
import { compareReasoning } from "../logic/comparator";
import { computeMapBackground } from "../logic/colorComputation";
import { buildGroupBubbleMap, buildSubfactorBubbleMap } from "../logic/reasoningLogic";
import {
  computeGroupStatuses,
  computeSubfactorStatuses,
  getDrugForClass,
  getExplanation,
  getGroup
} from "../logic/reasoningEngine";
import type { ReasoningFeedback, TheraScapeConfig } from "../logic/types";

const config = configData as TheraScapeConfig;

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function TheraScapeApp() {
  const [caseOrder, setCaseOrder] = useState(config.cases);
  const [activeCaseId, setActiveCaseId] = useState(config.cases[0]?.caseId ?? "");
  const [activeStep, setActiveStep] = useState(1);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeSubfactorId, setActiveSubfactorId] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedSubfactors, setSelectedSubfactors] = useState<string[]>([]);

  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [stagedClassId, setStagedClassId] = useState<string | null>(null);
  const [draggingClassId, setDraggingClassId] = useState<string | null>(null);
  const [selectedDrugId, setSelectedDrugId] = useState<string | undefined>(undefined);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confidence, setConfidence] = useState(70);
  const [feedback, setFeedback] = useState<ReasoningFeedback | null>(null);

  const activeCase = caseOrder.find((entry) => entry.caseId === activeCaseId) ?? caseOrder[0];

  const { setNodeRef, isOver } = useDroppable({ id: "patient-dropzone" });

  const groupStatuses = useMemo(
    () => computeGroupStatuses(config, activeCase.patient, selectedDrugId),
    [activeCase, selectedDrugId]
  );
  const groupBubbles = useMemo(
    () => buildGroupBubbleMap(groupStatuses, selectedGroups),
    [groupStatuses, selectedGroups]
  );

  const subfactorStatuses = useMemo(() => {
    if (!activeGroupId) return [];
    return computeSubfactorStatuses(config, activeCase.patient, selectedDrugId, activeGroupId);
  }, [activeCase, activeGroupId, selectedDrugId]);
  const subfactorBubbles = useMemo(
    () => buildSubfactorBubbleMap(subfactorStatuses, selectedSubfactors),
    [subfactorStatuses, selectedSubfactors]
  );

  const explanation = useMemo(() => {
    if (!activeSubfactorId) return null;
    return getExplanation(config, activeSubfactorId, selectedDrugId);
  }, [activeSubfactorId, selectedDrugId]);

  const activeGroup = activeGroupId ? getGroup(config, activeGroupId) ?? null : null;
  const stagedClass = stagedClassId ? getDrugForClass(config, stagedClassId) ?? null : null;
  const draggingClass = draggingClassId ? getDrugForClass(config, draggingClassId) ?? null : null;

  const revealedFields = useMemo(() => {
    const fields = new Set<string>();
    activeCase.steps
      .filter((step) => step.step <= activeStep)
      .forEach((step) => step.revealedFields.forEach((field) => fields.add(field)));
    return fields;
  }, [activeCase, activeStep]);

  function resetReasoningState() {
    setActiveStep(1);
    setActiveGroupId(null);
    setActiveSubfactorId(null);
    setSelectedGroups([]);
    setSelectedSubfactors([]);
    setExpandedClassId(null);
    setStagedClassId(null);
    setDraggingClassId(null);
    setSelectedDrugId(undefined);
    setDrawerOpen(false);
    setConfidence(70);
    setFeedback(null);
  }

  function handleCaseChange(caseId: string) {
    setActiveCaseId(caseId);
    resetReasoningState();
  }

  function handleRandomizeCases() {
    const randomized = shuffle(caseOrder);
    setCaseOrder(randomized);
    setActiveCaseId(randomized[0]?.caseId ?? "");
    resetReasoningState();
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (id.startsWith("class:")) {
      setDraggingClassId(id.replace("class:", ""));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const id = String(event.active.id);

    if (id.startsWith("class:") && event.over?.id === "patient-dropzone") {
      setStagedClassId(id.replace("class:", ""));
    }

    setDraggingClassId(null);
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app-shell">
        <header className="app-header">
          <h1>{config.meta.appModule}</h1>
          <p>Complication-centric reasoning landscape</p>
        </header>

        <CaseStepper
          cases={caseOrder}
          activeCaseId={activeCase.caseId}
          activeStep={activeStep}
          onCaseChange={handleCaseChange}
          onStepChange={setActiveStep}
          onNext={() => setActiveStep((value) => Math.min(value + 1, activeCase.steps.length))}
          onRandomizeCases={handleRandomizeCases}
        />

        <div className="layout-grid">
          <aside className="left-sidebar">
            <ClassPalette
              classes={config.drugLibrary.classes}
              expandedClassId={expandedClassId}
              onExpandClass={(classId) => setExpandedClassId((current) => (current === classId ? null : classId))}
            />
          </aside>

          <main>
            <TheraScapeCanvas>
              <div className="bubble-map-surface" style={{ background: computeMapBackground() }}>
                <BubbleMap
                  title="Reasoning Group Bubble Map"
                  bubbles={groupBubbles}
                  activeId={activeGroupId}
                  onOpen={(groupId) => {
                    setActiveGroupId(groupId);
                    setActiveSubfactorId(null);
                  }}
                  onToggle={(groupId) =>
                    setSelectedGroups((current) =>
                      current.includes(groupId) ? current.filter((item) => item !== groupId) : [...current, groupId]
                    )
                  }
                />
              </div>

              <section
                ref={setNodeRef}
                className={`patient-center ${isOver ? "drop-over" : ""}`}
                onClick={() => setDrawerOpen(true)}
              >
                <h2>Patient Center</h2>
                {revealedFields.has("a1c") ? (
                  <p>
                    A1C {activeCase.patient.a1c} (target {activeCase.patient.targetA1c})
                  </p>
                ) : null}
                {revealedFields.has("bmi") ? <p>BMI {activeCase.patient.bmi}</p> : null}
                {revealedFields.has("ascvd") ? <p>ASCVD: {activeCase.patient.ascvd ? "Yes" : "No"}</p> : null}
                {revealedFields.has("hf") ? <p>HF: {activeCase.patient.hf ? "Yes" : "No"}</p> : null}
                {revealedFields.has("ckdStage") ? <p>CKD stage: {activeCase.patient.ckdStage}</p> : null}
                {revealedFields.has("egfr") ? <p>eGFR: {activeCase.patient.egfr}</p> : null}
                {revealedFields.has("nafld") ? <p>NAFLD/MASH: {activeCase.patient.nafld ? "Present" : "Not stated"}</p> : null}
                {revealedFields.has("costSensitivity") ? <p>Cost sensitivity: {activeCase.patient.costSensitivity}</p> : null}

                <div className="selected-meds">
                  <span className="hint">Drag a class chip here to stage therapy.</span>
                  {selectedDrugId ? (
                    <span className="med-chip">
                      Selected drug: {config.drugLibrary.classes.flatMap((entry) => entry.drugs).find((drug) => drug.drugId === selectedDrugId)?.label}
                      <button type="button" onClick={() => setSelectedDrugId(undefined)}>
                        x
                      </button>
                    </span>
                  ) : null}
                </div>
              </section>

              <BubbleMap
                title={activeGroup ? `${activeGroup.label} Subfactor Bubbles` : "Subfactor Bubble Map"}
                bubbles={subfactorBubbles}
                activeId={activeSubfactorId}
                onOpen={setActiveSubfactorId}
                onToggle={(subfactorId) =>
                  setSelectedSubfactors((current) =>
                    current.includes(subfactorId)
                      ? current.filter((item) => item !== subfactorId)
                      : [...current, subfactorId]
                  )
                }
              />
            </TheraScapeCanvas>
          </main>

          <ExplanationPanel
            content={explanation}
            confidence={confidence}
            feedback={feedback}
            onConfidenceChange={setConfidence}
            onSubmit={() =>
              setFeedback(
                compareReasoning(
                  selectedGroups,
                  selectedSubfactors,
                  activeCase.expected.groups,
                  activeCase.expected.subfactors,
                  confidence
                )
              )
            }
          />
        </div>

        <PatientHistoryDrawer
          open={drawerOpen}
          history={activeCase.patient.history}
          onClose={() => setDrawerOpen(false)}
        />

        <DrugSelectorModal
          open={Boolean(stagedClass)}
          drugClass={stagedClass}
          onClose={() => setStagedClassId(null)}
          onSelectDrug={(drugId) => {
            setSelectedDrugId(drugId);
            setStagedClassId(null);
          }}
        />
      </div>

      <DragOverlay>{draggingClass ? <div className="drag-preview">{draggingClass.label}</div> : null}</DragOverlay>
    </DndContext>
  );
}
