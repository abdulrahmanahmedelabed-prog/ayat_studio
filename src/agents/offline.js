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

// ───── معاني البشر: أفعال وأقوال وانفعالات (تُرسم في درجة «متساهل» فقط) ─────
export const HUMAN = [
  { id: 'invite', re: w('يدعون', 'تدعون', 'ادع', 'يدعوكم', 'دعاكم', 'دعوتهم', 'يدعو', 'ادعوا'), cap: 'يُدعَون إلى الخير' },
  { id: 'reject', re: w('كفروا', 'فتكفرون', 'تكفرون', 'كذبوا', 'أعرضوا', 'معرضون', 'تولوا', 'توليتم', 'تولى', 'أبوا', 'استكبروا', 'يستكبرون'), cap: 'فيُعرضون ويكفرون' },
  { id: 'call', re: w('ينادون', 'نادى', 'ينادي', 'نادوا', 'يصطرخون', 'صاحوا'), cap: 'يُنادَون' },
  { id: 'regret', re: w('مقت', 'لمقت', 'مقتكم', 'حسرة', 'يا حسرتا', 'ندم', 'النادمين', 'يا ليتنا', 'يا ليتني', 'يا ويلنا', 'الخاسرين', 'خسروا'), cap: 'حسرة ومقت للنفس' },
  { id: 'fear', re: w('يخافون', 'خوف', 'تخافوا', 'فزع', 'خشية', 'يخشون', 'وجلت', 'وجلة'), cap: 'الخوف' },
  { id: 'joy', re: w('يستبشرون', 'فرحين', 'يفرحون', 'مسفرة', 'ضاحكة', 'مستبشرة', 'فرح'), cap: 'الفرح' },
  { id: 'give', re: w('ينفقون', 'أنفقوا', 'تنفقوا', 'الصدقات', 'تصدق', 'المتصدقين', 'وآتى المال', 'يطعمون', 'أطعم', 'الزكاة', 'وآتوا الزكاة'), cap: 'الإنفاق والعطاء' },
  { id: 'needy', re: w('اليتيم', 'اليتامى', 'يتيما', 'المسكين', 'المساكين', 'مسكينا', 'أسيرا', 'ابن السبيل', 'السائلين', 'الفقراء'), cap: 'اليتيم والمسكين' },
  { id: 'parents', re: w('بالوالدين', 'والديه', 'والدي', 'الكبر', 'أف'), cap: 'برّ الوالدين' },
  { id: 'pray', re: w('الصلاة', 'يصلون', 'صلاتهم', 'ركعا', 'سجدا', 'الساجدين', 'الراكعين', 'يقيمون'), cap: 'الصلاة' },
  { id: 'kind', re: w('حسنا', 'قولا كريما', 'قولا معروفا', 'قولا سديدا', 'قولا لينا', 'سلاما'), cap: 'القول الحسن' },
  { id: 'forgive', re: w('الكاظمين', 'الغيظ', 'العافين', 'يعفو', 'اعفوا', 'واصفحوا', 'تعفوا'), cap: 'كظم الغيظ والعفو' },
];

// اللفظ الإملائي من الآية الذي طابقه النمط (لتظليله في المصحف)
function verseWord(clean, re) {
  const cw = clean.split(/\s+/), sw = cw.map(strip);
  for (const n of [1, 2, 3]) for (let i = 0; i < sw.length; i++) { const ph = sw.slice(i, i + n).join(' '); if (ph && re.test(' ' + ph)) { re.lastIndex = 0; return cw.slice(i, i + n).join(' '); } }
  return null;
}
// عبارة قصيرة من الآية بعد كلمة «إلى» أو نحوها، لتقولها الشخصية
function phraseAfter(clean, word) {
  const cw = clean.split(/\s+/), i = cw.findIndex((x) => strip(x) === strip(word));
  return i >= 0 && i + 1 < cw.length ? cw.slice(i, i + 2).join(' ') : null;
}

/** يبني لقطة لكل معنى بشري بترتيب وروده في الآية؛ كل لقطة ٦ ثوانٍ بشخصياتها. */
// ترتيب سردي: الدعوة قبل الإعراض، وعواقب الإعراض (النداء والحسرة) بعده؛ وما سوى ذلك بترتيب الآية
const ORDER = { invite: 0, reject: 1, call: 8, regret: 9 };
function composeHuman(found, clean) {
  if (found.some((b) => b.id === 'reject') && found.some((b) => b.id === 'invite' || b.id === 'call' || b.id === 'regret')) found = [...found].sort((a, b) => (ORDER[a.id] ?? 2 + a.at / 1e4) - (ORDER[b.id] ?? 2 + b.at / 1e4));
  const B = 6, beats = found.slice(0, 6), D = Math.max(18, beats.length * B + 4), E = [], sky = [];
  const dark = beats.some((b) => b.id === 'regret' || b.id === 'fear');
  E.push({ type: 'mountains', count: 3, size: 0.6, seed: 77 }, { type: 'ground', green: 0.5, cracks: false }, { type: 'plants', kind: 'grass', growFrom: -6, growTo: -1, count: 20, depth: 0.3 });
  sky.push({ t: 0, mode: 'day' });
  const caps = [];
  beats.forEach((b, i) => {
    const t0 = 1 + i * B, t1 = t0 + B, win = (el) => ({ ...el, from: t0, until: t1 + 0.4 });
    const q = verseWord(clean, b.re);
    if (b.id === 'invite') {
      const say = phraseAfter(clean, 'إلى') || 'تعالوا';
      E.push(win({ type: 'person', look: 'man', x: 0.3, pose: 'invite', mood: 'happy', says: [{ from: t0 + 0.8, to: t1 - 0.5, text: say }] }),
        win({ type: 'person', look: 'farmer', x: 0.58, seed: 2, mood: 'calm' }), win({ type: 'person', look: 'boy', x: 0.7, seed: 3, mood: 'calm' }));
    } else if (b.id === 'reject') {
      E.push(win({ type: 'person', look: 'man', x: 0.3, pose: 'invite', mood: 'sad' }),
        win({ type: 'person', look: 'farmer', x0: 0.58, x1: 0.95, mood: 'angry', facing: 1, seed: 2 }), win({ type: 'person', look: 'boy', x0: 0.7, x1: 1.05, mood: 'angry', facing: 1, seed: 3 }));
    } else if (b.id === 'call') { // المنادي لا يُرسم (قد يكون ملَكًا أو غيبًا): يظهر المنادَون وحدهم
      sky.push({ t: t0, mode: 'storm' });
      E.push(win({ type: 'person', look: 'farmer', x: 0.42, pose: 'lookup', mood: 'afraid', seed: 2 }), win({ type: 'person', look: 'boy', x: 0.56, pose: 'lookup', mood: 'afraid', seed: 3 }));
    } else if (b.id === 'regret') {
      sky.push({ t: t0, mode: 'dusk' });
      E.push(win({ type: 'person', look: 'farmer', x: 0.4, mood: 'sad', seed: 2 }), win({ type: 'person', look: 'boy', x: 0.55, mood: 'sad', seed: 3 }));
    } else if (b.id === 'fear') {
      sky.push({ t: t0, mode: 'storm' });
      E.push(win({ type: 'person', look: 'man', x: 0.4, mood: 'afraid', seed: 4 }), win({ type: 'person', look: 'woman', x: 0.55, mood: 'afraid', seed: 5 }));
    } else if (b.id === 'joy') {
      sky.push({ t: t0, mode: 'day' });
      E.push(win({ type: 'person', look: 'man', x: 0.38, pose: 'cheer', mood: 'happy', seed: 4 }), win({ type: 'person', look: 'girl', x: 0.52, mood: 'happy', seed: 5 }));
    } else if (b.id === 'give' || b.id === 'needy') {
      E.push(win({ type: 'person', look: 'man', x: 0.36, pose: 'give', mood: 'happy', seed: 4 }),
        win({ type: 'person', look: 'boy', x: 0.52, pose: 'receive', mood: 'calm', mood2: 'happy', moodAt: t0 + 2.5, seed: 6, size: 0.8, facing: -1 }),
        win({ type: 'person', look: 'elder', x: 0.66, pose: 'receive', mood: 'calm', mood2: 'happy', moodAt: t0 + 3, seed: 7, facing: -1 }));
    } else if (b.id === 'parents') {
      E.push(win({ type: 'person', look: 'elder', x0: 0.25, x1: 0.42, pose: 'walk', mood: 'happy', seed: 8 }), win({ type: 'person', look: 'man', x0: 0.32, x1: 0.5, pose: 'help', mood: 'happy', seed: 9 }),
        win({ type: 'person', look: 'grandma', x: 0.64, mood: 'happy', seed: 10, facing: -1, says: q === 'أف' ? [] : [] }));
    } else if (b.id === 'pray') {
      E.push(win({ type: 'person', look: 'man', x: 0.36, pose: 'pray', mood: 'calm', seed: 11 }), win({ type: 'person', look: 'elder', x: 0.5, pose: 'pray', mood: 'calm', seed: 12 }), win({ type: 'person', look: 'boy', x: 0.62, pose: 'pray', mood: 'calm', seed: 13, size: 0.8 }));
    } else if (b.id === 'kind') {
      E.push(win({ type: 'person', look: 'man', x: 0.38, mood: 'happy', seed: 14, says: [{ from: t0 + 0.6, to: t1 - 0.5, text: q || 'قولًا حسنًا' }] }), win({ type: 'person', look: 'farmer', x: 0.56, mood: 'happy', seed: 15, facing: -1 }));
    } else if (b.id === 'forgive') {
      E.push(win({ type: 'person', look: 'farmer', x: 0.36, mood: 'angry', mood2: 'calm', moodAt: t0 + 3, seed: 16 }), win({ type: 'person', look: 'man', x: 0.54, mood: 'sad', mood2: 'happy', moodAt: t0 + 3.5, seed: 17, facing: -1 }));
    }
    caps.push({ t: +t0.toFixed(1), text: b.cap, q });
  });
  // السماء تتغيّر عند بداية اللقطة لا بالتدريج من أول المشهد؛ والكاميرا تقترب من الشخصيات في كل لقطة
  const sk = []; let prev = 'day';
  for (const k of sky.sort((a, b) => a.t - b.t)) { if (k.t > 0) sk.push({ t: k.t - 0.8, mode: prev }); sk.push(k); prev = k.mode; }
  const camera = beats.flatMap((_, i) => [{ t: 1 + i * B, zoom: 1.05, x: 0.47, y: 0.58 }, { t: 1 + i * B + B - 0.3, zoom: 1.3, x: 0.47, y: 0.6 }]);
  return { duration: D, sky: sk, camera, elements: E, captions: caps };
}

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
    if (!visual) notes.push('لا محسوس كوني صريح في الآية: يُرسم معناها بشخصيات إن كان فيها فعل أو قول أو انفعال، وإلا فمشهد عام يرافق التفسير');
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
  // معاني البشر في الآية (بترتيب ورودها): تُبنى لها لقطات بشخصيات، إن لم يكن فيها مشهد كوني أوضح
  const st = strip(clean), hum = strictness === 'lenient' ? HUMAN.map((hc) => { hc.re.lastIndex = 0; const m = hc.re.exec(st); return m ? { ...hc, at: m.index } : null; }).filter(Boolean).sort((x, y) => x.at - y.at) : [];
  if (hum.length && (calm || hum.length >= ids.filter((x) => x !== 'earth').length)) {
    const scene = composeHuman(hum, clean);
    report.paint = { elements: scene.elements.map((e) => TYPE_NAMES[e.type]) };
    onStep('paint', 'done', 'لقطات بشرية: ' + hum.map((x) => x.cap).join('، '));
    onStep('animate', 'run'); await wait(300);
    scene.captions.push({ t: scene.duration - 3.5, text: 'مشهد تقريبي آلي — المعنى الكامل في التفسير أسفل المشهد' });
    report.animate = { duration: scene.duration, beats: scene.captions.length };
    onStep('animate', 'done', `${scene.duration} ثانية، ${scene.captions.length} لقطات`);
    onStep('final', 'run'); await wait(200);
    const checks = checkScene(scene);
    report.review = { ...report.review, verdict: 'approve', checks, reasons: [] };
    onStep('final', 'done', 'اجتاز الفحص الآلي للضوابط');
    return { ok: true, scene, report };
  }
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
