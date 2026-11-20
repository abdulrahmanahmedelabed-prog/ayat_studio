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
  king: { skin: '#d9a77f', hair: '#1f1612', top: '#8e1e2c', bottom: '#5c1420', head: 'hair', beard: true, crown: true },
  man: { skin: '#d9a77f', hair: '#1f1612', top: '#efe9dc', bottom: '#d9cfbb', head: 'shemagh', scarf: '#e8e2d6', band: '#2a2a2a', beard: true },
  woman: { skin: '#e8b892', hair: '#1f1612', top: '#4b6c8f', bottom: '#2f455d', head: 'scarf', scarf: '#2f4f6a' },
  farmer: { skin: '#c99068', hair: '#2b1d16', top: '#8a6a3a', bottom: '#5b4526', head: 'hat', hat: '#d8b45c' },
  elder: { skin: '#d9a77f', hair: '#cfcfcf', top: '#7a6a58', bottom: '#5c4f42', head: 'shemagh', scarf: '#f2efe8', band: '#2a2a2a', beard: true, cane: true },
  grandma: { skin: '#e8b892', hair: '#cfcfcf', top: '#5b4a6b', bottom: '#3f344c', head: 'scarf', scarf: '#ece8f2', cane: true },
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
  // الانفعال (يتغيّر عند moodAt) والكلام الحالي
  const mood = el.moodAt != null && e.t >= el.moodAt ? el.mood2 || 'calm' : el.mood || 'calm';
  const line = (el.says || []).find((q) => e.t >= q.from && e.t < q.to);
  const talk = line ? Math.abs(Math.sin(e.t * (line.style === 'whisper' ? 9 : 13))) : 0;
  const shake = mood === 'afraid' ? Math.sin(e.t * 47) * H * 0.008 : line?.style === 'shout' ? Math.sin(e.t * 31) * H * 0.005 : 0;
  const hop = mood === 'happy' ? Math.abs(Math.sin(e.t * 4.5)) * H * 0.03 : mood === 'surprised' && el.moodAt != null ? Math.max(0, 1 - (e.t - el.moodAt) * 3) * H * 0.08 : 0;
  c.save(); c.translate(x + shake, gy); c.globalAlpha = a;
  if (el.pose === 'sleep') { c.translate(-H * 0.2, -H * 0.06); c.rotate(-Math.PI / 2 + 0.05); c.translate(0, H * 0.3); } // مستلقٍ نائم
  if ((el.facing ?? (el.x1 != null && el.x0 != null && el.x1 < el.x0 ? -1 : 1)) < 0) c.scale(-1, 1);
  c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, 0, 0, H * 0.18, H * 0.035);
  c.translate(0, -bob - hop);
  if (mood === 'sad') c.translate(0, H * 0.015);
  if (mood === 'angry') c.rotate(0.05);
  const hipY = -H * 0.36, legL = H * 0.34;
  if (L.cane) { c.strokeStyle = dim(e, '#6b4a2e'); c.lineWidth = H * 0.03; c.beginPath(); c.moveTo(-H * 0.2, 0); c.lineTo(-H * 0.17, -H * 0.42); c.stroke(); c.translate(0, H * 0.02); c.rotate(0.06); }
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
  else if (pose === 'pray') { arm(-1, 1.2, 1.9); arm(1, 1.2, 1.9); }
  else if (pose === 'give' || pose === 'receive') { arm(-1, 0.2); hand = arm(1, 1.45, pose === 'give' ? 0.1 : -0.3); if (pose === 'give') { c.fillStyle = dim(e, '#d8a24a'); ell(c, hand[0] + H * 0.03, hand[1] - H * 0.02, H * 0.045, H * 0.03); } }
  else if (pose === 'help') { arm(-1, 1.3, 0.3); arm(1, 1.1, 0.5); }
  else if (pose === 'invite') { arm(-1, 0.2); arm(1, 1.9 + Math.sin(e.t * 3) * 0.15, -0.6); }
  else if (pose === 'flog') { // يرفع السوط ثم يُنزله (حركة فقط، دون أثر على أحد)
    arm(-1, 0.25); const ph2 = (e.t * 0.9 + (el.seed || 0)) % 1, up = ph2 < 0.75 ? ease(ph2 / 0.75) : 1 - ease((ph2 - 0.75) / 0.25);
    hand = arm(1, lerp(0.7, 2.9, up), lerp(0.2, -0.4, up));
    c.strokeStyle = dim(e, '#5a3a1e'); c.lineWidth = H * 0.018; c.beginPath(); c.moveTo(hand[0], hand[1]);
    c.quadraticCurveTo(hand[0] + H * lerp(0.25, -0.05, up), hand[1] + H * lerp(0.05, -0.25, up), hand[0] + H * lerp(0.42, 0.1, up), hand[1] + H * lerp(0.3, -0.3, up)); c.stroke(); }
  else if (pose === 'bowed') { arm(-1, 0.9, 1.6); arm(1, 0.9, 1.6); }
  else if (pose === 'read') { arm(-1, 0.35, -1.5); hand = arm(1, 0.35, -1.5); c.fillStyle = dim(e, '#f4ecd6'); c.fillRect(-H * 0.11, hand[1] - H * 0.09, H * 0.22, H * 0.12); c.strokeStyle = dim(e, '#8a6a3a'); c.lineWidth = H * 0.008; c.strokeRect(-H * 0.11, hand[1] - H * 0.09, H * 0.22, H * 0.12); c.beginPath(); c.moveTo(0, hand[1] - H * 0.09); c.lineTo(0, hand[1] + H * 0.03); c.stroke(); }
  else if (pose === 'eat') { arm(-1, 0.3); const up = (Math.sin(e.t * 2.5 + (el.seed || 0)) + 1) / 2; hand = arm(1, lerp(1.2, 2.5, up), lerp(0.4, -0.9, up)); c.fillStyle = dim(e, '#c98a3a'); ell(c, hand[0], hand[1], H * 0.035, H * 0.025); }
  else if (pose === 'proud') { arm(-1, 0.6, 1.5); arm(1, 0.6, 1.5); }
  else if (pose === 'sword' || pose === 'spear') { // سلاح مرفوع، بلا إصابات
    const sw2 = Math.sin(e.t * 4 + (el.seed || 0)); arm(-1, 0.5, 0.6); hand = arm(1, 2.3 + sw2 * 0.4, -0.3);
    c.strokeStyle = dim(e, pose === 'sword' ? '#c9ced6' : '#7a5a36'); c.lineWidth = H * (pose === 'sword' ? 0.025 : 0.018); c.lineCap = 'round';
    const L = H * (pose === 'sword' ? 0.32 : 0.6), an = -1.2 + sw2 * 0.4; c.beginPath(); c.moveTo(hand[0], hand[1]); c.lineTo(hand[0] + Math.cos(an) * L, hand[1] + Math.sin(an) * L); c.stroke();
    if (pose === 'spear') { c.fillStyle = dim(e, '#c9ced6'); c.beginPath(); const tx = hand[0] + Math.cos(an) * L, ty = hand[1] + Math.sin(an) * L; c.moveTo(tx + Math.cos(an) * H * 0.06, ty + Math.sin(an) * H * 0.06); c.lineTo(tx + Math.cos(an + 1.6) * H * 0.02, ty + Math.sin(an + 1.6) * H * 0.02); c.lineTo(tx + Math.cos(an - 1.6) * H * 0.02, ty + Math.sin(an - 1.6) * H * 0.02); c.fill(); }
    else { c.strokeStyle = dim(e, '#6b4a2e'); c.lineWidth = H * 0.02; c.beginPath(); c.moveTo(hand[0] + Math.cos(an + 1.57) * H * 0.04, hand[1] + Math.sin(an + 1.57) * H * 0.04); c.lineTo(hand[0] - Math.cos(an + 1.57) * H * 0.04, hand[1] - Math.sin(an + 1.57) * H * 0.04); c.stroke(); } }
  else if (mood === 'afraid') { arm(-1, 2.25, -1.5); arm(1, 2.25, -1.5); }
  else if (mood === 'surprised') { arm(-1, 1.75, -0.5); arm(1, 1.75, -0.5); }
  else if (mood === 'angry') { arm(-1, 0.55, 1.1); arm(1, 0.55, 1.1); }
  else if (mood === 'sad') { arm(-1, 0.05); arm(1, 0.05); }
  else if (mood === 'happy') { const w = Math.sin(e.t * 5) * 0.2; arm(-1, 2.4 + w, -0.2); arm(1, 0.3); }
  else if (line?.style === 'whisper') { arm(-1, 0.18); arm(1, 2.1, -1.7); }
  else if (line) { arm(-1, 0.18); arm(1, 0.9 + talk * 0.4, -0.4); }
  else { arm(-1, 0.18); arm(1, 0.18); }
  // الرأس
  const hy = bodyTop - H * 0.15, R = H * 0.16, tilt = pose === 'bowed' ? 0.38 : pose === 'proud' ? -0.22 : pose === 'read' ? 0.18 : mood === 'sad' ? 0.24 : mood === 'angry' ? 0.08 : pose === 'lookup' || pose === 'cheer' ? -0.18 : pose === 'thirsty' ? 0.12 : 0;
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
  if (L.crown) { c.fillStyle = dim(e, '#e6c25f'); c.beginPath(); c.moveTo(-R * 0.75, -R * 0.55); for (let i = 0; i <= 4; i++) { c.lineTo(-R * 0.75 + i * R * 0.375, -R * (i % 2 ? 0.75 : 1.25)); } c.lineTo(R * 0.75, -R * 0.55); c.closePath(); c.fill(); }
  // الوجه: عينان واسعتان بلمعة
  const look = pose === 'lookup' || pose === 'cheer' ? -R * 0.12 : 0, blink = el.pose === 'sleep' || (e.t + (el.seed || 0)) % 4 < 0.12;
  for (const s of [-1, 1]) {
    const ex = s * R * 0.38 + R * 0.1, ey = R * 0.12;
    if (blink) { c.strokeStyle = '#2a1a14'; c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(ex - R * 0.16, ey); c.lineTo(ex + R * 0.16, ey); c.stroke(); continue; }
    c.fillStyle = '#ffffff'; ell(c, ex, ey, R * 0.19, R * 0.26);
    const ps = mood === 'surprised' || mood === 'afraid' ? 0.62 : 1, ly = look * 0.5 + (mood === 'sad' ? R * 0.06 : 0);
    c.fillStyle = el.eyes || '#3b2a6e'; ell(c, ex + R * 0.03, ey + ly + R * 0.03, R * 0.15 * ps, R * 0.21 * ps);
    c.fillStyle = '#120c1c'; ell(c, ex + R * 0.03, ey + ly + R * 0.06, R * 0.08 * ps, R * 0.11 * ps);
    c.fillStyle = '#ffffff'; circle(c, ex - R * 0.03, ey + look * 0.5 - R * 0.07, R * 0.06); circle(c, ex + R * 0.08, ey + look * 0.5 + R * 0.1, R * 0.028);
    c.strokeStyle = '#2a1a14'; c.lineWidth = R * 0.06; c.beginPath(); c.ellipse(ex, ey, R * 0.2, R * 0.27, 0, PI * 1.15, PI * 1.85); c.stroke();
  }
  // الحاجبان يحملان الانفعال
  c.strokeStyle = '#2a1a14'; c.lineWidth = R * 0.07; c.lineCap = 'round';
  for (const s of [-1, 1]) {
    const bx = s * R * 0.38 + R * 0.1, by = -R * 0.22 - (mood === 'surprised' || mood === 'afraid' ? R * 0.12 : 0);
    const inner = mood === 'sad' || mood === 'afraid' ? -R * 0.1 : mood === 'angry' ? R * 0.1 : 0; // الطرف الداخلي
    c.beginPath(); c.moveTo(bx - s * R * 0.17, by + (s < 0 ? 0 : inner)); c.lineTo(bx + s * R * 0.17, by + (s < 0 ? inner : 0));
    if (mood !== 'calm' || line) c.stroke();
  }
  if (mood === 'sad') { c.fillStyle = 'rgba(120,190,255,.85)'; const ty = R * (0.4 + ((e.t * 0.8) % 1) * 0.6); c.beginPath(); c.arc(-R * 0.25, ty, R * 0.06, 0, PI); c.lineTo(-R * 0.25, ty - R * 0.14); c.fill(); }
  if (mood === 'afraid') { c.fillStyle = 'rgba(160,210,255,.9)'; c.beginPath(); c.arc(R * 0.85, -R * 0.3, R * 0.08, 0, PI); c.lineTo(R * 0.85, -R * 0.48); c.fill(); }
  if (mood === 'angry') { c.strokeStyle = '#d9443a'; c.lineWidth = R * 0.06; for (const [dx, dy] of [[0.55, -0.85], [0.75, -0.7]]) { c.beginPath(); c.moveTo(R * dx, R * dy); c.lineTo(R * (dx + 0.12), R * (dy - 0.12)); c.stroke(); } }
  c.fillStyle = 'rgba(240,120,130,.45)'; ell(c, -R * 0.45, R * 0.45, R * 0.13, R * 0.07); ell(c, R * 0.62, R * 0.45, R * 0.13, R * 0.07);
  c.strokeStyle = '#7a3b30'; c.lineWidth = R * 0.06; c.beginPath();
  if (line) { const big = line.style === 'shout' ? 1.5 : line.style === 'whisper' ? 0.45 : 1; c.fillStyle = '#5a2620'; ell(c, R * 0.1, R * 0.58, R * 0.13 * big, R * (0.03 + 0.13 * talk) * big); }
  else if (mood === 'surprised' || mood === 'afraid') { c.fillStyle = '#5a2620'; ell(c, R * 0.1, R * 0.6, R * 0.08, R * 0.12); }
  else if (mood === 'sad') { c.arc(R * 0.1, R * 0.72, R * 0.12, PI * 1.15, PI * 1.85); c.stroke(); }
  else if (mood === 'angry') { c.moveTo(-R * 0.05, R * 0.62); c.lineTo(R * 0.25, R * 0.58); c.stroke(); }
  else if (mood === 'happy') { c.fillStyle = '#7a3b30'; c.arc(R * 0.1, R * 0.5, R * 0.15, 0, PI); c.fill(); }
  if (pose === 'cheer') { c.fillStyle = '#7a3b30'; c.arc(R * 0.1, R * 0.55, R * 0.13, 0, PI); c.fill(); }
  else if (pose === 'thirsty') { c.arc(R * 0.1, R * 0.68, R * 0.1, PI * 1.1, PI * 1.9); c.stroke(); }
  else { c.arc(R * 0.1, R * 0.5, R * 0.1, PI * 0.15, PI * 0.85); c.stroke(); }
  if (line?.style === 'shout') { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = R * 0.07; for (const an of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(R * 1.3 * Math.cos(an), R * 1.3 * Math.sin(an)); c.lineTo(R * 1.75 * Math.cos(an), R * 1.75 * Math.sin(an)); c.stroke(); } }
  c.restore(); c.restore();
  if (line) bubble(c, e, x + shake, gy - bob - hop - H * 1.08, line, a);
}

// فقاعة الكلام: عادي، صراخ (حواف مسنّنة وخط أكبر)، همس (إطار متقطع وخط أصغر)
function bubble(c, e, x, y, line, a) {
  const fs = Math.max(11, e.U * (line.style === 'shout' ? 0.04 : line.style === 'whisper' ? 0.024 : 0.03));
  c.save(); c.globalAlpha = a * Math.min(1, (e.t - line.from) * 4, (line.to - e.t) * 4);
  c.font = `${line.style === 'whisper' ? 500 : 700} ${fs}px Tajawal, sans-serif`; c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const w = Math.min(e.W * 0.6, c.measureText(line.text).width + fs * 1.4), h = fs * 1.9, bx = Math.max(w / 2 + 6, Math.min(e.W - w / 2 - 6, x)), by = Math.max(h / 2 + 6, y - h / 2);
  c.fillStyle = line.style === 'shout' ? '#fff3c8' : line.style === 'whisper' ? 'rgba(255,255,255,.82)' : '#ffffff';
  c.strokeStyle = line.style === 'shout' ? '#c0392b' : '#2a2a35'; c.lineWidth = Math.max(1.5, fs * 0.09);
  c.beginPath();
  if (line.style === 'shout') { const n = 18; for (let i = 0; i < n; i++) { const an = (i / n) * 2 * PI, r = i % 2 ? 1 : 1.18; c.lineTo(bx + Math.cos(an) * (w / 2) * r, by + Math.sin(an) * (h / 2) * r); } c.closePath(); }
  else { c.roundRect(bx - w / 2, by - h / 2, w, h, h / 2); }
  if (line.style === 'whisper') c.setLineDash([fs * 0.25, fs * 0.2]);
  c.fill(); c.stroke(); c.setLineDash([]);
  c.beginPath(); c.moveTo(x - fs * 0.3, by + h / 2 - 1); c.lineTo(x, y + h * 0.15 + fs * 0.4); c.lineTo(x + fs * 0.3, by + h / 2 - 1); c.fill();
  c.fillStyle = line.style === 'shout' ? '#8e1e14' : line.style === 'whisper' ? '#555a66' : '#1d2230'; c.fillText(line.text, bx, by + fs * 0.06, w - fs * 0.6);
  c.restore();
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
