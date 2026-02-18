import type { DrugClass } from "../logic/types";

type DrugSelectorModalProps = {
  drugClass: DrugClass | null;
  open: boolean;
  onClose: () => void;
  onSelect: (drugId: string) => void;
};

export function DrugSelectorModal({ drugClass, open, onClose, onSelect }: DrugSelectorModalProps) {
  if (!open || !drugClass) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Select medication">
      <div className="modal-card">
        <h3>Select a drug from {drugClass.label}</h3>
        <div className="modal-list">
          {drugClass.drugs.map((drug) => (
            <button key={drug.drugId} type="button" onClick={() => onSelect(drug.drugId)}>
              {drug.label}
            </button>
          ))}
        </div>
        <button type="button" className="expand-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
