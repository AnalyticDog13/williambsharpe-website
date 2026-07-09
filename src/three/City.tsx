import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { heightAt, mulberry32 } from "./terrainMath";
import { smoothstep } from "./phases";
import { scrollState } from "./scrollState";

/**
 * The city: instanced box buildings laid on a street grid, grouped into
 * five concentric "development rings". Each ring's group Y-scale eases
 * from 0 → 1 in its own scroll window, so districts grow out of the
 * ground in stages as the user scrolls.
 *
 * Each building is assembled from several box instances for a more
 * realistic massing: a base volume, a slightly overhanging roof slab,
 * an optional stepped upper tier, and small rooftop units.
 */

// [start, end] scroll windows for each development ring (inner → outer)
const RING_WINDOWS: ReadonlyArray<readonly [number, number]> = [
  [0.1, 0.2],
  [0.24, 0.34],
  [0.4, 0.5],
  [0.55, 0.65],
  [0.67, 0.77],
];

interface Entry {
  x: number;
  y: number; // absolute center height
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color: THREE.Color;
}

const CHARCOAL = new THREE.Color("#2a2e2b");
const UNIT = new THREE.Color("#4a504b");

function roofTone(facade: THREE.Color): THREE.Color {
  return facade.clone().lerp(CHARCOAL, 0.35);
}

function buildRingEntries(): Entry[][] {
  const rng = mulberry32(4242);
  const paper = new THREE.Color("#f3eedf");
  const stone = new THREE.Color("#ddd6c4");
  const blue = new THREE.Color("#7d97ad");
  const moss = new THREE.Color("#96b489");
  const amber = new THREE.Color("#e2c67e");

  const rings: Entry[][] = RING_WINDOWS.map(() => []);

  const addBuilding = (
    ring: Entry[],
    x: number,
    z: number,
    wx: number,
    wz: number,
    h: number,
    color: THREE.Color,
    r: () => number
  ) => {
    const base = heightAt(x, z);
    // base volume
    ring.push({ x, y: base + h / 2, z, sx: wx, sy: h, sz: wz, color });
    // overhanging roof slab
    ring.push({
      x,
      y: base + h + 0.035,
      z,
      sx: wx * 1.07,
      sy: 0.07,
      sz: wz * 1.07,
      color: roofTone(color),
    });
    // stepped upper tier on some taller buildings
    let roofY = base + h + 0.07;
    if (h > 1.7 && r() < 0.45) {
      const th = 0.4 + r() * 0.6;
      const tx = wx * (0.55 + r() * 0.12);
      const tz = wz * (0.55 + r() * 0.12);
      ring.push({ x, y: roofY + th / 2, z, sx: tx, sy: th, sz: tz, color });
      ring.push({
        x,
        y: roofY + th + 0.03,
        z,
        sx: tx * 1.08,
        sy: 0.06,
        sz: tz * 1.08,
        color: roofTone(color),
      });
      roofY += th + 0.06;
    } else if (r() < 0.55) {
      // small rooftop unit (AC/mechanical) off-center on the roof
      const ox = (r() - 0.5) * (wx - 0.4);
      const oz = (r() - 0.5) * (wz - 0.4);
      ring.push({
        x: x + ox,
        y: roofY + 0.07,
        z: z + oz,
        sx: 0.18,
        sy: 0.14,
        sz: 0.24,
        color: UNIT,
      });
    }
  };

  for (let gx = -4; gx < 4; gx++) {
    for (let gz = -4; gz < 4; gz++) {
      const x = (gx + 0.5) * 2.3;
      const z = (gz + 0.5) * 2.3;
      const rr = Math.hypot(x, z);
      if (rr > 8.8) continue;
      if (rng() < 0.18) continue; // leave some lots as open plazas

      const roll = rng();
      const color =
        roll < 0.4
          ? paper
          : roll < 0.68
            ? stone
            : roll < 0.84
              ? blue
              : roll < 0.94
                ? moss
                : amber;
      const h = Math.max(0.7, (3.4 - rr * 0.24) * (0.55 + rng() * 0.85));
      const ringIdx = rr < 3 ? 0 : rr < 4.8 ? 1 : rr < 6.4 ? 2 : rr < 7.6 ? 3 : 4;
      const wx = 1.05 + rng() * 0.55;
      const wz = 1.05 + rng() * 0.55;
      addBuilding(rings[ringIdx], x, z, wx, wz, h, color, rng);
    }
  }

  // landmark "campus tower" in the first ring
  addBuilding(
    rings[0],
    -1.15,
    1.15,
    1.35,
    1.2,
    5,
    new THREE.Color("#5e7f9b"),
    rng
  );
  return rings;
}

export function City({ complete = false }: { complete?: boolean }) {
  const groupRefs = useRef<Array<THREE.Group | null>>([]);

  const rings = useMemo(() => {
    const ringEntries = buildRingEntries();
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const dummy = new THREE.Object3D();

    return ringEntries.map((entries) => {
      const mat = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.9,
        flatShading: true,
      });
      const mesh = new THREE.InstancedMesh(boxGeo, mat, entries.length);
      entries.forEach((e, i) => {
        dummy.position.set(e.x, e.y, e.z);
        dummy.scale.set(e.sx, e.sy, e.sz);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, e.color);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    });
  }, []);

  useFrame(() => {
    const p = scrollState.progress;
    RING_WINDOWS.forEach(([a, b], i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const t = complete ? 1 : smoothstep(a, b, p);
      g.visible = t > 0.001;
      g.scale.y = Math.max(t, 0.001);
    });
  });

  return (
    <>
      {rings.map((mesh, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          visible={false}
        >
          <primitive object={mesh} />
        </group>
      ))}
    </>
  );
}
