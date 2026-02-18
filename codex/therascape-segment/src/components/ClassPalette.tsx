import { useDraggable } from "@dnd-kit/core";
import type { DrugClass } from "../logic/types";
import { CapsuleIcon, ClassIcon } from "./Icons";

type ClassPaletteProps = {
  classes: DrugClass[];
  selectedClassId: string | null;
  selectedDrugIds: string[];
  onSelectClass: (classId: string) => void;
  onExitFocus: () => void;
  onAddDrug: (drugId: string) => void;
};

function DraggableDrugChip({
  drug,
  selected,
  onAddDrug
}: {
  drug: DrugClass["drugs"][number];
  selected: boolean;
  onAddDrug: (drugId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `drug:${drug.drugId}`
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`drug-pop-chip ${selected ? "selected" : ""}`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 1.03 : 1})`
          : undefined,
        boxShadow: isDragging ? "0 16px 28px rgb(6 12 28 / 52%)" : undefined,
        opacity: isDragging ? 0.95 : 1
      }}
      onClick={() => onAddDrug(drug.drugId)}
      {...listeners}
      {...attributes}
    >
      <CapsuleIcon className="pill-icon" />
      <span>{drug.label}</span>
    </button>
  );
}

function ClassCard({
  drugClass,
  active,
  dimmed,
  onSelectClass,
  onExitFocus,
  selectedDrugIds,
  onAddDrug
}: {
  drugClass: DrugClass;
  active: boolean;
  dimmed: boolean;
  onSelectClass: (classId: string) => void;
  onExitFocus: () => void;
  selectedDrugIds: string[];
  onAddDrug: (drugId: string) => void;
}) {
  return (
    <article className={`class-card ${active ? "active" : ""} ${dimmed ? "dimmed" : ""}`}>
      <button
        type="button"
        className="class-trigger"
        onClick={() => (active ? onExitFocus() : onSelectClass(drugClass.classId))}
      >
        <span className="icon-badge">
          <ClassIcon classId={drugClass.classId} size={20} />
        </span>
        <div>
          <strong>{drugClass.label}</strong>
          <small>{active ? "Focus active" : "Click to focus"}</small>
        </div>
      </button>

      {active ? (
        <div className="drug-popout" role="list" aria-label={`${drugClass.label} drugs`}>
          {drugClass.drugs.map((drug, idx) => (
            <div key={drug.drugId} style={{ animationDelay: `${idx * 45}ms` }}>
              <DraggableDrugChip
                drug={drug}
                selected={selectedDrugIds.includes(drug.drugId)}
                onAddDrug={onAddDrug}
              />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ClassPalette({
  classes,
  selectedClassId,
  selectedDrugIds,
  onSelectClass,
  onExitFocus,
  onAddDrug
}: ClassPaletteProps) {
  return (
    <section className="palette">
      <div className="palette-header">
        <div>
          <h3>Drug Classes</h3>
          <p className="subtext">Select a class, then drag drugs into the patient card.</p>
        </div>
        {selectedClassId ? (
          <button type="button" className="ghost-btn" onClick={onExitFocus} aria-label="Exit focus mode">
            x
          </button>
        ) : null}
      </div>

      <div className="class-list-scroll">
        {classes.map((drugClass) => (
          <ClassCard
            key={drugClass.classId}
            drugClass={drugClass}
            active={selectedClassId === drugClass.classId}
            dimmed={Boolean(selectedClassId && selectedClassId !== drugClass.classId)}
            onSelectClass={onSelectClass}
            onExitFocus={onExitFocus}
            selectedDrugIds={selectedDrugIds}
            onAddDrug={onAddDrug}
          />
        ))}
      </div>
    </section>
  );
}
