import fs from "node:fs";
import path from "node:path";

type Effect = "positive" | "neutral" | "negative" | "not_stated";
type SourceRef = { sourceId: string };
type EffectEntry = { effect: Effect; sources?: SourceRef[]; evidence?: SourceRef[] };

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "workshop");
const DRUGS_OUT = path.join(DATA_DIR, "drugs.json");
const CASES_OUT = path.join(DATA_DIR, "cases.json");
const PATCH_FILE = path.join(DATA_DIR, "patches.manual.json");

const CLASS_ORDER = [
  { classId: "metformin", className: "Metformin", drugs: ["metformin"] },
  { classId: "sglt2", className: "SGLT2 inhibitors", drugs: ["empagliflozin", "dapagliflozin", "canagliflozin"] },
  { classId: "glp1", className: "GLP-1 RA", drugs: ["semaglutide", "liraglutide"] },
  { classId: "gip_glp1", className: "Dual GIP/GLP-1 RA", drugs: ["tirzepatide"] },
  { classId: "dpp4", className: "DPP-4 inhibitors", drugs: ["sitagliptin"] },
  { classId: "sulfonylureas", className: "Sulfonylureas", drugs: ["glimepiride"] },
  { classId: "tzd", className: "TZD", drugs: ["pioglitazone"] },
  { classId: "insulin", className: "Insulin", drugs: ["basal insulin"] }
] as const;

const subfactors = ["glycemia", "weight", "hypoglycemia", "cardiorenal", "safety_tolerability", "access_cost"] as const;

function findPdfDir() {
  const candidates = [path.join(ROOT, "pdf sources"), path.join(ROOT, "..", "..", "pdf sources"), path.join(ROOT, "..", "pdf sources")];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function buildSourceIndex() {
  const pdfDir = findPdfDir();
  const files = pdfDir ? fs.readdirSync(pdfDir).filter((file) => file.toLowerCase().endsWith(".pdf")) : [];
  return files.map((pdf, index) => ({
    sourceId: `auto_${index + 1}`,
    pdf,
    page: 0,
    where: "Automated extract placeholder; verify manually"
  }));
}

function defaultEffect(sourceId: string): EffectEntry {
  return { effect: "not_stated", sources: [{ sourceId }] };
}

function scaffoldDataset() {
  const sourcesIndex = buildSourceIndex();
  const fallbackSource = sourcesIndex[0]?.sourceId ?? "auto_1";
  return {
    classes: CLASS_ORDER.map((drugClass) => ({
      classId: drugClass.classId,
      className: drugClass.className,
      classSummary: Object.fromEntries(subfactors.map((subfactor) => [subfactor, { effect: "not_stated", evidence: [{ sourceId: fallbackSource }] }])),
      drugs: drugClass.drugs.map((drugName) => ({
        drugId: drugName.replace(/\s+/g, "_"),
        genericName: drugName,
        route: "not_stated",
        keyNotes: [{ text: "Not stated in dataset", sources: [{ sourceId: fallbackSource }] }],
        effects: Object.fromEntries(subfactors.map((subfactor) => [subfactor, defaultEffect(fallbackSource)])),
        adverseEffects: [{ text: "Not stated in dataset", sources: [{ sourceId: fallbackSource }] }],
        cautions: [{ text: "Not stated in dataset", sources: [{ sourceId: fallbackSource }] }]
      }))
    })),
    sourcesIndex
  };
}

function setByPath(target: Record<string, unknown>, keyPath: string, value: unknown) {
  const parts = keyPath.split(".");
  let current: Record<string, unknown> = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index];
    if (!current[key] || typeof current[key] !== "object") current[key] = {};
    current = current[key] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

function applyPatches(dataset: Record<string, unknown>) {
  if (!fs.existsSync(PATCH_FILE)) return dataset;
  const patchRaw = fs.readFileSync(PATCH_FILE, "utf8");
  const patchJson = JSON.parse(patchRaw) as { overrides?: Array<{ target: string; value: unknown }> };
  (patchJson.overrides ?? []).forEach((override) => {
    setByPath(dataset, override.target.replace("class.", "classesById."), override.value);
  });
  return dataset;
}

function validateDrugs(drugs: { classes: Array<{ classSummary: Record<string, EffectEntry>; drugs: Array<{ effects: Record<string, EffectEntry>; keyNotes: Array<{ sources: SourceRef[] }>; adverseEffects: Array<{ sources: SourceRef[] }>; cautions: Array<{ sources: SourceRef[] }> }> }>; sourcesIndex: Array<{ sourceId: string }> }) {
  const sourceIds = new Set(drugs.sourcesIndex.map((source) => source.sourceId));
  const validateRefs = (refs: SourceRef[]) => refs.length > 0 && refs.every((ref) => sourceIds.has(ref.sourceId));

  for (const drugClass of drugs.classes) {
    for (const value of Object.values(drugClass.classSummary)) {
      if (!validateRefs(value.evidence ?? [])) throw new Error("Class summary evidence missing or invalid");
    }
    for (const drug of drugClass.drugs) {
      for (const value of Object.values(drug.effects)) {
        if (!validateRefs(value.sources ?? [])) throw new Error("Drug effect sources missing or invalid");
      }
      if (!drug.keyNotes.every((note) => validateRefs(note.sources))) throw new Error("Key note missing sources");
      if (!drug.adverseEffects.every((item) => validateRefs(item.sources))) throw new Error("Adverse effect missing sources");
      if (!drug.cautions.every((item) => validateRefs(item.sources))) throw new Error("Caution missing sources");
    }
  }
}

function validateCases() {
  if (!fs.existsSync(CASES_OUT)) {
    throw new Error("cases.json is required. Keep 10 dataset-grounded cases in data/workshop/cases.json.");
  }
  const cases = JSON.parse(fs.readFileSync(CASES_OUT, "utf8")) as { cases: unknown[] };
  if (!Array.isArray(cases.cases) || cases.cases.length !== 10) {
    throw new Error("cases.json must contain exactly 10 cases.");
  }
}

function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const scaffold = scaffoldDataset();
  const classesById = Object.fromEntries(scaffold.classes.map((drugClass) => [drugClass.classId, drugClass]));
  const patched = applyPatches({ classesById, sourcesIndex: scaffold.sourcesIndex });
  const classes = CLASS_ORDER.map((meta) => (patched.classesById as Record<string, unknown>)[meta.classId]);

  const finalDrugs = { classes, sourcesIndex: patched.sourcesIndex };
  validateDrugs(finalDrugs as never);
  fs.writeFileSync(DRUGS_OUT, JSON.stringify(finalDrugs, null, 2), "utf8");
  validateCases();
  console.log(`Wrote ${DRUGS_OUT}`);
  console.log(`Validated ${CASES_OUT}`);
}

main();
