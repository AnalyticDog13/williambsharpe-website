import { Terrain } from "./Terrain";
import { Trees } from "./Trees";
import { City } from "./City";
import { Roads } from "./Roads";
import { Flows } from "./Flows";
import { Nodes } from "./Nodes";
import { Transit } from "./Transit";
import { Clouds } from "./Clouds";
import { Labels } from "./Labels";
import { CameraRig } from "./CameraRig";

/**
 * The complete diorama: lighting + terrain + staged city systems.
 * With `complete`, every system renders fully built and the scroll-driven
 * camera rig and floating labels are skipped — used for the mobile hero,
 * where the finished city sits under the header with a fixed camera.
 */
export function Scene({ complete = false }: { complete?: boolean }) {
  return (
    <>
      {/* warm, soft "afternoon model-shop" lighting */}
      <ambientLight intensity={0.55} color="#fff6e6" />
      <hemisphereLight args={["#cfe0ea", "#9db98c", 0.45]} />
      <directionalLight
        position={[18, 26, 12]}
        intensity={1.7}
        color="#ffedcf"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
      />
      {/* cream fog melts the island edge into the sky gradient. Starts
          beyond the plaza so the city center doesn't wash out at the
          hero camera distance. */}
      <fog attach="fog" args={["#eef0e4", 55, 108]} />

      <Terrain />
      <Trees />
      <City complete={complete} />
      <Roads complete={complete} />
      <Flows complete={complete} />
      <Nodes complete={complete} />
      <Transit complete={complete} />
      <Clouds />
      {!complete && <Labels />}
      {!complete && <CameraRig />}
    </>
  );
}
