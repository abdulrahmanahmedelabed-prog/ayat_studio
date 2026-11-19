// شخصيات بأسلوب الأنمي (إنسان، أنعام، طير) تُرسم بالكود على Canvas.
// تُعرض فقط في درجة المراجع «متساهل»، وهي شخصيات عامة لا تمثّل أحدًا بعينه.
const PI = Math.PI;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const span = (t, a, b) => (a == null || b == null ? 0 : clamp((t - a) / Math.max(0.001, b - a)));
const ease = (t) => t * t * (3 - 2 * t);
const circle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, 2 * PI); c.fill(); };
const ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, 2 * PI); c.fill(); };
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = (v) => Math.round(clamp(v * k, 0, 255)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
const dim = (e, hex, k = 0.55) => shade(hex, 1 - (1 - e.light) * k);

const LOOKS = {
  boy: { skin: '#f3c9a4', hair: '#2b1d16', top: '#3f7fbf', bottom: '#2c3e50', head: 'hair' },
  girl: { skin: '#f6d2b4', hair: '#2b1d16', top: '#c0587e', bottom: '#7a3a5c', head: 'scarf', scarf: '#e9e1f0' },
  man: { skin: '#d9a77f', hair: '#1f1612', top: '#efe9dc', bottom: '#d9cfbb', head: 'shemagh', scarf: '#e8e2d6', band: '#2a2a2a', beard: true },
  woman: { skin: '#e8b892', hair: '#1f1612', top: '#4b6c8f', bottom: '#2f455d', head: 'scarf', scarf: '#2f4f6a' },
  farmer: { skin: '#c99068', hair: '#2b1d16', top: '#8a6a3a', bottom: '#5b4526', head: 'hat', hat: '#d8b45c' },
};

// el: { x, x0, x1 (مشي), look, pose: stand|walk|lookup|cheer|sow|thirsty, size, facing }
export function person(c, e, el, k, a) {
  const L = { ...LOOKS[el.look || 'boy'], ...(el.colors || {}) };
  const walking = el.x0 != null && el.x1 != null && k < 1 && (el.pose || 'walk') !== 'stand';
  const x = (el.x0 != null && el.x1 != null ? lerp(el.x0, el.x1, ease(k)) : (el.x ?? 0.5)) * e.W;
  const gy = e.gy(x) + (el.dy || 0) * e.H + e.U * 0.01, H = e.U * 0.2 * (el.size || 1);
  const ph = e.t * (el.pose === 'thirsty' ? 5 : 7) + (el.seed || 0), sw = walking ? Math.sin(ph) : 0;
  const bob = walking ? Math.abs(Math.cos(ph)) * H * 0.025 : Math.sin(e.t * 1.6 + (el.seed || 0)) * H * 0.006;
  const pose = walking && el.pose !== 'thirsty' ? 'walk' : el.pose || 'stand';
  c.save(); c.translate(x, gy); c.globalAlpha = a;
  if ((el.facing ?? (el.x1 != null && el.x0 != null && el.x1 < el.x0 ? -1 : 1)) < 0) c.scale(-1, 1);
  c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, 0, 0, H * 0.18, H * 0.035);
  c.translate(0, -bob);
  const hipY = -H * 0.36, legL = H * 0.34;
  // الساقان
  c.lineCap = 'round'; c.lineWidth = H * 0.075; c.strokeStyle = dim(e, L.bottom);
  for (const s of [-1, 1]) { const an = sw * 0.42 * s; c.beginPath(); c.moveTo(s * H * 0.045, hipY); c.lineTo(s * H * 0.045 + Math.sin(an) * legL, hipY + Math.cos(an) * legL); c.stroke(); }
  c.fillStyle = dim(e, '#3a2a20'); for (const s of [-1, 1]) { const an = sw * 0.42 * s; ell(c, s * H * 0.045 + Math.sin(an) * legL + H * 0.02, hipY + Math.cos(an) * legL, H * 0.05, H * 0.025); }
  // الجسم (ثوب)
  const bodyTop = -H * 0.66;
  c.fillStyle = dim(e, L.top); c.beginPath(); c.moveTo(-H * 0.1, bodyTop); c.quadraticCurveTo(-H * 0.15, hipY, -H * 0.15, hipY + H * (L.head === 'scarf' || L.head === 'shemagh' ? 0.2 : 0.04));
  c.lineTo(H * 0.15, hipY + H * (L.head === 'scarf' || L.head === 'shemagh' ? 0.2 : 0.04)); c.quadraticCurveTo(H * 0.15, hipY, H * 0.1, bodyTop); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(H * 0.02, bodyTop, H * 0.12, H * 0.5);
  // الذراعان
  const arm = (s, ang, bend = 0) => {
    const sx = s * H * 0.1, sy = bodyTop + H * 0.05, L1 = H * 0.15, L2 = H * 0.14;
    const ex = sx + Math.sin(ang) * L1 * s, ey = sy + Math.cos(ang) * L1, hx = ex + Math.sin(ang + bend * s) * L2 * s, hy = ey + Math.cos(ang + bend * s) * L2;
    c.strokeStyle = dim(e, L.top); c.lineWidth = H * 0.065; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
    c.fillStyle = dim(e, L.skin); circle(c, hx, hy, H * 0.033);
    return [hx, hy];
  };
  let hand;
  if (pose === 'walk') { arm(-1, 0.25 + sw * 0.5); arm(1, 0.25 - sw * 0.5); }
  else if (pose === 'cheer') { const w = Math.sin(e.t * 6) * 0.25; arm(-1, 2.6 + w, -0.3); arm(1, 2.6 - w, -0.3); }
  else if (pose === 'lookup') { arm(-1, 0.2); arm(1, 0.6, 1.2); }
  else if (pose === 'sow') { arm(-1, 0.3, 0.6); const th = (Math.sin(e.t * 3) + 1) / 2; hand = arm(1, lerp(0.4, 1.8, th), -0.2);
    if (th > 0.8) { c.fillStyle = dim(e, '#e3c064'); for (let i = 0; i < 5; i++) circle(c, hand[0] + i * H * 0.05, hand[1] + i * i * H * 0.012, H * 0.012); } }
  else if (pose === 'thirsty') { arm(-1, 0.15 + sw * 0.2); arm(1, 1.9, 0.4); }
  else { arm(-1, 0.18); arm(1, 0.18); }
  // الرأس
  const hy = bodyTop - H * 0.15, R = H * 0.16, tilt = pose === 'lookup' || pose === 'cheer' ? -0.18 : pose === 'thirsty' ? 0.12 : 0;
  c.save(); c.translate(0, hy); c.rotate(tilt);
  if (L.head === 'hair') { c.fillStyle = dim(e, L.hair); circle(c, -R * 0.08, -R * 0.08, R * 1.08); }
  if (L.head === 'scarf') { c.fillStyle = dim(e, L.scarf); c.beginPath(); c.ellipse(0, R * 0.05, R * 1.22, R * 1.28, 0, 0, 2 * PI); c.fill(); c.beginPath(); c.moveTo(-R * 1.1, R * 0.4); c.quadraticCurveTo(0, R * 2.1, R * 1.1, R * 0.4); c.fill(); }
  if (L.head === 'shemagh') { c.fillStyle = dim(e, L.scarf); c.beginPath(); c.moveTo(-R * 1.15, -R * 0.4); c.quadraticCurveTo(-R * 1.45, R * 1.3, -R * 0.9, R * 1.6); c.lineTo(R * 0.9, R * 1.6); c.quadraticCurveTo(R * 1.45, R * 1.3, R * 1.15, -R * 0.4); c.closePath(); c.fill(); }
  c.fillStyle = dim(e, L.skin); circle(c, 0, 0, R);
  if (L.beard) { c.fillStyle = dim(e, L.hair); c.beginPath(); c.arc(0, R * 0.15, R * 0.9, 0.15 * PI, 0.85 * PI); c.quadraticCurveTo(0, R * 1.25, R * 0.82, R * 0.55); c.fill(); }
  if (L.head === 'hair') { c.fillStyle = dim(e, L.hair); c.beginPath(); c.moveTo(-R * 1.02, -R * 0.05);
    for (let i = 0; i <= 6; i++) { const u = i / 6, xx = lerp(-R, R, u); c.lineTo(xx, -R * (0.25 + (i % 2 ? 0.05 : 0.32))); }
    c.lineTo(R * 1.02, -R * 0.1); c.arc(0, -R * 0.05, R * 1.03, 0, PI, true); c.fill(); }
  if (L.head === 'scarf') { c.fillStyle = dim(e, L.scarf); c.beginPath(); c.arc(0, 0, R * 1.04, PI * 1.02, PI * 1.98); c.quadraticCurveTo(0, -R * 0.52, -R * 1.04, -R * 0.05); c.fill(); }
  if (L.head === 'shemagh') { c.fillStyle = dim(e, L.scarf); c.beginPath(); c.arc(0, 0, R * 1.08, PI * 1.0, PI * 2.0); c.quadraticCurveTo(0, -R * 0.45, -R * 1.08, 0); c.fill();
    c.strokeStyle = dim(e, L.band); c.lineWidth = R * 0.16; c.beginPath(); c.ellipse(0, -R * 0.62, R * 0.98, R * 0.24, 0, PI, 2 * PI); c.stroke(); }
  if (L.head === 'hat') { c.fillStyle = dim(e, L.hair); circle(c, 0, -R * 0.15, R * 1.0); c.fillStyle = dim(e, L.skin); circle(c, 0, R * 0.05, R * 0.93);
    c.fillStyle = dim(e, L.hat); ell(c, 0, -R * 0.62, R * 1.6, R * 0.28); c.beginPath(); c.ellipse(0, -R * 0.7, R * 0.82, R * 0.6, 0, PI, 2 * PI); c.fill(); }
  // الوجه: عينان واسعتان بلمعة
  const look = pose === 'lookup' || pose === 'cheer' ? -R * 0.12 : 0, blink = (e.t + (el.seed || 0)) % 4 < 0.12;
  for (const s of [-1, 1]) {
    const ex = s * R * 0.38 + R * 0.1, ey = R * 0.12;
    if (blink) { c.strokeStyle = '#2a1a14'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(ex - R * 0.16, ey); c.lineTo(ex + R * 0.16, ey); c.stroke(); continue; }
    c.fillStyle = '#ffffff'; ell(c, ex, ey, R * 0.19, R * 0.26);
    c.fillStyle = el.eyes || '#3b2a6e'; ell(c, ex + R * 0.03, ey + look * 0.5 + R * 0.03, R * 0.15, R * 0.21);
    c.fillStyle = '#120c1c'; ell(c, ex + R * 0.03, ey + look * 0.5 + R * 0.06, R * 0.08, R * 0.11);
    c.fillStyle = '#ffffff'; circle(c, ex - R * 0.03, ey + look * 0.5 - R * 0.07, R * 0.06); circle(c, ex + R * 0.08, ey + look * 0.5 + R * 0.1, R * 0.028);
    c.strokeStyle = '#2a1a14'; c.lineWidth = R * 0.06; c.beginPath(); c.ellipse(ex, ey, R * 0.2, R * 0.27, 0, PI * 1.15, PI * 1.85); c.stroke();
  }
  c.fillStyle = 'rgba(240,120,130,.45)'; ell(c, -R * 0.45, R * 0.45, R * 0.13, R * 0.07); ell(c, R * 0.62, R * 0.45, R * 0.13, R * 0.07);
  c.strokeStyle = '#7a3b30'; c.lineWidth = R * 0.06; c.beginPath();
  if (pose === 'cheer') { c.fillStyle = '#7a3b30'; c.arc(R * 0.1, R * 0.55, R * 0.13, 0, PI); c.fill(); }
  else if (pose === 'thirsty') { c.arc(R * 0.1, R * 0.68, R * 0.1, PI * 1.1, PI * 1.9); c.stroke(); }
  else { c.arc(R * 0.1, R * 0.5, R * 0.1, PI * 0.15, PI * 0.85); c.stroke(); }
  c.restore(); c.restore();
}

const ANIMALS = {
  sheep: { body: '#f4f1e8', head: '#3a3330', legs: '#3a3330', ear: '#2a2422', w: 1, h: 0.62, neck: 0.15, leg: 0.42, fluffy: true },
  cow: { body: '#f7f4ee', head: '#f7f4ee', legs: '#f7f4ee', ear: '#d9c9b8', spots: '#5a4030', w: 1.25, h: 0.7, neck: 0.12, leg: 0.45, horns: true },
  camel: { body: '#c99a5b', head: '#c99a5b', legs: '#b8894c', ear: '#a87a42', w: 1.15, h: 0.6, neck: 0.5, leg: 0.95, hump: true },
  goat: { body: '#7a5536', head: '#7a5536', legs: '#5d3f27', ear: '#5d3f27', w: 0.9, h: 0.6, neck: 0.18, leg: 0.42, horns: true },
};

// el: { kind, x | x0,x1, size, graze: true, facing }
export function animal(c, e, el, k, a) {
  const A = ANIMALS[el.kind || 'sheep'];
  const walking = el.x0 != null && el.x1 != null && k < 1;
  const x = (el.x0 != null && el.x1 != null ? lerp(el.x0, el.x1, ease(k)) : (el.x ?? 0.5)) * e.W, gy = e.gy(x) + (el.dy || 0) * e.H + e.U * 0.012;
  const S = e.U * 0.09 * (el.size || 1), bw = S * A.w, bh = S * A.h * 0.55, legH = S * A.leg;
  const ph = e.t * 6 + (el.seed || 0), sw = walking ? Math.sin(ph) : 0;
  const grazing = !walking && el.graze && Math.sin(e.t * 0.7 + (el.seed || 0)) > -0.2;
  c.save(); c.translate(x, gy); c.globalAlpha = a;
  if ((el.facing ?? (el.x1 != null && el.x0 != null && el.x1 < el.x0 ? -1 : 1)) < 0) c.scale(-1, 1);
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, 0, 0, bw * 0.7, S * 0.06);
  const by = -legH - bh * 0.6;
  c.lineCap = 'round'; c.lineWidth = S * (el.kind === 'camel' ? 0.09 : 0.11); c.strokeStyle = dim(e, A.legs);
  [[-0.55, 1], [-0.35, -1], [0.4, -1], [0.6, 1]].forEach(([u, s]) => { const an = sw * 0.35 * s; c.beginPath(); c.moveTo(u * bw, by + bh * 0.3); c.lineTo(u * bw + Math.sin(an) * legH, by + bh * 0.3 + Math.cos(an) * legH); c.stroke(); });
  c.fillStyle = dim(e, A.body);
  if (A.fluffy) { for (let i = 0; i < 9; i++) { const an = (i / 9) * 2 * PI; circle(c, Math.cos(an) * bw * 0.6, by + Math.sin(an) * bh * 0.8, bh * 0.55); } }
  ell(c, 0, by, bw * 0.75, bh);
  if (A.hump) { c.beginPath(); c.ellipse(-bw * 0.08, by - bh * 0.55, bw * 0.34, bh * 1.05, 0, PI, 2 * PI); c.fill(); }
  if (A.spots) { c.fillStyle = dim(e, A.spots); ell(c, -bw * 0.25, by - bh * 0.2, bw * 0.2, bh * 0.4, 0.3); ell(c, bw * 0.3, by + bh * 0.2, bw * 0.15, bh * 0.3, -0.2); }
  // الرقبة والرأس
  const nx = bw * 0.68, ny = by - bh * 0.3, nL = S * (0.25 + A.neck), na = grazing ? 0.35 * PI : -0.28 * PI;
  const hx = nx + Math.cos(na) * nL, hy = ny + Math.sin(na) * nL + (grazing ? legH * 0.55 : 0);
  c.strokeStyle = dim(e, el.kind === 'sheep' ? A.body : A.head); c.lineWidth = S * (el.kind === 'camel' ? 0.16 : 0.22); c.beginPath(); c.moveTo(nx - S * 0.1, ny); c.quadraticCurveTo(nx + S * 0.1, ny - (grazing ? 0 : nL * 0.4), hx, hy); c.stroke();
  c.fillStyle = dim(e, A.head); ell(c, hx + S * 0.08, hy, S * 0.2, S * 0.15, grazing ? 0.9 : 0.15);
  c.fillStyle = dim(e, A.ear); ell(c, hx - S * 0.03, hy - S * 0.12, S * 0.06, S * 0.1, -0.6);
  if (A.horns) { c.strokeStyle = dim(e, '#e8dcc0'); c.lineWidth = S * 0.04; c.beginPath(); c.arc(hx - S * 0.02, hy - S * 0.2, S * 0.08, PI, PI * 1.8); c.stroke(); }
  c.fillStyle = '#fff'; circle(c, hx + S * 0.12, hy - S * 0.03, S * 0.055); c.fillStyle = '#1a1210'; circle(c, hx + S * 0.135, hy - S * 0.025, S * 0.035); c.fillStyle = '#fff'; circle(c, hx + S * 0.125, hy - S * 0.04, S * 0.013);
  c.strokeStyle = dim(e, A.body); c.lineWidth = S * 0.05; c.beginPath(); c.moveTo(-bw * 0.72, by - bh * 0.2); c.quadraticCurveTo(-bw * 0.9, by + Math.sin(e.t * 3) * bh * 0.3, -bw * 0.85, by + bh * 0.5); c.stroke();
  c.restore();
}

// سرب طير: el { count, y, x0, x1, size, mode: flap|soar|both, color }
export function birds(c, e, el, k, a) {
  const n = el.count || 7, S = e.U * 0.022 * (el.size || 1), y0 = (el.y ?? 0.25) * e.H;
  const cx = lerp(el.x0 ?? -0.1, el.x1 ?? 1.1, k) * e.W;
  for (let i = 0; i < n; i++) {
    const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1, ox = -row * S * 2.4, oy = side * row * S * 1.3 + Math.sin(e.t * 1.3 + i) * S * 0.4;
    const x = cx + ox, y = y0 + oy, ph = e.t * 9 + i * 0.7;
    const mode = el.mode === 'both' ? (Math.sin(e.t * 0.9) > 0 ? 'soar' : 'flap') : el.mode || 'flap';
    const wing = mode === 'soar' ? 0.15 : Math.sin(ph);
    c.save(); c.translate(x, y); c.globalAlpha = a;
    const col = dim(e, el.color || '#2d2a32', 0.3);
    c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const s of [-1, 1]) {
      const tipY = -S * 0.9 * wing, midY = -S * 0.25 - S * 0.5 * wing;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * S * 0.55, midY - S * 0.35, s * S * 1.35, tipY);
      c.quadraticCurveTo(s * S * 0.7, midY + S * 0.1, s * S * 0.12, S * 0.12); c.closePath(); c.fill();
    }
    ell(c, 0, S * 0.05, S * 0.2, S * 0.3);
    circle(c, 0, -S * 0.25, S * 0.15);
    c.restore();
  }
}

export const FIGURE_TYPES = ['person', 'animal', 'birds'];
