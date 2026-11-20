import React, { useState } from 'react';
import { Share2, Copy, Check, Heart, Sparkles, Send, Smartphone, Settings } from 'lucide-react';
import { PUBLISHED_URL, PUBLISH_DETAILS } from '../data/cateringData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenPublishModal?: () => void;
  onOpenInstallModal?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onOpenAdminDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenPublishModal,
  onOpenInstallModal,
  isInstallable = false,
  isInstalled = false,
  onOpenAdminDashboard
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PUBLISHED_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(PUBLISH_DETAILS.shareMessage)}`;

  return (
    <footer className="bg-[#1F1714] text-[#FAF6F0] py-14 lg:py-18 border-t border-[#362722]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Published URL & Share Bar */}
        <div className="bg-[#2B201C] rounded-2xl p-5 sm:p-6 border border-[#45332C] flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-[#E5954B]" />
              <span className="text-sm font-bold text-white">رابط النشر الرسمي للمتجر:</span>
              <span className="text-xs text-[#25D366] font-semibold bg-[#25D366]/10 px-2 py-0.5 rounded-full">
                متاح ومباشر
              </span>
            </div>
            <p className="text-xs text-[#B8A8A1]">
              انسخ الرابط وشاركه في دعوات زفافك، حفل تخرجك، أو اجتماعاتك لتنسيق الضيافة بكل سهولة.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B85333] hover:bg-[#9E472A] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم نسخ الرابط! 🎉</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>

            {onOpenPublishModal && (
              <button
                onClick={onOpenPublishModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A2C27] hover:bg-[#483731] text-white text-xs font-bold rounded-xl border border-[#554037] transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#E5954B]" />
                <span>خيارات النشر والـ QR</span>
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>مشاركة واتساب</span>
            </a>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/pwa-192x192.png"
                alt="شعار بهجة للضيافة"
                className="w-12 h-12 rounded-2xl object-contain bg-[#FAF8F3] border border-[#DECFC0] shadow-sm shrink-0"
              />
              <span className="text-2xl font-black tracking-tight text-white">بَهْجَة للضيافة والتوزيعات</span>
            </div>
            <p className="text-xs sm:text-sm text-[#B8A8A1] max-w-md leading-relaxed">
              مشروع رائد يبتكر تجارب ضيافة فاخرة وتوزيعات فردية مدروسة لكل ضيف. ميني ساندوتش طازج مخبوز صباح كل يوم، سواريه وحلويات فرنسية، وبوكسات فردية متكاملة (ساندوتشين + جاتوه + عصير) تضمن نظافة الضيافة وتمنع الهدر.
            </p>
            <div className="text-xs text-[#8E7E77] pt-1">
              خبز وتحضير يومي طازج 100% · تغليف فردي صحي محكم · بالجنيه المصري
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#E5954B] uppercase tracking-wider">
              أقسام المتجر
            </h4>
            <ul className="space-y-2 text-xs text-[#C5B7B0]">
              <li>
                <button onClick={() => onNavigate('hero')} className="hover:text-white transition-colors cursor-pointer">
                  الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reminder')} className="hover:text-white transition-colors cursor-pointer">
                  مخطط موعد المناسبة والعد التنازلي
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors cursor-pointer">
                  قائمة البوكسات الجاهزة
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('builder')} className="hover:text-white transition-colors cursor-pointer">
                  استوديو تصميم البوكس المخصص
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calculator')} className="hover:text-white transition-colors cursor-pointer">
                  حاسبة ضيافة المعازيم (فردي وبوفيه)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('budget')} className="hover:text-white transition-colors cursor-pointer">
                  مخطط ميزانية الحفلة (باقات حسب المبلغ)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('showcase')} className="hover:text-white transition-colors cursor-pointer text-[#E5954B] font-bold">
                  معرض أعمال المناسبات السابقة (سلايد شو) 📸
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracker')} className="hover:text-white transition-colors cursor-pointer">
                  تتبع حالة الطلبات والتقييم
                </button>
              </li>
              {onOpenAdminDashboard && (
                <li>
                  <button 
                    onClick={onOpenAdminDashboard} 
                    className="hover:text-white transition-colors cursor-pointer text-[#E5954B] font-bold flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>لوحة التحكم (تعديل المنتجات والأسعار)</span>
                  </button>
                </li>
              )}
              {onOpenInstallModal && !isInstalled && (
                <li>
                  <button 
                    onClick={onOpenInstallModal} 
                    className="hover:text-white transition-colors cursor-pointer text-[#FFD166] font-bold flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isInstallable ? 'تثبيت التطبيق مباشرة 📲' : 'تثبيت التطبيق على الموبايل 📲'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Occasions Covered */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#E5954B] uppercase tracking-wider">
              مناسبات نخدمها
            </h4>
            <ul className="space-y-2 text-xs text-[#C5B7B0]">
              <li>حفلات التخرج والتفوق الدراسي</li>
              <li>حفلات الزفاف والملكة والخطوبة</li>
              <li>استقبال المواليد والبيبي شاور</li>
              <li>أعياد الميلاد والمناسبات العائلية</li>
              <li>اجتماعات مجالس الإدارة ومؤتمرات الشركات</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#362722] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E7E77] gap-4">
          <div className="flex items-center gap-1.5">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()} مشروع بَهْجَة للضيافة الفاخرة.</span>
            <Heart className="w-3.5 h-3.5 text-[#B85333] fill-[#B85333]" />
          </div>
          <div className="flex items-center gap-4">
            <span>توصيل مبرد معتمد</span>
            <span aria-hidden="true">·</span>
            <span>دفع آمن عند الاستلام وتحويل فوري</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#B8A8A1]">EGP</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
