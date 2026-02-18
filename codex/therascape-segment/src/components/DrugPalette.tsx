import { useDraggable } from "@dnd-kit/core";
import type { DrugData } from "../logic/types";

type DrugPaletteProps = {
  drugs: DrugData[];
  selectedDrugIds: string[];
};

function DraggableDrug({ drug, selected }: { drug: DrugData; selected: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: drug.drugId,
    disabled: selected
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`drug-pill ${selected ? "selected" : ""}`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        opacity: isDragging ? 0.6 : 1
      }}
      {...listeners}
      {...attributes}
    >
      <strong>{drug.name}</strong>
      <span>{drug.class}</span>
      <small>{drug.notes}</small>
    </button>
  );
}

export function DrugPalette({ drugs, selectedDrugIds }: DrugPaletteProps) {
  return (
    <section className="palette">
      <h3>Medication Palette</h3>
      <div className="palette-grid">
        {drugs.map((drug) => (
          <DraggableDrug
            key={drug.drugId}
            drug={drug}
            selected={selectedDrugIds.includes(drug.drugId)}
          />
        ))}
      </div>
    </section>
  );
}
