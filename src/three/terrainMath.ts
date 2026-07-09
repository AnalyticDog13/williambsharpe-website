import { smoothstep } from "./phases";

/**
 * Procedural island shape shared by everything that sits on the ground
 * (terrain mesh, trees, flow paths, transit loop). Deterministic — no
 * Math.random — so the diorama looks identical on every load.
 */

export const CITY_RADIUS = 9.2; // flat district where buildings live
export const ISLAND_RADIUS = 32; // hills fade to flat cream beyond this

/** Terrain height at a world (x, z). Flat through the city + transit ring. */
export function heightAt(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const cityMask = smoothstep(10.8, 16, r); // 0 = flat city, 1 = open hills
  const edge = 1 - smoothstep(22, ISLAND_RADIUS, r);
  const n =
    Math.sin(x * 0.32 + 1.7) * Math.cos(z * 0.27 + 4.2) * 0.65 +
    Math.sin(x * 0.71 + 2.3) * Math.cos(z * 0.66 + 1.1) * 0.35 +
    Math.sin((x + z) * 0.18 + 0.6) * 0.28;
  return Math.max(0, n + 0.42) * 2.4 * cityMask * edge;
}

/** Small deterministic PRNG so scatter layouts are stable across loads. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
