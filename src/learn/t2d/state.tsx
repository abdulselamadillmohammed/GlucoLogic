/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useReducer, type Dispatch } from "react";
import type { ControlsState, T2DSection, T2DView, T2DZoom } from "./types";

interface T2DState {
  currentSection: T2DSection;
  view: T2DView;
  zoom: T2DZoom;
  selectedHotspotId: string | null;
  visitedHotspots: Set<string>;
  controls: ControlsState;
  quizResults: Record<T2DSection, boolean>;
  viewNotice: string | null;
}

type Action =
  | { type: "setSection"; section: T2DSection }
  | { type: "setView"; view: T2DView }
  | { type: "setZoom"; zoom: T2DZoom }
  | { type: "setSelectedHotspot"; hotspotId: string | null }
  | { type: "markVisited"; hotspotId: string }
  | { type: "setControls"; controls: Partial<ControlsState> }
  | { type: "setQuizResult"; section: T2DSection; pass: boolean }
  | { type: "setViewNotice"; notice: string | null }
  | { type: "demoMode" }
  | { type: "reset" };

const initialControls: ControlsState = {
  mealSize: 55,
  activity: 45,
  insulinSensitivity: 0.75,
  betaCellFunction: 0.85,
  inflammation: 0.25,
  ffaLoad: 0.25,
  stage: 1,
  exposure: 30,
  stressors: {
    visceralFat: false,
    inflammation: false,
    sedentary: false,
    highFFA: false
  }
};

const initialState: T2DState = {
  currentSection: "normal",
  view: "anatomy",
  zoom: "organ",
  selectedHotspotId: null,
  visitedHotspots: new Set<string>(),
  controls: initialControls,
  quizResults: {
    normal: false,
    resistance: false,
    beta: false,
    complications: false
  },
  viewNotice: null
};

function reducer(state: T2DState, action: Action): T2DState {
  switch (action.type) {
    case "setSection":
      return { ...state, currentSection: action.section, selectedHotspotId: null, viewNotice: null };
    case "setView":
      return { ...state, view: action.view };
    case "setZoom":
      return { ...state, zoom: action.zoom };
    case "setSelectedHotspot":
      return { ...state, selectedHotspotId: action.hotspotId };
    case "markVisited": {
      const next = new Set(state.visitedHotspots);
      next.add(action.hotspotId);
      return { ...state, visitedHotspots: next };
    }
    case "setControls":
      return { ...state, controls: { ...state.controls, ...action.controls } };
    case "setQuizResult":
      return { ...state, quizResults: { ...state.quizResults, [action.section]: action.pass } };
    case "setViewNotice":
      return { ...state, viewNotice: action.notice };
    case "demoMode": {
      const seed = new Set(state.visitedHotspots);
      ["t2d-normal-organ-pancreas", "t2d-resistance-cell-glut4", "t2d-beta-tissue-islet", "t2d-complications-organ-kidney"].forEach((id) =>
        seed.add(id)
      );
      return {
        ...state,
        currentSection: "normal",
        view: "flow",
        zoom: "organ",
        selectedHotspotId: "t2d-normal-organ-pancreas",
        visitedHotspots: seed,
        controls: { ...state.controls, mealSize: 70, activity: 30, stage: 2, exposure: 55 }
      };
    }
    case "reset":
      return initialState;
    default:
      return state;
  }
}

const Ctx = createContext<{ state: T2DState; dispatch: Dispatch<Action> } | null>(null);

export function T2DProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT2D() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useT2D must be used in T2DProvider");
  return ctx;
}
