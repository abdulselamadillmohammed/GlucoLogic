import type { StatusColor } from "./types";

export type GroupId =
  | "glycemia"
  | "cardiorenal"
  | "weight"
  | "hypoglycemia"
  | "access"
  | "safety";

export type DownstreamCell = {
  status: StatusColor;
  fill: number;
};

export type DownstreamStatusMap = Record<GroupId, DownstreamCell>;

export const DEFAULT_FILL_BY_STATUS: Record<StatusColor, number> = {
  neutral: 0,
  green: 72,
  yellow: 50,
  red: 30
};

// TODO: expand this table with evidence-backed per-drug effects for all drugs.
export const DRUG_EFFECT_OVERRIDES: Record<string, Partial<DownstreamStatusMap>> = {
  empagliflozin: {
    glycemia: { status: "green", fill: 76 },
    cardiorenal: { status: "green", fill: 84 },
    weight: { status: "green", fill: 74 },
    hypoglycemia: { status: "green", fill: 78 },
    access: { status: "red", fill: 32 },
    safety: { status: "red", fill: 36 }
  },
  dapagliflozin: {
    glycemia: { status: "green", fill: 72 },
    cardiorenal: { status: "green", fill: 82 },
    weight: { status: "green", fill: 72 },
    hypoglycemia: { status: "green", fill: 76 },
    access: { status: "red", fill: 34 },
    safety: { status: "red", fill: 37 }
  },
  canagliflozin: {
    glycemia: { status: "green", fill: 74 },
    cardiorenal: { status: "green", fill: 79 },
    weight: { status: "green", fill: 70 },
    hypoglycemia: { status: "green", fill: 74 },
    access: { status: "red", fill: 35 },
    safety: { status: "red", fill: 38 }
  }
};
