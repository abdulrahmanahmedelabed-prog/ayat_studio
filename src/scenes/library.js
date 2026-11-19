// مكتبة المشاهد المُعدّة يدويًا. نصّ الآية والتفسير لا يُكتبان هنا أبدًا:
// يُسحبان وقت العرض من بيانات المصحف (تنزيل) والتفسير الميسّر المضمَّنة.
// الشروح (captions) صياغة مختصرة لمعنى التفسير الميسّر، وليست نصًّا قرآنيًا.
const pre = { growFrom: -6, growTo: -1 };

export const LIBRARY = [
  {
    id: 'rain-revival', title: 'إحياء الأرض الميتة', cat: 'آيات كونية', ref: { s: 7, from: 57, to: 57 }, duration: 30,
    sky: [{ t: 0, mode: 'day' }, { t: 5, mode: 'day' }, { t: 10, mode: 'storm' }, { t: 19, mode: 'storm' }, { t: 25, mode: 'day' }],
    elements: [
      { type: 'sun', x: 0.84, y: 0.15, until: 9 }, { type: 'mountains', count: 3, seed: 8 },
      { type: 'ground', greenFrom: 14, greenTo: 24, swell: 0.4 },
      { type: 'wind', from: 2, until: 11 }, { type: 'clouds', from: 5, to: 11, gather: true, count: 6, dark: 0.15, darkTo: 0.75, size: 1.2, until: 22 },
      { type: 'rain', from: 11, until: 20 },
      { type: 'plants', kind: 'grass', growFrom: 14, growTo: 22, count: 40 }, { type: 'plants', kind: 'flowers', growFrom: 18, growTo: 25, count: 14, seed: 4 },
      { type: 'tree', x: 0.22, growFrom: 16, growTo: 24, fruit: true, fruitFrom: 24 }, { type: 'tree', x: 0.74, size: 1.15, growFrom: 17, growTo: 25, fruit: true, fruitFrom: 25, fruitColor: '#f0a531' },
    ],
    captions: [
      { t: 0, text: 'بلدٌ ميّت: أرض مجدبة يبس زرعها وشجرها' }, { t: 2.5, text: 'يرسل الله الرياح مبشِّراتٍ بالغيث' },
      { t: 6, text: 'تحمل الرياحُ سحابًا ثقيلًا مُحمَّلًا بالمطر' }, { t: 9, text: 'يُساق السحاب لإحياء البلد الميت' },
      { t: 12, text: 'فينزل به الماء' }, { t: 17, text: 'فيخرج به الكلأ والشجر والزرع، وتعود الأشجار محمَّلة بالثمرات' },
      { t: 25.5, text: 'كما أُحييت الأرض الميتة بالمطر يُخرج الله الموتى — تذكرةٌ لمن يعتبر' },
    ],
    omitted: ['البعث من القبور غيبٌ لا يُصوَّر؛ اكتُفي بالإشارة إليه نصًّا.'],
  },
  {
    id: 'earth-stirs', title: 'اهتزّت ورَبَت', cat: 'آيات كونية', ref: { s: 41, from: 39, to: 39 }, duration: 23,
    sky: [{ t: 0, mode: 'day' }, { t: 4, mode: 'day' }, { t: 7, mode: 'storm' }, { t: 13, mode: 'storm' }, { t: 18, mode: 'day' }],
    elements: [
      { type: 'sun', x: 0.2, y: 0.16, until: 6 }, { type: 'mountains', count: 2, seed: 14, size: 0.8 },
      { type: 'ground', greenFrom: 10, greenTo: 19, swell: 1 },
      { type: 'clouds', from: 3, to: 7, gather: true, count: 5, dark: 0.2, darkTo: 0.7, until: 16.5 }, { type: 'rain', from: 7, until: 14 },
      { type: 'plants', kind: 'grass', growFrom: 10.5, growTo: 19, count: 46 }, { type: 'plants', kind: 'flowers', growFrom: 14, growTo: 21, count: 12, seed: 6 },
    ],
    captions: [
      { t: 0, text: 'ترى الأرض خاشعة: يابسة لا نبات فيها' }, { t: 6.5, text: 'فإذا نزل عليها المطر' },
      { t: 10.5, text: 'دبّت فيها الحياة وتحركت بالنبات' }, { t: 14.5, text: 'وانتفخت وعَلَت' },
      { t: 19, text: 'الذي أحيا هذه الأرض بعد موتها قادرٌ على إحياء الموتى' },
    ],
    omitted: ['إحياء الموتى غيبٌ لا يُصوَّر؛ ذُكر نصًّا فقط.'],
  },
  {
    id: 'night-day-orbits', title: 'الليل والنهار والفَلَك', cat: 'آيات كونية', ref: { s: 36, from: 37, to: 40 }, duration: 36,
    sky: [{ t: 0, mode: 'day' }, { t: 3, mode: 'day' }, { t: 7, mode: 'dusk' }, { t: 10, mode: 'night' }],
    elements: [
      { type: 'stars', from: 8 }, { type: 'sun', motion: 'set', x0: -0.3, x1: 0.9, from: 0, to: 9, until: 9.5 },
      { type: 'orbits', from: 11, until: 18.5 }, { type: 'moon', row: true, from: 18.5, to: 26, until: 28 }, { type: 'orbits', from: 28 },
      { type: 'mountains', count: 4, seed: 3, size: 0.75 }, { type: 'ground', green: 0.45, cracks: false },
    ],
    captions: [
      { t: 0, text: 'نهارٌ مضيء' }, { t: 4, text: 'يُنزَع النهار من الليل' }, { t: 8.5, text: 'فإذا الناس مظلمون' },
      { t: 11.5, text: 'والشمس تجري لمستقرٍّ قدّره الله لها، لا تتعداه ولا تقصر عنه' },
      { t: 18.5, text: 'والقمر مقدَّر منازل: يبدأ هلالًا ضئيلًا حتى يكتمل' }, { t: 23.5, text: 'ثم يعود ضئيلًا مقوّسًا كعِذق النخلة القديم' },
      { t: 28, text: 'لا الشمس تلحق القمر، ولا الليل يسبق النهار' }, { t: 32, text: 'وكلٌّ في فلكٍ يجرون' },
    ],
    omitted: ['رسم الأفلاك تخطيط توضيحي لمعنى «كلٌّ في فلك»، وليس تمثيلًا فلكيًا دقيقًا.'],
  },
  {
    id: 'cradle-pegs', title: 'الأرض مهادًا والجبال أوتادًا', cat: 'آيات كونية', ref: { s: 78, from: 6, to: 7 }, duration: 20, horizon: 0.56,
    sky: [{ t: 0, mode: 'dawn' }, { t: 6, mode: 'day' }],
    elements: [
      { type: 'sun', motion: 'rise', x0: 0.1, x1: 0.5, to: 14 }, { type: 'clouds', count: 3, y: 0.14, size: 0.8 },
      { type: 'ground', green: 0.7, cracks: false }, { type: 'plants', kind: 'grass', ...pre, count: 34 },
      { type: 'mountains', count: 3, seed: 5, snow: true, until: 9.5 }, { type: 'mountains', count: 3, seed: 5, snow: true, roots: true, from: 8.3, to: 15 },
    ],
    captions: [
      { t: 0, text: 'الأرض ممهَّدة مبسوطة كالفراش' }, { t: 8.5, text: 'والجبال أوتاد: رواسٍ ممتدة في الأرض' }, { t: 14.5, text: 'كي لا تتحرك الأرض بأهلها' },
    ],
    omitted: [],
  },
  {
    id: 'bees', title: 'وأوحى ربك إلى النحل', cat: 'آيات كونية', ref: { s: 16, from: 68, to: 69 }, duration: 28,
    sky: [{ t: 0, mode: 'day' }],
    elements: [
      { type: 'sun', x: 0.14, y: 0.14 }, { type: 'mountains', count: 3, seed: 26, size: 1.15 }, { type: 'ground', green: 0.85, cracks: false },
      { type: 'tree', x: 0.16, ...pre, fruit: true, fruitFrom: 0 }, { type: 'tree', x: 0.42, kind: 'vine', ...pre, fruit: true, fruitFrom: 0 },
      { type: 'plants', kind: 'flowers', ...pre, count: 34 }, { type: 'bees', x: 0.8, y: 0.36, from: 1, to: 24, count: 14 },
    ],
    captions: [
      { t: 0, text: 'ألهم الله النحل أن تتخذ بيوتًا في الجبال، وفي الشجر، وفيما يَعرِش الناس' },
      { t: 7, text: 'ثم تأكل من كل الثمرات' }, { t: 12, text: 'وتسلك طرق ربها مذلَّلة، لا تضل في العودة وإن بعدت' },
      { t: 18, text: 'يخرج من بطونها عسل مختلف الألوان' }, { t: 23, text: 'فيه شفاء للناس — آية لقوم يتفكرون' },
    ],
    omitted: ['النحل مرموز له بنقاط متحركة بلا ملامح، اجتنابًا لتصوير ذوات الأرواح.'],
  },
  {
    id: 'good-tree', title: 'كلمة طيبة كشجرة طيبة', cat: 'أمثال قرآنية', ref: { s: 14, from: 24, to: 25 }, duration: 27, horizon: 0.7,
    sky: [{ t: 0, mode: 'dawn' }, { t: 9, mode: 'day' }],
    elements: [
      { type: 'sun', motion: 'rise', x0: 0.78, x1: 0.9, to: 20, size: 0.9 }, { type: 'clouds', count: 3, y: 0.12, size: 0.7 },
      { type: 'ground', green: 0.6, cracks: false }, { type: 'plants', kind: 'grass', ...pre, count: 26 },
      { type: 'tree', kind: 'palm', x: 0.5, size: 1.3, growFrom: 3, growTo: 14, roots: true, rootsFrom: 1, fruit: true, fruitFrom: 16 },
    ],
    captions: [
      { t: 0, text: 'مَثَلُ كلمة التوحيد كشجرة طيبة' }, { t: 4, text: 'أصلها ثابت متمكّن في الأرض' },
      { t: 10, text: 'وأعلاها مرتفع نحو السماء' }, { t: 16, text: 'تعطي ثمارها كل حين بإذن ربها' },
      { t: 21.5, text: 'كذلك شجرة الإيمان: أصلها ثابت في القلب، وفرعها عمل صالح' },
    ],
    omitted: ['رُسمت نخلةً أخذًا بما في التفسير الميسّر.'],
  },
  {
    id: 'seven-ears', title: 'حبة أنبتت سبع سنابل', cat: 'أمثال قرآنية', ref: { s: 2, from: 261, to: 261 }, duration: 25, horizon: 0.76,
    sky: [{ t: 0, mode: 'dawn' }, { t: 8, mode: 'day' }],
    elements: [
      { type: 'sun', motion: 'rise', x0: 0.1, x1: 0.34, to: 18 }, { type: 'ground', green: 0.3, cracks: false },
      { type: 'grain', x: 0.5, size: 0.74, from: 0.5, to: 19 }, { type: 'label', text: '٧ سنابل × ١٠٠ حبة = ٧٠٠', x: 0.2, y: 0.34, from: 18.5 },
    ],
    captions: [
      { t: 0, text: 'حبة واحدة زُرعت في أرض طيبة' }, { t: 5, text: 'أخرجت ساقًا' }, { t: 8.5, text: 'تشعّبت منه سبع سنابل' },
      { t: 13.5, text: 'في كل سنبلة مئة حبة' }, { t: 19, text: 'كذلك النفقة في سبيل الله، والله يضاعف لمن يشاء' },
    ],
    omitted: ['المنفِقون لا يُصوَّرون؛ صُوِّر المشبَّه به (الحبة) فقط.'],
  },
  {
    id: 'garden-hill', title: 'جنّة بربوة', cat: 'أمثال قرآنية', ref: { s: 2, from: 265, to: 265 }, duration: 27, horizon: 0.8,
    sky: [{ t: 0, mode: 'day' }, { t: 3, mode: 'day' }, { t: 6.5, mode: 'storm' }, { t: 12, mode: 'storm' }, { t: 16, mode: 'day' }],
    elements: [
      { type: 'ground', green: 0.8, hill: 0.7, cracks: false }, { type: 'plants', kind: 'grass', ...pre, count: 30 },
      { type: 'tree', x: 0.36, size: 0.66, ...pre, fruit: true, fruitFrom: 12.5 }, { type: 'tree', x: 0.5, size: 0.78, ...pre, fruit: true, fruitFrom: 13, fruitColor: '#f0a531' }, { type: 'tree', x: 0.64, size: 0.7, kind: 'olive', ...pre, fruit: true, fruitFrom: 13.5 },
      { type: 'clouds', from: 2.5, to: 6.5, gather: true, count: 6, dark: 0.2, darkTo: 0.8, y: 0.07, size: 0.75, until: 16.5 },
      { type: 'rain', from: 6.5, until: 13, intensity: 1.5 }, { type: 'rain', from: 18.5, until: 24, intensity: 0.22, seed: 8 },
      { type: 'label', text: 'ضِعفين', x: 0.5, y: 0.2, from: 14, until: 18 },
    ],
    captions: [
      { t: 0, text: 'بستان عظيم بربوة: أرض عالية طيبة' }, { t: 6.5, text: 'أصابه وابل: مطر غزير' },
      { t: 13, text: 'فتضاعفت ثمراته' }, { t: 18.5, text: 'وإن لم يصبه الوابل فيكفيه الطلّ: رذاذ المطر' },
      { t: 22.5, text: 'كذلك نفقة المخلصين تُقبل وتُضاعف، قلّت أم كثرت' },
    ],
    omitted: ['المنفِقون لا يُصوَّرون؛ صُوِّر المشبَّه به (البستان) فقط.'],
  },
  {
    id: 'deep-darkness', title: 'ظلمات في بحر لُجّي', cat: 'أمثال قرآنية', ref: { s: 24, from: 40, to: 40 }, duration: 25,
    sky: [{ t: 0, mode: 'storm' }, { t: 10, mode: 'storm' }, { t: 17, mode: 'deep' }],
    elements: [
      { type: 'depths', y: 0.3, from: 0, to: 19 }, { type: 'clouds', from: 10.5, to: 15, gather: true, count: 7, dark: 0.92, y: 0.13, size: 1.3, drift: 0.4 },
      { type: 'label', text: 'بحر لُجّي عميق', x: 0.5, y: 0.86, from: 1, until: 17 }, { type: 'label', text: 'موج', x: 0.5, y: 0.6, from: 5, until: 17 },
      { type: 'label', text: 'موج من فوقه', x: 0.5, y: 0.37, from: 8, until: 17 }, { type: 'label', text: 'سحاب من فوقه', x: 0.5, y: 0.2, from: 13, until: 17 },
    ],
    captions: [
      { t: 0, text: 'بحر عميق' }, { t: 5, text: 'يعلوه موج' }, { t: 8, text: 'ومن فوق الموج موج آخر' }, { t: 12.5, text: 'ومن فوقه سحاب كثيف' },
      { t: 16.5, text: 'ظلمات شديدة بعضها فوق بعض، لا يكاد الناظر يرى شيئًا' }, { t: 21, text: 'كذلك أعمال الكافر — ومن لم يجعل الله له نورًا فما له من نور' },
    ],
    omitted: ['اليد والناظر المذكوران في الآية لا يُصوَّران؛ عُبِّر عن المعنى بانطفاء الضوء.'],
  },
  {
    id: 'two-seas', title: 'مرج البحرين', cat: 'آيات كونية', ref: { s: 55, from: 19, to: 20 }, duration: 21, horizon: 0.4,
    sky: [{ t: 0, mode: 'day' }],
    elements: [
      { type: 'sun', x: 0.5, y: 0.14 }, { type: 'clouds', count: 4, y: 0.16, size: 0.8 }, { type: 'twoSeas', from: 0, to: 9, barrierFrom: 10 },
      { type: 'label', text: 'مِلح', x: 0.2, y: 0.72, from: 2 }, { type: 'label', text: 'عذب', x: 0.8, y: 0.72, from: 2 }, { type: 'label', text: 'برزخ', x: 0.5, y: 0.55, from: 11.5 },
    ],
    captions: [
      { t: 0, text: 'بحران: عذب ومِلح' }, { t: 4, text: 'يلتقيان، لا فاصل بينهما في مرأى العين' },
      { t: 10, text: 'ومع ذلك بينهما حاجز' }, { t: 14.5, text: 'فلا يطغى أحدهما على الآخر: يبقى العذب عذبًا والمِلح مِلحًا' },
    ],
    omitted: ['البرزخ في التفسير غير مرئي للعين؛ أُظهر خطًّا مضيئًا للتوضيح فقط.'],
  },
  {
    id: 'flood-foam', title: 'الزَّبَد وما ينفع الناس', cat: 'أمثال قرآنية', ref: { s: 13, from: 17, to: 17 }, duration: 28, horizon: 0.5,
    sky: [{ t: 0, mode: 'day' }, { t: 2, mode: 'day' }, { t: 5, mode: 'storm' }, { t: 13, mode: 'storm' }, { t: 18, mode: 'day' }],
    elements: [
      { type: 'mountains', count: 4, seed: 19 }, { type: 'ground', green: 0.4, cracks: false },
      { type: 'clouds', from: 1.5, to: 5, gather: true, count: 6, dark: 0.2, darkTo: 0.75, y: 0.12, until: 17.5 }, { type: 'rain', from: 4.5, until: 14 },
      { type: 'river', from: 6, to: 13, foam: true, foamFadeFrom: 16, foamFadeTo: 22.5, size: 1.3 },
      { type: 'plants', kind: 'grass', growFrom: 20, growTo: 26, count: 30, depth: 0.2 },
    ],
    captions: [
      { t: 0, text: 'أنزل الله من السماء ماءً' }, { t: 6, text: 'فجرت به الأودية، كلٌّ بقدر صغره وكبره' },
      { t: 11, text: 'فحمل السيل زبدًا رابيًا: غثاءً طافيًا لا نفع فيه' }, { t: 16, text: 'فأما الزبد فيذهب جُفاءً: يتلاشى ويُرمى' },
      { t: 20.5, text: 'وأما ما ينفع الناس فيمكث في الأرض' }, { t: 24.5, text: 'كذلك الحق يبقى، والباطل يتلاشى' },
    ],
    omitted: ['المَثَل الثاني في الآية (المعادن التي يوقَد عليها) لم يُرسم في هذا المشهد.'],
  },
  {
    id: 'spider-house', title: 'أوهن البيوت', cat: 'أمثال قرآنية', ref: { s: 29, from: 41, to: 41 }, duration: 23, horizon: 0.8,
    sky: [{ t: 0, mode: 'dusk' }, { t: 9, mode: 'dusk' }, { t: 14, mode: 'storm' }],
    elements: [
      { type: 'ground', green: 0.3, cracks: false }, { type: 'web', x: 0.5, y: 0.4, windFrom: 9, tearFrom: 12, tearTo: 19 }, { type: 'wind', from: 9, intensity: 1.5 },
    ],
    captions: [
      { t: 0, text: 'بيتٌ عملته العنكبوت لنفسها ليحفظها' }, { t: 5, text: 'خيوط واهية لا تدفع شيئًا' },
      { t: 9.5, text: 'فلم يُغنِ عنها شيئًا عند حاجتها إليه' }, { t: 15, text: 'وإن أضعف البيوت لَبيت العنكبوت' },
      { t: 19, text: 'كذلك من اتخذ من دون الله أولياء: لا ينفعونه ولا يضرونه' },
    ],
    omitted: ['العنكبوت نفسها لم تُرسم؛ رُسم بيتها فقط.', 'الريح تمثيل بصري لـ«عند حاجتها إليه» وليست مذكورة في الآية.'],
  },
  {
    id: 'worldly-life', title: 'مَثَل الحياة الدنيا', cat: 'أمثال قرآنية', ref: { s: 18, from: 45, to: 45 }, duration: 29,
    sky: [{ t: 0, mode: 'storm' }, { t: 6, mode: 'storm' }, { t: 10, mode: 'day' }, { t: 16, mode: 'day' }, { t: 22, mode: 'dusk' }],
    elements: [
      { type: 'mountains', count: 3, seed: 33, size: 0.8 }, { type: 'ground', greenFrom: 5, greenTo: 11, dryFrom: 15, dryTo: 25 },
      { type: 'clouds', count: 6, dark: 0.7, darkTo: 0.1, to: 10, until: 12 }, { type: 'rain', from: 0.5, until: 7 },
      { type: 'plants', kind: 'flowers', growFrom: 5, growTo: 12, witherFrom: 15, witherTo: 25, scatter: true, count: 44, size: 1.25 },
      { type: 'wind', from: 20.5, intensity: 1.6 },
    ],
    captions: [
      { t: 0, text: 'ماء أنزله الله من السماء' }, { t: 5.5, text: 'فخرج به النبات وصار مخضرًّا بهيجًا' },
      { t: 14, text: 'وما هي إلا مدة يسيرة...' }, { t: 17, text: 'حتى صار هشيمًا: يابسًا متكسّرًا' },
      { t: 21, text: 'تنسفه الرياح إلى كل جهة' }, { t: 25, text: 'كذلك الدنيا: بهجة سريعة الزوال، والله على كل شيء مقتدر' },
    ],
    omitted: [],
  },
  {
    id: 'ashes-wind', title: 'كرماد اشتدّت به الريح', cat: 'أمثال قرآنية', ref: { s: 14, from: 18, to: 18 }, duration: 21, horizon: 0.72,
    sky: [{ t: 0, mode: 'dusk' }, { t: 4, mode: 'dusk' }, { t: 8, mode: 'storm' }],
    elements: [
      { type: 'ground', green: 0, cracks: false, color: '#9a8468' }, { type: 'clouds', from: 4, to: 9, gather: true, count: 5, dark: 0.7, y: 0.14 },
      { type: 'ashes', x: 0.4, size: 1.3, blowFrom: 5.5, to: 16 }, { type: 'wind', from: 5, intensity: 1.9 },
    ],
    captions: [
      { t: 0, text: 'رماد' }, { t: 5, text: 'اشتدّت به الريح في يوم عاصف' }, { t: 11, text: 'فلم تترك له أثرًا' },
      { t: 16, text: 'كذلك أعمال من كفر بربه: لا يجدون منها ما ينفعهم عند الله' },
    ],
    omitted: ['الأشخاص وأعمالهم لا يُصوَّرون؛ صُوِّر المشبَّه به (الرماد) فقط.'],
  },
  {
    id: 'sun-moon', title: 'الشمس ضياءً والقمر نورًا', cat: 'آيات كونية', ref: { s: 10, from: 5, to: 5 }, duration: 25,
    sky: [{ t: 0, mode: 'dawn' }, { t: 4, mode: 'day' }, { t: 8, mode: 'day' }, { t: 11, mode: 'dusk' }, { t: 13.5, mode: 'night' }],
    elements: [
      { type: 'stars', from: 12 }, { type: 'sun', motion: 'arc', from: 0, to: 12, until: 12.5 }, { type: 'moon', row: true, from: 14, to: 21 },
      { type: 'mountains', count: 4, seed: 44, size: 0.8 }, { type: 'ground', green: 0.5, cracks: false }, { type: 'plants', kind: 'grass', ...pre, count: 24 },
    ],
    captions: [
      { t: 0, text: 'جعل الله الشمس ضياءً' }, { t: 5, text: 'فبالشمس تُعرف الأيام' }, { t: 13, text: 'وجعل القمر نورًا' },
      { t: 16, text: 'وقدّره منازل' }, { t: 20, text: 'وبالقمر تُعرف الشهور والأعوام: عدد السنين والحساب' },
    ],
    omitted: [],
  },
  {
    id: 'one-water', title: 'ماء واحد وثمرٌ شتّى', cat: 'آيات كونية', ref: { s: 16, from: 10, to: 11 }, duration: 27, horizon: 0.66,
    sky: [{ t: 0, mode: 'storm' }, { t: 7, mode: 'storm' }, { t: 11, mode: 'day' }],
    elements: [
      { type: 'mountains', count: 3, seed: 52, size: 0.8 }, { type: 'ground', greenFrom: 5, greenTo: 12 },
      { type: 'clouds', count: 6, dark: 0.7, darkTo: 0.1, to: 11, y: 0.13 }, { type: 'rain', from: 0.5, until: 8.5 }, { type: 'sun', x: 0.86, y: 0.14, from: 11 },
      { type: 'plants', kind: 'crop', growFrom: 7, growTo: 14, count: 38, x0: 0.02, x1: 0.98 },
      { type: 'tree', kind: 'olive', x: 0.2, size: 1.1, growFrom: 10.5, growTo: 16, fruit: true, fruitFrom: 16 },
      { type: 'tree', kind: 'palm', x: 0.5, size: 1.15, growFrom: 13.5, growTo: 19, fruit: true, fruitFrom: 19 },
      { type: 'tree', kind: 'vine', x: 0.8, size: 1.3, growFrom: 16.5, growTo: 21, fruit: true, fruitFrom: 21 },
    ],
    captions: [
      { t: 0, text: 'أنزل الله من السحاب مطرًا' }, { t: 3.5, text: 'منه ماء يُشرب، ومنه شجر ومرعى' }, { t: 7.5, text: 'يُخرج به الزروع المختلفة' },
      { t: 11, text: 'والزيتون' }, { t: 14, text: 'والنخيل' }, { t: 17, text: 'والأعناب' }, { t: 21.5, text: 'ومن كل الثمرات — ماء واحد وثمار شتّى: آية لقوم يتفكرون' },
    ],
    omitted: ['الدوابّ التي تُسام في الشجر لم تُرسم.'],
  },
];

// ───────── مشاهد الإصدار ١٫١ ─────────
LIBRARY.push(
  {
    id: 'piled-clouds', title: 'سحابٌ يُزجى ثم يُركَم', cat: 'آيات كونية', ref: { s: 24, from: 43, to: 43 }, duration: 33,
    sky: [{ t: 0, mode: 'day' }, { t: 6, mode: 'day' }, { t: 13, mode: 'storm' }],
    camera: [{ t: 0, zoom: 1 }, { t: 9, zoom: 1 }, { t: 14, zoom: 1.22, x: 0.5, y: 0.25 }, { t: 17, zoom: 1.22, x: 0.5, y: 0.25 }, { t: 21, zoom: 1 }],
    elements: [
      { type: 'sun', x: 0.86, y: 0.13, until: 10 }, { type: 'mountains', count: 4, seed: 71, size: 0.7 }, { type: 'ground', green: 0.55, cracks: false },
      { type: 'plants', kind: 'grass', ...pre, count: 26 }, { type: 'wind', from: 0, until: 9 },
      { type: 'clouds', count: 5, dark: 0.05, y: 0.2, size: 0.8, drift: 2.2, until: 7 },
      { type: 'clouds', from: 5, to: 10, gather: true, count: 6, dark: 0.2, darkTo: 0.55, y: 0.24, size: 1.15, drift: 0.3 },
      { type: 'clouds', from: 10, to: 14, gather: true, count: 5, dark: 0.5, darkTo: 0.8, y: 0.15, size: 1.4, drift: 0.2, seed: 5 },
      { type: 'clouds', from: 11.5, to: 15, gather: true, count: 4, dark: 0.6, darkTo: 0.9, y: 0.07, size: 1.5, drift: 0.15, seed: 9 },
      { type: 'rain', from: 15.5, until: 29 }, { type: 'hail', from: 20, until: 28 }, { type: 'lightning', from: 24.5 },
    ],
    captions: [
      { t: 0, text: 'يسوق الله السحاب إلى حيث يشاء', q: 'يزجي سحابا' }, { t: 5.5, text: 'ثم يجمعه بعد تفرقه', q: 'ثم يؤلف بينه' },
      { t: 10.5, text: 'ثم يجعله متراكمًا', q: 'ثم يجعله ركاما' }, { t: 15.5, text: 'فينزل المطر من بينه', q: 'فترى الودق يخرج من خلاله' },
      { t: 20, text: 'وينزل من السحاب الذي يشبه الجبال في عظمته بَرَدًا', q: 'وينزل من السماء من جبال فيها من برد' },
      { t: 24.5, text: 'يكاد ضوء برقه من شدته يذهب بالأبصار', q: 'يكاد سنا برقه يذهب بالأبصار' },
    ],
    omitted: ['إصابة البَرَد لمن يشاء الله وصرفه عمّن يشاء لم تُصوَّر؛ لا يُرسم أشخاص.'],
  },
  {
    id: 'winds-clouds', title: 'الرياح تثير سحابًا', cat: 'آيات كونية', ref: { s: 30, from: 48, to: 48 }, duration: 26,
    sky: [{ t: 0, mode: 'day' }, { t: 9, mode: 'day' }, { t: 14, mode: 'storm' }],
    elements: [
      { type: 'sun', x: 0.14, y: 0.13, until: 12 }, { type: 'mountains', count: 3, seed: 77, size: 0.75 }, { type: 'ground', green: 0.5, cracks: false },
      { type: 'plants', kind: 'grass', ...pre, count: 30 }, { type: 'wind', from: 0, intensity: 1.3, until: 13 },
      { type: 'clouds', from: 3.5, to: 8, gather: true, count: 4, dark: 0.15, darkTo: 0.45, y: 0.24, size: 1.1 },
      { type: 'clouds', from: 8, to: 11.5, gather: true, count: 9, dark: 0.3, darkTo: 0.7, y: 0.14, size: 0.9, seed: 12, drift: 1.4 },
      { type: 'rain', from: 14.5 },
    ],
    captions: [
      { t: 0, text: 'يرسل الله الرياح', q: 'يرسل الرياح' }, { t: 4, text: 'فتثير سحابًا مثقلًا بالماء', q: 'فتثير سحابا' },
      { t: 8.5, text: 'فينشره الله في السماء كيف يشاء', q: 'فيبسطه في السماء كيف يشاء' }, { t: 11.5, text: 'ويجعله قطعًا متفرقة', q: 'ويجعله كسفا' },
      { t: 14.5, text: 'فترى المطر يخرج من بين السحاب', q: 'فترى الودق يخرج من خلاله' }, { t: 20, text: 'فإذا ساقه الله إلى عباده استبشروا وفرحوا', q: 'إذا هم يستبشرون' },
    ],
    omitted: ['العباد المستبشرون لا يُصوَّرون.'],
  },
  {
    id: 'colors', title: 'مختلفٌ ألوانها', cat: 'آيات كونية', ref: { s: 35, from: 27, to: 27 }, duration: 29, horizon: 0.66,
    sky: [{ t: 0, mode: 'storm' }, { t: 4, mode: 'storm' }, { t: 8, mode: 'day' }],
    camera: [{ t: 0, zoom: 1 }, { t: 6, zoom: 1.3, x: 0.5, y: 0.72 }, { t: 12.5, zoom: 1.3, x: 0.5, y: 0.72 }, { t: 15.5, zoom: 1.3, x: 0.6, y: 0.36 }, { t: 20, zoom: 1.3, x: 0.3, y: 0.36 }, { t: 25, zoom: 1 }],
    elements: [
      { type: 'mountains', count: 2, seed: 92, size: 1.0, color: '#1b1a20' }, { type: 'mountains', count: 3, seed: 81, size: 0.95, color: '#8b7d74', streaks: true, streakFrom: 13 },
      { type: 'ground', greenFrom: 3, greenTo: 8 }, { type: 'clouds', count: 6, dark: 0.7, darkTo: 0.05, to: 8, y: 0.1, until: 10 }, { type: 'rain', from: 0.5, until: 6 },
      { type: 'plants', kind: 'grass', growFrom: 3, growTo: 9, count: 28 },
      { type: 'tree', x: 0.2, size: 0.85, growFrom: 4, growTo: 9, fruit: true, fruitFrom: 9 }, { type: 'tree', x: 0.4, size: 0.9, growFrom: 4.5, growTo: 9.5, fruit: true, fruitFrom: 9.5, fruitColor: '#f1c40f' },
      { type: 'tree', x: 0.6, size: 0.85, growFrom: 5, growTo: 10, fruit: true, fruitFrom: 10, fruitColor: '#2b2030' }, { type: 'tree', x: 0.8, size: 0.9, growFrom: 5.5, growTo: 10.5, fruit: true, fruitFrom: 10.5, fruitColor: '#f08a3c' },
      { type: 'label', text: 'بيض وحُمر', x: 0.62, y: 0.2, from: 15, until: 20.5 }, { type: 'label', text: 'سود', x: 0.28, y: 0.14, from: 21, until: 25.5 },
    ],
    captions: [
      { t: 0, text: 'أنزل الله من السماء ماء', q: 'أنزل من السماء ماء' }, { t: 6, text: 'فأخرج به ثمرات مختلفًا ألوانها: الأحمر والأسود والأصفر وغير ذلك', q: 'فأخرجنا به ثمرات مختلفا ألوانها' },
      { t: 13.5, text: 'ومن الجبال طرائق بيض وحُمر مختلف ألوانها', q: 'ومن الجبال جدد بيض وحمر مختلف ألوانها' }, { t: 20.5, text: 'وجبال شديدة السواد', q: 'وغرابيب سود' },
    ],
    omitted: [],
  },
  {
    id: 'shadow', title: 'كيف مدَّ الظل', cat: 'آيات كونية', ref: { s: 25, from: 45, to: 46 }, duration: 29, horizon: 0.6,
    sky: [{ t: 0, mode: 'dawn' }, { t: 6, mode: 'dawn' }, { t: 13, mode: 'day' }],
    elements: [
      { type: 'stars', until: 3 }, { type: 'sun', motion: 'rise', x0: 0.06, x1: 0.94, from: 6, to: 28 }, { type: 'mountains', count: 3, seed: 15, size: 0.6 },
      { type: 'ground', green: 0.6, cracks: false }, { type: 'plants', kind: 'grass', ...pre, count: 22, depth: 0.3 },
      { type: 'shadow', x: 0.42, from: 6 }, { type: 'tree', x: 0.42, size: 1.05, ...pre },
    ],
    captions: [
      { t: 0, text: 'مدَّ الله الظل من طلوع الفجر إلى طلوع الشمس', q: 'كيف مد الظل' }, { t: 6, text: 'ولو شاء لجعله ثابتًا مستقرًّا لا تزيله الشمس', q: 'ولو شاء لجعله ساكنا' },
      { t: 11, text: 'ثم جعل الشمس علامة يُستدَلّ بأحوالها على أحواله', q: 'ثم جعلنا الشمس عليه دليلا' },
      { t: 17, text: 'ثم تقلّص الظل يسيرًا يسيرًا', q: 'ثم قبضناه إلينا قبضا يسيرا' }, { t: 23, text: 'فكلما ازداد ارتفاع الشمس ازداد نقصانه' },
    ],
    omitted: [],
  },
  {
    id: 'bare-rock', title: 'صفوانٌ عليه تراب', cat: 'أمثال قرآنية', ref: { s: 2, from: 264, to: 264 }, duration: 27, horizon: 0.72,
    sky: [{ t: 0, mode: 'day' }, { t: 5, mode: 'day' }, { t: 9, mode: 'storm' }, { t: 17, mode: 'storm' }, { t: 21, mode: 'day' }],
    camera: [{ t: 0, zoom: 1.15, x: 0.5, y: 0.6 }, { t: 9, zoom: 1.15, x: 0.5, y: 0.6 }, { t: 13, zoom: 1.35, x: 0.5, y: 0.64 }, { t: 20, zoom: 1.35, x: 0.5, y: 0.64 }, { t: 24, zoom: 1.1, x: 0.5, y: 0.6 }],
    elements: [
      { type: 'sun', x: 0.84, y: 0.14, until: 8 }, { type: 'mountains', count: 3, seed: 37, size: 0.6 }, { type: 'ground', green: 0.12, cracks: false },
      { type: 'rock', x: 0.5, size: 0.95, washFrom: 10.5, washTo: 18 },
      { type: 'clouds', from: 5.5, to: 9.5, gather: true, count: 6, dark: 0.2, darkTo: 0.85, y: 0.1, until: 21 }, { type: 'rain', from: 9.5, until: 18.5, intensity: 1.7 },
    ],
    captions: [
      { t: 0, text: 'حجر أملس عليه تراب', q: 'كمثل صفوان عليه تراب' }, { t: 9.5, text: 'هطل عليه مطر غزير', q: 'فأصابه وابل' },
      { t: 13.5, text: 'فأزاح عنه التراب' }, { t: 18.5, text: 'فتركه أملس لا شيء عليه', q: 'فتركه صلدا' },
      { t: 22.5, text: 'كذلك المراؤون: تضمحلّ أعمالهم ولا يجدون شيئًا من ثواب ما أنفقوا', q: 'لا يقدرون على شيء مما كسبوا' },
    ],
    omitted: ['المنفِق رياءً لا يُصوَّر؛ صُوِّر المشبَّه به (الصفوان) فقط.'],
  },
  {
    id: 'evil-tree', title: 'كشجرة خبيثة اجتُثّت', cat: 'أمثال قرآنية', ref: { s: 14, from: 26, to: 26 }, duration: 23, horizon: 0.7,
    sky: [{ t: 0, mode: 'dusk' }, { t: 8, mode: 'dusk' }, { t: 13, mode: 'storm' }],
    camera: [{ t: 0, zoom: 1.45, x: 0.5, y: 0.7 }, { t: 9, zoom: 1.45, x: 0.5, y: 0.7 }, { t: 14, zoom: 1, x: 0.5, y: 0.5 }],
    elements: [
      { type: 'mountains', count: 3, seed: 58, size: 0.55 }, { type: 'ground', green: 0.25, cracks: false },
      { type: 'bitter', x: 0.44, size: 1.5, uprootFrom: 11.5, uprootTo: 17.5 }, { type: 'wind', from: 9.5, intensity: 1.8 },
    ],
    captions: [
      { t: 0, text: 'مَثَل كلمة الكفر كشجرة خبيثة المأكل والمطعم: شجرة الحنظل', q: 'كلمة خبيثة كشجرة خبيثة' },
      { t: 5.5, text: 'عروقها قريبة من سطح الأرض، لا أصل ثابت لها ولا فرع صاعد' },
      { t: 11.5, text: 'اقتُلعت من أعلى الأرض', q: 'اجتثت من فوق الأرض' }, { t: 17.5, text: 'ما لها من ثبات — كذلك الكافر لا ثبات له ولا خير فيه', q: 'ما لها من قرار' },
    ],
    omitted: ['الريح تمثيل بصري للاقتلاع وليست مذكورة في الآية.'],
  },
  {
    id: 'two-lands', title: 'البلد الطيب والذي خبُث', cat: 'أمثال قرآنية', ref: { s: 7, from: 58, to: 58 }, duration: 27, horizon: 0.6,
    sky: [{ t: 0, mode: 'storm' }, { t: 7, mode: 'storm' }, { t: 11, mode: 'day' }],
    elements: [
      { type: 'mountains', count: 4, seed: 63, size: 0.6 },
      { type: 'ground', x0: 0.5, x1: 1, greenFrom: 7, greenTo: 15 }, { type: 'ground', x0: 0, x1: 0.5, color: '#c9c0ad', green: 0 },
      { type: 'clouds', count: 7, dark: 0.75, darkTo: 0.1, to: 11, y: 0.11, until: 13 }, { type: 'rain', from: 0.5, until: 9 },
      { type: 'plants', kind: 'grass', growFrom: 8, growTo: 14, count: 26, x0: 0.53, x1: 0.98 }, { type: 'plants', kind: 'flowers', growFrom: 9, growTo: 15, count: 18, x0: 0.53, x1: 0.98, seed: 3 },
      { type: 'tree', x: 0.78, size: 0.8, growFrom: 9, growTo: 15, fruit: true, fruitFrom: 15 },
      { type: 'plants', kind: 'grass', poor: true, growFrom: 14, growTo: 21, count: 7, x0: 0.05, x1: 0.45, size: 0.5, seed: 44 },
      { type: 'label', text: 'أرض طيبة', x: 0.75, y: 0.3, from: 8, until: 22 }, { type: 'label', text: 'أرض سَبِخة', x: 0.25, y: 0.3, from: 15, until: 22 },
    ],
    captions: [
      { t: 0, text: 'ينزل المطر على الأرضَين' }, { t: 8, text: 'الأرض النقية تُخرج نباتها طيبًا ميسَّرًا بإذن ربها', q: 'والبلد الطيب يخرج نباته بإذن ربه' },
      { t: 15, text: 'والأرض السَّبِخة الرديئة لا تُخرج إلا عسرًا رديئًا لا نفع فيه', q: 'والذي خبث لا يخرج إلا نكدا' },
      { t: 22, text: 'كذلك المؤمن ينتفع بآيات الله، والكافر لا ينتفع بها', q: 'كذلك نصرف الآيات لقوم يشكرون' },
    ],
    omitted: ['المؤمن والكافر لا يُصوَّران؛ صُوِّرت الأرضان فقط.'],
  },
  {
    id: 'mirage', title: 'كسرابٍ بقيعة', cat: 'أمثال قرآنية', ref: { s: 24, from: 39, to: 39 }, duration: 25, horizon: 0.58,
    sky: [{ t: 0, mode: 'day' }],
    camera: [{ t: 0, zoom: 1 }, { t: 8, zoom: 1.05, x: 0.5, y: 0.58 }, { t: 18, zoom: 1.9, x: 0.5, y: 0.6 }, { t: 21, zoom: 1.9, x: 0.5, y: 0.6 }, { t: 24, zoom: 1.5, x: 0.5, y: 0.6 }],
    elements: [
      { type: 'sun', x: 0.5, y: 0.09, size: 1.15 }, { type: 'ground', color: '#dfbd80', green: 0, cracks: false }, { type: 'mirage', x: 0.5, from: 2.5, fadeFrom: 12.5, fadeTo: 18 },
    ],
    captions: [
      { t: 0, text: 'أرض مستوية وقت الظهيرة', q: 'بقيعة' }, { t: 3, text: 'يُشاهَد عليها السراب كأنه ماء', q: 'كسراب' },
      { t: 8, text: 'يظنه العطشان ماء', q: 'يحسبه الظمآن ماء' }, { t: 13, text: 'فإذا أتاه لم يجده ماء', q: 'حتى إذا جاءه لم يجده شيئا' },
      { t: 19.5, text: 'كذلك أعمال الكافر: يظنها نافعة له فلا يجد لها ثوابًا', q: 'والذين كفروا أعمالهم' },
    ],
    omitted: ['الظمآن لا يُصوَّر؛ اقتراب الكاميرا يمثّل مجيئه إلى السراب.', 'الحساب يوم القيامة غيب لا يُصوَّر؛ ذُكر في التفسير أدناه.'],
  },
  {
    id: 'springs-crop', title: 'ينابيع ثم زرعٌ ثم حُطام', cat: 'آيات كونية', ref: { s: 39, from: 21, to: 21 }, duration: 33,
    sky: [{ t: 0, mode: 'storm' }, { t: 6, mode: 'storm' }, { t: 10, mode: 'day' }, { t: 19, mode: 'day' }, { t: 26, mode: 'dusk' }],
    elements: [
      { type: 'mountains', count: 3, seed: 88, size: 0.8 }, { type: 'ground', greenFrom: 8, greenTo: 14, dryFrom: 19, dryTo: 28 },
      { type: 'clouds', count: 6, dark: 0.7, darkTo: 0.1, to: 10, y: 0.12, until: 12 }, { type: 'rain', from: 0.5, until: 7 },
      { type: 'river', from: 6, to: 11, size: 0.55, y: 0.72 },
      { type: 'plants', kind: 'crop', growFrom: 11, growTo: 17, witherFrom: 19, witherTo: 28, count: 30, depth: 0.5 },
      { type: 'plants', kind: 'flowers', growFrom: 12, growTo: 18, witherFrom: 19.5, witherTo: 28, count: 22, depth: 0.5, seed: 6 },
    ],
    captions: [
      { t: 0, text: 'أنزل الله من السحاب مطرًا', q: 'أنزل من السماء ماء' }, { t: 6, text: 'فأدخله في الأرض وجعله عيونًا نابعة ومياهًا جارية', q: 'فسلكه ينابيع في الأرض' },
      { t: 11.5, text: 'ثم يُخرج به زرعًا مختلفًا ألوانه وأنواعه', q: 'ثم يخرج به زرعا مختلفا ألوانه' }, { t: 19, text: 'ثم ييبس بعد خضرته ونضارته فتراه مصفرًّا', q: 'ثم يهيج فتراه مصفرا' },
      { t: 24.5, text: 'ثم يجعله حطامًا متكسّرًا متفتتًا', q: 'ثم يجعله حطاما' }, { t: 29, text: 'في ذلك ذكرى وموعظة لأصحاب العقول', q: 'لذكرى لأولي الألباب' },
    ],
    omitted: [],
  },
  {
    id: 'seed-split', title: 'فالق الحَبّ والنوى', cat: 'آيات كونية', ref: { s: 6, from: 95, to: 95 }, duration: 26, horizon: 0.5,
    sky: [{ t: 0, mode: 'dawn' }, { t: 8, mode: 'day' }],
    camera: [{ t: 0, zoom: 1.5, x: 0.7, y: 0.6 }, { t: 9, zoom: 1.5, x: 0.7, y: 0.56 }, { t: 12, zoom: 1.5, x: 0.3, y: 0.6 }, { t: 20, zoom: 1.5, x: 0.3, y: 0.56 }, { t: 23.5, zoom: 1, x: 0.5, y: 0.5 }],
    elements: [
      { type: 'sun', motion: 'rise', x0: 0.4, x1: 0.6, to: 24, size: 0.8 }, { type: 'ground', green: 0.25, cracks: false },
      { type: 'sprout', kind: 'grain', x: 0.7, size: 1.1, from: 0.5, to: 10 }, { type: 'sprout', kind: 'stone', x: 0.3, size: 1.1, from: 0.5, to: 21 },
    ],
    captions: [
      { t: 0, text: 'حبّة في باطن الأرض' }, { t: 2.5, text: 'يشقّ الله الحبّ فيُخرج منه الزرع', q: 'فالق الحب' },
      { t: 11, text: 'ويشقّ النوى فيُخرج منه الشجر', q: 'والنوى' }, { t: 21, text: 'ذلكم الله: فاعل هذا هو الله وحده لا شريك له', q: 'ذلكم الله' },
    ],
    omitted: ['«يخرج الحي من الميت» مثاله في التفسير الإنسان والحيوان من النطفة؛ لم يُصوَّر، واقتصر المشهد على فلق الحب والنوى.'],
    thumb: 0.95,
  },
  {
    id: 'ships-still', title: 'الجوارِ في البحر كالأعلام', cat: 'آيات كونية', ref: { s: 42, from: 32, to: 33 }, duration: 27, horizon: 0.44,
    sky: [{ t: 0, mode: 'day' }],
    elements: [
      { type: 'sun', x: 0.82, y: 0.12 }, { type: 'clouds', count: 4, y: 0.14, size: 0.8, drift: 1.6 }, { type: 'sea', y: 0.44, storm: 1.5, stormTo: 0.2, from: 0, to: 17 },
      { type: 'ship', x0: 0.72, x1: 0.56, size: 0.9, dy: 0.06, from: 0, to: 12.5, slackFrom: 12 }, { type: 'ship', x0: 0.1, x1: 0.42, size: 2.3, dy: 0.24, from: 0, to: 12.5, slackFrom: 12 },
      { type: 'wind', from: 0, until: 12.5, intensity: 1.2 },
    ],
    captions: [
      { t: 0, text: 'السفن العظيمة كالجبال تجري في البحر', q: 'الجوار في البحر كالأعلام' }, { t: 11.5, text: 'إن يشأ الله يُسكن الريح', q: 'إن يشأ يسكن الريح' },
      { t: 16, text: 'فتبقى السفن سواكن على ظهر البحر لا تجري', q: 'فيظللن رواكد على ظهره' }, { t: 21.5, text: 'في جريها ووقوفها آيات لكل صبّار شكور', q: 'لآيات لكل صبار شكور' },
    ],
    omitted: [],
  },
  {
    id: 'food', title: 'فلينظر الإنسان إلى طعامه', cat: 'آيات كونية', ref: { s: 80, from: 24, to: 32 }, duration: 34, horizon: 0.66,
    sky: [{ t: 0, mode: 'storm' }, { t: 6, mode: 'storm' }, { t: 10, mode: 'day' }],
    camera: [{ t: 0, zoom: 1 }, { t: 6, zoom: 1 }, { t: 8, zoom: 1.6, x: 0.5, y: 0.72 }, { t: 11, zoom: 1.6, x: 0.5, y: 0.72 }, { t: 14, zoom: 1 }],
    elements: [
      { type: 'mountains', count: 3, seed: 21, size: 0.65 }, { type: 'ground', greenFrom: 10.5, greenTo: 17 },
      { type: 'clouds', count: 6, dark: 0.75, darkTo: 0.1, to: 10, y: 0.11, until: 12 }, { type: 'rain', from: 0.3, until: 7.5, intensity: 1.7 },
      { type: 'sprout', kind: 'grain', x: 0.5, size: 0.75, from: 6.5, to: 12, until: 14.5 },
      { type: 'plants', kind: 'crop', growFrom: 11, growTo: 16, count: 34 }, { type: 'plants', kind: 'grass', growFrom: 14.5, growTo: 19, count: 26, seed: 8 },
      { type: 'tree', kind: 'vine', x: 0.12, size: 1.25, growFrom: 14, growTo: 18, fruit: true, fruitFrom: 18 },
      { type: 'tree', kind: 'olive', x: 0.33, size: 1, growFrom: 17.5, growTo: 21.5, fruit: true, fruitFrom: 21.5 }, { type: 'tree', kind: 'palm', x: 0.54, size: 1.1, growFrom: 18.5, growTo: 22.5, fruit: true, fruitFrom: 22.5 },
      { type: 'tree', x: 0.74, size: 1.2, growFrom: 22, growTo: 26, fruit: true, fruitFrom: 26.5 }, { type: 'tree', x: 0.91, size: 1.3, growFrom: 22.5, growTo: 26.5, fruit: true, fruitFrom: 27, fruitColor: '#f0a531' },
    ],
    captions: [
      { t: 0, text: 'فليتدبر الإنسان كيف خلق الله طعامه', q: 'فلينظر الإنسان إلى طعامه' }, { t: 2.5, text: 'صُبَّ الماء على الأرض صبًّا', q: 'صببنا الماء صبا' },
      { t: 7, text: 'ثم شُقَّت الأرض بما خرج منها من نبات', q: 'شققنا الأرض شقا' }, { t: 11.5, text: 'فنبت فيها الحَبّ', q: 'فأنبتنا فيها حبا' },
      { t: 14.5, text: 'والعنب وعلف الدوابّ', q: 'وعنبا وقضبا' }, { t: 18, text: 'والزيتون والنخل', q: 'وزيتونا ونخلا' },
      { t: 22.5, text: 'وحدائق عظيمة الأشجار', q: 'وحدائق غلبا' }, { t: 26.5, text: 'وثمار وكلأ', q: 'وفاكهة وأبا' }, { t: 30, text: 'متاعًا لكم ولأنعامكم', q: 'متاعا لكم ولأنعامكم' },
    ],
    omitted: ['الإنسان والأنعام لا يُصوَّرون.'],
  },
  {
    id: 'adjacent-plots', title: 'قِطَعٌ متجاورات', cat: 'آيات كونية', ref: { s: 13, from: 4, to: 4 }, duration: 30, horizon: 0.7,
    sky: [{ t: 0, mode: 'day' }],
    elements: [
      { type: 'sun', x: 0.12, y: 0.13 }, { type: 'clouds', count: 3, y: 0.13, size: 0.75 }, { type: 'mountains', count: 3, seed: 47, size: 0.6 },
      { type: 'ground', x0: 0.2, x1: 1, green: 0.75, cracks: false }, { type: 'ground', x0: 0, x1: 0.2, color: '#c9c0ad', green: 0 },
      { type: 'river', from: 17, to: 21, size: 0.45, y: 0.75 },
      { type: 'plants', kind: 'grass', ...pre, count: 22, x0: 0.22, x1: 0.98, depth: 0.4 },
      { type: 'tree', kind: 'vine', x: 0.88, size: 1.3, growFrom: 5, growTo: 9, fruit: true, fruitFrom: 22 }, { type: 'tree', kind: 'vine', x: 0.74, size: 1.1, growFrom: 5.5, growTo: 9.5, fruit: true, fruitFrom: 22.5 },
      { type: 'plants', kind: 'crop', growFrom: 9, growTo: 12.5, count: 16, x0: 0.52, x1: 0.66, depth: 0.5, seed: 2 },
      { type: 'tree', kind: 'palm', twin: true, x: 0.42, size: 0.85, growFrom: 12, growTo: 16, fruit: true, fruitFrom: 23 },
      { type: 'tree', kind: 'palm', x: 0.28, size: 0.95, growFrom: 13.5, growTo: 17, fruit: true, fruitFrom: 23.5 },
      { type: 'label', text: 'صِنوان', x: 0.44, y: 0.16, from: 14, until: 21 }, { type: 'label', text: 'غير صِنوان', x: 0.22, y: 0.24, from: 15.5, until: 21 },
    ],
    captions: [
      { t: 0, text: 'في الأرض قطع يجاور بعضها بعضًا: منها الطيّب، ومنها السَّبِخ الذي لا يُنبت', q: 'وفي الأرض قطع متجاورات' },
      { t: 5, text: 'وبساتين من أعناب', q: 'وجنات من أعناب' }, { t: 9, text: 'وزروع مختلفة', q: 'وزرع' },
      { t: 12.5, text: 'ونخيل مجتمع في منبت واحد، وغير مجتمع', q: 'ونخيل صنوان وغير صنوان' }, { t: 17.5, text: 'كل ذلك في تربة واحدة ويشرب من ماء واحد', q: 'يسقى بماء واحد' },
      { t: 22.5, text: 'ويختلف في الثمار والطعم، وبعضها أفضل من بعض في الأكل', q: 'ونفضل بعضها على بعض في الأكل' },
    ],
    omitted: [],
  },
);

// ───────── مشاهد الإصدار ١٫٣ ─────────
LIBRARY.push(
  {
    id: 'shams', title: 'والشمس وضحاها', cat: 'آيات كونية', ref: { s: 91, from: 1, to: 4 }, duration: 30,
    sky: [{ t: 0, mode: 'dawn' }, { t: 5, mode: 'day' }, { t: 12, mode: 'day' }, { t: 15, mode: 'dusk' }, { t: 18, mode: 'night' }, { t: 21.5, mode: 'dawn' }, { t: 25, mode: 'day' }],
    elements: [
      { type: 'stars', from: 16, until: 23 }, { type: 'sun', motion: 'arc', x0: 0.1, x1: 0.9, from: 0, to: 16, until: 16.2 },
      { type: 'moon', motion: 'arc', x0: 0.06, x1: 0.84, phase: 0.5, from: 9, to: 22, until: 22.5 },
      { type: 'sun', motion: 'rise', x0: 0.1, x1: 0.4, from: 21.5, to: 30 },
      { type: 'mountains', count: 4, seed: 101, size: 0.7 }, { type: 'ground', green: 0.6, cracks: false }, { type: 'plants', kind: 'grass', ...pre, count: 28 },
    ],
    captions: [
      { t: 0, text: 'الشمس وإشراقها ضحى', q: 'والشمس وضحاها' }, { t: 9, text: 'والقمر إذا تبعها في طلوعه ومغيبه', q: 'والقمر إذا تلاها' },
      { t: 16, text: 'والليل حين يغطي الأرض فيكون ما عليها مظلمًا', q: 'والليل إذا يغشاها' }, { t: 22, text: 'والنهار إذا جلّى الظلمة وكشفها', q: 'والنهار إذا جلاها' },
    ],
    omitted: ['رُتّبت اللقطات على تتابع الظواهر في السماء؛ لقطة الليل قبل النهار وفي الآيات النهار قبل الليل.'],
  },
  {
    id: 'dawn-split', title: 'فالق الإصباح', cat: 'آيات كونية', ref: { s: 6, from: 96, to: 96 }, duration: 28,
    sky: [{ t: 0, mode: 'night' }, { t: 3, mode: 'night' }, { t: 8, mode: 'dawn' }, { t: 12, mode: 'day' }, { t: 15, mode: 'dusk' }, { t: 18, mode: 'night' }],
    elements: [
      { type: 'stars', until: 9 }, { type: 'stars', from: 16.5, seed: 4 }, { type: 'sun', motion: 'rise', x0: 0.4, x1: 0.5, from: 5, to: 13, until: 14.5 },
      { type: 'orbits', from: 18 }, { type: 'mountains', count: 4, seed: 66, size: 0.75 }, { type: 'ground', green: 0.5, cracks: false }, { type: 'plants', kind: 'grass', ...pre, count: 22 },
    ],
    captions: [
      { t: 0, text: 'ظلام الليل' }, { t: 4, text: 'يشقّ الله ضياء الصباح من ظلام الليل', q: 'فالق الإصباح' },
      { t: 14, text: 'وجعل الليل مستقرًّا يسكن فيه من تعب بالنهار', q: 'وجعل الليل سكنا' },
      { t: 18.5, text: 'وجعل الشمس والقمر يجريان بحساب متقن لا يتغير ولا يضطرب', q: 'والشمس والقمر حسبانا' }, { t: 24, text: 'ذلك تقدير العزيز العليم', q: 'ذلك تقدير العزيز العليم' },
    ],
    omitted: [],
  },
  {
    id: 'two-signs', title: 'الليل والنهار آيتين', cat: 'آيات كونية', ref: { s: 17, from: 12, to: 12 }, duration: 27,
    sky: [{ t: 0, mode: 'night' }, { t: 6, mode: 'night' }, { t: 10, mode: 'dawn' }, { t: 13, mode: 'day' }, { t: 19, mode: 'day' }, { t: 22, mode: 'dusk' }, { t: 24.5, mode: 'night' }],
    elements: [
      { type: 'stars', until: 11 }, { type: 'stars', from: 23, seed: 9 }, { type: 'moon', x: 0.7, y: 0.2, phase: 0.5, until: 10 },
      { type: 'sun', motion: 'arc', x0: 0.08, x1: 0.92, from: 8.5, to: 24.5, until: 24.5 },
      { type: 'mountains', count: 3, seed: 13, size: 0.7 }, { type: 'ground', green: 0.65, cracks: false },
      { type: 'plants', kind: 'flowers', ...pre, count: 26 }, { type: 'tree', x: 0.2, size: 0.9, ...pre, fruit: true, fruitFrom: -1 },
    ],
    captions: [
      { t: 0, text: 'جعل الله الليل والنهار علامتين', q: 'وجعلنا الليل والنهار آيتين' },
      { t: 4.5, text: 'فمحا علامة الليل — وهي القمر — بضوء النهار', q: 'فمحونا آية الليل' },
      { t: 11, text: 'وجعل علامة النهار — وهي الشمس — مضيئة يُبصَر بها', q: 'وجعلنا آية النهار مبصرة' },
      { t: 16, text: 'ليبتغي الناس فضل ربهم في معاشهم', q: 'لتبتغوا فضلا من ربكم' }, { t: 21.5, text: 'وليعلموا من تعاقبهما عدد السنين والحساب', q: 'ولتعلموا عدد السنين والحساب' },
    ],
    omitted: ['الناس الساعون في معاشهم لا يُصوَّرون.'],
  },
  {
    id: 'pollinating-winds', title: 'الرياح لواقح', cat: 'آيات كونية', ref: { s: 15, from: 22, to: 22 }, duration: 27,
    sky: [{ t: 0, mode: 'day' }, { t: 8, mode: 'day' }, { t: 12, mode: 'storm' }, { t: 19, mode: 'storm' }, { t: 23, mode: 'day' }],
    elements: [
      { type: 'sun', x: 0.86, y: 0.13, until: 11 }, { type: 'mountains', count: 3, seed: 27, size: 0.75 }, { type: 'ground', green: 0.55, cracks: false },
      { type: 'wind', from: 0, until: 13, intensity: 1.3 },
      { type: 'tree', x: 0.2, size: 0.9, ...pre, fruit: true, fruitFrom: 3, fruitColor: '#f6c6d0' }, { type: 'tree', x: 0.78, size: 1, ...pre, fruit: true, fruitFrom: 3.5, fruitColor: '#f8e3ea' },
      { type: 'plants', kind: 'flowers', growFrom: 2, growTo: 7, count: 22 },
      { type: 'clouds', from: 6, to: 11, gather: true, count: 6, dark: 0.15, darkTo: 0.8, y: 0.12, until: 23 }, { type: 'rain', from: 12, until: 19.5 },
      { type: 'river', from: 15, to: 20, size: 0.5, y: 0.78 },
    ],
    captions: [
      { t: 0, text: 'أرسل الله الرياح', q: 'وأرسلنا الرياح' }, { t: 3, text: 'تُلقّح الشجر فيتفتّح عن أوراقه وأكمامه', q: 'لواقح' },
      { t: 7, text: 'وتُلقّح السحاب فيدرّ بالماء', q: 'لواقح' }, { t: 12, text: 'فأنزل من السحاب ماء', q: 'فأنزلنا من السماء ماء' },
      { t: 15.5, text: 'أعدّه لشرابكم وأرضكم ومواشيكم', q: 'فأسقيناكموه' }, { t: 21, text: 'وما أنتم بقادرين على خزنه، ولكن الله يحفظه لكم', q: 'وما أنتم له بخازنين' },
    ],
    omitted: [],
  },
  {
    id: 'harvest', title: 'أأنتم تزرعونه', cat: 'آيات كونية', ref: { s: 56, from: 63, to: 67 }, duration: 32, horizon: 0.6,
    sky: [{ t: 0, mode: 'dawn' }, { t: 6, mode: 'day' }, { t: 16, mode: 'day' }, { t: 21, mode: 'dusk' }],
    camera: [{ t: 0, zoom: 1.4, x: 0.5, y: 0.75 }, { t: 6, zoom: 1.4, x: 0.5, y: 0.72 }, { t: 10, zoom: 1 }],
    elements: [
      { type: 'sun', motion: 'rise', x0: 0.15, x1: 0.5, to: 18 }, { type: 'mountains', count: 3, seed: 59, size: 0.6 }, { type: 'ground', green: 0.15, greenFrom: 4, greenTo: 10, dryFrom: 16, dryTo: 23, cracks: false },
      { type: 'sprout', kind: 'grain', x: 0.5, size: 0.8, from: 0.5, to: 6, until: 8 },
      { type: 'plants', kind: 'crop', growFrom: 5, growTo: 12, witherFrom: 16, witherTo: 23, scatter: true, count: 48, x0: 0.02, x1: 0.98 },
      { type: 'wind', from: 19.5, intensity: 1.4 },
    ],
    captions: [
      { t: 0, text: 'الحرث الذي يُحرث ويُزرع', q: 'أفرأيتم ما تحرثون' }, { t: 5, text: 'من الذي يُنبته في الأرض ويُقرّ قراره؟', q: 'أأنتم تزرعونه أم نحن الزارعون' },
      { t: 12, text: 'الله هو الذي يُنبته' }, { t: 16, text: 'لو شاء لجعله هشيمًا لا يُنتفع به', q: 'لو نشاء لجعلناه حطاما' },
      { t: 22, text: 'فيتعجّب أصحابه مما نزل بزرعهم', q: 'فظلتم تفكهون' },
      { t: 25.5, text: 'ويقولون: إنا لخاسرون معذَّبون', q: 'إنا لمغرمون' }, { t: 28.5, text: 'بل نحن محرومون من الرزق', q: 'بل نحن محرومون' },
    ],
    omitted: ['الزُّرّاع لا يُصوَّرون. المشهد يعرض «لو نشاء» حالًا ممكنة، لا خبرًا عن وقوعها.'],
  },
);

// ───────── مشاهد الإصدار ١٫٤ (فيها شخصيات؛ تظهر في درجة «متساهل» فقط) ─────────
LIBRARY.push(
  {
    id: 'birds-held', title: 'الطير صافّاتٍ ويقبضن', cat: 'آيات كونية', ref: { s: 67, from: 19, to: 19 }, duration: 24, needsFigures: true,
    sky: [{ t: 0, mode: 'day' }, { t: 16, mode: 'day' }, { t: 22, mode: 'dusk' }],
    camera: [{ t: 0, zoom: 1 }, { t: 5, zoom: 1.35, x: 0.55, y: 0.3 }, { t: 15, zoom: 1.35, x: 0.5, y: 0.3 }, { t: 19, zoom: 1 }],
    elements: [
      { type: 'sun', x: 0.82, y: 0.14 }, { type: 'clouds', count: 4, y: 0.13, size: 0.8, drift: 0.8 }, { type: 'mountains', count: 3, seed: 31, size: 0.6 },
      { type: 'ground', green: 0.6, cracks: false }, { type: 'plants', kind: 'grass', ...pre, count: 24 },
      { type: 'birds', count: 9, y: 0.27, x0: -0.15, x1: 1.1, mode: 'soar', from: 0, to: 11, until: 11.5, size: 1.5 },
      { type: 'birds', count: 9, y: 0.27, x0: 1.1, x1: -0.15, mode: 'flap', from: 10.5, to: 22, size: 1.5, seed: 4 },
      { type: 'person', look: 'boy', x: 0.3, pose: 'lookup', seed: 1 }, { type: 'person', look: 'girl', x: 0.4, pose: 'lookup', seed: 3 },
    ],
    captions: [
      { t: 0, text: 'انظر إلى الطير فوقك', q: 'أولم يروا إلى الطير فوقهم' }, { t: 4, text: 'باسطاتٍ أجنحتها في الهواء', q: 'صافات' },
      { t: 11, text: 'ويضممنها إلى جنوبها أحيانًا', q: 'ويقبضن' }, { t: 16, text: 'ما يحفظها من الوقوع إلا الرحمن', q: 'ما يمسكهن إلا الرحمن' },
      { t: 20.5, text: 'إنه بكل شيء بصير', q: 'إنه بكل شيء بصير' },
    ],
    omitted: ['الناظرون إلى الطير شخصيات عامة لا تمثّل أحدًا.'],
  },
  {
    id: 'cattle', title: 'والأنعام خلقها لكم', cat: 'آيات كونية', ref: { s: 16, from: 5, to: 6 }, duration: 28, needsFigures: true, horizon: 0.62,
    sky: [{ t: 0, mode: 'dawn' }, { t: 7, mode: 'day' }, { t: 18, mode: 'day' }, { t: 24, mode: 'dusk' }],
    elements: [
      { type: 'sun', motion: 'arc', x0: 0.1, x1: 0.9, to: 28 }, { type: 'mountains', count: 3, seed: 44, size: 0.6 }, { type: 'ground', green: 0.75, cracks: false },
      { type: 'plants', kind: 'grass', ...pre, count: 30 },
      { type: 'animal', kind: 'camel', x: 0.18, size: 1.1, until: 8 }, { type: 'animal', kind: 'cow', x: 0.42, until: 8 }, { type: 'animal', kind: 'sheep', x: 0.64, until: 8 }, { type: 'animal', kind: 'goat', x: 0.8, size: 0.9, until: 8 },
      { type: 'animal', kind: 'sheep', x0: 0.05, x1: 0.55, from: 8, to: 15, until: 19, seed: 1 }, { type: 'animal', kind: 'sheep', x0: -0.05, x1: 0.45, from: 8.4, to: 15.4, until: 19, size: 0.85, seed: 2 },
      { type: 'animal', kind: 'camel', x0: -0.15, x1: 0.3, from: 8.8, to: 15.8, until: 19, seed: 3 }, { type: 'person', look: 'man', x0: -0.2, x1: 0.2, from: 9, to: 16, until: 19, seed: 2 },
      { type: 'animal', kind: 'sheep', x0: 0.55, x1: 1.15, from: 19, to: 27, seed: 4 }, { type: 'animal', kind: 'sheep', x0: 0.45, x1: 1.05, from: 19.4, to: 27.4, size: 0.85, seed: 5 },
      { type: 'animal', kind: 'camel', x0: 0.3, x1: 0.92, from: 19.8, to: 27.8, seed: 6 }, { type: 'person', look: 'man', x0: 0.2, x1: 0.82, from: 20, to: 28, seed: 7 },
    ],
    captions: [
      { t: 0, text: 'الأنعام من الإبل والبقر والغنم خلقها الله لكم', q: 'والأنعام خلقها لكم' },
      { t: 4.5, text: 'في أصوافها وأوبارها دفء، ومنافع في ألبانها وجلودها وركوبها', q: 'فيها دفء ومنافع' },
      { t: 9, text: 'ولكم فيها زينة حين تُخرجونها للمرعى صباحًا', q: 'وحين تسرحون' },
      { t: 19.5, text: 'وحين تردّونها إلى منازلها في المساء', q: 'حين تريحون' },
    ],
    omitted: ['الراعي شخصية عامة لا تمثّل أحدًا.'],
  },
);

// شخصيات تُضاف إلى مشاهد سابقة في درجة «متساهل» (تُحذف آليًا في الدرجات الأخرى)
const FIG = {
  'rain-revival': [{ type: 'person', look: 'man', x: 0.4, pose: 'cheer', from: 13, seed: 1 }, { type: 'person', look: 'girl', x: 0.5, pose: 'cheer', from: 13.5, seed: 4 }, { type: 'birds', count: 6, y: 0.2, x0: -0.1, x1: 1.1, from: 21, to: 30, mode: 'both' }],
  'winds-clouds': [{ type: 'person', look: 'farmer', x: 0.3, pose: 'stand', seed: 2, until: 14, mood: 'calm' }, { type: 'person', look: 'farmer', x: 0.3, pose: 'cheer', from: 14, seed: 2, mood: 'happy' }, { type: 'person', look: 'boy', x: 0.4, pose: 'cheer', from: 15, seed: 5, mood: 'happy' }],
  mirage: [{ type: 'person', look: 'man', x0: 0.08, x1: 0.42, pose: 'thirsty', from: 3, to: 17, size: 0.9, mood: 'happy', mood2: 'surprised', moodAt: 15, says: [{ from: 8, to: 11.5, text: 'ماء!', style: 'shout' }] }],
  harvest: [{ type: 'person', look: 'farmer', x: 0.22, pose: 'sow', from: 0, until: 7 }, { type: 'person', look: 'farmer', x: 0.3, from: 17, mood: 'calm', mood2: 'surprised', moodAt: 21, says: [{ from: 25.5, to: 28.4, text: 'إنا لمغرمون', style: 'shout' }, { from: 28.6, to: 32, text: 'بل نحن محرومون' }] }, { type: 'person', look: 'man', x: 0.42, from: 17.5, mood: 'calm', mood2: 'sad', moodAt: 22, seed: 4 }],
  food: [{ type: 'person', look: 'boy', x: 0.2, pose: 'lookup', from: 18 }, { type: 'animal', kind: 'sheep', x: 0.64, graze: true, from: 29 }, { type: 'animal', kind: 'cow', x: 0.42, graze: true, from: 29.5, size: 0.95 }],
  'one-water': [{ type: 'animal', kind: 'sheep', x: 0.66, graze: true, from: 3 }, { type: 'animal', kind: 'goat', x: 0.36, graze: true, from: 3.5, size: 0.85 }],
  'two-signs': [{ type: 'person', look: 'farmer', x0: 0.05, x1: 0.55, from: 15, to: 22, seed: 3 }],
  'pollinating-winds': [{ type: 'animal', kind: 'camel', x: 0.55, from: 15.5, graze: true }, { type: 'animal', kind: 'sheep', x: 0.4, from: 16, graze: true }],
  'dawn-split': [{ type: 'birds', count: 5, y: 0.25, x0: -0.1, x1: 1.1, from: 8, to: 16, mode: 'flap' }],
  'ships-still': [{ type: 'birds', count: 4, y: 0.2, x0: 1.1, x1: -0.1, from: 2, to: 20, mode: 'soar' }],
};
for (const s of LIBRARY) if (FIG[s.id]) { s.elements.push(...FIG[s.id]); s.omittedFigures = ['الأشخاص والأنعام والطير في المشهد شخصيات عامة لا تمثّل أحدًا بعينه.']; }

// اللفظ القرآني المقابل لكل لقطة في مشاهد الإصدار الأول (بالرسم الإملائي؛ يُطابَق آليًا مع المصحف)
const Q = {
  'rain-revival': ['لبلد ميت', 'يرسل الرياح بشرا بين يدي رحمته', 'أقلت سحابا ثقالا', 'سقناه لبلد ميت', 'فأنزلنا به الماء', 'فأخرجنا به من كل الثمرات', 'كذلك نخرج الموتى لعلكم تذكرون'],
  'earth-stirs': ['ترى الأرض خاشعة', 'أنزلنا عليها الماء', 'اهتزت', 'وربت', 'إن الذي أحياها لمحيي الموتى'],
  'night-day-orbits': [null, 'الليل نسلخ منه النهار', 'فإذا هم مظلمون', 'والشمس تجري لمستقر لها', 'والقمر قدرناه منازل', 'حتى عاد كالعرجون القديم', 'لا الشمس ينبغي لها أن تدرك القمر ولا الليل سابق النهار', 'وكل في فلك يسبحون'],
  'cradle-pegs': ['الأرض مهادا', 'والجبال أوتادا'],
  bees: ['اتخذي من الجبال بيوتا ومن الشجر ومما يعرشون', 'كلي من كل الثمرات', 'فاسلكي سبل ربك ذللا', 'يخرج من بطونها شراب مختلف ألوانه', 'فيه شفاء للناس'],
  'good-tree': ['كلمة طيبة كشجرة طيبة', 'أصلها ثابت', 'وفرعها في السماء', 'تؤتي أكلها كل حين بإذن ربها', 'ويضرب الله الأمثال للناس'],
  'seven-ears': ['كمثل حبة', 'أنبتت', 'سبع سنابل', 'في كل سنبلة مائة حبة', 'والله يضاعف لمن يشاء'],
  'garden-hill': ['كمثل جنة بربوة', 'أصابها وابل', 'فآتت أكلها ضعفين', 'فإن لم يصبها وابل فطل', 'ينفقون أموالهم ابتغاء مرضات الله'],
  'deep-darkness': ['في بحر لجي', 'يغشاه موج', 'من فوقه موج', 'من فوقه سحاب', 'ظلمات بعضها فوق بعض', 'ومن لم يجعل الله له نورا فما له من نور'],
  'two-seas': ['البحرين', 'مرج البحرين يلتقيان', 'بينهما برزخ', 'لا يبغيان'],
  'flood-foam': ['أنزل من السماء ماء', 'فسالت أودية بقدرها', 'فاحتمل السيل زبدا رابيا', 'فأما الزبد فيذهب جفاء', 'وأما ما ينفع الناس فيمكث في الأرض', 'كذلك يضرب الله الحق والباطل'],
  'spider-house': ['العنكبوت اتخذت بيتا', null, null, 'وإن أوهن البيوت لبيت العنكبوت', 'الذين اتخذوا من دون الله أولياء'],
  'worldly-life': ['كماء أنزلناه من السماء', 'فاختلط به نبات الأرض', null, 'فأصبح هشيما', 'تذروه الرياح', 'مثل الحياة الدنيا'],
  'ashes-wind': ['كرماد', 'اشتدت به الريح في يوم عاصف', 'لا يقدرون مما كسبوا على شيء', 'الذين كفروا بربهم أعمالهم'],
  'sun-moon': ['جعل الشمس ضياء', null, 'والقمر نورا', 'وقدره منازل', 'لتعلموا عدد السنين والحساب'],
  'one-water': ['أنزل من السماء ماء', 'لكم منه شراب ومنه شجر', 'ينبت لكم به الزرع', 'والزيتون', 'والنخيل', 'والأعناب', 'ومن كل الثمرات'],
};
for (const s of LIBRARY) (Q[s.id] || []).forEach((q, i) => { if (q && s.captions[i]) s.captions[i].q = q; });

// لحظة الصورة المصغّرة لكل مشهد (نسبة من مدته) حين لا تصلح اللحظة الافتراضية
const THUMB = { harvest: 0.42, 'two-signs': 0.6, 'dawn-split': 0.4, shams: 0.25, 'ashes-wind': 0.3, 'evil-tree': 0.3, mirage: 0.35, 'worldly-life': 0.42, 'spider-house': 0.3, shadow: 0.5, 'bare-rock': 0.2, 'springs-crop': 0.5, 'deep-darkness': 0.45 };
for (const s of LIBRARY) if (THUMB[s.id]) s.thumb = THUMB[s.id];
