import type { GroupConfig, SubfactorStatus } from "../logic/types";

interface SubfactorPanelProps {
  group: GroupConfig | null;
  statuses: SubfactorStatus[];
  activeSubfactorId: string | null;
  selectedSubfactors: string[];
  onSubfactorClick: (subfactorId: string) => void;
  onToggleSubfactor: (subfactorId: string) => void;
}

function statusClass(status: SubfactorStatus["status"]) {
  if (status === "green") return "status-green";
  if (status === "red") return "status-red";
  return "status-yellow";
}

export function SubfactorPanel({
  group,
  statuses,
  activeSubfactorId,
  selectedSubfactors,
  onSubfactorClick,
  onToggleSubfactor
}: SubfactorPanelProps) {
  if (!group) {
    return (
      <section className="subfactor-panel empty">
        <h3>Subfactor Bubble Panel</h3>
        <p>Select a reasoning group bubble to drill into subfactors.</p>
      </section>
    );
  }

  return (
    <section className="subfactor-panel">
      <h3>{group.label} Subfactors</h3>
      <div className="subfactor-grid">
        {statuses.map((subfactor) => (
          <article
            key={subfactor.subfactorId}
            className={`subfactor-bubble ${statusClass(subfactor.status)} ${activeSubfactorId === subfactor.subfactorId ? "active" : ""}`}
          >
            <button type="button" className="subfactor-main" onClick={() => onSubfactorClick(subfactor.subfactorId)}>
              {subfactor.label}
            </button>
            <button
              type="button"
              className={`ring-tag ${selectedSubfactors.includes(subfactor.subfactorId) ? "selected" : ""}`}
              onClick={() => onToggleSubfactor(subfactor.subfactorId)}
            >
              {selectedSubfactors.includes(subfactor.subfactorId) ? "Selected" : "Mark"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
