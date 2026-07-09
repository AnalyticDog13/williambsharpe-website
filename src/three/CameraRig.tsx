import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { smoothstep } from "./phases";
import { scrollState } from "./scrollState";

/**
 * Scroll-driven cinematic camera. Keyframes define the flight path; the
 * camera exponentially damps toward the interpolated target so motion
 * stays smooth even when the user flicks the scroll wheel.
 */

interface Key {
  t: number;
  pos: [number, number, number];
  look: [number, number, number];
}

// The camera flight path. `t` is RAW scroll progress (0..1). The first
// segment (0 → 0.14) is the intro: an airy establishing shot — high, far
// back, aimed above the island so the terrain sits low with plenty of
// sky — that glides down and forward before the staged city timeline
// starts. The close-up keys sit ~20% farther from their look targets than
// the city-scale would suggest, so floating labels have room to breathe.
const KEYS: Key[] = [
  { t: 0.0, pos: [0, 21, 40], look: [0, 9, 0] }, // establishing: close, aimed high — island low, sky above
  { t: 0.14, pos: [0, 20, 38], look: [0, 0, 0] }, // intro tilts down into the hero framing
  { t: 0.28, pos: [17, 10.5, 27.5], look: [0, 1, 0] }, // glide down to foundation
  { t: 0.43, pos: [21.5, 8.2, -4.8], look: [1, 1, 0] }, // orbit: roads light up
  { t: 0.59, pos: [1.2, 6.9, -21], look: [0, 1.5, -2] }, // behind: automation nodes
  { t: 0.74, pos: [-18.6, 8.2, 8.4], look: [-3, 1, 0] }, // side: transit loop
  { t: 0.88, pos: [-8, 14, 22], look: [0, 0.5, 0] }, // begin pull-back
  { t: 1.0, pos: [0, 29, 42], look: [0, 0, 0] }, // full-system overview
];

export function CameraRig() {
  const posTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const lookCurrent = useRef(new THREE.Vector3(0, 9, 0));
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }, delta) => {
    const p = scrollState.raw;

    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].t) i++;
    const k0 = KEYS[i];
    const k1 = KEYS[i + 1];
    const local = smoothstep(k0.t, k1.t, p);

    a.set(...k0.pos);
    b.set(...k1.pos);
    posTarget.lerpVectors(a, b, local);

    a.set(...k0.look);
    b.set(...k1.look);
    lookTarget.lerpVectors(a, b, local);

    // gentle idle drift so the scene feels alive between scrolls
    const t = clock.elapsedTime;
    posTarget.x += Math.sin(t * 0.22) * 0.25;
    posTarget.y += Math.sin(t * 0.3 + 1) * 0.18;

    const damp = 1 - Math.exp(-4.2 * delta);
    camera.position.lerp(posTarget, damp);
    lookCurrent.current.lerp(lookTarget, damp);
    camera.lookAt(lookCurrent.current);
  });

  return null;
}
