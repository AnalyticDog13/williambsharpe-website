import { useMemo } from "react";
import * as THREE from "three";
import { heightAt } from "./terrainMath";
import { smoothstep } from "./phases";

/**
 * Low-poly island terrain: a displaced, vertex-colored plane with a flat
 * plateau in the middle where the city sits. Flat shading gives it the
 * faceted "miniature model" look without any textures.
 */
export function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(130, 130, 88, 88);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);

    const plaza = new THREE.Color("#cfd6ae");
    const lowGrass = new THREE.Color("#8fb381");
    const highGrass = new THREE.Color("#b9cfa0");
    const edgeCream = new THREE.Color("#efe8d4");
    const c = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);

      const r = Math.hypot(x, z);
      c.copy(lowGrass).lerp(highGrass, smoothstep(0.2, 2.2, h));
      // blend to a warm plaza tone inside the city district
      c.lerp(plaza, 1 - smoothstep(5, 10, r));
      // melt into the cream backdrop at the island's edge
      c.lerp(edgeCream, smoothstep(23, 32, r));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </mesh>
      {/* endless cream ground so the island melts into fog, not a hard edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <circleGeometry args={[300, 48]} />
        <meshBasicMaterial color="#f4efe0" />
      </mesh>
    </>
  );
}
