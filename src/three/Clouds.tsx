import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** A few stylized puffy clouds drifting very slowly above the island. */

// Kept away from the city center so no view — including the portrait
// mobile framing — has a cloud blocking the diorama.
const CLOUDS: ReadonlyArray<{ pos: [number, number, number]; s: number }> = [
  { pos: [-14, 9.5, -10], s: 1.2 },
  { pos: [12, 11, -16], s: 1.5 },
  { pos: [-17, 11, 13], s: 1 },
];

function Puff({ s }: { s: number }) {
  return (
    <group scale={s}>
      <mesh>
        <sphereGeometry args={[1.1, 12, 10]} />
        <meshStandardMaterial color="#fffdf6" roughness={1} />
      </mesh>
      <mesh position={[1.2, -0.15, 0.2]}>
        <sphereGeometry args={[0.8, 12, 10]} />
        <meshStandardMaterial color="#fffdf6" roughness={1} />
      </mesh>
      <mesh position={[-1.1, -0.2, -0.1]}>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color="#fffdf6" roughness={1} />
      </mesh>
    </group>
  );
}

export function Clouds() {
  const refs = useRef<Array<THREE.Group | null>>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.x = CLOUDS[i].pos[0] + Math.sin(t * 0.025 + i * 2.1) * 2.5;
      g.position.y = CLOUDS[i].pos[1] + Math.sin(t * 0.11 + i) * 0.25;
    });
  });

  return (
    <>
      {CLOUDS.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={c.pos}
        >
          <Puff s={c.s} />
        </group>
      ))}
    </>
  );
}
