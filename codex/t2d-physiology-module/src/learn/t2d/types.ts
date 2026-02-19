export type T2DSection = "normal" | "resistance" | "beta" | "complications";
export type T2DView = "anatomy" | "flow" | "signal";
export type T2DZoom = "organ" | "tissue" | "cell";

export interface ControlsState {
  mealSize: number;
  activity: number;
  insulinSensitivity: number;
  betaCellFunction: number;
  inflammation: number;
  ffaLoad: number;
  stage: 1 | 2 | 3 | 4;
  exposure: number;
  stressors: {
    visceralFat: boolean;
    inflammation: boolean;
    sedentary: boolean;
    highFFA: boolean;
  };
}

export interface CurvePoint {
  t: number;
  v: number;
}

export interface ModelOutputs {
  glucoseCurve: CurvePoint[];
  insulinCurve: CurvePoint[];
  metrics: {
    fastingGlucose: number;
    postMealPeak: number;
    hepaticOutputIndex: number;
    peripheralUptakeIndex: number;
  };
  risks: {
    heart: number;
    kidney: number;
    eye: number;
    nerves: number;
    brain: number;
  };
}

export interface HotspotContent {
  title: string;
  bullets: string[];
  why: string;
  inSimulator: string;
  misconception?: string;
  quickLinks?: { view: T2DView; zoom: T2DZoom; label: string }[];
}
