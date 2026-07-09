import { useMemo } from "react";
import * as THREE from "three";
import { heightAt, mulberry32 } from "./terrainMath";

const TREE_COUNT = 170;

/** Instanced low-poly trees scattered on the hills around the city. */
export function Trees() {
  const { trunks, cones } = useMemo(() => {
    const rng = mulberry32(1337);
    const dummy = new THREE.Object3D();

    const trunkGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.5, 5);
    const coneGeo = new THREE.ConeGeometry(0.55, 1.5, 6);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: "#8a6f52",
      roughness: 1,
      flatShading: true,
    });
    const coneMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 1,
      flatShading: true,
    });

    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, TREE_COUNT);
    const cones = new THREE.InstancedMesh(coneGeo, coneMat, TREE_COUNT);

    const palette = [
      new THREE.Color("#6f9a63"),
      new THREE.Color("#7fa876"),
      new THREE.Color("#93b98a"),
      new THREE.Color("#5c8354"),
    ];

    let placed = 0;
    while (placed < TREE_COUNT) {
      const angle = rng() * Math.PI * 2;
      const radius = 12.5 + Math.sqrt(rng()) * 13.5; // outside transit loop
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = heightAt(x, z);
      const s = 0.65 + rng() * 0.75;

      dummy.position.set(x, y + 0.22 * s, z);
      dummy.scale.setScalar(s);
      dummy.rotation.y = rng() * Math.PI;
      dummy.updateMatrix();
      trunks.setMatrixAt(placed, dummy.matrix);

      dummy.position.set(x, y + (0.45 + 0.75) * s, z);
      dummy.updateMatrix();
      cones.setMatrixAt(placed, dummy.matrix);
      cones.setColorAt(placed, palette[Math.floor(rng() * palette.length)]);
      placed++;
    }
    trunks.instanceMatrix.needsUpdate = true;
    cones.instanceMatrix.needsUpdate = true;
    if (cones.instanceColor) cones.instanceColor.needsUpdate = true;
    cones.castShadow = true;
    return { trunks, cones };
  }, []);

  return (
    <>
      <primitive object={trunks} />
      <primitive object={cones} />
    </>
  );
}
