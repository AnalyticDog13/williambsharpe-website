// Interactive figures for the marko page. Ported from Mateo del Rio Lanse's post
// (mdelriolanse.com/blog/marko, MIT), which runs on marko's real PSB map export.
// Styling follows DESIGN-SPEC.md section 8.1: colors come from the --fig-* tokens.
(() => {
  const BASE = new URL('img/marko/', document.currentScript.src).href;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

  /* ---------------------------------------------------------------- router */
  // Plan frame: metres, x right, y down the floor image.

  const WALK_MPS = 1.3;
  const STAIRS_S = 15;
  const WALL_PENALTY = [0, 1.5, 0.6, 0.2];
  const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];

  class Heap {
    constructor() { this.a = []; }
    get size() { return this.a.length; }
    push(k, v) {
      const a = this.a;
      a.push([k, v]);
      for (let i = a.length - 1; i > 0;) {
        const p = (i - 1) >> 1;
        if (a[p][0] <= a[i][0]) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    pop() {
      const a = this.a;
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        for (let i = 0; ;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < a.length && a[l][0] < a[m][0]) m = l;
          if (r < a.length && a[r][0] < a[m][0]) m = r;
          if (m === i) break;
          [a[m], a[i]] = [a[i], a[m]];
          i = m;
        }
      }
      return top;
    }
  }

  class Grid {
    constructor(g) {
      this.cols = g.cols;
      this.rows = g.rows;
      this.m = g.cellM;
      const bits = Uint8Array.from(atob(g.blocked), (c) => c.charCodeAt(0));
      const n = this.cols * this.rows;
      this.blocked = new Uint8Array(n);
      for (let i = 0; i < n; i++) this.blocked[i] = (bits[i >> 3] >> (7 - (i & 7))) & 1;
      this.clear = this.clearance();
    }

    // Distance to the nearest wall, in cells, capped at 255.
    clearance() {
      const { cols, rows } = this;
      const out = new Uint8Array(cols * rows).fill(255);
      const q = [];
      for (let i = 0; i < out.length; i++) {
        const r = Math.floor(i / cols), c = i % cols;
        if (this.blocked[i]) { out[i] = 0; q.push(i); }
        else if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) { out[i] = 1; q.push(i); }
      }
      for (let k = 0; k < q.length; k++) {
        const i = q[k];
        const r = Math.floor(i / cols), c = i % cols;
        for (const [dc, dr] of NB) {
          const nr = r + dr, nc = c + dc, j = nr * cols + nc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && out[j] > out[i] + 1) {
            out[j] = out[i] + 1;
            q.push(j);
          }
        }
      }
      return out;
    }

    cell([x, y]) {
      return clamp(Math.floor(y / this.m), 0, this.rows - 1) * this.cols + clamp(Math.floor(x / this.m), 0, this.cols - 1);
    }

    center(i) {
      return [((i % this.cols) + 0.5) * this.m, (Math.floor(i / this.cols) + 0.5) * this.m];
    }

    // Dijkstra from src; stops once goal is settled. `order` is the settle order.
    dijkstra(src, goal = -1) {
      const { cols, rows } = this;
      const n = cols * rows;
      const dist = new Float64Array(n).fill(Infinity);
      const prev = new Int32Array(n).fill(-1);
      const done = new Uint8Array(n);
      const order = [];
      const h = new Heap();
      dist[src] = 0;
      h.push(0, src);
      while (h.size) {
        const [d, i] = h.pop();
        if (done[i]) continue;
        done[i] = 1;
        order.push(i);
        if (i === goal) break;
        const r = Math.floor(i / cols), c = i % cols;
        for (const [dc, dr, ln] of NB) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const j = nr * cols + nc;
          // no corner cutting between two blocked cells
          if (this.blocked[j] || (dr && dc && (this.blocked[r * cols + nc] || this.blocked[nr * cols + c]))) continue;
          const cj = this.clear[j];
          const nd = d + ln * this.m * (1 + (cj < WALL_PENALTY.length ? WALL_PENALTY[cj] : 0));
          if (nd < dist[j]) { dist[j] = nd; prev[j] = i; h.push(nd, j); }
        }
      }
      return { dist, prev, order };
    }

    los(a, b, minClear) {
      const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (this.m * 0.5)));
      for (let k = 0; k <= steps; k++) {
        const p = [a[0] + ((b[0] - a[0]) * k) / steps, a[1] + ((b[1] - a[1]) * k) / steps];
        if (this.clear[this.cell(p)] < minClear) return false;
      }
      return true;
    }

    // Straighten a cell path into a few long legs; surviving corners become turns.
    simplify(cells, from, to) {
      const pts = cells.map((c) => this.center(c));
      pts[0] = from;
      pts[pts.length - 1] = to;
      const out = [pts[0]];
      for (let i = 0; i < pts.length - 1;) {
        let nxt = i + 1;
        for (let k = Math.min(pts.length - 1, i + 160); k > i + 1; k--) {
          const minClear = Math.max(1, Math.min(2, this.clear[cells[i]], this.clear[cells[k]]));
          if (this.los(pts[i], pts[k], minClear)) { nxt = k; break; }
        }
        out.push(pts[nxt]);
        i = nxt;
      }
      const keep = [out[0]];
      const ang = (a, b) => Math.atan2(b[0] - a[0], -(b[1] - a[1]));
      for (let i = 1; i < out.length - 1; i++) {
        const a = keep[keep.length - 1], b = out[i], c = out[i + 1];
        let d = ((Math.abs(ang(a, b) - ang(b, c)) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        d = Math.min(d, 2 * Math.PI - d);
        const straight = d <= (8 * Math.PI) / 180 || Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5;
        if (!(straight && this.los(a, c, 1))) keep.push(b);
      }
      return [...keep, out[out.length - 1]];
    }
  }

  const backtrack = (prev, t) => {
    const out = [];
    for (; t !== -1; t = prev[t]) out.push(t);
    return out.reverse();
  };

  const pathLength = (pts) => pts.slice(1).reduce((t, p, i) => t + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

  function route(G, grids, start, place) {
    const sf = start.floor, sg = grids[sf];
    const tf = place.floor, tg = grids[tf];
    const t = tg.cell(place.target);
    const explored = [];
    let cells;
    if (sf === tf) {
      const s = sg.dijkstra(sg.cell(start.target), t);
      explored.push([sf, s.order]);
      cells = [[sf, backtrack(s.prev, t), start.target, place.target]];
    } else {
      const ids = G.floors.map((f) => f.id);
      const gap = Math.abs(ids.indexOf(tf) - ids.indexOf(sf));
      let best = null;
      for (const c of G.connectors) {
        if (!(sf in c.stops) || !(tf in c.stops)) continue;
        const vt = c.kind === 'stairs' ? STAIRS_S * gap : 45 + 5 * gap;
        const a = sg.dijkstra(sg.cell(start.target), sg.cell(c.stops[sf]));
        const b = tg.dijkstra(tg.cell(c.stops[tf]), t);
        const cost = a.dist[sg.cell(c.stops[sf])] + vt * WALK_MPS + b.dist[t];
        if (!best || cost < best.cost) best = { cost, c, a, b };
      }
      if (!best) return null;
      const { c, a, b } = best;
      explored.push([sf, a.order], [tf, b.order]);
      cells = [
        [sf, backtrack(a.prev, sg.cell(c.stops[sf])), start.target, c.stops[sf]],
        [tf, backtrack(b.prev, t), c.stops[tf], place.target],
      ];
    }
    const legs = cells.map(([f, cs, a, b]) => ({ floor: f, raw: cs.map((i) => grids[f].center(i)), pts: grids[f].simplify(cs, a, b) }));
    const walkM = legs.reduce((s, l) => s + pathLength(l.pts), 0);
    return { legs, walkM, explored, climbs: legs.length - 1 };
  }

  // The first q (0 to 1) of a polyline, by length.
  function partial(pts, q) {
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let left = q * seg.reduce((a, b) => a + b, 0);
    const out = [pts[0]];
    for (let i = 0; i < seg.length; i++) {
      if (left >= seg[i]) { out.push(pts[i + 1]); left -= seg[i]; continue; }
      const t = seg[i] ? left / seg[i] : 0;
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
      break;
    }
    return out;
  }

  // Walkable cells' bounds plus a margin.
  function boxOf(g, pad = 2) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    g.blocked.forEach((b, i) => {
      if (b) return;
      const [x, y] = g.center(i);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    });
    return { x0: x0 - pad, x1: x1 + pad, y0: y0 - pad, y1: y1 + pad };
  }

  /* ------------------------------------------------------------ plumbing */

  const css = getComputedStyle(document.documentElement);
  const C = {
    c1: css.getPropertyValue('--fig-1').trim(),
    c2: css.getPropertyValue('--fig-2').trim(),
    c3: css.getPropertyValue('--fig-3').trim(),
    c4: css.getPropertyValue('--fig-4').trim(),
    c5: css.getPropertyValue('--fig-5').trim(),
    fg: css.getPropertyValue('--fg').trim(),
    bg: css.getPropertyValue('--bg').trim(),
    font: getComputedStyle(document.body).fontFamily,
  };

  // Floor plates span the whole 43 x 80 m plan.
  const PLATE = { w: 43, h: 80 };

  // The floor plates and heat grids are alpha masks; fill them with a token color.
  const tintCache = new Map();
  function tinted(src, color, key) {
    const k = `${key}|${color}`;
    let cv = tintCache.get(k);
    if (!cv) {
      cv = document.createElement('canvas');
      cv.width = src.naturalWidth || src.width;
      cv.height = src.naturalHeight || src.height;
      const ctx = cv.getContext('2d');
      ctx.drawImage(src, 0, 0);
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, cv.width, cv.height);
      tintCache.set(k, cv);
    }
    return cv;
  }

  // A canvas showing a plan box, turned a quarter so the long axis runs across.
  function view(canvas, box) {
    const ctx = canvas.getContext('2d');
    const v = {
      canvas, ctx, s: 1, dpr: 1,
      fit() {
        const w = canvas.clientWidth || canvas.parentElement.clientWidth;
        v.dpr = devicePixelRatio || 1;
        v.s = w / (box.y1 - box.y0);
        canvas.width = Math.round(w * v.dpr);
        canvas.height = Math.round(v.s * (box.x1 - box.x0) * v.dpr);
      },
      plan() {
        const k = v.s * v.dpr;
        ctx.setTransform(0, -k, k, 0, -box.y0 * k, box.x1 * k);
      },
      screen() { ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0); },
      px: (n) => n / v.s, // screen px to metres
      toScreen: (x, y) => [(y - box.y0) * v.s, (box.x1 - x) * v.s],
      toPlan: (X, Y) => [box.x1 - Y / v.s, X / v.s + box.y0],
      clear() { v.screen(); ctx.clearRect(0, 0, canvas.width, canvas.height); },
    };
    v.fit();
    return v;
  }

  function line(ctx, pts, n = pts.length) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
  }

  function dot(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
  }

  // A text label on a white pill, in screen space.
  function pill(v, text, X, Y) {
    const ctx = v.ctx;
    ctx.font = `12px ${C.font}`;
    const w = ctx.measureText(text).width;
    const x = clamp(X - w / 2, 4, v.canvas.clientWidth - w - 4);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = C.bg;
    ctx.fillRect(x - 5, Y - 13, w + 10, 18);
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.fg;
    ctx.fillText(text, x, Y);
  }

  const drawFloor = (v, img, color) => v.ctx.drawImage(tinted(img, color, img.src), 0, 0, PLATE.w, PLATE.h);

  function whenVisible(el, fn, threshold = 0.35) {
    new IntersectionObserver((es, o) => {
      if (es[0].isIntersecting) { o.disconnect(); fn(); }
    }, { threshold }).observe(el);
  }

  function onWidth(el, fn) {
    let lastW = 0;
    new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      if (w !== lastW) { const first = !lastW; lastW = w; if (!first) fn(); }
    }).observe(el);
  }

  function loadData() {
    const json = (p) => fetch(BASE + p).then((r) => r.json());
    const img = (p) => new Promise((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = fail;
      i.src = BASE + p;
    });
    return Promise.all([json('psb.json'), json('walks.json'), json('scan.json'), img('floor1.png'), img('floor2.png')]).then(([G, walks, scan, f1, f2]) => {
      const grids = Object.fromEntries(G.floors.map((f) => [f.id, new Grid(f.grid)]));
      const boxes = Object.fromEntries(Object.entries(grids).map(([id, g]) => [id, boxOf(g)]));
      return { G, grids, boxes, walks, scan, floors: { 1: f1, 2: f2 } };
    });
  }

  /* ---------------------------------------------------------- walk figure */

  function startWalk(root, d) {
    const q = (k) => root.querySelector(`[data-k="${k}"]`);
    const grid = d.grids['2'];
    const v = view(q('canvas'), d.boxes['2']);
    const stage = q('stage');
    const scrub = q('scrub');

    // Floor-2 walk lines in walk order, with cumulative length.
    const lines = [], all = [];
    let L = 0;
    for (const w of d.walks)
      for (const l of w.lines)
        if (l.floor === '2') {
          const pts = [];
          l.pts.forEach((p, i) => {
            if (i) L += Math.hypot(p[0] - l.pts[i - 1][0], p[1] - l.pts[i - 1][1]);
            pts.push([p[0], p[1], L]);
            all.push([p[0], p[1], L]);
          });
          lines.push(pts);
        }

    // Each walkable cell appears when the walk first passes within 0.75 m.
    const cells = [];
    for (let i = 0; i < grid.blocked.length; i++)
      if (!grid.blocked[i]) {
        const [cx, cy] = grid.center(i);
        let first = L;
        for (const p of all) if (p[2] < first && Math.abs(p[0] - cx) < 0.75 && Math.abs(p[1] - cy) < 0.75) first = p[2];
        cells.push([cx, cy, first]);
      }

    let p = 1, user = false, raf = 0;

    const draw = () => {
      const ctx = v.ctx;
      const walkP = clamp(p / 0.8, 0, 1);
      const upto = walkP * L;
      const settle = clamp((p - 0.8) / 0.2, 0, 1);
      v.clear();
      v.plan();
      drawFloor(v, d.floors[2], C.c4);

      ctx.fillStyle = C.c3;
      ctx.globalAlpha = 0.55;
      const h = grid.m / 2 - v.px(0.5);
      for (const [x, y, first] of cells) if (first <= upto || settle > 0) ctx.fillRect(x - h, y - h, 2 * h, 2 * h);

      ctx.strokeStyle = C.c1;
      ctx.lineWidth = v.px(1.6);
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.globalAlpha = 1 - 0.6 * settle;
      let head = null;
      for (const l of lines) {
        if (l[0][2] > upto) break;
        let n = l.findIndex((pt) => pt[2] > upto);
        n = n < 0 ? l.length : n;
        line(ctx, l, n);
        ctx.stroke();
        head = l[n - 1];
      }
      ctx.globalAlpha = 1;
      if (head && walkP < 1) {
        ctx.fillStyle = C.c1;
        dot(ctx, head[0], head[1], v.px(5));
        ctx.globalAlpha = 0.18;
        dot(ctx, head[0], head[1], v.px(14));
        ctx.globalAlpha = 1;
      }
      stage.textContent = walkP < 1 ? `Floor 2, walking: ${Math.round(upto)} m` : 'Floor 2: every cell near the walk is walkable';
      scrub.value = String(Math.round(p * 1000));
    };

    const play = () => {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const tick = (now) => {
        p = clamp((now - t0) / 7000, 0, 1);
        draw();
        if (p < 1 && !user) raf = requestAnimationFrame(tick);
      };
      user = false;
      raf = requestAnimationFrame(tick);
    };

    scrub.addEventListener('input', () => {
      user = true;
      cancelAnimationFrame(raf);
      p = Number(scrub.value) / 1000;
      draw();
    });
    q('play').addEventListener('click', play);
    onWidth(root, () => { v.fit(); draw(); });

    draw();
    if (!reduced()) {
      p = 0;
      draw();
      whenVisible(v.canvas, play);
    }
  }

  /* -------------------------------------------------------- router figure */

  function startRouter(root, d) {
    const q = (k) => root.querySelector(`[data-k="${k}"]`);
    const { G, grids } = d;
    const byId = Object.fromEntries(G.places.map((p) => [p.id, p]));
    const places = G.places.filter((p) => !p.hidden && p.routable);
    const name = (p) => (p.id === G.defaultStart ? 'Atrium tables' : p.label);
    const opts = [
      byId[G.defaultStart],
      ...places.sort((a, b) => a.floor.localeCompare(b.floor) || a.label.localeCompare(b.label, undefined, { numeric: true })),
    ];

    const fromSel = q('from'), toSel = q('to');
    for (const sel of [fromSel, toSel])
      sel.replaceChildren(...['1', '2'].map((f) => {
        const group = document.createElement('optgroup');
        group.label = `Floor ${f}`;
        for (const p of opts.filter((o) => o.floor === f)) group.append(new Option(name(p), p.id));
        return group;
      }));
    fromSel.value = G.defaultStart;
    toSel.value = '2-294f-clark' in byId ? '2-294f-clark' : places[places.length - 1].id;

    const views = { 1: view(q('r1'), d.boxes['1']), 2: view(q('r2'), d.boxes['2']) };
    let R = null, t0 = 0, raw = false, raf = 0;

    const draw = (now) => {
      const k = reduced() ? 9 : (now - t0) / 1000; // seconds since solve
      const from = byId[fromSel.value], to = byId[toSel.value];
      for (const f of ['1', '2']) {
        const v = views[f], ctx = v.ctx, grid = grids[f];
        v.clear();
        v.plan();
        drawFloor(v, d.floors[f], C.c4);
        ctx.fillStyle = C.c5;
        for (let i = 0; i < grid.blocked.length; i++)
          if (!grid.blocked[i]) {
            const [x, y] = grid.center(i);
            ctx.fillRect(x - 0.25, y - 0.25, 0.5, 0.5);
          }

        if (R) {
          // frontier: legs explore one after the other, 0.9 s each
          ctx.fillStyle = C.c3;
          ctx.globalAlpha = 0.45;
          R.explored.forEach(([ef, order], li) => {
            if (ef !== f) return;
            const n = Math.floor(order.length * ease((k - li * 0.9) / 0.9));
            for (let i = 0; i < n; i++) {
              const [x, y] = grid.center(order[i]);
              ctx.fillRect(x - 0.25, y - 0.25, 0.5, 0.5);
            }
          });
          ctx.globalAlpha = 1;

          const tDraw = R.explored.length * 0.9;
          R.legs.forEach((leg, li) => {
            if (leg.floor !== f) return;
            ctx.lineJoin = ctx.lineCap = 'round';
            if (raw) {
              ctx.strokeStyle = C.c2;
              ctx.lineWidth = v.px(1.5);
              ctx.setLineDash([v.px(3), v.px(3)]);
              line(ctx, leg.raw);
              ctx.stroke();
              ctx.setLineDash([]);
            }
            const t = clamp((k - tDraw - li * 0.7) / 0.7, 0, 1);
            if (t <= 0) return;
            const pts = partial(leg.pts, ease(t));
            ctx.strokeStyle = C.c1;
            ctx.globalAlpha = 0.18;
            ctx.lineWidth = v.px(9);
            line(ctx, pts);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.lineWidth = v.px(3);
            line(ctx, pts);
            ctx.stroke();
            ctx.fillStyle = C.c1;
            for (const p of pts.slice(1, -1)) dot(ctx, p[0], p[1], v.px(3.5));
            const hd = pts[pts.length - 1];
            dot(ctx, hd[0], hd[1], v.px(6));
          });
        }

        for (const c of G.connectors)
          if (c.stops[f]) {
            const [x, y] = c.stops[f];
            ctx.strokeStyle = C.c2;
            ctx.lineWidth = v.px(1.5);
            ctx.strokeRect(x - v.px(7), y - v.px(7), v.px(14), v.px(14));
            v.screen();
            const [X, Y] = v.toScreen(x, y);
            ctx.fillStyle = C.c2;
            ctx.font = `11px ${C.font}`;
            ctx.fillText('stairs', X + 11, Y + 4);
            v.plan();
          }
        for (const p of opts)
          if (p.floor === f) {
            const sel = p === from || p === to;
            ctx.fillStyle = sel ? C.c1 : C.c3;
            dot(ctx, p.target[0], p.target[1], v.px(sel ? 5.5 : 2.6));
          }
        v.screen();
        for (const [p, tag] of [[from, 'From'], [to, 'To']])
          if (p.floor === f) {
            const [X, Y] = v.toScreen(...p.target);
            pill(v, `${tag}: ${name(p)}`, X, Y < 26 ? Y + 22 : Y - 12);
          }
      }
      if (!reduced() && R && k < R.explored.length * 0.9 + R.legs.length * 0.7 + 0.1) raf = requestAnimationFrame(draw);
    };

    const solve = () => {
      const from = byId[fromSel.value], to = byId[toSel.value];
      const a = performance.now();
      R = from === to ? null : route(G, grids, from, to);
      const ms = performance.now() - a;
      const s = R ? R.walkM / WALK_MPS + STAIRS_S * R.climbs : 0;
      q('walk').textContent = R ? `${R.walkM.toFixed(1)} m` : '–';
      q('time').textContent = R ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}` : '–';
      q('cells').textContent = R ? R.explored.reduce((n, e) => n + e[1].length, 0).toLocaleString() : '–';
      q('ms').textContent = R ? (ms < 0.1 ? '<0.1 ms' : `${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`) : '–';
      cancelAnimationFrame(raf);
      t0 = performance.now();
      raf = requestAnimationFrame(draw);
    };
    // Jump to the last frame, for redraws that should not replay the animation.
    const settle = () => { t0 = performance.now() - 1e5; draw(performance.now()); };

    fromSel.addEventListener('change', solve);
    toSel.addEventListener('change', solve);
    q('shuffle').addEventListener('click', () => {
      const pick = () => opts[Math.floor(Math.random() * opts.length)].id;
      const a = pick();
      let b = pick();
      while (b === a) b = pick();
      fromSel.value = a;
      toSel.value = b;
      solve();
    });
    const rawBtn = q('raw');
    rawBtn.addEventListener('click', () => {
      raw = !raw;
      rawBtn.setAttribute('aria-pressed', String(raw));
      settle();
    });
    for (const f of ['1', '2'])
      views[f].canvas.addEventListener('click', (e) => {
        const r = views[f].canvas.getBoundingClientRect();
        const [x, y] = views[f].toPlan(e.clientX - r.left, e.clientY - r.top);
        let best = null, bd = 4;
        for (const p of opts)
          if (p.floor === f) {
            const dd = Math.hypot(p.target[0] - x, p.target[1] - y);
            if (dd < bd) { bd = dd; best = p; }
          }
        if (best) { toSel.value = best.id; solve(); }
      });
    onWidth(root, () => { views[1].fit(); views[2].fit(); settle(); });

    whenVisible(views[2].canvas, solve);
    draw(performance.now());
  }

  /* ---------------------------------------------------------- scan figure */

  const SCAN_CASES = { distinct: 6, ambiguous: 2.5 }; // scan radius in metres, as exported
  const PLACINGS = ['Best match', 'Runner-up', 'Third'];

  function startScan(root, d) {
    const q = (k) => root.querySelector(`[data-k="${k}"]`);
    const box = d.boxes['1'];
    const v = view(q('canvas'), box);
    const inset = q('inset');
    const bars = q('bars');
    const verdict = q('verdict');
    let key = 'distinct', t0 = 0, raf = 0, shown = false;

    // Heat grid to a white mask with alpha (x/99)^4.
    const masks = {};
    for (const k of Object.keys(SCAN_CASES)) {
      const h = d.scan[k].heat;
      const cv = document.createElement('canvas');
      cv.width = h.cols;
      cv.height = h.rows;
      const ctx = cv.getContext('2d');
      const im = ctx.createImageData(h.cols, h.rows);
      h.v.forEach((x, i) => im.data.set([255, 255, 255, Math.round(Math.pow(x / 99, 4) * 255)], i * 4));
      ctx.putImageData(im, 0, 0);
      masks[k] = tinted(cv, C.c1, `heat-${k}`);
    }

    // Accept only when the best spot clearly beats the runner-up.
    const isOk = (s) => s.peaks[0][2] - s.peaks[1][2] >= 0.1;

    function renderInset(scan, radius) {
      // Same quarter turn as the map: plan (x, y) draws at (y, -x).
      const cx = scan.walker[1], cy = -scan.walker[0], r = radius + 0.4;
      const pts = scan.pts.map(([x, y]) => `<circle cx="${y}" cy="${-x}" r="${radius * 0.012}"/>`).join('');
      inset.innerHTML = `<svg viewBox="${cx - r} ${cy - r} ${2 * r} ${2 * r}" role="img" aria-label="The scan from above: wall points within ${radius} m of the phone.">
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${C.c5}" stroke="${C.c3}" stroke-width="${radius * 0.01}" stroke-dasharray="${radius * 0.04} ${radius * 0.03}"/>
        <g fill="${C.c1}">${pts}</g>
        <circle cx="${cx}" cy="${cy}" r="${radius * 0.045}" fill="${C.bg}" stroke="${C.c1}" stroke-width="${radius * 0.018}"/>
      </svg>`;
    }

    function renderSide() {
      const scan = d.scan[key], ok = isOk(scan), peaks = scan.peaks;
      const tied = peaks.filter((p) => peaks[0][2] - p[2] < 0.1).length;
      renderInset(scan, SCAN_CASES[key]);
      bars.innerHTML = peaks.map(([, , score], i) => `
        <div class="scan-row">
          <dt><span class="rank${i === 0 && ok ? ' on' : ''}">${i + 1}</span>${PLACINGS[i]}</dt>
          <dd><span class="track"><span class="fill${i === 0 && ok ? ' on' : ''}" data-w="${score * 100}" style="transition-delay:${0.4 + i * 0.04}s"></span></span></dd>
        </div>`).join('');
      verdict.innerHTML = ok
        ? '<strong>Accepted: one spot clearly fits best.</strong> The trail snaps to where you are.'
        : `<strong>Rejected: ${tied} spots fit equally well.</strong> marko keeps looking instead of guessing.`;
      verdict.classList.remove('in');
      if (!shown) return;
      // Commit the empty state, then animate bars and verdict in.
      void bars.offsetWidth;
      bars.querySelectorAll('.fill').forEach((el) => { el.style.width = el.dataset.w + '%'; });
      verdict.classList.add('in');
    }

    const draw = (now) => {
      const t = reduced() ? 9 : (now - t0) / 1000;
      const scan = d.scan[key], ok = isOk(scan), peaks = scan.peaks;
      const ctx = v.ctx;
      const W = box.y1 - box.y0;
      v.clear();
      v.plan();
      drawFloor(v, d.floors[1], C.c4);

      // the fit wash, revealed left to right
      if (shown) {
        v.screen();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, ease(t / 0.9) * W * v.s, v.canvas.height);
        ctx.clip();
        v.plan();
        ctx.globalAlpha = 0.55;
        ctx.filter = `blur(${0.5 * v.s * v.dpr}px)`;
        ctx.drawImage(masks[key], 0, 0, scan.heat.cols * 0.5, scan.heat.rows * 0.5);
        ctx.filter = 'none';
        ctx.restore(); // also restores the screen transform set before save()
        v.plan();
        ctx.globalAlpha = 1;

        // the scan, laid where marko placed it
        ctx.globalAlpha = clamp((t - 1.2) / 0.4, 0, 1);
        ctx.fillStyle = ok ? C.c1 : C.c2;
        for (const [px, py] of ok ? peaks.slice(0, 1) : peaks)
          for (const [x, y] of scan.pts) dot(ctx, px + x, py + y, 0.07);
        ctx.globalAlpha = 1;

        // numbered rings over the best-fitting spots
        v.screen();
        const s = v.s;
        peaks.forEach(([x, y], i) => {
          const [X, Y] = v.toScreen(x, y);
          const filled = i === 0 && ok;
          ctx.globalAlpha = clamp((t - 0.9 - i * 0.08) / 0.3, 0, 1);
          ctx.strokeStyle = C.c3;
          ctx.lineWidth = 0.1 * s;
          ctx.beginPath();
          ctx.moveTo(X, Y - 1.55 * s);
          ctx.lineTo(X, Y - 0.35 * s);
          ctx.stroke();
          ctx.fillStyle = C.c3;
          dot(ctx, X, Y, 0.3 * s);
          ctx.fillStyle = filled ? C.c1 : C.bg;
          ctx.strokeStyle = filled ? C.c1 : C.c3;
          ctx.lineWidth = 0.15 * s;
          ctx.beginPath();
          ctx.arc(X, Y - 2.6 * s, 1.05 * s, 0, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = filled ? C.bg : C.c2;
          ctx.font = `${Math.round(1.2 * s)}px ${C.font}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), X, Y - 2.6 * s);
          ctx.textAlign = 'start';
          ctx.textBaseline = 'alphabetic';
        });
        ctx.globalAlpha = 1;
      }
      if (shown && !reduced() && t < 1.8) raf = requestAnimationFrame(draw);
    };

    const replay = () => {
      renderSide();
      cancelAnimationFrame(raf);
      t0 = performance.now();
      raf = requestAnimationFrame(draw);
    };

    root.querySelectorAll('[data-case]').forEach((b) => b.addEventListener('click', () => {
      key = b.dataset.case;
      root.querySelectorAll('[data-case]').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      replay();
    }));
    q('replay').addEventListener('click', replay);
    onWidth(root, () => { v.fit(); t0 = performance.now() - 1e5; draw(performance.now()); });

    renderSide();
    draw(performance.now());
    whenVisible(v.canvas, () => { shown = true; replay(); }, 0.2);
  }

  /* --------------------------------------------------------- drift figure */

  // Illustrative error models: [stride scale, heading bias in degrees].
  const DRIFT_MODELS = { vio: [1.015, 0.8], dr: [1.05, 6] };

  function startDrift(root, d) {
    const q = (k) => root.querySelector(`[data-k="${k}"]`);
    const { G, grids } = d;
    // pad the bottom edge (plan x0) so the walker's ring isn't clipped
    const v = view(q('canvas'), { ...d.boxes['2'], x0: d.boxes['2'].x0 - 1.5 });
    const byId = Object.fromEntries(G.places.map((p) => [p.id, p]));
    const start = byId['2-208-clark'] || G.places.find((p) => p.floor === '2');
    const dist = (p) => Math.hypot(p.target[0] - start.target[0], p.target[1] - start.target[1]);
    const far = G.places.filter((p) => p.floor === '2' && p.routable && !p.hidden).sort((a, b) => dist(b) - dist(a))[0];
    const pts = route(G, grids, start, far).legs[0].pts;
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    const L = seg.reduce((a, b) => a + b, 0);
    const at = (dd) => {
      for (let i = 0; i < seg.length; i++) {
        if (dd <= seg[i]) {
          const t = dd / seg[i];
          return [
            [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t],
            Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]),
          ];
        }
        dd -= seg[i];
      }
      return [pts[pts.length - 1], 0];
    };

    let fixes = true, playing = !reduced(), dd = 0, last = performance.now();
    let sinceFix = 0, pulse = -1, visible = false, hold = 0;
    let est = {}, trails = {};

    const reset = () => {
      dd = 0;
      sinceFix = 0;
      pulse = -1;
      est = { vio: [...pts[0]], dr: [...pts[0]] };
      trails = { vio: [[...pts[0]]], dr: [[...pts[0]]] };
    };
    const step = (ds) => {
      const [, hd] = at(dd);
      for (const k of ['vio', 'dr']) {
        const [sc, bias] = DRIFT_MODELS[k];
        const h = hd + (bias * Math.PI) / 180;
        est[k][0] += Math.cos(h) * ds * sc;
        est[k][1] += Math.sin(h) * ds * sc;
        trails[k].push([...est[k]]);
      }
      dd += ds;
      sinceFix += ds;
      if (fixes && sinceFix >= 25) {
        sinceFix = 0;
        pulse = dd;
        const [p] = at(dd);
        for (const k of ['vio', 'dr']) {
          est[k] = [...p];
          trails[k].push(null, [...p]);
        }
      }
    };

    const draw = () => {
      const ctx = v.ctx;
      const [p] = at(dd);
      v.clear();
      v.plan();
      drawFloor(v, d.floors[2], C.c4);
      ctx.lineJoin = ctx.lineCap = 'round';
      ctx.strokeStyle = C.c5;
      ctx.lineWidth = v.px(5);
      line(ctx, pts);
      ctx.stroke();
      for (const [k, col, dash] of [['dr', C.c2, true], ['vio', C.c1, false]]) {
        ctx.strokeStyle = col;
        ctx.lineWidth = v.px(1.5);
        ctx.setLineDash(dash ? [v.px(4), v.px(3)] : []);
        let run = [];
        for (const pt of [...trails[k], null]) {
          if (pt) run.push(pt);
          else {
            if (run.length > 1) { line(ctx, run); ctx.stroke(); }
            run = [];
          }
        }
        ctx.setLineDash([]);
        ctx.fillStyle = col;
        dot(ctx, est[k][0], est[k][1], v.px(5));
      }
      // the true position is a hollow ring, so it reads apart from the estimates
      ctx.fillStyle = C.bg;
      ctx.strokeStyle = C.c1;
      ctx.lineWidth = v.px(2);
      ctx.beginPath();
      ctx.arc(p[0], p[1], v.px(6.5), 0, 7);
      ctx.fill();
      ctx.stroke();
      if (pulse >= 0 && dd >= pulse && dd - pulse < 6) {
        const t = (dd - pulse) / 6;
        ctx.globalAlpha = 1 - t;
        ctx.beginPath();
        ctx.arc(p[0], p[1], v.px(8 + 40 * t), 0, 7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const off = (k) => `${Math.hypot(est[k][0] - p[0], est[k][1] - p[1]).toFixed(1)} m`;
      q('dr').textContent = off('dr');
      q('vio').textContent = off('vio');
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playing && visible) {
        // 4x real time, in four small steps
        for (let k = 0; k < 4; k++) if (dd < L) step(dt * 1.3);
        if (dd >= L) {
          hold ||= now;
          if (now - hold > 1500) { hold = 0; reset(); }
        }
        draw();
      }
      requestAnimationFrame(tick);
    };

    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(v.canvas);

    const playBtn = q('play');
    playBtn.addEventListener('click', () => {
      playing = !playing;
      playBtn.textContent = playing ? 'Pause' : 'Play';
    });
    const fixBtn = q('fix');
    fixBtn.addEventListener('click', () => {
      fixes = !fixes;
      fixBtn.setAttribute('aria-pressed', String(fixes));
      reset();
      draw();
    });
    onWidth(root, () => { v.fit(); draw(); });

    reset();
    if (reduced()) {
      while (dd < L) step(0.2);
      playBtn.textContent = 'Play';
    }
    draw();
    requestAnimationFrame(tick);
  }

  /* ----------------------------------------------------------------- boot */

  const STARTS = { walk: startWalk, router: startRouter, scan: startScan, drift: startDrift };
  const roots = [...document.querySelectorAll('[data-fig]')];
  if (roots.length)
    loadData()
      .then((d) => roots.forEach((r) => STARTS[r.dataset.fig](r, d)))
      .catch(() => roots.forEach((r) => r.classList.add('fig-failed')));
})();
