/* ============================================================
   SITE CONFIG — edit your links, email, and hero copy here.
   Everything in this file is safe to change; the components
   read from it and nothing else.
   ============================================================ */

export const site = {
  name: "William B. Sharpe",
  initials: "WBS",

  // ---- EDIT: your links ----
  github: "https://github.com/AnalyticDog13",
  linkedin: "https://www.linkedin.com/in/williambsharpe/",
  email: "williamsharpe2021@gmail.com", // EDIT: your preferred contact email

  // ---- Hero copy ----
  heroTagline: "Cornell ORIE ’29",
  heroSubtitle:
    "Building intelligent systems for AI, automation, transportation, and design.",

  // ---- About copy ----
  about:
    "I’m William B. Sharpe, a Cornell University student from Los Angeles studying Operations Research and Information Engineering. I’m interested in building intelligent systems that combine AI, automation, optimization, transportation, and design — and in turning complex ideas into useful, visual, and functional tools.",

  // ---- Contact CTA ----
  contactCta:
    "Interested in projects, research, startups, or design collaborations? Reach out.",
} as const;

/** Focus areas shown in the Skills section. Add/remove freely. */
export const focusAreas = [
  { title: "AI Systems", note: "Applied models that do useful work" },
  { title: "Automation", note: "Pipelines that remove manual steps" },
  { title: "Operations Research", note: "Decision-making under constraints" },
  { title: "Optimization", note: "Better answers with the same resources" },
  { title: "Transportation Systems", note: "Moving people and goods well" },
  { title: "Data Visualization", note: "Making systems legible" },
  { title: "Interactive Design", note: "Interfaces people want to use" },
  { title: "Web Development", note: "Shipping real, fast products" },
  { title: "Product Thinking", note: "Building for actual users" },
] as const;
