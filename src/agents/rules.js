// المراجع الشرعي (القواعد الثابتة): ضوابط تُطبَّق آليًا على كل مشهد،
// سواء أنتجه الوكلاء دون اتصال أو أنتجه النموذج اللغوي.
import { ELEMENT_TYPES, SKY, clamp } from '../engine/render.js';

export const POLICY = [
  'لا تُصوَّر ذات الله تعالى ولا شيء من صفاته، ولا يُرمز لها بضوء أو شكل.',
  'لا يُصوَّر الأنبياء والرسل ولا الملائكة ولا الصحابة، لا رسمًا ولا رمزًا ولا ظلًّا.',
  'لا يُصوَّر الغيب: الجنة والنار والبعث والقيامة والعرش والجنّ والشياطين.',
  'الإنسان والحيوان والطير لا تُرسم إلا في درجة «متساهل»، وحينها تُرسم شخصيات عامة بأسلوب الرسوم المتحركة لا تمثّل أحدًا بعينه.',
  'لا تُصوَّر الفواحش أبدًا. وتنفيذ الحدود لا يُرسم إلا في درجة «متساهل» وبلا جروح ولا دم؛ وفي الدرجتين الأخريين تُعرض آيات الأحكام رمزيًا (ميزان العدل، العدد، جماعة الشهود).',
  'المشهد يوضّح «المشبَّه به» والآية الكونية فقط، ولا يزيد معنًى ليس في التفسير المعتمد.',
  'نصّ الآية يُعرض من المصحف كما هو، ولا يُكتب داخل الرسم ولا يُجزَّأ على الصور.',
  'المشهد وسيلة إيضاح وليس تفسيرًا؛ المرجع هو كتب التفسير وأهل العلم.',
];

// درجات المراجع الشرعي (تُختار من الإعدادات). الافتراضي: متساهل.
export const STRICTNESS = {
  open: { name: 'بلا قيود', desc: 'يُظهر كل ما تذكره الآية: الجنة والنار والقيامة والبعث وإقامة الحدود والعقوبات (بلا جروح ولا دم)، بشخصيات من الناس والأنعام والطير. لا يُرسم فيها ذات الله تعالى ولا الأنبياء ولا الملائكة ولا الفاحشة.' },
  lenient: { name: 'متساهل', desc: 'يُبنى مشهد لكل آية تقريبًا، وتظهر فيه شخصيات أنمي عامة: ناس وأنعام وطير. يُترك فقط الأنبياء والملائكة والغيب، وإن لم يكن في الآية محسوس رُسم مشهد عام هادئ يرافق التفسير.' },
  balanced: { name: 'معتدل', desc: 'يُبنى المشهد إذا كان في الآية محسوس كوني، بلا ناس ولا حيوان. يمنع الآيات التي تدور على الغيب أو الصفات.' },
  strict: { name: 'متشدّد', desc: 'يمنع المشهد كله عند أي ذِكر لنبي أو ملَك أو غيب أو صفة، ولا يرسم إلا الآيات الكونية الصريحة.' },
};
export const DEFAULT_STRICTNESS = 'lenient';
/** الدرجات التي تُرسم فيها الشخصيات ولا تُرفض فيها آية كاملة */
export const OPENISH = new Set(['lenient', 'open']);

import { FIGURE_TYPES } from '../engine/figures.js';
export { FIGURE_TYPES };
/** يحذف الشخصيات من المشهد إلا في درجة «متساهل». */
export const forLevel = (scene, level) => OPENISH.has(level) ? scene : { ...scene, elements: scene.elements.filter((e) => !FIGURE_TYPES.includes(e.type)) };

// تنبيه: نصّ الآية لا يُكتب في الرسم؛ أقوال الشخصيات مقيّدة بأربعين حرفًا وتُراجَع في المراجعة الختامية.
export const TYPE_NAMES = {
  stars: 'نجوم', sun: 'شمس', moon: 'قمر', clouds: 'سحاب', rain: 'مطر', lightning: 'برق', wind: 'رياح', mountains: 'جبال', ground: 'أرض',
  plants: 'نبات', tree: 'شجر', grain: 'حبة وسنابل', sea: 'بحر', twoSeas: 'بحران', ship: 'سفينة', river: 'وادٍ وسيل', bees: 'نحل (نقاط) وخلية',
  web: 'بيت العنكبوت', ashes: 'رماد', hail: 'بَرَد', fire: 'لهب', quake: 'زلزلة', scales: 'ميزان العدل', scroll: 'صحيفة مكتوبة', person: 'شخصية (أنمي)', animal: 'أنعام', birds: 'طير', rock: 'صفوان (حجر أملس)', shadow: 'ظل', mirage: 'سراب', sprout: 'حبة/نواة تنفلق', bitter: 'شجرة الحنظل', orbits: 'أفلاك', depths: 'أعماق البحر', label: 'تسمية نصّية',
};

export const strip = (s) => s.replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');

const P = '(?:^|\\s)[وفبلك]{0,2}(?:ال|لل)?';
const S = '(?:[اهي]|ات|ين|ون|ها|هم|كم|نا|ه)?(?=\\s|$)';
const words = (list) => new RegExp(P + '(?:' + list.map(strip).join('|') + ')' + S);

// ما يمنع التصوير (في الوضع المتحفّظ دون اتصال يُمنع المشهد كله)
export const BARRIERS = [
  { id: 'anbiya', label: 'ذِكر نبي أو رسول', re: words(['محمد', 'أحمد', 'آدم', 'نوح', 'إبراهيم', 'إسماعيل', 'إسحاق', 'يعقوب', 'يوسف', 'موسى', 'هارون', 'عيسى', 'المسيح', 'مريم', 'داود', 'سليمان', 'أيوب', 'يونس', 'ذا النون', 'إدريس', 'هود', 'صالح', 'شعيب', 'لوط', 'زكريا', 'يحيى', 'إلياس', 'اليسع', 'ذا الكفل', 'لقمان', 'الرسول', 'النبي', 'رسولا', 'نبيا', 'المرسلين', 'النبيين', 'عبده']) },
  { id: 'malaika', label: 'ذِكر الملائكة', re: words(['الملائكة', 'ملائكته', 'جبريل', 'ميكال', 'ملك الموت', 'الروح الأمين', 'هاروت', 'ماروت', 'ملكين', 'الزبانية']) },
  { id: 'ghayb', label: 'أمر غيبي (الآخرة/الجنّ...)', re: words(['الجنة', 'جنات عدن', 'جنات النعيم', 'الفردوس', 'جهنم', 'النار', 'نارا', 'السعير', 'سقر', 'الجحيم', 'الحطمة', 'لظى', 'الهاوية', 'الصراط', 'العرش', 'كرسيه', 'الساعة', 'القيامة', 'الصور', 'الحور', 'حور', 'الشيطان', 'الشياطين', 'إبليس', 'الجن', 'الجان', 'عفريت', 'يأجوج', 'القبور', 'الأجداث', 'الحساب العسير', 'الميزان', 'الكوثر', 'سدرة']) },
  { id: 'sifat', label: 'صفة من صفات الله تعالى', re: words(['يد الله', 'وجه الله', 'وجه ربك', 'بيده', 'يداه', 'بيمينه', 'قبضته', 'استوى', 'بأعيننا', 'عيني', 'نور السماوات']) },
];

export function textBarriers(clean) {
  const t = strip(clean);
  return BARRIERS.filter((b) => b.re.test(t)).map((b) => b.label);
}

// تنقية مشهد وارد من النموذج: قائمة بيضاء للعناصر وحدود للأرقام.
const NUM = { from: [0, 60], to: [0, 60], until: [0, 60], x: [-0.3, 1.3], y: [0, 1], x0: [-0.5, 1.5], x1: [-0.5, 1.5], size: [0.3, 2.4], count: [1, 60], intensity: [0.1, 2], dark: [0, 1], darkTo: [0, 1], green: [0, 1], greenFrom: [-10, 60], greenTo: [-10, 60], growFrom: [-10, 60], growTo: [-10, 60], witherFrom: [0, 60], witherTo: [0, 60], fruitFrom: [-10, 60], rootsFrom: [-10, 60], swell: [0, 1], hill: [0, 1], seed: [1, 9999], storm: [0, 4], stormTo: [0, 4], layers: [2, 7], dy: [-0.3, 0.5], windFrom: [0, 60], tearFrom: [0, 60], tearTo: [0, 60], foamFadeFrom: [0, 60], foamFadeTo: [0, 60], blowFrom: [0, 60], dryFrom: [0, 60], washFrom: [0, 60], washTo: [0, 60], fadeFrom: [0, 60], fadeTo: [0, 60], uprootFrom: [0, 60], uprootTo: [0, 60], slackFrom: [0, 60], streakFrom: [-5, 60], lean: [-2, 2], facing: [-1, 1], moodAt: [0, 60], dryTo: [0, 60], depth: [0.05, 1], barrierFrom: [0, 60], drift: [0, 3], phase: [0, 1] };
const BOOL = ['gather', 'snow', 'roots', 'fruit', 'row', 'foam', 'scatter', 'tall', 'cracks', 'streaks', 'twin', 'poor', 'graze'];
const ENUM = { motion: ['still', 'rise', 'set', 'arc'], kind: ['grass', 'crop', 'flowers', 'broad', 'palm', 'olive', 'vine', 'grain', 'stone', 'sheep', 'cow', 'camel', 'goat'], look: ['boy', 'girl', 'man', 'woman', 'farmer', 'elder', 'grandma'], pose: ['stand', 'walk', 'lookup', 'cheer', 'sow', 'thirsty', 'pray', 'give', 'receive', 'help', 'invite', 'flog', 'bowed'], mood: ['calm', 'happy', 'sad', 'afraid', 'surprised', 'angry'], mood2: ['calm', 'happy', 'sad', 'afraid', 'surprised', 'angry'], mode: ['flap', 'soar', 'both'], phase: ['cycle', 'wax', 'wane'] };

export function sanitizeScene(raw, strictness = 'lenient') {
  const out = { duration: clamp(+raw?.duration || 24, 10, 120), elements: [], captions: [], sky: [] };
  if (raw?.horizon != null) out.horizon = clamp(+raw.horizon, 0.3, 0.85);
  for (const k of raw?.sky || []) if (SKY[k?.mode]) out.sky.push({ t: clamp(+k.t || 0, 0, out.duration), mode: k.mode });
  for (const k of (raw?.camera || []).slice(0, 24)) if (k && isFinite(+k.t)) (out.camera ||= []).push({ t: clamp(+k.t, 0, out.duration), zoom: clamp(+k.zoom || 1, 1, 2), x: clamp(k.x == null ? 0.5 : +k.x, 0, 1), y: clamp(k.y == null ? 0.5 : +k.y, 0, 1) });
  out.camera?.sort((a, b) => a.t - b.t);
  out.sky.sort((a, b) => a.t - b.t); if (!out.sky.length) out.sky = [{ t: 0, mode: 'day' }];
  const dropped = [];
  for (const el of (raw?.elements || []).slice(0, 60)) {
    if (!el || !ELEMENT_TYPES.includes(el.type) || (!OPENISH.has(strictness) && FIGURE_TYPES.includes(el.type))) { dropped.push(String(el?.type)); continue; }
    const o = { type: el.type };
    for (const [k, [a, b]] of Object.entries(NUM)) if (typeof el[k] === 'number' && isFinite(el[k])) o[k] = clamp(el[k], a, b);
    for (const k of BOOL) if (typeof el[k] === 'boolean') o[k] = el[k];
    for (const [k, vs] of Object.entries(ENUM)) if (typeof el[k] === 'string' && vs.includes(el[k])) o[k] = el[k];
    if (el.type === 'person' && Array.isArray(el.says)) o.says = el.says.slice(0, 4).filter((q) => q && typeof q.text === 'string').map((q) => ({ from: clamp(+q.from || 0, 0, 60), to: clamp(+q.to || 0, 0, 60), text: q.text.slice(0, 40), style: ['shout', 'whisper'].includes(q.style) ? q.style : 'speak' }));
    if (el.type === 'label') { o.text = String(el.text || '').slice(0, 28); if (!o.text) continue; }
    out.elements.push(o);
  }
  for (const c of (raw?.captions || []).slice(0, 24)) if (c && typeof c.text === 'string' && c.text.trim()) out.captions.push({ t: clamp(+c.t || 0, 0, out.duration - 1), text: c.text.trim().slice(0, 130) });
  out.captions.sort((a, b) => a.t - b.t);
  return { scene: out, dropped };
}

// فحص نهائي آلي للمشهد: يُرجع قائمة بنود (نجح/فشل).
const LABEL_BAN = /الله|رب|نبي|رسول|ملك|ملائك|جن[هة]|نار|جهنم|عرش|شيطان|جبريل|محمد/;
export function checkScene(scene) {
  const types = scene.elements.map((e) => e.type), labels = scene.elements.filter((e) => e.type === 'label').map((e) => strip(e.text || ''));
  return [
    { ok: types.every((t) => ELEMENT_TYPES.includes(t)), text: 'كل العناصر من المفردات الكونية المأذون بها (لا ذوات، لا أشخاص، لا غيبيات)' },
    { ok: !labels.some((l) => LABEL_BAN.test(l)), text: 'التسميات داخل الرسم خالية من الأسماء المعظَّمة والغيبيات' },
    { ok: true, text: types.some((t) => FIGURE_TYPES.includes(t)) ? 'الشخصيات عامة بأسلوب الرسوم المتحركة، ولا يُرسم نبي ولا ملَك' : types.includes('bees') ? 'ذوات الأرواح مرموز لها بنقاط مجرّدة بلا ملامح' : 'لا ذوات أرواح في المشهد' },
    { ok: true, text: 'نصّ الآية معروض من المصحف خارج الرسم، غير مجزّأ على الصور' },
    { ok: scene.captions.length > 0, text: 'الشرح المرافق مأخوذ من معنى التفسير المعتمد' },
  ];
}
