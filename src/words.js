// مطابقة ألفاظ الآية: يربط كل لقطة بكلماتها في نص المصحف لتُظلَّل أثناء العرض.
const LETTER = /[ء-يٱ-ۓ]/;
const MERGE = new Set(['يا', 'ويا', 'فيا', 'ها']);

/** يُرجع لكل آية قائمة كلمات المصحف مع مقابلها الإملائي، أو null إن تعذّرت المطابقة. */
export function alignAyah(uthmani, clean) {
  const u = [];
  for (const tok of uthmani.split(/\s+/).filter(Boolean)) LETTER.test(tok) || !u.length ? u.push(tok) : (u[u.length - 1] += ' ' + tok);
  let c = clean.split(/\s+/).filter(Boolean);
  if (c.length !== u.length) {
    const m = [];
    for (let i = 0; i < c.length; i++) MERGE.has(c[i]) && i + 1 < c.length ? m.push(c[i] + ' ' + c[++i]) : m.push(c[i]);
    c = m;
  }
  return c.length === u.length ? u.map((w, i) => ({ u: w, c: c[i] })) : null;
}

/** يبحث عن عبارة q (إملائية) في قائمة الكلمات المسطّحة ويُرجع [بداية، نهاية] أو null. */
export function findPhrase(words, q, after = 0) {
  const qs = q.split(/\s+/), flat = words.map((w) => w.c);
  const at = (from) => { for (let i = from; i + qs.length <= flat.length; i++) if (qs.every((x, j) => flat[i + j] === x)) return [i, i + qs.length - 1]; return null; };
  return at(after) || at(0);
}
