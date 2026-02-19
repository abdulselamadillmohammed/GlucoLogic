import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import casesData from "../../../data/workshop/cases.json";
import drugsData from "../../../data/workshop/drugs.json";
import { ensureDatasetClaim } from "../logic/datasetGuard";
import { readStorage, writeStorage } from "../logic/storage";
import type { CaseEntry, CasesDataset, DrugEntry, DrugsDataset, Effect, Subfactor } from "../logic/types";
import { CaseSelectorBar } from "./CaseSelectorBar";
import { DrugClassesPanel } from "./DrugClassesPanel";
import { GlucoCoachChat } from "./GlucoCoachChat";
import { HistoryModal } from "./HistoryModal";
import { PatientCard } from "./PatientCard";
import { ReasoningCoach } from "./ReasoningCoach";
import { SubfactorBubbleRing } from "./SubfactorBubbleRing";
import { SubfactorPanel } from "./SubfactorPanel";

const drugs = drugsData as DrugsDataset;
const cases = (casesData as CasesDataset).cases;
const STORAGE_KEY = "therascape-workshop-state";

interface WorkshopState {
  selectedCaseId: string;
  selectedClassId: string;
  selectedDrugIds: string[];
  selectedSubfactor: Subfactor | null;
  reasoningText: string;
  randomizedCaseOrder: string[];
}

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
}

function flattenAllowedText(dataset: DrugsDataset, casesList: CaseEntry[]) {
  const allowed = new Set<string>();
  const collect = (value: unknown) => {
    if (typeof value === "string") allowed.add(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") Object.values(value as Record<string, unknown>).forEach(collect);
  };
  collect(dataset);
  collect(casesList);
  return allowed;
}

export function WorkshopLayout() {
  const [state, setState] = useState<WorkshopState>(() =>
    readStorage<WorkshopState>(STORAGE_KEY, {
      selectedCaseId: cases[0].caseId,
      selectedClassId: drugs.classes[0].classId,
      selectedDrugIds: [],
      selectedSubfactor: null,
      reasoningText: "",
      randomizedCaseOrder: cases.map((caseEntry) => caseEntry.caseId)
    })
  );
  const [showHistory, setShowHistory] = useState(false);
  const allowedText = useMemo(() => flattenAllowedText(drugs, cases), []);

  const orderedCases = state.randomizedCaseOrder
    .map((caseId) => cases.find((entry) => entry.caseId === caseId))
    .filter((entry): entry is CaseEntry => Boolean(entry));
  const selectedCase = orderedCases.find((entry) => entry.caseId === state.selectedCaseId) ?? orderedCases[0];
  const selectedClass = drugs.classes.find((cls) => cls.classId === state.selectedClassId) ?? drugs.classes[0];

  const drugById = useMemo(() => {
    const map = new Map<string, DrugEntry>();
    for (const cls of drugs.classes) {
      for (const drug of cls.drugs) map.set(drug.drugId, drug);
    }
    return map;
  }, []);

  const selectedDrugs = state.selectedDrugIds.map((drugId) => drugById.get(drugId)).filter((drug): drug is DrugEntry => Boolean(drug));
  const currentDrug = selectedDrugs[selectedDrugs.length - 1] ?? null;

  const bubbleEffects = useMemo<Record<Subfactor, Effect>>(() => {
    if (!currentDrug) {
      return {
        glycemia: "not_stated",
        safety_tolerability: "not_stated",
        cardiorenal: "not_stated",
        weight: "not_stated",
        hypoglycemia: "not_stated",
        access_cost: "not_stated"
      };
    }
    return {
      glycemia: currentDrug.effects.glycemia.effect,
      safety_tolerability: currentDrug.effects.safety_tolerability.effect,
      cardiorenal: currentDrug.effects.cardiorenal.effect,
      weight: currentDrug.effects.weight.effect,
      hypoglycemia: currentDrug.effects.hypoglycemia.effect,
      access_cost: currentDrug.effects.access_cost.effect
    };
  }, [currentDrug]);

  useEffect(() => {
    writeStorage(STORAGE_KEY, state);
  }, [state]);

  const onAdministerDrug = (drugId: string) => {
    setState((prev) => ({
      ...prev,
      selectedDrugIds: prev.selectedDrugIds.includes(drugId) ? prev.selectedDrugIds : [...prev.selectedDrugIds, drugId]
    }));
  };

  const onDragEnd = (event: DragEndEvent) => {
    if (event.over?.id !== "patient-drop") return;
    const rawId = String(event.active.id);
    const drugId = rawId.replace("drug-", "");
    if (drugById.has(drugId)) onAdministerDrug(drugId);
  };

  const onReset = () => {
    setState((prev) => ({
      ...prev,
      selectedDrugIds: [],
      selectedSubfactor: null
    }));
  };

  const onRandomize = () => {
    setState((prev) => ({
      ...prev,
      randomizedCaseOrder: shuffle(prev.randomizedCaseOrder)
    }));
  };

  // datasetGuard hook point
  ensureDatasetClaim(selectedCase.title, allowedText, "workshop.caseTitle");

  return (
    <div className="workshop-page">
      <CaseSelectorBar
        selectedCase={selectedCase}
        cases={orderedCases}
        onCaseChange={(caseId) => setState((prev) => ({ ...prev, selectedCaseId: caseId }))}
        onRandomize={onRandomize}
        onReset={onReset}
      />

      <DndContext onDragEnd={onDragEnd}>
        <div className="workshop-grid">
          <DrugClassesPanel
            classes={drugs.classes.filter((cls) => selectedCase.allowedDrugClassIds.includes(cls.classId))}
            selectedClassId={selectedClass.classId}
            onSelectClass={(classId) => setState((prev) => ({ ...prev, selectedClassId: classId }))}
            onAdministerDrug={onAdministerDrug}
          />
          <section className="glass panel-center">
            <SubfactorBubbleRing
              effects={bubbleEffects}
              selectedSubfactor={state.selectedSubfactor}
              onSelectSubfactor={(subfactor) => setState((prev) => ({ ...prev, selectedSubfactor: subfactor }))}
            />
            <PatientCard
              caseEntry={selectedCase}
              selectedDrugs={selectedDrugs}
              onRemoveDrug={(drugId) => setState((prev) => ({ ...prev, selectedDrugIds: prev.selectedDrugIds.filter((id) => id !== drugId) }))}
              onOpenHistory={() => setShowHistory(true)}
            />
          </section>
          <section className="panel-right">
            <ReasoningCoach
              selectedSubfactor={state.selectedSubfactor}
              reasoningText={state.reasoningText}
              onReasoningText={(text) => setState((prev) => ({ ...prev, reasoningText: text }))}
              caseEntry={selectedCase}
            />
            <GlucoCoachChat
              drugs={drugs}
              selectedCase={selectedCase}
              selectedDrug={currentDrug}
              reasoningText={state.reasoningText}
              sourceIndex={drugs.sourcesIndex}
            />
          </section>
        </div>
      </DndContext>

      <SubfactorPanel
        selectedSubfactor={state.selectedSubfactor}
        caseEntry={selectedCase}
        selectedDrug={currentDrug}
        sourceIndex={drugs.sourcesIndex}
      />

      {showHistory ? <HistoryModal caseEntry={selectedCase} onClose={() => setShowHistory(false)} /> : null}
      <section className="glass source-panel">
        <h3>Sources</h3>
        <details>
          <summary>Show class and drug sources</summary>
          {selectedClass.drugs.map((drug) => (
            <article key={drug.drugId}>
              <strong>{drug.genericName}</strong>
              <ul>
                {drug.keyNotes.map((note, index) => (
                  <li key={`${drug.drugId}-note-${index}`}>
                    {note.text} ({note.sources.map((source) => source.sourceId).join(", ")})
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </details>
      </section>
      <footer className="hint-row">Displayed content is constrained to dataset JSON. Missing details are labeled Not stated in dataset.</footer>
    </div>
  );
}
