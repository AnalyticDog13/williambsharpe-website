import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { heightAt } from "./terrainMath";
import { revealT, RANGES } from "./phases";
import { scrollState } from "./scrollState";

/**
 * Transit loop circling the city with small vehicles running along it.
 * The route glows in and vehicles start moving during the "transit" phase.
 */

const LOOP_RADIUS = 10.6;
const VEHICLE_COUNT = 6;

export function Transit({ complete = false }: { complete?: boolean }) {
  const tubeMat = useRef<THREE.MeshBasicMaterial>(null);
  const vehiclesRef = useRef<THREE.InstancedMesh>(null);
  const progressRef = useRef(0); // accumulated travel so motion eases in

  const { curve, tube } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = 48;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      // slightly squashed loop so it reads as a route, not a perfect circle
      const r = LOOP_RADIUS + Math.sin(a * 3) * 0.5;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r * 0.94;
      pts.push(new THREE.Vector3(x, heightAt(x, z) + 0.12, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const tube = new THREE.TubeGeometry(curve, 96, 0.055, 6, true);
    return { curve, tube };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const t = complete ? 1 : revealT(scrollState.progress, RANGES.transit);
    if (tubeMat.current) tubeMat.current.opacity = t * 0.85;

    const mesh = vehiclesRef.current;
    if (!mesh) return;
    mesh.visible = t > 0.02;
    if (!mesh.visible) return;

    progressRef.current += delta * 0.02 * t; // speed eases in with the phase
    for (let i = 0; i < VEHICLE_COUNT; i++) {
      const u = (progressRef.current + i / VEHICLE_COUNT) % 1;
      curve.getPointAt(u, dummy.position);
      dummy.position.y += 0.16;
      curve.getPointAt((u + 0.01) % 1, ahead);
      ahead.y += 0.16;
      dummy.lookAt(ahead);
      dummy.scale.setScalar(t);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial
          ref={tubeMat}
          color="#c9a13f"
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
      <instancedMesh
        ref={vehiclesRef}
        args={[undefined, undefined, VEHICLE_COUNT]}
        visible={false}
        castShadow
      >
        <boxGeometry args={[0.28, 0.22, 0.62]} />
        <meshStandardMaterial color="#44607a" roughness={0.5} flatShading />
      </instancedMesh>
    </group>
  );
}
