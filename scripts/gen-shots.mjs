// يولّد لقطات المكتبة السينمائية مرة واحدة ويحفظها في public/cine ليعمل التطبيق بها فورًا ودون إنترنت.
// يتحقق أن كل ملف صورة حقيقية لوصفنا (الخدمة تكتب الوصف في بيانات EXIF) وليس صورة «تجاوزت الحد».
// usage: node scripts/gen-shots.mjs [style=real] [maxShots=4] [onlyIds,...]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { LIBRARY } from '../src/scenes/library.js';
import { shotList, shotUrl, pickShots } from '../src/cinema.js';

const style = process.argv[2] || 'real', max = +(process.argv[3] || 4), only = process.argv[4]?.split(',');
// لقطات رفضها المراجع بالنظر (هيئة توحي بنبي أو ملَك، أو لباس غير محتشم): تُولَّد ببذرة أخرى
const REROLL = JSON.parse(fs.existsSync('scripts/rerolls.json') ? fs.readFileSync('scripts/rerolls.json', 'utf8') : '{}');
const dir = 'public/cine', manPath = `${dir}/manifest.json`;
fs.mkdirSync(dir, { recursive: true });
const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : {};
const sleep = (ms) => execFileSync('sleep', [String(ms / 1000)]);

for (const s of LIBRARY) {
  if (only && !only.includes(s.id)) continue;
  const all = shotList(s, style, s.id), shots = pickShots(all, max), out = [];
  for (const [i, sh] of shots.entries()) sh.seed += 7919 * (REROLL[`${s.id}-${style}-${i}`] || 0); // لقطات رُفضت في المراجعة
  for (const [i, sh] of shots.entries()) {
    const file = `${s.id}-${style}-${i}.jpg`, path = `${dir}/${file}`;
    if (!fs.existsSync(path)) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          execFileSync('curl', ['-sS', '-f', '-m', '120', '-o', path, shotUrl(sh)]);
          const head = fs.readFileSync(path).subarray(0, 4000).toString('latin1');
          if (head.includes('"prompt"')) break; // صورة حقيقية لوصفنا
          fs.rmSync(path, { force: true }); console.log('  limit image, waiting…'); sleep(46000);
        } catch { fs.rmSync(path, { force: true }); sleep(8000); }
      }
      sleep(1500);
    }
    if (fs.existsSync(path)) out.push({ t: sh.t, file }); else console.log('  ✕ failed', file);
  }
  if (out.length) { man[s.id] = { ...(man[s.id] || {}), [style]: out }; fs.writeFileSync(manPath, JSON.stringify(man)); }
  console.log(s.id, out.length + '/' + shots.length);
}
