import { site } from "../data/site";
import { Reveal } from "./Reveal";
import { PillLink, ArrowUpRight } from "./Buttons";

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-28 md:py-40">
      <Reveal className="flex flex-col items-center text-center">
        <p className="eyebrow text-moss-deep mb-5">04 / Contact</p>
        <h2 className="display text-charcoal text-[clamp(2.2rem,6vw,4.5rem)] max-w-3xl">
          Let’s build
          <br />
          something real
        </h2>
        <p className="mt-7 max-w-md text-lg leading-relaxed text-charcoal-soft">
          {site.contactCta}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <PillLink href={`mailto:${site.email}`} variant="solid">
            {site.email}
          </PillLink>
          <PillLink href={site.github} external>
            GitHub <ArrowUpRight />
          </PillLink>
          <PillLink href={site.linkedin} external>
            LinkedIn <ArrowUpRight />
          </PillLink>
        </div>
      </Reveal>
    </section>
  );
}
