import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Project } from "../data/projects";
import { PillLink, ArrowUpRight } from "./Buttons";

/**
 * Expanded case-study view for a project. Esc or backdrop click closes.
 * To swap the media placeholder for a real screenshot/video, replace the
 * dashed box below with an <img> or <video> element.
 */

function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="eyebrow text-moss-deep mb-2">{label}</p>
      <p className="text-sm leading-relaxed text-charcoal-soft">{text}</p>
    </div>
  );
}

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-sm md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} case study`}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-paper shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-charcoal/10 bg-paper/95 px-7 py-5 backdrop-blur">
          <div>
            <h3 className="display-mid text-2xl text-charcoal">
              {project.name}
            </h3>
            <p className="mt-0.5 font-mono text-[10px] tracking-[0.14em] uppercase text-charcoal-soft">
              {project.tagline} · {project.status}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="rounded-full border border-charcoal/20 p-2.5 text-charcoal transition-colors hover:bg-cream-deep"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M1.5 1.5l9 9m0-9l-9 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-7 px-7 py-7">
          {/* Media placeholder — replace with <img src="..."/> or <video/> */}
          <div className="flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-charcoal/15 bg-cream-deep/50">
            <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-charcoal-soft">
              {project.media ?? "Screenshot / demo placeholder"}
            </p>
          </div>

          <p className="text-base leading-relaxed text-charcoal">
            {project.description}
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <DetailBlock label="Problem" text={project.problem} />
            <DetailBlock label="Solution" text={project.solution} />
            <DetailBlock label="What I built" text={project.built} />
            <DetailBlock label="What I learned" text={project.learned} />
          </div>

          <div>
            <p className="eyebrow text-moss-deep mb-3">Tech stack</p>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-cream-deep px-3 py-1.5 font-mono text-[10px] font-medium text-charcoal-soft"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-charcoal/10 pt-6">
            {project.links.github && (
              <PillLink href={project.links.github} external variant="solid">
                GitHub <ArrowUpRight />
              </PillLink>
            )}
            {project.links.demo && (
              <PillLink href={project.links.demo} external>
                Live Demo <ArrowUpRight />
              </PillLink>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
