import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import { GlucoCoach } from "../coach/GlucoCoach";
import { DiagramModal } from "../components/DiagramModal";
import { InfoDrawer } from "../components/InfoDrawer";
import { InteractiveBodyFigure } from "../components/InteractiveBodyFigure";
import { MetricChip } from "../components/MetricChip";
import { MiniTrendChart } from "../components/MiniTrendChart";
import { PathwayDiagram } from "../components/PathwayDiagram";
import { RiskMeter } from "../components/RiskMeter";
import { ScenarioControls, type StressToggles } from "../components/ScenarioControls";
import { ViewDiagramButton } from "../components/ViewDiagramButton";
import { DIAGRAMS, getDiagram } from "../data/diagrams";
import { GLOSSARY_TERMS, type GlossaryCategory } from "../data/glossaryTerms";
import { evidence } from "../data/evidence";
import { betaEdges, betaNodes } from "../diagrams/reactflow/betaFailure";
import { resistanceEdges, resistanceNodes } from "../diagrams/reactflow/insulinResistance";
import { normalEdges, normalNodes } from "../diagrams/reactflow/normalRegulation";
import { complicationsEdges, complicationsNodes } from "../diagrams/reactflow/systemicComplications";
import { buildTrend, simulateT2D, type SimulationInputs } from "../model/simulation";
import { getMetricStatus } from "../model/statusRules";
import pancreasSvg from "../diagrams/svg/pancreas_insulin.svg";
import liverSvg from "../diagrams/svg/liver_output.svg";
import muscleSvg from "../diagrams/svg/muscle_glut4.svg";
import adiposeSvg from "../diagrams/svg/adipose_ffa.svg";
import kidneySvg from "../diagrams/svg/kidney_filtration.svg";
import heartSvg from "../diagrams/svg/heart_vascular.svg";
import eyeSvg from "../diagrams/svg/eye_retinal.svg";
import nervesSvg from "../diagrams/svg/nerves_signal.svg";
import brainSvg from "../diagrams/svg/brain_neurovascular.svg";

type SectionId = "overview" | "normal" | "resistance" | "beta" | "complications" | "glossary";

type OrganKey = "pancreas" | "liver" | "muscle" | "adipose" | "kidney" | "heart" | "eye" | "nerves" | "brain";
type DiagramKey = keyof typeof DIAGRAMS;

const SECTION_IDS: SectionId[] = ["overview", "normal", "resistance", "beta", "complications", "glossary"];

const SECTION_META: Record<SectionId, { title: string; question: string }> = {
  overview: { title: "Overview", question: "How does healthy glucose control drift into Type 2 Diabetes physiology over time?" },
  normal: { title: "Normal Regulation", question: "Which organs coordinate to return glucose toward baseline after a meal?" },
  resistance: { title: "Insulin Resistance", question: "When signaling weakens, what changes first: glucose, insulin, or uptake?" },
  beta: { title: "Beta Cell Failure", question: "How does compensation eventually fail and expose fasting and post-meal hyperglycemia?" },
  complications: { title: "Complications", question: "How does chronic hyperglycemia exposure propagate risk across organs?" },
  glossary: { title: "Glossary", question: "Need quick definitions while you explore?" }
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "normal", label: "Normal Regulation" },
  { id: "resistance", label: "Insulin Resistance" },
  { id: "beta", label: "Beta Cell Failure" },
  { id: "complications", label: "Complications" },
  { id: "glossary", label: "Glossary" }
] as const;

const ORGAN_INFO: Record<OrganKey, { label: string; svg: string; text: string; why: string; metric: string }> = {
  pancreas: {
    label: "Pancreas",
    svg: pancreasSvg,
    text: "Beta-cell signaling releases insulin pulses that shape post-meal glucose clearance.",
    why: "When response timing shifts, peak glucose and recovery both worsen.",
    metric: "Insulin level"
  },
  liver: {
    label: "Liver",
    svg: liverSvg,
    text: "Liver output should fall after insulin rise; resistance keeps output inappropriately high.",
    why: "Persistent hepatic output drives fasting and pre-meal hyperglycemia.",
    metric: "Hepatic Output Index"
  },
  muscle: {
    label: "Muscle",
    svg: muscleSvg,
    text: "GLUT4 translocation is central for uptake in skeletal muscle after meals.",
    why: "Impaired uptake leaves more glucose in circulation longer.",
    metric: "Peripheral Uptake Index"
  },
  adipose: {
    label: "Adipose",
    svg: adiposeSvg,
    text: "Visceral adipose can amplify inflammation and free fatty acid signaling.",
    why: "This worsens sensitivity and feeds resistance loops.",
    metric: "Insulin effectiveness"
  },
  kidney: {
    label: "Kidney",
    svg: kidneySvg,
    text: "Kidney microvasculature and filtration dynamics are sensitive to prolonged glycemic stress in this simulation. As chronic exposure rises, the renal signal climbs more steeply than many other organ proxies.",
    why: "Rising kidney risk suggests worsening filtration reserve under sustained metabolic burden.",
    metric: "Kidney risk"
  },
  heart: {
    label: "Heart",
    svg: heartSvg,
    text: "Cardiovascular stress in this model increases with cumulative dysglycemia and inflammatory pressure. The heart hotspot helps learners track how sustained load changes long-range vascular risk signals.",
    why: "Persistent elevation implies higher cardio-metabolic vulnerability over time.",
    metric: "Heart risk"
  },
  eye: {
    label: "Eye",
    svg: eyeSvg,
    text: "Retinal microvascular sensitivity is represented as an eye risk trajectory that rises with chronic exposure. This gives a focused view of how unstable glycemic control can affect visual tissue over time.",
    why: "Steady increase indicates accumulating microvascular strain in the eye pathway.",
    metric: "Eye risk"
  },
  nerves: {
    label: "Nerves",
    svg: nervesSvg,
    text: "Peripheral nerve pathways in this module reflect combined metabolic and microvascular stress load. Higher chronic burden increases the nerve signal and highlights neuropathy-oriented risk progression.",
    why: "A rising nerve trajectory reflects worsening neurovascular resilience.",
    metric: "Nerve risk"
  },
  brain: {
    label: "Brain",
    svg: brainSvg,
    text: "Brain risk represents neurovascular strain under chronic metabolic load in this educational model. It allows side-by-side comparison against heart and kidney trajectories during prolonged dysglycemia.",
    why: "Persistent upward drift suggests worsening cerebral vascular stress conditions.",
    metric: "Brain risk"
  }
};

type ChallengeState = { done: boolean; feedback: string };

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function smoothScrollTo(targetY: number, duration = 420) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const start = performance.now();

  function frame(now: number) {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(t);
    window.scrollTo(0, startY + distance * eased);
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function DiagramQuickAccess({
  title,
  subtitle,
  items,
  onOpen
}: {
  title: string;
  subtitle?: string;
  items: Array<{ key: DiagramKey; label: string; tag?: string }>;
  onOpen: (key: DiagramKey) => void;
}) {
  return (
    <div className="glass-panel p-3">
      <div className="mb-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-[#64748B]">{title}</p>
        {subtitle ? <p className="m-0 mt-1 text-sm text-[#334155]">{subtitle}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item.key} className="inline-flex items-center gap-1 rounded-xl border border-[#d6e6f3] bg-white/80 px-1 py-1">
            <ViewDiagramButton label={item.label} onClick={() => onOpen(item.key)} />
            {item.tag ? <span className="rounded-full bg-[#e7f3ff] px-2 py-1 text-[10px] font-semibold text-[#2E3A8C]">{item.tag}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function T2DPhysiologyPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [lastAction, setLastAction] = useState("Loaded module");

  const [inputs, setInputs] = useState<SimulationInputs>({
    meal_size: 60,
    activity: 25,
    insulin_sensitivity: 0.78,
    beta_cell_function: 0.86,
    inflammation: 0.2
  });
  const [stressors, setStressors] = useState<StressToggles>({ visceralFat: false, inflammationLoad: false, sedentary: false, highFFA: false });
  const [progression, setProgression] = useState(20);
  const [exposure, setExposure] = useState(35);

  const [activeOrgan, setActiveOrgan] = useState<OrganKey>("pancreas");
  const [organModalOpen, setOrganModalOpen] = useState(false);
  const [activeDiagramKey, setActiveDiagramKey] = useState<DiagramKey | null>(null);
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [openGlossaryTermId, setOpenGlossaryTermId] = useState<string | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);

  const [challenges, setChallenges] = useState<Record<"normal" | "resistance" | "beta" | "complications", ChallengeState>>({
    normal: { done: false, feedback: "" },
    resistance: { done: false, feedback: "" },
    beta: { done: false, feedback: "" },
    complications: { done: false, feedback: "" }
  });

  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({ overview: null, normal: null, resistance: null, beta: null, complications: null, glossary: null });

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const full = Math.max(1, doc.scrollHeight - window.innerHeight);
      const y = window.scrollY;
      setScrollProgress(Math.round((y / full) * 100));
      setParallaxY(y);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const id = visible.target.getAttribute("data-section") as SectionId | null;
          if (id) setActiveSection(id);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.55] }
    );

    SECTION_IDS.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setInputsWithAction: Dispatch<SetStateAction<SimulationInputs>> = (update) => {
    setInputs((current) => {
      const next = typeof update === "function" ? update(current) : update;
      const changed = (Object.keys(next) as Array<keyof SimulationInputs>).find((key) => next[key] !== current[key]);
      if (changed) setLastAction(`changed ${String(changed)} to ${String(next[changed])}`);
      return next;
    });
  };

  const setStressorsWithAction: Dispatch<SetStateAction<StressToggles>> = (update) => {
    setStressors((current) => {
      const next = typeof update === "function" ? update(current) : update;
      const changed = (Object.keys(next) as Array<keyof StressToggles>).find((key) => next[key] !== current[key]);
      if (changed) setLastAction(`${String(changed)} ${next[changed] ? "enabled" : "disabled"}`);
      return next;
    });
  };

  const adjustedInputs = useMemo(() => {
    const next = { ...inputs };

    if (stressors.visceralFat) next.insulin_sensitivity = Math.max(0, next.insulin_sensitivity - 0.12);
    if (stressors.inflammationLoad) next.inflammation = Math.min(1, next.inflammation + 0.18);
    if (stressors.sedentary) next.activity = Math.max(evidence.sliders.activity_min.min, next.activity - 14);
    if (stressors.highFFA) {
      next.insulin_sensitivity = Math.max(0, next.insulin_sensitivity - 0.08);
      next.inflammation = Math.min(1, next.inflammation + 0.1);
    }

    const disease = progression / 100;
    next.beta_cell_function = Math.max(0.1, 1 - disease * 0.82);
    next.insulin_sensitivity = Math.max(0.2, next.insulin_sensitivity - disease * 0.25);

    const burden = exposure / 100;
    next.inflammation = Math.min(1, next.inflammation + burden * 0.35);

    return next;
  }, [inputs, stressors, progression, exposure]);

  const outputs = useMemo(() => simulateT2D(adjustedInputs), [adjustedInputs]);
  const trend = useMemo(() => buildTrend(adjustedInputs), [adjustedInputs]);
  const pulseKey = `${inputs.meal_size}-${inputs.activity}-${stressors.visceralFat}-${stressors.inflammationLoad}-${progression}-${exposure}`;
  const statusContext = useMemo(
    () => ({
      lastAction,
      sliders: {
        meal_size: inputs.meal_size,
        activity: inputs.activity,
        insulin_sensitivity: adjustedInputs.insulin_sensitivity,
        beta_cell_function: adjustedInputs.beta_cell_function,
        inflammation: adjustedInputs.inflammation,
        chronic_exposure: exposure
      }
    }),
    [adjustedInputs.beta_cell_function, adjustedInputs.inflammation, adjustedInputs.insulin_sensitivity, exposure, inputs.activity, inputs.meal_size, lastAction]
  );
  const fastingStatus = useMemo(() => getMetricStatus("fastingGlucose", outputs.fasting_glucose, statusContext), [outputs.fasting_glucose, statusContext]);
  const postMealStatus = useMemo(() => getMetricStatus("postprandialGlucose", outputs.postprandial_glucose, statusContext), [outputs.postprandial_glucose, statusContext]);
  const insulinEffectStatus = useMemo(() => getMetricStatus("insulinEffectiveness", outputs.insulin_effectiveness, statusContext), [outputs.insulin_effectiveness, statusContext]);
  const glucoseStatus = useMemo(() => getMetricStatus("glucose", outputs.glucose_level, statusContext), [outputs.glucose_level, statusContext]);
  const insulinStatus = useMemo(() => getMetricStatus("insulinLevel", outputs.insulin_level, statusContext), [outputs.insulin_level, statusContext]);
  const riskStatuses = useMemo(
    () => ({
      heart: getMetricStatus("riskScore", outputs.risk_scores.heart, statusContext),
      kidney: getMetricStatus("riskScore", outputs.risk_scores.kidney, statusContext),
      eye: getMetricStatus("riskScore", outputs.risk_scores.eye, statusContext),
      nerves: getMetricStatus("riskScore", outputs.risk_scores.nerves, statusContext),
      brain: getMetricStatus("riskScore", outputs.risk_scores.brain, statusContext)
    }),
    [outputs.risk_scores.brain, outputs.risk_scores.eye, outputs.risk_scores.heart, outputs.risk_scores.kidney, outputs.risk_scores.nerves, statusContext]
  );

  const coachContext = useMemo(
    () => ({
      currentSectionId: activeSection,
      currentOrganId: activeOrgan,
      sliders: {
        meal_size: inputs.meal_size,
        activity: inputs.activity,
        insulin_sensitivity: inputs.insulin_sensitivity,
        beta_cell_function: inputs.beta_cell_function,
        inflammation: inputs.inflammation,
        chronic_exposure: exposure
      },
      outputs: {
        glucose_level: outputs.glucose_level,
        insulin_level: outputs.insulin_level,
        hepatic_output: outputs.hepatic_output,
        peripheral_uptake: outputs.peripheral_uptake,
        risk_scores: outputs.risk_scores
      },
      lastAction
    }),
    [activeOrgan, activeSection, exposure, inputs, lastAction, outputs]
  );

  const sectionCompletion = useMemo(() => Math.round((Object.values(challenges).filter((c) => c.done).length / 4) * 100), [challenges]);
  const filteredGlossaryTerms = useMemo(() => {
    const query = glossaryQuery.trim().toLowerCase();
    if (!query) return GLOSSARY_TERMS;
    return GLOSSARY_TERMS.filter(
      (term) =>
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        term.whyItMatters.toLowerCase().includes(query)
    );
  }, [glossaryQuery]);
  const groupedGlossaryTerms = useMemo(() => {
    return filteredGlossaryTerms.reduce<Record<GlossaryCategory, typeof filteredGlossaryTerms>>(
      (groups, term) => {
        groups[term.category].push(term);
        return groups;
      },
      {
        "Core Mechanisms": [],
        Complications: []
      }
    );
  }, [filteredGlossaryTerms]);
  const organRiskValue = useMemo(() => {
    if (activeOrgan === "heart") return outputs.risk_scores.heart;
    if (activeOrgan === "kidney") return outputs.risk_scores.kidney;
    if (activeOrgan === "eye") return outputs.risk_scores.eye;
    if (activeOrgan === "nerves") return outputs.risk_scores.nerves;
    if (activeOrgan === "brain") return outputs.risk_scores.brain;
    return null;
  }, [activeOrgan, outputs.risk_scores.brain, outputs.risk_scores.eye, outputs.risk_scores.heart, outputs.risk_scores.kidney, outputs.risk_scores.nerves]);
  const activeDiagram = activeDiagramKey ? getDiagram(activeDiagramKey) : null;

  function goToSection(id: SectionId) {
    setLastAction(`navigated to ${id}`);
    const target = sectionRefs.current[id];
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - 84;
    smoothScrollTo(y, 420);
  }

  function openOrgan(organ: OrganKey) {
    setActiveOrgan(organ);
    setOrganModalOpen(true);
    setLastAction(`selected organ ${organ}`);
  }

  function openDiagram(diagramKey: DiagramKey) {
    setActiveDiagramKey(diagramKey);
    setDiagramModalOpen(true);
    setLastAction(`opened diagram ${diagramKey}`);
  }

  function openOrganFromBodyMap(organ: OrganKey) {
    if (organ === "eye") {
      openDiagram("complicationsEye");
      return;
    }
    if (organ === "brain" || organ === "nerves") {
      openDiagram("complicationsNeuro");
      return;
    }
    openOrgan(organ);
  }

  function runChallenge(section: "normal" | "resistance" | "beta" | "complications") {
    if (section === "normal") {
      const pass = outputs.postprandial_glucose < 190 && outputs.peripheral_uptake > 0.55;
      setChallenges((s) => ({ ...s, normal: { done: pass, feedback: pass ? "Great. You restored post-meal control with balanced uptake." : "Try higher activity and moderate meal size to reduce post-meal peak." } }));
      return;
    }
    if (section === "resistance") {
      const pass = stressors.visceralFat && stressors.highFFA && outputs.glucose_level > 170;
      setChallenges((s) => ({ ...s, resistance: { done: pass, feedback: pass ? "Correct. Glucose rises quickly when resistance stressors are active." : "Enable visceral fat + high FFA and observe glucose/uptake shift." } }));
      return;
    }
    if (section === "beta") {
      const pass = progression >= 60 && outputs.fasting_glucose > 125;
      setChallenges((s) => ({ ...s, beta: { done: pass, feedback: pass ? "Nice. You captured the compensation-to-failure transition." : "Move stage higher and note fasting glucose crossing diabetic range." } }));
      return;
    }

    const pass = exposure >= 65 && outputs.risk_scores.kidney > 60;
    setChallenges((s) => ({ ...s, complications: { done: pass, feedback: pass ? "Great. Chronic exposure increased organ risk as expected." : "Increase exposure and monitor kidney/heart risk bars." } }));
  }

  return (
    <div className="relative">
      <div className="parallax-bg" aria-hidden="true">
        <div className="parallax-blob teal" style={{ transform: `translateY(${parallaxY * 0.25}px)` }} />
        <div className="parallax-blob sky" style={{ transform: `translateY(${parallaxY * 0.18}px)` }} />
        <div className="parallax-blob mint" style={{ transform: `translateY(${parallaxY * 0.12}px)` }} />
        <div className="parallax-noise" />
      </div>

      <header className="toc-sticky">
        <div className="mx-auto max-w-[1260px] px-3 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h1 className="m-0 text-xl font-semibold text-[#2E3A8C]">Type 2 Diabetes Physiology (Humans)</h1>
              <p className="m-0 text-sm text-[#64748B]">Learn by exploring diagrams, controls, and micro-challenges.</p>
            </div>
            <button type="button" className="soft-btn primary focus-ring" onClick={() => {
              setInputs({ meal_size: 60, activity: 25, insulin_sensitivity: 0.78, beta_cell_function: 0.86, inflammation: 0.2 });
              setStressors({ visceralFat: false, inflammationLoad: false, sedentary: false, highFFA: false });
              setProgression(20);
              setExposure(35);
              setLastAction("reset demo state");
            }}>Reset Demo</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button key={tab.id} type="button" className={`pill-tab focus-ring ${activeSection === tab.id ? "active" : ""}`} onClick={() => goToSection(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-1">
            <div className="progress-track"><div className="progress-fill" style={{ width: `${scrollProgress}%` }} /></div>
            <p className="m-0 text-[11px] text-[#64748B]">Section challenges completed: {sectionCompletion}%</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1260px] flex-col gap-5 px-3 py-6">
        <section id="section-overview" data-section="overview" ref={(el) => { sectionRefs.current.overview = el; }} className="glass-panel section-shell fade-up">
          <h2 className="section-title">Overview</h2>
          <p className="section-question">{SECTION_META.overview.question}</p>
          <div className="section-underline mt-3" />
          <p className="section-copy mt-3">This module is educational and deterministic. Adjust physiology controls, compare pathways, and connect mechanism to risk trends in a clean visual flow.</p>
          <p className="section-copy">Tip: Click organ chips to open focused micro-diagrams with quick explanations.</p>
        </section>

        <motion.section id="section-normal" data-section="normal" ref={(el) => { sectionRefs.current.normal = el; }} className="section-shell normal" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.38 }}>
          <h2 className="section-title">A. Normal Regulation</h2>
          <p className="section-question">{SECTION_META.normal.question}</p>
          <div className="section-underline mt-3" />

          <div className="mt-4 space-y-4">
            <PathwayDiagram nodes={normalNodes} edges={normalEdges} title="Normal physiology pathway" pulseKey={pulseKey} />
            <DiagramQuickAccess
              title="Diagram Quick Access"
              subtitle="Start with the overview, then open pancreas and islet details."
              onOpen={openDiagram}
              items={[
                { key: "normalPrimary", label: "View regulation overview", tag: "Primary" },
                { key: "normalInsulinRelease", label: "Open insulin release", tag: "Pancreas" },
                { key: "normalIslet", label: "Open islet structure", tag: "Beta-cell" }
              ]}
            />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <MiniTrendChart
                data={trend}
                section="normal"
                glucoseLabel="Glucose"
                insulinLabel="Insulin"
                betaCellFunction={adjustedInputs.beta_cell_function}
                carbsGrams={inputs.meal_size}
                activityMinutes={inputs.activity}
                insulinSensitivity={adjustedInputs.insulin_sensitivity}
              />
              <ScenarioControls
                inputs={inputs}
                setInputs={setInputsWithAction}
                stressors={stressors}
                setStressors={setStressorsWithAction}
                section="normal"
                outputs={outputs}
                lastAction={lastAction}
              />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <MetricChip label="Fasting" value={`${outputs.fasting_glucose} mg/dL`} status={fastingStatus.status} explanation={fastingStatus.explanation} />
                <MetricChip label="Post-meal" value={`${outputs.postprandial_glucose} mg/dL`} status={postMealStatus.status} explanation={postMealStatus.explanation} />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["pancreas", "liver", "muscle", "adipose"] as OrganKey[]).map((organ) => (
                  <button key={organ} type="button" className="soft-btn focus-ring" onClick={() => openOrgan(organ)}>{ORGAN_INFO[organ].label}</button>
                ))}
              </div>
              <div className="glass-panel p-3">
                <p className="m-0 text-sm font-semibold text-[#2E3A8C]">Micro-challenge</p>
                <p className="mt-1 text-sm text-[#334155]">Bring glucose closer to baseline without overshooting insulin.</p>
                <button type="button" className="soft-btn primary focus-ring mt-2" onClick={() => runChallenge("normal")}>Check challenge</button>
                <p className="mt-2 text-sm text-[#334155]">{challenges.normal.feedback}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="section-resistance" data-section="resistance" ref={(el) => { sectionRefs.current.resistance = el; }} className="section-shell resistance" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.38, delay: 0.04 }}>
          <h2 className="section-title">B. Insulin Resistance</h2>
          <p className="section-question">{SECTION_META.resistance.question}</p>
          <div className="section-underline mt-3" />

          <div className="mt-4 space-y-4">
            <PathwayDiagram nodes={resistanceNodes} edges={resistanceEdges} title="Signaling weakens across receptor and GLUT4" pulseKey={pulseKey} />
            <DiagramQuickAccess
              title="Diagram Quick Access"
              subtitle="Use these to compare healthy vs resistant states and then inspect pathway detail."
              onOpen={openDiagram}
              items={[
                { key: "resistancePrimary", label: "Compare healthy vs T2D", tag: "Primary" },
                { key: "resistancePathway", label: "Open insulin pathway", tag: "GLUT4" }
              ]}
            />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <MiniTrendChart
                data={trend}
                section="resistance"
                glucoseLabel="Glucose response"
                insulinLabel="Insulin response"
                betaCellFunction={adjustedInputs.beta_cell_function}
                carbsGrams={inputs.meal_size}
                activityMinutes={inputs.activity}
                insulinSensitivity={adjustedInputs.insulin_sensitivity}
              />
              <ScenarioControls
                inputs={inputs}
                setInputs={setInputsWithAction}
                stressors={stressors}
                setStressors={setStressorsWithAction}
                section="resistance"
                outputs={outputs}
                lastAction={lastAction}
              />
            </div>
            <div className="space-y-4">
              <MetricChip
                label="Insulin effectiveness"
                value={`${Math.round(outputs.insulin_effectiveness * 100)}%`}
                status={insulinEffectStatus.status}
                explanation={insulinEffectStatus.explanation}
              />
              <div className="flex flex-wrap gap-2">
                {(["adipose", "liver", "muscle"] as OrganKey[]).map((organ) => (
                  <button key={organ} type="button" className="soft-btn focus-ring" onClick={() => openOrgan(organ)}>{ORGAN_INFO[organ].label}</button>
                ))}
              </div>
              <div className="glass-panel p-3">
                <p className="m-0 text-sm font-semibold text-[#2E3A8C]">Micro-challenge</p>
                <p className="mt-1 text-sm text-[#334155]">Increase resistance and identify which curve shifts first.</p>
                <button type="button" className="soft-btn primary focus-ring mt-2" onClick={() => runChallenge("resistance")}>Check challenge</button>
                <p className="mt-2 text-sm text-[#334155]">{challenges.resistance.feedback}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="section-beta" data-section="beta" ref={(el) => { sectionRefs.current.beta = el; }} className="section-shell beta" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.38, delay: 0.06 }}>
          <h2 className="section-title">{"C. Beta Cell Compensation -> Failure"}</h2>
          <p className="section-question">{SECTION_META.beta.question}</p>
          <div className="section-underline mt-3" />

          <div className="mt-4 space-y-4">
            <PathwayDiagram nodes={betaNodes} edges={betaEdges} title="Compensation phase to decline" pulseKey={pulseKey} />
            <DiagramQuickAccess
              title="Diagram Quick Access"
              subtitle="Open core beta timeline first, then optional enrichment diagrams."
              onOpen={openDiagram}
              items={[
                { key: "betaIsletTimeline", label: "Open islet timeline", tag: "Primary" },
                { key: "betaIncretinSecretion", label: "Open GIP/GLP-1 map", tag: "Enrichment" },
                { key: "betaIncretinDualMechanism", label: "Open gut-brain mechanism", tag: "Enrichment" }
              ]}
            />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <MiniTrendChart
                data={trend}
                section="beta"
                glucoseLabel="Post-meal glucose"
                insulinLabel="Beta-cell output"
                betaCellFunction={adjustedInputs.beta_cell_function}
                carbsGrams={inputs.meal_size}
                activityMinutes={inputs.activity}
                insulinSensitivity={adjustedInputs.insulin_sensitivity}
              />
              <div className="glass-panel p-4">
                <label className="block space-y-1">
                  <div className="flex items-center justify-between text-sm text-[#334155]"><span>Stage progression</span><span>{progression}%</span></div>
                  <input className="focus-ring w-full accent-[#3DA9FC]" type="range" min={0} max={100} value={progression} onChange={(e) => {
                    const value = Number(e.target.value);
                    setProgression(value);
                    setLastAction(`changed stage to ${value}`);
                  }} />
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <MetricChip label="Fasting glucose" value={`${outputs.fasting_glucose} mg/dL`} status={fastingStatus.status} explanation={fastingStatus.explanation} />
              <button type="button" className="soft-btn focus-ring" onClick={() => openOrgan("pancreas")}>Open Pancreas Micro-Diagram</button>
              <div className="glass-panel p-3">
                <p className="m-0 text-sm font-semibold text-[#2E3A8C]">Micro-challenge</p>
                <p className="mt-1 text-sm text-[#334155]">Move from compensation toward failure and spot the fasting crossover.</p>
                <button type="button" className="soft-btn primary focus-ring mt-2" onClick={() => runChallenge("beta")}>Check challenge</button>
                <p className="mt-2 text-sm text-[#334155]">{challenges.beta.feedback}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="section-complications" data-section="complications" ref={(el) => { sectionRefs.current.complications = el; }} className="section-shell complications" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.38, delay: 0.08 }}>
          <h2 className="section-title">D. Systemic Effects / Complications</h2>
          <p className="section-question">{SECTION_META.complications.question}</p>
          <div className="section-underline mt-3" />

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <PathwayDiagram nodes={complicationsNodes} edges={complicationsEdges} title="Chronic exposure to systemic risk" pulseKey={pulseKey} />
              <DiagramQuickAccess
                title="Diagram Quick Access"
                subtitle="Click Eye, Brain, or Nerves on the body map, or open them directly here."
                onOpen={openDiagram}
                items={[
                  { key: "complicationsEye", label: "Open retinopathy hallmarks", tag: "Eye" },
                  { key: "complicationsNeuro", label: "Open neuronal control", tag: "Brain/Nerves" }
                ]}
              />
              <div className="glass-panel p-4">
                <label className="block space-y-1">
                  <div className="flex items-center justify-between text-sm text-[#334155]"><span>Hyperglycemia exposure</span><span>{exposure}%</span></div>
                  <input className="focus-ring w-full accent-[#FF7A70]" type="range" min={0} max={100} value={exposure} onChange={(e) => {
                    const value = Number(e.target.value);
                    setExposure(value);
                    setLastAction(`changed chronic_exposure to ${value}`);
                  }} />
                </label>
              </div>
              <InteractiveBodyFigure
                risks={{
                  heart: outputs.risk_scores.heart,
                  kidney: outputs.risk_scores.kidney,
                  eye: outputs.risk_scores.eye,
                  nerves: outputs.risk_scores.nerves,
                  brain: outputs.risk_scores.brain
                }}
                activeOrgan={activeOrgan}
                onSelectOrgan={(organ) => openOrganFromBodyMap(organ)}
              />
            </div>

            <div className="space-y-4">
              <div className="glass-panel space-y-2 p-4">
                <RiskMeter label="Heart" value={outputs.risk_scores.heart} explanation={riskStatuses.heart.explanation} />
                <RiskMeter label="Kidney" value={outputs.risk_scores.kidney} explanation={riskStatuses.kidney.explanation} />
                <RiskMeter label="Eye" value={outputs.risk_scores.eye} explanation={riskStatuses.eye.explanation} />
                <RiskMeter label="Nerves" value={outputs.risk_scores.nerves} explanation={riskStatuses.nerves.explanation} />
                <RiskMeter label="Brain" value={outputs.risk_scores.brain} explanation={riskStatuses.brain.explanation} />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["heart", "kidney", "eye", "nerves", "brain"] as OrganKey[]).map((organ) => (
                  <button
                    key={organ}
                    type="button"
                    className="soft-btn focus-ring"
                    onClick={() => (organ === "eye" || organ === "brain" || organ === "nerves" ? openOrganFromBodyMap(organ) : openOrgan(organ))}
                  >
                    {ORGAN_INFO[organ].label}
                  </button>
                ))}
              </div>

              <div className="glass-panel p-3">
                <p className="m-0 text-sm font-semibold text-[#2E3A8C]">Micro-challenge</p>
                <p className="mt-1 text-sm text-[#334155]">Increase chronic exposure and detect which organ risk climbs fastest.</p>
                <button type="button" className="soft-btn primary focus-ring mt-2" onClick={() => runChallenge("complications")}>Check challenge</button>
                <p className="mt-2 text-sm text-[#334155]">{challenges.complications.feedback}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="section-glossary" data-section="glossary" ref={(el) => { sectionRefs.current.glossary = el; }} className="glass-panel section-shell" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.38, delay: 0.1 }}>
          <h2 className="section-title">Glossary</h2>
          <p className="section-question">{SECTION_META.glossary.question}</p>
          <div className="section-underline mt-3" />

          <div className="mt-4 space-y-4">
            <input
              type="search"
              value={glossaryQuery}
              onChange={(e) => setGlossaryQuery(e.target.value)}
              className="glossary-search focus-ring"
              placeholder="Search terms..."
              aria-label="Search glossary terms"
            />

            {(Object.keys(groupedGlossaryTerms) as GlossaryCategory[]).map((category) => (
              <div key={category} className="space-y-2">
                <p className="m-0 text-xs font-semibold uppercase tracking-widest text-[#64748B]">{category}</p>
                <div className="glossary-list">
                  {groupedGlossaryTerms[category].map((item) => {
                    const isOpen = openGlossaryTermId === item.id;
                    return (
                      <article key={item.id} className={`glossary-item ${isOpen ? "open" : ""}`}>
                        <button
                          type="button"
                          className="glossary-trigger focus-ring"
                          onClick={() => setOpenGlossaryTermId((current) => (current === item.id ? null : item.id))}
                          aria-expanded={isOpen}
                        >
                          <span>{item.term}</span>
                          <span className="text-[#64748B]">{isOpen ? "-" : "+"}</span>
                        </button>
                        <div className={`glossary-content ${isOpen ? "open" : ""}`}>
                          <div className="glossary-content-inner">
                            <p className="m-0 text-sm text-[#334155]">{item.definition}</p>
                            <p className="mt-1 text-xs text-[#64748B]"><strong>Why it matters here:</strong> {item.whyItMatters}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {groupedGlossaryTerms[category].length === 0 ? <p className="m-0 px-1 py-2 text-sm text-[#64748B]">No terms match your search.</p> : null}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      <DiagramModal
        open={diagramModalOpen}
        title={activeDiagram?.title ?? "Diagram"}
        description={activeDiagram?.shortExplanation ?? ""}
        alt={activeDiagram?.alt ?? "Diagram"}
        imageSrc={activeDiagram?.image}
        onClose={() => setDiagramModalOpen(false)}
      />

      <InfoDrawer open={organModalOpen} title={ORGAN_INFO[activeOrgan].label} onClose={() => setOrganModalOpen(false)}>
        <img src={ORGAN_INFO[activeOrgan].svg} alt={`${ORGAN_INFO[activeOrgan].label} mini diagram`} className="w-full rounded-xl border border-[#d8e7f5] bg-white p-2" />
        <p>{ORGAN_INFO[activeOrgan].text}</p>
        <p><strong>Why this matters:</strong> {ORGAN_INFO[activeOrgan].why}</p>
        <div className="grid grid-cols-3 gap-2">
          <MetricChip label="Glucose" value={`${outputs.glucose_level} mg/dL`} status={glucoseStatus.status} explanation={glucoseStatus.explanation} />
          <MetricChip label="Insulin" value={`${outputs.insulin_level}`} status={insulinStatus.status} explanation={insulinStatus.explanation} />
          <MetricChip label="What worsens?" value={ORGAN_INFO[activeOrgan].metric} status="warn" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MetricChip
            label="Risk score"
            value={organRiskValue === null ? "n/a" : `${Math.round(organRiskValue * 100)}%`}
            status={organRiskValue === null ? "warn" : getMetricStatus("riskScore", organRiskValue, statusContext).status}
          />
          <MetricChip
            label="Filtration proxy"
            value={`${Math.round(outputs.risk_scores.kidney * 100)}%`}
            status={getMetricStatus("riskScore", outputs.risk_scores.kidney, statusContext).status}
          />
          <MetricChip
            label="Neuropathy signal"
            value={`${Math.round(outputs.risk_scores.nerves * 100)}%`}
            status={getMetricStatus("riskScore", outputs.risk_scores.nerves, statusContext).status}
          />
        </div>
      </InfoDrawer>

      <GlucoCoach context={coachContext} />
    </div>
  );
}
