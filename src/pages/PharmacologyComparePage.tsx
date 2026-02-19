import { useMemo, useState } from "react";
import { guardDatasetContent } from "../pharm/contentGuard";
import { allDrugNames, drugsDataset, findClass, findDrugByName } from "../pharm/data";
import { SourceBadge } from "../pharm/SourceBadge";
import { NOT_STATED } from "../pharm/types";

type CompareMode = "class" | "drug";

function CompareCard({ title, rows, sources }: { title: string; rows: Array<{ label: string; value: string }>; sources: Array<{ pdf_file: string; page_number: number | null; table_or_section: string }> }) {
  return (
    <div className="glass-panel p-4">
      <h3 className="m-0 text-lg text-[#2E3A8C]">{title}</h3>
      <div className="mt-2 space-y-2 text-sm text-[#334155]">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-[#d8e7f5] bg-white/80 p-2">
            <p className="m-0 text-xs uppercase tracking-widest text-[#64748B]">{row.label}</p>
            <p className="m-0 mt-1">{guardDatasetContent(row.value, `compare.${title}.${row.label}`)}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {sources.map((source, idx) => <SourceBadge key={`${source.pdf_file}-${idx}`} source={source} />)}
      </div>
    </div>
  );
}

export function PharmacologyComparePage() {
  const [mode, setMode] = useState<CompareMode>("class");
  const [left, setLeft] = useState(drugsDataset.classes[0]?.classId ?? "");
  const [right, setRight] = useState(drugsDataset.classes[1]?.classId ?? drugsDataset.classes[0]?.classId ?? "");

  const options = mode === "class" ? drugsDataset.classes.map((cls) => ({ value: cls.classId, label: cls.className })) : allDrugNames().map((name) => ({ value: name, label: name }));

  const leftCard = useMemo(() => {
    if (mode === "class") {
      const cls = findClass(left);
      if (!cls) return null;
      return {
        title: cls.className,
        rows: [
          { label: "Glucose-lowering efficacy", value: cls.classSummary.glucoseLoweringEfficacy },
          { label: "Hypoglycemia risk", value: cls.classSummary.hypoglycemiaRisk },
          { label: "Weight effect", value: cls.classSummary.weightEffect },
          { label: "CV effects", value: cls.classSummary.cvEffects },
          { label: "Kidney effects", value: cls.classSummary.kidneyEffects },
          { label: "MASH effects", value: cls.classSummary.mashEffects }
        ],
        sources: cls.classSummarySources
      };
    }
    const drug = findDrugByName(left);
    if (!drug) return null;
    return {
      title: drug.drug.genericName,
      rows: [
        { label: "Route", value: drug.drug.route },
        { label: "MACE", value: drug.drug.keyEffects.mace },
        { label: "HF", value: drug.drug.keyEffects.hf },
        { label: "CKD", value: drug.drug.keyEffects.ckd },
        { label: "Adverse effects", value: drug.drug.adverseEffects[0] ?? NOT_STATED },
        { label: "Dosing note", value: drug.drug.dosingNotes[0] ?? NOT_STATED }
      ],
      sources: drug.drug.sources
    };
  }, [left, mode]);

  const rightCard = useMemo(() => {
    if (mode === "class") {
      const cls = findClass(right);
      if (!cls) return null;
      return {
        title: cls.className,
        rows: [
          { label: "Glucose-lowering efficacy", value: cls.classSummary.glucoseLoweringEfficacy },
          { label: "Hypoglycemia risk", value: cls.classSummary.hypoglycemiaRisk },
          { label: "Weight effect", value: cls.classSummary.weightEffect },
          { label: "CV effects", value: cls.classSummary.cvEffects },
          { label: "Kidney effects", value: cls.classSummary.kidneyEffects },
          { label: "MASH effects", value: cls.classSummary.mashEffects }
        ],
        sources: cls.classSummarySources
      };
    }
    const drug = findDrugByName(right);
    if (!drug) return null;
    return {
      title: drug.drug.genericName,
      rows: [
        { label: "Route", value: drug.drug.route },
        { label: "MACE", value: drug.drug.keyEffects.mace },
        { label: "HF", value: drug.drug.keyEffects.hf },
        { label: "CKD", value: drug.drug.keyEffects.ckd },
        { label: "Adverse effects", value: drug.drug.adverseEffects[0] ?? NOT_STATED },
        { label: "Dosing note", value: drug.drug.dosingNotes[0] ?? NOT_STATED }
      ],
      sources: drug.drug.sources
    };
  }, [mode, right]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="m-0 text-2xl text-[#2E3A8C]">Compare</h2>
        <p className="m-0 mt-1 text-sm text-[#334155]">Compare two classes or two drugs using only fields from `data/drugs.json` with source badges.</p>
      </div>

      <div className="glass-panel p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={`soft-btn focus-ring ${mode === "class" ? "primary" : ""}`} onClick={() => setMode("class")}>Class vs Class</button>
          <button type="button" className={`soft-btn focus-ring ${mode === "drug" ? "primary" : ""}`} onClick={() => setMode("drug")}>Drug vs Drug</button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm text-[#334155]">
            <span>Left</span>
            <select className="focus-ring w-full rounded-lg border border-[#d7e6f3] bg-white p-2" value={left} onChange={(event) => setLeft(event.target.value)}>
              {options.map((option) => <option key={`left-${option.value}`} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm text-[#334155]">
            <span>Right</span>
            <select className="focus-ring w-full rounded-lg border border-[#d7e6f3] bg-white p-2" value={right} onChange={(event) => setRight(event.target.value)}>
              {options.map((option) => <option key={`right-${option.value}`} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {leftCard ? <CompareCard title={leftCard.title} rows={leftCard.rows} sources={leftCard.sources} /> : null}
        {rightCard ? <CompareCard title={rightCard.title} rows={rightCard.rows} sources={rightCard.sources} /> : null}
      </div>
    </div>
  );
}
