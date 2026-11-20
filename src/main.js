import '@fontsource/amiri-quran/arabic-400.css';
import '@fontsource/tajawal/arabic-400.css';
import '@fontsource/tajawal/arabic-500.css';
import '@fontsource/tajawal/arabic-700.css';
import './styles.css';
import { Player, drawScene } from './engine/render.js';
import { LIBRARY } from './scenes/library.js';
import { POLICY, TYPE_NAMES, checkScene, STRICTNESS, DEFAULT_STRICTNESS, forLevel, OPENISH } from './agents/rules.js';
import { Recitation, RECITERS, DEFAULT_RECITER } from './audio.js';
import { Sfx } from './sfx.js';
import { Cinema, STYLES, makeReviewer, shotList, pickShots } from './cinema.js';
import { getShots, saveShots, clearShots } from './myshots.js';
import { APP_VERSION, autoCheck, checkUpdate, platform, skip } from './update.js';
import { runOffline, runOfflineRange } from './agents/offline.js';
import { alignAyah, findPhrase } from './words.js';
import { strip } from './agents/rules.js';

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
};
const AR = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
const store = {
  get: (k, d = '') => { try { return localStorage.getItem('mash.' + k) ?? d; } catch { return d; } },
  set: (k, v) => { try { v ? localStorage.setItem('mash.' + k, v) : localStorage.removeItem('mash.' + k); } catch { /* تخزين غير متاح */ } },
};

// ───────── البيانات ─────────
const data = {};
const load = (n) => (data[n] ||= fetch(`./data/${n}.json`).then((r) => { if (!r.ok) throw new Error('تعذّر تحميل البيانات'); return r.json(); }));
async function ayat(ref) {
  const [Q, C, T, CH] = await Promise.all([load('quran'), load('clean'), load('tafsir'), load('chapters')]);
  const ch = CH[ref.s - 1], rows = [];
  for (let a = ref.from; a <= Math.min(ref.to, ch.n); a++) rows.push({ a, text: Q[ref.s - 1][a - 1], clean: C[ref.s - 1][a - 1], tafsir: T[ref.s - 1][a - 1] });
  return {
    ch, rows, refText: `سورة ${ch.name} · ${ref.from === ref.to ? 'الآية ' + AR(ref.from) : 'الآيات ' + AR(ref.from) + '–' + AR(ref.to)}`,
    clean: rows.map((r) => r.clean).join(' '), verse: rows.map((r) => r.text).join(' '), tafsir: [...new Set(rows.map((r) => r.tafsir))].join(' '),
  };
}

const level = () => (STRICTNESS[store.get('strict')] ? store.get('strict') : DEFAULT_STRICTNESS);
const reciteOn = () => store.get('recite', '1') === '1';
const sfxOn = () => store.get('sfx', '1') === '1';
const GEMINI_DEFAULT = 'auto';
const GEMINI_MODELS = [['auto', 'المتكيّف — يختار النموذج لكل وكيل (يُنصح به)'], ['gemini-flash-lite-latest', 'أحدث Flash-Lite (الأسرع)'], ['gemini-flash-latest', 'أحدث Flash (أدق)']];
// مزوّد وكلاء الذكاء الاصطناعي: Gemini (مجاني) أو Claude (مدفوع). يُستعمل المختار إن كان له مفتاح.
function aiConfig() {
  if (/^gemini-2\.5/.test(store.get('gmodel'))) store.set('gmodel', 'auto'); // اسم قديم أُوقف
  const prov = store.get('provider', 'gemini'), gk = store.get('gkey'), ck = store.get('key');
  if (prov === 'gemini' && gk) return { provider: 'gemini', apiKey: gk, model: store.get('gmodel', GEMINI_DEFAULT) };
  if (prov === 'claude' && ck) return { provider: 'claude', apiKey: ck, model: store.get('model', 'claude-opus-5-5') };
  if (gk) return { provider: 'gemini', apiKey: gk, model: store.get('gmodel', GEMINI_DEFAULT) };
  if (ck) return { provider: 'claude', apiKey: ck, model: store.get('model', 'claude-opus-5-5') };
  return null;
}
const lookStyle = () => (STYLES[store.get('look')] || store.get('look') === 'drawn' ? store.get('look') : 'real');
const reciter = () => (RECITERS[store.get('reciter')] ? store.get('reciter') : DEFAULT_RECITER);

// ───────── الترجمات (QuranEnc، نصّ غير معدَّل) ─────────
const LANGS = {
  en: { name: 'English — Saheeh International', dir: 'ltr', credit: 'Saheeh International · QuranEnc.com (english_saheeh v1.1.2)' },
  fr: { name: 'Français — Montada Islamic Foundation', dir: 'ltr', credit: 'Montada Islamic Foundation · QuranEnc.com (french_montada v1.0.0)' },
  id: { name: 'Bahasa Indonesia — Kementerian Agama', dir: 'ltr', credit: 'Kementerian Agama RI · QuranEnc.com (indonesian_affairs v1.0.1)' },
  tr: { name: 'Türkçe — Rowwad Translation Center', dir: 'ltr', credit: 'Rowwad Translation Center · QuranEnc.com (turkish_rwwad v1.0.4)' },
  ur: { name: 'اردو — محمد جوناگڑھی', dir: 'rtl', credit: 'محمد جوناگڑھی · QuranEnc.com (urdu_junagarhi v1.1.3)' },
};
const lang = () => (LANGS[store.get('lang')] ? store.get('lang') : '');
function translationBlock(A) {
  const code = lang(); if (!code) return null;
  const L = LANGS[code], body = h('div', { class: 'tr-body', dir: L.dir, lang: code }, h('p', { class: 'note' }, '…'));
  load('tr/' + code).then((TR) => body.replaceChildren(...A.rows.map((r) => {
    const [text, notes] = TR[A.ch.id - 1][r.a - 1];
    return h('div', { class: 'tr-ayah' }, h('p', {}, text), notes ? h('details', {}, h('summary', {}, code === 'ur' ? 'حواشی' : code === 'en' ? 'Footnotes' : code === 'fr' ? 'Notes' : code === 'id' ? 'Catatan' : 'Dipnotlar'), h('p', { class: 'tr-notes' }, notes)) : null);
  }))).catch(() => body.replaceChildren(h('p', { class: 'note' }, 'تعذّر تحميل الترجمة.')));
  return h('section', { class: 'panel' }, h('h3', {}, 'الترجمة', h('span', { class: 'chip' }, L.name)), body, h('p', { class: 'src' }, L.credit));
}

// ───────── المفضّلة وآخر ما شوهد ─────────
const listGet = (k) => { try { return JSON.parse(store.get(k, '[]')) || []; } catch { return []; } };
const listSet = (k, v) => store.set(k, JSON.stringify(v));
const isFav = (id) => listGet('favs').includes(id);
const toggleFav = (id) => { const f = listGet('favs'); listSet('favs', f.includes(id) ? f.filter((x) => x !== id) : [id, ...f]); return !f.includes(id); };
const markSeen = (id) => listSet('seen', [id, ...listGet('seen').filter((x) => x !== id)].slice(0, 8));

// ───────── المشغّل ─────────
let current = null; // المشغّل الظاهر حاليًا
function verseBlock(A) {
  // كل كلمة في عنصر مستقل لتُظلَّل مع اللقطة المقابلة لها؛ النص نفسه لا يُمسّ.
  const words = [], spans = [], kids = [], END = String.fromCharCode(0x06DD);
  for (const r of A.rows) {
    const al = alignAyah(r.text, r.clean);
    if (al) for (const w of al) { const sp = h('span', { class: 'w' }, w.u); words.push(w); spans.push(sp); kids.push(sp, ' '); }
    else { kids.push(r.text, ' '); words.push({ c: '#' }); spans.push(null); }
    kids.push(END + AR(r.a) + ' ');
  }
  const el = h('section', { class: 'verse' }, h('p', { class: 'quran', lang: 'ar' }, kids), h('p', { class: 'ref' }, A.refText));
  el.mark = (q) => { const m = q ? findPhrase(words, q) : null; spans.forEach((sp, i) => sp?.classList.toggle('hl', !!m && i >= m[0] && i <= m[1])); };
  return el;
}
function tafsirBlock(A) {
  return h('section', { class: 'panel' }, h('h3', {}, 'التفسير الميسّر'),
    ...[...new Map(A.rows.map((r) => [r.tafsir, r])).values()].map((r) => h('p', { class: 'tafsir' }, A.rows.length > 1 ? h('b', {}, `﴿${AR(r.a)}﴾ `) : null, r.tafsir)),
    h('p', { class: 'src' }, 'المصدر: التفسير الميسّر — نخبة من العلماء، مجمع الملك فهد لطباعة المصحف الشريف.'));
}
const AGENT_NAMES = { tafsir: 'جامع التفسير', review: 'المراجع الشرعي', paint: 'الرسّام', animate: 'المحرّك', final: 'المراجعة الختامية' };
function reportBlock(rep, seek) {
  const li = (xs) => h('ul', {}, xs.map((x) => h('li', {}, x)));
  const card = (name, role, ...body) => h('article', { class: 'agent' }, h('h4', {}, name, h('small', {}, role)), ...body);
  const rv = rep.review || {};
  return h('section', { class: 'panel agents' },
    h('h3', {}, 'تقرير الوكلاء', h('span', { class: 'chip' }, rep.mode === 'ai' ? 'ذكاء اصطناعي' : rep.mode === 'curated' ? 'مُعدّ ومراجَع يدويًا' : 'دون اتصال')),
    card(AGENT_NAMES.tafsir, 'يجمع المعنى من التفسير المعتمد', h('p', {}, 'المصدر: ' + (rep.tafsir?.source || '—')),
      rep.tafsir?.visuals?.length ? h('p', {}, 'المحسوسات المرئية: ' + rep.tafsir.visuals.join('، ')) : null,
      rep.tafsir?.points?.length ? li(rep.tafsir.points.map((p) => `${p.text} — ${p.source || ''}`)) : null),
    card(AGENT_NAMES.review, 'يطبّق الضوابط على الفكرة ثم على المشهد النهائي',
      h('p', { class: rv.verdict === 'approve' ? 'ok' : 'no' }, rv.verdict === 'approve' ? 'أُجيز المشهد' : 'لم يُجَز'),
      rv.checks ? h('ul', { class: 'checks' }, rv.checks.map((c) => h('li', { class: c.ok ? 'ok' : 'no' }, c.text))) : null,
      rv.leaveOut?.length || rv.constraints?.length ? li([...(rv.constraints || []), ...(rv.leaveOut || [])]) : null,
      rv.omitted?.length ? h('div', {}, h('p', {}, 'تُرك عمدًا:'), li(rv.omitted)) : null,
      rv.reasons?.length ? li(rv.reasons) : null, rv.note ? h('p', {}, rv.note) : null),
    card(AGENT_NAMES.paint, 'يؤلّف المشهد من المفردات الكونية', h('p', {}, [...new Set(rep.paint?.elements || [])].join('، ') || '—'), rep.paint?.notes ? h('p', {}, rep.paint.notes) : null),
    card(AGENT_NAMES.animate, 'يرتّب الحركة على ترتيب المعاني', h('p', {}, rep.animate ? `${AR(rep.animate.duration)} ثانية · ${AR(rep.animate.beats)} لقطات` : '—'),
      rep.timeline ? h('ol', { class: 'timeline' }, rep.timeline.map((c) => h('li', {}, h('button', { onclick: () => seek?.(c.t + 0.05), 'aria-label': 'انتقل إلى هذه اللقطة' }, h('time', {}, AR(Math.round(c.t)) + 'ث'), c.text)))) : null));
}

// «لقطاتك الخاصة»: أوصاف جاهزة للنسخ إلى مولّد صور (كتطبيق Gemini)، ثم استيراد الصور بالترتيب
function myShotsBlock(scene, key, seedKey) {
  const style = lookStyle() === 'drawn' ? 'anime' : lookStyle();
  const shots = pickShots(shotList(scene, style, seedKey), 6);
  const msg = h('p', { class: 'saved', role: 'status' });
  const copy = async (text) => { try { await navigator.clipboard.writeText(text); msg.textContent = 'نُسخ.'; } catch { msg.textContent = 'تعذّر النسخ؛ حدّد النص وانسخه يدويًا.'; } };
  const all = shots.map((s, i) => `اللقطة ${i + 1} (16:9):\n${s.prompt}`).join('\n\n');
  const input = h('input', { type: 'file', id: 'myshots-file', accept: 'image/*', multiple: true, onchange: async () => {
    const files = [...input.files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).slice(0, shots.length);
    if (!files.length) return;
    await saveShots(key, { blobs: files, times: shots.map((s) => s.t) });
    msg.textContent = `حُفظت ${AR(files.length)} صور على هذا الجهاز. أعد فتح المشهد لتظهر.`;
  } });
  return h('details', { class: 'panel myshots' }, h('summary', {}, h('b', {}, 'لقطاتك الخاصة'), h('small', {}, ' — جودة احترافية مجانًا بتطبيق Gemini')),
    h('ol', { class: 'howto' },
      h('li', {}, 'انسخ أوصاف اللقطات، وألصقها في تطبيق Gemini، واطلب: «ولّد صورة لكل لقطة بالترتيب، مقاس 16:9».'),
      h('li', {}, 'نزّل الصور وسمّها بالترتيب (1، 2، 3…)، ثم استوردها هنا.'),
      h('li', {}, 'راجع الصور قبل استيرادها: لا ملائكة ولا أنبياء ولا لباس غير محتشم.')),
    h('div', { class: 'actions-row' }, h('button', { class: 'primary', onclick: () => copy(all) }, `نسخ أوصاف ${AR(shots.length)} لقطات`),
      h('label', { class: 'ghost filebtn' }, 'استيراد الصور', input),
      h('button', { class: 'ghost', onclick: async () => { await clearShots(key); msg.textContent = 'حُذفت لقطاتك لهذا المشهد.'; } }, 'حذف لقطاتي')), msg);
}

function favButton(id) {
  const b = h('button', { class: 'fav', 'aria-pressed': String(isFav(id)), onclick: () => { const on = toggleFav(id); b.setAttribute('aria-pressed', String(on)); b.lastChild.textContent = on ? 'في المفضّلة' : 'أضف إلى المفضّلة'; } }, h('span', { 'aria-hidden': 'true' }, '♥'), h('span', {}, isFav(id) ? 'في المفضّلة' : 'أضف إلى المفضّلة'));
  return b;
}

let shotsMan = null;
const shotsManifest = () => (shotsMan ||= fetch('./cine/manifest.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})));

function playerView({ title, scene, A, report, ref, favId, cine }) {
  const canvas = h('canvas', { class: 'stage', role: 'img', 'aria-label': 'مشهد متحرك: ' + title });
  const cap = h('div', { class: 'caption', 'aria-live': 'polite' });
  const bar = h('input', { type: 'range', min: 0, max: scene.duration, step: 0.05, value: 0, 'aria-label': 'موضع المشهد' });
  const time = h('span', { class: 'time' });
  const playBtn = h('button', { class: 'play', 'aria-label': 'تشغيل' });
  let lastCap = null;
  const verse = verseBlock(A);
  const p = new Player(canvas, (t, pl) => {
    bar.value = t; time.textContent = `${AR(Math.floor(t))} / ${AR(Math.round(scene.duration))} ث`;
    playBtn.dataset.state = pl.playing ? 'pause' : t >= scene.duration - 0.05 ? 'replay' : 'play';
    playBtn.setAttribute('aria-label', pl.playing ? 'إيقاف مؤقت' : 'تشغيل');
    let c = null; for (const x of scene.captions) if (x.t <= t) c = x;
    sfx?.update(scene, t);
    if (c !== lastCap) { lastCap = c; cap.textContent = c ? c.text : ''; cap.classList.remove('in'); void cap.offsetWidth; if (c) cap.classList.add('in'); verse.mark(c?.q); }
  });
  const sfx = sfxOn() ? new Sfx() : null;
  // الوضع السينمائي: تُولَّد صور اللقطات أثناء العرض بالرسم، ثم يتحوّل المشهد إليها
  const cineStatus = h('p', { class: 'note cine-status', role: 'status' });
  const myKey = 'shots:' + (cine || title);
  if (lookStyle() !== 'drawn') {
    const key = store.get('key'), sty = STYLES[lookStyle()].name;
    cineStatus.textContent = `${sty}: يجري تجهيز اللقطات…`;
    Promise.all([shotsManifest(), getShots(myKey)]).then(([man, mine]) => {
    const own = mine?.blobs?.length ? mine.blobs.map((b, i) => ({ t: mine.times[i] ?? i * (scene.duration / mine.blobs.length), src: URL.createObjectURL(b) })) : null;
    const cin = new Cinema(scene, lookStyle(), cine || title, own || (cine && (man[cine]?.[lookStyle()] || man[cine]?.real)));
    if (own) cin.own = true;
    // الصور المولَّدة مباشرة قد تخالف الضوابط (رأينا ذلك في التجربة)، فلا تُعرض إلا بعد مراجعة Claude لكل صورة
    if (!cin.local && !cin.own && !key) { cineStatus.textContent = `${sty}: لهذا المشهد لقطات لم تُراجَع بعد، فيُعرض بالرسوم. لتوليد لقطات سينمائية لأي آية أضف مفتاح Claude في الإعدادات ليراجع المراجعُ الشرعي كل صورة قبل عرضها.`; return; }
    p.cinema = cin;
    const swap = (c) => { p.render = c.draw.bind(c); p.recordable = c.recordable; p.draw(); };
    return cin.load((d, n, waiting) => { cineStatus.textContent = waiting ? `${sty}: ${AR(d)} من ${AR(n)} لقطات جاهزة · اللقطة التالية بعد ٤٦ ثانية (حدّ الخدمة المجانية)` : `${sty}: ${AR(d)} من ${AR(n)} لقطات…`; },
      !cin.local && key ? makeReviewer(key, store.get('model', 'claude-opus-5-5')) : null, swap)
      .then((c) => {
        if (!c.ready) { cineStatus.textContent = 'تعذّر توليد اللقطات (تحتاج إنترنت)، فيُعرض المشهد بالرسم.'; return; }
        swap(c);
        const rej = c.shots.reduce((n, s) => n + (s.rejected || 0), 0);
        cineStatus.textContent = c.own ? `${AR(c.ready)} لقطات من لقطاتك الخاصة` : c.local ? `${sty} · ${AR(c.ready)} لقطات مُعدّة ومراجَعة مسبقًا` : `${sty} · ${AR(c.ready)} لقطات راجعها المراجع الشرعي${rej ? ` واستبدل ${AR(rej)}` : ''} · الفيديو المحفوظ يكون بالرسوم`;
      });
    });
  }
  // التلاوة: حين تعمل تقود زمن المشهد، فيمتد المشهد على طول التلاوة
  const status = h('p', { class: 'note audio-status', role: 'status' });
  const rc = ref && reciteOn() ? new Recitation(ref, reciter()) : null;
  let audioOk = !!rc;
  if (rc) {
    status.textContent = `التلاوة: ${RECITERS[reciter()].name} — جارٍ التحميل…`;
    rc.load().then(() => { status.textContent = `التلاوة: ${RECITERS[reciter()].name}`; if (p.playing) { rc.seekFrac(p.t / scene.duration); rc.play().catch(blocked); } })
      .catch(() => { audioOk = false; status.textContent = 'تعذّر تحميل التلاوة (تحتاج اتصالًا بالإنترنت). يعمل المشهد دون صوت.'; });
    rc.onend = () => { p.seek(scene.duration); p.pause(); };
  }
  function blocked() { p.pause(); status.textContent = 'اضغط زر التشغيل لسماع التلاوة مع المشهد.'; }
  p.clock = () => (rc && audioOk && rc.total && rc.playing ? rc.progress * scene.duration : null);
  p.hooks = {
    play: (t) => { sfx?.start(); sfx?.duck(!!(rc && audioOk)); if (rc && audioOk && rc.total) { rc.seekFrac(t / scene.duration); rc.play().catch(blocked); } },
    pause: () => { rc?.pause(); sfx?.stop(); },
    seek: (t) => { if (rc && audioOk && rc.total) rc.seekFrac(t / scene.duration); },
  };
  p.cleanup = () => { if (p.cinema) p.cinema.stopped = true; rc?.destroy(); sfx?.close(); p.dead = true; };
  bar.addEventListener('input', () => p.seek(+bar.value));
  playBtn.addEventListener('click', () => p.toggle());
  const speed = h('button', { class: 'ghost', onclick: () => { p.speed = p.speed === 1 ? 0.5 : 1; rc?.setRate(p.speed); speed.textContent = p.speed === 1 ? 'سرعة ×١' : 'سرعة ×½'; } }, 'سرعة ×١');
  const wrap = h('div', { class: 'stagewrap' }, canvas, cap);
  const canRec = typeof MediaRecorder !== 'undefined' && !!canvas.captureStream && !/; wv\)/.test(navigator.userAgent);
  const rec = canRec ? h('button', { class: 'ghost', onclick: () => recordVideo(p, scene, title, rec, rc && audioOk ? rc : null, status, { ref: A.refText, verse: A.verse, reciter: rc ? RECITERS[reciter()].name : '' }) }, 'حفظ فيديو') : null;
  const full = h('button', { class: 'ghost', onclick: () => (document.fullscreenElement ? document.exitFullscreen() : wrap.requestFullscreen?.()) }, 'ملء الشاشة');
  canvas.addEventListener('click', () => p.toggle());
  queueMicrotask(() => { current = p; p.setScene(scene); setTimeout(() => { if (!p.dead) p.play(); }, 350); });
  return h('div', { class: 'player' },
    h('div', { class: 'col-stage' }, wrap, h('div', { class: 'controls' }, playBtn, bar, time, speed, full, rec),
      lookStyle() !== 'drawn' ? cineStatus : null, rc ? status : null, h('p', { class: 'note' }, 'المشهد وسيلة إيضاح للمعنى وليس تفسيرًا. المرجع هو التفسير أدناه وأهل العلم.')),
    h('div', { class: 'col-text' }, h('div', { class: 'titlerow' }, h('h2', {}, title), favId ? favButton(favId) : null), verse, scene.captions.some((c) => c.q) ? h('p', { class: 'note' }, 'تُظلَّل ألفاظ الآية المقابلة لكل لقطة أثناء العرض.') : null, translationBlock(A), tafsirBlock(A), myShotsBlock(scene, myKey, cine || title), reportBlock(report, (t) => { p.seek(t); wrap.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); })));
}

// يسجّل المشهد كاملًا فيديو WebM مع الشروح مرسومة عليه، ثم ينزّله.
// يسجّل المشهد فيديو احترافيًا (1080p): بطاقة افتتاح بالآية، ثم المشهد بترجمة سينمائية، ثم بطاقة ختام؛
// والصوت تلاوة القارئ ممزوجة بأصوات الطبيعة (تُخفَّض تحت التلاوة).
async function recordVideo(p, scene, title, btn, rc, status, meta = {}) {
  if (btn.disabled) return;
  const W = 1920, H = 1080, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), stream = cv.captureStream(30);
  const INTRO = 4, OUTRO = 3.5;
  const actx = new AudioContext(), mix = actx.createMediaStreamDestination();
  let total = scene.duration, src = null;
  if (rc) {
    btn.disabled = true; btn.textContent = 'تحضير التلاوة…';
    try { const buf = await rc.decode(actx); src = actx.createBufferSource(); src.buffer = buf; src.connect(mix); total = buf.duration; }
    catch { src = null; if (status) status.textContent = 'تعذّر إدخال التلاوة في الفيديو من هذا الخادم، فسُجّلت أصوات الطبيعة وحدها.'; }
    btn.disabled = false;
  }
  const sfx = sfxOn() ? new Sfx() : null;
  if (sfx) { sfx.start(actx, mix); sfx.duck(!!src); }
  if (src || sfx) stream.addTrack(mix.stream.getAudioTracks()[0]);
  const type = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find((t) => MediaRecorder.isTypeSupported(t));
  if (!type) { btn.textContent = 'التسجيل غير مدعوم'; actx.close(); return; }
  const mr = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 10e6 }), chunks = [];
  mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const label = btn.textContent; btn.disabled = true; p.pause();
  const done = new Promise((r) => (mr.onstop = r));
  await document.fonts?.ready;
  const render = p.render && p.recordable !== false ? p.render : drawScene;
  const GOLD = '#e0bd62', full = INTRO + total + OUTRO;
  const card = (alpha, lines) => {
    ctx.fillStyle = '#05080a'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6); g.addColorStop(0, 'rgba(224,189,98,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.direction = 'rtl';
    for (const [text, font, color, y] of lines) { ctx.font = font; ctx.fillStyle = color; ctx.fillText(text, W / 2, y, W - 240); }
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 160, H / 2 + 6); ctx.lineTo(W / 2 + 160, H / 2 + 6); ctx.stroke();
    ctx.globalAlpha = 1;
  };
  const fade = (x, a, b) => Math.max(0, Math.min(1, Math.min((x - a) / 0.8, (b - x) / 0.8)));
  const verse = (meta.verse || '').split(' ').slice(0, 14).join(' ') + ((meta.verse || '').split(' ').length > 14 ? ' …' : '');
  mr.start(500);
  const t0 = performance.now(); let started = false;
  await new Promise((resolve) => {
    const frame = () => {
      const el = (performance.now() - t0) / 1000;
      if (el < INTRO) {
        card(fade(el, 0, INTRO), [[meta.ref || title, '700 64px Tajawal, sans-serif', GOLD, H / 2 - 40], [verse, '400 54px "Amiri Quran", Amiri, serif', '#f5eedb', H / 2 + 110], ['مَشهَدآية', '700 30px Tajawal, sans-serif', 'rgba(255,255,255,.55)', H - 90]]);
      } else if (el < INTRO + total) {
        if (!started) { started = true; src?.start(); }
        const st = el - INTRO, t = (st / total) * scene.duration;
        render(ctx, W, H, scene, t); sfx?.update(scene, t);
        let c = null; for (const x of scene.captions) if (x.t <= t) c = x;
        if (c) {
          const g = ctx.createLinearGradient(0, H - 260, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.82)');
          ctx.fillStyle = g; ctx.fillRect(0, H - 260, W, 260);
          ctx.font = '700 50px Tajawal, sans-serif'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
          ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 14; ctx.fillStyle = '#fff'; ctx.fillText(c.text, W / 2, render === drawScene ? H - 92 : H - 46, W - 200); ctx.shadowBlur = 0; // في السينمائي داخل الشريط الأسود
        }
        ctx.font = '700 30px Tajawal, sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('مَشهَدآية', W - 44, 62);
        const edge = Math.min(st, total - st); if (edge < 0.7) { ctx.fillStyle = `rgba(0,0,0,${1 - edge / 0.7})`; ctx.fillRect(0, 0, W, H); } // إظلام عند الدخول والخروج
      } else {
        sfx?.stop();
        const x = el - INTRO - total;
        card(fade(x, 0, OUTRO), [['مَشهَدآية', '700 72px Tajawal, sans-serif', GOLD, H / 2 - 40], [meta.reciter ? `بصوت القارئ ${meta.reciter}` : 'افهم الآية بالنظر', '500 40px Tajawal, sans-serif', '#f5eedb', H / 2 + 90], ['التفسير الميسّر · مجمع الملك فهد · المشهد وسيلة إيضاح وليس تفسيرًا', '400 28px Tajawal, sans-serif', 'rgba(255,255,255,.6)', H - 110]]);
      }
      btn.textContent = `يسجّل… ${AR(Math.round(Math.min(1, el / full) * 100))}٪`;
      el < full ? requestAnimationFrame(frame) : resolve();
    };
    frame();
  });
  mr.stop(); await done; sfx?.close(); if (actx.state !== 'closed') actx.close();
  const blob = new Blob(chunks, { type }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `${title.replace(/[\\/:*?"<>|]/g, '')}.${type.includes('mp4') ? 'mp4' : 'webm'}`;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  btn.textContent = label; btn.disabled = false;
}

function curatedReport(item, A) {
  const checks = checkScene(item), figs = OPENISH.has(level()) && item.omittedFigures;
  const omitted = figs ? [...(item.omitted || []).filter((o) => !/(الظمآن|الناس|الإنسان|الأنعام|الزُّرّاع|العباد|الدوابّ)/.test(o)), ...item.omittedFigures] : item.omitted;
  return {
    mode: 'curated', tafsir: { source: 'التفسير الميسّر', visuals: [...new Set(item.elements.filter((e) => e.type !== 'label').map((e) => TYPE_NAMES[e.type]))] },
    review: { verdict: 'approve', checks, omitted }, paint: { elements: item.elements.map((e) => TYPE_NAMES[e.type]) },
    animate: { duration: item.duration, beats: item.captions.length }, timeline: item.captions,
  };
}

// ───────── الصفحات ─────────
const view = $('#view');
function mount(...nodes) { current?.cleanup?.(); current?.destroy(); current = null; view.replaceChildren(...nodes); view.scrollTo?.(0, 0); window.scrollTo(0, 0); }

function sceneCard(item) {
  const cv = h('canvas', { width: 480, height: 270 });
  requestAnimationFrame(() => drawScene(cv.getContext('2d'), 480, 270, item, item.duration * (item.thumb ?? 0.78)));
  const meta = h('small', {}, '…');
  load('chapters').then((CH) => { meta.textContent = `${CH[item.ref.s - 1].name} ${AR(item.ref.from)}${item.ref.to > item.ref.from ? '–' + AR(item.ref.to) : ''} · ${AR(item.duration)} ث`; });
  return h('button', { class: 'card', onclick: () => go('scene/' + item.id) }, cv, h('span', {}, h('b', {}, isFav(item.id) ? h('i', { class: 'heart', 'aria-label': 'في المفضّلة' }, '♥ ') : null, item.title), meta));
}
function pageLibrary() {
  const visible = LIBRARY.filter((x) => !x.needsFigures || OPENISH.has(level())).map((item) => forLevel(item, level()));
  const byId = (ids) => ids.map((id) => visible.find((x) => x.id === id)).filter(Boolean);
  const cats = [...new Set(visible.map((x) => x.cat))], favs = byId(listGet('favs')), seen = byId(listGet('seen')).slice(0, 4);
  const row = (title, items) => items.length ? h('section', {}, h('h2', { class: 'cat' }, title), h('div', { class: 'grid' }, items.map(sceneCard))) : null;
  mount(h('div', { class: 'page' },
    h('div', { class: 'hero' }, h('h1', {}, 'افهم الآية بالنظر'),
      h('p', {}, 'كل مشهد يحوّل معنى آية كونية أو مَثَل قرآني إلى حركة صامتة تُفهم دون شرح طويل، مع نصّ الآية والتفسير الميسّر، وتقرير يبيّن ما رُسم وما تُرك ولماذا.')),
    row('المفضّلة', favs), row('شاهدت مؤخرًا', seen),
    ...cats.map((cat) => row(cat, visible.filter((x) => x.cat === cat)))));
}
async function pageScene(id) {
  const item = LIBRARY.find((x) => x.id === id); if (!item) return go('library');
  mount(h('p', { class: 'loading' }, 'جارٍ التحميل…'));
  const A = await ayat(item.ref), sc = forLevel(item, level()); markSeen(item.id);
  mount(h('div', { class: 'page' }, h('button', { class: 'back', onclick: () => go('library') }, '→ المكتبة'), playerView({ title: item.title, scene: sc, A, report: curatedReport(sc, A), ref: item.ref, favId: item.id, cine: item.id })));
}

const STEPS = ['tafsir', 'review', 'paint', 'animate', 'final'];
async function pageStudio() {
  const CH = await load('chapters');
  const sel = h('select', { 'aria-label': 'السورة' }, CH.map((c) => h('option', { value: c.id }, `${AR(c.id)}. ${c.name}`)));
  const from = h('input', { type: 'number', min: 1, value: 48, inputmode: 'numeric', 'aria-label': 'من الآية' });
  const to = h('input', { type: 'number', min: 1, value: 48, inputmode: 'numeric', 'aria-label': 'إلى الآية' });
  sel.value = store.get('s', '30'); from.value = to.value = store.get('a', '48');
  const fix = () => { const n = CH[sel.value - 1].n; from.max = to.max = n; from.value = Math.max(1, Math.min(n, +from.value || 1)); to.value = Math.max(+from.value, Math.min(n, +to.value || 1, +from.value + 5)); };
  sel.addEventListener('change', () => { from.value = to.value = 1; fix(); }); from.addEventListener('change', () => { to.value = from.value; fix(); }); to.addEventListener('change', fix);
  const ai = aiConfig(), key = !!ai, out = h('div', { class: 'result' }), steps = h('ol', { class: 'steps' });
  const btn = h('button', { class: 'primary' }, 'ابنِ المشهد');
  const level = STRICTNESS[store.get('strict')] ? store.get('strict') : DEFAULT_STRICTNESS;
  const mode = h('p', { class: 'mode' }, `المراجع الشرعي: ${STRICTNESS[level].name} (يُغيَّر من الإعدادات) · `, ai ? `الوضع: وكلاء الذكاء الاصطناعي (${ai.model === 'auto' ? 'Gemini المتكيّف' : ai.model}${ai.provider === 'gemini' ? '، مجاني' : ''})` : 'الوضع: وكلاء دون اتصال (قواعد محلية). أضف مفتاح API من الإعدادات لتفعيل وكلاء الذكاء الاصطناعي.');
  const run = async () => {
    fix(); const ref = { s: +sel.value, from: +from.value, to: +to.value }, strict = STRICTNESS[store.get('strict')] ? store.get('strict') : DEFAULT_STRICTNESS;
    store.set('s', String(ref.s)); store.set('a', String(ref.from));
    btn.disabled = true; out.replaceChildren(); current?.destroy(); current = null;
    const rows = Object.fromEntries(STEPS.map((id) => [id, h('li', { 'data-state': 'wait' }, h('b', {}, AGENT_NAMES[id]), h('span', {}))]));
    steps.replaceChildren(...Object.values(rows));
    const onStep = (id, state, detail) => { rows[id].dataset.state = state; if (detail) rows[id].lastChild.textContent = detail; };
    try {
      const A = await ayat(ref);
      const made = LIBRARY.find((x) => x.ref.s === ref.s && x.ref.from === ref.from && x.ref.to === ref.to);
      let res;
      if (ai) {
        const L = await import('./agents/llm.js');
        try { res = await L.runLLM({ ...ai, refText: A.refText, verse: A.verse, clean: A.clean, tafsir: A.tafsir, strictness: strict }, onStep); }
        catch (err) { if (!OPENISH.has(strict)) throw err; res = { ok: false, aiError: L.explainError(err) }; }
        // احتياط في «متساهل»: إن تعذّر بناء المشهد بالذكاء الاصطناعي تبنيه الوكلاء دون اتصال
        if (!res.ok && OPENISH.has(strict)) {
          const why = res.aiError || (res.report?.review?.reasons || []).join(' — ');
          STEPS.forEach((id) => { rows[id].dataset.state = 'wait'; rows[id].lastChild.textContent = ''; });
          res = await runOfflineRange(A.rows, strict, onStep);
          if (res.ok) res.report.review = { ...res.report.review, reasons: [`تعذّر المشهد بالذكاء الاصطناعي (${why})، فبنته الوكلاء دون اتصال.`] };
        }
      }
      else res = await runOfflineRange(A.rows, strict, onStep);
      if (res.ok) { res.report.timeline = res.scene.captions; out.replaceChildren(playerView({ title: A.refText, scene: res.scene, A, report: res.report, ref })); }
      else out.replaceChildren(h('div', { class: 'rejected' }, h('h2', {}, 'هذه الآية لا يُبنى لها مشهد'),
        h('p', {}, 'قرّر المراجع الشرعي أن تصويرها لا يصحّ. تُقرأ وتُفهم من التفسير:'), h('ul', {}, (res.report.review?.reasons || []).map((r) => h('li', {}, r))), verseBlock(A), tafsirBlock(A)));
      if (made) out.prepend(h('button', { class: 'hint', onclick: () => go('scene/' + made.id) }, 'لهذه الآية مشهد مُعدّ ومراجَع يدويًا في المكتبة ←'));
    } catch (err) {
      const msg = key ? (await import('./agents/llm.js')).explainError(err) : err.message;
      STEPS.forEach((id) => rows[id].dataset.state === 'run' && onStep(id, 'stop', msg));
      out.replaceChildren(h('p', { class: 'error', role: 'alert' }, msg));
    }
    btn.disabled = false;
  };
  btn.addEventListener('click', run);
  const C = await load('clean'), q = h('input', { type: 'search', id: 'verse-search', placeholder: 'ابحث في المصحف بكلمة: مطر، النخل، الجبال…', 'aria-label': 'بحث في المصحف' });
  const hits = h('div', { class: 'hits' });
  let tmr;
  q.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => {
    const term = strip(q.value.trim()); hits.replaceChildren();
    if (term.length < 2) return;
    const out = [];
    for (let si = 0; si < C.length && out.length < 40; si++) for (let ai = 0; ai < C[si].length && out.length < 40; ai++) if (strip(C[si][ai]).includes(term)) out.push([si + 1, ai + 1]);
    if (!out.length) { hits.append(h('p', { class: 'note' }, 'لا نتائج. جرّب كلمة أقصر أو بغير «ال».')); return; }
    hits.append(...out.map(([s, a]) => h('button', { class: 'hit', onclick: () => { sel.value = s; from.value = to.value = a; fix(); hits.replaceChildren(); q.value = ''; run(); } },
      h('b', {}, `${CH[s - 1].name} ${AR(a)}`), h('span', {}, C[s - 1][a - 1].length > 110 ? C[s - 1][a - 1].slice(0, 107) + '…' : C[s - 1][a - 1]))));
    if (out.length === 40) hits.append(h('p', { class: 'note' }, 'تظهر أول ٤٠ نتيجة.'));
  }, 220); });
  const tries = [[30, 48, 'الرياح والسحاب'], [35, 27, 'ثمرات وجبال'], [6, 99, 'نبات كل شيء'], [2, 164, 'آيات الكون'], [50, 9, 'ماء مبارك'], [2, 255, 'مثال: آية لا تُصوَّر']];
  mount(h('div', { class: 'page' },
    h('div', { class: 'hero' }, h('h1', {}, 'الاستوديو'), h('p', {}, 'اختر آية، فيعمل عليها أربعة وكلاء بالتتابع: يجمع الأول معناها من التفسير، ويراجعها الثاني شرعًا قبل الرسم وبعده، ويرسم الثالث مشهدها، ويحرّكه الرابع.')),
    h('div', { class: 'search' }, q, hits),
    h('div', { class: 'form' }, h('label', {}, 'السورة', sel), h('label', {}, 'من الآية', from), h('label', {}, 'إلى', to), btn),
    h('div', { class: 'tries' }, 'جرّب: ', tries.map(([s, a, t]) => h('button', { class: 'chipbtn', onclick: () => { sel.value = s; from.value = to.value = a; run(); } }, `${t} (${CH[s - 1].name} ${AR(a)})`))),
    mode, steps, out));
  fix();
}

function pageAbout() {
  const key = h('input', { type: 'password', value: store.get('key'), placeholder: 'sk-ant-…', autocomplete: 'off', dir: 'ltr', 'aria-label': 'مفتاح Anthropic API' });
  const model = h('select', { 'aria-label': 'النموذج' }, [['claude-opus-5-5', 'Claude Opus 5.5 (الافتراضي)'], ['claude-fable-5-2', 'Claude Fable 5.2 (الأقدر)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (أسرع)'], ['claude-haiku-5-5', 'Claude Haiku 5.5 (الأرخص)']].map(([v, t]) => h('option', { value: v }, t)));
  model.value = store.get('model', 'claude-opus-5-5');
  const gkey = h('input', { type: 'password', id: 'gkey', value: store.get('gkey'), placeholder: 'AIza…', autocomplete: 'off', dir: 'ltr', 'aria-label': 'مفتاح Gemini API' });
  const gmodel = h('select', { id: 'gmodel', 'aria-label': 'نموذج Gemini' });
  const fillModels = (list) => {
    const cur = store.get('gmodel', GEMINI_DEFAULT), all = [...GEMINI_MODELS, ...list.map((m) => [m.id, `${m.name} (${m.id})`])];
    if (!all.some(([v]) => v === cur)) all.push([cur, cur]);
    gmodel.replaceChildren(...all.filter(([v], i) => all.findIndex(([x]) => x === v) === i).map(([v, t]) => h('option', { value: v, selected: v === cur }, t)));
  };
  fillModels([]);
  const loadModels = async () => {
    const k = gkey.value.trim(); if (!k) { msg.textContent = 'أدخل مفتاح Gemini أولًا.'; return; }
    msg.textContent = 'جارٍ جلب النماذج المتاحة لمفتاحك…';
    try { const { listGeminiModels } = await import('./agents/llm.js'); const list = await listGeminiModels(k); fillModels(list); msg.textContent = `وُجد ${AR(list.length)} نموذجًا متاحًا لمفتاحك. اختر واحدًا ثم اضغط حفظ.`; }
    catch (err) { const { explainError } = await import('./agents/llm.js'); msg.textContent = explainError(err); }
  };
  if (store.get('gkey')) setTimeout(() => loadModels().then(() => { msg.textContent = ''; }), 0);
  const msg = h('span', { class: 'saved', role: 'status' }), lvlMsg = h('p', { class: 'saved', role: 'status' }), rcMsg = h('span', { class: 'saved', role: 'status' }), upMsg = h('span', { class: 'saved', role: 'status' }), trMsg = h('span', { class: 'saved', role: 'status' }), lookMsg = h('p', { class: 'saved', role: 'status' });
  mount(h('div', { class: 'page narrow' },
    h('div', { class: 'hero' }, h('h1', {}, 'الضوابط والإعدادات')),
    h('section', { class: 'panel' }, h('h3', {}, 'درجة المراجع الشرعي'),
      h('p', {}, 'تحدد متى يمنع المراجعُ المشهد، وهل تظهر فيه شخصيات من الناس والأنعام والطير. في كل الدرجات لا يُرسم نبي ولا ملَك ولا غيب.'),
      h('div', { class: 'levels', role: 'radiogroup', 'aria-label': 'درجة المراجع الشرعي' }, Object.entries(STRICTNESS).map(([id, L]) => {
        const cur = (STRICTNESS[store.get('strict')] ? store.get('strict') : DEFAULT_STRICTNESS) === id;
        return h('label', { class: 'level' }, h('input', { type: 'radio', name: 'strict', id: 'strict-' + id, value: id, checked: cur, onchange: () => { store.set('strict', id); lvlMsg.textContent = 'حُفظ: ' + L.name; } }), h('span', {}, h('b', {}, L.name), h('small', {}, L.desc)));
      })), lvlMsg),
    h('section', { class: 'panel' }, h('h3', {}, 'الضوابط الشرعية للمشاهد'), h('ol', { class: 'policy' }, POLICY.map((p) => h('li', {}, p))),
      h('p', { class: 'src' }, 'هذه الضوابط مبنية في المحرّك: لا يملك عناصر للغيب، والشخصيات العامة تُحذف آليًا خارج درجة «متساهل»، ثم يُفحص كل مشهد قبل عرضه. ومع ذلك فالتطبيق جهد بشري وآلي يحتمل الخطأ، ويُستحسن عرض المشاهد المولَّدة على طالب علم قبل نشرها أو تعليمها.')),
    h('section', { class: 'panel' }, h('h3', {}, 'أسلوب العرض'),
      h('p', {}, 'السينمائي يولّد لكل لقطة صورة بالذكاء الاصطناعي مجانًا (خدمة Pollinations، تحتاج إنترنت وتضع علامتها في زاوية الصورة)، ثم يحرّكها بحركة كاميرا ومؤثرات. يظهر في العرض فقط، أما الفيديو المحفوظ فيُسجَّل بالرسوم. الوصف يُبنى من عناصر المشهد لا من نص الآية، ويمنع دائمًا الملائكة والأجنحة على البشر والهالات والشخصيات الدينية. المشاهد التي لها لقطات مُعدّة ومراجَعة تعمل فورًا ودون إنترنت. ولتوليد لقطات لأي آية أخرى يلزم مفتاح Claude، ليفحص المراجع الشرعي كل صورة قبل عرضها، لأن الخدمة المجانية قد تُخرج صورًا مخالفة.'),
      h('div', { class: 'levels', role: 'radiogroup', 'aria-label': 'أسلوب العرض' }, [['real', 'سينمائي واقعي', 'صور تشبه التصوير الحقيقي.'], ['anime', 'سينمائي أنمي', 'صور بأسلوب أفلام الأنمي المرسومة.'], ['drawn', 'رسوم التطبيق', 'الرسوم المتحركة المبنية في التطبيق. تعمل دون إنترنت وتظهر فيها الأقوال والانفعالات كاملة.']].map(([id, name, desc]) =>
        h('label', { class: 'level' }, h('input', { type: 'radio', name: 'look', id: 'look-' + id, value: id, checked: lookStyle() === id, onchange: () => { store.set('look', id); lookMsg.textContent = 'حُفظ: ' + name; } }), h('span', {}, h('b', {}, name), h('small', {}, desc))))), lookMsg),
    h('section', { class: 'panel' }, h('h3', {}, 'الترجمة'),
      h('p', {}, 'تظهر ترجمة معاني الآية تحت نصّها، لمن لا يحسن العربية. الترجمات من QuranEnc.com كما هي دون تعديل، وتعمل دون إنترنت.'),
      h('div', { class: 'form' }, h('label', {}, 'لغة الترجمة', h('select', { id: 'lang', onchange: (ev) => { store.set('lang', ev.target.value); trMsg.textContent = 'حُفظ.'; } },
        h('option', { value: '', selected: !lang() }, 'دون ترجمة'), Object.entries(LANGS).map(([c, L]) => h('option', { value: c, selected: c === lang() }, L.name)))), trMsg)),
    h('section', { class: 'panel' }, h('h3', {}, 'التلاوة'),
      h('p', {}, 'تُسمع الآية مرتّلة مع المشهد، ويمتد المشهد على طول التلاوة، وتدخل التلاوة في الفيديو المحفوظ. تحتاج اتصالًا بالإنترنت لأن ملفات الصوت تُبثّ ولا تُخزَّن في التطبيق.'),
      h('div', { class: 'form' },
        h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'sfx', checked: sfxOn(), onchange: (ev) => { store.set('sfx', ev.target.checked ? '1' : '0'); rcMsg.textContent = 'حُفظ.'; } }), 'أصوات الطبيعة: مطر ورعد وريح وبحر وطير (تُخفَّض مع التلاوة)'),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'recite', checked: reciteOn(), onchange: (ev) => { store.set('recite', ev.target.checked ? '1' : '0'); rcMsg.textContent = ev.target.checked ? 'التلاوة مفعّلة.' : 'التلاوة متوقفة.'; } }), 'تشغيل التلاوة مع المشهد'),
        h('label', {}, 'القارئ', h('select', { id: 'reciter', onchange: (ev) => { store.set('reciter', ev.target.value); rcMsg.textContent = 'حُفظ القارئ.'; } }, Object.entries(RECITERS).map(([id, r]) => h('option', { value: id, selected: id === reciter() }, r.name)))),
        rcMsg)),
    h('section', { class: 'panel' }, h('h3', {}, 'وكلاء الذكاء الاصطناعي (اختياري)'),
      h('p', {}, 'المكتبة والوكلاء دون اتصال يعملون بلا إنترنت ولا مفتاح. لتوليد مشاهد أدقّ لأي آية اختر مزوّدًا وأدخل مفتاحه. المفاتيح تُحفظ على هذا الجهاز فقط، ولا تُرسل إلا إلى خادم مزوّدها.'),
      h('div', { class: 'levels', role: 'radiogroup', 'aria-label': 'المزوّد' }, [['gemini', 'Google Gemini — مجاني', 'مفتاح مجاني من aistudio.google.com (زر Get API key). حدود الاستخدام المجاني تكفي لعشرات الآيات يوميًا.'], ['claude', 'Anthropic Claude — مدفوع', 'أدقّ في الفهم والمراجعة، والتكلفة على حسابك. ويُشترط لتوليد لقطات سينمائية جديدة، لأنه يفحص كل صورة قبل عرضها.']].map(([id, name, desc]) =>
        h('label', { class: 'level' }, h('input', { type: 'radio', name: 'provider', id: 'prov-' + id, value: id, checked: store.get('provider', 'gemini') === id, onchange: () => { store.set('provider', id); msg.textContent = 'حُفظ المزوّد: ' + name; } }), h('span', {}, h('b', {}, name), h('small', {}, desc))))),
      h('h4', { class: 'sub-h' }, 'Gemini (مجاني)'),
      h('div', { class: 'form' }, h('label', {}, 'مفتاح Gemini API', gkey), h('label', {}, 'النموذج', gmodel),
        h('button', { class: 'primary', onclick: () => { store.set('gkey', gkey.value.trim()); store.set('gmodel', gmodel.value); msg.textContent = gkey.value.trim() ? 'حُفظ مفتاح Gemini.' : 'حُذف مفتاح Gemini.'; } }, 'حفظ'),
        h('button', { class: 'ghost', id: 'gmodels', onclick: loadModels }, 'جلب النماذج المتاحة'),
        h('button', { class: 'ghost', onclick: () => { gkey.value = ''; store.set('gkey', ''); msg.textContent = 'حُذف مفتاح Gemini.'; } }, 'حذف المفتاح')),
      h('h4', { class: 'sub-h' }, 'Claude (مدفوع)'),
      h('div', { class: 'form' }, h('label', {}, 'مفتاح Anthropic API', key), h('label', {}, 'النموذج', model),
        h('button', { class: 'primary', onclick: () => { store.set('key', key.value.trim()); store.set('model', model.value); msg.textContent = key.value.trim() ? 'حُفظ مفتاح Claude.' : 'حُذف مفتاح Claude.'; } }, 'حفظ'),
        h('button', { class: 'ghost', onclick: () => { key.value = ''; store.set('key', ''); msg.textContent = 'حُذف مفتاح Claude.'; } }, 'حذف المفتاح')), msg),
    h('section', { class: 'panel' }, h('h3', {}, 'التحديثات'),
      h('p', {}, `الإصدار الحالي: ${AR(APP_VERSION).replace(/\./g, '٫')}. ` + (platform() === 'web' ? 'نسخة الموقع تتحدّث تلقائيًا.' : 'يفحص التطبيق عند فتحه هل صدرت نسخة أحدث، ويُظهر تنبيهًا فيه زر التنزيل.')),
      h('div', { class: 'form' }, h('button', { class: 'ghost', id: 'check-update', onclick: async () => {
        upMsg.textContent = 'جارٍ الفحص…';
        try { const u = await checkUpdate(); if (u) { upMsg.textContent = ''; showUpdate(u); } else upMsg.textContent = 'لديك أحدث إصدار.'; }
        catch { upMsg.textContent = 'تعذّر الفحص. تحقق من الاتصال بالإنترنت.'; }
      } }, 'تحقق من التحديثات'), upMsg)),
    h('section', { class: 'panel' }, h('h3', {}, 'المصادر والحقوق'), h('ul', {},
      h('li', {}, 'نصّ القرآن الكريم: مشروع تنزيل (Tanzil.net)، الرسم العثماني، رخصة CC BY 3.0 — يُعرض كما هو دون أي تعديل.'),
      h('li', {}, 'التفسير: التفسير الميسّر، مجمع الملك فهد لطباعة المصحف الشريف (عبر QUL / Tarteel).'),
      h('li', {}, 'الترجمات: QuranEnc.com — موسوعة القرآن الكريم، منشورة دون تعديل وفق شروط إعادة النشر، مع ذكر المترجم ورقم الإصدار.'),
      h('li', {}, 'الخطوط: Amiri Quran و Tajawal برخصة SIL OFL.'),
      h('li', {}, 'شروح المشاهد صياغة مختصرة لمعنى التفسير الميسّر، وليست نصًّا قرآنيًا ولا تفسيرًا مستقلًا.'))),
    h('p', { class: 'ver' }, 'مَشهَدآية · الإصدار ' + AR(APP_VERSION).replace(/\./g, '٫'))));
}

// ───────── التنقّل ─────────
function go(route) { location.hash = '#/' + route; }
function router() {
  const r = location.hash.replace(/^#\//, '') || 'library', top = r.split('/')[0];
  document.querySelectorAll('.nav button').forEach((b) => b.toggleAttribute('aria-current', b.dataset.go === (top === 'scene' ? 'library' : top)));
  const page = top === 'scene' ? pageScene(r.split('/')[1]) : top === 'studio' ? pageStudio() : top === 'about' ? pageAbout() : top === 'quiz' ? pageQuiz() : pageLibrary();
  Promise.resolve(page).catch((e) => mount(h('p', { class: 'error', role: 'alert' }, e.message)));
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
document.addEventListener('keydown', (e) => { if (e.code === 'Space' && current && !/INPUT|SELECT|BUTTON|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); current.toggle(); } });
window.addEventListener('hashchange', router);
document.fonts?.ready.then(() => current?.draw());
// ───────── اختبر فهمك ─────────
const quiz = { score: 0, total: 0, last: null };
async function pageQuiz() {
  const pool = LIBRARY.filter((x) => !x.needsFigures || OPENISH.has(level()));
  let item; do item = pool[Math.floor(Math.random() * pool.length)]; while (pool.length > 1 && item.id === quiz.last);
  quiz.last = item.id;
  const others = pool.filter((x) => x.id !== item.id).sort(() => Math.random() - 0.5).slice(0, 2);
  const options = [item, ...others].sort(() => Math.random() - 0.5);
  const [Q, CH] = await Promise.all([load('quran'), load('chapters')]);
  const verseOf = (x) => { const t = Q[x.ref.s - 1][x.ref.from - 1]; return t.split(' ').length > 16 ? t.split(' ').slice(0, 16).join(' ') + ' …' : t; };
  const scene = { ...forLevel(item, level()), captions: [] }; // دون شروح: الصورة وحدها
  const canvas = h('canvas', { class: 'stage', role: 'img', 'aria-label': 'مشهد الاختبار' });
  const p = new Player(canvas, (t, pl) => { if (!pl.playing && t >= scene.duration - 0.05) setTimeout(() => pl.play(), 900); });
  const result = h('div', { class: 'quiz-result', role: 'status' });
  const scoreEl = h('p', { class: 'quiz-score' }, `النتيجة: ${AR(quiz.score)} من ${AR(quiz.total)}`);
  const btns = options.map((o) => h('button', { class: 'quiz-opt', onclick: () => answer(o) },
    h('span', { class: 'quran' }, verseOf(o)), h('small', {}, `سورة ${CH[o.ref.s - 1].name} · ${AR(o.ref.from)}`)));
  function answer(o) {
    if (btns[0].disabled) return;
    const ok = o === item; quiz.total++; if (ok) quiz.score++;
    btns.forEach((b, i) => { b.disabled = true; b.classList.toggle('right', options[i] === item); b.classList.toggle('wrong', options[i] === o && !ok); });
    scoreEl.textContent = `النتيجة: ${AR(quiz.score)} من ${AR(quiz.total)}`;
    result.replaceChildren(h('p', { class: ok ? 'ok' : 'no' }, ok ? 'أحسنت! هذا مشهد الآية.' : `ليس هذا. المشهد لآية «${item.title}».`),
      h('div', { class: 'actions-row' }, h('button', { class: 'primary', onclick: () => pageQuiz() }, 'المشهد التالي'), h('button', { class: 'ghost', onclick: () => go('scene/' + item.id) }, 'شاهد المشهد مع شرحه')));
  }
  mount(h('div', { class: 'page narrow' },
    h('div', { class: 'hero' }, h('h1', {}, 'اختبر فهمك'), h('p', {}, 'شاهد المشهد دون شرح، ثم اختر الآية التي يصوّر معناها.')),
    h('div', { class: 'stagewrap' }, canvas), scoreEl, h('div', { class: 'quiz-opts' }, btns), result));
  queueMicrotask(() => { current = p; p.setScene(scene); p.play(); });
}

// شريط التحديث أعلى التطبيق
function showUpdate(u) {
  document.querySelector('.update-bar')?.remove();
  const bar = h('div', { class: 'update-bar', role: 'status' },
    h('div', { class: 'update-text' }, h('b', {}, `نسخة جديدة متاحة: ${AR(u.version).replace(/\./g, '٫')}`), u.notes ? h('span', {}, u.notes) : null),
    h('div', { class: 'update-actions' },
      h('a', { class: 'primary', href: u.url, target: '_blank', rel: 'noopener' }, platform() === 'android' ? 'تنزيل التحديث' : 'صفحة التنزيل'),
      h('button', { class: 'ghost', onclick: () => { skip(u.version); bar.remove(); } }, 'لاحقًا')));
  document.querySelector('.top').after(bar);
}
router();
autoCheck(showUpdate);
