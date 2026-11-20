import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Sparkles, 
  Maximize2, 
  X, 
  Check, 
  ShoppingBag, 
  Sliders, 
  Tag, 
  Users, 
  Layers, 
  HeartHandshake
} from 'lucide-react';
import { IMAGES } from '../data/cateringData';
import { CartItem } from '../types/catering';

interface ShowcaseSlide {
  id: string;
  title: string;
  category: string;
  badge: string;
  image: string;
  guestCount: string;
  pricePerBox: number;
  description: string;
  highlights: string[];
  suggestedBoxTitle: string;
  bundleCartItem: Omit<CartItem, 'cartItemId'>;
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'showcase-wedding-royal',
    title: 'توزيعات خطوبة وزفاف ملكي - قاعة فورسيزونز',
    category: 'أعراس وخطوبة',
    badge: 'الأكثر فخامة',
    image: IMAGES.hero,
    guestCount: '120 معزوم',
    pricePerBox: 95,
    description: 'تنسيق متكامل وفاخر يضم بوكسات فردية راقية بشريط ستان بلش، ميني ساندوتشات فرنسية هشة (كرواسون ديك رومي وبريوش روست بيف أنجوس) مع ميني تارت توت وإكلير بلجيكي وعصير طبيعي وكروت مطبوعة بأسماء العروسين.',
    highlights: [
      '120 بوكس فردي صحي محكم الإغلاق',
      '2 ميني ساندوتش فرنسي + جاتوه سواريه + عصير فريش لكل معزوم',
      'تغليف بلون وردي عاجي مع شريط ستان وكارت إهداء خاص',
      'تنسيق صواني تقديم رخامية مذهبة'
    ],
    suggestedBoxTitle: 'بكج زفاف فورسيزونز الفاخر (بوكس فردي كامل)',
    bundleCartItem: {
      type: 'custom_box',
      title: 'تنسيق زفاف ملكي (بوكس فردي: 2 ميني ساندوتش + تارت + عصير فريش)',
      price: 95,
      quantity: 1,
      image: IMAGES.hero,
      piecesCount: 4,
      details: [
        '1x ميني كرواسون ديك رومي وشيدر سويسري',
        '1x ميني بريوش روست بيف أنجوس بالخردل الفرنسي',
        '1x ميني تارت التوت والفراولة الباريسي',
        '1x عصير برتقال طبيعي فريش 100%',
        'تغليف ذهبي ملكي مع شريط بلش وكارت إهداء خاص'
      ]
    }
  },
  {
    id: 'showcase-corporate-summit',
    title: 'ضيافة قمة أعمال الشركات وميتينج كبار التنفيذيين VIP',
    category: 'مؤتمرات وشركات',
    badge: 'طابع تنفيذي احترافي',
    image: IMAGES.savory,
    guestCount: '80 مشارك',
    pricePerBox: 85,
    description: 'ضيافة عملية وأنيقة تناسب بيئة الأعمال والاجتماعات الرفيعة. تشكيلة ميني سلايدرز أنجوس، كلوب ساندوتش حبوب كاملة، ميني بريوش سلمون مدخن، وعبوات عصير فواكه مثلجة مع مناديل معقمة.',
    highlights: [
      '80 بوكس فردي يحمل شعار المؤتمر',
      'ميني سلايدرز لحم أنجوس وبريوش سلمون مدخن',
      'عصائر طبيعية محكمة الغلق بدون سكر مضاف',
      'تسليم في الموعد المحدد بدرجة برودة مثالية'
    ],
    suggestedBoxTitle: 'بكج مؤتمرات الأعمال VIP (سلايدرز + عصير فريش)',
    bundleCartItem: {
      type: 'custom_box',
      title: 'تنسيق قمة الأعمال (ميني سلايدرز + بريوش سلمون + عصير)',
      price: 85,
      quantity: 1,
      image: IMAGES.savory,
      piecesCount: 4,
      details: [
        '1x ميني برجر لحم أنجوس فاخر',
        '1x ميني بريوش سلمون مدخن بالجبن الكريمي',
        '1x ميني إكلير شوكولاتة بلجيكية بالذهب',
        '1x عصير تفاح وكيوي ديتوكس منعش',
        'علبة كحلية تنفيذية راقية مع منديل معقم'
      ]
    }
  },
  {
    id: 'showcase-baby-shower',
    title: 'توزيعات استقبال بيبي شاور ومولود جديد',
    category: 'استقبال مواليد',
    badge: 'ألوان باستيل ناعمة',
    image: IMAGES.favors,
    guestCount: '60 ضيف',
    pricePerBox: 65,
    description: 'توزيعات مليئة بالدفء والبهجة للاحتفال بقدوم أغلى المواليد. علب باستيل ناعمة مزينة بفيونكات حريرية مع ميني ماكرون فرنسي، شوكولاتة بلجيكية فاخرة، وميني ساندوتش جبن حلوم وزعتر بري.',
    highlights: [
      'علب هدايا أنيقة بطباعة مخصصة لاسم وتاريخ المولود',
      'ميني ماكرون فرنسي بالألوان الهادئة (بيبي بلو أو بودرة)',
      'ساندوتشات خفيفة وصحية مناسبة للجلسات العائلية',
      'كروت ترحيبية رقيقة لكل زائر'
    ],
    suggestedBoxTitle: 'بكج استقبال المواليد الباستيل (سواريه وحلويات فرنسية)',
    bundleCartItem: {
      type: 'custom_box',
      title: 'تنسيق استقبال بيبي شاور (ماكرون + ميني ساندوتش + كارت بالاسم)',
      price: 65,
      quantity: 1,
      image: IMAGES.favors,
      piecesCount: 4,
      details: [
        '1x ميني حلوم مشوي بصوص البيستو والطماطم المجففة',
        '2x ماكرون باريسي بألوان الباستيل الناعمة',
        '1x ترافل شوكولاتة بلجيكية فاخرة',
        '1x عصير جوافة طبيعي بالنعناع المنعش',
        'علبة باستيل مزينة بفيونكة حريرية وكارت باسم المولود'
      ]
    }
  },
  {
    id: 'showcase-graduation-sweet',
    title: 'بوفيه سواريه وتخرج جامعي مرموق',
    category: 'حفلات تخرج',
    badge: 'طاقة واحتفال',
    image: IMAGES.gateaux,
    guestCount: '90 مدعو',
    pricePerBox: 70,
    description: 'عرض ساحر من الجاتوهات الفرنسية المصغرة: ميني ميل فوي بالفانيليا المدغشقرية، ميني تشيز كيك التوت، وتارت الفستق الحلبي، مع كروت تخرج تحمل قبعة التخرج وأسماء الخريجين.',
    highlights: [
      'تشكيلة 100% فرنسية كلاسيكية ومودرن',
      'أوراق ذهب غذائي 24 قيراط ولمسات سكرية براقة',
      'بوكسات تقديم شفافة تبرز جمال كل قطعة',
      'مشروبات منعشة وقهوة باردة مرافقة'
    ],
    suggestedBoxTitle: 'بكج سواريه التخرج الذهبي (جاتوهات فرنسية وساندوتش)',
    bundleCartItem: {
      type: 'custom_box',
      title: 'تنسيق حفل تخرج راقي (ميل فوي + تشيز كيك + كرواسون)',
      price: 70,
      quantity: 1,
      image: IMAGES.gateaux,
      piecesCount: 4,
      details: [
        '1x ميني كرواسون أجبان سويسرية وجرجير طازج',
        '1x ميني ميل فوي بالفانيليا والكراميل المقرمش',
        '1x ميني تشيز كيك نيويورك بالتوت البري',
        '1x كركديه فريش بالرمان والليمون المثلج',
        'علبة ملكية بلمسات كحلي وذهبي مع شعار التخرج'
      ]
    }
  },
  {
    id: 'showcase-solo-complete',
    title: 'البوكس الفردي المتكامل لكل معزوم (2 ميني ساندوتش + جاتوه + عصير)',
    category: 'وجبة فردية متكاملة',
    badge: 'الأعلى طلباً',
    image: IMAGES.solo,
    guestCount: '150 معزوم',
    pricePerBox: 75,
    description: 'الحل الذكي والأكثر رقياً لضيافة المعازيم بلا هدر أو فوضى! كل ضيف يتسلم بوكس أنيق محكم الغلق يحتوي على 2 ميني ساندوتش طازج + جاتوه فرنسي + عصير طبيعي + منديل معقم.',
    highlights: [
      'توزيع سلس وسريع ومريح للمنظمين',
      'أمان غذائي 100% ونظافة تامة لكل مدعو',
      'وفر في التكلفة والوقت مع إرضاء جميع الأذواق',
      'كارت ترحيبي وشريط ستان باللون المفضل لمناسبتك'
    ],
    suggestedBoxTitle: 'بوكس البهجة الفردي الشامل (2 ساندوتش + جاتوه + عصير)',
    bundleCartItem: {
      type: 'custom_box',
      title: 'بوكس البهجة الفردي الكامل (2 ساندوتش + جاتوه + عصير فريش)',
      price: 75,
      quantity: 1,
      image: IMAGES.solo,
      piecesCount: 4,
      details: [
        '1x ميني كرواسون ديك رومي مدخن وشيدر',
        '1x ميني بريوش روست بيف أنجوس بالخردل الفرنسي',
        '1x ميني إكلير شوكولاتة بلجيكية بالذهب الغذائي',
        '1x زجاجة عصير برتقال طبيعي فريش 100%',
        'علبة تيراكوتا البهجة وشريط ستان نحاسي ومنديل معقم'
      ]
    }
  }
];

interface EventShowcaseSlideshowProps {
  onAddToCart: (item: CartItem) => void;
  onOpenCustomBuilder?: () => void;
}

export const EventShowcaseSlideshow: React.FC<EventShowcaseSlideshowProps> = ({
  onAddToCart,
  onOpenCustomBuilder
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [guestQuantity, setGuestQuantity] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = SHOWCASE_SLIDES[currentIndex];

  // Auto-play interval handling
  useEffect(() => {
    if (isPlaying && !isLightboxOpen) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % SHOWCASE_SLIDES.length);
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isLightboxOpen]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  };

  // Add the matching setup directly to cart
  const handleOrderMatchingSetup = () => {
    const itemToAdd: CartItem = {
      ...currentSlide.bundleCartItem,
      cartItemId: `showcase-setup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      quantity: guestQuantity,
    };

    onAddToCart(itemToAdd);

    setAddedToast(`تمت إضافة تنسيق (${currentSlide.suggestedBoxTitle}) لعدد ${guestQuantity} معزوم إلى السلة بنجاح! 🛍️`);
    setTimeout(() => {
      setAddedToast(null);
    }, 4500);
  };

  return (
    <section id="showcase" className="py-16 sm:py-20 bg-gradient-to-b from-[#FAF6F0] via-white to-[#FAF6F0] border-t border-[#E8DCD0] relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#FAF0E6] rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-[#F2DFD4] rounded-full blur-3xl pointer-events-none opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0E6] border border-[#ECD9CA] text-[#B85333] text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D97736]" />
            <span>معرض أعمال وتوزيعات المناسبات السابقة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#231815] tracking-tight mb-3">
            عرض تقديمي لمناسبات حقيقية نفذناها بحب 📸
          </h2>
          <p className="text-sm sm:text-base text-[#66544D] leading-relaxed">
            استلهم فكرة مناسبتك القادمة من أحدث التنسيقات الواقعية لعملائنا، وبضغطة زر يمكنك طلب نفس التنسيق تماماً لعدد ضيوفك مع التخصيص الكامل.
          </p>
        </div>

        {/* Main Slideshow Frame */}
        <div 
          className="bg-white rounded-3xl border border-[#E8DCD0] shadow-xl overflow-hidden transition-all duration-300"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Visual Media Pane (7 Cols on desktop) */}
            <div className="lg:col-span-7 relative bg-[#1E1715] overflow-hidden flex items-center justify-center min-h-[340px] sm:min-h-[420px] lg:min-h-full">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-cover object-center transform transition-all duration-700 hover:scale-105"
                loading="eager"
              />

              {/* Gradient Overlay for Text Clarity */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

              {/* Category & Badge Chips */}
              <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2 z-20">
                <span className="bg-[#B85333] text-white text-xs font-black px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  {currentSlide.category}
                </span>
                <span className="bg-black/60 text-white/95 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                  {currentSlide.badge}
                </span>
              </div>

              {/* Lightbox / Zoom Trigger */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#231815] transition-all shadow-md z-20 hover:scale-110 cursor-pointer"
                title="عرض الصورة بالحجم الكامل"
                aria-label="عرض الصورة بالحجم الكامل"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Bottom Details Overlay on Image */}
              <div className="absolute bottom-4 right-4 left-4 z-20 text-white">
                <div className="flex items-center gap-3 text-xs text-white/90 mb-1 font-semibold">
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    <Users className="w-3.5 h-3.5 text-[#FFE8B3]" />
                    <span>تم التنسيق لـ: {currentSlide.guestCount}</span>
                  </span>
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    <Layers className="w-3.5 h-3.5 text-[#FFE8B3]" />
                    <span>سعر البوكس: {currentSlide.pricePerBox} ج.م</span>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold leading-tight drop-shadow-md">
                  {currentSlide.title}
                </h3>
              </div>

              {/* Prev / Next Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#231815] shadow-lg flex items-center justify-center transition-all z-20 hover:scale-110 cursor-pointer"
                aria-label="المناسبة السابقة"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#231815] shadow-lg flex items-center justify-center transition-all z-20 hover:scale-110 cursor-pointer"
                aria-label="المناسبة التالية"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Information & Order Action Pane (5 Cols on desktop) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white">
              <div>
                {/* Micro Header with Play/Pause and Slide Counter */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F2ECE4]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8C766B]">المناسبة رقم:</span>
                    <span className="text-xs font-black text-[#B85333] px-2 py-0.5 rounded-md bg-[#FAF0E6]">
                      {currentIndex + 1} من {SHOWCASE_SLIDES.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(p => !p)}
                      className="p-1.5 rounded-lg text-[#8C766B] hover:text-[#231815] hover:bg-[#FAF6F0] transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      title={isPlaying ? 'إيقاف مؤقت للعرض التلقائي' : 'تشغيل العرض التلقائي'}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>إيقاف مؤقت</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>تشغيل تلقائي</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Event Title & Description */}
                <h3 className="text-xl sm:text-2xl font-black text-[#231815] mb-2.5 leading-snug">
                  {currentSlide.title}
                </h3>
                <p className="text-sm text-[#66544D] leading-relaxed mb-5">
                  {currentSlide.description}
                </p>

                {/* Highlights List */}
                <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EFE5D9] mb-6">
                  <h4 className="text-xs font-bold text-[#231815] mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B85333]" />
                    <span>محتويات ومميزات هذا التنسيق الواقعي:</span>
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#4A3B32]">
                    {currentSlide.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2A6B48] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Guest Quantity Selector */}
                <div className="mb-6 bg-white p-3.5 rounded-xl border border-[#E8DCD0]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#231815] mb-2">
                    <span>عدد المعازيم المطلوب لهم هذا التنسيق:</span>
                    <span className="text-[#B85333] font-black">{guestQuantity} بوكس فردي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[20, 30, 50, 80, 100].map(qty => (
                      <button
                        key={qty}
                        onClick={() => setGuestQuantity(qty)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          guestQuantity === qty
                            ? 'bg-[#B85333] text-white border-[#B85333] shadow-xs'
                            : 'bg-[#FAF6F0] text-[#66544D] border-[#E8DCD0] hover:bg-[#F2ECE4]'
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-right text-[11px] text-[#8C766B]">
                    الإجمالي التقريبي: <strong className="text-[#231815]">{guestQuantity * currentSlide.pricePerBox} ج.م</strong> ({currentSlide.pricePerBox} ج.م للبوكس)
                  </div>
                </div>
              </div>

              {/* Order Matching Arrangement CTA (Direct User Requirement) */}
              <div className="space-y-2.5 pt-2 border-t border-[#F2ECE4]">
                <button
                  onClick={handleOrderMatchingSetup}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm sm:text-base font-black text-white bg-[#B85333] hover:bg-[#9E472A] rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#FFE8B3]" />
                  <span>طلب تنسيق مشابه لهذه المناسبة ({guestQuantity} بوكس)</span>
                </button>

                {onOpenCustomBuilder && (
                  <button
                    onClick={onOpenCustomBuilder}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#66544D] bg-[#FAF6F0] hover:bg-[#F2ECE4] border border-[#E8DCD0] rounded-xl transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#B85333]" />
                    <span>تعديل مكونات هذا البوكس في صانع البوكسات المخصص</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Thumbnails Navigation Strip */}
          <div className="bg-[#FAF7F2] p-3 sm:p-4 border-t border-[#E8DCD0] flex items-center justify-between gap-3 overflow-x-auto">
            <span className="text-xs font-bold text-[#8C766B] shrink-0 hidden sm:inline">
              المناسبات السابقة:
            </span>

            <div className="flex items-center gap-2.5 overflow-x-auto py-1">
              {SHOWCASE_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all text-right shrink-0 cursor-pointer ${
                    currentIndex === idx
                      ? 'bg-white border-[#B85333] shadow-xs ring-2 ring-[#B85333]/20'
                      : 'bg-white/60 border-transparent hover:bg-white text-[#66544D]'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="hidden md:block max-w-[130px] truncate text-right">
                    <p className={`text-xs font-bold truncate ${currentIndex === idx ? 'text-[#B85333]' : 'text-[#231815]'}`}>
                      {slide.category}
                    </p>
                    <p className="text-[10px] text-[#8C766B] truncate">
                      {slide.pricePerBox} ج.م / بوكس
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick indicator dots */}
            <div className="flex items-center gap-1.5 shrink-0">
              {SHOWCASE_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 h-2 bg-[#B85333]'
                      : 'w-2 h-2 bg-[#D9C8BA] hover:bg-[#B85333]/60'
                  }`}
                  aria-label={`الانتقال للشريحة ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Success Added Toast Banner */}
        {addedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2A6B48] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-bounce">
            <Check className="w-5 h-5 text-[#98E2B2]" />
            <span className="text-sm font-bold">{addedToast}</span>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-all cursor-pointer z-50"
            aria-label="إغلاق العرض المكبر"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <div className="text-center mt-4 text-white">
              <h4 className="text-lg font-bold">{currentSlide.title}</h4>
              <p className="text-xs text-white/80 mt-1">{currentSlide.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
