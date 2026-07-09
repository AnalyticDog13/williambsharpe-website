# William B. Sharpe — Portfolio

A scroll-driven 3D portfolio: a miniature living-systems diorama (terrain,
city, transit, data flows) that develops in stages as you scroll, built with
React, TypeScript, Tailwind CSS, and Three.js (React Three Fiber).

## Run locally

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

```bash
npm run build      # type-checks and builds to dist/
npm run preview    # serves the production build at http://localhost:4173
```

Requires Node 20.19+ (Node 22/24 recommended).

## Where to edit things

| What | File |
| --- | --- |
| Projects (add/edit/remove) | `src/data/projects.ts` — one array, one object per project |
| Links, email, bio, hero copy | `src/data/site.ts` |
| Skills / focus areas | `src/data/site.ts` (`focusAreas`) |
| 3D scroll timing (phase ranges) | `src/three/phases.ts` |
| Camera flight path | `src/three/CameraRig.tsx` (`KEYS`) |
| Floating 3D labels | `src/three/Labels.tsx` |
| Stage captions during the journey | `src/components/Journey.tsx` (`STAGES`) |
| Colors and fonts | `src/index.css` (`@theme` block) + `index.html` (font `<link>`) |
| SEO metadata | `index.html` |

**Adding a project:** open `src/data/projects.ts`, copy an existing object,
change the fields. `links.demo` is optional; the button only renders if set.
To swap the media placeholder for a real screenshot, edit the dashed box in
`src/components/ProjectModal.tsx`.

## Architecture

```
src/
  data/          site.ts (links/copy) · projects.ts (project data)
  components/    Nav · Journey (3D scroll hero) · FallbackHero (lite mode)
                 About · Projects · ProjectModal · Skills · Contact · Footer
  three/         Scene · CameraRig · Terrain · City · Roads · Flows
                 Nodes · Transit · Trees · Clouds · Labels
                 phases.ts (scroll choreography) · terrainMath.ts
  hooks/         useLiteMode.ts (reduced-motion / mobile / no-WebGL detection)
```

- The journey is a 680vh scroll region with a sticky full-screen canvas.
  Scroll progress feeds a shared mutable ref (`three/scrollState.ts`) read by
  the Three.js frame loop — no React re-renders while scrolling. The first
  14% of scroll (`INTRO_END`) is an intro dead zone: the camera glides from
  an airy establishing shot down to the city before the staged development
  timeline starts.
- Everything in the scene is procedural (no texture downloads); trees and
  buildings are GPU-instanced; the 3D bundle is code-split and lazy-loaded.
- **Mobile:** small screens skip the scroll-driven journey and render the
  finished city under a fixed camera instead (`MobileHero.tsx`) — the page
  scrolls past it normally. **Reduced motion / no WebGL:** a static
  illustrated hero (`FallbackHero.tsx`). All content is plain DOM and
  readable without any animation.

## Deploy

The build is fully static (`dist/`), with relative asset paths (`base: "./"`),
so it works on any static host.

**Vercel / Netlify:** import the repo; framework preset "Vite"
(build `npm run build`, output `dist`). Done.

**GitHub Pages:** either point Pages at a branch containing `dist/`, or add
the standard GitHub Action:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then enable **Settings → Pages → Source: GitHub Actions**.
