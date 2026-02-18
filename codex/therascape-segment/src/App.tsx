import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import configData from "./data/therascape.config.json";
import { CaseStepper } from "./components/CaseStepper";
import { ClassPalette } from "./components/ClassPalette";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { JournalModal } from "./components/JournalModal";
import { CapsuleIcon } from "./components/Icons";
import { PatientHistoryDrawer } from "./components/PatientHistoryDrawer";
import { ReasoningRing } from "./components/ReasoningRing";
import { SubfactorPanel } from "./components/SubfactorPanel";
import { TheraScapeCanvas } from "./components/TheraScapeCanvas";
import {
  DEFAULT_FILL_BY_STATUS,
  DRUG_EFFECT_OVERRIDES,
  type DownstreamStatusMap
} from "./logic/drugEffects";
import { computeReasoningScore } from "./logic/scoring";
import {
  computeGroupStatuses,
  computeSubfactorStatuses,
  getExplanation
} from "./logic/reasoningEngine";
import type { ReasoningScore, StatusColor, TheraScapeConfig } from "./logic/types";

const appConfig = configData as TheraScapeConfig;

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function App() {
  const [caseOrder, setCaseOrder] = useState(appConfig.cases);
  const [activeCaseId, setActiveCaseId] = useState(appConfig.cases[0]?.caseId ?? "");

  const [selectedDrugClass, setSelectedDrugClass] = useState<string | null>(null);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [downstreamStatus, setDownstreamStatus] = useState<Record<string, { status: StatusColor; fill: number }>>(
    {}
  );

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeSubfactorId, setActiveSubfactorId] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedSubfactors, setSelectedSubfactors] = useState<string[]>([]);

  const [showHistory, setShowHistory] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [reasoningNote, setReasoningNote] = useState("");
  const [score, setScore] = useState<ReasoningScore | null>(null);

  const [draggingDrugId, setDraggingDrugId] = useState<string | null>(null);
  const [pulseNonce, setPulseNonce] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeCase =
    caseOrder.find((caseEntry) => caseEntry.caseId === activeCaseId) ?? caseOrder[0] ?? null;

  const classes = appConfig.drugLibrary.classes;

  const drugLookup = useMemo(
    () =>
      new Map(
        classes.flatMap((drugClass) =>
          drugClass.drugs.map((drug) => [
            drug.drugId,
            { ...drug, classId: drugClass.classId, classLabel: drugClass.label }
          ])
        )
      ),
    [classes]
  );

  const selectedDrugEntries = selectedDrugs
    .map((drugId) => drugLookup.get(drugId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const draggingDrug = draggingDrugId ? drugLookup.get(draggingDrugId) ?? null : null;

  const { setNodeRef, isOver } = useDroppable({ id: "patient-dropzone" });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const groupStatuses = useMemo(() => {
    if (!activeCase) {
      return [];
    }
    return computeGroupStatuses(appConfig, activeCase.patient, selectedDrugClass);
  }, [activeCase, selectedDrugClass]);

  const buildDownstream = useCallback((drugIds: string[]) => {
    if (drugIds.length === 0) {
      return appConfig.uiTaxonomy.groups.reduce(
        (acc, group) => {
          acc[group.groupId] = {
            status: "neutral",
            fill: 0
          };
          return acc;
        },
        {} as Record<string, { status: StatusColor; fill: number }>
      );
    }

    const base = groupStatuses.reduce(
      (acc, item) => {
        const mappedStatus: StatusColor = item.status === "green" ? "green" : "red";
        acc[item.groupId] = {
          status: mappedStatus,
          fill: DEFAULT_FILL_BY_STATUS[mappedStatus]
        };
        return acc;
      },
      {} as Record<string, { status: StatusColor; fill: number }>
    );

    for (const drugId of drugIds) {
      const overrides = DRUG_EFFECT_OVERRIDES[drugId] as Partial<DownstreamStatusMap> | undefined;
      if (!overrides) {
        continue;
      }

      for (const [groupId, effect] of Object.entries(overrides)) {
        if (!effect) {
          continue;
        }
        base[groupId] = {
          status: effect.status,
          fill: effect.fill
        };
      }
    }

    return base;
  }, [groupStatuses]);

  useEffect(() => {
    setDownstreamStatus(buildDownstream(selectedDrugs));
  }, [buildDownstream, selectedDrugs]);

  const subfactorStatuses = useMemo(() => {
    if (!activeCase || !activeGroupId) {
      return [];
    }
    return computeSubfactorStatuses(appConfig, activeCase.patient, selectedDrugClass, activeGroupId);
  }, [activeCase, activeGroupId, selectedDrugClass]);

  const explanation = useMemo(() => {
    if (!activeCase || !activeSubfactorId) {
      return null;
    }
    return getExplanation(appConfig, activeSubfactorId, selectedDrugClass, activeCase.patient);
  }, [activeCase, activeSubfactorId, selectedDrugClass]);

  const activeGroup =
    appConfig.uiTaxonomy.groups.find((group) => group.groupId === activeGroupId) ?? null;

  const focusMode = Boolean(selectedDrugClass);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDrugClass(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleReset = () => {
    setSelectedDrugClass(null);
    setSelectedDrugs([]);
    setDownstreamStatus({});
    setActiveGroupId(null);
    setActiveSubfactorId(null);
    setSelectedGroups([]);
    setSelectedSubfactors([]);
    setShowJournal(false);
    setReasoningNote("");
    setScore(null);
    setShowHistory(false);
    setPulseNonce(0);
  };

  const handleCaseChange = (caseId: string) => {
    setActiveCaseId(caseId);
    handleReset();
  };

  const handleRandomizeCases = () => {
    const randomized = shuffle(caseOrder);
    setCaseOrder(randomized);
    setActiveCaseId(randomized[0]?.caseId ?? "");
    handleReset();
  };

  const handleAddDrug = (drugId: string) => {
    setSelectedDrugs((current) => {
      if (current.includes(drugId)) {
        return current;
      }
      const next = [...current, drugId];
      setPulseNonce((value) => value + 1);
      return next;
    });
  };

  const handleRemoveDrug = (drugId: string) => {
    setSelectedDrugs((current) => current.filter((entry) => entry !== drugId));
  };

  const toggleSelectedGroup = (groupId: string) => {
    setSelectedGroups((current) =>
      current.includes(groupId) ? current.filter((item) => item !== groupId) : [...current, groupId]
    );
  };

  const toggleSelectedSubfactor = (subfactorId: string) => {
    setSelectedSubfactors((current) =>
      current.includes(subfactorId)
        ? current.filter((item) => item !== subfactorId)
        : [...current, subfactorId]
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    if (!activeId.startsWith("drug:")) {
      return;
    }

    setDraggingDrugId(activeId.replace("drug:", ""));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);

    if (activeId.startsWith("drug:") && event.over?.id === "patient-dropzone") {
      handleAddDrug(activeId.replace("drug:", ""));
    }

    setDraggingDrugId(null);
  };

  const handleSpeechToText = () => {
    if (typeof window === "undefined") {
      return;
    }

    type SpeechApi = {
      start: () => void;
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      continuous: boolean;
      interimResults: boolean;
      lang: string;
    };

    const SpeechRecognitionCtor =
      (window as Window & { webkitSpeechRecognition?: new () => SpeechApi }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setReasoningNote((prev) =>
        `${prev}${prev ? "\n" : ""}[Speech-to-text unavailable in this browser.]`
      );
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) {
        return;
      }
      setReasoningNote((prev) => `${prev}${prev ? "\n" : ""}${transcript}`);
    };

    recognition.onerror = () => {
      setReasoningNote((prev) => `${prev}${prev ? "\n" : ""}[Speech capture failed.]`);
    };

    recognition.onend = () => undefined;
    recognition.start();
  };

  const handleEvaluate = () => {
    if (!activeCase) {
      return;
    }

    setScore(
      computeReasoningScore(
        selectedGroups,
        selectedSubfactors,
        activeCase.expected.drivers,
        activeCase.expected.subfactors
      )
    );
  };

  if (!activeCase) {
    return null;
  }

  const ringStatuses = appConfig.uiTaxonomy.groups.map((group) => ({
    groupId: group.groupId,
    status: downstreamStatus[group.groupId]?.status ?? "neutral"
  }));

  const fillByGroup = appConfig.uiTaxonomy.groups.reduce<Record<string, number>>((acc, group) => {
    acc[group.groupId] = downstreamStatus[group.groupId]?.fill ?? 0;
    return acc;
  }, {});

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingDrugId(null)}
    >
      <div className={`app-shell ${focusMode ? "focus-mode" : ""} ${showJournal ? "modal-open" : ""}`}>
        <header className="hero">
          <div>
            <h1>{appConfig.meta.appModule}</h1>
            <p>Complication-centric therapeutic reasoning workspace</p>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((current) => !current)}
          >
            Drugs
          </button>
        </header>

        <div className={focusMode ? "dim-on-focus" : ""}>
          <CaseStepper
            cases={caseOrder}
            activeCaseId={activeCase.caseId}
            onCaseChange={handleCaseChange}
            onReset={handleReset}
            onRandomizeCases={handleRandomizeCases}
          />
        </div>

        <div className="layout-grid">
          <aside className={`drug-sidebar ${sidebarOpen ? "open" : ""}`}>
            <ClassPalette
              classes={classes}
              selectedClassId={selectedDrugClass}
              selectedDrugIds={selectedDrugs}
              onSelectClass={(classId) => {
                setSelectedDrugClass(classId);
                setSidebarOpen(false);
              }}
              onExitFocus={() => setSelectedDrugClass(null)}
              onAddDrug={handleAddDrug}
            />
          </aside>

          <button
            type="button"
            className={`sidebar-backdrop ${sidebarOpen ? "show" : ""}`}
            aria-label="Close drug menu"
            onClick={() => setSidebarOpen(false)}
          />

          <main className="main-pane">
            <div className="workspace">
              <section className="canvas-zone">
                <TheraScapeCanvas>
                  <div className={focusMode ? "dim-on-focus" : ""}>
                    <ReasoningRing
                      groups={appConfig.uiTaxonomy.groups}
                      statuses={ringStatuses}
                      fillByGroup={fillByGroup}
                      pulseNonce={pulseNonce}
                      activeGroupId={activeGroupId}
                      selectedGroups={selectedGroups}
                      onGroupClick={(groupId) => {
                        setActiveGroupId(groupId);
                        setActiveSubfactorId(null);
                      }}
                      onGroupToggle={toggleSelectedGroup}
                    />
                  </div>

                  <div className={`patient-center ${isOver && draggingDrugId ? "over" : ""}`}>
                    <h2>{activeCase.title}</h2>
                    <p>
                      A1C {activeCase.patient.a1c}% (target {activeCase.patient.targetA1c}%)
                    </p>
                    <p>
                      eGFR {activeCase.patient.egfr} | BMI {activeCase.patient.bmi}
                    </p>

                    <div ref={setNodeRef} className={`selection-slot ${isOver && draggingDrugId ? "over" : ""}`}>
                      {selectedDrugEntries.length > 0 ? (
                        <div className="patient-chip-list">
                          {selectedDrugEntries.map((drug) => (
                            <span key={drug.drugId} className="patient-chip">
                              <CapsuleIcon className="pill-icon" />
                              <span>{drug.label}</span>
                              <button
                                type="button"
                                className="chip-remove"
                                onClick={() => handleRemoveDrug(drug.drugId)}
                                aria-label={`Remove ${drug.label}`}
                              >
                                x
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="hint">Drop drug chips here</span>
                      )}
                    </div>

                    <button type="button" className="history-btn" onClick={() => setShowHistory(true)}>
                      View full patient history
                    </button>
                  </div>
                </TheraScapeCanvas>

                <div className={focusMode ? "dim-on-focus" : ""}>
                  <SubfactorPanel
                    group={activeGroup}
                    statuses={subfactorStatuses}
                    selectedSubfactors={selectedSubfactors}
                    activeSubfactorId={activeSubfactorId}
                    onSubfactorClick={(subfactorId) => {
                      setActiveSubfactorId(subfactorId);
                      setShowJournal(true);
                    }}
                    onSubfactorToggle={toggleSelectedSubfactor}
                  />
                </div>
              </section>

              <div className={focusMode ? "dim-on-focus" : ""}>
                <ExplanationPanel
                  explanation={explanation}
                  noteText={reasoningNote}
                  onNoteTextChange={setReasoningNote}
                  onSpeechToText={handleSpeechToText}
                  onEvaluate={handleEvaluate}
                  score={score}
                />
              </div>
            </div>
          </main>
        </div>

        <PatientHistoryDrawer
          open={showHistory}
          history={activeCase.patient.fullHistory}
          onClose={() => setShowHistory(false)}
        />

        <JournalModal open={showJournal} explanation={explanation} onClose={() => setShowJournal(false)} />
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingDrug ? (
          <div className="drag-ghost">
            <CapsuleIcon className="pill-icon" />
            <span>{draggingDrug.label}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
