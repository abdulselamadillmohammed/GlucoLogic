import { useDraggable } from "@dnd-kit/core";
import type { DrugClass, DrugEntry } from "../logic/types";

const CLASS_ORDER: Array<{ classId: string; className: string }> = [
  { classId: "metformin", className: "Metformin" },
  { classId: "sglt2", className: "SGLT2 inhibitors" },
  { classId: "glp1", className: "GLP-1 RA" },
  { classId: "gip_glp1", className: "Dual GIP/GLP-1 RA" },
  { classId: "dpp4", className: "DPP-4 inhibitors" },
  { classId: "sulfonylureas", className: "Sulfonylureas" },
  { classId: "tzd", className: "TZD" },
  { classId: "insulin", className: "Insulin" }
];

interface Props {
  classes: DrugClass[];
  selectedClassId: string | null;
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
      <span className="drug-chip-text">{drug.genericName}</span>
    </button>
  );
}

export function DrugClassesPanel({ classes, selectedClassId, onSelectClass, onAdministerDrug }: Props) {
  const classById = new Map(classes.map((drugClass) => [drugClass.classId, drugClass]));

  return (
    <aside className="glass panel-left">
      <h2>Drug Classes</h2>
      <p>Select a class, then drag drugs into the patient card.</p>
      <div className="class-list">
        {CLASS_ORDER.map(({ classId, className }) => {
          const drugClass = classById.get(classId);
          const active = classId === selectedClassId;
          return (
            <div key={classId} className={`class-card ${active ? "active" : ""}`}>
              <button type="button" className="class-btn" onClick={() => onSelectClass(classId)}>
                <span className="icon-circle">o</span>
                <span className="class-btn-text">
                  <strong>{className}</strong>
                  <small>{active ? "Focus active" : "Click to focus"}</small>
                </span>
                <span className={`class-chevron ${active ? "open" : ""}`}>v</span>
              </button>
              <div className={`drug-list-wrap ${active ? "open" : ""}`}>
                <div className="drug-list">
                  {drugClass?.drugs.length ? (
                    drugClass.drugs.map((drug) => (
                      <DraggableDrug key={drug.drugId} drug={drug} onAdministerDrug={onAdministerDrug} />
                    ))
                  ) : (
                    <p className="empty-drugs">Not stated in dataset.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
