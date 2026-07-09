/* ============================================================
   PROJECTS — add or edit projects here and nowhere else.

   To add a project: copy one object, change the fields, done.
   - `id` must be unique (used for React keys + modal routing)
   - `status`: "Built" | "In Progress" | "Prototype" | "Concept"
   - `links.github` / `links.demo` are optional — omit or set
     to undefined and the buttons simply won't render.
   - `media` is a placeholder label for now; swap in a real
     <img>/<video> later by editing ProjectModal.tsx.
   ============================================================ */

export type ProjectStatus = "Built" | "In Progress" | "Prototype" | "Concept";

export interface Project {
  id: string;
  name: string;
  tagline: string; // one-liner shown on the card
  description: string; // short paragraph on the card
  problem: string; // shown in the modal
  solution: string; // shown in the modal
  built: string; // "What I built" — shown in the modal
  learned: string; // "What I learned" — shown in the modal
  tech: string[];
  status: ProjectStatus;
  accent: "moss" | "blue" | "amber"; // card accent color
  links: {
    github?: string;
    demo?: string;
  };
  media?: string; // placeholder caption for screenshot/demo area
}

export const projects: Project[] = [
  {
    id: "realmail",
    name: "RealMail",
    tagline: "Email automation, minus the busywork",
    description:
      "An automation-focused project for handling email workflows intelligently. [Placeholder — replace with a real description of what RealMail does.]",
    problem:
      "[Placeholder] Describe the email/communication problem RealMail set out to solve.",
    solution:
      "[Placeholder] Describe the automation approach — triggers, processing, and how it saves time.",
    built:
      "[Placeholder] Summarize the pieces you built: pipelines, integrations, interfaces.",
    learned:
      "[Placeholder] What working on RealMail taught you about automation and reliability.",
    tech: ["Python", "APIs", "Automation"],
    status: "In Progress",
    accent: "blue",
    links: {
      github: "https://github.com/AnalyticDog13",
    },
    media: "RealMail screenshot / demo placeholder",
  },
  {
    id: "weather-genetic",
    name: "Weather Genetic Modeling",
    tagline: "Forecasting with evolutionary optimization",
    description:
      "A modeling and forecasting project that applies genetic-style optimization to weather data. [Placeholder — replace with specifics.]",
    problem:
      "[Placeholder] Describe the forecasting/modeling challenge this project tackles.",
    solution:
      "[Placeholder] Describe the genetic/evolutionary approach and why it fits the problem.",
    built:
      "[Placeholder] Summarize the model, data pipeline, and evaluation you built.",
    learned:
      "[Placeholder] What this project taught you about optimization and model evaluation.",
    tech: ["Python", "Optimization", "Data Modeling"],
    status: "Prototype",
    accent: "moss",
    links: {
      github: "https://github.com/AnalyticDog13",
    },
    media: "Model output / chart placeholder",
  },
  {
    id: "forex-platform",
    name: "Forex Research Platform",
    tagline: "Backtesting with honest assumptions",
    description:
      "A backtesting and research platform for forex strategies, focused on realistic trading assumptions, quality data, and rigorous strategy evaluation.",
    problem:
      "Most hobbyist backtests overstate returns by ignoring spreads, slippage, and execution realities — making strategies look better than they are.",
    solution:
      "A research platform that bakes realistic trading assumptions into every backtest, so strategy evaluation reflects conditions a strategy would actually face.",
    built:
      "[Placeholder] Summarize the backtesting engine, data handling, and evaluation metrics you built.",
    learned:
      "[Placeholder] What building this taught you about market data, statistical rigor, and honest evaluation.",
    tech: ["Python", "Pandas", "Backtesting", "Data Analysis"],
    status: "In Progress",
    accent: "amber",
    links: {
      github: "https://github.com/AnalyticDog13",
    },
    media: "Equity curve / dashboard placeholder",
  },
  {
    id: "barbershop",
    name: "Barbershop Website",
    tagline: "A local business, redesigned",
    description:
      "A website redesign for a local barbershop focused on clean visual design, a simple booking and contact flow, and a stronger small-business web presence.",
    problem:
      "Local service businesses often lose customers to confusing sites — unclear hours, buried contact info, and no clear way to book.",
    solution:
      "A clean, mobile-first redesign that puts booking and contact front and center, with visuals that match the shop's character.",
    built:
      "[Placeholder] Summarize the pages, booking/contact flow, and design system you built.",
    learned:
      "[Placeholder] What designing for a real local business taught you about conversion and clarity.",
    tech: ["HTML/CSS", "JavaScript", "Web Design"],
    status: "Built",
    accent: "moss",
    links: {
      github: "https://github.com/AnalyticDog13",
    },
    media: "Site screenshots placeholder",
  },
  {
    id: "empanada",
    name: "Empanada Website",
    tagline: "Cozy visuals, hungry visitors",
    description:
      "A restaurant website redesign focused on warm, cozy visuals, appetizing menu presentation, and a conversion-friendly layout.",
    problem:
      "Restaurant sites often hide the two things visitors want — the menu and how to order — behind heavy layouts and stale design.",
    solution:
      "A warm, food-forward redesign that leads with the menu, makes ordering obvious, and matches the restaurant's cozy personality.",
    built:
      "[Placeholder] Summarize the menu presentation, layout, and visual design you built.",
    learned:
      "[Placeholder] What this project taught you about visual hierarchy and designing for appetite.",
    tech: ["HTML/CSS", "JavaScript", "Web Design"],
    status: "Built",
    accent: "amber",
    links: {
      github: "https://github.com/AnalyticDog13",
    },
    media: "Menu + homepage screenshots placeholder",
  },
];
