import type { Effect } from "./types";

export function effectToFill(effect: Effect) {
  switch (effect) {
    case "positive":
      return { color: "var(--fill-positive)", level: 72, pulse: false };
    case "negative":
      return { color: "var(--fill-negative)", level: 72, pulse: false };
    case "neutral":
      return { color: "var(--fill-neutral)", level: 28, pulse: false };
    default:
      return { color: "transparent", level: 0, pulse: true };
  }
}
