/**
 * Scroll choreography for the 3D journey. Each named range is a slice of
 * the overall scroll progress (0..1). Tweak these to re-time the story.
 */
export type Range = readonly [number, number];

export const RANGES = {
  hero: [0, 0.14],
  foundation: [0.14, 0.3], // LA → Cornell: first buildings rise
  networks: [0.3, 0.47], // Operations Research: roads + flow lines
  automation: [0.47, 0.64], // AI + Automation: nodes + data pulses
  transit: [0.64, 0.81], // Transportation: transit loop animates
  pullback: [0.81, 1], // camera pulls back, full system alive
} as const satisfies Record<string, Range>;

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** 0→1 reveal eased across the first 65% of a range, holding at 1 after. */
export function revealT(p: number, range: Range): number {
  const [a, b] = range;
  return smoothstep(a, a + (b - a) * 0.65, p);
}

/** 0→1→0 window with soft fade edges — used for floating labels. */
export function windowT(p: number, range: Range, fade = 0.045): number {
  const [a, b] = range;
  return smoothstep(a, a + fade, p) * (1 - smoothstep(b - fade, b, p));
}
