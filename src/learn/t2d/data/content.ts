import type { HotspotContent, T2DView, T2DZoom } from "../types";

type ViewZoomMap = Partial<Record<T2DView, Partial<Record<T2DZoom, HotspotContent>>>> & {
  default: HotspotContent;
};

export const contentMap: Record<string, ViewZoomMap> = {
  "t2d-normal-organ-pancreas": {
    default: {
      title: "Pancreas",
      bullets: [
        "Beta cells sense blood glucose rise.",
        "Insulin release increases after meals.",
        "Signal adapts based on activity and demand."
      ],
      why: "Pancreatic timing shapes post-meal glucose control.",
      inSimulator: "Higher meal size demands stronger insulin response.",
      misconception: "Insulin is not always low early in T2D; it may be elevated during compensation.",
      quickLinks: [{ view: "flow", zoom: "cell", label: "See insulin signaling" }]
    }
  },
  "t2d-normal-organ-liver": {
    default: {
      title: "Liver",
      bullets: ["Produces glucose in fasting state.", "Insulin suppresses excess hepatic output.", "Resistance raises fasting glucose burden."],
      why: "Hepatic output is a major driver of fasting hyperglycemia.",
      inSimulator: "Hepatic Output Index worsens with inflammation and low sensitivity."
    }
  },
  "t2d-normal-organ-muscle": {
    default: {
      title: "Muscle",
      bullets: ["Primary site of insulin-mediated uptake.", "GLUT4 translocation increases glucose entry.", "Activity amplifies uptake."],
      why: "Skeletal muscle strongly influences post-prandial glucose clearance.",
      inSimulator: "Activity slider increases peripheral uptake index."
    }
  },
  "t2d-normal-organ-adipose": {
    default: {
      title: "Adipose Tissue",
      bullets: ["Regulates lipid flux and inflammatory signaling.", "Excess visceral fat worsens insulin signaling."],
      why: "Adipose-derived inflammation can propagate insulin resistance.",
      inSimulator: "Visceral fat and high FFA toggles reduce insulin sensitivity."
    }
  },
  "t2d-normal-organ-blood": {
    default: {
      title: "Bloodstream",
      bullets: ["Carries glucose and insulin signals.", "Curves summarize system-wide balance.", "Signals diverge as resistance rises."],
      why: "Blood markers reveal integrated physiology.",
      inSimulator: "Signal view charts update with every control change."
    }
  },
  "t2d-resistance-cell-insulin-receptor": {
    default: {
      title: "Insulin Receptor Signaling",
      bullets: ["Receptor activation weakens under inflammation and FFA stress.", "Downstream signaling to GLUT4 becomes less effective."],
      why: "Weak receptor signaling means more insulin for less glucose uptake.",
      inSimulator: "Insulin effectiveness drops as stress toggles are enabled.",
      quickLinks: [{ view: "signal", zoom: "cell", label: "See curve shift" }]
    }
  },
  "t2d-resistance-cell-glut4": {
    default: {
      title: "GLUT4 Translocation",
      bullets: ["GLUT4 moves to membrane after insulin signaling.", "Reduced translocation lowers peripheral uptake."],
      why: "This is a core bottleneck in insulin resistance.",
      inSimulator: "Peripheral uptake index falls when signaling weakens."
    }
  },
  "t2d-beta-tissue-islet": {
    default: {
      title: "Islet Dynamics",
      bullets: ["Early compensation raises insulin output.", "Chronic stress drives progressive beta-cell dysfunction."],
      why: "The transition from compensation to failure marks overt T2D progression.",
      inSimulator: "Stage slider maps to declining beta-cell function."
    }
  },
  "t2d-complications-organ-heart": {
    default: {
      title: "Heart Risk",
      bullets: ["Chronic hyperglycemia and inflammation increase vascular stress.", "Risk accumulates over exposure time."],
      why: "Cardiometabolic risk is a key long-horizon consequence.",
      inSimulator: "Exposure slider increases heart risk score."
    }
  },
  "t2d-complications-organ-kidney": {
    default: {
      title: "Kidney Risk",
      bullets: ["Glomerular stress rises with sustained hyperglycemia.", "Renal risk tracks chronic load and hepatic burden."],
      why: "Kidney injury is linked to prolonged metabolic stress.",
      inSimulator: "Kidney risk bar climbs as exposure and glucose rise."
    }
  },
  "t2d-complications-organ-eye": {
    default: {
      title: "Eye Risk",
      bullets: ["Retinal microvasculature is vulnerable to chronic glucose elevation."],
      why: "Microvascular injury can accumulate before symptoms are obvious.",
      inSimulator: "Eye risk responds to chronic glycemic load."
    }
  },
  "t2d-complications-organ-nerves": {
    default: {
      title: "Nerve Risk",
      bullets: ["Metabolic and vascular changes impair nerve health over time."],
      why: "Neuropathy risk grows with sustained dysglycemia.",
      inSimulator: "Nerve risk rises with higher exposure and inflammation."
    }
  },
  "t2d-complications-organ-brain": {
    default: {
      title: "Brain Risk",
      bullets: ["Neurovascular resilience may decline with chronic metabolic stress."],
      why: "Brain risk patterns are linked to cumulative vascular burden.",
      inSimulator: "Brain risk responds to exposure and control quality."
    }
  }
};

export function resolveContent(hotspotId: string | null, view: T2DView, zoom: T2DZoom): HotspotContent {
  if (!hotspotId) {
    return {
      title: "Select a highlighted region",
      bullets: [
        "Click a diagram structure to lock focus.",
        "Use View and Zoom toggles to switch perspectives.",
        "Use controls below to see physiology change in real time."
      ],
      why: "Focused interactions reduce cognitive overload and reveal mechanism links.",
      inSimulator: "In GlucoLogic, this impacts treatment reasoning and risk interpretation."
    };
  }

  const entry = contentMap[hotspotId];
  if (!entry) {
    return {
      title: hotspotId.split("-").join(" "),
      bullets: ["Content coming soon for this region."],
      why: "This area participates in glucose-insulin dynamics.",
      inSimulator: "In GlucoLogic, this impacts trend interpretation.",
      misconception: "If details are missing, use the Flow view to inspect pathway context."
    };
  }

  return entry[view]?.[zoom] ?? entry.default;
}
