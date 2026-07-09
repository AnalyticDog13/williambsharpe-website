import { useEffect, useId, useRef } from "react";

/**
 * Hero tagline on a wide upward arc (desktop/tablet only): a 2D SVG
 * overlay that crowns the "William B. Sharpe" headline like a rainbow.
 * Clean solid type, no outline, no visible rail — the curve itself is
 * the design. The sentence drifts slowly along the path in a seamless
 * loop. It renders inside the hero overlay div, so it inherits the same
 * scroll fade/translate as the headline.
 *
 * The animation measures the real rendered text length (after fonts
 * load) so the marquee loops seamlessly at any font metrics.
 */

const SPEED = 18; // viewBox units per second — slow, calm drift

export function ArcTagline({ text }: { text: string }) {
  const rawId = useId();
  const pathId = `arc-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const tpRef = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const unit = `${text.toUpperCase()}   •   `;

    document.fonts.ready.then(() => {
      const path = pathRef.current;
      const textEl = textRef.current;
      const tp = tpRef.current;
      if (cancelled || !path || !textEl || !tp) return;

      const pathLength = path.getTotalLength();
      tp.textContent = unit;
      const unitLength = textEl.getComputedTextLength();
      if (unitLength <= 0) return;

      // enough copies to cover the path plus one loop of slack
      const copies = Math.ceil((pathLength + unitLength) / unitLength) + 1;
      tp.textContent = unit.repeat(copies);

      const t0 = performance.now();
      const tick = (now: number) => {
        const offset = (((now - t0) / 1000) * SPEED) % unitLength;
        tp.setAttribute("startOffset", String(-offset));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <svg
      viewBox="0 0 1200 240"
      className="w-full"
      role="img"
      aria-label={text}
    >
      {/* wide upward arc — apex above the headline, ends at the page sides */}
      <path
        ref={pathRef}
        id={pathId}
        d="M 15 215 Q 600 -45 1185 215"
        fill="none"
        stroke="none"
      />
      <text
        ref={textRef}
        aria-hidden="true"
        style={{
          fontFamily: "'Martian Mono', ui-monospace, monospace",
          fontSize: 14.5,
          fontWeight: 500,
          letterSpacing: 3,
          fill: "#2a2e2b",
        }}
      >
        <textPath ref={tpRef} href={`#${pathId}`} startOffset="0" />
      </text>
    </svg>
  );
}
