import { useSyncExternalStore } from "react";

/**
 * Picks which hero to render:
 * - "journey"  — desktop: the full scroll-driven 3D experience
 * - "mobile"   — small screens: the completed 3D city under a fixed camera,
 *                no scroll-linked animation
 * - "fallback" — reduced motion or no WebGL: static illustrated hero
 *
 * Reacts live to viewport / preference changes.
 */
export type HeroMode = "journey" | "mobile" | "fallback";

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const hasWebgl = typeof document !== "undefined" ? webglAvailable() : false;

const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
const smallMq = window.matchMedia("(max-width: 767px)");

function subscribe(cb: () => void) {
  reducedMq.addEventListener("change", cb);
  smallMq.addEventListener("change", cb);
  return () => {
    reducedMq.removeEventListener("change", cb);
    smallMq.removeEventListener("change", cb);
  };
}

function getSnapshot(): HeroMode {
  if (!hasWebgl || reducedMq.matches) return "fallback";
  if (smallMq.matches) return "mobile";
  return "journey";
}

export function useHeroMode(): HeroMode {
  return useSyncExternalStore(subscribe, getSnapshot);
}
