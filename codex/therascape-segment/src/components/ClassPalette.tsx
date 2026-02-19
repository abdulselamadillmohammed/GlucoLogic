import { useDraggable } from "@dnd-kit/core";
import type { DrugClassConfig } from "../logic/types";

interface ClassPaletteProps {
  classes: DrugClassConfig[];
  expandedClassId: string | null;
  onExpandClass: (classId: string) => void;
}

function classIcon(classId: string) {
  if (classId === "sglt2") return "shield";
  if (classId === "glp1") return "spark";
  if (classId === "insulin") return "drop";
  if (classId === "su") return "risk";
  return "core";
}

function ClassChip({ drugClass, onExpandClass }: { drugClass: DrugClassConfig; onExpandClass: (classId: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `class:${drugClass.classId}` });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined;

  return (
    <article className={`class-card ${isDragging ? "dragging" : ""}`}>
      <button
        ref={setNodeRef}
        style={style}
        type="button"
        className="class-drag-chip"
        {...listeners}
        {...attributes}
        aria-label={`Drag ${drugClass.label} class`}
      >
        <span className={`pill-icon token-${classIcon(drugClass.classId)}`} aria-hidden="true" />
        <span>{drugClass.label}</span>
      </button>
      <button type="button" className="class-expand" onClick={() => onExpandClass(drugClass.classId)}>
        View drugs
      </button>
    </article>
  );
}

export function ClassPalette({ classes, expandedClassId, onExpandClass }: ClassPaletteProps) {
  const expanded = classes.find((entry) => entry.classId === expandedClassId);

  return (
    <section className="class-palette">
      <h3>Medication Classes</h3>
      <p>Drag a class into the patient center to stage selection.</p>
      <div className="class-grid">
        {classes.map((drugClass) => (
          <ClassChip key={drugClass.classId} drugClass={drugClass} onExpandClass={onExpandClass} />
        ))}
      </div>

      {expanded ? (
        <div className="class-drugs-preview">
          <strong>{expanded.label}</strong>
          <ul>
            {expanded.drugs.map((drug) => (
              <li key={drug.drugId}>{drug.label}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
