// التلاوة: ملفات صوت لكل آية تُبثّ من الإنترنت وقت العرض (لا تُضمَّن في التطبيق).
// المصدر الأول خادم quran.com، والاحتياطي everyayah.com.
export const RECITERS = {
  husary: { name: 'محمود خليل الحصري', qc: 'Husary/mp3', ea: 'Husary_128kbps' },
  minshawi: { name: 'محمد صدّيق المنشاوي', qc: 'Minshawi/Murattal/mp3', ea: 'Minshawy_Murattal_128kbps' },
  abdulbaset: { name: 'عبد الباسط عبد الصمد', qc: 'AbdulBaset/Murattal/mp3', ea: 'Abdul_Basit_Murattal_192kbps' },
};
export const DEFAULT_RECITER = 'husary';

const pad = (n) => String(n).padStart(3, '0');
export function ayahUrls(s, a, id = DEFAULT_RECITER) {
  const r = RECITERS[id] || RECITERS[DEFAULT_RECITER], f = pad(s) + pad(a) + '.mp3';
  let base = null; try { base = localStorage.getItem('mash.audioBase'); } catch { /* لا تخزين */ }
  if (base) return [`${base.replace(/\/$/, '')}/${r.ea}/${f}`]; // خادم بديل (مرآة محلية أو للاختبار)
  return [`https://verses.quran.com/${r.qc}/${f}`, `https://everyayah.com/data/${r.ea}/${f}`];
}

/** قائمة تشغيل لآيات المشهد: تُحمَّل كلها، ثم تُعامَل كمقطع واحد متصل. */
export class Recitation {
  constructor(ref, reciter) {
    this.items = [];
    for (let a = ref.from; a <= ref.to; a++) this.items.push({ urls: ayahUrls(ref.s, a, reciter), dur: 0 });
    this.i = 0; this.rate = 1; this.playing = false; this.onend = null;
  }
  load(timeout = 15000) {
    // لكل آية: يجرّب المصدر الأول، وإن تأخّر أو فشل انتقل إلى الاحتياطي، ثم يعيد المحاولة مرة
    return (this.ready ||= Promise.all(this.items.map((it) => new Promise((ok, bad) => {
      const tries = [...it.urls, ...it.urls]; let u = -1, tmr = null, done = false;
      const el = new Audio(); el.preload = 'auto'; it.el = el;
      const next = () => {
        clearTimeout(tmr); if (done) return;
        if (++u >= tries.length) { done = true; return bad(new Error('audio')); }
        tmr = setTimeout(next, timeout); el.src = tries[u]; el.load();
      };
      el.addEventListener('loadedmetadata', () => { if (done) return; done = true; clearTimeout(tmr); it.dur = el.duration || 0; ok(); });
      el.addEventListener('error', () => next());
      el.addEventListener('ended', () => this.next());
      next();
    }))).then(() => { this.total = this.items.reduce((s, x) => s + x.dur, 0); if (!this.total) throw new Error('empty'); return this; })
      .catch((e) => { this.ready = null; throw e; })); // يسمح بإعادة المحاولة
  }
  get time() { let t = 0; for (let j = 0; j < this.i; j++) t += this.items[j].dur; return t + (this.items[this.i]?.el.currentTime || 0); }
  seekTime(t) { if (this.total) this.seekFrac(t / this.total); }
  seekFrac(f) {
    if (!this.total) return;
    let t = Math.max(0, Math.min(1, f)) * this.total, j = 0;
    while (j < this.items.length - 1 && t >= this.items[j].dur) { t -= this.items[j].dur; j++; }
    if (j !== this.i) this.items[this.i].el.pause();
    this.i = j; this.items[j].el.currentTime = Math.min(t, Math.max(0, this.items[j].dur - 0.05));
    if (this.playing) this.items[j].el.play().catch(() => {});
  }
  play() { this.playing = true; const el = this.items[this.i].el; el.playbackRate = this.rate; return el.play(); }
  pause() { this.playing = false; this.items[this.i]?.el.pause(); }
  setRate(r) { this.rate = r; for (const it of this.items) if (it.el) it.el.playbackRate = r; }
  next() {
    if (this.i < this.items.length - 1) { this.i++; const el = this.items[this.i].el; el.currentTime = 0; el.playbackRate = this.rate; if (this.playing) el.play().catch(() => {}); }
    else { this.playing = false; this.onend?.(); }
  }
  destroy() { this.pause(); for (const it of this.items) if (it.el) { it.el.removeAttribute('src'); it.el.load(); } }

  /** يجلب التلاوة كاملة ويفكّها لتسجيلها مع الفيديو (يتطلب أن يسمح الخادم بذلك). */
  async decode(ctx) {
    const bufs = [];
    for (const it of this.items) {
      let buf = null;
      for (const u of it.urls) { try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) { buf = await ctx.decodeAudioData(await r.arrayBuffer()); break; } } catch { /* المصدر التالي */ } }
      if (!buf) throw new Error('decode');
      bufs.push(buf);
    }
    const sr = bufs[0].sampleRate, ch = Math.max(...bufs.map((b) => b.numberOfChannels)), len = bufs.reduce((s, b) => s + b.length, 0);
    const out = ctx.createBuffer(ch, len, sr); let off = 0;
    for (const b of bufs) { for (let c = 0; c < ch; c++) out.getChannelData(c).set(b.getChannelData(Math.min(c, b.numberOfChannels - 1)), off); off += b.length; }
    return out;
  }
}
