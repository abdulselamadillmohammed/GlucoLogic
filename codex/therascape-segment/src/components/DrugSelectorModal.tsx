import type { DrugClassConfig } from "../logic/types";

interface DrugSelectorModalProps {
  open: boolean;
  drugClass: DrugClassConfig | null;
  onClose: () => void;
  onSelectDrug: (drugId: string) => void;
}

export function DrugSelectorModal({ open, drugClass, onClose, onSelectDrug }: DrugSelectorModalProps) {
  if (!open || !drugClass) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>Choose a drug from {drugClass.label}</h3>
        <p>{drugClass.description}</p>
        <div className="modal-list">
          {drugClass.drugs.map((drug) => (
            <button
              key={drug.drugId}
              type="button"
              className="modal-drug"
              onClick={() => onSelectDrug(drug.drugId)}
            >
              <strong>{drug.label}</strong>
              <span>{drug.notes}</span>
            </button>
          ))}
        </div>
        <button type="button" className="modal-close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
