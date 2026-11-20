import { CateringProduct, BoxFillingItem, PromptTemplate, TrackedOrder } from '../types/catering';
import heroSpreadImg from '../assets/images/hero_catering_spread_1792163979418.jpg';
import savorySandwichesImg from '../assets/images/savory_mini_sandwiches_1792163979678.jpg';
import frenchGateauxImg from '../assets/images/french_mini_gateaux_1792163979934.jpg';
import eventFavorsImg from '../assets/images/event_giveaway_boxes_1792163980574.jpg';
import soloMealBoxImg from '../assets/images/solo_meal_box_1792165904791.jpg';

// Official Published & Shared App URL
export const PUBLISHED_URL = 'https://ais-pre-woawfqptmsjdgpwbwt7wjn-808303190286.europe-west2.run.app';

export const PUBLISH_DETAILS = {
  appName: 'بَهْجَة - لتوزيعات وضيافة المناسبات الفاخرة',
  url: PUBLISHED_URL,
  tagline: 'ميني ساندوتشات طازجة، جاتوهات وسواريه فرنسية، وبوكسات فردية لكل ضيف',
  shareMessage: 'تفضل بزيارة متجر «بَهْجَة» لتوزيعات وضيافة المناسبات الفاخرة (بوكسات ميني ساندوتش، جاتوهات فرنسية، وبوكسات فردية متكاملة لكل ضيف): ' + PUBLISHED_URL,
};

// Bundled high-fidelity images (Vite resolves static imports cleanly in both dev and production builds like Vercel)
export const IMAGES = {
  hero: heroSpreadImg,
  savory: savorySandwichesImg,
  gateaux: frenchGateauxImg,
  favors: eventFavorsImg,
  solo: soloMealBoxImg,
};

const LEGACY_IMAGE_PATH_MAP: Record<string, string> = {
  '/src/assets/images/hero_catering_spread_1792163979418.jpg': IMAGES.hero,
  '/src/assets/images/savory_mini_sandwiches_1792163979678.jpg': IMAGES.savory,
  '/src/assets/images/french_mini_gateaux_1792163979934.jpg': IMAGES.gateaux,
  '/src/assets/images/event_giveaway_boxes_1792163980574.jpg': IMAGES.favors,
  '/src/assets/images/solo_meal_box_1792165904791.jpg': IMAGES.solo,
};

export function normalizeLegacyImagePath(imageUrl?: string): string {
  if (!imageUrl) return IMAGES.solo;
  return LEGACY_IMAGE_PATH_MAP[imageUrl] || imageUrl;
}

export const CATERING_PRODUCTS: CateringProduct[] = [
  {
    id: 'prod-solo-signature-box',
    title: 'بوكس البهجة الفردي الكلاسيكي (2 ميني ساندوتش + جاتوه + عصير)',
    category: 'solo',
    price: 75,
    piecesCount: 4,
    servesPeople: 'شخص واحد (وجبة متكاملة لكل ضيف)',
    description: 'البوكس المثالي المتكامل لكل ضيف! يحتوي على 2 ميني ساندوتش طازج (كرواسون تركي مدخن مع شيدر + بريوش روست بيف أنجوس) + قطعة ميني إكلير شوكولاتة بلجيكية فاخرة بالذهب الغذائي + زجاجة عصير برتقال طبيعي فريش مع شفاطة كرتونية أنيقة ومنديل معقم وكارت إهداء.',
    image: IMAGES.solo,
    itemsList: [
      '1x ميني كرواسون مورق بديك رومي مدخن وشيدر سويسري',
      '1x ميني بريوش روست بيف أنجوس بصوص خردل ديجون الفرنسي',
      '1x ميني إكلير شوكولاتة بلجيكية غنية ولمسة ذهب غذائي',
      '1x زجاجة عصير برتقال فريش طبيعي 100% (250 مل)',
      'تغليف فاخر بشريط ستان ومنديل معقم وكارت إهداء بالاسم'
    ],
    dietary: 'وجبة فردية صحية ومحكمة الإغلاق لكل ضيف',
    badge: 'الأكثر طلباً (ساندوتشين + جاتوه + عصير)',
    popular: true,
  },
  {
    id: 'prod-solo-sliders-box',
    title: 'بوكس السلايدرز الفردي (2 ميني برجر + تارت فواكه + عصير)',
    category: 'solo',
    price: 85,
    piecesCount: 4,
    servesPeople: 'شخص واحد (سلايدرز وحلو وعصير)',
    description: 'وجبة فردية شبابية مبهجة ومحبوبة لشخص واحد تضم 2 ميني برجر فاخر (لحم أنجوس بتشيدر ذائبة + دجاج كرسبي بصوص الرانش) مع قطعة تارت الفراولة والتوت الباريسي الفاخر وزجاجة عصير مانجو فريش.',
    image: IMAGES.solo,
    itemsList: [
      '1x ميني تشيز برجر أنجوس بصوص هني ماسترد وخس طازج',
      '1x ميني كرسبي تشيكن مقرمش مع صوص الرانش المتبل',
      '1x تارت الفراولة والتوت البري الطازج بكريمة الباتيسيير',
      '1x زجاجة عصير مانجو طبيعي فريش مثلج (250 مل)',
      'علبة فردية محكمة الإغلاق مع منديل معقم'
    ],
    dietary: 'لحوم بلدية طازجة ومكونات فاخرة',
    badge: 'شخص واحد (سلايدرز + تارت + عصير)',
    popular: true,
    isWeeklyDeal: true,
    discountPercent: 15,
  },
  {
    id: 'prod-solo-royal-vip',
    title: 'بوكس الضيافة الملكي الفردي VIP (2 كانابيه فاخر + لوتس كيك + عصير)',
    category: 'solo',
    price: 95,
    piecesCount: 4,
    servesPeople: 'شخص واحد (ضيافة ملكية VIP)',
    description: 'تجربة ضيافة مترفة للشخصيات الهامة وحفلات الزفاف والشركات. تشمل كانابيه السلمون المدخن الفاخر، ورول مسخن الدجاج بزيت الزيتون والسماق، مع قطعة ميني تشيز كيك اللوتس المترفة وزجاجة موكتيل فواكه استوائية.',
    image: IMAGES.solo,
    itemsList: [
      '1x كانابيه جبنة الأعشاب مع السلمون المدخن وزينة الكبر',
      '1x رول مسخن دجاج فلسطيني بزيت الزيتون والسماق ودبس الرمان',
      '1x ميني تشيز كيك اللوتس البلجيكي والكراميل المقرمش',
      '1x زجاجة موكتيل فواكه استوائية ورمان طبيعي فريش (250 مل)',
      'علبة إهداء فاخرة بشريط ستان ذهبي وبطاقة ترحيبية'
    ],
    dietary: 'نكهات باريسية وشرقية استثنائية',
    badge: 'VIP شخص واحد (أعلى فخامة)',
    popular: true,
  },
  {
    id: 'prod-solo-croissant-patisserie',
    title: 'بوكس المخبوزات والكرواسون الفردي (2 ميني سندوتش + ميلفيه + عصير)',
    category: 'solo',
    price: 70,
    piecesCount: 4,
    servesPeople: 'شخص واحد (خفيف ومميز)',
    description: 'خيار شهي وخفيف جداً للاجتماعات الصباحية وأعياد الميلاد؛ ميني كرواسون جبنة رومي وأعشاب وميني باتيه دجاج مدخن، مع قطعة جاتوه فرنسية هشة وزجاجة عصير ليمون بالنعناع المنعش.',
    image: IMAGES.solo,
    itemsList: [
      '1x ميني كرواسون بالجبنة الرومي القديمة والزعتر البلدي',
      '1x ميني بريوش دجاج تندر مدخن مع المايونيز والزيتون',
      '1x قطعة ميني جاتوه ميلفيه فرنسي مقرمش بالسكر البودرة',
      '1x زجاجة عصير ليمون ونعناع مثلج فريش (250 مل)',
      'تغليف فردي كرتوني صحي أنيق'
    ],
    dietary: 'مثالي للاجتماعات الصباحية والتجمعات العصرية',
    badge: 'خفيف ومنعش لشخص واحد',
    popular: false,
  },
  {
    id: 'prod-solo-pack-10',
    title: 'بكج كرتونة 10 بوكسات فردية للتوزيعات (10 أشخاص)',
    category: 'solo',
    price: 720,
    piecesCount: 40,
    servesPeople: '10 أشخاص (علبة فردية مخصصة لكل ضيف)',
    description: '10 بوكسات فردية أنيقة ومستقلة، كل بوكس يحتوي على (2 ميني ساندوتش طازج + قطعة جاتوه فرنسي + زجاجة عصير فريش طبيعي) مربوطة بشرائط ستان ومطبوعة باسم المناسبة لتقديمها مباشرة لكل ضيف.',
    image: IMAGES.favors,
    itemsList: [
      '10 علب فردية مغلفة بشرائط ستان فاخرة وكروت إهداء',
      'داخل كل علبة: 2 ميني ساندوتش مشكل (كرواسون + بريوش)',
      'داخل كل علبة: 1 قطعة جاتوه سواريه فرنسي (إكلير أو تارت)',
      'داخل كل علبة: 1 زجاجة عصير فريش طبيعي مثلج مع شفاطة',
      'مناديل معقمة وتصميم كروت المناسبة مجاناً'
    ],
    dietary: 'أفضل تنظيم وأسهل ضيافة دون أي فوضى على الطاولات',
    badge: 'توفير خاص: 10 بوكسات فردية',
    popular: true,
  },
  {
    id: 'prod-solo-pack-25',
    title: 'بكج الفعاليات الكبرى (25 بوكس فردي لشخص واحد)',
    category: 'solo',
    price: 1750,
    piecesCount: 100,
    servesPeople: '25 شخصاً (بوكس فردي لكل معازيم الحفل)',
    description: 'الحل الاحترافي الأرقى لحفلات التخرج، كتب الكتاب، والمؤتمرات؛ 25 بوكس ضيافة فردي مستقل لكل ضيف يضم ساندوتشين وجاتوه وعصير فريش مع خدمة طباعة شعار الشركة أو اسم العروسين مجاناً.',
    image: IMAGES.hero,
    itemsList: [
      '25 بوكس فردي معقم ومغلق بشرائط المناسبة الرسمية',
      '50 ميني ساندوتش مشكل فاخر (ديك رومي، روست بيف، كرسبي تشيكن)',
      '25 قطعة جاتوه سواريه مشكلة (إكلير، تارت فواكه، لوتس كيك)',
      '25 زجاجة عصير فريش مشكل (برتقال، مانجو، ليمون نعناع)',
      'كرتونة حافظة للبرودة لضمان الانتعاش حتى لحظة التوزيع'
    ],
    dietary: 'حل عملي وفاخر للحشود والمؤتمرات والأفراح',
    badge: 'بكج المؤتمرات والحفلات (25 شخصاً)',
    popular: true,
  },
  {
    id: 'prod-savory-grand',
    title: 'بوكس موالح وساندوتشات السعادة الفاخر',
    category: 'sandwiches',
    price: 480,
    piecesCount: 30,
    servesPeople: '8 - 10 أشخاص',
    description: 'تشكيلة استثنائية من الميني بريوش وساندوتشات الكرواسون والروست بيف وسلايدر الدجاج التندر مع صوصاتنا الحصرية المحضرة طازجة صباح كل يوم.',
    image: IMAGES.savory,
    itemsList: [
      '8 قطع ميني كرواسون ديك رومي مدخن وشيدر معتق',
      '8 قطع ميني بريوش روست بيف أنجوس بالخردل الفرنسي',
      '7 قطع ميني سلايدر دجاج كريسبي مع خس آيسبيرغ وصوص الترافل',
      '7 قطع كانابيه تونة بالليمون المعتق والأعشاب الطازجة'
    ],
    dietary: 'مخبوزات طازجة يومياً دون مواد حافظة',
    badge: 'الأكثر طلباً للمناسبات',
    popular: true,
  },
  {
    id: 'prod-gateaux-royal',
    title: 'بوكس سواريه وجاتوهات البهجة الملكي',
    category: 'gateaux',
    price: 520,
    piecesCount: 28,
    servesPeople: '8 - 12 شخصاً',
    description: 'تحف فرنسية صغيرة مبهرة من الميني إكلير البلجيكي، تارت الفراولة والتوت الطازج، ماكرون باريسي بألوان الباستيل، وقطع تشيز كيك اللوتس المترفة.',
    image: IMAGES.gateaux,
    itemsList: [
      '8 قطع ميني إكلير شوكولاتة بلجيكية وكراميل مملح',
      '8 قطع تارت فواكه طازجة وتوت أحمر بكريمة الباتيسيير',
      '6 قطع ماكرون فرنسي ملون (فستق، توت، ليمون، شوكولاتة)',
      '6 قطع ميني تشيز كيك اللوتس والتوفي المقرمش'
    ],
    dietary: 'شوكولاتة بلجيكية فاخرة وزبدة فرنسية طبيعية 100%',
    badge: 'أناقة لا تقاوم',
    popular: true,
    isWeeklyDeal: true,
    discountPercent: 10,
  },
  {
    id: 'prod-individual-favors',
    title: 'علب توزيعات الهدايا الفردية الأنيقة (بكج 15 علبة)',
    category: 'favors',
    price: 650,
    piecesCount: 45,
    servesPeople: '15 ضيفاً (علبة مخصصة لكل ضيف)',
    description: '15 علبة توزيعات فردية راقية مربوطة بشريط ستان حريري وكارت إهداء مطبوع باسم المحتفى به وثيم الحفل، داخل كل علبة قطعة ميني ساندوتش وقطعتين سواريه فاخر.',
    image: IMAGES.favors,
    itemsList: [
      '15 علبة هدايا مطبوعة مخصصة مع شريط ستان فاخر',
      '15 قطعة ميني كرواسون ديك رومي مدخن فاخر',
      '15 قطعة ميني إكلير شوكولاتة بلجيكية',
      '15 قطعة ماكرون فرنسي بألوان ثيم المناسبة',
      'تصميم وطباعة كروت إهداء بالاسم مجاناً'
    ],
    dietary: 'تغليف فردي محكم وصحي لكل ضيف',
    badge: 'خيار مثالي لحفلات الزفاف والمواليد',
    popular: true,
  },
  {
    id: 'prod-celebration-bundle',
    title: 'بكج الحفلات والضيافة المتكامل "طاولة الفرح"',
    category: 'bundles',
    price: 990,
    piecesCount: 65,
    servesPeople: '18 - 22 شخصاً',
    description: 'الحل الشامل لضيافة المناسبة دون أي عناء! يشمل بوكس موالح كبير، بوكس جاتوهات سواريه فرنسي، و12 علبة ميني عصير موكتيل فريش وكروت طاولة منسقة.',
    image: IMAGES.hero,
    itemsList: [
      'بوكس موالح وساندوتشات مشكلة (32 قطعة)',
      'بوكس جاتوهات وحلويات سواريه فاخرة (33 قطعة)',
      '12 عبوة عصير برتقال وموكتيل فراولة فريش في زجاجات أنيقة',
      'حوامل تقديم أنيقة كرتونية للمائدة',
      'كروت ترحيبية باسم العائلة والمناسبة'
    ],
    dietary: 'ضيافة متكاملة تشمل المالح والحلو والمشروبات',
    badge: 'أفضل قيمة للمناسبات الكبيرة',
    popular: true,
    isWeeklyDeal: true,
    discountPercent: 12,
  },
  {
    id: 'prod-mini-sliders-board',
    title: 'بلاتر ميني سلايدرز ومسخن الدجاج المقرمش',
    category: 'sandwiches',
    price: 420,
    piecesCount: 24,
    servesPeople: '6 - 8 أشخاص',
    description: 'تشكيلة شبابية مبهجة ومحبوبة جداً من ميني برجر اللحم البقري، ميني برجر الدجاج، ورولات المسخن الفلسطيني بزيت الزيتون والسماق البلدي.',
    image: IMAGES.savory,
    itemsList: [
      '8 قطع ميني تشيز برجر مع خردل العسل والمخلل المقرمش',
      '8 قطع ميني كرسبي تشيكن مع صوص الرانش المتبل',
      '8 رولات مسخن دجاج بلدي بزيت الزيتون ودبس الرمان'
    ],
    dietary: 'لحوم بلدية طازجة 100%',
    badge: 'مفضل لحفلات التخرج والشباب',
    popular: false,
  },
  {
    id: 'prod-macaron-pyramid',
    title: 'برج الماكرون الفرنسي وبوب كيك الاحتفالات',
    category: 'gateaux',
    price: 460,
    piecesCount: 32,
    servesPeople: '10 - 14 شخصاً',
    description: 'توزيعات ملونة ومبهجة من حبات الماكرون الهش والبوب كيك المغطى بالشوكولاتة البيضاء والذهبية، تضفي جمالاً استثنائياً على طاولة المناسبة.',
    image: IMAGES.gateaux,
    itemsList: [
      '18 حبة ماكرون فرنسي بنكهات متعددة',
      '14 حبة بوب كيك احتفالي بتزيين السبرنكلز الذهبي',
      'ستاند تقديم كرتوني وردي أو ذهبي حسب رغبتك'
    ],
    dietary: 'نكهات طبيعية بالكامل خالية من الجلوتين (الماكرون)',
    badge: 'لمسة بصرية ساحرة',
    popular: false,
  },
  {
    id: 'prod-egift-card',
    title: 'بطاقة الهدايا الرقمية (E-Gift Card) — بمبلغ مخصص وكود خصم',
    category: 'gift_cards',
    price: 250,
    piecesCount: 1,
    servesPeople: 'هدية رقمية فورية لأي مناسبة',
    description: 'أهدِ أحباءك حرية اختيار ضيافة وتوزيعات بهجة المفضلة! حدد مبلغ البطاقة (من 50 إلى 10,000 ج.م) وأنشئ كود خصم خاص لإرساله فوراً للمستلم عبر الواتساب أو البريد الإلكتروني.',
    image: IMAGES.favors,
    itemsList: [
      'إمكانية تحديد مبلغ الهدية المخصص بمرونة كاملة',
      'إنشاء كود خصم فريد وحصري باسم المستلم',
      'إرسال فوري عبر البريد الإلكتروني أو رسالة واتساب منسّقة',
      'صالحة لاستخدامها على جميع البوكسات وتخصيص الصناديق'
    ],
    dietary: 'تصميم بطاقة رقمية فاخرة تصل فوراً دون انتظار الشحن',
    badge: 'بطاقة هدايا رقمية 🎁',
    popular: true,
    isGiftCard: true,
  }
];

export const BOX_FILLINGS: BoxFillingItem[] = [
  {
    id: 'fill-croissant-turkey',
    name: 'ميني كرواسون ديك رومي مدخن وشيدر',
    category: 'savory',
    type: 'كرواسون مقرمش',
    pricePerPiece: 16,
    imageAlt: 'كرواسون محشو بالديك الرومي والجبنة',
    description: 'عجينة فرنسية مورقة غنية بالزبدة مع شريحة تركي مدخن وخس مقرمش وجبنة شيدر سويسرية.',
    popular: true,
  },
  {
    id: 'fill-brioche-roastbeef',
    name: 'ميني بريوش روست بيف أنجوس بالخردل',
    category: 'savory',
    type: 'بريوش طري',
    pricePerPiece: 18,
    imageAlt: 'بريوش روست بيف مع صوص الخردل الفرنسي',
    description: 'خبز بريوش بالزبدة مع شرائح روست بيف متبلة، مخلل الكورنيشون وصوص ديجون الحريري.',
    popular: true,
  },
  {
    id: 'fill-slider-chicken',
    name: 'ميني سلايدر دجاج كرسبي مع صوص الترافل',
    category: 'savory',
    type: 'سلايدر',
    pricePerPiece: 17,
    imageAlt: 'ميني برجر دجاج كرسبي',
    description: 'صدر دجاج مقرمش ذهبي مع جبنة ذائبة وصوص الترافل الخاص وخس طازج.',
    popular: true,
  },
  {
    id: 'fill-musakhan-roll',
    name: 'رول مسخن دجاج فلسطيني بزيت الزيتون والسماق',
    category: 'savory',
    type: 'موالح شرقية',
    pricePerPiece: 14,
    imageAlt: 'رولات مسخن دجاج مقرمشة',
    description: 'خبز شراك رقيق محشو بالدجاج المتبل بالبصل المكرمل والسماق البلدي ودبس الرمان.',
    popular: true,
  },
  {
    id: 'fill-canape-salmon',
    name: 'كانابيه جبنة الأعشاب مع السلمون والليمون',
    category: 'savory',
    type: 'كانابيه راقي',
    pricePerPiece: 20,
    imageAlt: 'كانابيه سلمون مدخن وأعشاب',
    description: 'قاعدة مقرمشة مع كريمة الجبن المخفوقة بالأعشاب وشريحة سلمون مدخن وزينة الكبر والشبت.',
    popular: false,
  },
  {
    id: 'fill-eclair-belgian',
    name: 'ميني إكلير شوكولاتة بلجيكية ورقائق الذهب',
    category: 'sweet',
    type: 'إكلير فرنسي',
    pricePerPiece: 17,
    imageAlt: 'ميني إكلير مغطى بالجناش اللامع',
    description: 'عجينة شو هشة محشوة بكاسترد الشوكولاتة الداكنة ومزينة بجناش بلجيكي لامع ورشة ذهب غذائي.',
    popular: true,
  },
  {
    id: 'fill-tart-berries',
    name: 'تارت الفراولة والتوت البري مع الباتيسيير',
    category: 'sweet',
    type: 'تارت فواكه',
    pricePerPiece: 18,
    imageAlt: 'تارت صغير بالتوت والفراولة الطازجة',
    description: 'قاعدة بسكويت زبدية مقرمشة مع كريمة الفانيليا الباريسية وتوت طازج لامع.',
    popular: true,
  },
  {
    id: 'fill-cheesecake-lotus',
    name: 'ميني تشيز كيك اللوتس والكراميل المقرمش',
    category: 'sweet',
    type: 'تشيز كيك',
    pricePerPiece: 17,
    imageAlt: 'قطع تشيز كيك اللوتس الفاخرة',
    description: 'طبقة كريمية مخملية غنية بجبنة الفيلادلفيا وقاعدة بسكويت لوتس مقرمشة مغطاة بزبدة اللوتس الذائبة.',
    popular: true,
  },
  {
    id: 'fill-macaron-parisian',
    name: 'ماكرون باريسي فاخر (ألوان مخصصة)',
    category: 'sweet',
    type: 'ماكرون فرنسي',
    pricePerPiece: 15,
    imageAlt: 'حبات ماكرون فرنسي بألوان الباستيل',
    description: 'حبات ماكرون لوزية مقرمشة من الخارج وهشة تذوب في الفم بحشوات الجناش الطبيعية المتنوعة.',
    popular: true,
  },
  {
    id: 'fill-fudge-brownie',
    name: 'مكعبات فادج براونيز الشوكولاتة والجوز',
    category: 'sweet',
    type: 'براونيز غني',
    pricePerPiece: 16,
    imageAlt: 'مكعبات براونيز شوكولاتة داكنة',
    description: 'قطع براونيز مكثفة وطرية محضرة بشوكولاتة كاليبو البلجيكية ومزينة بقطع الجوز الأمريكي.',
    popular: false,
  },
  {
    id: 'fill-juice-orange',
    name: 'زجاجة عصير برتقال طبيعي فريش (250 مل)',
    category: 'drink',
    type: 'عصير طبيعي',
    pricePerPiece: 20,
    imageAlt: 'زجاجة عصير برتقال طازج',
    description: 'عصير برتقال بلدي معصور طازج بدون سكر مضاف مع شفاطة كرتونية أنيقة.',
    popular: true,
  },
  {
    id: 'fill-juice-mango',
    name: 'زجاجة عصير مانجو طبيعي فريش (250 مل)',
    category: 'drink',
    type: 'عصير طبيعي',
    pricePerPiece: 22,
    imageAlt: 'زجاجة عصير مانجو طازج',
    description: 'عصير مانجو فريش غني ولذيذ مثلج محضر بأجود أنواع المانجو المصري.',
    popular: true,
  },
  {
    id: 'fill-juice-lemon-mint',
    name: 'زجاجة عصير ليمون ونعناع فريش (250 مل)',
    category: 'drink',
    type: 'عصير طبيعي',
    pricePerPiece: 18,
    imageAlt: 'زجاجة ليمون ونعناع مثلج',
    description: 'مزيج الليمون المنعش مع أوراق النعناع الخضراء المثلجة لترطيب ضيوفك.',
    popular: true,
  },
  {
    id: 'fill-juice-strawberry',
    name: 'زجاجة موكتيل فواكه وتوت فريش (250 مل)',
    category: 'drink',
    type: 'عصير طبيعي',
    pricePerPiece: 22,
    imageAlt: 'زجاجة موكتيل فراولة وتوت أحمر',
    description: 'كوكتيل فواكه حمراء منعش وتوت بري بلمسة احتفالية وردية مميزة.',
    popular: false,
  }
];

export const OCCASIONS_LIST = [
  { id: 'birthday', label: 'أعياد ميلاد وسنة جديدة', icon: '🎂', defaultMsg: 'كل سنة وأنت طيب وسعيد وعقبال مية سنة في فرح وهنا!' },
  { id: 'graduation', label: 'حفلات التخرج والتفوق', icon: '🎓', defaultMsg: 'ألف مبروك التخرج ومن نجاح لنجاح دايماً يا رب!' },
  { id: 'wedding', label: 'خطوبة وكتب كتاب وزفاف', icon: '💍', defaultMsg: 'ألف مبروك لأجمل عروسين، بارك الله لكما وجمع بينكما في خير وسعادة دايماً.' },
  { id: 'baby_shower', label: 'سبوع ومواليد واستقبال', icon: '🍼', defaultMsg: 'يا ألف نهار أبيض بنور الضيف الصغير الغالي.. يتربى في عزكم!' },
  { id: 'corporate', label: 'اجتماعات وافتتاحات شركات', icon: '💼', defaultMsg: 'نسعد بوجودكم معنا ونتطلع لشراكات ونجاحات مستدامة ومبهرة.' },
  { id: 'eid_holiday', label: 'توزيعات الأعياد والمناسبات', icon: '🌙', defaultMsg: 'كل عام وأنتم بخير وصحة وسعادة وعساكم من عواده دايماً.' },
];

export const RIBBON_COLORS = [
  { id: 'gold', name: 'ذهبي ملوكي فاخر', hex: '#D4AF37' },
  { id: 'blush', name: 'وردي بودري أنيق (Blush)', hex: '#E8A598' },
  { id: 'sage', name: 'أخضر ميرمية زيتوني (Sage)', hex: '#879F84' },
  { id: 'lavender', name: 'لافندر ملكي هادئ', hex: '#A89F91' },
  { id: 'navy', name: 'أزرق كحلي فخم', hex: '#1D2A44' },
  { id: 'burgundy', name: 'مارون وعنابي مخملي', hex: '#6B1D2F' },
];

export const BOX_SIZES = [
  {
    id: 'solo',
    name: 'بوكس الفرد الواحد (2 ساندوتش + جاتوه + عصير)',
    maxPieces: 4,
    basePrice: 75,
    idealFor: 'شخص واحد (وجبة فردية متكاملة لضيوف المناسبة)',
    tag: 'وجبة فردية لشخص واحد ⭐',
  },
  {
    id: 'mini',
    name: 'بوكس البهجة الميني (12 قطعة)',
    maxPieces: 12,
    basePrice: 220,
    idealFor: '3 - 4 أشخاص أو هدية تقدير مميزة',
    tag: 'مناسب للجلسات الصغيرة',
  },
  {
    id: 'classic',
    name: 'بوكس الضيافة الكلاسيكي (24 قطعة)',
    maxPieces: 24,
    basePrice: 390,
    idealFor: '6 - 8 أشخاص لاحتفال عائلي دافئ',
    tag: 'الأكثر شعبية',
  },
  {
    id: 'royal',
    name: 'بوكس النخبة الملكي (40 قطعة)',
    maxPieces: 40,
    basePrice: 640,
    idealFor: '12 - 15 شخصاً للحفلات والمناسبات',
    tag: 'فخامة مطلقة',
  },
  {
    id: 'tower',
    name: 'هرم التوزيعات والاحتفال الكبير (60 قطعة)',
    maxPieces: 60,
    basePrice: 920,
    idealFor: '20 - 25 شخصاً للبوفيهات والأعراس',
    tag: 'الضيافة الشاملة',
  },
];

// Curated Master Prompts for the User's project
export const MASTER_PROMPTS: PromptTemplate[] = [
  {
    id: 'master-app-prompt',
    title: 'البرومبت الرئيسي الشامل لتطوير تطبيق وتجربة مشروع التوزيعات (Master App Blueprint)',
    category: 'app_blueprint',
    categoryLabel: 'تطوير التطبيق والموقع',
    recommendedModel: 'Claude 3.7 Sonnet / Gemini 2.5 Pro / Cursor',
    summary: 'برومبت فائق الدقة لبناء تطبيق إلكتروني تجاري فاخر لبيع وتخصيص بوكسات الساندوتشات والجاتوهات، مع دعم منتقي المكونات، وحاسبة الضيافة، والطلب عبر الواتساب والدفع.',
    promptText: `Act as a world-class Lead Product Designer and Senior Full-Stack Engineer specializing in high-end culinary e-commerce, artisanal bakery storefronts, and bespoke event gifting platforms.

I want you to architect and build a delightful, mouth-watering, highly-converting web application for an artisanal celebration catering business named "[اسم المشروع أو العلامة التجارية، مثل: بهجة للتوزيعات الفاخرة]".

Core Business Offering:
- Artisanal gourmet savory bites (mini brioche sandwiches, smoked turkey croissants, Angus roast beef sliders, chicken muskhan rolls, salmon canapes).
- French patisserie sweet petit fours & gateaux (mini eclairs with gold leaf, fresh berry tarts, pastel macarons, lotus cheesecakes, chocolate fudge bites).
- Customized luxury giveaway boxes & towers for weddings, baby showers, graduations, corporate meetings, and birthdays.

Mandatory Architecture & UX Specifications:
1. Brand Identity & Visual Language:
   - Palette: Warm porcelain neutral background (#FAF7F2), warm golden/champagne accents (#D4AF37), soft blush rose tones, and crisp espresso charcoal text (#2D2421).
   - Typography: Clean modern Arabic display font (Cairo / Plus Jakarta Sans) with tabular numerals for prices. Zero AI slop, no tacky neon badges.
   - RTL Layout: Native Right-to-Left Arabic support with seamless responsiveness across 1440px desktop, tablet, and mobile.

2. Interactive Custom Box Builder (مُصمم البوكس المخصص):
   - Step 1: Occasion selection with visual icons.
   - Step 2: Box size choice (12 pcs, 24 pcs, 40 pcs, 60 pcs) with live piece limits.
   - Step 3: Interactive tray counter where users mix and match savory and sweet items with live progress bar (e.g. 16/24 items selected) and price computation.
   - Step 4: Personalization drawer (satin ribbon color selector, recipient name, customized greeting card message, font choice).
   - Real-time visual box preview displaying the selected ribbon, personalized tag, and items breakdown.

3. Smart Event Catering Calculator (حاسبة ضيافة المناسبات):
   - Input: Guest count, event timing (morning brunch, afternoon tea, evening dinner gala), budget tier.
   - Formula: Automatically suggests optimal ratio of savory vs sweet bites (e.g. 3.5 savory + 2 sweet per person) and generates an instant 1-click cart order.

4. E-Commerce & Checkout Engine:
   - Floating cart drawer with itemized summary and allergen notes.
   - Instant WhatsApp Order Generator that compiles a clean, formatted Arabic text receipt containing customer name, delivery address, selected occasion, custom ribbon, personalized card text, item list, and total price with a direct "https://wa.me/..." action.
   - Printable electronic invoice with order ID, date, and tax/delivery breakdown.

5. AI Event Stylist & Greeting Card Generator:
   - Gemini API integration providing personalized theme suggestions, color palettes, and touching Arabic poetry/congratulatory phrases for the giveaway gift cards.

Produce pristine, modular, strongly typed React + TypeScript + Tailwind CSS code with zero dead clicks and accessible interactive controls.`,
    keyOutputs: [
      'واجهة مستخدم تفاعلية بالكامل مع تجربة بناء بوكس الضيافة المخصص خطوة بخطوة',
      'حاسبة ضيافة ذكية لحساب كميات المعازيم بناء على التوقيت والميزانية',
      'مولّد طلبات واتساب مجهز وفوري بدون تعقيد مع معاينة الفاتورة',
      'نظام ألوان وتصميم متوافق مع أعلى معايير الرفاهية والبهجة'
    ],
    tips: [
      'استبدل [اسم المشروع] باسم متجرك الخاص وأضف رقم الواتساب الحقيقي في المتغيرات',
      'حدد الحد الأدنى للطلب وسياسة التوصيل قبل النشر'
    ]
  },
  {
    id: 'master-marketing-prompt',
    title: 'برومبت الحملة التسويقية وصناعة محتوى تيك توك وإنستغرام (Viral Social Media Plan)',
    category: 'marketing',
    categoryLabel: 'التسويق والمحتوى الفيروسي',
    recommendedModel: 'Gemini 3.8 Flash / ChatGPT-4o',
    summary: 'برومبت لابتكار سيناريوهات فيديوهات ريلز وتيك توك جذابة، إعلانات مدفوعة لزيادة طلبات حفلات التخرج والأعراس، وكتابة كابشن احترافي يجلب طلبات فورية.',
    promptText: `أنت مدير تسويق إلكتروني خبير ومبدع في قطاع الأغذية الفاخرة وضيافة المناسبات (F&B Event Catering & Luxury Favors).
أريد خطة محتوى وحملة إعلانية تسويقية فيروسية متكاملة لمشروعي الجديد المتخصص في توزيعات المناسبات (ميني ساندوتشات وجاتوهات فرنسية في بوكسات هدايا فاخرة بشريط ستان وكارت مخصص).

المطلوب:
1. عدد 5 أفكار وسيناريوهات لفيديوهات قصيرة (Reels / TikTok) تحبس الأنفاس (Hooks):
   - سيناريو 1: فكرة "Unboxing" مبهجة ومترفة لفتح بوكس التوزيعات الفردي في حفل استقبال مولود.
   - سيناريو 2: لحظة "صدمة الضيوف" من فخامة ميني ساندوتش الكرواسون والروست بيف.
   - سيناريو 3: فيديو تجهيز الطلبات خلف الكواليس مع صوت تقطيع المخبوزات وصوت سحب شريط الستان (ASMR تذوق وتغليف).
   - سيناريو 4: مقارنة طريفة بين "ضيافة عادية مكررة" و"بوكسات بهجة اللي بتبيض وجهك قدام المعازيم".
   - سيناريو 5: حيلة لإنقاذ مناسبة مفاجئة عبر الطلب السريع وحاسبة الضيافة.

2. نصوص إعلانات مدفوعة (Sponsored Ads Copy) لحملات إنستغرام وسناب شات:
   - إعلان موجه لعرائس موسم الخطوبة والزفاف.
   - إعلان موجه لأمهات حفلات التخرج والبيبي شاور.
   - إعلان B2B موجه لمديرات المكاتب ومنسقي فعاليات الشركات واجتماعات الـ VIP.

3. استراتيجية التسعير والعروض الترويجية:
   - باقة "التجربة الأولى" مع عينة تذوق مجانية.
   - باقة الخصم التراكمي للطلبات التي تزيد عن 30 علبة.
   - كول تو أكشن (Call-To-Action) يدفع للطلب الفوري عبر الواتساب أو الموقع.`,
    keyOutputs: [
      '5 نصوص وسيناريوهات تصوير تفصيلية مع لقطات الكاميرا والمؤثرات الصوتية',
      'كابشن تسويقي مع هاشتاقات الترند الخاصة بالمناسبات والضيافة',
      'خطة إعلانية جاهزة للإطلاق تستهدف المناسبات والاحتفالات'
    ],
    tips: [
      'ركز في التصوير على صوت قرمشة الكرواسون ولمعان الشوكولاتة على الإكلير',
      'أظهر كارت التوزيعات بوضوح وهو يحمل اسماً حقيقياً لإبراز التخصيص'
    ]
  },
  {
    id: 'master-photo-prompt',
    title: 'برومبت توليد وتصوير صور البوكسات والأطعمة بالذكاء الاصطناعي (Midjourney & Gemini)',
    category: 'photography',
    categoryLabel: 'جلسات التصوير والذكاء الاصطناعي',
    recommendedModel: 'Midjourney v6 / Gemini Nano Banana / Stable Diffusion 3',
    summary: 'مجموعة برومبتات استوديو فوتوغرافي تجاري عالي الجودة لتوليد صور طعام فاخرة للبوكسات والموالح والحلويات لاستخدامها في المتجر والكتالوج.',
    promptText: `Commercial culinary food photography prompt collection for a luxury celebration giveaway & catering brand:

Prompt 1 (Hero Box Open Display):
"Artisanal luxury celebration catering gift box made of textured off-white cardboard tied with a silky sage green satin ribbon, open top showing a meticulously organized grid of 24 miniature gourmet bites: golden flaky mini croissants, Angus roast beef mini brioche sliders with microgreens, glossy Belgian chocolate mini eclairs topped with edible gold leaf, and pastel raspberry macarons. Soft diffused natural morning daylight, marble kitchen tabletop with delicate baby breath flowers in background, 8k resolution, Leica 50mm f/1.4 lens, shallow depth of field --ar 16:9 --style raw"

Prompt 2 (Savory Platter Close-up):
"Macro close-up food photography of gourmet savory party platter: mini sliders with grilled beef and cheddar, chicken muskhan rolls sprinkled with ruby red sumac, and smoked salmon canapes on toasted rye bread with dill and lemon zest. Commercial food magazine styling, mouth-watering textures, vibrant natural colors, warm ambient party lighting --ar 4:3"

Prompt 3 (Individual Keepsake Favors):
"Row of 10 individual luxury wedding favor boxes lined up on a rustic wooden celebration banquet table. Each box is tied with a dusty rose silk ribbon bow and features an embossed gold foil calligraphy tag saying 'With Love'. Fresh eucalyptus and white peonies in soft focus bokeh behind, elegant romantic festive atmosphere --ar 4:3"`,
    keyOutputs: [
      'برومبتات جاهزة للنسخ لإنتاج صور منتجات واقعية وخالية من العيوب',
      'إرشادات الإضاءة وزاوية العدسة والكاميرا المستخدمة في جلسات التصوير الحقيقية'
    ],
    tips: [
      'استخدم الكلمات المفتاحية مثل "shallow depth of field" و "soft diffused daylight" لتجنب المظهر الصناعي',
      'استخدم نسبة العرض 4:3 لبطاقات المنتجات و16:9 للبانرات العريضة'
    ]
  },
  {
    id: 'master-b2b-prompt',
    title: 'برومبت صياغة عروض الأسعار والضيافة للشركات والجهات الراقية (B2B Corporate Proposal)',
    category: 'b2b_proposals',
    categoryLabel: 'مبيعات الشركات والجهات',
    recommendedModel: 'Claude 3.7 / Gemini 3.8 Flash',
    summary: 'برومبت لكتابة عروض أسعار رسمية جذابة لاجتماعات مجالس الإدارة، مؤتمرات الشركات، واحتفالات اليوم الوطني وافتتاح المقرات.',
    promptText: `أنت مستشار مبيعات وضيافة تنفيذية لكبرى الفنادق والمطاعم المتميزة.
اكتب عرض أسعار وخدمة (Catering & Hospitality Proposal) رسمي وجذاب موجّه إلى [اسم الشركة أو العميل، مثلاً: البنوك، الشركات التقنية، مكاتب المحاماة، الوزارات] لتقديم ضيافة بوكسات التوزيعات والاجتماعات لـ [عدد الضيوف، مثلاً 100 شخص].

العرض يجب أن يتضمن:
1. خطاب تقديم راقٍ يركّز على قيمة إبهار ضيوف الشركة وعملائها الكبار.
2. تفصيل خيارات الباقات المقترحة:
   - باقة "اجتماع مجلس الإدارة VIP": بوكسات فردية فاخرة تحمل شعار الشركة مطبوعاً بالذهب مع عصائر طبيعية مجففة.
   - باقة "المؤتمر وورش العمل": بوفيهات بوكسات تشاركية سريعة التناول ونظيفة لا تترك أي فوضى.
3. معايير الجودة وسلامة الغذاء والتغليف الحراري الفردي لضمان راحة الحضور.
4. جدول الكميات والأسعار المقترحة مع شروط التوريد والدفع وخدمة المنسقين.`,
    keyOutputs: [
      'خطاب عرض سعر تنفيذي باللغتين العربية والإنجليزية',
      'هيكلة باقات مبيعات الشركات متدرجة السعر لتحقيق أعلى أرباح'
    ],
    tips: [
      'أكّد دائماً على سهولة الأكل أثناء الاجتماع (Finger Food) دون اتساخ اليدين أو الأوراق',
      'وفّر خيار إضافة شعار الشركة (Logo) على شريط العلبة كقيمة مضافة مجانية للطلبات الكبيرة'
    ]
  },
  {
    id: 'master-card-messages-prompt',
    title: 'برومبت كتابة عبارات تهنئة وشكر شعرية لكروت التوزيعات (Occasion Card Copywriter)',
    category: 'card_copywriting',
    categoryLabel: 'كتابة كروت التهنئة وثيمات الحفل',
    recommendedModel: 'Gemini 3.8 Flash / ChatGPT-4o',
    summary: 'برومبت لتأليف عبارات راقية، أدبية، شعرية ومبهجة تطبع على كروت العلب لكل مناسبة (تخرج، بيبي شاور، زفاف، عيد ميلاد).',
    promptText: `أنت كاتب محتوى أدبي وشاعر معاصر متخصص في كتابة عبارات كروت الإهداء وتوزيعات الحفلات الفاخرة باللغة العربية الفصحى الراقية واللهجة الخليجية والمصرية اللطيفة.

المطلوب كتابة باقة من 12 عبارة فريدة ومبهجة وغير مكررة مقسمة حسب المناسبات التالية:
- 3 عبارات لحفلات الزفاف والخطوبة (تركز على المودة والمشاركة والامتنان للحضور).
- 3 عبارات لاستقبال المواليد والبيبي شاور (تركز على الفرحة بالضيف الصغير والبركة).
- 3 عبارات للتخرج والتفوق الدراسي (تركز على الفخر بالجهد وحصاد النجاح).
- 3 عبارات لضيافة الأعياد واجتماعات العائلة (تركز على الألفة ودوام المحبة).

الشروط:
- أن تكون العبارات قصيرة ومكثفة (من 10 إلى 20 كلمة) لتناسب حجم كارت التوزيعات الفردي الصغير.
- أن تنبض بالبهجة والصدق والرقي بدون ابتذال.`,
    keyOutputs: [
      'مجموعة عبارات جاهزة للطباعة الفورية على كروت بوكسات التوزيعات',
      'تنوع بين الأسلوب الأدبي الفصيح والأسلوب الاحتفالي الدافئ'
    ],
    tips: [
      'اجعل الخط في الكارت واضحاً واقترح استخدام الخط الكوفي أو خط الرقعة الأنيق مع رقائق الذهب'
    ]
  }
];

export const ORDER_TIMELINE_STEPS = [
  {
    status: 'confirmed',
    label: 'تم استلام وتأكيد الطلب',
    description: 'تمت مراجعة أصناف التوزيعات وثيم المناسبة واعتماد التجهيز في المطبخ.',
  },
  {
    status: 'baking',
    label: 'جاري الخَبز والتحضير الطازج',
    description: 'يتم خبز الكرواسون والبريوش الطازج وحشو الجاتوهات والسواريه بالزبدة الطبيعية.',
  },
  {
    status: 'packaging',
    label: 'التغليف الفاخر وربط الشرائط',
    description: 'تنسيق البوكسات، تثبيت شريط الساتان المختار، وطباعة كروت الإهداء المخصصة.',
  },
  {
    status: 'out_for_delivery',
    label: 'في الطريق مع التوصيل المبرّد',
    description: 'طلبك في سيارة التوصيل المبردة المجهزة للحفاظ على جودة ونضارة المخبوزات والحلويات.',
  },
  {
    status: 'delivered',
    label: 'تم التسليم في موقع الحفل بنجاح',
    description: 'وصلت التوزيعات في أبهى حلة لتجمّل مناسبتكم وتسعد ضيوفكم الكرام.',
  },
];

export const INITIAL_ORDERS: TrackedOrder[] = [
  {
    orderNumber: 'BAH-1045',
    createdAt: 'اليوم، 11:45 صباحاً',
    customerName: 'كريم عبد العزيز',
    customerPhone: '01099887766',
    deliveryAddress: 'القاهرة، المعادي، شارع النصر، برج النور الدور 5',
    eventDate: 'اليوم',
    eventTimeSlot: 'عصراً (2:00 م - 5:00 م)',
    status: 'baking' as const,
    subtotal: 750,
    deliveryFee: 0,
    grandTotal: 750,
    driverName: 'كابتن عمر جلال',
    driverPhone: '01144332211',
    notes: 'توزيعات اجتماع الشركة؛ كل بوكس فردي يحتوي على 2 ميني ساندوتش + جاتوه فرنسي + عصير برتقال فريش',
    lastUpdated: 'اليوم، 12:15 ظهراً',
    activityLog: [
      {
        id: 'log-1045-1',
        status: 'confirmed' as const,
        statusLabel: 'تم تأكيد واستلام الطلب',
        timestamp: 'اليوم، 11:45 ص',
        note: 'تم استلام الطلب ومراجعة مواصفات 10 بوكسات فردية للاجتماع.',
        actor: 'استقبال طلبات بهجة',
      },
      {
        id: 'log-1045-2',
        status: 'baking' as const,
        statusLabel: 'جاري الخَبز والتحضير الطازج',
        timestamp: 'اليوم، 12:15 م',
        note: 'بدأ خبز الميني كرواسون والبريوش وتجهيز الإكلير البلجيكي الطازج.',
        actor: 'فريق المطبخ والأفران',
      },
    ],
    items: [
      {
        cartItemId: 'init-solo-1',
        type: 'catalog' as const,
        title: 'بوكس البهجة الفردي الكلاسيكي (2 ميني ساندوتش + جاتوه + عصير)',
        price: 75,
        quantity: 10,
        image: IMAGES.solo,
        piecesCount: 4,
        details: [
          '10 بوكسات فردية مستقلة لـ 10 أفراد',
          'داخل كل بوكس: 2 ميني ساندوتش (كرواسون + بريوش)',
          'داخل كل بوكس: 1 قطعة ميني إكلير شوكولاتة بلجيكية',
          'داخل كل بوكس: 1 زجاجة عصير برتقال فريش طبيعي (250 مل)',
        ],
      }
    ],
  },
  {
    orderNumber: 'BAH-1048',
    createdAt: 'اليوم، 12:10 ظهراً',
    customerName: 'مريم الألفي',
    customerPhone: '01055443322',
    deliveryAddress: 'القاهرة الجديدة، التجمع الأول، كمبوند النرجس، فيلا 22',
    eventDate: 'اليوم',
    eventTimeSlot: 'مساءً (6:00 م - 9:00 م)',
    status: 'packaging' as const,
    subtotal: 510,
    deliveryFee: 0,
    grandTotal: 510,
    driverName: 'كابتن وليد سليم',
    driverPhone: '01288776655',
    notes: 'بوكس ضيافة مخصص لمناسبة تخرج مع شريط ذهبي وكارت إهداء مطبوع',
    lastUpdated: 'اليوم، 01:05 ظهراً',
    activityLog: [
      {
        id: 'log-1048-1',
        status: 'confirmed' as const,
        statusLabel: 'تم تأكيد واستلام الطلب',
        timestamp: 'اليوم، 12:10 م',
        note: 'تم تأكيد مواصفات البوكس المخصص وطباعة عبارة التهنئة باسم ندى.',
        actor: 'استقبال طلبات بهجة',
      },
      {
        id: 'log-1048-2',
        status: 'baking' as const,
        statusLabel: 'جاري الخَبز والتحضير الطازج',
        timestamp: 'اليوم، 12:38 م',
        note: 'تم تجهيز الكرواسون والروست بيف وتارت الفواكه الطازج.',
        actor: 'فريق المطبخ والأفران',
      },
      {
        id: 'log-1048-3',
        status: 'packaging' as const,
        statusLabel: 'التغليف الفاخر وربط الشرائط',
        timestamp: 'اليوم، 01:05 م',
        note: 'يتم الآن تنسيق البوكس وربط شريط الساتان الذهبي الملكي.',
        actor: 'قسم التغليف والتنسيق',
      },
    ],
    items: [
      {
        cartItemId: 'init-custom-1',
        type: 'custom_box' as const,
        title: 'بوكس البهجة الكلاسيكي - بتنسيق مخصص (حفل تخرج 🎓)',
        price: 510,
        quantity: 1,
        image: IMAGES.favors,
        piecesCount: 24,
        details: [
          'المناسبة: حفل تخرج 🎓',
          'الحجم: بوكس البهجة الكلاسيكي (24 قطعة)',
          'لون الشريط: شريط ستان ذهبي ملكي',
          'اسم الكارت: ألف مبروك التخرج يا ندى 🎓',
          '6x ميني كرواسون ديك رومي مدخن وشيدر',
          '6x ميني بريوش روست بيف أنجوس بالخردل',
          '6x ميني إكلير شوكولاتة بلجيكية ورقائق الذهب',
          '6x تارت الفراولة والتوت البري الباريسي'
        ],
        customBoxConfig: {
          occasion: 'graduation',
          occasionTitle: 'حفل تخرج',
          boxSize: 'classic',
          boxName: 'بوكس البهجة الكلاسيكي',
          maxPieces: 24,
          ribbonColor: '#D4AF37',
          ribbonColorName: 'ذهبي ملكي',
          recipientName: 'ألف مبروك التخرج يا ندى 🎓',
          cardMessage: 'فخورين بإنجازك الرائع ونتمنى لك مستقبلاً باهراً وحياة مليئة بالنجاحات!',
          selectedFillings: {
            'fill-croissant-turkey': 6,
            'fill-brioche-roastbeef': 6,
            'fill-eclair-belgian': 6,
            'fill-tart-berries': 6
          },
          baseBoxPrice: 380
        }
      }
    ]
  },
  {
    orderNumber: 'BAH-1042',
    createdAt: 'اليوم، 10:15 صباحاً',
    customerName: 'سارة أحمد',
    customerPhone: '01012345678',
    deliveryAddress: 'القاهرة، التجمع الخامس، قاعة ليلتي بجوار الجامعة الأمريكية',
    eventDate: 'اليوم',
    eventTimeSlot: 'مساءً (7:00 م - 10:00 م)',
    status: 'baking' as const,
    subtotal: 1040,
    deliveryFee: 0,
    grandTotal: 1040,
    driverName: 'كابتن محمود رضا',
    driverPhone: '01123456789',
    notes: 'يرجى وضع كروت التهنئة باسم المهندسة سارة بشرائط ذهبية',
    lastUpdated: 'اليوم، 11:00 صباحاً',
    activityLog: [
      {
        id: 'log-1042-1',
        status: 'confirmed' as const,
        statusLabel: 'تم تأكيد واستلام الطلب',
        timestamp: 'اليوم، 10:15 ص',
        note: 'تم تأكيد طلب القاعة وتجهيز بطاقات التهنئة بالشرائط الذهبية.',
        actor: 'استقبال طلبات بهجة',
      },
      {
        id: 'log-1042-2',
        status: 'baking' as const,
        statusLabel: 'جاري الخَبز والتحضير الطازج',
        timestamp: 'اليوم، 11:00 ص',
        note: 'البوكسات الآن في مرحلة الخبز الصباحي وتجهيز السواريه الفرنسي.',
        actor: 'فريق المطبخ والأفران',
      },
    ],
    items: [
      {
        cartItemId: 'init-1',
        type: 'catalog' as const,
        title: 'بوكس سواريه وجاتوهات البهجة الملكي',
        price: 520,
        quantity: 1,
        image: IMAGES.gateaux,
        piecesCount: 28,
        details: ['28 قطعة جاتوه فرنسي وشوكولاتة بلجيكية'],
      },
      {
        cartItemId: 'init-2',
        type: 'catalog' as const,
        title: 'بوكس موالح وساندوتشات السعادة الفاخر',
        price: 520,
        quantity: 1,
        image: IMAGES.savory,
        piecesCount: 30,
        details: ['30 قطعة ميني ساندوتش وكرواسون وروست بيف'],
      }
    ],
  },
  {
    orderNumber: 'BAH-1039',
    createdAt: 'اليوم، 08:30 صباحاً',
    customerName: 'م. طارق الشريف',
    customerPhone: '01234567890',
    deliveryAddress: 'الجيزة، الشيخ زايد، كمبوند الياسمين، فيلا 14',
    eventDate: 'اليوم',
    eventTimeSlot: 'عصراً (3:00 م - 6:00 م)',
    status: 'out_for_delivery' as const,
    subtotal: 650,
    deliveryFee: 0,
    grandTotal: 650,
    driverName: 'كابتن أحمد حسام',
    driverPhone: '01098765432',
    notes: 'الاستلام عند مدخل الحديقة الخلفية',
    lastUpdated: 'اليوم، 02:45 عصراً',
    activityLog: [
      {
        id: 'log-1039-1',
        status: 'confirmed' as const,
        statusLabel: 'تم تأكيد واستلام الطلب',
        timestamp: 'اليوم، 08:30 ص',
        note: 'تم اعتماد طلب 15 علبة توزيعات فردية.',
        actor: 'استقبال طلبات بهجة',
      },
      {
        id: 'log-1039-2',
        status: 'baking' as const,
        statusLabel: 'جاري الخَبز والتحضير الطازج',
        timestamp: 'اليوم، 11:20 ص',
        note: 'تم خبز الكرواسون وتجهيز الماكرون والإكلير البلجيكي.',
        actor: 'فريق المطبخ والأفران',
      },
      {
        id: 'log-1039-3',
        status: 'packaging' as const,
        statusLabel: 'التغليف الفاخر وربط الشرائط',
        timestamp: 'اليوم، 01:40 م',
        note: 'تم تغليف العلب الفردية وربط الشريط الساتان الزيتي بنجاح.',
        actor: 'قسم التغليف والتنسيق',
      },
      {
        id: 'log-1039-4',
        status: 'out_for_delivery' as const,
        statusLabel: 'في الطريق مع التوصيل المبرّد',
        timestamp: 'اليوم، 02:45 م',
        note: 'انطلق الكابتن أحمد حسام بالسيارة المبردة نحو الشيخ زايد.',
        actor: 'كابتن التوصيل المبرّد',
      },
    ],
    items: [
      {
        cartItemId: 'init-3',
        type: 'catalog' as const,
        title: 'علب توزيعات الهدايا الفردية الأنيقة (بكج 15 علبة)',
        price: 650,
        quantity: 1,
        image: IMAGES.favors,
        piecesCount: 45,
        details: ['15 علبة توزيعات فردية بشريط ستان زيتي'],
      }
    ],
  },
  {
    orderNumber: 'BAH-1035',
    createdAt: 'أمس، 02:00 ظهراً',
    customerName: 'د. نادية كمال',
    customerPhone: '01511223344',
    deliveryAddress: 'القاهرة، مصر الجديدة، فندق البارون، قاعة الاجتماعات الرئيسية',
    eventDate: 'أمس',
    eventTimeSlot: 'صباحاً (10:00 ص - 1:00 م)',
    status: 'delivered' as const,
    subtotal: 990,
    deliveryFee: 0,
    grandTotal: 990,
    driverName: 'كابتن شريف عادل',
    driverPhone: '01055667788',
    notes: 'تم التسليم لمنسق القاعة أ. عصام',
    lastUpdated: 'أمس، 01:15 ظهراً',
    activityLog: [
      {
        id: 'log-1035-1',
        status: 'confirmed' as const,
        statusLabel: 'تم تأكيد واستلام الطلب',
        timestamp: 'أمس، 09:00 ص',
        note: 'تم تأكيد بكج طاولة الفرح (65 قطعة + 12 عصير موكتيل).',
        actor: 'استقبال طلبات بهجة',
      },
      {
        id: 'log-1035-2',
        status: 'baking' as const,
        statusLabel: 'جاري الخَبز والتحضير الطازج',
        timestamp: 'أمس، 10:15 ص',
        note: 'اكتمل خبز الموالح وتجهيز السواريه وحفظ العصائر مبردة.',
        actor: 'فريق المطبخ والأفران',
      },
      {
        id: 'log-1035-3',
        status: 'packaging' as const,
        statusLabel: 'التغليف الفاخر وربط الشرائط',
        timestamp: 'أمس، 11:30 ص',
        note: 'تم تجهيز حوامل التقديم والكروت الترحيبية للمؤتمر.',
        actor: 'قسم التغليف والتنسيق',
      },
      {
        id: 'log-1035-4',
        status: 'out_for_delivery' as const,
        statusLabel: 'في الطريق مع التوصيل المبرّد',
        timestamp: 'أمس، 12:25 م',
        note: 'خرج الطلب مع كابتن شريف عادل إلى فندق البارون.',
        actor: 'كابتن التوصيل المبرّد',
      },
      {
        id: 'log-1035-5',
        status: 'delivered' as const,
        statusLabel: 'تم التسليم في موقع الحفل بنجاح',
        timestamp: 'أمس، 01:15 م',
        note: 'تم تسليم الطلب بالكامل لمنسق القاعة أ. عصام.',
        actor: 'تأكيد التسليم للعميل',
      },
    ],
    items: [
      {
        cartItemId: 'init-4',
        type: 'catalog' as const,
        title: 'بكج الحفلات والضيافة المتكامل "طاولة الفرح"',
        price: 990,
        quantity: 1,
        image: IMAGES.hero,
        piecesCount: 65,
        details: ['65 قطعة مالح وحلو + 12 زجاجة عصير موكتيل فريش'],
      }
    ],
    rating: {
      stars: 5,
      packagingRating: 5,
      qualityRating: 5,
      deliveryRating: 5,
      comment: 'الضيافة كانت مبهرة جداً وبيضت وجهنا قدام ضيوف المؤتمر، الميني كرواسون والجاتوهات كانت طازجة وريحتها زبدة طبيعية راقية والتوصيل كان في الموعد بالدقيقة!',
      tags: ['طازج ولذيذ جداً', 'تغليف فاخر يشرّف', 'التزام دقيق بالوقت'],
      submittedAt: 'أمس، 03:30 عصراً'
    }
  },
  {
    orderNumber: 'BAH-1038',
    createdAt: 'أمس، 04:00 عصراً',
    customerName: 'هند المنشاوي',
    customerPhone: '01033445566',
    deliveryAddress: 'القاهرة، الزمالك، شارع البرازيل، عمارة 18',
    eventDate: 'أمس',
    eventTimeSlot: 'مساءً (6:00 م - 8:00 م)',
    status: 'delivered' as const,
    subtotal: 680,
    deliveryFee: 0,
    grandTotal: 680,
    driverName: 'كابتن كريم فاروق',
    driverPhone: '01177889900',
    notes: 'بوكسات استقبال ضيوف عائلية مع كارت إهداء',
    lastUpdated: 'أمس، 07:15 مساءً',
    activityLog: [
      {
        id: 'log-1038-1',
        status: 'confirmed' as const,
        statusLabel: 'تم تأكيد واستلام الطلب',
        timestamp: 'أمس، 04:00 م',
        note: 'تم استلام طلب الضيافة العائلية (8 بوكسات فردية + تارت الفواكه).',
        actor: 'استقبال طلبات بهجة',
      },
      {
        id: 'log-1038-2',
        status: 'baking' as const,
        statusLabel: 'جاري الخَبز والتحضير الطازج',
        timestamp: 'أمس، 04:50 م',
        note: 'تم خبز الساندوتشات وتجهيز تارت الفراولة والتوت الطازج.',
        actor: 'فريق المطبخ والأفران',
      },
      {
        id: 'log-1038-3',
        status: 'packaging' as const,
        statusLabel: 'التغليف الفاخر وربط الشرائط',
        timestamp: 'أمس، 05:45 م',
        note: 'تم تغليف البوكسات وإرفاق كارت الإهداء العائلي.',
        actor: 'قسم التغليف والتنسيق',
      },
      {
        id: 'log-1038-4',
        status: 'out_for_delivery' as const,
        statusLabel: 'في الطريق مع التوصيل المبرّد',
        timestamp: 'أمس، 06:30 م',
        note: 'انطلق المندوب كريم فاروق في اتجاه الزمالك.',
        actor: 'كابتن التوصيل المبرّد',
      },
      {
        id: 'log-1038-5',
        status: 'delivered' as const,
        statusLabel: 'تم التسليم في موقع الحفل بنجاح',
        timestamp: 'أمس، 07:15 م',
        note: 'تم التسليم في الزمالك — الطلب جاهز لتقييم العميل.',
        actor: 'تأكيد التسليم للعميل',
      },
    ],
    items: [
      {
        cartItemId: 'init-5',
        type: 'catalog' as const,
        title: 'بوكس البهجة الفردي الكلاسيكي (2 ميني ساندوتش + جاتوه + عصير)',
        price: 75,
        quantity: 8,
        image: IMAGES.solo,
        piecesCount: 4,
        details: [
          '8 بوكسات فردية مستقلة لـ 8 ضيوف',
          'داخل كل بوكس: 2 ميني ساندوتش + ميني إكلير + عصير برتقال فريش'
        ],
      },
      {
        cartItemId: 'init-6',
        type: 'catalog' as const,
        title: 'بوكس ميني تارت الفواكه الباريسية',
        price: 80,
        quantity: 1,
        image: IMAGES.gateaux,
        piecesCount: 12,
        details: ['12 قطعة تارت فراولة وتوت طازج'],
      }
    ],
  }
];

