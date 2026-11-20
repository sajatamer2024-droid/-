import React, { useState } from 'react';
import { Download, X, Check, Share2, Sparkles, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
}

export const MobileAppInstallModal: React.FC<MobileAppInstallModalProps> = ({
  isOpen,
  onClose,
  onInstalled,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        onInstalled?.();
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8DFD8] overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Festive Header */}
        <div className="relative bg-gradient-to-l from-[#8E3B20] via-[#B85333] to-[#D97736] p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center rounded-2xl bg-[#FAF8F3] p-2 mb-3 shadow-lg ring-4 ring-white/25">
            <img
              src="/assets/aistudio/image_2fe9f797.png"
              alt="شعار بهجة للضيافة"
              className="w-32 h-18 sm:w-36 sm:h-20 object-contain rounded-xl"
            />
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            تحميل تطبيق «بَهْجَة» على الموبايل 📲
          </h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-sm mx-auto leading-relaxed">
            تثبيت فوري وسريع كتطبيق هاتف حقيقي بدون الحاجة لمتجر التطبيقات!
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1 rounded-full text-white/95">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE8B3]" />
            <span>تجربة سلسة، تصفح سريع، وتتبع مباشر للطلبات</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {installSuccess || isInstalled ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm">التطبيق مثبت وجاهز على شاشتك الرئيسية! 🎉</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                يمكنك الآن فتح «بَهْجَة» مباشرة من شاشة هاتفك كتطبيق مستقل بلمسة واحدة.
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#E8DFD8] space-y-1">
                  <span className="font-bold text-[#2D2421] block">⚡ وصول فوري</span>
                  <p className="text-[11px] text-[#7D6B64]">أيقونة بهجة على شاشة هاتفك للطلب السريع</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#E8DFD8] space-y-1">
                  <span className="font-bold text-[#2D2421] block">📦 تتبع لحظي</span>
                  <p className="text-[11px] text-[#7D6B64]">متابعة مراحل الخبز والتوصيل المبرد خطوة بخطوة</p>
                </div>
              </div>

              {/* Install flow for Android / Chromium */}
              {isInstallable && (
                <div className="space-y-3 pt-1">
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 bg-[#B85333] hover:bg-[#9E472A] text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    <span>تثبيت التطبيق على هاتفك الآن (تحميل فوري)</span>
                  </button>
                  <p className="text-[11px] text-center text-[#8C7A72]">
                    مساحة خفيفة جداً (أقل من 2 ميجابايت) ولا تستهلك باقة الإنترنت.
                  </p>
                </div>
              )}

              {/* Instructions for iPhone / iPad (iOS Safari) */}
              {(isIOS || !isInstallable) && (
                <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-[#ECD9CA] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B85333]">
                    <Share2 className="w-4 h-4 text-[#D97736]" />
                    <span>طريقة التثبيت على الآيفون (iOS Safari):</span>
                  </div>
                  <ol className="text-xs text-[#5E4D46] space-y-2 list-decimal list-inside pr-1 leading-relaxed">
                    <li>
                      اضغط على زر <strong>المشاركة (Share <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-600" />)</strong> في شريط متصفح سفاري بالأسفل.
                    </li>
                    <li>
                      مرر لأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#B85333]" />)</strong>.
                    </li>
                    <li>
                      اضغط على <strong>«إضافة» (Add)</strong> في الزاوية العلوية ليظهر التطبيق بشعار بهجة في شاشتك الرئيسية فوراً.
                    </li>
                  </ol>
                </div>
              )}

              {/* Instructions for Android Chrome */}
              {!isInstallable && !isIOS && (
                <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#E8DFD8] space-y-2 text-xs text-[#5E4D46]">
                  <div className="font-bold text-[#2D2421] flex items-center gap-1.5">
                    <span>📱 طريقة التثبيت على هواتف أندرويد أو الكمبيوتر (Chrome / Edge):</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-[#7D6B64]">
                    اضغط على أيقونة التثبيت في شريط العنوان أو قائمة الثلاث نقاط <strong>(⋮)</strong> ثم اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#FAF7F5] hover:bg-[#F2ECE5] text-[#2D2421] text-xs font-bold rounded-xl border border-[#D9CCC2] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
