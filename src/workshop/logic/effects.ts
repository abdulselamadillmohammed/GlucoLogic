import type { Effect } from "./types";

export function effectToFill(effect: Effect) {
  switch (effect) {
    case "positive":
      return { color: "rgba(60, 255, 160, 0.90)", level: 100, pulse: false };
    case "negative":
      return { color: "rgba(255, 70, 70, 0.90)", level: 100, pulse: false };
    case "neutral":
      return { color: "rgba(145, 157, 181, 0.35)", level: 15, pulse: false };
    default:
      return { color: "transparent", level: 0, pulse: true };
  }
}
