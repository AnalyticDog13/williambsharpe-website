# williambsharpe.com

Personal portfolio for William Sharpe. Plain HTML, CSS and vanilla JS. No build step. The design is specified in `DESIGN-SPEC.md` (modeled on rajan.sh).

```
index.html                     home: intro, contact, photo carousel with hue backdrop
projects.html                  project list
projects/*.html                one page per project
style.css                      all styles
site.js                        hue backdrop (WebGL) + carousel
marko-figures.js               interactive figures on the marko page (adapted from mdelriolanse.com/blog/marko)
img/                           project images; img/marko/ holds the marko map data and media
photos/                        carousel slides, 16:9 at 1600x900 (originals kept but not deployed)
sites/ben-wilson, sites/luisa-mona   client sites linked from the agency page (noindex)
project_imgs/                  full-size images for LinkedIn (not deployed)
robots.txt, sitemap.xml        crawl rules and page list (update lastmod when pages change)
```

## Run locally

Any static server works. Vercel serves `projects/marko.html` at `/projects/marko` (`cleanUrls` in `vercel.json`).

```
npx serve .
```

## Deploy

Import the repo in Vercel with the "Other" framework preset, no build command, and output directory `.`.
