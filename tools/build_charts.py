"""Pre-render the Kalshi charts as static SVG/HTML and inline them into the pages.

Run from the repo root:  python tools/build_charts.py
Charts are written between <!-- chart:NAME --> and <!-- /chart:NAME --> markers,
so the pages need no JavaScript to show them.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Ensemble members per forecast high (°F). 139 members, 95 at or above 62°F (68.3%).
# Mirrors the bot's real Chicago trade KXHIGHCHI-26APR04-T62 (model 68.3%, filled at 38¢).
ENSEMBLE = {55: 1, 56: 2, 57: 3, 58: 5, 59: 8, 60: 11, 61: 14, 62: 17, 63: 19,
            64: 18, 65: 15, 66: 11, 67: 7, 68: 4, 69: 3, 70: 1}
THRESHOLD = 62

# mean(model high − observed high), °F, by month. From Kalshi_Cheater/data/station_bias.db.
BIAS = {
    "ATL": [0.47, 1.05, 1.82, 0.88, -0.31, 0.5, -0.19, 0.78, 1.09, 0.37, 0.7, 0.28],
    "DCA": [1.78, 1.56, 1.13, 1.05, 2.15, 0.16, 0.96, 0.16, 0.74, 1.36, 1.84, 1.45],
    "DEN": [-0.1, -0.47, -0.66, -0.6, -0.88, 0.28, 0.13, 0.82, -0.36, -0.34, -0.54, 0.84],
    "HOU": [2.65, 2.57, 2.33, 1.04, 2.14, 3.31, 2.98, 2.69, 2.72, 1.25, 2.33, 2.37],
    "LAX": [3.37, 1.85, 0.23, 0.25, -1.08, -0.03, -0.54, -1.25, -0.53, 0.41, 0.45, 2.09],
    "CHI": [0.63, 1.21, 1.48, 0.11, 0.32, 0.64, 0.26, -0.67, 0.47, 0.83, 0.35, 1.14],
    "MIA": [0.67, 0.01, 0.56, -0.46, -0.45, 1.82, 1.29, 0.65, 1.22, 1.48, 0.58, 1.06],
    "NYC": [1.65, 3.47, 0.58, 1.47, 1.08, -0.33, 0.04, -0.81, 0.34, 0.56, 1.27, 1.75],
    "PHX": [1.52, 0.76, 0.76, -0.15, 0.2, -0.15, 0.3, 0.26, 0.88, 1.36, 1.87, 1.98],
    "SEA": [-0.18, -0.61, -0.56, 1.34, 0.06, -0.63, -1.45, 0.12, 1.02, 0.28, -0.82, -0.88],
}
MONTHS = "JFMAMJJASOND"


def ensemble_svg(compact: bool) -> str:
    lo, hi = 54, 71
    r = 6 if compact else 6.5
    gap = r * 2 + (2 if compact else 2.4)
    pad_l, pad_b, pad_t = (20, 18, 30) if compact else (36, 48, 40)
    col_w = gap + (4 if compact else 13)
    max_n = max(ENSEMBLE.values())
    W = pad_l * 2 + (hi - lo) * col_w
    H = pad_t + max_n * gap + pad_b
    base = pad_t + max_n * gap

    def x(t):
        return pad_l + (t - lo) * col_w

    out = []
    label = "139 ensemble forecasts of the daily high; 95 of them reach 62°F or more"
    out.append(f'<svg viewBox="0 0 {W:.1f} {H:.1f}" role="img" aria-label="{label}" xmlns="http://www.w3.org/2000/svg">')
    if compact:
        out.append(f'<rect width="{W:.1f}" height="{H:.1f}" fill="#e8f1fb"/>')
    band_x = x(THRESHOLD) - col_w / 2
    out.append(f'<rect x="{band_x:.1f}" y="{pad_t - 14}" width="{x(hi) - x(THRESHOLD) + col_w:.1f}" '
               f'height="{base - pad_t + 14:.1f}" fill="{"#d7e7f9" if compact else "#f1f7fd"}"/>')
    out.append(f'<line x1="{band_x:.1f}" x2="{band_x:.1f}" y1="{pad_t - 22}" y2="{base:.1f}" stroke="#2a68b1" '
               f'stroke-width="{2 if compact else 1.5}" stroke-dasharray="4 4"/>')
    for t in range(lo, hi + 1):
        above = t >= THRESHOLD
        fill = "#4a8bd6" if above else ("#ffffff" if compact else "#c9d5e1")
        stroke = "" if above or not compact else ' stroke="#9fb3c7"'
        for j in range(ENSEMBLE.get(t, 0)):
            out.append(f'<circle cx="{x(t):.1f}" cy="{base - r - j * gap:.1f}" r="{r}" fill="{fill}"{stroke}/>')
    out.append(f'<line x1="{pad_l - col_w / 2:.1f}" x2="{x(hi) + col_w / 2:.1f}" y1="{base + 1:.1f}" '
               f'y2="{base + 1:.1f}" stroke="#9fb3c7"/>')
    if not compact:
        txt = 'font-family="Manrope, system-ui, sans-serif"'
        for t in range(lo, hi + 1, 2):
            out.append(f'<text x="{x(t):.1f}" y="{base + 20:.1f}" text-anchor="middle" font-size="12" '
                       f'fill="#6a7b8d" font-weight="600" {txt}>{t}°</text>')
        out.append(f'<text x="{W / 2:.1f}" y="{base + 40:.1f}" text-anchor="middle" font-size="12" fill="#6a7b8d" '
                   f'font-weight="700" {txt}>Forecast daily high, Chicago (°F)</text>')
        out.append(f'<text x="{band_x + 8:.1f}" y="{pad_t - 10}" font-size="12.5" fill="#2a68b1" font-weight="800" '
                   f'{txt}>Market: high ≥ 62°F</text>')
        out.append(f'<text x="{x(lo):.1f}" y="{pad_t - 10}" font-size="12.5" fill="#6a7b8d" font-weight="700" '
                   f'{txt}>44 members below</text>')
        out.append(f'<text x="{x(hi) + col_w / 2 - 6:.1f}" y="{pad_t + 18}" text-anchor="end" font-size="12.5" '
                   f'fill="#2a68b1" font-weight="700" {txt}>95 members above</text>')
    out.append("</svg>")
    return "".join(out)


def mix(a: str, b: str, t: float) -> str:
    pa = [int(a[i:i + 2], 16) for i in (0, 2, 4)]
    pb = [int(b[i:i + 2], 16) for i in (0, 2, 4)]
    return "rgb({},{},{})".format(*[round(u + (v - u) * t) for u, v in zip(pa, pb)])


def bias_html() -> str:
    cells = ['<div class="heat" role="table" aria-label="Forecast bias by station and month, degrees Fahrenheit">',
             '<div role="columnheader"></div>']
    cells += [f'<div class="h" role="columnheader">{m}</div>' for m in MONTHS]
    for st, vals in BIAS.items():
        cells.append(f'<div class="r" role="rowheader">{st}</div>')
        for m, v in enumerate(vals):
            t = min(abs(v) / 3, 1)
            bg = mix("ffffff", "e6936f", t) if v >= 0 else mix("ffffff", "4a8bd6", t)
            label = "0.0" if abs(v) < 0.05 else f"{v:+.1f}"
            cells.append(f'<div class="c" role="cell" style="background:{bg}" title="{st} {MONTHS[m]}: {label}°F">{label}</div>')
    cells.append("</div>")
    return "".join(cells)


CHARTS = {"ensemble": ensemble_svg(False), "ensemble-thumb": ensemble_svg(True), "bias": bias_html()}


def inject(path: Path) -> None:
    html = path.read_text(encoding="utf-8")
    for name, body in CHARTS.items():
        pat = re.compile(rf"(<!-- chart:{re.escape(name)} -->).*?(<!-- /chart:{re.escape(name)} -->)", re.S)
        html = pat.sub(lambda m: m.group(1) + body + m.group(2), html)
    path.write_text(html, encoding="utf-8")


if __name__ == "__main__":
    for p in [ROOT / "index.html", ROOT / "projects" / "kalshi-weather-bot.html"]:
        inject(p)
        print("updated", p.relative_to(ROOT))
