import '@fontsource/tajawal/arabic-400.css';
import '@fontsource/tajawal/arabic-500.css';
import '@fontsource/tajawal/arabic-700.css';
import './styles.css';
import './landing.css';
import { Player, drawScene } from './engine/render.js';
import { Cinema } from './cinema.js';
import { LIBRARY } from './scenes/library.js';
import { POLICY } from './agents/rules.js';

const $ = (s) => document.querySelector(s);
const AR = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
$('#n-scenes').textContent = AR(LIBRARY.length);
POLICY.forEach((p) => { const li = document.createElement('li'); li.textContent = p; $('#policy').append(li); });

// العرض الحيّ: يتنقّل بين مشاهد مختارة
const picks = ['earth-stirs', 'deep-darkness', 'good-tree', 'garden-hill', 'night-day-orbits', 'seven-ears'].map((id) => LIBRARY.find((x) => x.id === id)).filter(Boolean);
const cap = $('#demo-cap'), title = $('#demo-title'), dots = $('#demo-dots');
let idx = 0, lastCap = null, timer;
const player = new Player($('#demo'), (t, pl) => {
  const sc = pl.scene; let c = null; for (const x of sc.captions) if (x.t <= t) c = x;
  if (c !== lastCap) { lastCap = c; cap.textContent = c ? c.text : ''; cap.classList.remove('in'); void cap.offsetWidth; if (c) cap.classList.add('in'); }
  if (!pl.playing && t >= sc.duration - 0.05) { clearTimeout(timer); timer = setTimeout(() => show((idx + 1) % picks.length), 1600); }
});
// اللقطات السينمائية المضمَّنة: تُحمَّل لكل مشهد، ويُعرض بالرسوم إلى أن تجهز
const man = fetch('./cine/manifest.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
const cine = {};
function show(i) {
  clearTimeout(timer); idx = i; lastCap = null; title.textContent = picks[i].title;
  [...dots.children].forEach((d, j) => d.toggleAttribute('aria-current', j === i));
  player.render = cine[picks[i].id] || null;
  player.setScene(picks[i]); player.play();
  man.then((m) => {
    const id = picks[i].id; if (cine[id] || !m[id]?.real) return;
    new Cinema(picks[i], 'real', id, m[id].real).load().then((c) => { if (!c.ready) return; cine[id] = c.draw.bind(c); if (picks[idx].id === id) { player.render = cine[id]; player.draw(); } });
  });
}
picks.forEach((p, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', p.title); b.addEventListener('click', () => show(i)); dots.append(b); });
$('#demo').addEventListener('click', () => player.toggle());
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
show(0); if (still) { player.pause(); player.seek(picks[0].duration * 0.8); }
document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); else if (!still) player.play(); });

// المعرض: صورة سينمائية للمشهد إن وُجدت، وإلا رسمه
function thumb(cv, item) {
  const ctx = cv.getContext('2d');
  drawScene(ctx, 480, 270, item, item.duration * (item.thumb ?? 0.78));
  man.then((m) => { const f = m[item.id]?.real?.[Math.min(1, m[item.id].real.length - 1)]?.file; if (!f) return;
    const im = new Image(); im.onload = () => { const sc = Math.max(480 / im.width, 270 / im.height); ctx.drawImage(im, (480 - im.width * sc) / 2, (270 - im.height * sc) / 2, im.width * sc, im.height * sc); }; im.src = './cine/' + f; });
}

// المعرض
const gal = $('#gallery');
for (const item of LIBRARY) {
  const a = document.createElement('a'); a.className = 'card'; a.href = './app.html#/scene/' + item.id;
  const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270;
  const s = document.createElement('span'); s.innerHTML = '<b></b><small></small>'; s.firstChild.textContent = item.title; s.lastChild.textContent = item.cat;
  a.append(cv, s); gal.append(a);
  setTimeout(() => thumb(cv, item), 60 + gal.children.length * 12);
}
