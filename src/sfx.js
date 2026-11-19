// أصوات الطبيعة تُولَّد بالكود (لا ملفات): مطر، ريح، بحر، طير، ورعد يلي كل برق.
// تُقرأ من عناصر المشهد الظاهرة في اللحظة الحالية.
export class Sfx {
  constructor() { this.ctx = null; this.on = false; this.flash = -1; }
  start() {
    if (this.dead) return;
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      const ctx = (this.ctx = new C()), n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf; this.master = ctx.createGain(); this.master.gain.value = 0.7; this.master.connect(ctx.destination);
      const bed = (type, freq, q) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = ctx.createGain(); g.gain.value = 0; s.connect(f).connect(g).connect(this.master); s.start(); return { g, f }; };
      this.rain = bed('bandpass', 1800, 0.6); this.wind = bed('bandpass', 380, 1.2); this.sea = bed('lowpass', 520, 0.7);
    }
    this.ctx.resume?.().catch(() => {}); this.on = true;
  }
  close() { this.dead = true; this.on = false; this.ctx?.close().catch(() => {}); }
  stop() { this.on = false; if (!this.ctx || this.ctx.state === 'closed') return; const t = this.ctx.currentTime; for (const b of [this.rain, this.wind, this.sea]) b.g.gain.setTargetAtTime(0, t, 0.15); }
  duck(v) { if (this.master) this.master.gain.setTargetAtTime(v ? 0.3 : 0.7, this.ctx.currentTime, 0.3); }
  thunder(delay) {
    const ctx = this.ctx, t = ctx.currentTime + delay, s = ctx.createBufferSource(); s.buffer = this.noise;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(90, t + 2.5);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.6, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 3);
    s.connect(f).connect(g).connect(this.master); s.start(t); s.stop(t + 3.1);
  }
  chirp() {
    const ctx = this.ctx, t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f0 = 2600 + Math.random() * 1600;
    o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.45, t + 0.07); o.frequency.exponentialRampToValueAtTime(f0 * 0.9, t + 0.14);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.2);
  }
  update(scene, t) {
    if (!this.on || !this.ctx || this.ctx.state === 'closed') return;
    const live = (type) => scene.elements.filter((e) => e.type === type && t >= (e.from ?? 0) && (e.until == null || t < e.until));
    const now = this.ctx.currentTime, set = (b, v) => b.g.gain.setTargetAtTime(v, now, 0.4);
    const rain = live('rain'), wind = live('wind'), sea = [...live('sea'), ...live('twoSeas'), ...live('depths')];
    set(this.rain, Math.min(0.5, rain.reduce((s, e) => s + 0.3 * (e.intensity ?? 1), 0) + live('hail').length * 0.15));
    set(this.wind, Math.min(0.55, wind.reduce((s, e) => s + 0.32 * (e.intensity ?? 1), 0)));
    this.wind.f.frequency.setTargetAtTime(320 + 160 * Math.sin(t * 0.7), now, 0.5);
    set(this.sea, sea.length ? 0.22 + 0.12 * Math.sin(t * 0.9) : 0);
    for (const l of live('lightning')) { // نفس توقيت البرق في المحرّك
      const k = t * 0.37 + (l.seed || 0.3), idx = Math.floor(k);
      if (k % 1 < 0.07 && idx !== this.flash) { this.flash = idx; this.thunder(0.35 + Math.random() * 0.5); }
    }
    if ((live('birds').length || live('bees').length) && Math.random() < 0.035) this.chirp();
  }
}
