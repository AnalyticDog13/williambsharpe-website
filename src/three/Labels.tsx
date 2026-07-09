import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { windowT, type Range } from "./phases";
import { scrollState } from "./scrollState";

/**
 * Floating glass labels anchored to points in the 3D scene. Each fades
 * in/out within its own scroll window (no re-renders — opacity is set
 * directly on the DOM node from the frame loop).
 */

interface LabelSpec {
  text: string;
  sub?: string;
  position: [number, number, number];
  window: Range;
}

const LABELS: LabelSpec[] = [
  { text: "Cornell ORIE", sub: "systems thinking", position: [0, 4.2, 0], window: [0.15, 0.31] },
  { text: "Optimization", sub: "operations research", position: [8.5, 2.6, 8], window: [0.31, 0.47] },
  { text: "AI Systems", sub: "control points", position: [-4.4, 3.6, -6], window: [0.47, 0.63] },
  { text: "Automation", sub: "data in motion", position: [5.4, 3.2, -4.4], window: [0.5, 0.64] },
  { text: "Transportation", sub: "transit network", position: [-9.5, 4.6, -4], window: [0.64, 0.8] },
  { text: "Design", sub: "the whole system", position: [0, 6.5, 0], window: [0.82, 0.96] },
];

export function Labels() {
  const divRefs = useRef<Array<HTMLDivElement | null>>([]);

  useFrame(() => {
    const p = scrollState.progress;
    LABELS.forEach((l, i) => {
      const el = divRefs.current[i];
      if (!el) return;
      const t = windowT(p, l.window);
      el.style.opacity = String(t);
      el.style.transform = `translateY(${(1 - t) * 10}px)`;
    });
  });

  return (
    <>
      {LABELS.map((l, i) => (
        <Html
          key={l.text}
          position={l.position}
          center
          distanceFactor={16}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={(el) => {
              divRefs.current[i] = el;
            }}
            style={{ opacity: 0, transition: "none", whiteSpace: "nowrap" }}
            className="glass rounded-xl px-4 py-2.5 text-center"
          >
            <div className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-charcoal">
              {l.text}
            </div>
            {l.sub && (
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-charcoal-soft mt-0.5">
                {l.sub}
              </div>
            )}
          </div>
        </Html>
      ))}
    </>
  );
}
