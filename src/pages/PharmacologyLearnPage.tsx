import { useEffect, useMemo, useState } from "react";
import { guardDatasetContent } from "../pharm/contentGuard";
import { drugsDataset } from "../pharm/data";
import { SourceBadge } from "../pharm/SourceBadge";
import { type ConfidenceLevel } from "../pharm/types";

const GOAL_CHIPS = ["avoid hypoglycemia", "weight loss focus", "CKD benefit focus", "HF benefit focus", "cost sensitive"];
const STORAGE_KEY = "pharm_learn_calibration";

export function PharmacologyLearnPage() {
  const [goalIndex, setGoalIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [links, setLinks] = useState<string[]>([]);
  const [draggingChip, setDraggingChip] = useState<string>("");
  const [confidence, setConfidence] = useState<ConfidenceLevel>("Med");
  const [revealed, setRevealed] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  const activeGoal = GOAL_CHIPS[goalIndex];
  const selectedClasses = useMemo(() => drugsDataset.classes.filter((cls) => links.includes(cls.classId)), [links]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setGoalIndex((idx) => (idx + 1) % GOAL_CHIPS.length);
          setLinks([]);
          setRevealed(false);
          return 60;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Array<unknown>;
      setHistoryCount(Array.isArray(parsed) ? parsed.length : 0);
    } catch {
      setHistoryCount(0);
    }
  }, []);

  function persistCalibration() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = raw ? (JSON.parse(raw) as Array<unknown>) : [];
    const next = [
      ...base,
      {
        ts: new Date().toISOString(),
        goal: activeGoal,
        confidence,
        classIds: links
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setHistoryCount(next.length);
  }

  function addClassLink(classId: string) {
    setLinks((current) => {
      if (current.includes(classId)) return current;
      if (current.length >= 2) return current;
      return [...current, classId];
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="m-0 text-2xl text-[#2E3A8C]">Guided Learn</h2>
        <p className="m-0 mt-1 text-sm text-[#334155]">60-second Link-and-Explain: drag the goal chip onto 1-2 classes, pick confidence, then reveal dataset-supported rationale.</p>
      </div>

      <div className="glass-panel p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#64748B]">Goal chip</span>
            <span
              draggable
              onDragStart={() => setDraggingChip(activeGoal)}
              className="cursor-grab rounded-full border border-[#7ab6df] bg-[#eaf6ff] px-3 py-1 text-sm font-semibold text-[#1f4568]"
            >
              {activeGoal}
            </span>
          </div>
          <span className="rounded-full border border-[#d7e7f5] bg-white px-3 py-1 text-sm text-[#334155]">Time: {timeLeft}s</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="glass-panel p-3">
          <p className="m-0 text-xs uppercase tracking-widest text-[#64748B]">Drop target classes</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {drugsDataset.classes.map((cls) => {
              const selected = links.includes(cls.classId);
              return (
                <div
                  key={cls.classId}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingChip) addClassLink(cls.classId);
                  }}
                  className={`rounded-xl border p-3 ${selected ? "border-[#76afd7] bg-[#e9f6ff]" : "border-[#d8e7f5] bg-white/85"}`}
                >
                  <p className="m-0 font-semibold text-[#2E3A8C]">{cls.className}</p>
                  <p className="m-0 mt-1 text-xs text-[#64748B]">Drop goal chip here</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel space-y-3 p-3">
          <div>
            <p className="m-0 text-xs uppercase tracking-widest text-[#64748B]">Confidence</p>
            <div className="mt-2 flex gap-2">
              {(["Low", "Med", "High"] as ConfidenceLevel[]).map((value) => (
                <button key={value} type="button" className={`soft-btn focus-ring ${confidence === value ? "primary" : ""}`} onClick={() => setConfidence(value)}>
                  {value}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="soft-btn primary focus-ring"
            onClick={() => {
              setRevealed(true);
              persistCalibration();
            }}
          >
            Reveal rationale
          </button>
          <p className="m-0 text-xs text-[#64748B]">Calibration records stored locally: {historyCount}</p>
        </div>
      </div>

      {revealed ? (
        <div className="glass-panel p-4">
          <p className="m-0 text-sm font-semibold text-[#2E3A8C]">Dataset-supported recap</p>
          {selectedClasses.length === 0 ? (
            <p className="m-0 mt-2 text-sm text-[#334155]">Not stated in dataset</p>
          ) : (
            <div className="mt-2 space-y-3">
              {selectedClasses.map((cls) => (
                <div key={cls.classId} className="rounded-xl border border-[#d8e7f5] bg-white/85 p-3">
                  <p className="m-0 font-semibold text-[#2E3A8C]">{cls.className}</p>
                  <ul className="m-0 mt-1 list-disc pl-5 text-sm text-[#334155]">
                    <li>Glucose-lowering efficacy: {guardDatasetContent(cls.classSummary.glucoseLoweringEfficacy, "learn.glucose")}</li>
                    <li>Hypoglycemia risk: {guardDatasetContent(cls.classSummary.hypoglycemiaRisk, "learn.hypoglycemia")}</li>
                    <li>Weight effect: {guardDatasetContent(cls.classSummary.weightEffect, "learn.weight")}</li>
                    <li>CV effects: {guardDatasetContent(cls.classSummary.cvEffects, "learn.cv")}</li>
                    <li>Kidney effects: {guardDatasetContent(cls.classSummary.kidneyEffects, "learn.kidney")}</li>
                  </ul>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cls.classSummarySources.map((source, idx) => <SourceBadge key={`${cls.classId}-${idx}`} source={source} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
