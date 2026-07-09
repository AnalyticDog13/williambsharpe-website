import { Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Scene } from "../three/Scene";
import { site } from "../data/site";
import { PillLink, ArrowUpRight } from "./Buttons";

/**
 * Mobile hero: the finished city diorama under a fixed camera — no
 * scroll-driven animation. The page simply scrolls past it. Vehicles,
 * data pulses, and clouds still animate gently so it feels alive.
 */

// Flat, low camera aimed above the city: the diorama sits low in the
// portrait frame with generous sky above, beneath the header text.
function FixedCamera() {
  const camera = useThree((s) => s.camera);
  camera.lookAt(0, 10, 0);
  return null;
}

export function MobileHero() {
  return (
    <section id="top" className="sky relative h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ fov: 46, position: [0, 15, 45], near: 0.5, far: 160 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <FixedCamera />
            <Scene complete />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pt-24 text-center pointer-events-none">
        <p className="eyebrow hero-glow text-charcoal mb-4">{site.heroTagline}</p>
        <h1 className="display text-charcoal text-[clamp(2.4rem,11vw,3.6rem)]">
          William B.
          <br />
          Sharpe
        </h1>
        <p className="hero-glow mt-4 max-w-sm text-[15px] font-medium text-charcoal leading-relaxed">
          Operations Research &amp; Information Engineering at Cornell.{" "}
          {site.heroSubtitle}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 pointer-events-auto">
          <PillLink href="#projects" variant="solid">
            View Projects
          </PillLink>
          <PillLink href={site.github} external>
            GitHub <ArrowUpRight />
          </PillLink>
          <PillLink href={site.linkedin} external>
            LinkedIn <ArrowUpRight />
          </PillLink>
        </div>
      </div>

      <div className="absolute bottom-6 inset-x-0 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
        <span className="eyebrow hero-glow text-charcoal">Scroll</span>
        <svg width="12" height="16" viewBox="0 0 14 20" fill="none" aria-hidden>
          <path
            d="M7 2v14M2.5 11.5L7 16l4.5-4.5"
            stroke="#2a2e2b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
