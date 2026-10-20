// Hue backdrop and carousel. Behavior is specified in DESIGN-SPEC.md, sections 5 and 6.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
let setPalette = () => {};

const VERT = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color_primary;
uniform vec3 u_color_secondary;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotation * p * 2.03 + 0.17;
    amplitude *= 0.5;
  }
  return value;
}

float softEllipse(vec2 p, vec2 center, vec2 radius, float softness) {
  vec2 q = (p - center) / radius;
  return exp(-softness * dot(q, q));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float time = u_time * 0.72;
  float broadNoise = fbm(uv * vec2(2.1, 1.2) + vec2(time * 0.11, -time * 0.07));
  vec2 warp = vec2(
    fbm(uv * vec2(3.0, 1.8) + vec2(1.8, time * 0.16)),
    fbm(uv * vec2(2.4, 2.2) + vec2(-1.1, -time * 0.12))
  ) - 0.5;
  vec2 p = uv + warp * 0.075;

  vec2 centerDrift = vec2(0.12 * sin(time * 0.92), 0.13 * cos(time * 0.68));
  float centralFold = softEllipse(p, vec2(0.48, 0.63) + centerDrift, vec2(0.34, 0.86), 2.25);
  float upperFold = softEllipse(p, vec2(0.31, 1.02) + vec2(-centerDrift.x, centerDrift.y), vec2(0.25, 0.52), 2.8);
  float rightFold = softEllipse(p, vec2(0.76, 0.35) + vec2(0.7 * centerDrift.y, -0.85 * centerDrift.x), vec2(0.24, 0.68), 2.5);
  float lowerFold = softEllipse(p, vec2(0.42, -0.18), vec2(0.38, 0.5), 2.6);
  float passingFold = softEllipse(p, vec2(0.16 + 0.22 * sin(time * 0.54), 0.42 + 0.11 * cos(time * 0.73)), vec2(0.2, 0.72), 2.7);
  float whiteField = centralFold + upperFold * 0.72 + rightFold * 0.42;
  float paleField = centralFold * 0.68 + rightFold * 0.78 + lowerFold * 0.34 + passingFold * 0.42;
  float silk = fbm(p * vec2(5.2, 2.8) + warp * 1.4 + time * 0.07);
  whiteField += (broadNoise - 0.5) * 0.22;

  vec3 white = vec3(0.985, 0.985, 1.0);
  vec3 palePrimary = mix(u_color_primary, white, 0.18);
  vec3 paleSecondary = mix(u_color_secondary, white, 0.24);

  vec3 color = mix(u_color_primary, u_color_secondary, smoothstep(0.30, 0.92, p.x + broadNoise * 0.08));
  color = mix(color, palePrimary, smoothstep(0.20, 0.78, paleField) * 0.72);
  color = mix(color, paleSecondary, smoothstep(0.54, 1.12, rightFold + centralFold * 0.25) * 0.36);
  color = mix(color, white, smoothstep(0.58, 1.34, whiteField) * (0.40 + silk * 0.08));
  color *= 0.94 + 0.06 * smoothstep(0.0, 1.0, broadNoise);
  color += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

const backdrop = document.querySelector('.backdrop');
if (backdrop) {
  // Two frames so the starting state paints before the entrance transition.
  requestAnimationFrame(() => requestAnimationFrame(() => backdrop.classList.add('on')));

  const canvas = backdrop.querySelector('canvas');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = gl && compile(gl.VERTEX_SHADER, VERT);
  const fs = gl && compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = vs && fs && gl.createProgram();
  if (prog) {
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
  }
  // No WebGL: the canvas keeps its CSS gradient fallback.
  if (prog && gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(prog);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uA = gl.getUniformLocation(prog, 'u_color_primary');
    const uB = gl.getUniformLocation(prog, 'u_color_secondary');

    const current = [...hex('#2f7199'), ...hex('#3f7055')];
    let target = [...current];
    let elapsed = 0, startedAt = 0, last = 0, running = false, raf = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    const draw = (t) => {
      gl.uniform1f(uTime, t);
      gl.uniform3f(uA, current[0], current[1], current[2]);
      gl.uniform3f(uB, current[3], current[4], current[5]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const frame = (now) => {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const k = 1 - Math.exp(-2.8 * dt);
      for (let i = 0; i < 6; i++) current[i] += (target[i] - current[i]) * k;
      draw(elapsed + (now - startedAt) / 1000);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      resize();
      if (reduce.matches) { draw(0); return; }
      startedAt = performance.now();
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      elapsed += (performance.now() - startedAt) / 1000;
      running = false;
      last = 0;
      cancelAnimationFrame(raf);
    };
    const sync = () => (document.visibilityState === 'visible' ? start() : stop());

    setPalette = (pair) => {
      target = [...hex(pair[0]), ...hex(pair[1])];
      if (reduce.matches) { current.splice(0, 6, ...target); resize(); draw(0); }
    };
    new ResizeObserver(() => { resize(); if (!running) draw(elapsed); }).observe(canvas);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener('change', () => { stop(); sync(); });
    sync();
  }
}

document.querySelectorAll('[data-carousel]').forEach((frame) => {
  const slides = [...frame.querySelectorAll('.slide')];
  const dots = frame.querySelector('.dots');
  const autoplay = frame.hasAttribute('data-autoplay');
  let cur = 0, busy = false, hover = false, inView = true, timer = 0;

  const label = frame.dataset.item || 'photo';
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Show ${label} ${i + 1}`);
    b.addEventListener('click', () => show(i));
    dots.append(b);
  });
  const mark = () => [...dots.children].forEach((b, i) => b.toggleAttribute('aria-current', i === cur));
  const palette = (el) => el.dataset.palette && setPalette(el.dataset.palette.split(','));

  const schedule = () => {
    clearTimeout(timer);
    if (autoplay && !hover && inView && !document.hidden && !reduce.matches) {
      timer = setTimeout(() => show((cur + 1) % slides.length), 6000);
    }
  };

  function show(i) {
    if (busy || i === cur) return;
    const prev = slides[cur], next = slides[i];
    cur = i;
    mark();
    palette(next);
    // Video slides play only while shown; under reduced motion they keep their poster.
    if (prev.tagName === 'VIDEO') prev.pause();
    if (next.tagName === 'VIDEO' && !reduce.matches) {
      next.currentTime = 0;
      next.play().catch(() => {});
    }
    if (reduce.matches) {
      prev.classList.remove('on');
      next.classList.add('on');
      schedule();
      return;
    }
    busy = true;
    next.classList.add('incoming');
    void next.offsetWidth; // commit opacity 0 so the fade runs
    next.classList.add('on');
    setTimeout(() => {
      prev.classList.remove('on');
      next.classList.remove('incoming');
      busy = false;
      schedule();
    }, 460);
  }

  slides[0].classList.add('on');
  mark();
  palette(slides[0]);

  frame.querySelector('[data-prev]').addEventListener('click', () => show((cur - 1 + slides.length) % slides.length));
  frame.querySelector('[data-next]').addEventListener('click', () => show((cur + 1) % slides.length));
  frame.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show((cur - 1 + slides.length) % slides.length);
    if (e.key === 'ArrowRight') show((cur + 1) % slides.length);
  });
  let x0 = null;
  frame.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  frame.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) >= 44) show(dx > 0 ? (cur - 1 + slides.length) % slides.length : (cur + 1) % slides.length);
  });
  const pause = (v) => () => { hover = v; schedule(); };
  frame.addEventListener('mouseenter', pause(true));
  frame.addEventListener('mouseleave', pause(false));
  frame.addEventListener('focusin', pause(true));
  frame.addEventListener('focusout', pause(false));
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; schedule(); }, { threshold: 0.5 }).observe(frame);
  document.addEventListener('visibilitychange', schedule);
  schedule();
});
