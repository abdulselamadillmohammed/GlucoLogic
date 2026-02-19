import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data");
const OUT_FILE = path.join(OUT_DIR, "drugs.json");

const NOT_STATED = "Not stated in dataset";

const CLASS_DRUGS = {
  biguanide: ["Metformin"],
  sulfonylureas_2nd_gen: ["Glimepiride", "Glipizide (IR)", "Glipizide (XL/ER)", "Glyburide", "Glyburide (micronized)"],
  thiazolidinedione: ["Pioglitazone"],
  alpha_glucosidase_inhibitors: ["Acarbose", "Miglitol"],
  meglitinides: ["Nateglinide", "Repaglinide"],
  dpp4_inhibitors: ["Alogliptin", "Linagliptin", "Saxagliptin", "Sitagliptin"],
  sglt2_inhibitors: ["Bexagliflozin", "Canagliflozin", "Dapagliflozin", "Empagliflozin", "Ertugliflozin"],
  glp1_receptor_agonists: ["Dulaglutide", "Liraglutide", "Semaglutide (SQ)", "Semaglutide (oral)", "Exenatide (once weekly)", "Lixisenatide"],
  dual_gip_glp1_receptor_agonist: ["Tirzepatide"],
  bile_acid_sequestrant: ["Colesevelam"],
  dopamine2_agonist: ["Bromocriptine"],
  insulin_human: ["Human regular", "Human NPH", "Premixed NPH/regular 70/30", "Concentrated U-500 human regular", "Inhaled insulin"],
  insulin_analogs_and_products: [
    "Aspart",
    "Aspart (biosimilars)",
    "Aspart (faster acting product)",
    "Glulisine",
    "Lispro (U-100)",
    "Lispro (U-200)",
    "Lispro-aabc",
    "Lispro follow-on product",
    "Degludec (U-100)",
    "Degludec (U-200)",
    "Glargine (U-100)",
    "Glargine (U-300)",
    "Glargine biosimilar/follow-on products",
    "Premixed Aspart 70/30",
    "Premixed Lispro 50/50",
    "Premixed Lispro 75/25"
  ],
  fixed_combo_products: ["Degludec/Liraglutide", "Glargine/Lixisenatide"]
};

const CLASS_META = {
  biguanide: "Biguanide",
  sulfonylureas_2nd_gen: "Sulfonylureas (2nd gen)",
  thiazolidinedione: "Thiazolidinedione",
  alpha_glucosidase_inhibitors: "Alpha-glucosidase inhibitors",
  meglitinides: "Meglitinides",
  dpp4_inhibitors: "DPP-4 inhibitors",
  sglt2_inhibitors: "SGLT2 inhibitors",
  glp1_receptor_agonists: "GLP-1 receptor agonists",
  dual_gip_glp1_receptor_agonist: "Dual GIP/GLP-1 receptor agonist",
  bile_acid_sequestrant: "Bile acid sequestrant",
  dopamine2_agonist: "Dopamine-2 agonist",
  insulin_human: "Insulin (human)",
  insulin_analogs_and_products: "Insulin (analogs and listed products)",
  fixed_combo_products: "Fixed combo products"
};

function sourceStub(pdf) {
  return { pdf_file: pdf, page_number: null, table_or_section: "TODO: add table/section reference" };
}

function buildDrug(genericName, sources) {
  return {
    genericName,
    route: NOT_STATED,
    keyEffects: { mace: NOT_STATED, hf: NOT_STATED, ckd: NOT_STATED },
    adverseEffects: [NOT_STATED],
    dosingNotes: [NOT_STATED],
    contraCautions: [NOT_STATED],
    sources
  };
}

function extractTextHeuristic(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const text = buf.toString("utf8");
  return text.replace(/\0/g, " ");
}

function inferSources(pdfTextsByName, token) {
  const hits = [];
  for (const [name, text] of Object.entries(pdfTextsByName)) {
    if (text.toLowerCase().includes(token.toLowerCase())) {
      hits.push({ pdf_file: name, page_number: null, table_or_section: "Heuristic text match; TODO: add exact section" });
    }
  }
  return hits;
}

function buildDataset(pdfTextsByName) {
  const classes = Object.entries(CLASS_DRUGS).map(([classId, drugs]) => {
    const className = CLASS_META[classId];
    const classSources = inferSources(pdfTextsByName, className);
    const classSummary = {
      glucoseLoweringEfficacy: NOT_STATED,
      hypoglycemiaRisk: NOT_STATED,
      weightEffect: NOT_STATED,
      cvEffects: NOT_STATED,
      kidneyEffects: NOT_STATED,
      mashEffects: NOT_STATED,
      keyConsiderations: [NOT_STATED]
    };

    return {
      classId,
      className,
      classSummary,
      classSummarySources: classSources.length ? classSources : [sourceStub("dc26s009.pdf"), sourceStub("Pharmacologic Glycemic Management of Type 2 Diabetes in Adults—2024 Update.pdf")],
      drugs: drugs.map((drugName) => {
        const drugSources = inferSources(pdfTextsByName, drugName);
        return buildDrug(
          drugName,
          drugSources.length
            ? drugSources
            : [sourceStub("dc26s009.pdf"), sourceStub("Pharmacologic Glycemic Management of Type 2 Diabetes in Adults—2024 Update.pdf")]
        );
      })
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    note: "Auto-generated from local PDFs with conservative fallback. Any missing field is set to 'Not stated in dataset' until manually patched.",
    classes
  };
}

function resolvePdfDirectory() {
  const candidates = [
    path.join(ROOT, "pdf sources"),
    path.join(ROOT, "..", "therascape-segment", "pdf sources"),
    path.join(ROOT, "..", "..", "codex", "therascape-segment", "pdf sources")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const pdfCount = fs.readdirSync(candidate).filter((f) => f.toLowerCase().endsWith(".pdf")).length;
      if (pdfCount > 0) return candidate;
    }
  }

  return null;
}

function main() {
  const pdfTexts = {};
  const pdfDir = resolvePdfDirectory();

  if (pdfDir) {
    const files = fs.readdirSync(pdfDir).filter((f) => f.toLowerCase().endsWith(".pdf"));
    for (const file of files) {
      const full = path.join(pdfDir, file);
      try {
        pdfTexts[file] = extractTextHeuristic(full);
      } catch (error) {
        pdfTexts[file] = "";
        console.warn(`Failed to parse ${file}: ${String(error)}`);
      }
    }
    console.log(`Using PDF source directory: ${pdfDir}`);
  } else {
    console.warn("No supported 'pdf sources' directory found. Generating conservative dataset with 'Not stated in dataset' values.");
  }

  const dataset = buildDataset(pdfTexts);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(dataset, null, 2), "utf8");
  console.log(`Wrote ${OUT_FILE}`);
}

main();
