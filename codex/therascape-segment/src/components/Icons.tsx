import type { DrugClass, GroupConfig } from "../logic/types";

type ClassId = DrugClass["classId"];
type GroupIconName = GroupConfig["icon"];

type IconProps = {
  size?: number;
  className?: string;
};

export function CapsuleIcon({ size = 50, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={(size * 28) / 64}
      viewBox="0 0 64 28"
      fill="none"
      aria-hidden="true"
    >
      <g>
        <rect x="2" y="2" width="60" height="24" rx="12" fill="#1a2440" />
        <path d="M14 2h18v24H14a12 12 0 0 1 0-24Z" fill="#ea4958" />
        <path d="M32 2h18a12 12 0 0 1 0 24H32V2Z" fill="#3f73ff" />
        <path d="M32 3.5V24.5" stroke="#0b1020" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="22" cy="8" rx="6" ry="3" fill="rgb(255 255 255 / 45%)" />
        <rect
          x="2"
          y="2"
          width="60"
          height="24"
          rx="12"
          stroke="#070b16"
          strokeWidth="2.3"
        />
      </g>
    </svg>
  );
}

export function ClassIcon({ classId, size = 20, className }: IconProps & { classId: ClassId }) {
  const stroke = "#dce7ff";
  const strokeWidth = 1.9;

  const byClass: Record<ClassId, JSX.Element> = {
    metformin: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="4" />
        <path d="M8 11h8" />
      </>
    ),
    sglt2: (
      <>
        <path d="M8 5c0 3-3 4-3 7a3 3 0 1 0 6 0c0-3-3-4-3-7Z" />
        <path d="M16 5c0 3-3 4-3 7a3 3 0 1 0 6 0c0-3-3-4-3-7Z" />
      </>
    ),
    glp1: (
      <>
        <path d="M4 16 16 4" />
        <path d="m14 4 4 4" />
        <path d="m3 17 4 4" />
      </>
    ),
    gip_glp1: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="16" r="3" />
        <path d="M10.5 10.5 13.5 13.5" />
      </>
    ),
    dpp4: (
      <>
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="7" r="2" />
        <circle cx="18" cy="12" r="2" />
        <path d="M8 11 10 8.5M14 8.5 16 11" />
      </>
    ),
    su: (
      <>
        <path d="M12 3 7 13h4l-1 8 6-11h-4l0-7Z" />
      </>
    ),
    tzd: (
      <>
        <path d="M12 4 20 18H4L12 4Z" />
      </>
    ),
    insulin: (
      <>
        <rect x="8" y="4" width="8" height="14" rx="2" />
        <path d="M12 18v3" />
      </>
    )
  };

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {byClass[classId]}
    </svg>
  );
}

export function GroupIcon({ icon, size = 14, className }: IconProps & { icon: GroupIconName }) {
  const stroke = "#eef3ff";

  const byName: Record<GroupIconName, JSX.Element> = {
    droplet: <path d="M7 2s4 4 4 7a4 4 0 1 1-8 0c0-3 4-7 4-7Z" />,
    heart: <path d="M7 12s-5-3.2-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 3.8-5 7-5 7Z" />,
    scale: (
      <>
        <path d="M7 2v10" />
        <path d="M2 5h10" />
        <path d="M3 6c0 1.2 1 2 2 2s2-.8 2-2" />
        <path d="M7 6c0 1.2 1 2 2 2s2-.8 2-2" />
      </>
    ),
    alert: (
      <>
        <path d="M7 2 1.5 11h11L7 2Z" />
        <path d="M7 5.5V8" />
        <circle cx="7" cy="9.6" r="0.5" fill={stroke} />
      </>
    ),
    dollar: (
      <>
        <path d="M7 2v10" />
        <path d="M9.8 3.8c-.7-.7-2.2-1-3.2-.4-.7.4-.9 1.3-.4 1.9.3.4.8.6 1.3.7l1.1.3c.8.2 1.5.8 1.3 1.7-.2.9-1.1 1.3-2 1.4-1 .1-2-.2-2.6-1" />
      </>
    ),
    shield: <path d="M7 2 2.5 4v3.8c0 2.5 1.8 3.9 4.5 4.7 2.7-.8 4.5-2.2 4.5-4.7V4L7 2Z" />
  };

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke={stroke}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {byName[icon]}
    </svg>
  );
}
