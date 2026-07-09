import { site } from "../data/site";

export function Footer() {
  return (
    <footer className="border-t border-charcoal/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-charcoal-soft">
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-charcoal-soft">
          LA → Ithaca · React + Three.js
        </p>
      </div>
    </footer>
  );
}
