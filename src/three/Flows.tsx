import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { heightAt } from "./terrainMath";
import { revealT, RANGES } from "./phases";
import { scrollState } from "./scrollState";

/**
 * Glowing data/energy flow lines that arc from the island's edge into the
 * city, hugging the terrain. Tubes light up in the "networks" phase;
 * amber data pulses travel along them from the "automation" phase on.
 */

const FLOW_SPECS: ReadonlyArray<{ angle: number; endR: number; into: [number, number] }> = [
  { angle: 0.4, endR: 23, into: [2.5, 1.5] },
  { angle: 1.7, endR: 24, into: [-1.5, 3] },
  { angle: 2.9, endR: 22, into: [-3, -1] },
  { angle: 4.2, endR: 24, into: [0.5, -3.5] },
  { angle: 5.4, endR: 23, into: [3.5, -2] },
];

function buildCurve(spec: (typeof FLOW_SPECS)[number]): THREE.CatmullRomCurve3 {
  const [ix, iz] = spec.into;
  const ex = Math.cos(spec.angle) * spec.endR;
  const ez = Math.sin(spec.angle) * spec.endR;
  const pts: THREE.Vector3[] = [];
  const steps = 7;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // gentle lateral sway so the paths read as routes, not straight wires
    const sway = Math.sin(t * Math.PI * 1.6 + spec.angle * 3) * 1.6 * t;
    const x = ix + (ex - ix) * t + Math.cos(spec.angle + Math.PI / 2) * sway;
    const z = iz + (ez - iz) * t + Math.sin(spec.angle + Math.PI / 2) * sway;
    pts.push(new THREE.Vector3(x, heightAt(x, z) + 0.28, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

const PULSES_PER_CURVE = 2;

export function Flows({ complete = false }: { complete?: boolean }) {
  const tubeMats = useRef<THREE.MeshBasicMaterial[]>([]);
  const pulseRef = useRef<THREE.InstancedMesh>(null);

  const { curves, tubes } = useMemo(() => {
    const curves = FLOW_SPECS.map(buildCurve);
    const tubes = curves.map(
      (c) => new THREE.TubeGeometry(c, 56, 0.06, 6, false)
    );
    return { curves, tubes };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pulseCount = curves.length * PULSES_PER_CURVE;

  useFrame(({ clock }) => {
    const p = scrollState.progress;
    const lineT = complete ? 1 : revealT(p, RANGES.networks);
    for (const m of tubeMats.current) m.opacity = lineT * 0.75;

    const pulseT = complete ? 1 : revealT(p, RANGES.automation);
    const mesh = pulseRef.current;
    if (!mesh) return;
    mesh.visible = pulseT > 0.001;
    if (!mesh.visible) return;
    const time = clock.elapsedTime;
    let i = 0;
    for (let c = 0; c < curves.length; c++) {
      for (let k = 0; k < PULSES_PER_CURVE; k++) {
        const t = (time * 0.07 + c * 0.31 + k * 0.5) % 1;
        curves[c].getPointAt(t, dummy.position);
        dummy.position.y += 0.02;
        dummy.scale.setScalar(pulseT * (0.8 + 0.2 * Math.sin(time * 3 + i)));
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const collect = (m: THREE.MeshBasicMaterial | null) => {
    if (m && !tubeMats.current.includes(m)) tubeMats.current.push(m);
  };

  return (
    <group>
      {tubes.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial
            ref={collect}
            color="#5e7f9b"
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
      <instancedMesh ref={pulseRef} args={[undefined, undefined, pulseCount]} visible={false}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshBasicMaterial color="#f0c95c" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
