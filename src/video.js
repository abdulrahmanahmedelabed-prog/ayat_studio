// فيديو بالذكاء الاصطناعي: Veo عبر مفتاح Gemini،
// أو تسليم الوصف لمواقع لها رصيد مجاني (يدخلها المستخدم بحسابه).
export const WEB_TOOLS = [
  { id: 'flow', name: 'Google Flow (Veo)', url: 'https://labs.google/fx/tools/flow', note: 'رصيد شهري مجاني محدود حسب الحساب والمنطقة' },
  { id: 'aistudio', name: 'Google AI Studio', url: 'https://aistudio.google.com/', note: 'تجربة Veo إن كانت متاحة لحسابك' },
  { id: 'kling', name: 'Kling AI', url: 'https://app.klingai.com/', note: 'نقاط يومية مجانية، علامة مائية' },
  { id: 'pixverse', name: 'PixVerse', url: 'https://app.pixverse.ai/', note: 'رصيد تسجيل ونقاط يومية' },
  { id: 'dreamina', name: 'Dreamina (Seedance)', url: 'https://dreamina.capcut.com/', note: 'رصيد مجاني محدود' },
  { id: 'hailuo', name: 'Hailuo AI (MiniMax)', url: 'https://hailuoai.video/', note: 'تجربة مجانية' },
  { id: 'runway', name: 'Runway', url: 'https://app.runwayml.com/', note: 'رصيد تجربة لمرة واحدة' },
];

export const videoPrompt = (shotPrompt) => `${shotPrompt}. Slow cinematic camera movement, natural motion, 16:9, 5-8 seconds, no text, no blood, no gore, do not depict prophets or angels.`;

const G = 'https://generativelanguage.googleapis.com/v1beta';
// يختار أحدث نموذج Veo متاح لهذا المفتاح
async function veoModel(key) {
  const r = await fetch(`${G}/models?pageSize=200`, { headers: { 'x-goog-api-key': key } });
  if (!r.ok) throw new Error('تعذّر جلب النماذج (' + r.status + ')');
  const ids = ((await r.json()).models || []).map((m) => m.name.replace('models/', '')).filter((n) => /^veo/.test(n));
  if (!ids.length) throw new Error('لا يتيح مفتاحك نماذج Veo. في Google AI Studio يتطلب Veo غالبًا تفعيل الفوترة؛ جرّب Google Flow أو Kling أو PixVerse.');
  const score = (n) => (n.match(/veo-(\d+)(?:\.(\d))?/) || []).slice(1).reduce((a, x, i) => a + (+x || 0) / (i ? 10 : 1), 0) + (/fast|lite/.test(n) ? 0.05 : 0);
  return ids.sort((a, b) => score(b) - score(a))[0];
}

export async function veo(key, prompt, onStatus) {
  const model = await veoModel(key);
  onStatus?.(`يولّد ${model}…`);
  const r = await fetch(`${G}/models/${model}:predictLongRunning`, { method: 'POST', headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { aspectRatio: '16:9', personGeneration: 'allow_adult' } }) });
  if (!r.ok) throw new Error(`رفض Veo الطلب (${r.status}): ${(await r.text()).slice(0, 200)}`);
  let op = await r.json();
  for (let i = 0; !op.done && i < 90; i++) {
    await new Promise((res) => setTimeout(res, 8000)); onStatus?.(`يولّد ${model}… ${(i + 1) * 8} ث`);
    op = await (await fetch(`${G}/${op.name}`, { headers: { 'x-goog-api-key': key } })).json();
  }
  if (op.error) throw new Error(op.error.message);
  const uri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!uri) throw new Error('لم يُرجع Veo فيديو (ربما حجبه مرشّح الأمان).');
  return URL.createObjectURL(await (await fetch(uri, { headers: { 'x-goog-api-key': key } })).blob());
}

