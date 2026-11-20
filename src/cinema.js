// الوضع السينمائي: لكل لقطة صورة تولّدها خدمة مجانية (Pollinations، بلا مفتاح) من وصف يُبنى
// من عناصر المشهد نفسه — لا من نص الآية — ثم تُحرَّك بحركة كاميرا بطيئة وانتقالات ومعالجة لونية،
// ويُرسم فوقها المطر والبرق والريح من المحرّك. إن توفّر مفتاح Claude يراجع المراجعُ الشرعي كل صورة.
import { drawScene } from './engine/render.js';

// الصور تُعرض كعناصر صورة عادية كما توثّق الخدمة (الطلبات عبر CORS تتطلب تحققًا من الخدمة)،
// فلا يمكن قراءة بكسلاتها: تُعرض في المشغّل، والفيديو المحفوظ يُسجَّل بالرسوم.

const API = 'https://image.pollinations.ai/prompt/';
export const STYLES = {
  real: { name: 'سينمائي واقعي', suffix: 'cinematic film still, photorealistic, 35mm film, dramatic natural lighting, highly detailed, epic wide composition' },
  anime: { name: 'سينمائي أنمي', suffix: 'anime feature film still, high quality 2D hand-drawn anime, cinematic composition, dramatic volumetric lighting, detailed painted background, expressive detailed faces, historical Arabian setting, film grain' },
};
// قيود ثابتة في كل وصف: لا ملائكة ولا أجنحة على بشر ولا هالات ولا شخصيات دينية، ولباس محتشم
export const LOOKOPTS = { grain: true, letterbox: true, intensity: 'dramatic' };
const INTENSE = { calm: 'calm peaceful atmosphere', dramatic: 'cinematic atmosphere', intense: 'intense dramatic action, raw emotion, storm and fire, battle tension, no blood, no gore, no wounds' };
export const SAFE = 'no text, no angels, no winged humans, no halos, no religious figures, no prophets';
export const SAFE_PEOPLE = 'ordinary humans only, modest traditional Arab clothing with long sleeves, women wearing hijab';
const NOPEOPLE = 'empty landscape, no people, no humans, no person, no figure, no face';
const OVERLAY = ['rain', 'hail', 'lightning'];

const SKY = { night: 'at night under a starry sky', dawn: 'at sunrise, golden hour', day: 'in bright daylight, blue sky', dusk: 'at sunset, warm dusk light', storm: 'under a dark stormy sky', deep: 'in the deep dark ocean' };
const LOOK = { king: 'an arrogant ancient king with a golden crown, black beard and red robe', elder: 'an elderly Arab man with a long white beard, white turban and grey cloak, leaning on a wooden cane', grandma: 'an elderly woman in a lavender hijab and dark abaya, leaning on a cane', man: 'a 35-year-old Arab man with a short black beard, white thobe and white shemagh with black agal', woman: 'a young woman in a navy blue hijab and long abaya', girl: 'a 9-year-old girl in a light lilac hijab and pink dress', boy: 'a 10-year-old Arab boy with short black hair and a blue tunic', farmer: 'a 40-year-old Arab farmer with a black beard, wide straw hat and brown work tunic' };
const MOOD = { happy: 'joyful and smiling', sad: 'sad with tears in his eyes', afraid: 'terrified, trembling', surprised: 'shocked, mouth open in disbelief', angry: 'angry, frowning', calm: 'calm' };
const POSE = { read: 'reading a book attentively', eat: 'eating dates and bread', proud: 'walking arrogantly with chin raised', sleep: 'sleeping peacefully', pray: 'standing in prayer', give: 'giving food to someone in need', receive: 'receiving food gratefully', help: 'gently helping an elderly person', invite: 'kindly inviting others with an open hand', lookup: 'looking up at the sky in wonder', walk: 'walking', sow: 'sowing seeds by hand', cheer: 'raising both hands with joy', thirsty: 'exhausted and thirsty, dragging his feet', stand: '' };

const live = (el, t) => (el.from ?? 0) <= t + 0.6 && (el.until == null || el.until > t) && (el.growFrom == null || el.growFrom <= t + 1);

function describe(scene, t) {
  const els = scene.elements.filter((e) => live(e, t)), out = [], subj = [], has = (ty) => els.filter((e) => e.type === ty);
  for (const g of has('ground')) {
    const green = g.greenFrom != null ? (t >= g.greenFrom ? 1 : 0) : g.green ?? 0, dry = g.dryFrom != null && t >= g.dryFrom;
    out.push(dry ? 'dry yellowed land' : green > 0.55 ? 'lush green land' : green < 0.2 ? 'dry cracked barren earth' : 'open land');
    if (g.hill) out.push('a garden on a high hill');
  }
  for (const m of has('mountains')) out.push(m.streaks ? 'mountains with white and red streaks beside pitch-black mountains' : m.roots ? 'great mountains firmly rooted into the earth' : m.snow ? 'snow-capped mountains' : 'mountains on the horizon');
  for (const c of has('clouds')) out.push((c.darkTo ?? c.dark ?? 0) > 0.5 ? 'heavy dark rain clouds piling up' : 'white clouds');
  if (has('rain').length) out.push('heavy rain falling');
  if (has('hail').length) out.push('hailstones falling from huge clouds');
  if (has('lightning').length) out.push('a brilliant lightning flash');
  if (has('wind').length) out.push('strong wind blowing');
  if (has('sun').length) out.push('the sun');
  for (const m of has('moon')) out.push(m.row ? 'phases of the moon from thin crescent to full moon' : 'the moon');
  if (has('stars').length) out.push('countless stars');
  if (has('orbits').length) out.push('the sun and the moon each in its own orbit, long exposure trails');
  for (const p of has('plants')) {
    const w = p.witherFrom != null && t >= p.witherFrom;
    out.push(w ? 'withered dry broken crops blown by wind' : p.kind === 'crop' ? 'wheat and barley fields' : p.kind === 'flowers' ? 'colorful wildflowers' : 'fresh green grass');
  }
  for (const tr of has('tree')) out.push({ palm: 'tall date palm trees', olive: 'olive trees', vine: 'grapevines heavy with grapes', broad: 'fruit trees' }[tr.kind || 'broad'] + (tr.fruit && t >= (tr.fruitFrom ?? 0) ? ' laden with fruit' : ''));
  if (has('grain').length) subj.push('macro shot of a single grain of wheat sprouting into seven ears of wheat, each full of grains');
  if (has('sprout').length) subj.push('macro shot of a seed and a date pit splitting open and sprouting under the soil');
  for (const s of has('sea')) out.push((s.storm ?? 1) > 1.2 ? 'a stormy sea with high waves' : 'a calm sea');
  if (has('twoSeas').length) subj.push('two seas meeting, one deep blue salty and one turquoise fresh, with a visible boundary line between them');
  if (has('depths').length) subj.push('dark deep ocean with layers of waves above waves, darkness upon darkness');
  if (has('ship').length) subj.push('large wooden sailing ships like mountains on the sea');
  for (const r of has('river')) out.push(r.foam && t < (r.foamFadeTo ?? 99) ? 'a flash flood rushing through a valley carrying foam' : 'a river flowing through a valley');
  if (has('bees').length) subj.push('honeybees flying to a honeycomb in a mountain cliff');
  if (has('web').length) subj.push(t >= (has('web')[0].tearFrom ?? 99) ? 'a fragile spider web torn apart by wind' : 'a fragile spider web close-up');
  if (has('ashes').length) subj.push('a pile of grey ashes scattered by a violent wind');
  if (has('rock').length) subj.push(t >= (has('rock')[0].washTo ?? 99) ? 'a smooth bare rock washed clean by rain' : 'a smooth rock covered with a thin layer of dust');
  if (has('shadow').length) subj.push('the long shadow of a tree stretching across the ground');
  if (has('mirage').length) subj.push(t >= (has('mirage')[0].fadeTo ?? 99) ? 'empty flat desert, no water' : 'a shimmering mirage that looks like water on the flat desert');
  if (has('bitter').length) subj.push('a bitter colocynth plant torn out of the ground by its shallow roots');
  for (const b of has('birds')) subj.push(b.mode === 'soar' ? 'a flock of birds gliding with wings outspread' : 'a flock of birds flying');
  const kinds = [...new Set(has('animal').map((a) => a.kind))];
  if (kinds.length) subj.push(kinds.map((k) => ({ sheep: 'sheep', cow: 'cows', camel: 'camels', goat: 'goats' }[k])).join(' and ') + ' grazing');
  for (const p of has('person').slice(0, 2)) {
    const mood = p.moodAt != null && t >= p.moodAt ? p.mood2 : p.mood, line = (p.says || []).find((q) => t >= q.from - 0.5 && t < q.to);
    subj.unshift([LOOK[p.look || 'boy'], POSE[p.pose || 'stand'], mood && mood !== 'calm' ? MOOD[mood] : '', line?.style === 'shout' ? 'shouting' : line?.style === 'whisper' ? 'whispering' : line ? 'speaking' : ''].filter(Boolean).join(', '));
  }
  const sk = (scene.sky || []).filter((k) => k.t <= t).pop();
  return [...new Set([...subj, ...out])].join(', ') + (sk ? ', ' + SKY[sk.mode] : '');
}

const hash = (s) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) % 1e6; };

/** لقطات المشهد: واحدة لكل شرح (وأولها عند الصفر). */
export function shotList(scene, style = 'real', key = '') {
  if (scene.shots?.length) // أوصاف مكتوبة يدويًا للمشهد
    return scene.shots.map((sh, i, arr) => ({ t: sh.t, prompt: `${sh.prompt}. ${STYLES[style].suffix}, ${INTENSE[LOOKOPTS.intensity] || ''}, ${SAFE}, ${sh.people ? SAFE_PEOPLE : NOPEOPLE}`, seed: hash(key + ':' + i + ':' + style), end: arr[i + 1]?.t ?? scene.duration }));
  const times = [...new Set([0, ...scene.captions.map((c) => c.t)])].sort((a, b) => a - b);
  return times.map((t, i) => {
    // لا شخص في اللقطة: يُطلب صراحةً ألّا يظهر أحد (المولّد يضيف أشخاصًا من عنده أحيانًا)
    const people = scene.elements.some((e) => e.type === 'person' && live(e, t + 0.8));
    // لغة إخراجية: انفعال واضح → لقطة قريبة على الوجه؛ أول لقطة عامة تأسيسية؛ ثم تنويع الزوايا
    const emo = scene.elements.some((e) => e.type === 'person' && live(e, t + 0.8) && ((e.moodAt != null && t + 0.8 >= e.moodAt ? e.mood2 : e.mood) || 'calm') !== 'calm');
    const frame = !people ? (i === 0 ? 'epic wide establishing shot' : ['wide shot', 'low-angle wide shot', 'aerial view'][i % 3])
      : emo ? 'cinematic close-up on the face showing strong emotion' : i === 0 ? 'wide establishing shot' : ['medium shot', 'over-the-shoulder shot', 'low-angle medium shot'][i % 3];
    const prompt = `${STYLES[style].suffix}, ${INTENSE[LOOKOPTS.intensity] || ''}, ${frame}, ${describe(scene, t + 0.8)}${people ? '' : ', empty landscape, nobody'}. ${SAFE}, ${people ? SAFE_PEOPLE : NOPEOPLE}`;
    return { t, prompt, seed: hash(key + ':' + i + ':' + style), end: times[i + 1] ?? scene.duration };
  });
}
/** يختار حتى max لقطات: يُسقط كل مرة اللقطة الأقرب وصفًا إلى سابقتها، فتبقى لحظات تغيّر المعنى. */
export function pickShots(shots, max) {
  const words = (s) => new Set(s.prompt.toLowerCase().match(/[a-z]+/g));
  const sim = (a, b) => { const A = words(a), B = words(b); let n = 0; for (const w of A) if (B.has(w)) n++; return n / (A.size + B.size - n); };
  const out = [...shots];
  while (out.length > max) { let k = 1, best = -1; for (let i = 1; i < out.length; i++) { const v = sim(out[i - 1], out[i]); if (v > best) { best = v; k = i; } } out.splice(k, 1); }
  return out.map((s, i) => ({ ...s, end: out[i + 1]?.t ?? shots[shots.length - 1].end }));
}
export const shotUrl = (s, w = 1280, h = 720) => `${API}${encodeURIComponent(s.prompt)}?width=${w}&height=${h}&nologo=true&seed=${s.seed}`;

function loadImg(url, timeout = 60000) {
  return new Promise((ok, bad) => {
    const im = new Image(); im.decoding = 'async';
    const tmr = setTimeout(() => bad(new Error('timeout')), timeout);
    im.onload = () => { clearTimeout(tmr); ok(im); }; im.onerror = () => { clearTimeout(tmr); bad(new Error('img')); };
    im.src = url;
  });
}

let grain = null;
function grainTile() {
  if (grain) return grain;
  grain = document.createElement('canvas'); grain.width = grain.height = 160;
  const g = grain.getContext('2d'), d = g.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 16; }
  g.putImageData(d, 0, 0); return grain;
}

// Hugging Face (رمز مجاني من huggingface.co/settings/tokens): صور FLUX تُجلب بالرمز فتدخل في الفيديو، وبلا انتظار ٤٦ ثانية
export const HF = { token: '', model: 'black-forest-labs/FLUX.1-schnell' };
export async function hfImage(prompt, seed) {
  const r = await fetch(`https://router.huggingface.co/hf-inference/models/${HF.model}`, { method: 'POST',
    headers: { authorization: `Bearer ${HF.token}`, 'content-type': 'application/json', accept: 'image/jpeg' },
    body: JSON.stringify({ inputs: prompt, parameters: { width: 1024, height: 576, seed: seed % 2147483647 } }) });
  if (!r.ok) { const e = new Error(r.status === 402 ? 'نفد رصيد Hugging Face المجاني لهذا الشهر' : `Hugging Face: ${r.status}`); e.status = r.status; throw e; }
  return loadImg(URL.createObjectURL(await r.blob()));
}

// Gemini (نفس مفتاح الوكلاء): نماذج الصور مثل gemini-*-flash-image، جودة سينمائية عالية؛ تدخل في الفيديو
export const GEM = { key: '', model: '' };
async function gemImageModel() {
  if (GEM.model) return GEM.model;
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': GEM.key } });
  const ids = ((await r.json()).models || []).filter((m) => /image/.test(m.name) && (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace('models/', ''));
  if (!ids.length) throw new Error('مفتاح Gemini لا يتيح نموذج صور');
  return (GEM.model = ids.sort((a, b) => (/preview|exp/.test(a) - /preview|exp/.test(b)) || b.localeCompare(a))[0]);
}
export async function gemImage(prompt) {
  const model = await gemImageModel();
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: 'POST', headers: { 'x-goog-api-key': GEM.key, 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Generate one 16:9 image: ' + prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } } }) });
  if (!r.ok) throw new Error(r.status === 429 ? 'نفدت حصة صور Gemini المجانية اليوم' : `Gemini صور: ${r.status}`);
  const part = (await r.json()).candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('لم يُرجع Gemini صورة (ربما حجبها مرشّح الأمان)');
  return loadImg(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
}

export class Cinema {
  constructor(scene, style, key, bundled) {
    this.scene = scene; this.ready = 0;
    if (bundled?.length) { // لقطات مولَّدة مسبقًا ومراجَعة، مضمَّنة في التطبيق: فورية ودون إنترنت وتدخل في الفيديو
      this.local = true; this.recordable = true;
      this.shots = bundled.map((b, i, arr) => ({ t: b.t, src: b.src || './cine/' + b.file, end: arr[i + 1]?.t ?? scene.duration }));
    } else { this.local = false; this.gem = !!GEM.key; this.hf = !!HF.token; this.recordable = this.gem || this.hf; this.shots = shotList(scene, style, key); }
  }
  /** المضمَّنة تُحمَّل معًا؛ المولَّدة مباشرة تُطلب واحدة كل ٤٦ ثانية (حدّ الخدمة المجانية). */
  async load(onProgress, review, onFirst) {
    if (this.local) {
      await Promise.all(this.shots.map((s) => loadImg(s.src).then((im) => { s.img = im; }).catch(() => {})));
      this.ready = this.shots.filter((s) => s.img).length; onProgress?.(this.ready, this.shots.length); return this;
    }
    if (this.gem) { // Gemini أولًا: أعلى جودة
      const q = [...this.shots]; // ثلاث لقطات معًا: أسرع بكثير من واحدة تلو أخرى
      const worker = async () => { while (q.length && this.gem && !this.stopped) { const s = q.shift();
        try { s.img = await gemImage(s.prompt); if (++this.ready === 1) onFirst?.(this); onProgress?.(this.ready, this.shots.length); }
        catch (e) { if (!this.ready) { this.gem = false; this.gemError = e.message; } } } };
      await Promise.all([worker(), worker(), worker()]);
      if (this.gem) return this;
      if (this.ready) { this.recordable = true; return this; } // ما وُلّد يكفي ويُكمَل بما سبقه
      this.recordable = this.hf;
    }
    if (this.hf) { // Hugging Face: لقطة تلو لقطة دون انتظار؛ إن نفد الرصيد يعود إلى الخدمة المجانية
      for (const [i, s] of this.shots.entries()) {
        if (this.stopped) break;
        try { s.img = await hfImage(s.prompt, s.seed); if (++this.ready === 1) onFirst?.(this); onProgress?.(i + 1, this.shots.length); }
        catch (e) { this.hf = false; this.recordable = false; this.hfError = e.message; break; }
      }
      if (this.hf) return this;
      this.shots.forEach((s) => { s.img = null; }); this.ready = 0;
    }
    for (const [i, s] of this.shots.entries()) {
      if (this.stopped) break;
      if (i) { onProgress?.(i, this.shots.length, true); await new Promise((r) => setTimeout(r, 46000)); }
      for (let attempt = 0; attempt < 2 && !s.img && !this.stopped; attempt++) {
        try { const im = await loadImg(shotUrl(s)); if (review && !(await review(shotUrl(s), s))) { s.rejected = (s.rejected || 0) + 1; s.seed += 7919; continue; } s.img = im; } catch { s.seed += 7919; }
      }
      if (s.img && ++this.ready === 1) onFirst?.(this);
    }
    onProgress?.(this.shots.length, this.shots.length);
    return this;
  }
  async loadParallel(onProgress, review) {
    let done = 0; const q = [...this.shots];
    const worker = async () => {
      while (q.length) {
        const s = q.shift();
        for (let attempt = 0; attempt < 2 && !s.img; attempt++) {
          try {
            const im = await loadImg(shotUrl(s));
            if (review && !(await review(shotUrl(s), s))) { s.rejected = (s.rejected || 0) + 1; s.seed += 7919; continue; }
            s.img = im;
          } catch { s.seed += 7919; }
        }
        onProgress?.(++done, this.shots.length);
      }
    };
    await Promise.all([worker(), worker()]); // طلبان معًا: الخدمة المجانية ترفض الإكثار
    this.ready = this.shots.filter((s) => s.img).length;
    return this;
  }
  draw(ctx, W, H, scene, t) {
    let i = 0; for (let j = 0; j < this.shots.length; j++) if (this.shots[j].t <= t) i = j;
    // لقطة لم تُحمَّل بعد: تُستعمل أقرب لقطة سابقة محمّلة
    const withImg = (k) => { for (let j = k; j >= 0; j--) if (this.shots[j].img) return this.shots[j]; return this.shots.find((x) => x.img) || this.shots[k]; };
    const cur = withImg(i), prev = i > 0 ? withImg(i - 1) : null, fade = prev && prev !== cur ? Math.min(1, (t - this.shots[i].t) / 1.1) : 1;
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const shot = (s, k, alpha) => {
      if (!s) return;
      if (!s.img) { ctx.globalAlpha = alpha; drawScene(ctx, W, H, scene, t); ctx.globalAlpha = 1; return; } // لقطة لم تُحمَّل: الرسم بدلها
      const u = Math.min(1, Math.max(0, (t - s.t) / Math.max(1, s.end - s.t))), z = 1.04 + 0.1 * u, dir = k % 2 ? 1 : -1;
      const im = s.img, sc = Math.max(W / im.width, H / im.height) * z, w = im.width * sc, h = im.height * sc;
      ctx.globalAlpha = alpha; ctx.drawImage(im, (W - w) / 2 + dir * (u - 0.5) * W * 0.04, (H - h) / 2 - u * H * 0.02, w, h); ctx.globalAlpha = 1;
    };
    if (fade < 1) shot(prev, i - 1, 1);
    shot(cur, i, fade);
    drawScene(ctx, W, H, scene, t, { only: OVERLAY }); // مطر وبرق وريح فوق الصورة
    // معالجة سينمائية: تدرّج لوني خفيف، حبيبات، تعتيم الأطراف، شريطان أسودان
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,170,90,.18)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    const gt = grainTile(), ox = (t * 977) % 160, oy = (t * 613) % 160; ctx.globalAlpha = 0.6;
    if (LOOKOPTS.grain) for (let x = -ox; x < W; x += 160) for (let y = -oy; y < H; y += 160) ctx.drawImage(gt, x, y);
    ctx.globalAlpha = 1;
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    const bar = LOOKOPTS.letterbox ? Math.max(0, (H - W / 2.2) / 2) : 0; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
    ctx.restore();
  }
}

/** مراجعة صورة بـ Claude (اختيارية، بمفتاح المستخدم): هل فيها ملَك أو جناح على إنسان أو هالة أو كتابة أو لباس غير محتشم؟ */
export function makeReviewer(apiKey, model) {
  let client = null;
  return async (url) => { // يجلب Claude الصورة من رابطها بنفسه
    if (!client) { const { makeClient } = await import('./agents/llm.js'); client = makeClient(apiKey); }
    try {
      const res = await client.messages.create({
        model, max_tokens: 400,
        system: 'أنت المراجع الشرعي لتطبيق يصوّر معاني الآيات. افحص الصورة وأجب بكائن JSON فقط: {"ok": true|false, "reason": "..."}. اجعل ok=false إن ظهر فيها: ملَك أو إنسان بجناحين، هالة نور حول رأس، شخص يبدو نبيًّا أو قدّيسًا، رمز يُقصد به الله، رموز دينية لغير المسلمين، كتابة أو أحرف، عُري أو لباس غير محتشم.',
        messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'url', url } }, { type: 'text', text: 'هل الصورة مقبولة؟' }] }],
      });
      if (res.stop_reason === 'refusal') return false;
      const txt = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
      return JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1)).ok !== false;
    } catch { return true; } // تعذّر الاتصال بالمراجع: تبقى القيود الثابتة في الوصف
  };
}
