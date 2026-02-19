import rawData from "../../data/drugs.json";
import type { DrugClassEntry, DrugEntry, DrugsDataset } from "./types";

export const drugsDataset = rawData as DrugsDataset;

export function findClass(classId: string): DrugClassEntry | null {
  return drugsDataset.classes.find((item) => item.classId === classId) ?? null;
}

export function findDrugByName(name: string): { cls: DrugClassEntry; drug: DrugEntry } | null {
  for (const cls of drugsDataset.classes) {
    const drug = cls.drugs.find((d) => d.genericName === name);
    if (drug) return { cls, drug };
  }
  return null;
}

export function allDrugNames() {
  return drugsDataset.classes.flatMap((cls) => cls.drugs.map((drug) => drug.genericName));
}
