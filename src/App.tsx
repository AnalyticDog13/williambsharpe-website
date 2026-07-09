import { lazy, Suspense } from "react";
import { Nav } from "./components/Nav";
import { FallbackHero } from "./components/FallbackHero";
import { About } from "./components/About";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { useHeroMode } from "./hooks/useHeroMode";

// The 3D heroes (three.js) are code-split so the page shell paints fast;
// the sky-colored placeholder keeps layout stable while they stream in.
const Journey = lazy(() =>
  import("./components/Journey").then((m) => ({ default: m.Journey }))
);
const MobileHero = lazy(() =>
  import("./components/MobileHero").then((m) => ({ default: m.MobileHero }))
);

export default function App() {
  // "journey" = desktop scroll experience · "mobile" = finished city under
  // a fixed camera · "fallback" = static illustration (reduced motion / no WebGL)
  const mode = useHeroMode();

  return (
    <>
      <Nav />
      {mode === "fallback" ? (
        <FallbackHero />
      ) : (
        <Suspense fallback={<div className="sky h-screen" />}>
          {mode === "mobile" ? <MobileHero /> : <Journey />}
        </Suspense>
      )}
      <main>
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
