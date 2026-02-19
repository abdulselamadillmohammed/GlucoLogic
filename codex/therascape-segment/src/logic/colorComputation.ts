import type { StatusColor } from "./types";

export const LIGHT_THEME_TOKENS = {
  bg: {
    base: "#F7FBFF",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F8FF",
    card: "rgba(255,255,255,0.78)",
    cardBorder: "rgba(20,60,90,0.10)"
  },
  text: {
    primary: "#0F172A",
    secondary: "#334155",
    muted: "#64748B",
    inverse: "#FFFFFF"
  },
  accent: {
    primary: "#0FB9B1",
    secondary: "#3DA9FC",
    mint: "#6EE7B7",
    indigo: "#2E3A8C",
    warning: "#FFB020",
    danger: "#FF6B6B"
  },
  chart: {
    safe: "#10B981",
    warn: "#F59E0B",
    risk: "#EF4444"
  }
} as const;

export interface BubbleColorSet {
  fill: string;
  border: string;
  text: string;
  glow: string;
  mutedOpacity: number;
}

export function scoreToStatus(score: number): StatusColor {
  if (score <= 1.4) return "green";
  if (score <= 2.2) return "yellow";
  return "red";
}

export function computeBubbleColors(status: StatusColor, active = false): BubbleColorSet {
  const opacity = active ? 1 : 0.86;

  if (status === "green") {
    return {
      fill: `rgba(110, 231, 183, ${active ? 0.34 : 0.24})`,
      border: LIGHT_THEME_TOKENS.chart.safe,
      text: LIGHT_THEME_TOKENS.text.primary,
      glow: `0 0 0 1px ${LIGHT_THEME_TOKENS.chart.safe}33, 0 8px 24px rgba(16, 185, 129, ${active ? 0.28 : 0.18})`,
      mutedOpacity: opacity
    };
  }

  if (status === "yellow") {
    return {
      fill: `rgba(255, 176, 32, ${active ? 0.28 : 0.2})`,
      border: LIGHT_THEME_TOKENS.chart.warn,
      text: LIGHT_THEME_TOKENS.text.primary,
      glow: `0 0 0 1px ${LIGHT_THEME_TOKENS.chart.warn}33, 0 8px 24px rgba(245, 158, 11, ${active ? 0.24 : 0.14})`,
      mutedOpacity: opacity
    };
  }

  return {
    fill: `rgba(255, 107, 107, ${active ? 0.28 : 0.2})`,
    border: LIGHT_THEME_TOKENS.chart.risk,
    text: LIGHT_THEME_TOKENS.text.primary,
    glow: `0 0 0 1px ${LIGHT_THEME_TOKENS.chart.risk}33, 0 8px 24px rgba(239, 68, 68, ${active ? 0.26 : 0.14})`,
    mutedOpacity: opacity
  };
}

export function computeMapBackground() {
  return "linear-gradient(180deg, #F7FBFF 0%, #EAF6FF 40%, #FDFEFF 100%)";
}
