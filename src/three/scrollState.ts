/**
 * Scroll progress shared between the DOM scroll listener and the Three.js
 * frame loop. Plain mutable object — not React state — so scrolling never
 * triggers React re-renders.
 *
 * - `raw`      — 0..1 across the whole journey container. Drives the camera,
 *                including the intro "establishing shot" approach.
 * - `progress` — 0..1 city-development timeline. Stays at 0 through the
 *                intro dead zone (INTRO_END of raw scroll), then runs to 1.
 *                Everything staged (buildings, roads, flows, labels) reads
 *                this, so the intro scroll moves only the camera.
 */
export const scrollState = { progress: 0, raw: 0 };

/** Fraction of raw scroll reserved for the intro camera approach. */
export const INTRO_END = 0.14;
