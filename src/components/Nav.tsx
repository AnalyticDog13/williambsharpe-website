import { site } from "../data/site";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Focus" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="glass flex w-full max-w-3xl items-center justify-between gap-3 rounded-full px-4 md:px-5 py-2.5">
        <a
          href="#top"
          className="font-mono text-xs font-bold tracking-[0.2em] text-charcoal"
        >
          {site.initials}
          <span className="text-amber-deep">●</span>
        </a>
        <div className="flex items-center gap-3.5 md:gap-7">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[10px] md:text-[11px] font-medium tracking-[0.14em] uppercase text-charcoal-soft transition-colors hover:text-charcoal"
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
