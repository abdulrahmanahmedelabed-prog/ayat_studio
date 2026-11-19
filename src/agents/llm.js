// الوكلاء بالذكاء الاصطناعي (Claude): خمس مراحل متتابعة يتحكم بها الكود،
// وكل مخرَج يمرّ بعدها على التنقية والفحص الآلي في rules.js.
import Anthropic from '@anthropic-ai/sdk';
import { POLICY, TYPE_NAMES, sanitizeScene, checkScene, textBarriers } from './rules.js';

export const DEFAULT_MODEL = 'claude-opus-5-5';
const FALLBACK_OK = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-2'];

const RULES = POLICY.map((p, i) => `${i + 1}. ${p}`).join('\n');

const DSL = `وصف المشهد كائن JSON بهذا الشكل:
{"duration": ثوانٍ (14-36), "horizon": موضع خط الأفق 0.4-0.8 (اختياري),
 "sky": [{"t": ثانية, "mode": "night|dawn|day|dusk|storm|deep"}],
 "elements": [ {"type": ..., "from": ثانية الظهور, "to": ثانية اكتمال الحركة, "until": ثانية الاختفاء (اختياري), ...خصائص} ],
 "camera": [{"t": ثانية, "zoom": 1-2, "x": 0-1, "y": 0-1}] (اختياري: اقتراب هادئ من موضع المعنى),
 "captions": [{"t": ثانية, "text": "شرح قصير"}] }
العناصر تُرسم بترتيب ورودها (الأبعد أولًا). الإحداثيات x,y نسب من 0 إلى 1. الأنواع المتاحة فقط:
- stars | sun {motion: still|rise|set|arc, x, y} | moon {motion, phase: رقم 0-1 أو cycle|wax|wane, row: true لعرض منازل القمر متتابعة}
- clouds {count, dark 0-1, darkTo, gather: true لتتجمع, y, size} | rain {intensity} | lightning | wind {intensity}
- mountains {count, snow, streaks: true لطرائق بيض وحمر, color, roots: true لإظهار امتدادها في الأرض كالوتد, size}
- ground {green 0-1 أو greenFrom/greenTo لتخضرّ مع الزمن, swell 0-1 لتربو, hill 0-1 لربوة, cracks, dryFrom/dryTo لتيبس}
- plants {kind: grass|crop|flowers, count, growFrom, growTo, witherFrom, witherTo, scatter: true لتذروه الرياح}
- tree {kind: broad|palm|olive|vine, x, size, growFrom, growTo, fruit, fruitFrom, roots}
- grain {x, size} حبة تنبت سبع سنابل | sea {y, storm} | twoSeas {barrierFrom} | ship {x0, x1} | river {foam, foamFadeFrom, foamFadeTo}
- bees {x, y, count} خلية ونحل مرموز له بنقاط | web {windFrom, tearFrom, tearTo} بيت عنكبوت | ashes {blowFrom} رماد تذروه الريح
- hail بَرَد | rock {washFrom, washTo} حجر أملس عليه تراب يزيله المطر | shadow {x} ظل يتبع الشمس (ضعه بعد sun و ground) | mirage {fadeFrom, fadeTo} سراب | sprout {kind: grain|stone, x} حبة أو نواة تنفلق | bitter {uprootFrom, uprootTo} شجرة حنظل تُجتث
- orbits أفلاك الشمس والقمر | depths {y} مقطع بحر عميق تتراكم ظلماته | label {text (حتى 4 كلمات), x, y}
لنباتٍ نامٍ منذ البداية استعمل growFrom: -6 و growTo: -1. لا توجد أنواع أخرى، ولا يمكن رسم إنسان أو حيوان أو بناء.`;

const SYSTEM = `أنت عضو في فريق «مَشهَدآية»: استوديو يحوّل معنى الآية القرآنية إلى مشهد متحرك صامت يُفهم بالنظر، لعامة المسلمين ولمن لا يحسن العربية.
المشهد وسيلة إيضاح لمعنى التفسير المعتمد وليس تفسيرًا جديدًا. الضوابط الشرعية الملزِمة للفريق كله:
${RULES}
أجب دائمًا بكائن JSON واحد صالح فقط، بلا أي نص قبله أو بعده وبلا أسوار كود. اكتب القيم النصية بالعربية الفصحى الموجزة.`;

const AGENTS = {
  tafsir: `دورك: «جامع التفسير». يُعطى لك نص الآية ونص التفسير الميسّر لها. لخّص المعنى من النص المعطى، ولا تنسب قولًا إلى مفسّر آخر إلا إن كنت متيقنًا منه، وعلِّمه حينئذ بـ"يُراجَع". لا تجتهد في معنى جديد.
أخرج: {"summary": "المعنى في جملتين", "points": [{"text": "...", "source": "الميسّر | ابن كثير (يُراجَع) ..."}], "kind": "kawni|mathal|qasas|hukm|ghayb|aqida", "visuals": ["المحسوسات التي ذكرتها الآية نفسها مما يصلح للرسم"], "not_visual": ["ما في الآية مما لا يُرسم ولماذا"]}`,
  review: `دورك: «المراجع الشرعي». تقرّر هل يُبنى مشهد لهذه الآية، وما قيوده، بحسب درجة التشدد المعطاة في الطلب (strictness):
- lenient (متساهل جدًا): أجز دائمًا تقريبًا. لا ترفض إلا إذا كان المطلوب رسمه هو ذات الله نفسها. ما لا يُرسم (أشخاص، أنبياء، ملائكة، غيب) ضعه في leave_out وأجز رسم الباقي، وإن لم يبق محسوس فأجز مشهدًا عامًّا هادئًا (سماء وأرض ونور) يرافق التفسير.
- balanced (معتدل): أجز إذا كان في الآية محسوس كوني أو مَثَل، واترك ما لا يُرسم، وارفض إن دار المعنى كله على الغيب أو الصفات.
- strict (متشدد): ارفض عند أي ذكر لنبي أو ملَك أو غيب أو صفة لله، ولا تجز إلا الآيات الكونية الصريحة.
أخرج: {"verdict": "allow|reject", "reasons": ["..."], "constraints": ["قيود على الرسام"], "leave_out": ["ما لا يُرسم من الآية"]}`,
  paint: `دورك: «الرسّام». تؤلّف تكوين المشهد من العناصر المتاحة فقط، ملتزمًا بقيود المراجع، بحيث يطابق كل عنصر محسوسًا ذكرته الآية أو التفسير. لا تزخرف بما ليس في المعنى.
${DSL}
أخرج الآن التكوين الثابت فقط بلا توقيت: {"horizon": ..., "elements": [...], "notes": "سبب اختيار التكوين في جملة"}`,
  animate: `دورك: «المحرّك». تأخذ تكوين الرسّام وتضيف الزمن: متى يظهر كل عنصر ومتى تكتمل حركته، وتحولات السماء، بحيث يتتابع المشهد بترتيب ورود المعاني في الآية ويُفهم دون صوت. ثم اكتب 3 إلى 7 شروح قصيرة (أقل من 14 كلمة) مأخوذة من معنى التفسير، ولا تكتب نص الآية نفسه فيها.
${DSL}
أخرج المشهد الكامل بالشكل الموصوف.`,
  final: `دورك: «المراجع الشرعي» في المراجعة الختامية. أمامك المشهد النهائي وشروحه ودرجة التشدد (strictness). تحقق من أن الشروح لا تخطئ في معنى التفسير المعطى. في الدرجة lenient لا ترفض المشهد: أصلح الشروح واحذف العنصر المخالف فقط. في الدرجات الأخرى طبّق الضوابط كاملة.
أخرج: {"verdict": "approve|revise|reject", "issues": ["..."], "remove_elements": [أرقام فهارس العناصر التي تُحذف], "caption_fixes": [{"index": رقم, "text": "النص المصحَّح"}], "note": "خلاصة في جملة"}`,
};

function parseJSON(text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('لم يُرجع الوكيل JSON صالحًا');
  return JSON.parse(text.slice(a, b + 1));
}

export function makeClient(apiKey) {
  // التطبيق يعمل على جهاز المستخدم بمفتاحه الخاص المخزَّن محليًا، فالاتصال المباشر مقصود.
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
}

async function ask(client, model, role, payload) {
  const base = {
    model, max_tokens: 6000, system: SYSTEM + '\n\n' + AGENTS[role],
    output_config: { effort: 'medium' },
    messages: [{ role: 'user', content: JSON.stringify(payload, null, 1) }],
  };
  let res;
  if (FALLBACK_OK.includes(model)) {
    try {
      res = await client.beta.messages.create({ ...base, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
    } catch (err) {
      if (!(err instanceof Anthropic.BadRequestError)) throw err;
      res = await client.messages.create(base); // المنصة لا تدعم التحويل التلقائي: أعد الطلب بدونه
    }
  } else res = await client.messages.create(base);
  if (res.stop_reason === 'refusal') throw new Error('اعتذر النموذج عن هذا الطلب');
  if (res.stop_reason === 'max_tokens') throw new Error('انقطع ردّ الوكيل قبل اكتماله');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return parseJSON(text);
}

export function explainError(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'مفتاح API غير صحيح. راجعه في الإعدادات.';
  if (err instanceof Anthropic.PermissionDeniedError) return 'المفتاح لا يملك صلاحية استخدام هذا النموذج.';
  if (err instanceof Anthropic.NotFoundError) return 'النموذج المختار غير متاح لهذا المفتاح.';
  if (err instanceof Anthropic.RateLimitError) return 'تجاوزت حدّ الطلبات. انتظر قليلًا ثم أعد المحاولة.';
  if (err instanceof Anthropic.APIConnectionError) return 'تعذّر الاتصال بالخادم. تحقق من الإنترنت.';
  if (err instanceof Anthropic.APIError) return `خطأ من الخادم (${err.status}): ${err.message}`;
  return err?.message || String(err);
}

export async function runLLM({ apiKey, model = DEFAULT_MODEL, refText, verse, clean, tafsir, strictness = 'lenient' }, onStep) {
  const client = makeClient(apiKey), report = { mode: 'ai', model, strictness };
  const ayah = { reference: refText, verse_text: verse, tafsir_muyassar: tafsir, strictness };

  onStep('tafsir', 'run');
  const tf = await ask(client, model, 'tafsir', ayah);
  report.tafsir = { source: 'التفسير الميسّر + تلخيص الوكيل', summary: tf.summary, points: tf.points || [], visuals: tf.visuals || [], notVisual: tf.not_visual || [] };
  onStep('tafsir', 'done', tf.summary);

  onStep('review', 'run');
  const rv = await ask(client, model, 'review', { ...ayah, tafsir_agent: tf, automatic_flags: textBarriers(clean) });
  if (rv.verdict !== 'allow') {
    report.review = { verdict: 'reject', reasons: rv.reasons || [] };
    onStep('review', 'stop', (rv.reasons || []).join(' — '));
    return { ok: false, report };
  }
  onStep('review', 'done', [...(rv.constraints || []), ...(rv.leave_out || []).map((x) => 'يُترك: ' + x)].join(' — ') || 'أُجيز بلا قيود إضافية');

  onStep('paint', 'run');
  const pt = await ask(client, model, 'paint', { ...ayah, meaning: tf, reviewer_constraints: rv });
  onStep('paint', 'done', pt.notes || '');

  onStep('animate', 'run');
  const an = await ask(client, model, 'animate', { ...ayah, meaning: tf, reviewer_constraints: rv, composition: pt });
  let { scene, dropped } = sanitizeScene(an);
  report.paint = { elements: scene.elements.map((e) => TYPE_NAMES[e.type]), notes: pt.notes, dropped };
  report.animate = { duration: scene.duration, beats: scene.captions.length };
  onStep('animate', 'done', `${scene.duration} ثانية، ${scene.captions.length} لقطات`);

  onStep('final', 'run');
  const fin = await ask(client, model, 'final', { ...ayah, scene });
  const rm = new Set((fin.remove_elements || []).filter(Number.isInteger));
  scene.elements = scene.elements.filter((_, i) => !rm.has(i));
  for (const f of fin.caption_fixes || []) if (scene.captions[f.index] && typeof f.text === 'string') scene.captions[f.index].text = f.text.slice(0, 130);
  const checks = checkScene(scene), ok = (fin.verdict !== 'reject' || strictness === 'lenient') && checks.every((c) => c.ok) && scene.elements.length > 0;
  report.review = { verdict: ok ? 'approve' : 'reject', checks, reasons: fin.issues || [], constraints: rv.constraints || [], leaveOut: rv.leave_out || [], note: fin.note };
  onStep('final', ok ? 'done' : 'stop', fin.note || (ok ? 'أُجيز' : 'رُفض المشهد'));
  return { ok, scene: ok ? scene : undefined, report };
}
