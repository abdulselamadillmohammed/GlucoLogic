import type { Subfactor } from "./types";

export const SUBFACTOR_LABELS: Record<Subfactor, string> = {
  glycemia: "Glycemia",
  safety_tolerability: "Safety/Tolerability",
  cardiorenal: "Cardiorenal Health",
  weight: "Weight",
  hypoglycemia: "Hypoglycemia",
  access_cost: "Access/Cost"
};

export const SUBFACTOR_ORDER: Subfactor[] = [
  "glycemia",
  "safety_tolerability",
  "cardiorenal",
  "weight",
  "hypoglycemia",
  "access_cost"
];
