import { site } from "../data/site";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-28 md:py-36">
      <div className="grid gap-14 md:grid-cols-[1.25fr_1fr] md:gap-20">
        <Reveal>
          <p className="eyebrow text-moss-deep mb-4">01 / About</p>
          <h2 className="display text-charcoal text-[clamp(1.9rem,4.5vw,3.2rem)]">
            ABOUT ME
          </h2>
          <p className="mt-7 text-lg leading-relaxed text-charcoal-soft">
            {site.about}
          </p>
        </Reveal>

        {/* LA → Cornell route card */}
        <Reveal delay={0.12}>
          <div className="glass rounded-3xl p-7 md:mt-14">
            <p className="eyebrow text-charcoal-soft mb-6">Route</p>
            <div className="flex items-start gap-4">
              <div className="mt-1.5 flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-deep" />
                <span className="my-1 h-16 w-px border-l border-dashed border-charcoal/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-moss-deep" />
              </div>
              <div className="flex flex-col gap-9">
                <div>
                  <p className="display-mid text-charcoal">Los Angeles, CA</p>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-charcoal-soft mt-1">
                    34.05° N, 118.24° W — HOME
                  </p>
                </div>
                <div>
                  <p className="display-mid text-charcoal">Cornell University</p>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-charcoal-soft mt-1">
                    42.44° N, 76.48° W — ORIE ’29
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-7 border-t border-charcoal/10 pt-5 text-sm leading-relaxed text-charcoal-soft">
              Operations Research: an interdisciplinary field of applied
              mathematics and computer science that uses advanced analytical,
              statistical, and modeling techniques to make optimal decisions.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
