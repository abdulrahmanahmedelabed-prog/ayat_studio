// الوكلاء دون اتصال: خط إنتاج بالقواعد يعمل بلا إنترنت ولا مفتاح.
// متحفّظ عمدًا: أي آية فيها ذِكر نبي أو ملَك أو غيب أو صفة لا يُبنى لها مشهد.
import { strip, textBarriers, checkScene, TYPE_NAMES } from './rules.js';

const P = '(?:^|\\s)[وفبلك]{0,2}(?:ال|لل)?', S = '(?:[اهي]|ات|ين|ون|ها|هم|كم|نا|ه)?(?=\\s|$)';
const w = (...l) => new RegExp(P + '(?:' + l.map(strip).join('|') + ')' + S);
export const CONCEPTS = [
  { id: 'night', re: w('الليل', 'ليلا', 'غسق', 'مظلمون'), cap: 'الليل بظلامه' },
  { id: 'day', re: w('النهار', 'نهارا', 'الضحى', 'الصبح', 'الفجر', 'الإصباح'), cap: 'النهار بضيائه' },
  { id: 'sun', re: w('الشمس', 'سراجا'), cap: 'الشمس' },
  { id: 'moon', re: w('القمر', 'الأهلة'), cap: 'القمر' },
  { id: 'stars', re: w('النجوم', 'النجم', 'الكواكب', 'كوكب', 'مصابيح', 'بروجا', 'البروج'), cap: 'النجوم' },
  { id: 'wind', re: w('الرياح', 'الريح', 'ريح', 'عاصف'), cap: 'الرياح' },
  { id: 'clouds', re: w('سحاب', 'السحاب', 'سحابا', 'الغمام', 'المزن', 'المعصرات'), cap: 'السحاب' },
  { id: 'rain', re: w('من السماء ماء', 'ماء مباركا', 'ماء طهورا', 'ماء ثجاجا', 'الغيث', 'غيث', 'وابل', 'الودق', 'صيب', 'مطر', 'أنزلنا عليها الماء', 'فأنزلنا به الماء'), cap: 'نزول الماء من السماء' },
  { id: 'mountains', re: w('الجبال', 'جبال', 'الجبل', 'رواسي', 'أوتادا', 'الطور'), cap: 'الجبال الرواسي' },
  { id: 'sea', re: w('البحر', 'بحر', 'البحرين', 'البحار', 'اليم', 'موج'), cap: 'البحر' },
  { id: 'ship', re: w('الفلك', 'السفينة', 'الجوار', 'الجواري'), cap: 'السفن الجارية في البحر' },
  { id: 'river', re: w('الأنهار', 'أنهارا', 'نهرا', 'أودية', 'عيونا', 'ينابيع'), cap: 'الماء الجاري في الأرض' },
  { id: 'dead', re: w('ميتا', 'ميت', 'الميتة', 'هامدة', 'خاشعة', 'بعد موتها'), cap: 'الأرض الميتة اليابسة' },
  { id: 'plants', re: w('نبات', 'نباتا', 'الزرع', 'زرعا', 'زرع', 'حبا', 'الحب', 'خضرا', 'المرعى', 'أبا', 'قضبا', 'فأنبتنا', 'أنبتنا', 'ينبت', 'تنبت', 'مخضرة', 'اهتزت'), cap: 'خروج النبات' },
  { id: 'trees', re: w('الشجر', 'شجر', 'شجرة', 'النخل', 'النخيل', 'نخلا', 'نخيل', 'الزيتون', 'زيتونا', 'الأعناب', 'أعناب', 'عنبا', 'الرمان', 'الثمرات', 'ثمرات', 'فاكهة', 'جنات', 'حدائق'), cap: 'الشجر والثمار' },
  { id: 'bees', re: w('النحل'), cap: 'النحل وبيوتها' },
  { id: 'web', re: w('العنكبوت'), cap: 'بيت العنكبوت' },
  { id: 'birds', re: w('الطير', 'طيرا', 'طائر', 'صافات'), cap: 'الطير في جوّ السماء', fig: true },
  { id: 'cattle', re: w('الأنعام', 'أنعامكم', 'الإبل', 'البقر', 'بقرة', 'الغنم', 'الضأن', 'المعز', 'تسيمون', 'دابة', 'الدواب'), cap: 'الأنعام', fig: true },
  { id: 'people', re: w('الناس', 'الإنسان', 'للناس', 'عباده', 'لعباده', 'للعباد'), cap: 'الناس', fig: true },
  { id: 'earth', re: w('الأرض'), cap: 'الأرض' },
];

export function detect(clean) {
  const t = strip(clean), found = [];
  for (const c of CONCEPTS) { const m = c.re.exec(t); if (m) found.push({ ...c, at: m.index }); }
  return found.sort((a, b) => a.at - b.at);
}

function compose(ids, level = 'lenient') {
  const has = (x) => ids.includes(x), D = 24, E = [], sky = [];
  const water = has('sea') || has('ship'), wet = has('rain'), grow = has('plants') || has('trees') || has('dead');
  const night = has('night') || ((has('moon') || has('stars')) && !has('sun') && !has('day'));
  if (has('night') && has('day')) sky.push({ t: 0, mode: 'day' }, { t: 8, mode: 'dusk' }, { t: 13, mode: 'night' });
  else if (night) sky.push({ t: 0, mode: 'night' });
  else if (wet) sky.push({ t: 0, mode: 'day' }, { t: 5, mode: 'storm' }, { t: 12, mode: 'storm' }, { t: 17, mode: 'day' });
  else sky.push({ t: 0, mode: 'day' });
  if (night || has('stars') || (has('night') && has('day'))) E.push({ type: 'stars', from: has('day') ? 11 : 0 });
  if (has('sun') || (!night && !wet)) E.push(has('night') && has('day') ? { type: 'sun', motion: 'set', x0: -0.3, x1: 0.9, to: 11, until: 11.5 } : { type: 'sun', motion: 'rise', x0: 0.1, x1: 0.5, to: D });
  if (has('moon')) E.push(night && !has('day') ? { type: 'moon', row: true, from: 2, to: 14 } : { type: 'moon', motion: 'rise', phase: 'wax', from: has('day') ? 12 : 0 });
  if (has('mountains') && !water) E.push({ type: 'mountains', count: 3 });
  if (water) { E.push({ type: 'sea', y: 0.5 }); if (has('mountains')) E.unshift({ type: 'mountains', count: 3, size: 0.7 }); }
  else E.push({ type: 'ground', ...(wet && grow ? { greenFrom: 10, greenTo: 18, swell: has('dead') ? 0.8 : 0.3 } : { green: grow ? 0.7 : 0.35, cracks: has('dead') }) });
  if (has('clouds') || wet) E.push({ type: 'clouds', gather: true, from: 2, to: 6, count: 6, dark: 0.15, darkTo: wet ? 0.75 : 0.15, until: wet ? 16 : undefined });
  if (has('wind')) E.push({ type: 'wind', from: 1, until: wet ? 9 : undefined });
  if (wet) E.push({ type: 'rain', from: 6, until: 13 });
  if (has('ship')) E.push({ type: 'ship', x0: 0.1, x1: 0.8, dy: 0.12 });
  if (!water) {
    if (has('river')) E.push({ type: 'river', from: wet ? 8 : 0, to: wet ? 14 : 4 });
    const g0 = wet ? 10.5 : -6, g1 = wet ? 18 : -1;
    if (has('plants') || has('dead') || has('bees')) E.push({ type: 'plants', kind: has('bees') ? 'flowers' : 'grass', growFrom: g0, growTo: g1, count: 38 });
    if (has('trees')) E.push({ type: 'tree', x: 0.22, growFrom: g0 + 1, growTo: g1 + 2, fruit: true, fruitFrom: g1 + 2 }, { type: 'tree', kind: 'palm', x: 0.72, size: 1.1, growFrom: g0 + 2, growTo: g1 + 3, fruit: true, fruitFrom: g1 + 3 });
    if (has('bees')) E.push({ type: 'bees', from: 1, to: 20 });
    if (has('web')) E.push({ type: 'web', windFrom: 10, tearFrom: 13, tearTo: 20 });
  }
  if (level === 'lenient') {
    if (has('birds')) E.push({ type: 'birds', count: 7, y: 0.2, x0: -0.1, x1: 1.05, mode: 'both', from: 1, to: D - 1 });
    if (has('cattle') && !water) E.push({ type: 'animal', kind: 'sheep', x: 0.62, graze: true }, { type: 'animal', kind: 'camel', x0: 0.98, x1: 0.8, from: 2, to: 9 }, { type: 'animal', kind: 'cow', x: 0.45, size: 0.9, graze: true, seed: 3 });
    if (has('people') && !water) E.push({ type: 'person', look: 'man', x0: 0.05, x1: 0.24, pose: wet ? 'cheer' : 'walk', from: 0, to: 6 }, { type: 'person', look: 'girl', x: 0.32, pose: wet || has('sun') || night ? 'lookup' : 'stand', seed: 2 });
  }
  return { duration: D, sky, elements: E.map((e) => Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined))) };
}

// يقسّم التفسير إلى جمل قصيرة تُعرض لقطاتٍ على المشهد العام
function tafsirBeats(tafsir, D) {
  const parts = (tafsir || '').split(/[.،؛:؟!]\s+/).map((x) => x.trim()).filter((x) => x.length > 8).slice(0, 5);
  return parts.map((text, i) => ({ t: +(1 + (i * (D - 7)) / Math.max(1, parts.length)).toFixed(1), text: text.length > 120 ? text.slice(0, 117) + '…' : text }));
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// يُرجع { ok, scene?, report } ويُبلغ عن كل مرحلة عبر onStep(id, state, detail)
export async function runOffline({ clean, tafsir, strictness = 'lenient' }, onStep) {
  const report = { mode: 'offline', strictness };
  onStep('tafsir', 'run'); await wait(350);
  const found = detect(clean);
  report.tafsir = { source: 'التفسير الميسّر (مجمع الملك فهد)', summary: tafsir, visuals: found.map((f) => f.cap) };
  onStep('tafsir', 'done', found.length ? `مفاهيم مرئية: ${found.map((f) => f.cap).join('، ')}` : 'لا مفاهيم كونية مرئية في الآية');

  onStep('review', 'run'); await wait(350);
  const barriers = textBarriers(clean), visual = found.filter((f) => f.id !== 'earth' && !f.fig).length > 0;
  const allowed = strictness === 'lenient' || (visual && (strictness === 'balanced' ? !barriers.some((b) => /غيبي|صفة/.test(b)) : !barriers.length));
  if (allowed) {
    const notes = barriers.map((b) => `يُترك من المشهد: ${b}`);
    if (!visual) notes.push('لا محسوس كوني صريح في الآية: يُرسم مشهد عام هادئ يرافق التفسير');
    report.review = { verdict: 'allow', leaveOut: notes };
    onStep('review', 'done', notes.join(' — ') || 'لا موانع: الآية في مشهد كوني محسوس');
  } else {
    const reasons = barriers.length ? barriers.map((b) => `في الآية ${b}`) : ['ليس في الآية مشهد كوني محسوس يصحّ رسمه (حُكم أو خبر أو غيب)'];
    report.review = { verdict: 'reject', reasons, note: 'المراجع دون اتصال متحفّظ: يمنع المشهد كله عند أي شبهة.' };
    onStep('review', 'stop', reasons.join(' — '));
    return { ok: false, report };
  }

  onStep('paint', 'run'); await wait(400);
  const ids = found.filter((f) => !f.fig || strictness === 'lenient').map((f) => f.id), calm = !ids.some((x) => x !== 'earth');
  const scene = compose(calm ? ['day', 'plants', 'mountains'] : ids, strictness);
  report.paint = { elements: scene.elements.map((e) => TYPE_NAMES[e.type]) };
  onStep('paint', 'done', [...new Set(report.paint.elements)].join('، '));

  onStep('animate', 'run'); await wait(400);
  const caps = found.filter((f) => (f.id !== 'earth' || found.length === 1) && (!f.fig || strictness === 'lenient'));
  scene.captions = calm ? tafsirBeats(tafsir, scene.duration) : caps.map((f, i) => ({ t: +(1 + (i * (scene.duration - 7)) / Math.max(1, caps.length)).toFixed(1), text: f.cap }));
  scene.captions.push({ t: scene.duration - 4.5, text: 'مشهد تقريبي آلي — المعنى الكامل في التفسير أسفل المشهد' });
  report.animate = { duration: scene.duration, beats: scene.captions.length };
  onStep('animate', 'done', `${scene.duration} ثانية، ${scene.captions.length} لقطات`);

  onStep('final', 'run'); await wait(300);
  const checks = checkScene(scene);
  report.review = { ...report.review, verdict: checks.every((c) => c.ok) ? 'approve' : 'reject', checks, reasons: [] };
  onStep('final', checks.every((c) => c.ok) ? 'done' : 'stop', 'اجتاز الفحص الآلي للضوابط');
  return { ok: checks.every((c) => c.ok), scene, report };
}
