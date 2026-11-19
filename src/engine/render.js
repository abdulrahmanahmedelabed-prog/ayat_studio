// محرّك المشاهد: يرسم «وصف المشهد» (JSON) على لوحة Canvas ويحرّكه عبر الزمن.
// المفردات البصرية كلها عناصر كونية (سماء، ماء، أرض، نبات...) ولا يوجد فيها
// أي عنصر لذوات الأرواح بملامح، ولا للغيبيات. هذه هي الضمانة البنيوية الأولى.

import { person, animal, birds } from './figures.js';

const PI = Math.PI;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const span = (t, a, b) => (a == null || b == null ? 0 : clamp((t - a) / Math.max(0.001, b - a)));
function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, t) {
  const A = rgb(a), B = rgb(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, '0')).join('');
}
const rgba = (h, a) => { const [r, g, b] = rgb(h); return `rgba(${r},${g},${b},${clamp(a)})`; };

export const SKY = {
  night: { top: '#040a1c', bot: '#12244a', light: 0.22 },
  dawn: { top: '#2a3d72', bot: '#f0a56c', light: 0.68 },
  day: { top: '#3f97d6', bot: '#c4e8f6', light: 1 },
  dusk: { top: '#35285c', bot: '#e8815a', light: 0.6 },
  storm: { top: '#1b2129', bot: '#4b5661', light: 0.48 },
  deep: { top: '#01050b', bot: '#04121f', light: 0.12 },
};

function skyAt(scene, t) {
  const ks = scene.sky && scene.sky.length ? scene.sky : [{ t: 0, mode: 'day' }];
  let a = ks[0], b = ks[0];
  for (const k of ks) { if (k.t <= t) { a = k; b = k; } else { b = k; break; } }
  const A = SKY[a.mode] || SKY.day, B = SKY[b.mode] || SKY.day;
  const u = a === b ? 0 : ease(span(t, a.t, b.t));
  return { top: mix(A.top, B.top, u), bot: mix(A.bot, B.bot, u), light: lerp(A.light, B.light, u) };
}

const lit = (c, e, k = 0.72) => mix(c, '#0a1024', (1 - e.light) * k);
const circle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, 2 * PI); c.fill(); };

function arcPos(el, k, e, dx0 = 0.14, dx1 = 0.86) {
  const m = el.motion || 'still';
  if (m === 'still') return [(el.x ?? 0.5) * e.W, (el.y ?? 0.22) * e.H];
  const u = m === 'rise' ? k * 0.5 : m === 'set' ? 0.5 + k * 0.5 : k;
  const x = lerp(el.x0 ?? dx0, el.x1 ?? dx1, u) * e.W;
  return [x, e.hz + e.U * 0.03 - Math.sin(PI * u) * (e.hz - e.H * 0.14)];
}

function moonDisc(c, x, y, r, p, e, a) {
  c.globalAlpha = a * 0.35; c.fillStyle = mix('#2a3a5e', '#9fb6d6', e.light); circle(c, x, y, r);
  const wax = p <= 0.5, f = clamp(wax ? p * 2 : (1 - p) * 2), d = wax ? 1 : -1;
  c.globalAlpha = a; c.fillStyle = '#f4efd8'; c.beginPath();
  for (let i = 0; i <= 24; i++) { const th = -PI / 2 + (PI * i) / 24; c.lineTo(x + d * r * Math.cos(th), y + r * Math.sin(th)); }
  for (let i = 24; i >= 0; i--) { const th = -PI / 2 + (PI * i) / 24; c.lineTo(x + d * r * Math.cos(th) * (1 - 2 * f), y + r * Math.sin(th)); }
  c.closePath(); c.fill();
}

function trunk(c, x, y, h, w, col, lean = 0) {
  c.fillStyle = col; c.beginPath();
  c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 0.5 + lean * 0.5, y - h * 0.5, x - w * 0.35 + lean, y - h);
  c.lineTo(x + w * 0.35 + lean, y - h); c.quadraticCurveTo(x + w * 0.5 + lean * 0.5, y - h * 0.5, x + w, y);
  c.closePath(); c.fill();
}

const DRAW = {
  stars(c, e, el, k, a) {
    const r = rng(el.seed || 7), v = a * Math.pow(1 - e.light, 1.4) * 1.5;
    if (v < 0.02) return;
    c.fillStyle = '#fff';
    for (let i = 0; i < 150; i++) {
      const x = r() * e.W, y = r() * e.hz * 0.95, s = 0.5 + r() * 1.4, ph = r() * 9;
      c.globalAlpha = clamp(v * (0.55 + 0.45 * Math.sin(e.t * 1.7 + ph)));
      circle(c, x, y, s * e.U * 0.0022);
    }
  },
  sun(c, e, el, k, a) {
    const [x, y] = arcPos(el, k, e), r = e.U * 0.065 * (el.size || 1);
    const g = c.createRadialGradient(x, y, r * 0.4, x, y, r * 4.2);
    g.addColorStop(0, rgba('#ffe9a8', 0.75 * a)); g.addColorStop(1, rgba('#ffd27a', 0));
    c.fillStyle = g; circle(c, x, y, r * 4.2);
    c.fillStyle = rgba('#fff1b8', 0.04 * a * e.light);
    for (let i = 0; i < 12; i++) { const an = (i / 12) * 2 * PI + e.t * 0.05; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(an - 0.07) * r * 7, y + Math.sin(an - 0.07) * r * 7); c.lineTo(x + Math.cos(an + 0.07) * r * 7, y + Math.sin(an + 0.07) * r * 7); c.closePath(); c.fill(); }
    c.globalAlpha = a; c.fillStyle = '#ffd95e'; circle(c, x, y, r);
    c.fillStyle = '#fff3c4'; circle(c, x, y, r * 0.72);
    e.sun = [x, y];
  },
  moon(c, e, el, k, a) {
    const r = e.U * 0.055 * (el.size || 1);
    if (el.row) {
      const ph = [0.05, 0.17, 0.32, 0.5, 0.68, 0.83, 0.95];
      ph.forEach((p, i) => {
        const u = (i + 0.5) / ph.length, x = lerp(0.9, 0.1, u) * e.W, y = e.hz * 0.78 - Math.sin(PI * u) * e.hz * 0.5;
        moonDisc(c, x, y, r * 0.78, p, e, a * ease(clamp(k * ph.length - i)));
      });
      return;
    }
    const [x, y] = arcPos(el, k, e, 0.86, 0.14);
    const p = el.phase === 'cycle' ? lerp(0.05, 0.95, k) : el.phase === 'wane' ? lerp(0.5, 0.95, k) : el.phase === 'wax' ? lerp(0.05, 0.5, k) : (el.phase ?? 0.5);
    const g = c.createRadialGradient(x, y, r, x, y, r * 3);
    g.addColorStop(0, rgba('#dfe9ff', 0.28 * a)); g.addColorStop(1, rgba('#dfe9ff', 0));
    c.fillStyle = g; circle(c, x, y, r * 3);
    moonDisc(c, x, y, r, p, e, a);
  },
  clouds(c, e, el, k, a) {
    const n = el.count || 5, r = rng(el.seed || 21), dark = lerp(el.dark || 0, el.darkTo ?? el.dark ?? 0, k);
    const col = lit(mix('#ffffff', '#39414c', dark), e, 0.55);
    for (let i = 0; i < n; i++) {
      const tx = (i + 0.5 + (r() - 0.5) * 0.6) / n, side = i % 2 ? 1.25 : -0.25;
      const gx = el.gather ? lerp(side, tx, ease(k)) : tx;
      const x = (((gx + e.t * 0.006 * (el.drift ?? 1)) % 1.3) + 1.3) % 1.3 * e.W - e.W * 0.12;
      const y = ((el.y ?? 0.2) + (r() - 0.5) * 0.1) * e.H, s = e.U * (0.07 + r() * 0.05) * (el.size || 1);
      c.globalAlpha = a * 0.93; c.fillStyle = col;
      for (let j = 0; j < 6; j++) circle(c, x + (j - 2.5) * s * 0.55, y + Math.sin(j * 2.1 + i) * s * 0.22, s * (0.5 + 0.22 * Math.cos(j * 1.7 + i)));
      c.fillRect(x - s * 1.5, y, s * 3, s * 0.42);
      c.globalAlpha = a * 0.5; c.fillStyle = mix(col, '#ffffff', 0.4);
      for (let j = 1; j < 5; j++) circle(c, x + (j - 2.5) * s * 0.55 - s * 0.1, y + Math.sin(j * 2.1 + i) * s * 0.22 - s * 0.16, s * (0.3 + 0.14 * Math.cos(j * 1.7 + i)));
    }
    e.cloudY = (el.y ?? 0.2) * e.H;
  },
  rain(c, e, el, k, a) {
    const n = Math.round(220 * (el.intensity ?? 1)), r = rng(el.seed || 3), y0 = e.cloudY ?? e.H * 0.2;
    c.strokeStyle = rgba('#cfe6ff', 0.6 * a); c.lineWidth = Math.max(1, e.U * 0.0026); c.beginPath();
    for (let i = 0; i < n; i++) {
      const x = r() * e.W * 1.1, sp = 0.9 + r() * 0.6, x0 = (el.x0 ?? 0) * e.W, x1 = (el.x1 ?? 1) * e.W;
      const yb = e.gy(x) + r() * (e.H - e.hz) * 0.5, u = (r() + e.t * sp * 0.9) % 1, y = lerp(y0, yb, u), L = e.U * 0.03;
      if (x < x0 || x > x1) continue;
      c.moveTo(x - u * e.U * 0.04, y); c.lineTo(x - u * e.U * 0.04 - L * 0.18, y + L);
    }
    c.stroke();
  },
  lightning(c, e, el, k, a) {
    const cyc = (e.t * 0.37 + (el.seed || 0.3)) % 1;
    if (cyc > 0.07) return;
    const r = rng(Math.floor(e.t * 0.37 + 5) * 97), y0 = e.cloudY ?? e.H * 0.2;
    let x = (0.25 + r() * 0.5) * e.W, y = y0;
    c.strokeStyle = rgba('#fff7d6', a); c.lineWidth = e.U * 0.006; c.beginPath(); c.moveTo(x, y);
    while (y < e.hz) { x += (r() - 0.5) * e.U * 0.12; y += e.U * 0.06; c.lineTo(x, y); }
    c.stroke(); c.fillStyle = rgba('#ffffff', 0.13 * a); c.fillRect(0, 0, e.W, e.H);
  },
  wind(c, e, el, k, a) {
    const r = rng(el.seed || 11), s = el.intensity ?? 1;
    c.strokeStyle = rgba('#ffffff', 0.34 * a); c.lineWidth = e.U * 0.003; c.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const y = (0.12 + r() * 0.78) * e.H, sp = 0.25 + r() * 0.35, L = e.U * (0.1 + r() * 0.16);
      const x = (((r() + e.t * sp * s) % 1.3) - 0.15) * e.W;
      c.beginPath(); c.moveTo(x, y);
      c.bezierCurveTo(x + L * 0.3, y - e.U * 0.014, x + L * 0.7, y + e.U * 0.014, x + L, y - e.U * 0.004); c.stroke();
    }
  },
  mountains(c, e, el, k, a) {
    const n = el.count || 4, r = rng(el.seed || 5), base = lit(el.color || '#6f6a78', e);
    for (let i = 0; i < n; i++) {
      const cx = ((i + 0.5 + (r() - 0.5) * 0.5) / n) * e.W, w = e.W * (0.2 + r() * 0.14) * (el.size || 1) * (4 / Math.max(3, n));
      const h = e.U * (0.24 + r() * 0.2) * (el.size || 1), by = e.hz + 2;
      if (el.roots) {
        const d = h * 0.75 * ease(k);
        c.globalAlpha = a * 0.85; c.fillStyle = lit('#4b4756', e, 0.4);
        c.beginPath(); c.moveTo(cx - w * 0.36, by); c.lineTo(cx, by + d); c.lineTo(cx + w * 0.36, by); c.closePath(); c.fill();
        c.setLineDash([e.U * 0.012, e.U * 0.01]); c.strokeStyle = rgba('#f3e6c0', 0.7 * a * k); c.lineWidth = e.U * 0.003; c.stroke(); c.setLineDash([]);
      }
      c.globalAlpha = a; c.fillStyle = mix(base, '#000000', (i % 2) * 0.12);
      c.beginPath(); c.moveTo(cx - w / 2, by);
      c.quadraticCurveTo(cx - w * 0.18, by - h * 0.62, cx, by - h); c.quadraticCurveTo(cx + w * 0.2, by - h * 0.55, cx + w / 2, by); c.closePath(); c.fill();
      c.save(); c.clip();
      c.fillStyle = rgba('#000000', 0.2 * a); c.beginPath(); c.moveTo(cx, by - h); c.quadraticCurveTo(cx + w * 0.2, by - h * 0.55, cx + w / 2, by); c.lineTo(cx + w * 0.1, by); c.quadraticCurveTo(cx - w * 0.04, by - h * 0.45, cx, by - h); c.fill();
      if (el.streaks) {
        const sa = a * ease(span(e.t, el.streakFrom ?? -1, (el.streakFrom ?? -1) + 2.5)); c.lineCap = 'round';
        for (let j = 0; j < 5; j++) {
          c.strokeStyle = rgba(lit((i + j) % 2 ? '#ece6da' : '#a8503a', e, 0.5), 0.72 * sa); c.lineWidth = h * (0.022 + 0.014 * (j % 3));
          const u = (j + 0.5) / 5 - 0.5; c.beginPath(); c.moveTo(cx + u * w * 0.25, by - h * (0.92 - Math.abs(u) * 0.5)); c.quadraticCurveTo(cx + u * w * 0.75, by - h * 0.45, cx + u * w * 1.05 + w * 0.04, by); c.stroke();
        }
      }
      c.restore();
      if (el.snow) { c.fillStyle = lit('#f4f7fb', e, 0.5); c.beginPath(); c.moveTo(cx - w * 0.085, by - h * 0.8); c.lineTo(cx, by - h); c.lineTo(cx + w * 0.09, by - h * 0.78); c.lineTo(cx + w * 0.03, by - h * 0.83); c.lineTo(cx - w * 0.02, by - h * 0.77); c.closePath(); c.fill(); }
    }
  },
  ground(c, e, el, k, a) {
    const g = (el.greenFrom != null ? ease(span(e.t, el.greenFrom, el.greenTo ?? el.greenFrom + 4)) : (el.green ?? 0)) * (1 - 0.8 * span(e.t, el.dryFrom, el.dryTo));
    const sw = (el.swell ?? 0) * g, hill = el.hill ?? 0, hx = el.hillX ?? 0.5;
    e.gy = (x) => { const u = x / e.W; return e.hz - e.U * (0.012 * Math.sin(u * 9) * (1 + 3 * sw) + sw * 0.03 + hill * 0.2 * Math.exp(-Math.pow((u - hx) / 0.2, 2))); };
    e.green = g;
    if (el.x0 != null || el.x1 != null) { c.beginPath(); c.rect((el.x0 ?? 0) * e.W, 0, ((el.x1 ?? 1) - (el.x0 ?? 0)) * e.W, e.H); c.clip(); }
    const top = lit(mix(el.color || '#b48d5c', '#5f9e4c', g), e), bot = lit(mix('#7c5f3d', '#356b33', g), e);
    const gr = c.createLinearGradient(0, e.hz - e.U * 0.2 * hill, 0, e.H); gr.addColorStop(0, top); gr.addColorStop(1, bot);
    c.globalAlpha = a; c.fillStyle = gr; c.beginPath(); c.moveTo(0, e.H);
    for (let x = 0; x <= e.W + 8; x += 8) c.lineTo(x, e.gy(x));
    c.lineTo(e.W, e.H); c.closePath(); c.fill();
    if (g < 0.6 && el.cracks !== false) {
      const r = rng(el.seed || 13); c.strokeStyle = rgba('#5b4127', 0.5 * a * (1 - g / 0.6)); c.lineWidth = e.U * 0.0028;
      for (let i = 0; i < 16; i++) {
        let x = r() * e.W, y = e.hz + (0.12 + r() * 0.8) * (e.H - e.hz); c.beginPath(); c.moveTo(x, y);
        for (let j = 0; j < 3; j++) { x += (r() - 0.5) * e.U * 0.09; y += (r() - 0.3) * e.U * 0.035; c.lineTo(x, y); } c.stroke();
      }
    }
  },
  plants(c, e, el, k, a) {
    const n = el.count || 26, r = rng(el.seed || 17), g = ease(span(e.t, el.growFrom ?? el.from ?? 0, el.growTo ?? (el.growFrom ?? 0) + 5));
    const w = el.witherFrom != null ? span(e.t, el.witherFrom, el.witherTo ?? el.witherFrom + 5) : 0;
    const col = lit(el.poor ? '#8c8a55' : w < 0.5 ? mix('#4f9a3d', '#d6b63a', w * 2) : mix('#d6b63a', '#8a6a3c', (w - 0.5) * 2), e);
    const fl = ['#e85d75', '#f3c13a', '#f4f1ea', '#b86bd6', '#f08a3c'];
    c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x0 = lerp(el.x0 ?? 0.03, el.x1 ?? 0.97, r()) * e.W, depth = r(), gy = e.gy(x0), y0 = gy + depth * (e.H - gy) * (el.depth ?? 0.7);
      const sc = (0.6 + depth * 0.7) * (el.size || 1), ph0 = r(), ph = r() * 6, fi = Math.floor(r() * 5);
      const blow = el.scatter ? clamp((w - 0.72) / 0.28) : 0, fall = clamp((w - 0.45) / 0.4);
      const h = e.U * 0.085 * sc * g * (0.7 + ph0 * 0.6) * (1 - fall * 0.5);
      if (h < 0.5) continue;
      const sway = Math.sin(e.t * 1.6 + ph) * 0.09 * (1 - fall), ang = sway + fall * (1.25 + 0.2 * Math.sin(ph)) * (i % 2 ? 1 : -1);
      const bx = x0 + blow * e.W * (0.25 + r() * 0.5), by = y0 - blow * e.U * 0.12 * Math.sin(ph + e.t * 3);
      c.globalAlpha = a * (1 - blow * 0.9); c.strokeStyle = col; c.lineWidth = e.U * 0.0042 * sc;
      const tx = bx + Math.sin(ang) * h, ty = by - Math.cos(ang) * h;
      const blades = el.kind === 'grass' || !el.kind ? 3 : 1;
      for (let b = 0; b < blades; b++) {
        const o = (b - (blades - 1) / 2) * 0.32; c.beginPath(); c.moveTo(bx, by);
        c.quadraticCurveTo(bx + Math.sin(ang + o * 0.5) * h * 0.5, by - Math.cos(ang) * h * 0.55, bx + Math.sin(ang + o) * h, by - Math.cos(ang + o) * h); c.stroke();
      }
      if (el.kind === 'crop' && g > 0.6) { c.fillStyle = lit(mix('#9bbf4a', '#d9b441', Math.max(w, span(g, 0.6, 1) * 0.6)), e); c.beginPath(); c.ellipse(tx, ty, e.U * 0.006 * sc, e.U * 0.017 * sc, ang, 0, 2 * PI); c.fill(); }
      if (el.kind === 'flowers' && g > 0.7 && w < 0.5) { c.fillStyle = lit(fl[fi], e, 0.5); circle(c, tx, ty, e.U * 0.0095 * sc * span(g, 0.7, 1)); c.fillStyle = lit('#f7d24a', e, 0.5); circle(c, tx, ty, e.U * 0.0035 * sc); }
    }
  },
  tree(c, e, el, k, a) {
    if (el.kind === 'palm' && el.twin) { DRAW.tree(c, e, { ...el, twin: false, lean: -1.1 }, k, a); DRAW.tree(c, e, { ...el, twin: false, lean: 1.1, roots: false }, k, a); return; }
    const x = (el.x ?? 0.5) * e.W, y = e.gy(x) + e.U * 0.012 + (el.dy || 0) * e.H, g = ease(span(e.t, el.growFrom ?? el.from ?? 0, el.growTo ?? (el.growFrom ?? el.from ?? 0) + 5));
    const S = e.U * (el.size || 1), h = S * 0.3 * g, kind = el.kind || 'broad', bark = lit('#6b4a2e', e);
    const fr = el.fruit ? ease(span(e.t, el.fruitFrom ?? (el.growTo ?? 5), (el.fruitFrom ?? (el.growTo ?? 5)) + 3)) : 0;
    c.globalAlpha = a;
    if (el.roots) {
      const rk = ease(span(e.t, el.rootsFrom ?? el.growFrom ?? 0, (el.rootsFrom ?? el.growFrom ?? 0) + 4));
      c.strokeStyle = rgba('#e8d3a6', 0.85 * a); c.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const an = PI / 2 + (i - 3) * 0.3, L = S * (0.13 + 0.03 * (i % 3)) * rk; c.lineWidth = S * 0.008 * (1 - Math.abs(i - 3) * 0.12);
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(an) * L * 0.5, y + L * 0.35, x + Math.cos(an) * L * 1.5, y + Math.sin(an) * L); c.stroke();
      }
    }
    if (h < 1) return;
    if (kind === 'palm') {
      const lean = S * 0.03 * (el.lean != null ? el.lean * 1.7 : 1), tx = x + lean, ty = y - h * 1.15;
      trunk(c, x, y, h * 1.15, S * 0.016, bark, lean);
      c.strokeStyle = lit('#3f8a3a', e); c.lineWidth = S * 0.011; c.lineCap = 'round';
      for (let i = 0; i < 9; i++) {
        const an = -PI / 2 + (i - 4) * 0.42 + Math.sin(e.t * 1.2 + i) * 0.03, L = S * 0.14 * g;
        c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(an) * L * 0.7, ty + Math.sin(an) * L * 0.9, tx + Math.cos(an) * L * 1.2, ty + Math.sin(an) * L * 0.5 + L * 0.5); c.stroke();
      }
      if (fr > 0) { c.fillStyle = lit('#b5651d', e, 0.5); for (let i = 0; i < 10; i++) circle(c, tx + ((i % 5) - 2) * S * 0.008, ty + S * 0.018 + Math.floor(i / 5) * S * 0.014, S * 0.007 * fr); }
      return;
    }
    if (kind === 'vine') {
      c.strokeStyle = bark; c.lineWidth = S * 0.008;
      c.beginPath(); c.moveTo(x - S * 0.08, y); c.lineTo(x - S * 0.08, y - h * 0.5); c.lineTo(x + S * 0.08, y - h * 0.5); c.lineTo(x + S * 0.08, y); c.stroke();
      c.fillStyle = lit('#4d9440', e); for (let i = 0; i < 7; i++) circle(c, x + (i - 3) * S * 0.026, y - h * 0.52 + Math.sin(i * 2) * S * 0.01, S * 0.028 * g);
      if (fr > 0) { c.fillStyle = lit('#6d3a8c', e, 0.5); for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) circle(c, x + (j - 1) * S * 0.055 + ((i % 3) - 1) * S * 0.008, y - h * 0.4 + Math.floor(i / 3) * S * 0.012 + (i > 3 ? S * 0.008 : 0), S * 0.007 * fr); }
      return;
    }
    const tall = el.tall ? 1.7 : 1, th = h * 0.62 * tall, cy = y - th - h * 0.25, cr = S * (kind === 'olive' ? 0.085 : 0.1) * g;
    trunk(c, x, y, th + h * 0.1, S * (kind === 'olive' ? 0.02 : 0.018), bark, kind === 'olive' ? S * 0.012 : 0);
    const leaf = lit(kind === 'olive' ? '#7d9a6a' : '#3f8f45', e), leaf2 = lit(kind === 'olive' ? '#93ad7f' : '#57a850', e);
    const sway = Math.sin(e.t * 1.1 + x) * S * 0.004;
    [[0, 0, 1], [-0.85, 0.25, 0.78], [0.85, 0.25, 0.78], [-0.45, -0.6, 0.8], [0.5, -0.55, 0.82], [0, -1.05 * tall, 0.7]].forEach(([dx, dy, s], i) => {
      c.fillStyle = i % 2 ? leaf2 : leaf; circle(c, x + dx * cr + sway, cy + dy * cr, cr * s);
    });
    if (fr > 0) {
      const r = rng(el.seed || 31); c.fillStyle = lit(el.fruitColor || (kind === 'olive' ? '#3b4a2a' : '#e2552f'), e, 0.5);
      for (let i = 0; i < 16; i++) { const an = r() * 2 * PI, d = Math.sqrt(r()) * cr * 1.25; circle(c, x + Math.cos(an) * d + sway, cy + Math.sin(an) * d * 0.9 - cr * 0.15, S * 0.0085 * fr); }
    }
  },
  grain(c, e, el, k, a) {
    const x = (el.x ?? 0.5) * e.W, y = e.gy(x), S = e.U * (el.size || 1);
    const s1 = ease(span(k, 0.05, 0.3)), s2 = ease(span(k, 0.3, 0.62)), s3 = ease(span(k, 0.62, 0.95));
    c.globalAlpha = a; c.fillStyle = lit('#5a3d22', e, 0.4); c.beginPath(); c.ellipse(x, y + S * 0.07, S * 0.16, S * 0.075, 0, 0, 2 * PI); c.fill();
    c.fillStyle = lit('#e3c064', e, 0.4); c.beginPath(); c.ellipse(x, y + S * 0.07, S * 0.02, S * 0.012, 0.4, 0, 2 * PI); c.fill();
    c.strokeStyle = rgba('#e8d3a6', 0.8 * a); c.lineWidth = S * 0.004;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x, y + S * 0.075); c.lineTo(x + (i - 1.5) * S * 0.03 * s1, y + S * (0.075 + 0.05 * s1)); c.stroke(); }
    const h = S * 0.36 * s1;
    c.strokeStyle = lit(mix('#5fa644', '#c9a93c', s3 * 0.7), e); c.lineWidth = S * 0.011; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y + S * 0.06); c.lineTo(x, y - h); c.stroke();
    for (let i = 0; i < 7; i++) {
      const an = -PI / 2 + (i - 3) * 0.3 * s2, L = S * 0.2 * s2, bx = x, by = y - h, ex = bx + Math.cos(an) * L, ey = by + Math.sin(an) * L;
      if (s2 <= 0) break;
      c.lineWidth = S * 0.006; c.beginPath(); c.moveTo(bx, by); c.lineTo(ex, ey); c.stroke();
      c.save(); c.translate(ex, ey); c.rotate(an + PI / 2);
      c.fillStyle = lit(mix('#8fbf4c', '#e0b93e', s3), e, 0.5);
      for (let j = 0; j < 9; j++) { const gs = S * 0.011 * s2 * (0.6 + 0.4 * s3) * (1 - j * 0.05); for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * gs * 0.75, -j * S * 0.013 * s2, gs * 0.7, gs * 1.15, sd * 0.4, 0, 2 * PI); c.fill(); } }
      c.restore();
    }
  },
  sea(c, e, el, k, a) {
    const y0 = (el.y != null ? el.y * e.H : e.hz), amp = e.U * 0.012 * lerp(el.storm ?? 1, el.stormTo ?? el.storm ?? 1, k), n = el.layers || 5;
    const A = el.color || '#1c6fa3', B = el.color2 || '#0a2f55';
    for (let i = 0; i < n; i++) {
      const yy = y0 + ((e.H - y0) * i) / n, u = i / (n - 1 || 1);
      c.globalAlpha = a; c.fillStyle = lit(mix(A, B, u), e, 0.8); c.beginPath(); c.moveTo(0, e.H);
      for (let x = 0; x <= e.W + 10; x += 10) c.lineTo(x, yy + Math.sin(x / e.U * (7 - i) + e.t * (1.3 + i * 0.25) + i * 2) * amp * (1 + i * 0.5));
      c.lineTo(e.W, e.H); c.closePath(); c.fill();
    }
    e.seaY = y0; e.seaAmp = amp;
  },
  twoSeas(c, e, el, k, a) {
    const y0 = el.y != null ? el.y * e.H : e.hz, m = ease(k), mid = e.W * 0.5, amp = e.U * 0.01;
    const side = (x0, x1, colA, colB, ph) => {
      for (let i = 0; i < 4; i++) {
        const yy = y0 + ((e.H - y0) * i) / 4; c.fillStyle = lit(mix(colA, colB, i / 3), e, 0.8); c.beginPath(); c.moveTo(x0, e.H);
        const step = (x1 - x0) / 60; for (let j = 0; j <= 60; j++) { const x = x0 + step * j; c.lineTo(x, yy + Math.sin(x / e.U * 7 + e.t * 1.5 + ph + i) * amp * (1 + i * 0.4)); }
        c.lineTo(x1, e.H); c.closePath(); c.fill();
      }
    };
    c.globalAlpha = a; c.fillStyle = lit('#c9b68f', e); c.fillRect(0, y0, e.W, e.H - y0);
    side(0, mid * m, '#1b5fa8', '#0b2c5c', 0); side(e.W - mid * m, e.W, '#2fb3a5', '#12665f', 2);
    if (m > 0.9) {
      const b = span(m, 0.9, 1) * span(e.t, el.barrierFrom ?? el.from ?? 0, (el.barrierFrom ?? el.from ?? 0) + 2);
      c.strokeStyle = rgba('#fff4c2', 0.85 * a * b); c.lineWidth = e.U * 0.007; c.beginPath();
      for (let y = y0; y <= e.H; y += 6) c.lineTo(mid + Math.sin(y / e.U * 14 + e.t * 2) * e.U * 0.012, y);
      c.stroke(); c.strokeStyle = rgba('#fff4c2', 0.25 * a * b); c.lineWidth = e.U * 0.03; c.stroke();
    }
  },
  ship(c, e, el, k, a) {
    const x = lerp(el.x0 ?? 0.15, el.x1 ?? 0.8, k) * e.W, sy = (e.seaY ?? e.hz) + (el.dy ?? 0.1) * e.H, S = e.U * 0.11 * (el.size || 1);
    const bob = Math.sin(e.t * 1.6 + x * 0.01) * (e.seaAmp || 4), rot = Math.sin(e.t * 1.3) * 0.05 * (e.seaAmp ? e.seaAmp / (e.U * 0.012) : 1);
    c.save(); c.translate(x, sy + bob); c.rotate(rot); c.globalAlpha = a;
    c.fillStyle = lit('#6a4426', e); c.beginPath(); c.moveTo(-S, -S * 0.12); c.quadraticCurveTo(-S * 0.7, S * 0.3, 0, S * 0.3); c.quadraticCurveTo(S * 0.75, S * 0.3, S * 1.1, -S * 0.2); c.closePath(); c.fill();
    c.fillRect(-S * 0.03, -S * 1.3, S * 0.06, S * 1.2);
    c.fillStyle = lit('#f3ead7', e, 0.5); c.beginPath(); c.moveTo(S * 0.06, -S * 1.25); c.quadraticCurveTo(S * lerp(0.95, 0.16, ease(span(e.t, el.slackFrom, (el.slackFrom ?? 0) + 3))), -S * 0.75, S * 0.06, -S * 0.25); c.closePath(); c.fill();
    c.restore();
  },
  river(c, e, el, k, a) {
    const yc = e.hz + (e.H - e.hz) * (el.y ?? 0.5), wd = e.U * 0.11 * (el.size || 1) * (0.25 + 0.75 * ease(k));
    const yAt = (x) => yc + Math.sin(x / e.W * 5.5) * e.U * 0.045;
    c.globalAlpha = a; c.fillStyle = lit('#2f86c2', e, 0.8); c.beginPath();
    for (let x = 0; x <= e.W + 10; x += 10) c.lineTo(x, yAt(x) - wd / 2);
    for (let x = e.W + 10; x >= 0; x -= 10) c.lineTo(x, yAt(x) + wd / 2);
    c.closePath(); c.fill();
    c.strokeStyle = rgba('#bfe3ff', 0.5 * a); c.lineWidth = e.U * 0.003;
    const r = rng(el.seed || 41);
    for (let i = 0; i < 14; i++) { const x = ((r() + e.t * 0.16) % 1) * e.W, y = yAt(x) + (r() - 0.5) * wd * 0.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + e.U * 0.04, y + e.U * 0.003); c.stroke(); }
    if (el.foam) {
      const f = 1 - span(e.t, el.foamFadeFrom, el.foamFadeTo), up = span(e.t, el.foamFadeFrom, el.foamFadeTo);
      c.fillStyle = lit('#f6f3ea', e, 0.4);
      for (let i = 0; i < 46; i++) {
        const x = ((r() + e.t * 0.11) % 1) * e.W, sz = e.U * (0.008 + r() * 0.014), off = (r() - 0.5) * wd * 0.9;
        const y = yAt(x) - wd * 0.42 + off * 0.25 - up * e.U * (0.05 + r() * 0.1) - Math.abs(off) * up * 1.2;
        c.globalAlpha = a * f * ease(k) * 0.95; circle(c, x, y, sz); circle(c, x + sz, y + sz * 0.3, sz * 0.7);
      }
    }
  },
  bees(c, e, el, k, a) {
    const hx = (el.x ?? 0.78) * e.W, hy = (el.y ?? 0.4) * e.H, s = e.U * 0.017 * (el.size || 1), cols = ['#f2b33d', '#c9791f', '#f7dd8a', '#8a4b12', '#e9a13b'];
    let idx = 0; const fill = ease(k);
    for (let q = -3; q <= 3; q++) for (let rr = -2; rr <= 2; rr++) {
      if (Math.abs(q + rr * 0.5) > 3) continue;
      const cx = hx + (q + rr * 0.5) * s * 1.75, cy = hy + rr * s * 1.52, on = fill * 34 > idx; idx++;
      c.globalAlpha = a; c.beginPath(); for (let i = 0; i < 6; i++) c.lineTo(cx + Math.cos(PI / 6 + i * PI / 3) * s, cy + Math.sin(PI / 6 + i * PI / 3) * s); c.closePath();
      c.fillStyle = on ? lit(cols[idx % 5], e, 0.4) : lit('#5b452a', e, 0.4); c.fill(); c.strokeStyle = lit('#3a2a14', e, 0.4); c.lineWidth = s * 0.16; c.stroke();
    }
    const n = el.count || 12, r = rng(el.seed || 9);
    for (let i = 0; i < n; i++) {
      const fx = (0.08 + r() * 0.6) * e.W, fy = e.gy(fx) + (0.05 + r() * 0.3) * (e.H - e.hz) - e.U * 0.07, sp = 0.18 + r() * 0.14, ph = r();
      const u = (e.t * sp + ph) % 1, v = u < 0.5 ? ease(u * 2) : ease(2 - u * 2);
      const x = lerp(fx, hx, v) + Math.sin(e.t * 9 + i) * e.U * 0.006, y = lerp(fy, hy, v) - Math.sin(v * PI) * e.U * 0.12 + Math.cos(e.t * 11 + i * 2) * e.U * 0.005;
      c.globalAlpha = a; c.fillStyle = '#f5c531'; circle(c, x, y, e.U * 0.0048); c.fillStyle = rgba('#ffffff', 0.55); circle(c, x, y - e.U * 0.005, e.U * 0.003 * (0.6 + 0.4 * Math.sin(e.t * 40 + i)));
    }
  },
  web(c, e, el, k, a) {
    const cx = (el.x ?? 0.5) * e.W, cy = (el.y ?? 0.42) * e.H, R = e.U * 0.27 * (el.size || 1);
    const wind = span(e.t, el.windFrom, (el.windFrom ?? 0) + 2), tear = span(e.t, el.tearFrom, el.tearTo);
    const sh = (i) => Math.sin(e.t * (3 + wind * 9) + i) * e.U * 0.004 * (1 + wind * 5);
    c.globalAlpha = a; c.strokeStyle = lit('#5a4630', e); c.lineWidth = e.U * 0.014; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx - R * 1.5, cy - R * 1.15); c.lineTo(cx - R * 0.7, cy - R * 0.95); c.moveTo(cx + R * 1.5, cy - R * 0.9); c.lineTo(cx + R * 0.75, cy - R * 0.9); c.moveTo(cx - R * 0.3, cy + R * 1.5); c.lineTo(cx, cy + R * 1.02); c.stroke();
    c.strokeStyle = rgba('#f1f4f8', 0.85 * a); c.lineWidth = e.U * 0.0022;
    const N = 12, pt = (i, d) => { const an = (i / N) * 2 * PI + 0.2, dd = d * (0.86 + 0.14 * Math.cos(an * 3)); return [cx + Math.cos(an) * R * dd + sh(i) * d + tear * e.U * 0.25 * d * (i / N), cy + Math.sin(an) * R * dd + sh(i + 2) * d + tear * tear * e.U * 0.1 * (i % 3)]; };
    for (let i = 0; i < N; i++) { if (i / N < tear * 1.05) continue; const [x, y] = pt(i, 1.05); c.beginPath(); c.moveTo(cx + sh(0) * 0.2, cy); c.lineTo(x, y); c.stroke(); }
    for (let rg = 1; rg <= 7; rg++) {
      if (rg / 7 > 1 - tear * 0.9 + 0.12) continue;
      c.beginPath(); for (let i = 0; i <= N; i++) { if ((i % N) / N < tear * 1.05) { c.stroke(); c.beginPath(); continue; } const [x, y] = pt(i % N, rg / 7); c.lineTo(x, y); } c.stroke();
    }
  },
  ashes(c, e, el, k, a) {
    const x0 = (el.x ?? 0.42) * e.W, r = rng(el.seed || 23), n = 420, S = e.U * (el.size || 1);
    for (let i = 0; i < n; i++) {
      const u = r(), an = r() * PI, d = Math.sqrt(r()), px = x0 + Math.cos(an) * d * S * 0.2, py0 = e.gy(px) - Math.sin(an) * d * S * 0.085 * (1 - Math.abs(Math.cos(an)) * 0.2);
      const kb = el.blowFrom != null ? span(e.t, el.blowFrom, el.to ?? e.dur) : k, st = u * 0.75, b = clamp((kb - st) / 0.25), sz = S * (0.003 + r() * 0.004), ph = r() * 6;
      const x = px + b * b * e.W * (0.5 + r() * 0.6), y = py0 - b * S * (0.1 + r() * 0.35) + Math.sin(ph + b * 9) * S * 0.03 * b;
      c.globalAlpha = a * (1 - b) * 0.95; c.fillStyle = lit(i % 3 ? '#8d8d8d' : '#c2c2c2', e, 0.5); circle(c, x, y, sz);
    }
  },
  orbits(c, e, el, k, a) {
    const cx = e.W * 0.5, cy = e.hz * 0.5, rx = e.W * 0.36, ry = e.hz * 0.3;
    const path = (ox, oy, sx, sy, col) => { c.strokeStyle = rgba(col, 0.5 * a); c.lineWidth = e.U * 0.003; c.setLineDash([e.U * 0.012, e.U * 0.012]); c.beginPath(); c.ellipse(cx + ox, cy + oy, rx * sx, ry * sy, 0, 0, 2 * PI); c.stroke(); c.setLineDash([]); };
    path(0, 0, 1, 1, '#ffd95e'); path(0, e.hz * 0.06, 0.62, 0.55, '#dfe9ff');
    const as = e.t * 0.35, am = e.t * 0.9 + 2;
    const sx = cx + Math.cos(as) * rx, sy = cy + Math.sin(as) * ry, mx = cx + Math.cos(am) * rx * 0.62, my = cy + e.hz * 0.06 + Math.sin(am) * ry * 0.55;
    for (let i = 1; i < 14; i++) { c.globalAlpha = a * (1 - i / 14) * 0.5; c.fillStyle = '#ffd95e'; circle(c, cx + Math.cos(as - i * 0.05) * rx, cy + Math.sin(as - i * 0.05) * ry, e.U * 0.006); c.fillStyle = '#dfe9ff'; circle(c, cx + Math.cos(am - i * 0.07) * rx * 0.62, cy + e.hz * 0.06 + Math.sin(am - i * 0.07) * ry * 0.55, e.U * 0.004); }
    const g = c.createRadialGradient(sx, sy, 0, sx, sy, e.U * 0.12); g.addColorStop(0, rgba('#ffe9a8', 0.7 * a)); g.addColorStop(1, rgba('#ffe9a8', 0)); c.globalAlpha = 1; c.fillStyle = g; circle(c, sx, sy, e.U * 0.12);
    c.globalAlpha = a; c.fillStyle = '#ffd95e'; circle(c, sx, sy, e.U * 0.04); moonDisc(c, mx, my, e.U * 0.026, 0.3, e, a);
  },
  depths(c, e, el, k, a) {
    const y0 = (el.y ?? 0.3) * e.H, y1 = y0 + (e.H - y0) * 0.36, d = ease(k);
    const g = c.createLinearGradient(0, y0, 0, e.H); g.addColorStop(0, mix('#134a6b', '#06202f', d * 0.6)); g.addColorStop(0.4, mix('#0a3049', '#030f18', d * 0.8)); g.addColorStop(1, '#010409');
    c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.moveTo(0, e.H);
    for (let x = 0; x <= e.W + 10; x += 10) c.lineTo(x, y0 + Math.sin(x / e.U * 6 + e.t * 1.5) * e.U * 0.022 + Math.sin(x / e.U * 13 + e.t * 2.2) * e.U * 0.008);
    c.lineTo(e.W, e.H); c.closePath(); c.fill();
    c.strokeStyle = rgba('#5fb0cf', 0.5 * a * (1 - d * 0.5)); c.lineWidth = e.U * 0.006; c.beginPath();
    for (let x = 0; x <= e.W + 10; x += 10) c.lineTo(x, y1 + Math.sin(x / e.U * 3.2 - e.t * 0.8) * e.U * 0.035);
    c.stroke(); c.strokeStyle = rgba('#5fb0cf', 0.12 * a); c.lineWidth = e.U * 0.03; c.stroke();
    const L = (e.H - y0) * lerp(0.75, 0.12, d), lx = e.W * 0.5;
    const lg = c.createLinearGradient(0, y0, 0, y0 + L); lg.addColorStop(0, rgba('#bfe9ff', 0.3 * a * (1 - d * 0.75))); lg.addColorStop(1, rgba('#bfe9ff', 0));
    c.fillStyle = lg; c.beginPath(); c.moveTo(lx - e.U * 0.05, y0); c.lineTo(lx + e.U * 0.05, y0); c.lineTo(lx + e.U * 0.2, y0 + L); c.lineTo(lx - e.U * 0.2, y0 + L); c.closePath(); c.fill();
  },
  label(c, e, el, k, a) {
    const x = (el.x ?? 0.5) * e.W, y = (el.y ?? 0.5) * e.H, fs = Math.max(11, e.U * 0.034) * (el.size || 1);
    c.font = `700 ${fs}px Tajawal, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl';
    const w = c.measureText(el.text || '').width + fs * 1.2;
    c.globalAlpha = a * 0.72; c.fillStyle = '#081019'; c.beginPath(); c.roundRect(x - w / 2, y - fs * 0.85, w, fs * 1.7, fs * 0.85); c.fill();
    c.globalAlpha = a; c.fillStyle = '#f6e7b8'; c.fillText(el.text || '', x, y + fs * 0.06);
  },
};

Object.assign(DRAW, {
  hail(c, e, el, k, a) {
    const n = Math.round(80 * (el.intensity ?? 1)), r = rng(el.seed || 29), y0 = e.cloudY ?? e.H * 0.2;
    c.fillStyle = rgba('#f4f9ff', 0.95 * a);
    for (let i = 0; i < n; i++) {
      const x = r() * e.W, sp = 0.8 + r() * 0.5, yb = e.gy(x) + r() * (e.H - e.hz) * 0.45, u = (r() + e.t * sp * 1.2) % 1, sz = e.U * (0.004 + r() * 0.004);
      const y = u < 0.86 ? lerp(y0, yb, u / 0.86) : yb - Math.sin(((u - 0.86) / 0.14) * PI) * e.U * 0.03;
      circle(c, x + (u > 0.86 ? (u - 0.86) * e.U * 0.25 * (i % 2 ? 1 : -1) : 0), y, sz);
    }
  },
  rock(c, e, el, k, a) {
    const x = (el.x ?? 0.5) * e.W, y = e.gy(x) + e.U * 0.02, S = e.U * (el.size || 1), rx = S * 0.27, ry = S * 0.19;
    const w = ease(span(e.t, el.washFrom, el.washTo)), half = (sx, sy) => { c.beginPath(); c.ellipse(x, y, rx * sx, ry * sy, 0, PI, 2 * PI); c.closePath(); };
    const g = c.createLinearGradient(x - rx, y - ry, x + rx, y); g.addColorStop(0, lit('#b9bcc2', e)); g.addColorStop(0.5, lit('#8e9299', e)); g.addColorStop(1, lit('#5e626a', e));
    c.globalAlpha = a; c.fillStyle = g; half(1, 1); c.fill();
    c.strokeStyle = rgba('#ffffff', 0.35 * a * (0.3 + 0.7 * w)); c.lineWidth = S * 0.012; c.lineCap = 'round'; c.beginPath(); c.ellipse(x - rx * 0.2, y, rx * 0.62, ry * 0.74, 0, PI * 1.12, PI * 1.5); c.stroke();
    c.save(); c.beginPath(); c.rect(x - rx * 1.3, y - ry * 1.5, rx * 2.6, ry * (1.5 - 0.28 - 0.9 * w)); c.clip();
    c.globalAlpha = a * (1 - w * w); c.fillStyle = lit('#8a6a3e', e); half(1.05, 1.13); c.fill();
    c.fillStyle = lit('#a07c4a', e); c.beginPath(); c.ellipse(x - rx * 0.15, y - ry * 0.25, rx * 0.8, ry * 0.86, 0, PI, 2 * PI); c.fill(); c.restore();
    if (w > 0 && w < 1) { const r = rng(el.seed || 61); c.fillStyle = lit('#7a5a36', e); for (let i = 0; i < 26; i++) { const an = PI + r() * PI, u = (r() + e.t * 0.6) % 1, d = 1 + u * 0.25; c.globalAlpha = a * (1 - u) * (1 - w); circle(c, x + Math.cos(an) * rx * d * (1 + u * 0.3), Math.min(y, y + Math.sin(an) * ry * (1 - u * 1.2)), S * 0.012); } }
    c.globalAlpha = a * w * (1 - span(e.t, (el.washTo ?? 0), (el.washTo ?? 0) + 4)) * 0.7; c.fillStyle = lit('#6d5132', e); c.beginPath(); c.ellipse(x, y + S * 0.012, rx * 1.5, S * 0.02, 0, 0, 2 * PI); c.fill();
  },
  shadow(c, e, el, k, a) {
    if (!e.sun || e.sun[1] > e.hz - e.U * 0.01) return;
    const x = (el.x ?? 0.5) * e.W, y = e.gy(x) + e.U * 0.02, hObj = e.U * 0.36 * (el.size || 1), dx = x - e.sun[0], dy = e.hz - e.sun[1];
    const L = Math.min(e.W * 0.75, (hObj * Math.abs(dx)) / Math.max(dy, e.U * 0.03)), d = dx >= 0 ? 1 : -1;
    const g = c.createLinearGradient(x, 0, x + d * L, 0); g.addColorStop(0, rgba('#06100c', 0.5 * a)); g.addColorStop(1, rgba('#06100c', 0.12 * a));
    c.fillStyle = g; c.beginPath(); c.moveTo(x - e.U * 0.02, y); c.quadraticCurveTo(x + d * L * 0.5, y - e.U * 0.035, x + d * L, y + e.U * 0.012); c.quadraticCurveTo(x + d * L * 0.5, y + e.U * 0.07, x + e.U * 0.02, y + e.U * 0.012); c.closePath(); c.fill();
  },
  mirage(c, e, el, k, a) {
    const x = (el.x ?? 0.5) * e.W, y = e.hz + e.U * 0.03, f = 1 - ease(span(e.t, el.fadeFrom, el.fadeTo)), wd = e.W * 0.34 * (el.size || 1) * (0.35 + 0.65 * f);
    for (let i = 0; i < 7; i++) {
      const yy = y + i * e.U * 0.006, ww = wd * (1 - i * 0.09);
      c.globalAlpha = a * f * (0.75 - i * 0.07); c.fillStyle = mix('#bfe6f7', '#6fb7dc', i / 6); c.beginPath();
      for (let j = 0; j <= 40; j++) { const u = j / 40; c.lineTo(x - ww + u * 2 * ww, yy + Math.sin(u * 22 + e.t * 3 + i) * e.U * 0.0022 - Math.sin(u * PI) * e.U * 0.006); }
      for (let j = 40; j >= 0; j--) { const u = j / 40; c.lineTo(x - ww + u * 2 * ww, yy + e.U * 0.008 + Math.sin(u * 18 - e.t * 2.4 + i) * e.U * 0.0022); }
      c.closePath(); c.fill();
    }
    c.strokeStyle = rgba('#ffffff', 0.16 * a); c.lineWidth = e.U * 0.002;
    for (let i = 0; i < 9; i++) { const hx = x + (i - 4) * e.W * 0.07; c.beginPath(); for (let j = 0; j < 12; j++) c.lineTo(hx + Math.sin(j * 0.9 + e.t * 2.5 + i) * e.U * 0.006, y - j * e.U * 0.007); c.stroke(); }
  },
  sprout(c, e, el, k, a) {
    const x = (el.x ?? 0.5) * e.W, y = e.gy(x), S = e.U * (el.size || 1), stone = el.kind === 'stone', sy = y + S * 0.085;
    const split = ease(span(k, 0.15, 0.4)), root = ease(span(k, 0.35, 0.7)), up = ease(span(k, 0.45, 1));
    c.globalAlpha = a; c.fillStyle = lit('#4a321c', e, 0.4); c.beginPath(); c.ellipse(x, y + S * 0.1, S * 0.15, S * 0.11, 0, 0, 2 * PI); c.fill();
    c.strokeStyle = rgba('#e8d3a6', 0.85 * a); c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { c.lineWidth = S * 0.005; c.beginPath(); c.moveTo(x, sy); c.quadraticCurveTo(x + (i - 2) * S * 0.02, sy + S * 0.04 * root, x + (i - 2) * S * 0.035 * root, sy + S * (0.05 + 0.03 * (i % 2)) * root); c.stroke(); }
    const stemTop = sy - (S * 0.085 + S * (stone ? 0.2 : 0.24) * up) * span(up, 0, 0.001);
    c.strokeStyle = lit('#5fa644', e); c.lineWidth = S * 0.012; c.beginPath(); c.moveTo(x, sy); c.lineTo(x, sy - (sy - stemTop) * 1); if (up > 0) c.stroke();
    if (up > 0.35) {
      const lf = span(up, 0.35, 1); c.lineWidth = S * 0.01;
      if (stone) for (let i = 0; i < 5; i++) { const an = -PI / 2 + (i - 2) * 0.5, L = S * 0.11 * lf; c.beginPath(); c.moveTo(x, stemTop); c.quadraticCurveTo(x + Math.cos(an) * L * 0.6, stemTop + Math.sin(an) * L, x + Math.cos(an) * L * 1.1, stemTop + Math.sin(an) * L * 0.6 + L * 0.3); c.stroke(); }
      else { for (const d of [-1, 1]) { c.beginPath(); c.moveTo(x, stemTop + S * 0.07); c.quadraticCurveTo(x + d * S * 0.05 * lf, stemTop + S * 0.03, x + d * S * 0.08 * lf, stemTop + S * 0.055); c.stroke(); } c.fillStyle = lit('#b9c552', e, 0.5); c.beginPath(); c.ellipse(x, stemTop - S * 0.02 * lf, S * 0.012 * lf, S * 0.035 * lf, 0, 0, 2 * PI); c.fill(); }
    }
    const col = lit(stone ? '#7b4a22' : '#e3c064', e, 0.4), rx = S * (stone ? 0.014 : 0.02), ry = S * (stone ? 0.034 : 0.013);
    for (const d of [-1, 1]) { c.fillStyle = col; c.beginPath(); c.ellipse(x + d * S * 0.012 * split, sy, rx, ry, d * 0.35 * split, d < 0 ? PI / 2 : -PI / 2, d < 0 ? PI * 1.5 : PI / 2); c.closePath(); c.fill(); }
    if (split < 0.05) { c.strokeStyle = rgba('#3a2412', 0.7 * a); c.lineWidth = S * 0.003; c.beginPath(); c.moveTo(x, sy - ry); c.lineTo(x, sy + ry); c.stroke(); }
  },
  bitter(c, e, el, k, a) {
    const x0 = (el.x ?? 0.5) * e.W, y0 = e.gy(x0) + e.U * 0.015, S = e.U * (el.size || 1), u = ease(span(e.t, el.uprootFrom, el.uprootTo));
    c.translate(x0 + u * u * e.W * 0.55, y0 - Math.sin(u * PI) * S * 0.16 - u * S * 0.05); c.rotate(u * 2.4); c.globalAlpha = a * (1 - span(u, 0.85, 1));
    c.strokeStyle = rgba('#e8d3a6', 0.9 * a); c.lineWidth = S * 0.006; c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo((i - 2) * S * 0.02, S * 0.03 + (i % 2) * S * 0.008); c.stroke(); }
    c.strokeStyle = lit('#6f8a4a', e); c.lineWidth = S * 0.009;
    for (let i = 0; i < 6; i++) {
      const d = i % 2 ? 1 : -1, L = S * (0.1 + 0.035 * (i % 3)), hh = S * 0.012 * (1 + (i % 3));
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(d * L * 0.5, -hh * 2.2, d * L, -hh * 0.4); c.stroke();
      c.fillStyle = lit('#7f9a58', e); for (let j = 1; j <= 3; j++) circle(c, d * L * (j / 3.4), -hh * (1.5 - Math.abs(j - 1.6) * 0.5), S * 0.013);
      c.fillStyle = lit(i % 3 ? '#c9c24a' : '#9fae3e', e, 0.5); circle(c, d * L * 0.96, -S * 0.016, S * 0.02);
      c.strokeStyle = rgba('#5d6b25', 0.6 * a); c.lineWidth = S * 0.003; c.beginPath(); c.arc(d * L * 0.96, -S * 0.016, S * 0.012, 0.4, 2.6); c.stroke(); c.strokeStyle = lit('#6f8a4a', e); c.lineWidth = S * 0.009;
    }
  },
});

Object.assign(DRAW, { person, animal, birds });

export const ELEMENT_TYPES = Object.keys(DRAW);

function camAt(scene, t) {
  const ks = scene.camera; if (!ks || !ks.length) return null;
  let a = ks[0], b = ks[0];
  for (const k of ks) { if (k.t <= t) { a = k; b = k; } else { b = k; break; } }
  const u = a === b ? 0 : ease(span(t, a.t, b.t)), z = lerp(a.zoom ?? 1, b.zoom ?? 1, u);
  return { z, x: clamp(lerp(a.x ?? 0.5, b.x ?? 0.5, u), 0.5 / z, 1 - 0.5 / z), y: clamp(lerp(a.y ?? 0.5, b.y ?? 0.5, u), 0.5 / z, 1 - 0.5 / z) };
}

export function drawScene(ctx, W, H, scene, t) {
  const dur = scene.duration || 24, sky = skyAt(scene, t);
  const e = { W, H, U: Math.min(W, H * 1.35), t, hz: H * (scene.horizon ?? 0.64), light: sky.light, gy: null, dur };
  e.gy = () => e.hz;
  ctx.setTransform(ctx.getTransform().a, 0, 0, ctx.getTransform().d, 0, 0);
  ctx.globalAlpha = 1;
  const cam = camAt(scene, t);
  ctx.save();
  if (cam) { ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x * W, -cam.y * H); }
  const g = ctx.createLinearGradient(0, 0, 0, e.hz + H * 0.05); g.addColorStop(0, sky.top); g.addColorStop(1, sky.bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const el of scene.elements || []) {
    const fn = DRAW[el.type]; if (!fn) continue;
    const from = el.from ?? 0, to = el.to ?? dur;
    if (t < from) continue;
    const a = clamp((t - from) / 1.2) * (el.until != null ? clamp((el.until - t) / 1.2) : 1);
    if (a <= 0) continue;
    ctx.save();
    try { fn(ctx, e, el, clamp((t - from) / Math.max(0.01, to - from)), a); } catch (err) { /* عنصر معطوب لا يُسقط المشهد */ }
    ctx.restore();
  }
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.8);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.32)'); ctx.globalAlpha = 1; ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

export class Player {
  constructor(canvas, onTick) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.onTick = onTick || (() => {});
    this.t = 0; this.playing = false; this.scene = null; this.speed = 1;
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(canvas);
    this.loop = this.loop.bind(this);
  }
  resize() {
    const r = this.canvas.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    if (!r.width) return;
    this.canvas.width = Math.round(r.width * d); this.canvas.height = Math.round(r.height * d);
    this.W = r.width; this.H = r.height; this.ctx.setTransform(d, 0, 0, d, 0, 0); this.draw();
  }
  setScene(scene) { this.scene = scene; this.t = 0; this.resize(); this.onTick(this.t, this); }
  draw() { if (this.scene && this.W) drawScene(this.ctx, this.W, this.H, this.scene, this.t); }
  play() {
    if (!this.scene) return;
    if (this.t >= this.scene.duration - 0.05) this.t = 0;
    if (this.playing) return;
    this.playing = true; this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); this.hooks?.play?.(this.t); this.onTick(this.t, this);
  }
  pause() { const was = this.playing; this.playing = false; cancelAnimationFrame(this.raf); if (was) this.hooks?.pause?.(); this.onTick(this.t, this); }
  toggle() { this.playing ? this.pause() : this.play(); }
  seek(t) { this.t = clamp(t, 0, this.scene?.duration || 0); this.hooks?.seek?.(this.t); this.draw(); this.onTick(this.t, this); }
  loop(now) {
    if (!this.playing) return;
    const ext = this.clock?.(); // ساعة خارجية (التلاوة) تقود المشهد حين تعمل
    this.t = ext != null ? ext : this.t + Math.min(0.1, (now - this.last) / 1000) * this.speed; this.last = now;
    if (this.t >= this.scene.duration) { this.t = this.scene.duration; this.draw(); this.pause(); return; }
    this.draw(); this.onTick(this.t, this); this.raf = requestAnimationFrame(this.loop);
  }
  destroy() { this.pause(); this.ro.disconnect(); }
}
