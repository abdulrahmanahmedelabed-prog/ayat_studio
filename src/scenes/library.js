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
