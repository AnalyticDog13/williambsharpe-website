import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { revealT, RANGES } from "./phases";
import { scrollState } from "./scrollState";

/**
 * Street grid: two crossing avenues plus a ring road around the district.
 * Fades in during the "networks" phase.
 */
export function Roads({ complete = false }: { complete?: boolean }) {
  const matRefs = useRef<THREE.MeshStandardMaterial[]>([]);
  const collect = (m: THREE.MeshStandardMaterial | null) => {
    if (m && !matRefs.current.includes(m)) matRefs.current.push(m);
  };

  useFrame(() => {
    const t = complete ? 1 : revealT(scrollState.progress, RANGES.networks);
    for (const m of matRefs.current) m.opacity = t * 0.92;
  });

  const roadColor = "#4a504b";

  return (
    <group position={[0, 0.03, 0]}>
      <mesh>
        <boxGeometry args={[18.4, 0.05, 0.7]} />
        <meshStandardMaterial
          ref={collect}
          color={roadColor}
          transparent
          opacity={0}
          roughness={1}
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[18.4, 0.05, 0.7]} />
        <meshStandardMaterial
          ref={collect}
          color={roadColor}
          transparent
          opacity={0}
          roughness={1}
        />
      </mesh>
      {/* secondary cross streets between the building rows */}
      {[-4.6, 4.6].map((offset) => (
        <group key={offset}>
          <mesh position={[0, -0.005, offset]}>
            <boxGeometry args={[15.5, 0.04, 0.32]} />
            <meshStandardMaterial
              ref={collect}
              color={roadColor}
              transparent
              opacity={0}
              roughness={1}
            />
          </mesh>
          <mesh position={[offset, -0.005, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[15.5, 0.04, 0.32]} />
            <meshStandardMaterial
              ref={collect}
              color={roadColor}
              transparent
              opacity={0}
              roughness={1}
            />
          </mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.15, 9.8, 64]} />
        <meshStandardMaterial
          ref={collect}
          color={roadColor}
          transparent
          opacity={0}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
