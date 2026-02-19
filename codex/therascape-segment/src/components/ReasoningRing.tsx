import type { CSSProperties } from "react";
import type { GroupConfig, GroupStatus } from "../logic/types";
import { GroupIcon } from "./Icons";

type ReasoningRingProps = {
  groups: GroupConfig[];
  statuses: GroupStatus[];
  fillByGroup: Record<string, number>;
  pulseNonce: number;
  activeGroupId: string | null;
  selectedGroups: string[];
  onGroupClick: (groupId: string) => void;
  onGroupToggle: (groupId: string) => void;
};

const radiusX = 41;
const radiusY = 35;
const center = { x: 50, y: 50 };

const positions = Array.from({ length: 6 }, (_, index) => {
  const angle = (-90 + (360 / 6) * index) * (Math.PI / 180);
  return {
    x: center.x + Math.cos(angle) * radiusX,
    y: center.y + Math.sin(angle) * radiusY
  };
});

function getStatus(statuses: GroupStatus[], groupId: string) {
  return statuses.find((item) => item.groupId === groupId)?.status ?? "neutral";
}

export function ReasoningRing({
  groups,
  statuses,
  fillByGroup,
  pulseNonce,
  activeGroupId,
  selectedGroups,
  onGroupClick,
  onGroupToggle
}: ReasoningRingProps) {
  return (
    <div className="reasoning-ring" role="list" aria-label="Downstream effects">
      {groups.map((group, index) => {
        const position = positions[index] ?? positions[0];
        const status = getStatus(statuses, group.groupId);
        const fill = fillByGroup[group.groupId] ?? 48;
        const isActive = activeGroupId === group.groupId;
        const isSelected = selectedGroups.includes(group.groupId);

        return (
          <button
            key={group.groupId}
            type="button"
            className={`ring-bubble ${status} ${isActive ? "active" : ""} ${isSelected ? "selected" : ""}`}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onClick={() => {
              onGroupClick(group.groupId);
              onGroupToggle(group.groupId);
            }}
          >
            <span
              className="ring-liquid"
              style={{ "--fill-level": `${Math.max(10, Math.min(92, fill))}%` } as CSSProperties}
              aria-hidden="true"
            >
              <span className="ring-wave" />
            </span>

            <span key={`${group.groupId}-${pulseNonce}`} className="ring-pulse" aria-hidden="true" />

            <span className="ring-label">
              <GroupIcon icon={group.icon} className="ring-glyph" />
              {group.label}
            </span>
          </button>
        );
      })}
      <p className="ring-help">Click a badge to drill down and toggle it for scoring.</p>
    </div>
  );
}
