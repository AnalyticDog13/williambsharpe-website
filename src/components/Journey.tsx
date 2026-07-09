import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Scene } from "../three/Scene";
import { scrollState, INTRO_END } from "../three/scrollState";
import { site } from "../data/site";
import { PillLink, ArrowUpRight } from "./Buttons";

/**
 * The 3D scroll journey: a tall scroll container with a sticky viewport
 * holding the Three.js canvas, the hero overlay, stage captions, and a
 * progress rail. Scroll progress is written into `scrollState` where the
 * 3D frame loop reads it.
 */

interface Stage {
  at: number; // progress where this stage begins
  index: string;
  title: string;
  body: string;
}

const STAGES: Stage[] = [
  {
    at: 0.14,
    index: "01",
    title: "Los Angeles → Cornell",
    body: "Roots on the West Coast, systems training in Ithaca. The foundation goes down first.",
  },
  {
    at: 0.3,
    index: "02",
    title: "Operations Research",
    body: "Roads and networks light up — the mathematics of making systems run well.",
  },
  {
    at: 0.47,
    index: "03",
    title: "AI + Automation",
    body: "Control points come online. Data starts moving through the system on its own.",
  },
  {
    at: 0.64,
    index: "04",
    title: "Transportation Systems",
    body: "Transit routes animate across the city — moving people and goods, optimally.",
  },
  {
    at: 0.81,
    index: "05",
    title: "The Whole System",
    body: "Everything running together. The projects below are where I put this to work.",
  },
];

function stageFor(p: number): number {
  let s = -1;
  for (let i = 0; i < STAGES.length; i++) if (p >= STAGES[i].at) s = i;
  return s;
}

export function Journey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Hero + scroll-cue fades are applied directly to the DOM here (rather
  // than via motion style bindings) so they stay perfectly in sync with
  // the same progress value driving the 3D scene.
  //
  // The first INTRO_END of raw scroll is a dead zone for the city: only
  // the camera approaches (establishing shot → hero framing) while the
  // hero text fades out. The staged development timeline gets the
  // remapped 0..1 that starts after the intro.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollState.raw = v;
    const city = Math.min(1, Math.max(0, (v - INTRO_END) / (1 - INTRO_END)));
    scrollState.progress = city;
    setStage(stageFor(city));
    const hero = heroRef.current;
    if (hero) {
      const o = Math.max(0, 1 - v / 0.12);
      hero.style.opacity = String(o);
      hero.style.transform = `translateY(${-48 * Math.min(v / 0.12, 1)}px)`;
      hero.style.visibility = o <= 0.001 ? "hidden" : "visible";
    }
    const cue = cueRef.current;
    if (cue) cue.style.opacity = String(Math.max(0, 1 - v / 0.06));
  });

  const active = stage >= 0 ? STAGES[stage] : null;

  return (
    <div ref={containerRef} className="relative h-[680vh]" id="top">
      <div className="sticky top-0 h-screen overflow-hidden sky">
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ fov: 40, position: [0, 21, 40], near: 0.5, far: 170 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          className="!absolute inset-0"
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>

        {/* ---- Hero overlay ---- */}
        <div
          ref={heroRef}
          className="absolute inset-x-0 top-[19vh] z-10 flex flex-col items-center px-6 text-center pointer-events-none"
        >
          <p className="eyebrow hero-glow text-charcoal mb-5">{site.heroTagline}</p>
          <h1 className="display text-charcoal text-[clamp(2.6rem,7.5vw,6.5rem)] max-w-5xl">
            William B.
            <br />
            Sharpe
          </h1>
          <p className="hero-glow mt-6 max-w-xl text-base md:text-lg font-medium text-charcoal leading-relaxed">
            Operations Research &amp; Information Engineering at Cornell.
            <br className="hidden md:block" /> {site.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
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

        {/* ---- Scroll cue ---- */}
        <div
          ref={cueRef}
          className="absolute bottom-8 inset-x-0 z-10 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="eyebrow hero-glow text-charcoal">Scroll to explore</span>
          <motion.svg
            width="14"
            height="20"
            viewBox="0 0 14 20"
            fill="none"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            <path
              d="M7 2v14M2.5 11.5L7 16l4.5-4.5"
              stroke="#4a504b"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>

        {/* ---- Stage caption card ---- */}
        <div className="absolute bottom-8 left-6 md:left-10 z-10 max-w-sm pointer-events-none">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.index}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="glass rounded-2xl px-6 py-5"
              >
                <p className="eyebrow text-moss-deep mb-2">
                  {active.index} — Stage
                </p>
                <h2 className="display-mid text-xl text-charcoal">
                  {active.title}
                </h2>
                <p className="mt-2 text-sm text-charcoal-soft leading-relaxed">
                  {active.body}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---- Progress rail ---- */}
        <div
          className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3"
          aria-hidden
        >
          {STAGES.map((s, i) => (
            <div
              key={s.index}
              className={`w-1.5 rounded-full transition-all duration-500 ${
                i === stage
                  ? "h-7 bg-charcoal"
                  : i < stage
                    ? "h-1.5 bg-charcoal/50"
                    : "h-1.5 bg-charcoal/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
