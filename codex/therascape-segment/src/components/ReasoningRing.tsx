import type { GroupStatus } from "../logic/types";

interface ReasoningRingProps {
  statuses: GroupStatus[];
  activeGroupId: string | null;
  selectedGroups: string[];
  onGroupClick: (groupId: string) => void;
  onToggleGroup: (groupId: string) => void;
}

function statusClass(status: GroupStatus["status"]) {
  if (status === "green") return "status-green";
  if (status === "red") return "status-red";
  return "status-yellow";
}

export function ReasoningRing({ statuses, activeGroupId, selectedGroups, onGroupClick, onToggleGroup }: ReasoningRingProps) {
  return (
    <div className="reasoning-ring" aria-label="Reasoning groups">
      {statuses.map((group, index) => (
        <article
          key={group.groupId}
          className={`ring-bubble ${statusClass(group.status)} ${group.groupId === activeGroupId ? "active" : ""}`}
          style={{ ["--ring-index" as string]: String(index) }}
        >
          <button type="button" className="ring-main" onClick={() => onGroupClick(group.groupId)}>
            <strong>{group.label}</strong>
            <small>{group.status.toUpperCase()}</small>
          </button>
          <button
            type="button"
            className={`ring-tag ${selectedGroups.includes(group.groupId) ? "selected" : ""}`}
            onClick={() => onToggleGroup(group.groupId)}
          >
            {selectedGroups.includes(group.groupId) ? "Driver selected" : "Mark driver"}
          </button>
        </article>
      ))}
    </div>
  );
}
