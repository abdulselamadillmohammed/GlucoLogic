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
import { getCoachChatReply } from "./logic/aiEvaluator";
import { compareReasoningSelection } from "./logic/comparator";
import {
  computeGroupStatuses,
  computeSubfactorStatuses,
  getExplanation
} from "./logic/reasoningEngine";
import type {
  CaseEntry,
  ChatMessage,
  ReasoningComparatorResult,
  ReasoningScore,
  StatusColor,
  TheraScapeConfig
} from "./logic/types";

const appConfig = configData as TheraScapeConfig;
const STORAGE_KEY = "therascape-progress-v1";

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createChatMessage(role: ChatMessage["role"], text: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role,
    text
  };
}

function getChatIntro(caseTitle: string) {
  return `Reasoning coach ready for "${caseTitle}". Ask a question to get scored feedback.`;
}

function buildFeedbackChatReply(
  question: string,
  comparison: ReasoningComparatorResult | null,
  selectedGroups: string[],
  selectedSubfactors: string[]
): string {
  if (!comparison) {
    const lowerNoScore = question.toLowerCase();
    const groupCount = selectedGroups.length;
    const subfactorCount = selectedSubfactors.length;

    if (
      lowerNoScore.includes("start") ||
      lowerNoScore.includes("how") ||
      lowerNoScore.includes("begin")
    ) {
      return `Start here: 1) Click ring domains to mark drivers (${groupCount} selected). 2) Click subfactor bubbles to mark details (${subfactorCount} selected). 3) Add at least 1-2 meds, then send any chat message for scored coaching.`;
    }

    return `I can help before scoring too. Right now you have ${groupCount} groups and ${subfactorCount} subfactors selected. Select at least 1 of each, then send a message for targeted feedback.`;
  }

  const lower = question.toLowerCase();
  const missing = [...comparison.score.missingGroups, ...comparison.score.missingSubfactors];
  const extras = [...comparison.score.extraGroups, ...comparison.score.extraSubfactors];
  if (lower.includes("missing") || lower.includes("improve") || lower.includes("add")) {
    return `Focus on missing nodes first: ${missing.join(", ") || "none"}. Then remove extras: ${
      extras.join(", ") || "none"
    }.`;
  }

  if (lower.includes("confidence") || lower.includes("calibration")) {
    return `Calibration is ${comparison.calibrationLevel.replace(
      "-",
      " "
    )} with a gap of ${comparison.calibrationGap}%.`;
  }

  if (lower.includes("score") || lower.includes("grade")) {
    return `Current score: total ${comparison.score.totalScore}%, groups ${comparison.score.groupScore}%, subfactors ${comparison.score.subfactorScore}%.`;
  }

  return `Current result is ${comparison.score.totalScore}% with ${
    missing.length
  } missing nodes. Ask me "what should I add?" for a direct next step list.`;
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
  const [confidence, setConfidence] = useState(70);
  const [score, setScore] = useState<ReasoningScore | null>(null);
  const [comparison, setComparison] = useState<ReasoningComparatorResult | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    createChatMessage("assistant", getChatIntro(appConfig.cases[0]?.title ?? "this case"))
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

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

  const buildCaseOrderFromIds = useCallback((caseIds: string[]) => {
    const byId = new Map(appConfig.cases.map((item) => [item.caseId, item] as const));
    const inOrder = caseIds.map((id) => byId.get(id)).filter((item): item is CaseEntry => Boolean(item));
    const leftovers = appConfig.cases.filter((item) => !caseIds.includes(item.caseId));
    return inOrder.length > 0 ? [...inOrder, ...leftovers] : appConfig.cases;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDrugClass(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as {
        caseOrderIds?: string[];
        activeCaseId?: string;
        selectedDrugClass?: string | null;
        selectedDrugs?: string[];
        activeGroupId?: string | null;
        activeSubfactorId?: string | null;
        selectedGroups?: string[];
        selectedSubfactors?: string[];
        reasoningNote?: string;
        confidence?: number;
        chatMessages?: ChatMessage[];
        chatInput?: string;
      };

      if (parsed.caseOrderIds?.length) {
        const restoredOrder = buildCaseOrderFromIds(parsed.caseOrderIds);
        setCaseOrder(restoredOrder);
        setActiveCaseId(parsed.activeCaseId ?? restoredOrder[0]?.caseId ?? "");
      } else if (parsed.activeCaseId) {
        setActiveCaseId(parsed.activeCaseId);
      }

      setSelectedDrugClass(parsed.selectedDrugClass ?? null);
      setSelectedDrugs(parsed.selectedDrugs ?? []);
      setActiveGroupId(parsed.activeGroupId ?? null);
      setActiveSubfactorId(parsed.activeSubfactorId ?? null);
      setSelectedGroups(parsed.selectedGroups ?? []);
      setSelectedSubfactors(parsed.selectedSubfactors ?? []);
      setReasoningNote(parsed.reasoningNote ?? "");
      setConfidence(parsed.confidence ?? 70);
      setChatMessages(
        parsed.chatMessages?.length
          ? parsed.chatMessages
          : [
              createChatMessage(
                "assistant",
                getChatIntro(
                  appConfig.cases.find((caseEntry) => caseEntry.caseId === parsed.activeCaseId)?.title ??
                    "this case"
                )
              )
            ]
      );
      setChatInput(parsed.chatInput ?? "");
    } catch {
      // Keep defaults if persisted state is invalid JSON.
    } finally {
      setHasHydrated(true);
    }
  }, [buildCaseOrderFromIds]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const payload = {
      caseOrderIds: caseOrder.map((item) => item.caseId),
      activeCaseId,
      selectedDrugClass,
      selectedDrugs,
      activeGroupId,
      activeSubfactorId,
      selectedGroups,
      selectedSubfactors,
      reasoningNote,
      confidence,
      chatMessages,
      chatInput
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    activeCaseId,
    activeGroupId,
    activeSubfactorId,
    caseOrder,
    confidence,
    hasHydrated,
    reasoningNote,
    selectedDrugClass,
    selectedDrugs,
    selectedGroups,
    selectedSubfactors,
    chatInput,
    chatMessages
  ]);

  const handleReset = (nextCaseTitle?: string) => {
    setSelectedDrugClass(null);
    setSelectedDrugs([]);
    setDownstreamStatus({});
    setActiveGroupId(null);
    setActiveSubfactorId(null);
    setSelectedGroups([]);
    setSelectedSubfactors([]);
    setShowJournal(false);
    setReasoningNote("");
    setConfidence(70);
    setScore(null);
    setComparison(null);
    setShowHistory(false);
    setChatMessages([
      createChatMessage("assistant", getChatIntro(nextCaseTitle ?? activeCase?.title ?? "this case"))
    ]);
    setChatInput("");
    setPulseNonce(0);
  };

  const handleCaseChange = (caseId: string) => {
    const nextCase =
      caseOrder.find((caseEntry) => caseEntry.caseId === caseId) ??
      appConfig.cases.find((caseEntry) => caseEntry.caseId === caseId);
    setActiveCaseId(caseId);
    handleReset(nextCase?.title);
  };

  const handleRandomizeCases = () => {
    const randomized = shuffle(caseOrder);
    setCaseOrder(randomized);
    setActiveCaseId(randomized[0]?.caseId ?? "");
    handleReset(randomized[0]?.title);
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

  const handleEvaluateReasoning = useCallback(() => {
    if (!activeCase) {
      return null;
    }

    const localComparison = compareReasoningSelection({
      selectedGroups,
      selectedSubfactors,
      expectedGroups: activeCase.expected.drivers,
      expectedSubfactors: activeCase.expected.subfactors,
      confidence
    });

    setComparison(localComparison);
    setScore(localComparison.score);
    return localComparison;
  }, [activeCase, confidence, selectedGroups, selectedSubfactors]);

  const handleChatSend = async () => {
    const question = chatInput.trim();
    if (!question || !activeCase || isChatting) {
      return;
    }

    const localComparison = handleEvaluateReasoning();
    if (!localComparison) {
      return;
    }

    const userMessage = createChatMessage("user", question);
    setChatInput("");
    setChatMessages((current) => [...current, userMessage]);
    setIsChatting(true);

    try {
      const comparisonSummary = `Total ${localComparison.score.totalScore}%; missing ${
        [...localComparison.score.missingGroups, ...localComparison.score.missingSubfactors].join(", ") ||
        "none"
      }; calibration ${localComparison.calibrationLevel.replace("-", " ")}.`;

      const aiReply = await getCoachChatReply({
        caseTitle: activeCase.title,
        userMessage: question,
        selectedGroups,
        selectedSubfactors,
        selectedMeds: selectedDrugEntries.map((entry) => entry.label),
        reasoningNote,
        confidence,
        comparisonSummary,
        chatHistory: [...chatMessages, userMessage].map((message) => ({
          role: message.role,
          text: message.text
        }))
      });

      const assistantText =
        aiReply.startsWith("Backend unavailable") || aiReply.startsWith("Skipped:")
          ? `${aiReply} ${buildFeedbackChatReply(
              question,
              localComparison,
              selectedGroups,
              selectedSubfactors
            )}`
          : aiReply;

      setChatMessages((current) => [...current, createChatMessage("assistant", assistantText)]);
    } finally {
      setIsChatting(false);
    }
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
            <h1>Complication-centric therapeutic reasoning workspace</h1>
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
                  onEvaluate={handleEvaluateReasoning}
                  score={score}
                  comparison={comparison}
                  chatMessages={chatMessages}
                  chatInput={chatInput}
                  onChatInputChange={setChatInput}
                  onChatSend={handleChatSend}
                  chatSending={isChatting}
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
