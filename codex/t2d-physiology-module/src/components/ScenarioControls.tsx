import type { Dispatch, SetStateAction } from "react";
import { evidence } from "../data/evidence";
import type { SimulationInputs } from "../model/simulation";
import { getMetricStatus, type StatusTone } from "../model/statusRules";

export interface StressToggles {
  visceralFat: boolean;
  inflammationLoad: boolean;
  sedentary: boolean;
  highFFA: boolean;
}

interface ScenarioControlsProps {
  inputs: SimulationInputs;
  setInputs: Dispatch<SetStateAction<SimulationInputs>>;
  stressors: StressToggles;
  setStressors: Dispatch<SetStateAction<StressToggles>>;
  section: "normal" | "resistance" | "beta" | "complications";
  outputs?: {
    glucose_level: number;
    insulin_level: number;
    hepatic_output: number;
    peripheral_uptake: number;
    risk_scores: {
      heart: number;
      kidney: number;
      eye: number;
      nerves: number;
      brain: number;
    };
  };
  lastAction?: string;
}

function statusClass(status: StatusTone) {
  return status === "good" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : status === "warn" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";
}

function SliderInfo({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-[#b8cee0] text-[10px] text-[#5a718c]">i</span>
      <span className="pointer-events-none absolute left-1/2 top-[120%] z-30 w-56 -translate-x-1/2 rounded-lg border border-[#cfe0ee] bg-white px-2 py-1 text-[11px] text-[#334155] opacity-0 shadow-[0_8px_22px_rgba(15,23,42,0.14)] transition group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}

function LiveStatusChip({
  label,
  value,
  status,
  explanation,
  thresholdSummary
}: {
  label: string;
  value: string;
  status: StatusTone;
  explanation: string;
  thresholdSummary: string;
}) {
  return (
    <div className="group relative">
      <button type="button" className={`w-full rounded-lg border px-2 py-1 text-left ${statusClass(status)}`}>
        <span className="font-medium">{label}</span>
        <span className="ml-1 opacity-80">{value}</span>
      </button>
      <div className="pointer-events-none absolute left-0 top-[108%] z-40 w-64 rounded-xl border border-[#cfe0ee] bg-white p-2 text-[11px] text-[#334155] opacity-0 shadow-[0_10px_30px_rgba(15,23,42,0.16)] transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <p className="m-0 font-semibold text-[#2E3A8C]">{label}</p>
        <p className="m-0 mt-1">{explanation}</p>
        <p className="m-0 mt-1 text-[#64748B]">{thresholdSummary}</p>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  status,
  explanation,
  info,
  displayValue
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  status?: StatusTone;
  explanation?: string;
  info?: string;
  displayValue?: string;
}) {
  return (
    <label className="block space-y-1">
      <div className="flex justify-between text-xs text-[#64748B]">
        <span className="inline-flex items-center gap-1">
          {label}
          {info ? <SliderInfo text={info} /> : null}
        </span>
        <span
          title={explanation}
          className={`rounded-full border px-2 py-0.5 text-[11px] ${status ? statusClass(status) : "border-[#d3e4f1] bg-white text-[#334155]"}`}
        >
          {displayValue ?? value}
        </span>
      </div>
      <input className="focus-ring w-full accent-[#3DA9FC]" type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function ScenarioControls({ inputs, setInputs, stressors, setStressors, section, outputs, lastAction }: ScenarioControlsProps) {
  const context = {
    lastAction,
    sliders: {
      meal_size: inputs.meal_size,
      activity: inputs.activity,
      insulin_sensitivity: inputs.insulin_sensitivity,
      beta_cell_function: inputs.beta_cell_function,
      inflammation: inputs.inflammation
    }
  };
  const sensitivityStatus = getMetricStatus("insulinSensitivity", inputs.insulin_sensitivity, context);
  const betaStatus = getMetricStatus("betaCellFunction", inputs.beta_cell_function, context);
  const inflammationStatus = getMetricStatus("inflammation", inputs.inflammation, context);
  const liveGlucose = outputs ? getMetricStatus("glucose", outputs.glucose_level, context) : null;
  const liveInsulin = outputs ? getMetricStatus("insulinLevel", outputs.insulin_level, context) : null;
  const liveHepatic = outputs ? getMetricStatus("hepaticOutput", outputs.hepatic_output, context) : null;
  const liveUptake = outputs ? getMetricStatus("peripheralUptake", outputs.peripheral_uptake, context) : null;

  return (
    <div className="glass-panel space-y-3 p-4">
      <h3 className="text-sm font-semibold text-[#2E3A8C]">Scenario Controls</h3>

      <SliderRow
        label={evidence.sliders.carbs_g.label}
        value={inputs.meal_size}
        min={evidence.sliders.carbs_g.min}
        max={evidence.sliders.carbs_g.max}
        step={evidence.sliders.carbs_g.step}
        info={evidence.sliders.carbs_g.mapping_notes}
        displayValue={`${Math.round(inputs.meal_size)} g`}
        onChange={(value) => setInputs((current) => ({ ...current, meal_size: value }))}
      />
      <SliderRow
        label={evidence.sliders.activity_min.label}
        value={inputs.activity}
        min={evidence.sliders.activity_min.min}
        max={evidence.sliders.activity_min.max}
        step={evidence.sliders.activity_min.step}
        info={evidence.sliders.activity_min.mapping_notes}
        displayValue={`${Math.round(inputs.activity)} min`}
        onChange={(value) => setInputs((current) => ({ ...current, activity: value }))}
      />

      {(section === "resistance" || section === "beta" || section === "complications") ? (
        <>
          <SliderRow
            label="Insulin sensitivity"
            value={Math.round(inputs.insulin_sensitivity * 100)}
            min={0}
            max={100}
            status={sensitivityStatus.status}
            explanation={sensitivityStatus.explanation}
            onChange={(value) => setInputs((current) => ({ ...current, insulin_sensitivity: value / 100 }))}
          />
          <SliderRow
            label="Beta-cell function"
            value={Math.round(inputs.beta_cell_function * 100)}
            min={0}
            max={100}
            status={betaStatus.status}
            explanation={betaStatus.explanation}
            onChange={(value) => setInputs((current) => ({ ...current, beta_cell_function: value / 100 }))}
          />
          <SliderRow
            label="Inflammation"
            value={Math.round(inputs.inflammation * 100)}
            min={0}
            max={100}
            status={inflammationStatus.status}
            explanation={inflammationStatus.explanation}
            onChange={(value) => setInputs((current) => ({ ...current, inflammation: value / 100 }))}
          />
        </>
      ) : null}

      {(section === "resistance" || section === "beta") ? (
        <div className="space-y-2 pt-1 text-xs text-[#334155]">
          <p className="uppercase tracking-wider text-[#64748B]">Stressors</p>
          {([
            ["visceralFat", "Visceral fat"],
            ["inflammationLoad", "Inflammation"],
            ["sedentary", "Sedentary"],
            ["highFFA", "High FFA"]
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between rounded-xl border border-[#d9e8f6] bg-white px-2 py-1">
              <span>{label}</span>
              <input className="accent-[#0FB9B1]" type="checkbox" checked={stressors[key]} onChange={(event) => setStressors((current) => ({ ...current, [key]: event.target.checked }))} />
            </label>
          ))}
        </div>
      ) : null}

      {liveGlucose && liveInsulin && liveHepatic && liveUptake ? (
        <div className="rounded-xl border border-[#d8e7f4] bg-[#f8fcff] p-2">
          <p className="mb-2 text-[11px] uppercase tracking-wider text-[#64748B]">Live status (hover or focus for details)</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <LiveStatusChip label="Glucose" value={`${outputs?.glucose_level ?? 0} mg/dL`} status={liveGlucose.status} explanation={liveGlucose.explanation} thresholdSummary={liveGlucose.thresholdSummary} />
            <LiveStatusChip label="Insulin" value={`${outputs?.insulin_level ?? 0}`} status={liveInsulin.status} explanation={liveInsulin.explanation} thresholdSummary={liveInsulin.thresholdSummary} />
            <LiveStatusChip label="Hepatic output" value={`${outputs?.hepatic_output ?? 0}`} status={liveHepatic.status} explanation={liveHepatic.explanation} thresholdSummary={liveHepatic.thresholdSummary} />
            <LiveStatusChip label="Peripheral uptake" value={`${outputs?.peripheral_uptake ?? 0}`} status={liveUptake.status} explanation={liveUptake.explanation} thresholdSummary={liveUptake.thresholdSummary} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
