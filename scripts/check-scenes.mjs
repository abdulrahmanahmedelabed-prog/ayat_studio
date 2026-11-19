// فحص دقة المكتبة: كل عنصر من الأنواع المعروفة، كل توقيت داخل مدة المشهد، وكل لفظ قرآني مربوط موجود فعلًا في الآية.
import fs from 'node:fs';
import { LIBRARY } from '../src/scenes/library.js';
import { ELEMENT_TYPES } from '../src/engine/render.js';
import { alignAyah, findPhrase } from '../src/words.js';
const Q = JSON.parse(fs.readFileSync('public/data/quran.json')), C = JSON.parse(fs.readFileSync('public/data/clean.json'));
let bad = 0, linked = 0; const fail = (id, m) => { bad++; console.log(`✕ ${id}: ${m}`); };
for (const s of LIBRARY) {
  const words = [];
  for (let a = s.ref.from; a <= s.ref.to; a++) { const al = alignAyah(Q[s.ref.s - 1][a - 1], C[s.ref.s - 1][a - 1]); if (!al) fail(s.id, `تعذّرت مطابقة كلمات ${s.ref.s}:${a}`); else words.push(...al); }
  for (const e of s.elements) { if (!ELEMENT_TYPES.includes(e.type)) fail(s.id, `نوع مجهول ${e.type}`); for (const k of ['from', 'to', 'until']) if (e[k] > s.duration + 0.01) fail(s.id, `${e.type}.${k} خارج المدة`); }
  let last = -1;
  for (const c of s.captions) {
    if (c.t <= last || c.t >= s.duration) fail(s.id, `توقيت الشرح ${c.t}`); last = c.t;
    if (c.q) { if (findPhrase(words, c.q)) linked++; else fail(s.id, `اللفظ غير موجود في الآية: «${c.q}»`); }
  }
}
console.log(`${LIBRARY.length} مشهدًا · ${linked} لقطة مربوطة بلفظها · ${bad} خطأ`);
process.exit(bad ? 1 : 0);
