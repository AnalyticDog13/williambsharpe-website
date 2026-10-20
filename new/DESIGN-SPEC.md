# Design spec: William Sharpe portfolio (modeled on rajan.sh)

This spec is the only source of design decisions for the site in `new/`. The old site at the repo root is used for **content only** (project text, dates, links, images). None of its styles, fonts, colors or layout are reused.

Everything below was measured from https://www.rajan.sh/ on 2026-10-20 (computed styles, the live WebGL shader source, and the carousel component), at 1440px and 390px wide.

---

## 1. Principles

- **One narrow column of text.** Everything sits in a 576px column. The only thing wider is the home photo carousel (and other 16:9 media), which breaks out to 704px on desktop.
- **Two typefaces, used for different jobs.** Lora (serif) is used only for names and titles: the site name, page titles, project names and section headings. Everything else uses the system sans-serif.
- **Near-monochrome.** Black text, gray-700 body text, very light gray rules and underlines. The only color on the site is the photos and the blurred hue band at the top of the home page.
- **Links are quiet.** They keep the surrounding text color and get a pale underline 3px below. The underline (or the text) darkens on hover.
- **Motion only where it means something.** The home hue band drifts slowly and shifts its colors to match the current photo. Photos crossfade. Nothing else moves. Everything respects `prefers-reduced-motion`.
- **Light mode only.** rajan.sh has dark tokens, but they aren't active (an emulated dark scheme still renders white). This site is light only.
- **No footer.** The page just ends after the last paragraph, with 80px of bottom padding.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | page background |
| `--fg` | `#030303` | name, titles, active nav item, hover text |
| `--muted-fg` | `#374151` | body copy on home and list pages, nav links, descriptions |
| `--prose` | `rgba(3,3,3,.85)` | article body text on project pages |
| `--border` | `#e5e5e5` | link underlines, rules, table lines |
| `--muted` | `#f5f5f5` | empty media background (photo placeholders) |
| date color | `--muted-fg` at 60% opacity | dates in project lists |
| separator dot | `--muted-fg` at 40% opacity | the `·` between date and tag |

**Fonts**
- Serif: `Lora`, weights 400–700 (Google Fonts), with fallbacks `ui-serif, Georgia, Cambria, "Times New Roman", serif`.
- Sans: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`. This is the OS font: SF on Mac/iOS, Segoe UI on Windows. No webfont is loaded for body text, matching rajan.sh.

**Type scale**

| Role | Family | Size / line-height | Weight | Color |
|---|---|---|---|---|
| Site name (header) | Lora | 16 / 24 | 500 | fg (hover: muted-fg) |
| Nav links | sans | 14 / 20 | 400 | muted-fg (hover and active: fg) |
| Home paragraphs | sans | 16 / 28 | 400 | muted-fg |
| Page title (h1) | Lora | 20 / 32 | 500 | fg, `text-wrap: balance` |
| Page subtitle | sans | 14 / 24 | 400 | muted-fg, 8px below the title |
| List item title | Lora | 16 / 28 | 500 | fg, underlined link |
| List item description | sans | 14 / 24 | 400 | muted-fg, 4px below, `text-wrap: pretty` |
| List item meta (date · tag) | sans | 12 / 20 | 400 | date 60%, dot 40%, tag 100% muted-fg, 4px below |
| Article body | sans | 16 / 28 | 400 | prose, 28px bottom margin |
| Article h2 | Lora | 16 / 28 | 500 | fg, 40px top / 16px bottom margin |
| Article meta (role, date, links) | sans | 12 / 20 | 400 | muted-fg, 16px below the subtitle |

**Links:** `text-decoration: underline; text-decoration-color: var(--border); text-underline-offset: 3px;` with a 150ms `cubic-bezier(.4,0,.2,1)` color transition.
- In paragraphs, hover changes the text color to fg.
- On list titles, hover changes the underline color to fg.

**Radius:** 6px on media frames (carousel, video, screenshots). There are no other rounded corners.

## 3. Layout

- `.container`: `width: 100%; max-width: 36rem (576px); margin: 0 auto; padding: 0 20px`. From 640px up the padding is 24px, and from 1024px up it is 0.
- `.breakout`: from 1024px up it is `width: 44rem (704px); position: relative; left: 50%; transform: translateX(-50%)`. Below 1024px it takes the column width.
- **Header** (`header.container`):
  - Desktop (≥1024px): one row, name on the left and nav on the right (`justify-content: space-between`), 40px top padding and no bottom padding. The header is 64px tall in total.
  - 640–1023px: one row, left-aligned, with a 24px gap and 24px vertical padding.
  - Below 640px: the name sits above the nav, with a 12px gap and 24px vertical padding.
  - Nav links have a 20px gap and are lowercase.
- **Main block** (`.container`): 32px top padding (48px from 640px up) and 80px bottom padding.

## 4. Home page

Order from top to bottom:

1. **Hue backdrop** (section 6), fixed behind the header.
2. **Header**: "William Sharpe" (links to home) and nav: `projects`.
3. **Intro**, two paragraphs, 20px apart, 16/28 muted-fg. From 640px up they are justified (`text-align: justify; text-align-last: left; text-justify: inter-word`).
   - P1: "I'm a sophomore studying Operations Research and Information Engineering at [Cornell University], currently working on bringing my ideas to life through independent projects and startup collaboration (namely [marko])." Cornell links to cornell.edu, and marko links to the marko project page.
   - P2: "I'm from Los Angeles and love playing the piano, the guitar, traveling, exploring outdoors, and all things entrepreneurship, AI, and data science."
4. **Contact paragraph**, directly under the intro (William asked for it above the photos, unlike the reference), 20px top margin, 16/28 muted-fg, `text-wrap: pretty` (not justified): "Reach out to me if you have fun ideas, would like to collaborate on a project, or want to go rock climbing. You can find me on [LinkedIn], [GitHub], or [email me]."
   - LinkedIn: https://www.linkedin.com/in/williambsharpe/
   - GitHub: https://github.com/AnalyticDog13
   - "email me": `mailto:ws527@cornell.edu`
5. **Photo carousel** (section 5), in a `.breakout` with a 32px top margin. It is the last thing on the page.

## 5. Photo carousel

- **Frame:** `aspect-ratio: 16/9`, `overflow: hidden`, 6px radius, `--muted` background. It is focusable (`tabindex=0`, `role=group`, `aria-label="Photo gallery"`), with a 1px fg/30% focus ring. Images use `object-fit: cover`, and each photo can set its own `object-position`.
- **Bottom shade:** a 56px band along the bottom edge, `linear-gradient(to top, rgba(0,0,0,.35), transparent)`, with `backdrop-filter: blur(1.5px)` masked to fade upward. It makes the controls readable on any photo.
- **Controls**, centered 10px above the bottom edge, white at 75% opacity:
  - `←` and `→` buttons, each 24×24 with a 16px glyph. Hover makes them full white.
  - Between the arrows sit the dots: 6px circles 6px apart. The current dot is white. The others are white at 55%, and 80% on hover. Each dot has an `aria-label` of "Show photo N".
  - The arrows sit 8px from the dot row.
- **Autoplay:** advances every **6 s** (the reference uses 8 s; William chose 6). It pauses while the pointer is over the frame or the frame has focus, while less than 50% of it is on screen (IntersectionObserver), while the tab is hidden, and always under reduced motion.
- **Transition:** the incoming photo fades in over the current one (opacity 0→1, **450ms ease-out**), then becomes the current photo. Under reduced motion the swap is instant.
- **Input:** the ← and → keys work when the frame has focus. Swipes of 44px or more work on touch screens.
- **Palette:** every photo has a two-color palette `[primary, secondary]`. When a photo is shown, the hue backdrop eases toward its palette.
- **Slides** live in `new/photos/` and are cropped to 16:9 (1600×900 WebP) before publishing. Each crop is chosen per photo so the subject stays in frame, which leaves `object-fit: cover` nothing to cut.
  - Each slide's palette is picked from its own colors: a cool tone for the left, and a warm or contrasting tone for the right, as on rajan.sh.
  - A slide can be a video: muted, looping, `playsinline`, `preload="none"`, with a poster frame and no audio. It plays only while it is the current slide, and under reduced motion it shows its poster. Keep video clips short (about 5 s, 1280px H.264 MP4). A GIF of the same clip is about 5× larger.

## 6. Hue backdrop (home only)

This is a full-width WebGL canvas, **fixed** to the top of the viewport and sitting behind the content (z-index 0; main content is z-index 10).

- **Container style:** `height: clamp(14rem, 28vh, 18rem); opacity: .62; filter: blur(11px); transform: translateY(-2.75rem) scale(1.015); pointer-events: none;` It is masked with `linear-gradient(to bottom, #000 0%, rgba(0,0,0,.92) 28%, rgba(0,0,0,.34) 72%, transparent 100%)`, so it fades into the white page.
- **Entrance on page load:** it starts at `opacity 0; blur(20px); translateY(-3.5rem) scale(1.045)` and transitions to the resting state above over 850ms `cubic-bezier(.4,0,.2,1)`.
- **Shader:** a fragment shader with fbm noise and soft ellipses (the "folds"):
  - A central fold, an upper fold, a right fold, a lower fold, and a fold that passes slowly across, all drifting with time×0.72.
  - The base color is a left-to-right blend from primary to secondary.
  - Pale tints of each color and a white "silk" highlight are layered on top, with ±0.5/255 dithering.
  - The shader is reproduced verbatim from the reference.
- **Rendering:** device pixel ratio capped at 1.5, `alpha:false`, low-power context.
- **Palette easing:** colors ease toward the target palette with `1 - exp(-2.8·dt)` per frame.
- **When it stops:** the animation pauses when the tab is hidden. Under reduced motion it draws a single static frame.
- **CSS fallback** (no WebGL): `radial-gradient(ellipse at 48% 10%, #f8f7ff 0%, #8fa7ff 38%, transparent 62%), linear-gradient(100deg, #173ce7, #814eea)`.
- **Default palette** (before any photo loads): `#2f7199`, `#3f7055`.
- The projects list and project pages have **no** backdrop.

## 7. Projects page (`projects.html`)

This mirrors rajan.sh/engineering.

- The header nav shows `projects` in fg (active).
- Page header: h1 "Projects", then the subtitle "Things I've built" (the reference page has a one-line subtitle in the same spot).
- A 32px gap, then an `<ol>` of projects with 28px between items, newest first:
  1. **marko**: "Indoor AR wayfinding built from a floor plan and a single phone scan. No beacons, no QR codes." Meta: `Oct 2026 · 2nd place, BigRed//Hacks 2026`
  2. **AI-Powered Web Design Agency**: "An AI pipeline that finds local businesses with weak websites, scores them, and pitches a better one." Meta: `May 2026 · Founder, Los Angeles`
  3. **Kalshi Weather Trading Bot**: "A bot that prices weather markets in 10 cities from 139-member ensemble forecasts and trades the gap." Meta: `Mar 2026 · Solo build, ran live`
- Each title links to that project's page in `projects/`. On rajan.sh the titles link straight out to GitHub. Here they open an in-site page, and the repo is linked from there.
- rajan.sh splits pinned items from a "More" list under a hairline rule. With three projects there is only one list. If the list grows past about five, add `<section>` with a 40px top margin, `border-top: 1px solid var(--border)`, 32px top padding, and a "More" label (12px, 500 weight, fg).
- The page ends with a small credit line, 64px below the list, in 12/20 sans at muted-fg 60%: "this website is heavily inspired by the work of [Rajan Agarwal]" (lowercase, the name underlined and linked to linkedin.com/in/rajansagarwal).

## 8. Project pages (`projects/*.html`)

The template is rajan.sh's article page (for example /tinker or /multiplayer).

**Article header** (`header.container`, 32px top padding, 48px from 640px up):
- h1: the project name.
- Subtitle: a one-sentence summary.
- Meta block, 12px muted-fg:
  - Line 1: the role.
  - Line 2: date · award or status · **Code on GitHub ↗**, using inline links with a 4px gap. Each link uses the standard underline style.

**Body** (`article.container`, 48px top margin, 80px bottom padding):
- Paragraphs: 16/28, prose color, 28px bottom margin, `text-wrap: pretty`.
- `h2`: Lora 16/500, 40px top / 16px bottom margin.
- `ul` and `ol`: 24px left margin, 24px top/bottom margin, 12px between items. Markers are muted-fg at 60%. An `<li>` can start with a bold term (`<strong>`, weight 600, fg).
- Images: `display:block; width:100%; height:auto; margin: 32px 0 0`.
  - A caption may follow as an italic paragraph (`<p class="caption"><em>…</em></p>`, prose color, 12px top margin), the way rajan.sh writes "Source: …".
  - Media that is 16:9 or wider and important may use `.breakout`.
- Media frames (video, the deck carousel, live-site covers) get a 6px radius. Plain screenshots and charts don't, matching the reference's article images.
- Phone screenshots: a 4-column grid with a 12px gap (2 columns below 480px) and a 6px radius on each.
- Tables, for small data such as scoring weights or a funnel:
  - Full width, 14/24 sans, muted-fg.
  - Cells have 8px vertical padding with a 1px `--border` bottom border. The header row is fg at 500 weight.
  - Numbers are right-aligned with `tabular-nums`.
- `hr`: 1px `--border`, 32px vertical margin.
- **Links section:** the last `h2` on every project page is "Links". It lists the GitHub repo (or repos) first, then demos and other resources, as a plain `ul` of underlined links. Together with the header meta line, this means the repo can be reached from the top and the bottom of the page. The exception is a private repo: marko's repo is private, so its page links only the demo, the 3D map and the deck.
- Video: a YouTube iframe (youtube-nocookie) inside a 16:9 frame with a 6px radius, lazy-loaded.
- Autoplaying loop videos (muted, `playsinline`, with a poster frame) go in the same 16:9 frame.
- There is no footer and no "next project" block. Navigation is the header, as on rajan.sh.

### 8.1 Interactive figures (marko)

The marko page carries four live figures that run on the building's real map. The figures, their data and the write-up they come from are by Mateo del Rio Lanse (mdelriolanse.com/blog/marko, MIT), and the page credits him. Only the figures' logic and data are reused. Their look follows this spec, and none of his site's styling is copied.

- **No frame.** A figure sits in the text column like an article image: no card, border or background. It has a 32px top margin and a 28px bottom margin, like `.figure`.
- **Palette, monochrome:**

  | Token | Value | Use |
  |---|---|---|
  | `--fig-1` | `#030303` | the main mark: route, walk trajectory, accepted fix, marko's tracking |
  | `--fig-2` | `#6b7280` | secondary marks: stairs, raw grid path (dashed), step counting (dashed) |
  | `--fig-3` | `#a3a3a3` | searched space, walkable cells (55%), candidate rings |
  | `--fig-4` | `#cfcfcf` | scanned walls and furniture (the floor plate) |
  | `--fig-5` | `#efefef` | background cell dots, bar tracks, the route underlay |

  A mark that has to be told apart without color also changes shape: solid vs dashed lines, filled vs hollow rings.
- **Controls** sit in one row above the canvas, 12/20 sans:
  - Buttons are underlined text in muted-fg. A pressed toggle (`aria-pressed="true"`) and hover use fg with an fg underline.
  - Selects are borderless, with a 1px `--border` bottom rule.
  - Live readouts sit in the same row or just under it: values in fg at 500 weight with `tabular-nums`, labels in muted-fg.
- **Labels inside a figure** (floor names, stage text) are 12/20 muted-fg, in sentence case. Canvas text uses the sans at 11–12px.
- **Legend** under the canvas: 12px muted-fg, with 10px swatches. Lines are 16px strokes.
- **Caption:** the standard italic caption paragraph.
- **Motion:** each figure plays once when it scrolls into view and can be replayed. Under reduced motion it renders its final frame.
- **Fallback:** if the data can't load, the controls and canvases are hidden and the caption stays.

## 9. Page titles and meta

- Titles:
  - Home: `William Sharpe`
  - List: `Projects - William Sharpe`
  - Project: `<Name> - William Sharpe`
- Each page has a one-line `<meta name="description">`.
- Favicon: a black serif "W" on white, as an SVG.

## 10. Files

```
new/
  DESIGN-SPEC.md         this file
  index.html             home
  projects.html          project list
  projects/marko.html
  projects/kalshi-weather-bot.html
  projects/web-design-agency.html
  style.css              all styles
  site.js                hue backdrop + carousel (home)
  marko-figures.js       interactive marko figures (spec 8.1)
  favicon.svg
  img/                   project images, copied from the old site (content only)
  photos/                William's carousel photos (to be added)
```

Assets inside `new/` use relative paths, so the folder works wherever it is served. Two large shared resources are linked from the site root instead of being copied:
- the marko pitch-deck PDF (`/assets/media/marko-pitch-deck.pdf`)
- the live client sites (`/sites/ben-wilson/`, `/sites/luisa-mona/`)
