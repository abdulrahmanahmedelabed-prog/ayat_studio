// «لقطاتك الخاصة»: صور يولّدها المستخدم بنفسه (مثلًا في تطبيق Gemini) من أوصاف لقطات المشهد، ثم يستوردها.
// تُحفظ على الجهاز في IndexedDB، وتُستعمل بدل اللقطات المولَّدة، وتدخل في الفيديو المحفوظ.
const DB = 'mashhadaya', STORE = 'shots';
function db() {
  return new Promise((ok, bad) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => ok(r.result); r.onerror = () => bad(r.error);
  });
}
const tx = async (mode, fn) => { const d = await db(); return new Promise((ok, bad) => { const t = d.transaction(STORE, mode), q = fn(t.objectStore(STORE)); t.oncomplete = () => ok(q?.result); t.onerror = () => bad(t.error); }); };
export const getShots = (key) => tx('readonly', (s) => s.get(key)).catch(() => null);
export const saveShots = (key, blobs) => tx('readwrite', (s) => s.put(blobs, key));
export const clearShots = (key) => tx('readwrite', (s) => s.delete(key));
