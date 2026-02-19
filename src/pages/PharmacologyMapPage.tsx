import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { guardDatasetContent } from "../pharm/contentGuard";
import { drugsDataset } from "../pharm/data";
import { SourceBadge } from "../pharm/SourceBadge";
import { type ConfidenceLevel, type DrugClassEntry, type DrugEntry } from "../pharm/types";

function DrugDetailCard({ cls, drug, reveal, confidence, setConfidence, onToggleReveal }: { cls: DrugClassEntry | null; drug: DrugEntry | null; reveal: boolean; confidence: ConfidenceLevel; setConfidence: (v: ConfidenceLevel) => void; onToggleReveal: () => void }) {
  if (!cls || !drug) {
    return (
      <div className="glass-panel p-4 text-sm text-[#334155]">
        <p className="m-0 font-semibold text-[#2E3A8C]">Drug Card</p>
        <p className="mt-1">Select a class and a drug node from the Pharm Web.</p>
      </div>
    );
  }

  const classSummary = cls.classSummary;
  const sources = drug.sources.length ? drug.sources : cls.classSummarySources;

  return (
    <div className="glass-panel space-y-3 p-4 text-sm text-[#334155]">
      <div>
        <p className="m-0 text-xs uppercase tracking-widest text-[#64748B]">Drug Card</p>
        <h3 className="m-0 mt-1 text-lg text-[#2E3A8C]">{drug.genericName}</h3>
      </div>
      <div className="rounded-xl border border-[#d8e7f5] bg-white/80 p-3">
        <p className="m-0 font-semibold">1) What it is</p>
        <p className="m-0 mt-1">Class: {guardDatasetContent(cls.className, "drug-card.className")}</p>
        <p className="m-0 mt-1">Route: {guardDatasetContent(drug.route, "drug-card.route")}</p>
      </div>

      <div className="rounded-xl border border-[#d8e7f5] bg-white/80 p-3">
        <p className="m-0 font-semibold">Confidence check</p>
        <div className="mt-2 flex gap-2">
          {(["Low", "Med", "High"] as ConfidenceLevel[]).map((value) => (
            <button key={value} type="button" className={`soft-btn focus-ring ${confidence === value ? "primary" : ""}`} onClick={() => setConfidence(value)}>
              {value}
            </button>
          ))}
        </div>
        <button type="button" className="soft-btn focus-ring mt-2" onClick={onToggleReveal}>{reveal ? "Hide details" : "Reveal details"}</button>
      </div>

      {reveal ? (
        <>
          <div className="rounded-xl border border-[#d8e7f5] bg-white/80 p-3">
            <p className="m-0 font-semibold">2) What it does</p>
            <p className="m-0 mt-1">Glucose-lowering efficacy: {guardDatasetContent(classSummary.glucoseLoweringEfficacy, "drug-card.glucose")}</p>
            <p className="m-0 mt-1">Hypoglycemia risk: {guardDatasetContent(classSummary.hypoglycemiaRisk, "drug-card.hypoglycemia")}</p>
            <p className="m-0 mt-1">Weight effect: {guardDatasetContent(classSummary.weightEffect, "drug-card.weight")}</p>
          </div>
          <div className="rounded-xl border border-[#d8e7f5] bg-white/80 p-3">
            <p className="m-0 font-semibold">3) Outcomes</p>
            <p className="m-0 mt-1">MACE: {guardDatasetContent(drug.keyEffects.mace, "drug-card.mace")}</p>
            <p className="m-0 mt-1">HF: {guardDatasetContent(drug.keyEffects.hf, "drug-card.hf")}</p>
            <p className="m-0 mt-1">CKD progression: {guardDatasetContent(drug.keyEffects.ckd, "drug-card.ckd")}</p>
          </div>
          <div className="rounded-xl border border-[#d8e7f5] bg-white/80 p-3">
            <p className="m-0 font-semibold">4) Key cautions / adverse effects</p>
            <ul className="m-0 mt-1 list-disc pl-5">
              {drug.adverseEffects.map((item, idx) => <li key={`ae-${idx}`}>{guardDatasetContent(item, "drug-card.adverse")}</li>)}
              {drug.contraCautions.map((item, idx) => <li key={`cc-${idx}`}>{guardDatasetContent(item, "drug-card.contra")}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-[#d8e7f5] bg-white/80 p-3">
            <p className="m-0 font-semibold">5) Dosing/use notes</p>
            <ul className="m-0 mt-1 list-disc pl-5">
              {drug.dosingNotes.map((item, idx) => <li key={`dn-${idx}`}>{guardDatasetContent(item, "drug-card.dosing")}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-[#d8e7f5] bg-white/80 p-3">
            <p className="m-0 font-semibold">6) Source</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sources.map((source, idx) => <SourceBadge key={`${source.pdf_file}-${idx}`} source={source} />)}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function PharmacologyMapPage() {
  const [selectedClassId, setSelectedClassId] = useState(drugsDataset.classes[0]?.classId ?? "");
  const [selectedDrugName, setSelectedDrugName] = useState<string>("");
  const [reveal, setReveal] = useState(false);
  const [confidence, setConfidence] = useState<ConfidenceLevel>("Med");

  const selectedClass = useMemo(() => drugsDataset.classes.find((cls) => cls.classId === selectedClassId) ?? null, [selectedClassId]);
  const selectedDrug = useMemo(() => selectedClass?.drugs.find((drug) => drug.genericName === selectedDrugName) ?? selectedClass?.drugs[0] ?? null, [selectedClass, selectedDrugName]);

  const circleNodes = selectedClass?.drugs ?? [];
  const centerX = 280;
  const centerY = 210;
  const radius = 135;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="m-0 text-2xl text-[#2E3A8C]">Pharm Web</h2>
        <p className="m-0 mt-1 text-sm text-[#334155]">Dataset-only interactive class/drug map. Expand a class and open a drug card.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_420px]">
        <aside className="glass-panel p-3">
          <p className="m-0 text-xs uppercase tracking-widest text-[#64748B]">Classes</p>
          <div className="mt-2 space-y-2">
            {drugsDataset.classes.map((cls) => (
              <button
                key={cls.classId}
                type="button"
                className={`focus-ring w-full rounded-xl border px-3 py-3 text-left ${selectedClassId === cls.classId ? "border-[#7ab6df] bg-[#eaf6ff] text-[#173a61]" : "border-[#d8e7f5] bg-white text-[#334155]"}`}
                onClick={() => {
                  setSelectedClassId(cls.classId);
                  setSelectedDrugName(cls.drugs[0]?.genericName ?? "");
                  setReveal(false);
                }}
              >
                <p className="m-0 font-semibold">{cls.className}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="glass-panel p-3">
          <p className="m-0 text-xs uppercase tracking-widest text-[#64748B]">Web canvas</p>
          <div className="mt-2 overflow-auto">
            <svg viewBox="0 0 560 420" className="h-[430px] w-full min-w-[560px] rounded-xl border border-[#d7e6f3] bg-white">
              <circle cx={centerX} cy={centerY} r="56" fill="#e8f5ff" stroke="#84bce1" />
              <text x={centerX} y={centerY - 4} textAnchor="middle" fontSize="13" fill="#1d3f61" fontWeight="700">
                {selectedClass?.className ?? "Class"}
              </text>
              <text x={centerX} y={centerY + 14} textAnchor="middle" fontSize="10" fill="#4c6a82">
                {selectedClass?.drugs.length ?? 0} drugs
              </text>

              {circleNodes.map((drug, index) => {
                const angle = (Math.PI * 2 * index) / Math.max(1, circleNodes.length);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const active = selectedDrug?.genericName === drug.genericName;
                return (
                  <g key={drug.genericName}>
                    <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#d5e4f1" />
                    <motion.g initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 140, damping: 18 }}>
                      <circle cx={x} cy={y} r={active ? 30 : 27} fill={active ? "#d8eeff" : "#f3f8fd"} stroke={active ? "#74abd2" : "#c5d8ea"} onClick={() => setSelectedDrugName(drug.genericName)} style={{ cursor: "pointer" }} />
                      <text x={x} y={y - 2} textAnchor="middle" fontSize="10" fill="#24445f">
                        {drug.genericName.slice(0, 18)}
                      </text>
                      <text x={x} y={y + 10} textAnchor="middle" fontSize="9" fill="#5a748b">
                        Click
                      </text>
                    </motion.g>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        <DrugDetailCard
          cls={selectedClass}
          drug={selectedDrug}
          reveal={reveal}
          confidence={confidence}
          setConfidence={setConfidence}
          onToggleReveal={() => setReveal((v) => !v)}
        />
      </div>
    </div>
  );
}
