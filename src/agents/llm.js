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
- (في الدرجة lenient فقط) person {look: boy|girl|man|woman|farmer|elder|grandma, pose: stand|walk|lookup|cheer|sow|thirsty|pray|give|receive|help|invite, mood: calm|happy|sad|afraid|surprised|angry, mood2 و moodAt لتغيّر الانفعال, says: [{from, to, text, style: speak|shout|whisper}] لقول تذكره الآية أو التفسير فقط, x أو x0,x1 للمشي, size} شخصية أنمي عامة | animal {kind: sheep|cow|camel|goat, x أو x0,x1, graze} | birds {count, y, x0, x1, mode: flap|soar|both} سرب طير. لا تجعل شخصية تمثّل نبيًّا أو ملَكًا أو شخصًا بعينه.
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
- lenient (متساهل): أجز دائمًا تقريبًا. يجوز رسم الناس والأنعام والطير شخصياتٍ عامة. لا ترفض إلا إذا كان المطلوب رسمه هو ذات الله نفسها. الأنبياء والملائكة والغيب ضعها في leave_out وأجز رسم الباقي، وإن لم يبق محسوس فأجز مشهدًا عامًّا هادئًا (سماء وأرض ونور) يرافق التفسير.
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

// ───── مزوّد مجاني: Google Gemini (مفتاح مجاني من Google AI Studio) ─────
export const GEMINI_DEFAULT = 'auto'; // «متكيّف»: يختار التطبيق النموذج لكل وكيل من النماذج المتاحة للمفتاح

// المتكيّف: الأسرع لفهم التفسير والمراجعة، والأدق للرسم والتحريك؛ وعند رفض نموذج أو بلوغ حدّه يُجرَّب التالي
const QUICK = new Set(['tafsir', 'review', 'final']);
const listCache = new Map();
async function candidates(apiKey, role) {
  if (!listCache.has(apiKey)) listCache.set(apiKey, listGeminiModels(apiKey).catch(() => []));
  const list = (await listCache.get(apiKey)).map((m) => m.id).filter((id) => !/preview|exp|tts|image|audio|live|embedding|gemma|learnlm/.test(id));
  const lite = list.filter((id) => /flash-lite/.test(id)), flash = list.filter((id) => /flash/.test(id) && !/lite/.test(id)), pro = list.filter((id) => /pro/.test(id));
  const order = QUICK.has(role) ? [...lite, ...flash, ...pro] : [...flash, ...pro, ...lite];
  return [...new Set([...(QUICK.has(role) ? ['gemini-flash-lite-latest'] : ['gemini-flash-latest']), ...order, 'gemini-flash-lite-latest', 'gemini-flash-latest'])];
}

/** يجلب النماذج المتاحة لهذا المفتاح التي تدعم توليد النص، مرتّبة: Flash-Lite ثم Flash ثم غيرها. */
export async function listGeminiModels(apiKey) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': apiKey } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new GeminiError(r.status, j?.error?.message || r.statusText);
  const rank = (n) => (/flash-lite/.test(n) ? 0 : /flash/.test(n) ? 1 : 2) + (/latest/.test(n) ? -0.5 : 0) + (/preview|exp|tts|image|audio|live|embedding/.test(n) ? 5 : 0);
  return (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent') && /gemini/.test(m.name))
    .map((m) => ({ id: m.name.replace(/^models\//, ''), name: m.displayName || m.name })).sort((a, b) => rank(a.id) - rank(b.id) || b.id.localeCompare(a.id));
}
export class GeminiError extends Error { constructor(status, message) { super(message); this.status = status; } }

async function askGemini(apiKey, model, role, payload) {
  if (model === 'auto') {
    let last;
    for (const m of (await candidates(apiKey, role)).slice(0, 5)) {
      try { const out = await askOne(apiKey, m, role, payload); usedModels.add(m); return out; }
      catch (err) { last = err; if (!(err instanceof GeminiError) || ![404, 429, 503, 500].includes(err.status)) throw err; }
    }
    throw last;
  }
  return askOne(apiKey, model, role, payload);
}
export const usedModels = new Set();

async function askOne(apiKey, model, role, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let r;
  try {
    r = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM + '\n\n' + AGENTS[role] }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload, null, 1) }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 8192, temperature: 0.4 },
      }),
    });
  } catch { throw new GeminiError(0, 'network'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new GeminiError(r.status, j?.error?.message || r.statusText);
  }
  const cand = j.candidates?.[0];
  if (!cand || cand.finishReason === 'SAFETY' || j.promptFeedback?.blockReason) throw new Error('رفض النموذج هذا الطلب');
  if (cand.finishReason === 'MAX_TOKENS') throw new Error('انقطع ردّ الوكيل قبل اكتماله');
  return parseJSON((cand.content?.parts || []).map((p) => p.text || '').join(''));
}

export function explainError(err) {
  if (err instanceof GeminiError) {
    if (err.status === 0) return 'تعذّر الاتصال بخادم Gemini. تحقق من الإنترنت.';
    if (err.status === 400 && /API key/i.test(err.message)) return 'مفتاح Gemini غير صحيح. راجعه في الإعدادات.';
    if (err.status === 403) return 'مفتاح Gemini لا يملك صلاحية هذا النموذج.';
    if (err.status === 404) return 'نموذج Gemini المختار غير متاح. اختر «متكيّف» في الإعدادات ليختار التطبيق نموذجًا متاحًا.';
    if (err.status === 429) return 'تجاوزت حدّ الطلبات المجاني في Gemini. انتظر دقيقة ثم أعد المحاولة.';
    return `خطأ من Gemini (${err.status}): ${err.message}`;
  }
  if (err instanceof Anthropic.AuthenticationError) return 'مفتاح API غير صحيح. راجعه في الإعدادات.';
  if (err instanceof Anthropic.PermissionDeniedError) return 'المفتاح لا يملك صلاحية استخدام هذا النموذج.';
  if (err instanceof Anthropic.NotFoundError) return 'النموذج المختار غير متاح لهذا المفتاح.';
  if (err instanceof Anthropic.RateLimitError) return 'تجاوزت حدّ الطلبات. انتظر قليلًا ثم أعد المحاولة.';
  if (err instanceof Anthropic.APIConnectionError) return 'تعذّر الاتصال بالخادم. تحقق من الإنترنت.';
  if (err instanceof Anthropic.APIError) return `خطأ من الخادم (${err.status}): ${err.message}`;
  return err?.message || String(err);
}

export async function runLLM({ apiKey, model = DEFAULT_MODEL, provider = 'claude', refText, verse, clean, tafsir, strictness = 'lenient' }, onStep) {
  const client = provider === 'claude' ? makeClient(apiKey) : null, report = { mode: 'ai', model, strictness };
  const call = (role, payload) => (provider === 'gemini' ? askGemini(apiKey, model, role, payload) : ask(client, model, role, payload));
  const ayah = { reference: refText, verse_text: verse, tafsir_muyassar: tafsir, strictness };

  onStep('tafsir', 'run');
  const tf = await call('tafsir', ayah);
  report.tafsir = { source: 'التفسير الميسّر + تلخيص الوكيل', summary: tf.summary, points: tf.points || [], visuals: tf.visuals || [], notVisual: tf.not_visual || [] };
  onStep('tafsir', 'done', tf.summary);

  onStep('review', 'run');
  const rv = await call('review', { ...ayah, tafsir_agent: tf, automatic_flags: textBarriers(clean) });
  if (rv.verdict !== 'allow') {
    report.review = { verdict: 'reject', reasons: rv.reasons || [] };
    onStep('review', 'stop', (rv.reasons || []).join(' — '));
    return { ok: false, report };
  }
  onStep('review', 'done', [...(rv.constraints || []), ...(rv.leave_out || []).map((x) => 'يُترك: ' + x)].join(' — ') || 'أُجيز بلا قيود إضافية');

  onStep('paint', 'run');
  const pt = await call('paint', { ...ayah, meaning: tf, reviewer_constraints: rv });
  onStep('paint', 'done', pt.notes || '');

  onStep('animate', 'run');
  const an = await call('animate', { ...ayah, meaning: tf, reviewer_constraints: rv, composition: pt });
  let { scene, dropped } = sanitizeScene(an, strictness);
  report.paint = { elements: scene.elements.map((e) => TYPE_NAMES[e.type]), notes: pt.notes, dropped };
  report.animate = { duration: scene.duration, beats: scene.captions.length };
  onStep('animate', 'done', `${scene.duration} ثانية، ${scene.captions.length} لقطات`);

  onStep('final', 'run');
  const fin = await call('final', { ...ayah, scene });
  const rm = new Set((fin.remove_elements || []).filter(Number.isInteger));
  scene.elements = scene.elements.filter((_, i) => !rm.has(i));
  for (const f of fin.caption_fixes || []) if (scene.captions[f.index] && typeof f.text === 'string') scene.captions[f.index].text = f.text.slice(0, 130);
  const checks = checkScene(scene), ok = (fin.verdict !== 'reject' || strictness === 'lenient') && checks.every((c) => c.ok) && scene.elements.length > 0;
  if (provider === 'gemini' && model === 'auto') report.model = 'متكيّف: ' + [...usedModels].join('، ');
  report.review = { verdict: ok ? 'approve' : 'reject', checks, reasons: fin.issues || [], constraints: rv.constraints || [], leaveOut: rv.leave_out || [], note: fin.note };
  onStep('final', ok ? 'done' : 'stop', fin.note || (ok ? 'أُجيز' : 'رُفض المشهد'));
  return { ok, scene: ok ? scene : undefined, report };
}
