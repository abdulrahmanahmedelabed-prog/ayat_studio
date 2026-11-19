import '@fontsource/tajawal/arabic-400.css';
import '@fontsource/tajawal/arabic-500.css';
import '@fontsource/tajawal/arabic-700.css';
import './styles.css';
import './landing.css';
import { Player, drawScene } from './engine/render.js';
import { LIBRARY } from './scenes/library.js';
import { POLICY } from './agents/rules.js';

const $ = (s) => document.querySelector(s);
const AR = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
$('#n-scenes').textContent = AR(LIBRARY.length);
POLICY.forEach((p) => { const li = document.createElement('li'); li.textContent = p; $('#policy').append(li); });

// العرض الحيّ: يتنقّل بين مشاهد مختارة
const picks = ['birds-held', 'earth-stirs', 'cattle', 'seven-ears', 'mirage', 'rain-revival'].map((id) => LIBRARY.find((x) => x.id === id)).filter(Boolean);
const cap = $('#demo-cap'), title = $('#demo-title'), dots = $('#demo-dots');
let idx = 0, lastCap = null, timer;
const player = new Player($('#demo'), (t, pl) => {
  const sc = pl.scene; let c = null; for (const x of sc.captions) if (x.t <= t) c = x;
  if (c !== lastCap) { lastCap = c; cap.textContent = c ? c.text : ''; cap.classList.remove('in'); void cap.offsetWidth; if (c) cap.classList.add('in'); }
  if (!pl.playing && t >= sc.duration - 0.05) { clearTimeout(timer); timer = setTimeout(() => show((idx + 1) % picks.length), 1600); }
});
function show(i) {
  clearTimeout(timer); idx = i; lastCap = null; title.textContent = picks[i].title;
  [...dots.children].forEach((d, j) => d.toggleAttribute('aria-current', j === i));
  player.setScene(picks[i]); player.play();
}
picks.forEach((p, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', p.title); b.addEventListener('click', () => show(i)); dots.append(b); });
$('#demo').addEventListener('click', () => player.toggle());
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
show(0); if (still) { player.pause(); player.seek(picks[0].duration * 0.8); }
document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); else if (!still) player.play(); });

// المعرض
const gal = $('#gallery');
for (const item of LIBRARY) {
  const a = document.createElement('a'); a.className = 'card'; a.href = './app.html#/scene/' + item.id;
  const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270;
  const s = document.createElement('span'); s.innerHTML = '<b></b><small></small>'; s.firstChild.textContent = item.title; s.lastChild.textContent = item.cat;
  a.append(cv, s); gal.append(a);
  setTimeout(() => drawScene(cv.getContext('2d'), 480, 270, item, item.duration * (item.thumb ?? 0.78)), 60 + gal.children.length * 12);
}
