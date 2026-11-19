import '@fontsource/amiri-quran/arabic-400.css';
import '@fontsource/tajawal/arabic-400.css';
import '@fontsource/tajawal/arabic-500.css';
import '@fontsource/tajawal/arabic-700.css';
import './styles.css';
import { Player, drawScene } from './engine/render.js';
import { LIBRARY } from './scenes/library.js';
import { POLICY, TYPE_NAMES, checkScene } from './agents/rules.js';
import { runOffline } from './agents/offline.js';

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

// ───────── المشغّل ─────────
let current = null; // المشغّل الظاهر حاليًا
function verseBlock(A) {
  return h('section', { class: 'verse' },
    h('p', { class: 'quran', lang: 'ar' }, A.rows.flatMap((r) => [r.text, ' ۝' + AR(r.a) + ' '])),
    h('p', { class: 'ref' }, A.refText));
}
function tafsirBlock(A) {
  return h('section', { class: 'panel' }, h('h3', {}, 'التفسير الميسّر'),
    ...[...new Map(A.rows.map((r) => [r.tafsir, r])).values()].map((r) => h('p', { class: 'tafsir' }, A.rows.length > 1 ? h('b', {}, `﴿${AR(r.a)}﴾ `) : null, r.tafsir)),
    h('p', { class: 'src' }, 'المصدر: التفسير الميسّر — نخبة من العلماء، مجمع الملك فهد لطباعة المصحف الشريف.'));
}
const AGENT_NAMES = { tafsir: 'جامع التفسير', review: 'المراجع الشرعي', paint: 'الرسّام', animate: 'المحرّك', final: 'المراجعة الختامية' };
function reportBlock(rep) {
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
      rep.timeline ? h('ol', { class: 'timeline' }, rep.timeline.map((c) => h('li', {}, h('time', {}, AR(Math.round(c.t)) + 'ث'), c.text))) : null));
}

function playerView({ title, scene, A, report }) {
  const canvas = h('canvas', { class: 'stage', role: 'img', 'aria-label': 'مشهد متحرك: ' + title });
  const cap = h('div', { class: 'caption', 'aria-live': 'polite' });
  const bar = h('input', { type: 'range', min: 0, max: scene.duration, step: 0.05, value: 0, 'aria-label': 'موضع المشهد' });
  const time = h('span', { class: 'time' });
  const playBtn = h('button', { class: 'play', 'aria-label': 'تشغيل' });
  let lastCap = null;
  const p = new Player(canvas, (t, pl) => {
    bar.value = t; time.textContent = `${AR(Math.floor(t))} / ${AR(Math.round(scene.duration))} ث`;
    playBtn.dataset.state = pl.playing ? 'pause' : t >= scene.duration - 0.05 ? 'replay' : 'play';
    playBtn.setAttribute('aria-label', pl.playing ? 'إيقاف مؤقت' : 'تشغيل');
    let c = null; for (const x of scene.captions) if (x.t <= t) c = x;
    if (c !== lastCap) { lastCap = c; cap.textContent = c ? c.text : ''; cap.classList.remove('in'); void cap.offsetWidth; if (c) cap.classList.add('in'); }
  });
  bar.addEventListener('input', () => p.seek(+bar.value));
  playBtn.addEventListener('click', () => p.toggle());
  const speed = h('button', { class: 'ghost', onclick: () => { p.speed = p.speed === 1 ? 0.5 : 1; speed.textContent = p.speed === 1 ? 'سرعة ×١' : 'سرعة ×½'; } }, 'سرعة ×١');
  const wrap = h('div', { class: 'stagewrap' }, canvas, cap);
  const full = h('button', { class: 'ghost', onclick: () => (document.fullscreenElement ? document.exitFullscreen() : wrap.requestFullscreen?.()) }, 'ملء الشاشة');
  canvas.addEventListener('click', () => p.toggle());
  current = p;
  queueMicrotask(() => { p.setScene(scene); setTimeout(() => p.play(), 350); });
  return h('div', { class: 'player' },
    h('div', { class: 'col-stage' }, wrap, h('div', { class: 'controls' }, playBtn, bar, time, speed, full),
      h('p', { class: 'note' }, 'المشهد وسيلة إيضاح للمعنى وليس تفسيرًا. المرجع هو التفسير أدناه وأهل العلم.')),
    h('div', { class: 'col-text' }, h('h2', {}, title), verseBlock(A), tafsirBlock(A), reportBlock(report)));
}

function curatedReport(item, A) {
  const checks = checkScene(item);
  return {
    mode: 'curated', tafsir: { source: 'التفسير الميسّر', visuals: [...new Set(item.elements.filter((e) => e.type !== 'label').map((e) => TYPE_NAMES[e.type]))] },
    review: { verdict: 'approve', checks, omitted: item.omitted }, paint: { elements: item.elements.map((e) => TYPE_NAMES[e.type]) },
    animate: { duration: item.duration, beats: item.captions.length }, timeline: item.captions,
  };
}

// ───────── الصفحات ─────────
const view = $('#view');
function mount(...nodes) { current?.destroy(); current = null; view.replaceChildren(...nodes); view.scrollTo?.(0, 0); window.scrollTo(0, 0); }

function pageLibrary() {
  const cats = [...new Set(LIBRARY.map((x) => x.cat))];
  mount(h('div', { class: 'page' },
    h('div', { class: 'hero' }, h('h1', {}, 'افهم الآية بالنظر'),
      h('p', {}, 'كل مشهد يحوّل معنى آية كونية أو مَثَل قرآني إلى حركة صامتة تُفهم دون شرح طويل، مع نصّ الآية والتفسير الميسّر، وتقرير يبيّن ما رُسم وما تُرك ولماذا.')),
    ...cats.map((cat) => h('section', {}, h('h2', { class: 'cat' }, cat),
      h('div', { class: 'grid' }, LIBRARY.filter((x) => x.cat === cat).map((item) => {
        const cv = h('canvas', { width: 480, height: 270 });
        requestAnimationFrame(() => drawScene(cv.getContext('2d'), 480, 270, item, item.duration * (item.thumb ?? 0.78)));
        const meta = h('small', {}, '…');
        load('chapters').then((CH) => { meta.textContent = `${CH[item.ref.s - 1].name} ${AR(item.ref.from)}${item.ref.to > item.ref.from ? '–' + AR(item.ref.to) : ''} · ${AR(item.duration)} ث`; });
        return h('button', { class: 'card', onclick: () => go('scene/' + item.id) }, cv, h('span', {}, h('b', {}, item.title), meta));
      }))))));
}

async function pageScene(id) {
  const item = LIBRARY.find((x) => x.id === id); if (!item) return go('library');
  mount(h('p', { class: 'loading' }, 'جارٍ التحميل…'));
  const A = await ayat(item.ref);
  mount(h('div', { class: 'page' }, h('button', { class: 'back', onclick: () => go('library') }, '→ المكتبة'), playerView({ title: item.title, scene: item, A, report: curatedReport(item, A) })));
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
  const key = store.get('key'), out = h('div', { class: 'result' }), steps = h('ol', { class: 'steps' });
  const btn = h('button', { class: 'primary' }, 'ابنِ المشهد');
  const mode = h('p', { class: 'mode' }, key ? `الوضع: وكلاء الذكاء الاصطناعي (${store.get('model', 'claude-opus-5-5')})` : 'الوضع: وكلاء دون اتصال (قواعد محلية). أضف مفتاح API من الإعدادات لتفعيل وكلاء الذكاء الاصطناعي.');
  const run = async () => {
    fix(); const ref = { s: +sel.value, from: +from.value, to: +to.value };
    store.set('s', String(ref.s)); store.set('a', String(ref.from));
    btn.disabled = true; out.replaceChildren(); current?.destroy(); current = null;
    const rows = Object.fromEntries(STEPS.map((id) => [id, h('li', { 'data-state': 'wait' }, h('b', {}, AGENT_NAMES[id]), h('span', {}))]));
    steps.replaceChildren(...Object.values(rows));
    const onStep = (id, state, detail) => { rows[id].dataset.state = state; if (detail) rows[id].lastChild.textContent = detail; };
    try {
      const A = await ayat(ref);
      const made = LIBRARY.find((x) => x.ref.s === ref.s && x.ref.from === ref.from && x.ref.to === ref.to);
      let res;
      if (key) { const { runLLM } = await import('./agents/llm.js'); res = await runLLM({ apiKey: key, model: store.get('model', 'claude-opus-5-5'), refText: A.refText, verse: A.verse, clean: A.clean, tafsir: A.tafsir }, onStep); }
      else res = await runOffline({ clean: A.clean, tafsir: A.tafsir }, onStep);
      if (res.ok) { res.report.timeline = res.scene.captions; out.replaceChildren(playerView({ title: A.refText, scene: res.scene, A, report: res.report })); }
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
  const tries = [[30, 48, 'الرياح والسحاب'], [35, 27, 'ثمرات وجبال'], [6, 99, 'نبات كل شيء'], [2, 164, 'آيات الكون'], [50, 9, 'ماء مبارك'], [2, 255, 'مثال: آية لا تُصوَّر']];
  mount(h('div', { class: 'page' },
    h('div', { class: 'hero' }, h('h1', {}, 'الاستوديو'), h('p', {}, 'اختر آية، فيعمل عليها أربعة وكلاء بالتتابع: يجمع الأول معناها من التفسير، ويراجعها الثاني شرعًا قبل الرسم وبعده، ويرسم الثالث مشهدها، ويحرّكه الرابع.')),
    h('div', { class: 'form' }, h('label', {}, 'السورة', sel), h('label', {}, 'من الآية', from), h('label', {}, 'إلى', to), btn),
    h('div', { class: 'tries' }, 'جرّب: ', tries.map(([s, a, t]) => h('button', { class: 'chipbtn', onclick: () => { sel.value = s; from.value = to.value = a; run(); } }, `${t} (${CH[s - 1].name} ${AR(a)})`))),
    mode, steps, out));
  fix();
}

function pageAbout() {
  const key = h('input', { type: 'password', value: store.get('key'), placeholder: 'sk-ant-…', autocomplete: 'off', dir: 'ltr', 'aria-label': 'مفتاح Anthropic API' });
  const model = h('select', { 'aria-label': 'النموذج' }, [['claude-opus-5-5', 'Claude Opus 5.5 (الافتراضي)'], ['claude-fable-5-2', 'Claude Fable 5.2 (الأقدر)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (أسرع)'], ['claude-haiku-5-5', 'Claude Haiku 5.5 (الأرخص)']].map(([v, t]) => h('option', { value: v }, t)));
  model.value = store.get('model', 'claude-opus-5-5');
  const msg = h('span', { class: 'saved', role: 'status' });
  mount(h('div', { class: 'page narrow' },
    h('div', { class: 'hero' }, h('h1', {}, 'الضوابط والإعدادات')),
    h('section', { class: 'panel' }, h('h3', {}, 'الضوابط الشرعية للمشاهد'), h('ol', { class: 'policy' }, POLICY.map((p) => h('li', {}, p))),
      h('p', { class: 'src' }, 'هذه الضوابط مبنية في المحرّك نفسه: مفردات الرسم لا تحتوي أصلًا على إنسان ولا حيوان بملامح ولا غيبيات، ثم يُفحص كل مشهد آليًا قبل عرضه. ومع ذلك فالتطبيق جهد بشري وآلي يحتمل الخطأ، ويُستحسن عرض المشاهد المولَّدة على طالب علم قبل نشرها أو تعليمها.')),
    h('section', { class: 'panel' }, h('h3', {}, 'وكلاء الذكاء الاصطناعي (اختياري)'),
      h('p', {}, 'المكتبة والوكلاء دون اتصال يعملون بلا إنترنت. لتوليد مشاهد أدقّ لأي آية أدخل مفتاح Anthropic API الخاص بك. يُحفظ المفتاح على هذا الجهاز فقط ولا يُرسل إلا إلى api.anthropic.com، وتُحتسب تكلفة الاستخدام على حسابك.'),
      h('div', { class: 'form' }, h('label', {}, 'مفتاح API', key), h('label', {}, 'النموذج', model),
        h('button', { class: 'primary', onclick: () => { store.set('key', key.value.trim()); store.set('model', model.value); msg.textContent = key.value.trim() ? 'حُفظ.' : 'حُذف المفتاح.'; } }, 'حفظ'),
        h('button', { class: 'ghost', onclick: () => { key.value = ''; store.set('key', ''); msg.textContent = 'حُذف المفتاح.'; } }, 'حذف المفتاح'), msg)),
    h('section', { class: 'panel' }, h('h3', {}, 'المصادر والحقوق'), h('ul', {},
      h('li', {}, 'نصّ القرآن الكريم: مشروع تنزيل (Tanzil.net)، الرسم العثماني، رخصة CC BY 3.0 — يُعرض كما هو دون أي تعديل.'),
      h('li', {}, 'التفسير: التفسير الميسّر، مجمع الملك فهد لطباعة المصحف الشريف (عبر QUL / Tarteel).'),
      h('li', {}, 'الخطوط: Amiri Quran و Tajawal برخصة SIL OFL.'),
      h('li', {}, 'شروح المشاهد صياغة مختصرة لمعنى التفسير الميسّر، وليست نصًّا قرآنيًا ولا تفسيرًا مستقلًا.'))),
    h('p', { class: 'ver' }, 'مَشهَدآية · الإصدار ١٫٠٫٠')));
}

// ───────── التنقّل ─────────
function go(route) { location.hash = '#/' + route; }
function router() {
  const r = location.hash.replace(/^#\//, '') || 'library', top = r.split('/')[0];
  document.querySelectorAll('.nav button').forEach((b) => b.toggleAttribute('aria-current', b.dataset.go === (top === 'scene' ? 'library' : top)));
  const page = top === 'scene' ? pageScene(r.split('/')[1]) : top === 'studio' ? pageStudio() : top === 'about' ? pageAbout() : pageLibrary();
  Promise.resolve(page).catch((e) => mount(h('p', { class: 'error', role: 'alert' }, e.message)));
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });
document.addEventListener('keydown', (e) => { if (e.code === 'Space' && current && !/INPUT|SELECT|BUTTON|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); current.toggle(); } });
window.addEventListener('hashchange', router);
document.fonts?.ready.then(() => current?.draw());
router();
