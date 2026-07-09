import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { heightAt } from "./terrainMath";
import { revealT, RANGES } from "./phases";
import { scrollState } from "./scrollState";

/**
 * AI / automation control points: small pedestals with a floating amber
 * orb. They scale in during the "automation" phase; orbs bob gently.
 */

const NODE_POSITIONS: ReadonlyArray<[number, number]> = [
  [-4.6, -6.2],
  [6.2, -4.4],
  [5.4, 6.4],
  [-6.8, 4.2],
  [0.6, -8.4],
  [-8.6, -0.8],
];

export function Nodes({ complete = false }: { complete?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame(({ clock }) => {
    const t = complete ? 1 : revealT(scrollState.progress, RANGES.automation);
    const g = groupRef.current;
    if (!g) return;
    g.visible = t > 0.001;
    g.scale.setScalar(Math.max(t, 0.001));
    const time = clock.elapsedTime;
    orbRefs.current.forEach((orb, i) => {
      if (orb) orb.position.y = 1.15 + Math.sin(time * 1.1 + i * 1.9) * 0.09;
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {NODE_POSITIONS.map(([x, z], i) => {
        const y = heightAt(x, z);
        return (
          <group key={i} position={[x, y, z]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.2, 0.6, 6]} />
              <meshStandardMaterial color="#44607a" roughness={0.8} flatShading />
            </mesh>
            <mesh
              ref={(el) => {
                orbRefs.current[i] = el;
              }}
              position={[0, 1.15, 0]}
            >
              <icosahedronGeometry args={[0.18, 0]} />
              <meshBasicMaterial color="#f0c95c" toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.5, 24]} />
              <meshBasicMaterial
                color="#e4c368"
                transparent
                opacity={0.55}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
