import { site } from "../data/site";
import { PillLink, ArrowUpRight } from "./Buttons";

/**
 * Lightweight hero shown instead of the 3D journey on small screens,
 * under prefers-reduced-motion, or when WebGL is unavailable. A static
 * illustrated diorama in the same palette; its only motion is a gentle
 * CSS drift + flowing dashes, both disabled by the reduced-motion query
 * (see the `.motion-ok` rule in index.css).
 */
export function FallbackHero() {
  return (
    <section className="sky relative flex min-h-screen flex-col items-center px-6 pt-28 pb-10" id="top">
      <p className="eyebrow text-charcoal-soft mb-4">{site.heroTagline}</p>
      <h1 className="display text-charcoal text-[clamp(2.4rem,10vw,4.5rem)] text-center">
        William B.
        <br />
        Sharpe
      </h1>
      <p className="mt-5 max-w-md text-center text-charcoal-soft leading-relaxed">
        Operations Research &amp; Information Engineering at Cornell.{" "}
        {site.heroSubtitle}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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

      {/* Illustrated mini-city diorama */}
      <div className="relative mt-10 w-full max-w-2xl motion-ok" style={{ animation: "drift 7s ease-in-out infinite" }}>
        <svg viewBox="0 0 640 300" className="w-full" role="img" aria-label="Illustration of a small city surrounded by hills, with glowing transit and data routes">
          {/* hills */}
          <ellipse cx="320" cy="265" rx="330" ry="60" fill="#efe8d4" />
          <ellipse cx="150" cy="245" rx="180" ry="55" fill="#a9c89b" />
          <ellipse cx="500" cy="250" rx="200" ry="60" fill="#8fb381" />
          <ellipse cx="320" cy="262" rx="190" ry="42" fill="#c3d5ac" />
          {/* plaza */}
          <ellipse cx="320" cy="255" rx="130" ry="26" fill="#dfe0c6" />
          {/* transit loop */}
          <ellipse
            cx="320"
            cy="255"
            rx="118"
            ry="22"
            fill="none"
            stroke="#c9a13f"
            strokeWidth="2"
            strokeDasharray="8 6"
            className="motion-ok"
            style={{ animation: "dashflow 9s linear infinite" }}
          />
          {/* flow lines */}
          <path
            d="M40 230 C 140 245, 220 250, 320 252"
            fill="none"
            stroke="#5e7f9b"
            strokeWidth="2"
            strokeDasharray="6 7"
            className="motion-ok"
            style={{ animation: "dashflow 7s linear infinite" }}
          />
          <path
            d="M600 235 C 500 248, 420 252, 330 253"
            fill="none"
            stroke="#5e7f9b"
            strokeWidth="2"
            strokeDasharray="6 7"
            className="motion-ok"
            style={{ animation: "dashflow 8s linear infinite" }}
          />
          {/* buildings */}
          <g stroke="#2a2e2b" strokeOpacity="0.08">
            <rect x="270" y="200" width="22" height="52" rx="2" fill="#f3eedf" />
            <rect x="298" y="182" width="26" height="70" rx="2" fill="#7d97ad" />
            <rect x="330" y="212" width="20" height="40" rx="2" fill="#f3eedf" />
            <rect x="356" y="196" width="24" height="56" rx="2" fill="#96b489" />
            <rect x="243" y="220" width="18" height="32" rx="2" fill="#e2c67e" />
            <rect x="386" y="224" width="16" height="28" rx="2" fill="#f3eedf" />
          </g>
          {/* node orbs */}
          <circle cx="230" cy="212" r="5" fill="#f0c95c" />
          <circle cx="420" cy="218" r="5" fill="#f0c95c" />
          {/* trees */}
          <g fill="#5c8354">
            <polygon points="120,238 130,214 140,238" />
            <polygon points="165,246 173,226 181,246" />
            <polygon points="480,240 490,216 500,240" />
            <polygon points="520,248 528,228 536,248" />
            <polygon points="90,252 98,234 106,252" />
          </g>
          {/* clouds */}
          <g fill="#fffdf6">
            <ellipse cx="130" cy="80" rx="34" ry="13" />
            <ellipse cx="155" cy="72" rx="22" ry="10" />
            <ellipse cx="500" cy="60" rx="40" ry="14" />
            <ellipse cx="528" cy="52" rx="24" ry="10" />
          </g>
        </svg>

        {/* floating labels */}
        <div className="glass absolute left-[6%] top-[38%] rounded-lg px-3 py-1.5 font-mono text-[9px] font-semibold tracking-[0.16em] uppercase">
          AI Systems
        </div>
        <div className="glass absolute right-[4%] top-[30%] rounded-lg px-3 py-1.5 font-mono text-[9px] font-semibold tracking-[0.16em] uppercase">
          Transportation
        </div>
        <div className="glass absolute left-[38%] top-[8%] rounded-lg px-3 py-1.5 font-mono text-[9px] font-semibold tracking-[0.16em] uppercase">
          Cornell ORIE
        </div>
      </div>
    </section>
  );
}
