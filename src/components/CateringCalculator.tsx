import React, { useState, useMemo } from 'react';
import { Calculator, Users, Clock, Sparkles, Check, ShoppingBag, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types/catering';
import { IMAGES } from '../data/cateringData';

interface CateringCalculatorProps {
  onAddRecommendedBundleToCart: (item: CartItem) => void;
}

export const CateringCalculator: React.FC<CateringCalculatorProps> = ({
  onAddRecommendedBundleToCart,
}) => {
  const [guestCount, setGuestCount] = useState<number>(25);
  const [eventTime, setEventTime] = useState<'morning' | 'tea' | 'evening'>('evening');
  const [servingStyle, setServingStyle] = useState<'solo_boxes' | 'buffet'>('solo_boxes');
  const [tier, setTier] = useState<'standard' | 'balanced' | 'royal'>('balanced');
  const [addedToast, setAddedToast] = useState(false);

  // Recommendations calculation
  const recommendation = useMemo(() => {
    if (servingStyle === 'solo_boxes') {
      // 1-person individual box: 2 mini sandwiches + 1 gateau + 1 fresh juice per guest
      const totalSavory = guestCount * 2;
      const totalSweet = guestCount * 1;
      const totalJuices = guestCount * 1;
      const totalPieces = totalSavory + totalSweet + totalJuices;
      const boxesCount = guestCount; // Exactly 1 box per guest

      let pricePerBox = 75; // Standard solo box price
      if (tier === 'standard') pricePerBox = 68;
      if (tier === 'royal') pricePerBox = 90;

      // Quantity discount for 15+ guests
      if (guestCount >= 20) pricePerBox = Math.round(pricePerBox * 0.95);

      const estimatedTotal = guestCount * pricePerBox;

      return {
        isSolo: true,
        totalSavory,
        totalSweet,
        totalJuices,
        totalPieces,
        boxesCount,
        estimatedTotal,
        pricePerBox,
        savoryPerGuest: 2,
        sweetPerGuest: 1,
      };
    }

    let savoryPerGuest = 3;
    let sweetPerGuest = 2;

    if (eventTime === 'morning') {
      savoryPerGuest = 3.5;
      sweetPerGuest = 1.5;
    } else if (eventTime === 'tea') {
      savoryPerGuest = 2.5;
      sweetPerGuest = 2.5;
    } else if (eventTime === 'evening') {
      savoryPerGuest = 4;
      sweetPerGuest = 2;
    }

    const totalSavory = Math.ceil(guestCount * savoryPerGuest);
    const totalSweet = Math.ceil(guestCount * sweetPerGuest);
    const totalPieces = totalSavory + totalSweet;

    // Box breakdown estimation (using 24-piece boxes as standard unit)
    const boxesCount = Math.max(1, Math.ceil(totalPieces / 24));
    
    // Tier pricing multiplier in Egyptian Pounds
    let pricePerPiece = 18;
    if (tier === 'standard') pricePerPiece = 15;
    if (tier === 'royal') pricePerPiece = 22;

    const estimatedTotal = Math.round(totalPieces * pricePerPiece);

    return {
      isSolo: false,
      totalSavory,
      totalSweet,
      totalJuices: 0,
      totalPieces,
      boxesCount,
      estimatedTotal,
      pricePerBox: 0,
      savoryPerGuest,
      sweetPerGuest,
    };
  }, [guestCount, eventTime, tier, servingStyle]);

  const handleAddBundle = () => {
    const timeLabels = {
      morning: 'صباحي وإفطار',
      tea: 'شاي وعصرونية',
      evening: 'سهرة وحفل مسائي',
    };

    const tierLabels = {
      standard: 'اقتصادي مميز',
      balanced: 'متوازن وشهي',
      royal: 'ملكي فاخر VIP',
    };

    const isSolo = servingStyle === 'solo_boxes';

    const bundleItem: CartItem = {
      cartItemId: `calc-bundle-${Date.now()}`,
      type: 'catalog',
      title: isSolo 
        ? `بكج بوكسات فردية (${guestCount} ضيفاً - كل بوكس: ساندوتشين + جاتوه + عصير فريش)`
        : `بكج ضيافة بوفيه مخصص (${guestCount} ضيفاً - باقة ${tierLabels[tier]})`,
      price: recommendation.estimatedTotal,
      quantity: 1,
      image: isSolo ? (IMAGES as any).solo || IMAGES.favors : IMAGES.hero,
      piecesCount: recommendation.totalPieces,
      details: isSolo ? [
        `عدد البوكسات الفردية: ${guestCount} بوكس مستقل لكل ضيف`,
        `المحتويات لكل بوكس: 2 ميني ساندوتش طازج + قطعة جاتوه سواريه + زجاجة عصير فريش طبيعي`,
        `إجمالي الساندوتشات: ${recommendation.totalSavory} قطعة`,
        `إجمالي الجاتوهات: ${recommendation.totalSweet} قطعة`,
        `إجمالي العصائر الطبيعية: ${recommendation.totalJuices} عبوة فريش معقمة`,
        `تغليف فردي بشريط ستان وكارت مطبوع باسم المناسبة مجاناً`,
      ] : [
        `عدد الضيوف: ${guestCount} شخص`,
        `توقيت المناسبة: ${timeLabels[eventTime]}`,
        `الموالح والساندوتشات: ${recommendation.totalSavory} قطعة`,
        `الجاتوهات والحلويات: ${recommendation.totalSweet} قطعة`,
        `إجمالي البوكسات: ${recommendation.boxesCount} بوكسات فاخرة بشرائط مخصصة`,
      ],
    };

    onAddRecommendedBundleToCart(bundleItem);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <section id="calculator" className="py-12 lg:py-20 bg-[#F7F2ED] border-t border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#B46D52]">
            <Calculator className="w-4 h-4" />
            <span>حاسبة ضيافة المناسبات الذكية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2421] [text-wrap:balance]">
            لا تحتار في الحساب.. اعرف الكمية الدقيقة والمثالية لضيوفك في ثوانٍ
          </h2>
          <p className="text-base text-[#6B5B55] [text-wrap:balance]">
            أدخل عدد المعازيم وتوقيت الحفل، وستحسب لك الخوارزمية التوزيع المتوازن بين الساندوتشات والجاتوهات بدون هدر أو نقص.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD8] shadow-sm space-y-7">
            
            {/* Guest Count Slider & Quick Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#2D2421] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#B46D52]" />
                  عدد الضيوف المتوقع:
                </label>
                <span className="text-xl font-extrabold text-[#B46D52] tabular-nums">
                  {guestCount} ضيفاً
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                className="w-full accent-[#B46D52] cursor-pointer"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 30, 50, 75, 100].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setGuestCount(cnt)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors tabular-nums ${
                      guestCount === cnt 
                        ? 'bg-[#2D2421] text-white' 
                        : 'bg-[#F4EDE7] text-[#6B5B55] hover:bg-[#EAE0D7]'
                    }`}
                  >
                    {cnt} ضيوف
                  </button>
                ))}
              </div>
            </div>

            {/* Serving Style Format */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#2D2421] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B46D52]" />
                  شكل ونظام تقديم الضيافة:
                </span>
                <span className="text-xs font-semibold text-[#B46D52]">
                  {servingStyle === 'solo_boxes' ? 'بوكس شخص واحد لكل ضيف' : 'بوفيه وبوكسات عائلية'}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setServingStyle('solo_boxes')}
                  className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                    servingStyle === 'solo_boxes'
                      ? 'border-[#B46D52] bg-[#FAF0EA] ring-1 ring-[#B46D52]'
                      : 'border-[#E8DFD8] hover:border-[#D4C3B7] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                      <span>بوكس فردي لكل معزوم</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B46D52] text-white">الأكثر طلباً</span>
                    </span>
                    <span className="text-xs font-semibold text-[#B46D52]">شخص واحد</span>
                  </div>
                  <p className="text-[11px] text-[#7D6B64] leading-relaxed">
                    علبة أنيقة مستقلة لكل ضيف تضم (2 ميني ساندوتش + 1 قطعة جاتوه + 1 زجاجة عصير فريش) مع منديل وكارت.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setServingStyle('buffet')}
                  className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                    servingStyle === 'buffet'
                      ? 'border-[#B46D52] bg-[#FAF0EA] ring-1 ring-[#B46D52]'
                      : 'border-[#E8DFD8] hover:border-[#D4C3B7] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D2421]">بوفيه وصواني مشتركة</span>
                    <span className="text-xs text-[#82726B]">طاولات مفتوحة</span>
                  </div>
                  <p className="text-[11px] text-[#7D6B64] leading-relaxed">
                    بوكسات ضيافة عائلية كبرى وصواني تقديم لتنسيق طاولة بوفيه مفتوحة بالكامل.
                  </p>
                </button>
              </div>
            </div>

            {/* Event Time */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#2D2421] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B46D52]" />
                موعد وتوقيت المناسبة:
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'morning', title: 'صباحي / إفطار', desc: 'يركز أكثر على الموالح والكرواسون' },
                  { id: 'tea', title: 'عصرونية وشاي', desc: 'توازن دقيق 50% مالح و50% حلو' },
                  { id: 'evening', title: 'سهرة وحفل مسائي', desc: 'بوفيه متكامل وكرم ضيافة' },
                ].map(item => {
                  const isSelected = eventTime === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setEventTime(item.id as any)}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        isSelected 
                          ? 'border-[#B46D52] bg-[#FAF0EA] ring-1 ring-[#B46D52]' 
                          : 'border-[#E8DFD8] hover:border-[#D4C3B7] bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#2D2421]">{item.title}</div>
                      <div className="text-[11px] text-[#7D6B64] mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tier */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#2D2421] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B46D52]" />
                مستوى الضيافة المطلوب:
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'standard', title: 'اقتصادي أنيق', desc: 'أصناف كلاسيكية محبوبة' },
                  { id: 'balanced', title: 'متوازن وشهي', desc: 'كرواسون وروست بيف وإكلير' },
                  { id: 'royal', title: 'ملكي فاخر VIP', desc: 'ترافل وذهب وشوكولاتة بلجيكية' },
                ].map(item => {
                  const isSelected = tier === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTier(item.id as any)}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        isSelected 
                          ? 'border-[#B46D52] bg-[#FAF0EA] ring-1 ring-[#B46D52]' 
                          : 'border-[#E8DFD8] hover:border-[#D4C3B7] bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#2D2421]">{item.title}</div>
                      <div className="text-[11px] text-[#7D6B64] mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Results Summary Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-[#E3D6CD] shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-[#F0E8E1] pb-3.5">
              <span className="font-extrabold text-base text-[#2D2421]">التوصية الذكية لمناسبتك</span>
              <span className="text-xs font-semibold text-[#B46D52] bg-[#FAF0EA] px-2.5 py-1 rounded-md">
                {recommendation.isSolo ? 'بوكسات فردية لكل ضيف' : 'محسوبة بدقة'}
              </span>
            </div>

            {/* Metrics Grid */}
            {recommendation.isSolo ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EDE4DC]">
                  <div className="text-[11px] text-[#7D6B64]">2 ساندوتش / ضيف</div>
                  <div className="text-xl font-extrabold text-[#2D2421] tabular-nums mt-1">
                    {recommendation.totalSavory} <span className="text-[10px] font-normal text-[#82726B]">ساندوتش</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EDE4DC]">
                  <div className="text-[11px] text-[#7D6B64]">1 جاتوه / ضيف</div>
                  <div className="text-xl font-extrabold text-[#2D2421] tabular-nums mt-1">
                    {recommendation.totalSweet} <span className="text-[10px] font-normal text-[#82726B]">قطعة</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EDE4DC]">
                  <div className="text-[11px] text-[#7D6B64]">1 عصير / ضيف</div>
                  <div className="text-xl font-extrabold text-[#2D2421] tabular-nums mt-1">
                    {recommendation.totalJuices} <span className="text-[10px] font-normal text-[#82726B]">زجاجة</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EDE4DC]">
                  <div className="text-xs text-[#7D6B64]">ميني ساندوتش وموالح</div>
                  <div className="text-2xl font-extrabold text-[#2D2421] tabular-nums mt-1">
                    {recommendation.totalSavory} <span className="text-xs font-normal text-[#82726B]">قطعة</span>
                  </div>
                  <div className="text-[11px] text-[#A0887E] mt-0.5">({recommendation.savoryPerGuest} قطع لكل ضيف)</div>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EDE4DC]">
                  <div className="text-xs text-[#7D6B64]">جاتوهات وسواريه</div>
                  <div className="text-2xl font-extrabold text-[#2D2421] tabular-nums mt-1">
                    {recommendation.totalSweet} <span className="text-xs font-normal text-[#82726B]">قطعة</span>
                  </div>
                  <div className="text-[11px] text-[#A0887E] mt-0.5">({recommendation.sweetPerGuest} قطع لكل ضيف)</div>
                </div>
              </div>
            )}

            {/* Total Pieces and Boxes */}
            <div className="space-y-2 p-4 bg-[#FBF8F5] rounded-xl border border-[#EDE4DC]">
              {recommendation.isSolo ? (
                <>
                  <div className="flex items-center justify-between text-xs text-[#6B5B55]">
                    <span>عدد البوكسات الفردية المستقلة:</span>
                    <span className="font-bold text-[#B46D52] tabular-nums">{recommendation.boxesCount} علبة لكل ضيف</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B5B55]">
                    <span>محتوى كل بوكس:</span>
                    <span className="font-semibold text-[#2D2421]">2 ساندوتش + 1 جاتوه + 1 عصير</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B5B55]">
                    <span>سعر البوكس الفردي التقديري:</span>
                    <span className="font-bold text-[#2D2421] tabular-nums">{recommendation.pricePerBox} ج.م / علبة</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B5B55]">
                    <span>الشرائط وكروت المناسبة والمناديل:</span>
                    <span className="font-bold text-emerald-700">مجاناً لكل بوكس</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-[#6B5B55]">
                    <span>إجمالي قطع الضيافة:</span>
                    <span className="font-bold text-[#2D2421] tabular-nums">{recommendation.totalPieces} قطعة مشكلة</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B5B55]">
                    <span>عدد البوكسات الفاخرة المطلوبة:</span>
                    <span className="font-bold text-[#B46D52] tabular-nums">حوالي {recommendation.boxesCount} بوكسات</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B5B55]">
                    <span>طباعة الكروت والشرائط:</span>
                    <span className="font-bold text-emerald-700">مجاناً بالكامل</span>
                  </div>
                </>
              )}
            </div>

            {/* Estimated Total */}
            <div className="pt-2 border-t border-[#F0E8E1] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#7D6B64] block">التكلفة التقديرية للباقة:</span>
                <span className="text-2xl font-extrabold text-[#2D2421] tabular-nums">
                  {recommendation.estimatedTotal} ج.م
                </span>
              </div>
              <span className="text-xs text-[#82726B] max-w-[140px] text-left">
                (حوالي {Math.round(recommendation.estimatedTotal / guestCount)} ج.م لكل ضيف)
              </span>
            </div>

            {/* 1-Click CTA to Cart */}
            <button
              onClick={handleAddBundle}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-base font-bold text-white bg-[#2D2421] hover:bg-[#B46D52] rounded-xl shadow-md transition-colors whitespace-nowrap"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>إضافة البكج المقترح إلى السلة</span>
            </button>

            {addedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تمت إضافة البكج الموصى به لـ {guestCount} ضيفاً إلى السلة بنجاح!</span>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
