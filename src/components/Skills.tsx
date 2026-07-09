import { focusAreas } from "../data/site";
import { Reveal } from "./Reveal";

export function Skills() {
  return (
    <section id="skills" className="bg-cream-deep/60">
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <Reveal>
          <p className="eyebrow text-moss-deep mb-4">03 / Focus</p>
          <h2 className="display text-charcoal text-[clamp(1.9rem,4.5vw,3.2rem)]">
            What I work on
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {focusAreas.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 0.05, 0.3)}>
              <div className="group h-full rounded-2xl border border-charcoal/10 bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-charcoal/25 hover:shadow-lg hover:shadow-charcoal/5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-amber-deep">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="display-mid mt-3 text-lg text-charcoal">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                  {f.note}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
