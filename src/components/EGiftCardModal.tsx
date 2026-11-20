import React, { useEffect, useState } from 'react';
import {
  X,
  Gift,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  MessageCircle,
  Mail,
  ShoppingBag,
  Send,
  AlertCircle
} from 'lucide-react';
import { CateringProduct, CartItem, EGiftCardRecord } from '../types/catering';
import { IMAGES } from '../data/cateringData';
import { formatActivityTimestamp } from '../utils/orderActivity';

interface EGiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: CateringProduct | null;
  onAddToCart: (cartItem: CartItem) => void;
  onIssueGiftCard?: (record: EGiftCardRecord) => void;
  onGiftCardSentToast?: (details: {
    code: string;
    amount: number;
    recipientName: string;
    channel: 'whatsapp' | 'email';
  }) => void;
}

const PRESET_AMOUNTS = [150, 250, 500, 750, 1000];

const QUICK_MESSAGES = [
  'كل عام وأنت بخير! أهديك هذه البطاقة لتستمتع بأشهى بوكسات الضيافة من بهجة 🎂✨',
  'ألف مبروك التخرج والنجاح الباهر! استمتع باختيار ضيافتك المفضلة من بهجة 🎓🎉',
  'بارك الله لكما وجمع بينكما في خير — هدية بسيطة لضيافة مناسبتكم السعيدة 💍💖',
];

function generateGiftCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars[Math.floor(Math.random() * chars.length)];
    part2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BAHJAH-${part1}-${part2}`;
}

export const EGiftCardModal: React.FC<EGiftCardModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onIssueGiftCard,
  onGiftCardSentToast,
}) => {
  const [amount, setAmount] = useState<number>(product?.price || 250);
  const [giftCode, setGiftCode] = useState<string>(() => generateGiftCode());
  const [recipientName, setRecipientName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [deliveryChannel, setDeliveryChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [recipientContact, setRecipientContact] = useState<string>('');
  const [personalMessage, setPersonalMessage] = useState<string>(QUICK_MESSAGES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sentSuccessText, setSentSuccessText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      setSentSuccessText(null);
      setCopiedCode(false);
      if (product?.price) {
        setAmount(product.price);
      }
    }
  }, [isOpen, product?.price]);

  if (!isOpen) return null;

  const validAmount = Math.min(10000, Math.max(50, Math.round(Number(amount) || 50)));

  const buildGiftRecord = (): EGiftCardRecord => ({
    id: `gift-${Date.now()}`,
    code: giftCode,
    amount: validAmount,
    recipientName: recipientName.trim() || 'صديق عزيز',
    senderName: senderName.trim() || 'محب لك',
    deliveryChannel,
    recipientContact: recipientContact.trim(),
    personalMessage: personalMessage.trim(),
    createdAt: formatActivityTimestamp(),
    isRedeemed: false,
  });

  const buildShareMessage = () => {
    const rec = recipientName.trim() || 'صديقنا العزيز';
    const snd = senderName.trim() || 'صديق محب';
    return (
      `🎁 *بطاقة هدايا رقمية من متجر بَهْجَة للضيافة*\n\n` +
      `أهلاً ${rec}،\n` +
      `أرسل لك *${snd}* بطاقة هدايا بقيمة *${validAmount} ج.م* لاختيار بوكسات وتوزيعات المناسبات الفاخرة!\n\n` +
      `💌 *رسالة الإهداء:*\n"${personalMessage.trim() || 'أتمنى لك أوقاتاً سعيدة!'}"\n\n` +
      `🎟️ *كود الخصم الخاص بك:* ${giftCode}\n` +
      `✨ يمكنك استخدام هذا الكود في سلة متجر بهجة لخصم ${validAmount} ج.م فوراً.`
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(giftCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const validateFields = (requireContact: boolean): boolean => {
    if (validAmount < 50) {
      setFormError('الحد الأدنى لمبلغ بطاقة الهدايا هو 50 ج.م.');
      return false;
    }
    if (requireContact && !recipientContact.trim()) {
      setFormError(
        deliveryChannel === 'whatsapp'
          ? 'يرجى إدخال رقم واتساب المستلم لإرسال كود بطاقة الهدايا.'
          : 'يرجى إدخال البريد الإلكتروني للمستلم لإرسال كود بطاقة الهدايا.'
      );
      return false;
    }
    if (requireContact && deliveryChannel === 'email' && !recipientContact.includes('@')) {
      setFormError('يرجى إدخال بريد إلكتروني صحيح للمستلم.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleAddGiftCardToCart = () => {
    if (!validateFields(false)) return;

    const record = buildGiftRecord();
    onIssueGiftCard?.(record);

    const cartItem: CartItem = {
      cartItemId: `giftcard-${Date.now()}`,
      type: 'gift_card',
      title: `بطاقة هدايا بهجة الرقمية (${validAmount} ج.م) — إلى ${record.recipientName}`,
      price: validAmount,
      quantity: 1,
      image: product?.image || IMAGES.favors,
      piecesCount: 1,
      details: [
        `كود الخصم الخاص: ${record.code}`,
        `المستلم: ${record.recipientName} (من: ${record.senderName})`,
        `الإرسال عبر: ${record.deliveryChannel === 'whatsapp' ? 'واتساب' : 'البريد الإلكتروني'}${
          record.recipientContact ? ` (${record.recipientContact})` : ''
        }`,
      ],
      giftCardDetails: {
        code: record.code,
        amount: record.amount,
        recipientName: record.recipientName,
        senderName: record.senderName,
        deliveryChannel: record.deliveryChannel,
        recipientContact: record.recipientContact,
        personalMessage: record.personalMessage,
      },
    };

    onAddToCart(cartItem);
    setSentSuccessText(`تمت إضافة بطاقة الهدايا بكود (${record.code}) إلى السلة وتفعيل الكود!`);
  };

  const handleSendNow = () => {
    if (!validateFields(true)) return;

    const record = buildGiftRecord();
    onIssueGiftCard?.(record);

    const shareMessage = buildShareMessage();

    if (deliveryChannel === 'whatsapp') {
      const digits = recipientContact.replace(/[^0-9]/g, '');
      const normalized = digits.startsWith('0') ? `2${digits}` : digits;
      const waUrl = `https://wa.me/${normalized}?text=${encodeURIComponent(shareMessage)}`;
      window.open(waUrl, '_blank');
    } else {
      const subject = `🎁 بطاقة هدايا بهجة الرقمية بقيمة ${validAmount} ج.م لك من ${record.senderName}`;
      const mailtoUrl = `mailto:${encodeURIComponent(recipientContact.trim())}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(shareMessage.replace(/\*/g, ''))}`;
      window.open(mailtoUrl, '_blank');
    }

    onGiftCardSentToast?.({
      code: record.code,
      amount: validAmount,
      recipientName: record.recipientName,
      channel: deliveryChannel,
    });

    setSentSuccessText(
      `تم تجهيز وإرسال كود الخصم (${record.code}) بقيمة ${validAmount} ج.م عبر ${
        deliveryChannel === 'whatsapp' ? 'الواتساب' : 'البريد الإلكتروني'
      } وتفعيله للاستخدام في المتجر!`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6F0] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-[#DECFC0] shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-l from-[#231815] via-[#3A2720] to-[#B85333] text-white px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-sm shrink-0">
              <Gift className="w-6 h-6 text-[#FFE8B3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black">
                  إهداء بطاقة هدايا بهجة الرقمية (E-Gift Card)
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-white/80 mt-0.5">
                حدد المبلغ، خصّص رسالتك، وأرسل كود خصم فوري عبر الواتساب أو البريد الإلكتروني.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق نافذة بطاقة الهدايا"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left / Preview & Code Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Luxury Digital Card Preview */}
              <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#231815] via-[#452B22] to-[#B85333] text-white shadow-xl border border-[#D4AF37]/40 space-y-5 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#FFE8B3]/10 blur-xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFE8B3]" />
                    <span className="text-xs font-black tracking-wide text-[#FFE8B3]">
                      بَهْجَة للضيافة
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
                    E-GIFT CARD
                  </span>
                </div>

                <div>
                  <div className="text-[11px] text-white/75">قيمة بطاقة الهدية</div>
                  <div className="text-3xl font-black text-[#FFE8B3] tabular-nums mt-0.5">
                    {validAmount} <span className="text-base font-bold text-white">ج.م</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs border-t border-white/15 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">إلى:</span>
                    <span className="font-bold">{recipientName.trim() || 'اسم المستلم'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">من:</span>
                    <span className="font-bold">{senderName.trim() || 'اسم المُهدي'}</span>
                  </div>
                </div>

                {personalMessage.trim() && (
                  <p className="text-[11px] text-white/90 bg-white/10 rounded-xl p-2.5 leading-relaxed line-clamp-3">
                    "{personalMessage.trim()}"
                  </p>
                )}

                {/* Special Discount Code Pill */}
                <div className="bg-white/95 text-[#231815] rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-[#8C766B]">كود الخصم الخاص:</div>
                    <div className="text-xs sm:text-sm font-black tracking-wider font-mono text-[#B85333] truncate" dir="ltr">
                      {giftCode}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setGiftCode(generateGiftCode())}
                      className="p-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE6DD] text-[#66544D] transition-colors cursor-pointer"
                      title="توليد كود جديد"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#231815] text-white text-[10px] font-bold cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'نُسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-[#E5D5C8] text-[11px] text-[#66544D] flex items-start gap-2 leading-relaxed">
                <Sparkles className="w-4 h-4 text-[#B85333] shrink-0 mt-0.5" />
                <span>
                  يتم تفعيل كود الخصم تلقائياً للاستخدام داخل سلة المشتريات لخصم كامل قيمة البطاقة من أي طلب مستقبلي.
                </span>
              </div>
            </div>

            {/* Right / Configuration Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5D5C8] p-4 sm:p-5 space-y-4">
              {/* 1. Amount Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#231815] block">
                  1. حدد مبلغ بطاقة الهدايا (ج.م):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_AMOUNTS.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer tabular-nums ${
                        validAmount === val
                          ? 'bg-[#B85333] text-white border-[#B85333] shadow-xs'
                          : 'bg-[#FAF6F0] text-[#231815] border-[#E5D5C8] hover:border-[#B85333]'
                      }`}
                    >
                      {val} ج.م
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#D9CCC2] rounded-xl px-2.5 py-1.5 mr-auto">
                    <span className="text-[11px] font-bold text-[#7D6B64]">مبلغ آخر:</span>
                    <input
                      type="number"
                      min={50}
                      max={10000}
                      step={10}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-20 text-center text-xs font-black text-[#B85333] bg-white border border-[#DECFC0] rounded-lg py-1 outline-none focus:border-[#B85333] tabular-nums"
                      aria-label="مبلغ بطاقة الهدايا المخصص"
                    />
                    <span className="text-[11px] font-bold text-[#66544D]">ج.م</span>
                  </div>
                </div>
              </div>

              {/* 2. Recipient & Sender Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#231815] block">اسم المستلم:</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="مثال: سارة محمود"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#231815] block">اسم المُهدي (اسمك):</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="مثال: أحمد طارق"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none"
                  />
                </div>
              </div>

              {/* 3. Delivery Channel (WhatsApp or Email) */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#231815] block">
                  2. اختر طريقة إرسال كود الخصم للمستلم:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryChannel('whatsapp');
                      setFormError(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      deliveryChannel === 'whatsapp'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-[#FAF6F0] text-[#231815] border-[#E5D5C8] hover:border-emerald-500'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>إرسال عبر الواتساب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryChannel('email');
                      setFormError(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      deliveryChannel === 'email'
                        ? 'bg-[#231815] text-white border-[#231815] shadow-xs'
                        : 'bg-[#FAF6F0] text-[#231815] border-[#E5D5C8] hover:border-[#231815]'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>إرسال عبر البريد الإلكتروني</span>
                  </button>
                </div>

                <div>
                  <input
                    type={deliveryChannel === 'email' ? 'email' : 'tel'}
                    value={recipientContact}
                    onChange={(e) => {
                      setRecipientContact(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder={
                      deliveryChannel === 'whatsapp'
                        ? 'رقم واتساب المستلم (مثال: 01012345678)'
                        : 'البريد الإلكتروني للمستلم (مثال: friend@example.com)'
                    }
                    dir="ltr"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none text-right"
                  />
                </div>
              </div>

              {/* 4. Personal Gift Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#231815]">
                    3. رسالة الإهداء المرفقة:
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {['عيد ميلاد', 'تخرج', 'زفاف'].map((lbl, idx) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setPersonalMessage(QUICK_MESSAGES[idx])}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF0EA] text-[#B85333] hover:bg-[#F2DFD4] cursor-pointer"
                      >
                        + {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="اكتب رسالة لطيفة تظهر للمستلم مع كود الخصم..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none resize-none leading-relaxed"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {sentSuccessText && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{sentSuccessText}</span>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#F0E8E1]">
                <button
                  type="button"
                  onClick={handleSendNow}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold text-white shadow-sm transition-colors cursor-pointer ${
                    deliveryChannel === 'whatsapp'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#231815] hover:bg-[#3D2C27]'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {deliveryChannel === 'whatsapp'
                      ? 'إرسال الكود الآن بالواتساب'
                      : 'إرسال الكود الآن بالإيميل'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAddGiftCardToCart}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#B85333] hover:bg-[#9E472A] text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة للسلة ({validAmount} ج.م)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
