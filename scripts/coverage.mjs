// يقيس تغطية الوكلاء دون اتصال على المصحف كله: كم آية نالت مشهدًا له معنى، وكم انتهت بمنظر عام.
// usage: node scripts/coverage.mjs [level=lenient]
import fs from 'node:fs';
import { runOffline } from '../src/agents/offline.js';
const C = JSON.parse(fs.readFileSync('public/data/clean.json')), T = JSON.parse(fs.readFileSync('public/data/tafsir.json'));
const level = process.argv[2] || 'lenient', kinds = {}; let n = 0;
global.setTimeout = (f) => f(); // بلا انتظار
for (let s = 0; s < 114; s++) for (let a = 0; a < C[s].length; a++) {
  const r = await runOffline({ clean: C[s][a], tafsir: T[s][a], strictness: level }, () => {}); n++;
  const k = !r.ok ? 'rejected' : r.scene.elements.some((e) => e.type === 'scales' || e.type === 'scroll' || e.pose === 'flog') ? 'ruling'
    : r.scene.elements.some((e) => e.type === 'person') ? 'people' : r.scene.captions.length && /مشهد تقريبي/.test(r.scene.captions.at(-1).text) && r.scene.elements.length <= 4 && r.scene.elements.every((e) => ['sun', 'mountains', 'ground', 'plants'].includes(e.type)) ? 'generic' : 'cosmic';
  kinds[k] = (kinds[k] || 0) + 1;
}
console.log(level, n, Object.entries(kinds).map(([k, v]) => `${k}: ${v} (${((v / n) * 100).toFixed(1)}%)`).join(' · '));
