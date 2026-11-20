import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Box, 
  ShieldCheck, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  Send,
  Heart,
  Award,
  Smartphone
} from 'lucide-react';
import { IMAGES, PUBLISHED_URL, PUBLISH_DETAILS } from '../data/cateringData';

interface HeroSectionProps {
  onStartCustomBox: () => void;
  onExploreCatalog: () => void;
  onOpenReminder?: () => void;
  onOpenPublishModal?: () => void;
  onOpenInstallModal?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartCustomBox,
  onExploreCatalog,
  onOpenReminder,
  onOpenPublishModal,
  onOpenInstallModal,
  isInstallable = false,
  isInstalled = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PUBLISHED_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(PUBLISH_DETAILS.shareMessage)}`;

  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:py-16 bg-gradient-to-b from-[#FAF6F0] via-[#F6EEE4] to-[#FAF6F0]">
      {/* Decorative festive warm background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D97736]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#B85333]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column (RTL Start): Text & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Joyful Kicker with Sparkles */}
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B85333] bg-[#FAF0E6] border border-[#ECD9CA] px-3.5 py-1.5 rounded-full shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D97736]" />
              <span>نصنع الفرح في كل تفصيلة · ضيافة تليق بأفراحكم</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#231815] leading-[1.25] tracking-tight [text-wrap:balance]">
              توزيعات وضيافة المناسبات الفاخرة.. ميني ساندوتش، جاتوهات وبوكسات فردية تُبهج ضيوفك
            </h1>

            {/* Sub-prose */}
            <p className="text-base sm:text-lg text-[#5E4D46] leading-relaxed [text-wrap:balance]">
              في «بهجة» نحوّل ضيافة حفلتك إلى تحفة فنية تُحكى وتُذكر. مخبوزات طازجة صباح كل يوم، سواريه وحلويات فرنسية راقية، وبوكسات هدايا مخصصة لكل ضيف مع عصير طبيعي وشريط ستان وطباعة كروت بالاسم.
            </p>

            {/* Clean unboxed metadata strip - NO PILLS */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[#7A6A63] pt-1">
              <span className="font-semibold text-[#231815]">تحضير صابح وطازج صباح الحفل</span>
              <span aria-hidden="true" className="text-[#D97736]">·</span>
              <span className="font-bold text-[#B85333]">بوكس فردي لكل معزوم (2 ميني ساندوتش + جاتوه + عصير)</span>
              <span aria-hidden="true" className="text-[#D97736]">·</span>
              <span>تغليف صحي وشرائط ستان راقية</span>
              <span aria-hidden="true" className="text-[#D97736]">·</span>
              <span>أسعار واضحة بالجنيه المصري (ج.م)</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartCustomBox}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-black text-white bg-[#B85333] hover:bg-[#9E472A] rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
              >
                <span>صمّم بوكس مناسبتك الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm sm:text-base font-bold text-[#231815] bg-white hover:bg-[#FAF6F0] border border-[#DECFC0] rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                <span>استعرض البوكسات الجاهزة</span>
              </button>

              {onOpenReminder && (
                <button
                  onClick={onOpenReminder}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs sm:text-sm font-bold text-[#7A6A63] hover:text-[#B85333] hover:bg-white/70 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-[#B85333]" />
                  <span>موعد مناسبتك والعد التنازلي</span>
                </button>
              )}

              {onOpenInstallModal && !isInstalled && (
                <button
                  onClick={onOpenInstallModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-[#B85333] bg-[#FAF0E6] hover:bg-[#F2DFD4] border border-[#ECD9CA] rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <img
                    src="/pwa-192x192.png"
                    alt="شعار تطبيق بهجة"
                    className="w-6 h-6 rounded-lg object-contain bg-[#FAF8F3] border border-[#DECFC0]"
                  />
                  <span>{isInstallable ? 'تثبيت التطبيق مباشرة' : 'تثبيت التطبيق'}</span>
                  <Smartphone className="w-4 h-4 text-[#D97736]" />
                </button>
              )}
            </div>

            {/* Published URL Quick Share Box (Direct response to user requirement: ورابط النشر) */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4 border border-[#E5DACF] shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A6B48] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#231815]">
                    رابط النشر الرسمي للمتجر (Share & Publish URL):
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenPublishModal}
                    className="text-xs font-bold text-[#B85333] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>خيارات المشاركة والـ QR</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 bg-[#FAF6F0] border border-[#DECFC0] rounded-xl px-3 py-2 text-xs font-mono text-[#5E4D46] dir-ltr text-left truncate select-all">
                  {PUBLISHED_URL}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#231815] hover:bg-[#3D2C27] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-[#25D366]" />
                        <span>تم النسخ! 🎉</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    title="مشاركة على واتساب"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">واتساب</span>
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-[#8C766B] flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-[#B85333] fill-[#B85333]" />
                <span>شارك الرابط مع ضيوفك ليطلعوا على تشكيلة الضيافة المبهجة قبل موعد الحفل.</span>
              </div>
            </div>

            {/* Trust Highlights & Numbers */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E8DCD0]">
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#231815] tabular-nums">+15,000</div>
                <div className="text-xs text-[#7A6A63]">بوكس وزّع في الأفراح والشركات</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#231815] tabular-nums">100%</div>
                <div className="text-xs text-[#7A6A63]">مكونات طازجة وشوكولاتة بلجيكية</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#231815] tabular-nums">4.9/5</div>
                <div className="text-xs text-[#7A6A63]">تقييم منظمي الحفلات والعائلات</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative space-y-4">
            
            {/* Primary Showcase Image Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#DECFC0] bg-white group">
              <div className="aspect-[4/3] overflow-hidden bg-[#FAF6F0]">
                <img
                  src={IMAGES.hero}
                  alt="بوفيه وتوزيعات ضيافة بهجة الفاخرة"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none"></div>

              {/* Cheerful Tag */}
              <div className="absolute top-4 right-4 bg-[#B85333] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#FFE8B3]" />
                <span>ضيافة استثنائية متكاملة</span>
              </div>

              {/* Caption */}
              <div className="absolute bottom-4 right-4 left-4 text-white">
                <div className="text-base sm:text-lg font-black tracking-tight drop-shadow-sm">
                  باقة طاولة الفرح الملكية
                </div>
                <div className="text-xs text-white/90 drop-shadow-sm flex items-center justify-between mt-1">
                  <span>تشكيلة متناغمة من المالح والحلو لـ 20 ضيفاً</span>
                  <span className="font-bold text-[#FFE8B3] tabular-nums">جاهزة للطلب السريع</span>
                </div>
              </div>
            </div>

            {/* Quick 3-feature row underneath */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-white rounded-xl border border-[#E8DCD0] shadow-2xs">
                <Box className="w-4 h-4 mx-auto text-[#B85333] mb-1" />
                <div className="text-xs font-bold text-[#231815]">تغليف هدايا راقٍ</div>
                <div className="text-[10px] text-[#8C766B]">علب صلبة بشرائط ستان</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E8DCD0] shadow-2xs">
                <ShieldCheck className="w-4 h-4 mx-auto text-[#2A6B48] mb-1" />
                <div className="text-xs font-bold text-[#231815]">أعلى معايير النظافة</div>
                <div className="text-[10px] text-[#8C766B]">تعبئة فردية آمنة ومحكمة</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E8DCD0] shadow-2xs">
                <Clock className="w-4 h-4 mx-auto text-[#D97736] mb-1" />
                <div className="text-xs font-bold text-[#231815]">توصيل مبرد دقيق</div>
                <div className="text-[10px] text-[#8C766B]">وصول قبل الحفل بساعة</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
