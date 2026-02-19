import type { GroupConfig, SubfactorStatus } from "../logic/types";

type SubfactorPanelProps = {
  group: GroupConfig | null;
  statuses: SubfactorStatus[];
  selectedSubfactors: string[];
  activeSubfactorId: string | null;
  onSubfactorClick: (subfactorId: string) => void;
  onSubfactorToggle: (subfactorId: string) => void;
};

export function SubfactorPanel({
  group,
  statuses,
  selectedSubfactors,
  activeSubfactorId,
  onSubfactorClick,
  onSubfactorToggle
}: SubfactorPanelProps) {
  if (!group) {
    return (
      <section className="subfactor-panel empty">
        <h3>Subfactor Bubble Panel</h3>
        <p>Select a reasoning group to drill down.</p>
      </section>
    );
  }

  return (
    <section className="subfactor-panel">
      <h3>{group.label}</h3>
      <div className="subfactor-grid">
        {statuses.map((subfactor) => {
          const isSelected = selectedSubfactors.includes(subfactor.subfactorId);
          const isActive = activeSubfactorId === subfactor.subfactorId;

          return (
            <button
              key={subfactor.subfactorId}
              type="button"
              className={`subfactor-bubble ${subfactor.status} ${isActive ? "active" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => {
                onSubfactorClick(subfactor.subfactorId);
                onSubfactorToggle(subfactor.subfactorId);
              }}
            >
              <span>{subfactor.label}</span>
            </button>
          );
        })}
      </div>
      <p className="subfactor-help">
        Click a subfactor to view explanation and include it in scoring.
      </p>
    </section>
  );
}
