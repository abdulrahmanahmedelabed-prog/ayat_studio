// التنبيه بالتحديث: النسخ المثبّتة (ويندوز وأندرويد) تقرأ version.json من الموقع عند الفتح،
// وإن وُجدت نسخة أحدث يظهر شريط فيه زر التنزيل. نسخة الموقع نفسها محدّثة دائمًا فلا تحتاجه.
export const APP_VERSION = __APP_VERSION__;

const ls = { get: (k) => { try { return localStorage.getItem('mash.' + k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem('mash.' + k, v); } catch { /* لا تخزين */ } } };

export const platform = () => (/; wv\)/.test(navigator.userAgent) ? 'android' : /Electron\//.test(navigator.userAgent) ? 'windows' : 'web');

/** يقارن رقمي إصدار مثل 1.10.0 و 1.9.2؛ يُرجع موجبًا إن كان a أحدث. */
export function cmp(a, b) {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; }
  return 0;
}

/** يجلب أحدث إصدار؛ يُرجع { version, notes, url } أو null إن لم توجد نسخة أحدث. يرمي خطأ عند تعذّر الاتصال. */
export async function checkUpdate() {
  const ctl = new AbortController(), tmr = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch((ls.get('updateUrl') || __UPDATE_URL__) + '?t=' + Date.now(), { signal: ctl.signal, cache: 'no-store' });
    if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    if (!j?.version || cmp(j.version, APP_VERSION) <= 0) return null;
    const pf = platform();
    return { version: j.version, notes: j.notes || '', url: pf === 'android' ? j.android : j.windows };
  } finally { clearTimeout(tmr); }
}

/** يفحص عند فتح التطبيق مرة كل ست ساعات، ويعرض الشريط ما لم يؤجّله المستخدم لهذا الإصدار. */
export async function autoCheck(show) {
  if (platform() === 'web' && !ls.get('updateForce')) return;
  const last = +(ls.get('updateChecked') || 0);
  if (Date.now() - last < 6 * 3600e3 && !ls.get('updateForce')) { const c = ls.get('updateCached'); if (c) { const u = JSON.parse(c); if (cmp(u.version, APP_VERSION) > 0 && ls.get('updateSkip') !== u.version) show(u); } return; }
  try {
    const u = await checkUpdate(); ls.set('updateChecked', String(Date.now())); ls.set('updateCached', u ? JSON.stringify(u) : '');
    if (u && ls.get('updateSkip') !== u.version) show(u);
  } catch { /* لا اتصال: يُعاد الفحص في الفتح التالي */ }
}
export const skip = (v) => ls.set('updateSkip', v);
