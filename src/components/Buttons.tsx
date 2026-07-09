import type { ReactNode } from "react";

/** Shared pill buttons used in the hero, contact section, and cards. */

interface PillLinkProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  external?: boolean;
}

export function PillLink({
  href,
  children,
  variant = "outline",
  external,
}: PillLinkProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-[11px] font-semibold tracking-[0.16em] uppercase transition-all duration-300";
  const styles =
    variant === "solid"
      ? "bg-charcoal text-cream hover:bg-charcoal-soft hover:-translate-y-0.5"
      : "border border-charcoal/25 text-charcoal hover:border-charcoal hover:-translate-y-0.5 bg-paper/60 backdrop-blur";
  return (
    <a
      href={href}
      className={`${base} ${styles}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function ArrowUpRight() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
