# williambsharpe.com

Personal portfolio for William Sharpe. Plain HTML, CSS and a little vanilla JS. No build step.

```
index.html                     home: intro, work, about, contact
projects/*.html                one page per project
assets/css/style.css           all styles (Manrope, white + calm blue)
assets/js/main.js              optional enhancements: slide deck viewer, inline YouTube player
tools/build_charts.py          pre-renders the Kalshi charts into the HTML (not deployed)
404.html                       not-found page (Vercel serves it automatically)
assets/img, assets/slides      screenshots and Marko pitch-deck slides (webp)
assets/media                   Marko pitch deck PDF
sites/ben-wilson, sites/luisa-mona   copies of client sites, embedded live on the agency page (noindex)
project_imgs/                  full-size images for LinkedIn (not deployed, see .vercelignore)
```

## Run locally

Any static server works. Vercel serves `projects/marko.html` at `/projects/marko` (`cleanUrls` in `vercel.json`).

```
npx serve .
```

## Deploy

Import the repo in Vercel with the "Other" framework preset, no build command, and output directory `.`.

## Editing

- Project copy lives directly in each `projects/*.html` file.
- Kalshi chart data lives in `tools/build_charts.py`. After editing it, run `python tools/build_charts.py` to re-inline the charts.
- No animations. Every page works with JavaScript disabled: the charts are static, the deck becomes a swipeable strip, and the demo video links to YouTube.
