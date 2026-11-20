import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ExternalLink, 
  Sparkles, 
  MessageSquare, 
  Send,
  Heart,
  Globe
} from 'lucide-react';
import { PUBLISHED_URL, PUBLISH_DETAILS } from '../data/cateringData';

interface PublishShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishShareModal: React.FC<PublishShareModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedInvitation, setCopiedInvitation] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'invitation'>('link');

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(PUBLISHED_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    } catch {
      // Fallback
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    }
  };

  const sampleInvitationText = `🎉 أهلاً بكم أحبائنا!
يسعدنا مشاركتكم رابط متجر «بَهْجَة» لاختيار وتنسيق توزيعات وضيافة مناسبتنا القادمة.
تفضلوا باستعراض قائمة الميني ساندوتش، الجاتوهات الفرنسية، وبوكسات الضيافة الفردية لكل ضيف:
${PUBLISHED_URL}
بانتظار تشريفكم ولقائكم على خير وبكل حب ❤️`;

  const handleCopyInvitation = async () => {
    try {
      await navigator.clipboard.writeText(sampleInvitationText);
      setCopiedInvitation(true);
      setTimeout(() => setCopiedInvitation(false), 3000);
    } catch {
      setCopiedInvitation(true);
      setTimeout(() => setCopiedInvitation(false), 3000);
    }
  };

  // WhatsApp share URL
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(PUBLISH_DETAILS.shareMessage)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(PUBLISHED_URL)}&text=${encodeURIComponent(PUBLISH_DETAILS.appName + ' - ' + PUBLISH_DETAILS.tagline)}`;

  // Quick QR code visual representation (crisp SVG matrix representing the published URL)
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(PUBLISHED_URL)}&color=23-24-33&bgcolor=253-251-248`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#FAF6F0] rounded-2xl shadow-2xl border border-[#E8DCD0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Festive Header */}
        <div className="relative bg-gradient-to-l from-[#A84A2C] via-[#B85333] to-[#D97736] p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md mb-3 shadow-inner">
            <Share2 className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            رابط النشر ومشاركة البهجة 🎉
          </h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-md mx-auto leading-relaxed">
            شارك رابط متجرك المنشور مباشرة مع ضيوفك ومعازيمك أو اطبعه على كروت الدعوة
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1 rounded-full text-white/95">
            <Globe className="w-3.5 h-3.5" />
            <span>المتجر منشور ومتاح أونلاين على مدار الساعة</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8DCD0] bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'link' 
                ? 'border-[#B85333] text-[#B85333] bg-[#FAF6F0]' 
                : 'border-transparent text-[#7A6A63] hover:text-[#231815]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>رابط النشر المباشر</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'qr' 
                ? 'border-[#B85333] text-[#B85333] bg-[#FAF6F0]' 
                : 'border-transparent text-[#7A6A63] hover:text-[#231815]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>رمز الاستجابة QR</span>
          </button>

          <button
            onClick={() => setActiveTab('invitation')}
            className={`flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'invitation' 
                ? 'border-[#B85333] text-[#B85333] bg-[#FAF6F0]' 
                : 'border-transparent text-[#7A6A63] hover:text-[#231815]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>نص دعوة جاهز</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'link' && (
            <div className="space-y-5">
              {/* Published URL Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4D3C35] flex items-center justify-between">
                  <span>الرابط الدائم للمتجر (Live Published URL):</span>
                  <span className="text-[#2A6B48] font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2A6B48] inline-block animate-pulse"></span>
                    نشط ومتاح الآن
                  </span>
                </label>
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#DECFC0] shadow-inner">
                  <input
                    type="text"
                    readOnly
                    value={PUBLISHED_URL}
                    className="flex-1 bg-transparent text-xs text-[#231815] font-mono px-2 outline-none select-all dir-ltr text-left"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#B85333] hover:bg-[#9E472A] text-white text-xs font-bold rounded-lg transition-colors shrink-0 shadow-sm"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[#4D3C35] block">
                  مشاركة فورية عبر المنصات:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>مشاركة على واتساب</span>
                  </a>

                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>تيليجرام</span>
                  </a>
                </div>
              </div>

              {/* Host Tips */}
              <div className="bg-[#F5ECE1] rounded-xl p-3.5 border border-[#E5DACF] text-xs text-[#6B5B55] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#B85333] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[#231815]">نصيحة بهجة لمنظمي الحفلات:</strong> أرسل هذا الرابط إلى ضيوفك ليتعرفوا على تفاصيل البوكسات الفردية المخصصة ومكونات الساندوتشات والجاتوهات، وتفاصيل تقديم الضيافة في يومك الجميل.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-[#6B5B55] max-w-sm mx-auto">
                امسح الرمز بكاميرا الجوال للانتقال مباشرة للمتجر المنشور، أو احفظ الصورة لطباعتها على كروت الزفاف والتخرج.
              </p>

              <div className="inline-block p-4 bg-white rounded-2xl border border-[#DECFC0] shadow-md">
                <img
                  src={qrSvgUrl}
                  alt="QR Code لرابط نشر متجر بهجة"
                  className="w-48 h-48 mx-auto"
                />
                <div className="mt-2 text-[11px] font-mono text-[#7A6A63] dir-ltr">
                  ais-pre-woawfqptmsjdgpwbwt7wjn
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B85333] hover:bg-[#9E472A] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedUrl ? 'تم نسخ الرابط!' : 'نسخ رابط الـ QR'}</span>
                </button>
                <a
                  href={PUBLISHED_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FAF6F0] text-[#231815] border border-[#DECFC0] text-xs font-semibold rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح في تبويب جديد</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'invitation' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4D3C35] flex items-center justify-between">
                  <span>صيغة رسالة دعوة مبهجة جاهزة للمشاركة:</span>
                  <span className="text-xs text-[#B85333] font-medium flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-[#B85333]" />
                    صيغة ودّية للأهل والأصدقاء
                  </span>
                </label>
                <div className="p-3.5 bg-white rounded-xl border border-[#DECFC0] text-xs text-[#3B2E29] leading-relaxed whitespace-pre-line font-sans shadow-inner">
                  {sampleInvitationText}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopyInvitation}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#B85333] hover:bg-[#9E472A] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  {copiedInvitation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم نسخ نص الدعوة كاملاً!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ نص الدعوة كاملاً</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(sampleInvitationText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال عبر واتساب</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F2E8DC] border-t border-[#E8DCD0] flex items-center justify-between text-xs text-[#7A6A63]">
          <span className="font-semibold text-[#231815]">بَهْجَة للضيافة الفاخرة</span>
          <button
            onClick={onClose}
            className="text-xs text-[#7A6A63] hover:text-[#231815] font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
