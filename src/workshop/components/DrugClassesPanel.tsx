import { useDraggable } from "@dnd-kit/core";
import type { DrugClass, DrugEntry } from "../logic/types";

const orderedNames = [
  "Metformin",
  "SGLT2 inhibitors",
  "GLP-1 RA",
  "Dual GIP/GLP-1 RA",
  "DPP-4 inhibitors",
  "Sulfonylureas",
  "TZD",
  "Insulin"
];

interface Props {
  classes: DrugClass[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  onAdministerDrug: (drugId: string) => void;
}

function DraggableDrug({ drug, onAdministerDrug }: { drug: DrugEntry; onAdministerDrug: (drugId: string) => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: `drug-${drug.drugId}` });
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined;
  return (
    <button
      ref={setNodeRef}
      style={style}
      className="drug-chip"
      type="button"
      onClick={() => onAdministerDrug(drug.drugId)}
      {...listeners}
      {...attributes}
    >
      <span className="pill-icon" />
      {drug.genericName}
    </button>
  );
}

export function DrugClassesPanel({ classes, selectedClassId, onSelectClass, onAdministerDrug }: Props) {
  const sorted = [...classes].sort((a, b) => orderedNames.indexOf(a.className) - orderedNames.indexOf(b.className));
  return (
    <aside className="glass panel-left">
      <h2>Drug Classes</h2>
      <p>Select a class, then drag drugs into the patient card.</p>
      <div className="class-list">
        {sorted.map((drugClass) => {
          const active = drugClass.classId === selectedClassId;
          return (
            <div key={drugClass.classId} className={`class-card ${active ? "active" : ""}`}>
              <button type="button" className="class-btn" onClick={() => onSelectClass(drugClass.classId)}>
                <span className="icon-circle">◌</span>
                <span>
                  <strong>{drugClass.className}</strong>
                  <small>{active ? "Focus active" : "Click to focus"}</small>
                </span>
              </button>
              {active ? (
                <div className="drug-list">
                  {drugClass.drugs.map((drug) => (
                    <DraggableDrug key={drug.drugId} drug={drug} onAdministerDrug={onAdministerDrug} />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
