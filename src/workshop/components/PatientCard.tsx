import { useDroppable } from "@dnd-kit/core";
import type { CaseEntry, DrugEntry } from "../logic/types";

interface Props {
  caseEntry: CaseEntry;
  selectedDrugs: DrugEntry[];
  onRemoveDrug: (drugId: string) => void;
  onOpenHistory: () => void;
}

export function PatientCard({ caseEntry, selectedDrugs, onRemoveDrug, onOpenHistory }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: "patient-drop" });
  return (
    <div className="patient-shell">
      <h3>{caseEntry.title}</h3>
      <p>
        A1C {caseEntry.prompt.vitalsLabs.a1c} | eGFR {caseEntry.prompt.vitalsLabs.egfr} | BMI {caseEntry.prompt.vitalsLabs.bmi}
      </p>
      <div ref={setNodeRef} className={`drop-zone ${isOver ? "over" : ""}`}>
        <span>Drop drug chips here</span>
        <div className="selected-chips">
          {selectedDrugs.map((drug) => (
            <button key={drug.drugId} type="button" className="selected-chip" onClick={() => onRemoveDrug(drug.drugId)}>
              {drug.genericName} ×
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="history-btn" onClick={onOpenHistory}>
        View full patient history
      </button>
    </div>
  );
}
