import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { projects, type Project, type ProjectStatus } from "../data/projects";
import { Reveal } from "./Reveal";
import { ArrowUpRight } from "./Buttons";
import { ProjectModal } from "./ProjectModal";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Built: "bg-moss/20 text-moss-deep",
  "In Progress": "bg-slate-blue/15 text-slate-blue-deep",
  Prototype: "bg-amber-soft/25 text-amber-deep",
  Concept: "bg-charcoal/10 text-charcoal-soft",
};

const ACCENT_BAR: Record<Project["accent"], string> = {
  moss: "bg-moss",
  blue: "bg-slate-blue",
  amber: "bg-amber-soft",
};

export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-28 md:py-36">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-moss-deep mb-4">02 / Projects</p>
            <h2 className="display text-charcoal text-[clamp(1.9rem,4.5vw,3.2rem)]">
              Things I’m building
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-charcoal-soft">
            Select a project to see the problem, the approach, and what I
            learned building it.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.06, 0.3)} className="h-full">
            <button
              type="button"
              onClick={() => setSelected(p)}
              className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-paper text-left transition-all duration-300 hover:-translate-y-1 hover:border-charcoal/25 hover:shadow-xl hover:shadow-charcoal/8"
            >
              <span className={`h-1 w-full ${ACCENT_BAR[p.accent]}`} />
              <span className="flex flex-1 flex-col p-6">
                <span className="flex items-start justify-between gap-3">
                  <span className="display-mid text-xl text-charcoal">
                    {p.name}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 font-mono text-[9px] font-semibold tracking-[0.12em] uppercase ${STATUS_STYLES[p.status]}`}
                  >
                    {p.status}
                  </span>
                </span>
                <span className="mt-1 font-mono text-[10px] tracking-[0.12em] uppercase text-charcoal-soft">
                  {p.tagline}
                </span>
                <span className="mt-4 text-sm leading-relaxed text-charcoal-soft">
                  {p.description}
                </span>
                <span className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-cream-deep px-2 py-1 font-mono text-[9px] font-medium tracking-wide text-charcoal-soft"
                    >
                      {t}
                    </span>
                  ))}
                </span>
                <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase text-charcoal transition-colors group-hover:text-moss-deep">
                  Open case study <ArrowUpRight />
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
