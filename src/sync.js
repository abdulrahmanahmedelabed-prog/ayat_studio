// التزامن: يربط زمن التلاوة بزمن المشهد ربطًا متعدد المراسي.
// كل تعليق له لفظ من الآية (q) يُثبَّت عند اللحظة التقديرية التي يبلغ فيها القارئ ذلك اللفظ،
// بتوزيع زمن كل آية على حروفها (بعد حذف التشكيل)، مع مراعاة سكتة البداية ونهاية كل آية.
const norm = (s) => (s || '')
  .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
  .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[^ء-ي ]/g, ' ').replace(/\s+/g, ' ').trim();

const LEAD = 0.35; // سكتة تقريبية قبل بدء القراءة في ملف كل آية
const TAIL = 0.45; // ونهايتها بعد آخر حرف

export function buildSync(scene, texts, durs) {
  const total = durs.reduce((a, b) => a + b, 0), D = scene.duration;
  if (!total || !D) return null;
  // نص متصل لكل الآيات مع بداية كل آية
  const parts = texts.map(norm); let full = '', starts = [], audioStart = [], acc = 0;
  parts.forEach((p, k) => { starts.push(full.length); full += p + ' '; audioStart.push(acc); acc += durs[k]; });
  const charToAudio = (off) => {
    let k = 0; while (k < parts.length - 1 && off >= starts[k + 1]) k++;
    const len = Math.max(1, parts[k].length), f = Math.min(1, Math.max(0, (off - starts[k]) / len)), d = durs[k];
    const speak = Math.max(0.2, d - LEAD - TAIL);
    return audioStart[k] + Math.min(d, LEAD + f * speak);
  };
  const anchors = [[0, 0]];
  let from = 0;
  for (const c of [...scene.captions].sort((a, b) => a.t - b.t)) {
    if (!c.q || c.t <= 0) continue;
    const q = norm(c.q); if (q.length < 2) continue;
    let at = full.indexOf(q, from);
    if (at < 0) { const w = q.split(' ').slice(0, 2).join(' '); at = full.indexOf(w, from); } // تطابق جزئي بأول كلمتين
    if (at < 0) continue;
    from = at + 1;
    const a = charToAudio(at) - 0.15, s = c.t; // التعليق يسبق اللفظ قليلًا ليُقرأ معه
    const last = anchors[anchors.length - 1];
    if (a > last[0] + 0.3 && s > last[1] + 0.3) anchors.push([a, s]);
  }
  // حدود الآيات في المشاهد المتعددة الآيات: تعليق يبدأ بـ﴿رقم﴾
  anchors.push([total, D]);
  anchors.sort((x, y) => x[0] - y[0]);
  const ok = anchors.filter((p, i) => i === 0 || (p[0] > anchors[i - 1][0] && p[1] > anchors[i - 1][1]));
  const interp = (x, xi, yi) => {
    if (x <= ok[0][xi]) return ok[0][yi];
    for (let i = 1; i < ok.length; i++) if (x <= ok[i][xi]) { const p = ok[i - 1], q = ok[i]; return p[yi] + (q[yi] - p[yi]) * (x - p[xi]) / (q[xi] - p[xi]); }
    return ok[ok.length - 1][yi];
  };
  return { anchors: ok.length, total, toScene: (a) => interp(a, 0, 1), toAudio: (s) => interp(s, 1, 0) };
}
