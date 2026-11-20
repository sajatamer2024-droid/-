import React, { useMemo, useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  FileText,
  CheckCircle,
  AlertCircle,
  Truck,
  Printer,
  Loader2,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
  Gift,
  Copy,
  Check,
  Mail,
  Send
} from 'lucide-react';
import { CartItem, EGiftCardRecord, TrackedOrder } from '../types/catering';
import { generateInvoicePdf } from '../utils/invoicePdf';
import { createActivityLogEntry, formatActivityTimestamp } from '../utils/orderActivity';

type PaymentMethodId = 'card' | 'wallet' | 'cash';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCreateOrder?: (newOrder: TrackedOrder) => void;
  onTrackOrder?: (orderNumber: string) => void;
  onPaymentSuccess?: (details: { orderNumber: string; amount: number; methodLabel: string }) => void;
  onNotifyError?: (message: string) => void;
  issuedGiftCards?: EGiftCardRecord[];
  onRedeemGiftCard?: (code: string) => void;
  onNotifyGiftCardSent?: (details: { code: string; recipientName: string; channel: 'whatsapp' | 'email' }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCreateOrder,
  onTrackOrder,
  onPaymentSuccess,
  onNotifyError,
  issuedGiftCards = [],
  onRedeemGiftCard,
  onNotifyGiftCardSent,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTimeSlot, setEventTimeSlot] = useState('صباحاً (10:00 ص - 1:00 م)');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<{
    orderNumber: string;
    amount: number;
    methodLabel: string;
    paidAt: string;
  } | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<EGiftCardRecord | null>(null);
  const [giftCodeFeedback, setGiftCodeFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedGiftCode, setCopiedGiftCode] = useState<string | null>(null);

  const draftInvoiceNumber = useMemo(
    () => `BAH-${Math.floor(10000 + Math.random() * 90000)}`,
    []
  );
  const activeInvoiceNumber = createdOrderNumber || draftInvoiceNumber;

  if (!isOpen) return null;

  const isDigitalOnlyOrder = cartItems.length > 0 && cartItems.every(item => item.type === 'gift_card');
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = isDigitalOnlyOrder || subtotal > 750 ? 0 : 50;
  const giftCardDiscount = appliedGiftCard ? Math.min(appliedGiftCard.amount, subtotal + deliveryFee) : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - giftCardDiscount);

  const handleApplyGiftCode = (codeOverride?: string) => {
    const raw = (codeOverride ?? giftCodeInput).trim().toUpperCase();
    if (!raw) {
      setGiftCodeFeedback({ type: 'error', text: 'يرجى إدخال كود بطاقة الهدايا أولاً.' });
      return;
    }

    if (cartItems.some(item => item.giftCardDetails?.code.toUpperCase() === raw)) {
      setGiftCodeFeedback({
        type: 'error',
        text: 'لا يمكن تطبيق كود بطاقة موجودة حالياً ضمن نفس السلة؛ استخدمه في طلب آخر.',
      });
      return;
    }

    const match = issuedGiftCards.find(card => card.code.toUpperCase() === raw);
    if (!match) {
      setGiftCodeFeedback({ type: 'error', text: 'كود بطاقة الهدايا غير صحيح أو غير مفعل.' });
      return;
    }

    if (match.isRedeemed) {
      setGiftCodeFeedback({ type: 'error', text: 'تم استخدام كود بطاقة الهدايا هذا مسبقاً.' });
      return;
    }

    setAppliedGiftCard(match);
    setGiftCodeInput(match.code);
    setGiftCodeFeedback({
      type: 'success',
      text: `تم تطبيق بطاقة الهدايا (${match.code}) بقيمة ${match.amount} ج.م بنجاح!`,
    });
  };

  const handleRemoveGiftCode = () => {
    setAppliedGiftCard(null);
    setGiftCodeInput('');
    setGiftCodeFeedback(null);
  };

  const handleCopyGiftCardCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedGiftCode(code);
    setTimeout(() => setCopiedGiftCode(null), 2000);
  };

  const handleDispatchGiftCardFromCart = (item: CartItem) => {
    const details = item.giftCardDetails;
    if (!details) return;
    const msg =
      `🎁 *بطاقة هدايا رقمية من متجر بَهْجَة*\n\n` +
      `أهلاً ${details.recipientName}، أرسل لك *${details.senderName}* بطاقة هدايا بقيمة *${details.amount} ج.م*!\n` +
      (details.personalMessage ? `💌 "${details.personalMessage}"\n` : '') +
      `\n🎟️ *كود الخصم الخاص بك:* ${details.code}\n` +
      `يمكنك تطبيقه في سلة متجر بهجة لخصم ${details.amount} ج.م.`;

    if (details.deliveryChannel === 'email') {
      const subject = `🎁 بطاقة هدايا بهجة بقيمة ${details.amount} ج.م من ${details.senderName}`;
      const mailtoUrl = `mailto:${encodeURIComponent(details.recipientContact || '')}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(msg.replace(/\*/g, ''))}`;
      window.open(mailtoUrl, '_blank');
    } else {
      const digits = (details.recipientContact || '').replace(/[^0-9]/g, '');
      const normalized = digits.startsWith('0') ? `2${digits}` : digits;
      const waUrl = normalized
        ? `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    }

    onNotifyGiftCardSent?.({
      code: details.code,
      recipientName: details.recipientName,
      channel: details.deliveryChannel,
    });
  };

  const handleDownloadInvoicePdf = async () => {
    if (cartItems.length === 0 || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfFeedback(null);

    try {
      await generateInvoicePdf({
        invoiceNumber: activeInvoiceNumber,
        customerName,
        customerPhone,
        deliveryAddress,
        eventDate,
        eventTimeSlot,
        orderNotes,
        items: cartItems,
        subtotal,
        deliveryFee,
        discountAmount: giftCardDiscount,
        discountLabel: appliedGiftCard ? `خصم بطاقة هدايا (${appliedGiftCard.code}):` : undefined,
        grandTotal,
      });
      setPdfFeedback({
        type: 'success',
        text: `تم إنشاء وتنزيل فاتورة PDF (#${activeInvoiceNumber}) بنجاح`,
      });
    } catch {
      setPdfFeedback({
        type: 'error',
        text: 'حدث خطأ أثناء إنشاء ملف الفاتورة، يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethodId) => {
    switch (method) {
      case 'card':
        return 'بطاقة بنكية (فيزا / ماستركارد)';
      case 'wallet':
        return 'محفظة إلكترونية / إنستا باي';
      case 'cash':
        return 'الدفع عند الاستلام';
    }
  };

  const handleCompletePayment = () => {
    if (isProcessingPayment || cartItems.length === 0) return;

    if (!isDigitalOnlyOrder && (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim())) {
      const msg = 'يرجى ملء الاسم ورقم الجوال وعنوان التوصيل قبل إتمام الدفع.';
      setCheckoutError(msg);
      onNotifyError?.(msg);
      return;
    }

    if (isDigitalOnlyOrder && !customerName.trim()) {
      const msg = 'يرجى كتابة اسمك لتسجيل فاتورة بطاقة الهدايا.';
      setCheckoutError(msg);
      onNotifyError?.(msg);
      return;
    }

    setCheckoutError(null);
    setIsProcessingPayment(true);
    const methodLabel = getPaymentMethodLabel(paymentMethod);

    setTimeout(() => {
      const generatedOrderNum = `BAH-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowTimestamp = formatActivityTimestamp();
      const giftNote = appliedGiftCard
        ? ` | خصم بطاقة الهدايا (${appliedGiftCard.code}): -${giftCardDiscount} ج.م`
        : '';

      const newOrder: TrackedOrder = {
        orderNumber: generatedOrderNum,
        createdAt: nowTimestamp,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || 'تسليم رقمي',
        deliveryAddress: deliveryAddress.trim() || 'إرسال رقمي (واتساب / بريد إلكتروني)',
        eventDate: eventDate || 'اليوم',
        eventTimeSlot,
        items: [...cartItems],
        subtotal,
        deliveryFee,
        grandTotal,
        status: 'confirmed',
        driverName: 'كابتن محمود رضا',
        driverPhone: '01000000000',
        notes: (orderNotes
          ? `${orderNotes} | الدفع: ${methodLabel}`
          : `طريقة الدفع: ${methodLabel}`) + giftNote,
        lastUpdated: nowTimestamp,
        activityLog: [
          createActivityLogEntry(
            'confirmed',
            `تمت عملية الدفع بنجاح (${methodLabel}) بمبلغ ${grandTotal} ج.م وتأكيد الطلب.`,
            nowTimestamp
          ),
        ],
      };

      onCreateOrder?.(newOrder);
      if (appliedGiftCard) {
        onRedeemGiftCard?.(appliedGiftCard.code);
        setAppliedGiftCard(null);
        setGiftCodeInput('');
        setGiftCodeFeedback(null);
      }
      setCreatedOrderNumber(generatedOrderNum);
      setPaymentReceipt({
        orderNumber: generatedOrderNum,
        amount: grandTotal,
        methodLabel,
        paidAt: nowTimestamp,
      });
      setIsProcessingPayment(false);

      onPaymentSuccess?.({
        orderNumber: generatedOrderNum,
        amount: grandTotal,
        methodLabel,
      });
    }, 650);
  };

  const handleWhatsAppOrder = () => {
    if (!isDigitalOnlyOrder && (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim())) {
      const msg = 'يرجى ملء الاسم ورقم الجوال وعنوان التوصيل لإتمام الطلب.';
      setCheckoutError(msg);
      onNotifyError?.(msg);
      return;
    }
    setCheckoutError(null);

    // Generate new order number and add to tracked orders
    const generatedOrderNum = `BAH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Format neat WhatsApp text
    let message = `*طلب ضيافة وتوزيعات جديد من متجر بَهْجَة* ✨🎉\n\n`;
    message += `🔢 *رقم الطلب:* #${generatedOrderNum}\n`;
    message += `👤 *العميل:* ${customerName || 'ضيف عزيز'}\n`;
    message += `📱 *الجوال:* ${customerPhone || 'غير محدد'}\n`;
    message += `📍 *العنوان:* ${deliveryAddress || 'تسليم رقمي'}\n`;
    message += `📅 *موعد الحفل:* ${eventDate || 'في أقرب وقت'} (${eventTimeSlot})\n\n`;
    message += `📋 *تفاصيل الطلب:*\n`;

    cartItems.forEach((item, index) => {
      message += `\n${index + 1}. *${item.title}*\n`;
      message += `   - الكمية: ${item.quantity}\n`;
      message += `   - السعر: ${item.price * item.quantity} ج.م\n`;
      if (item.details && item.details.length > 0) {
        item.details.forEach(d => {
          message += `   • ${d}\n`;
        });
      }
    });

    message += `\n──────────────\n`;
    message += `💰 *المجموع:* ${subtotal} ج.م\n`;
    message += `🚚 *التوصيل:* ${deliveryFee === 0 ? 'مجاني' : `${deliveryFee} ج.م`}\n`;
    if (appliedGiftCard && giftCardDiscount > 0) {
      message += `🎁 *خصم بطاقة الهدايا (${appliedGiftCard.code}):* -${giftCardDiscount} ج.م\n`;
    }
    message += `✨ *الإجمالي النهائي:* ${grandTotal} ج.م\n`;

    if (orderNotes) {
      message += `\n📝 *ملاحظات خاصة:* ${orderNotes}\n`;
    }

    message += `\nيسعدنا تأكيد طلبكم وبدء التجهيز الفوري! 💖`;

    const nowTimestamp = formatActivityTimestamp();
    const newOrder: TrackedOrder = {
      orderNumber: generatedOrderNum,
      createdAt: nowTimestamp,
      customerName: customerName || 'ضيف عزيز',
      customerPhone: customerPhone || 'تسليم رقمي',
      deliveryAddress: deliveryAddress || 'تسليم رقمي',
      eventDate: eventDate || 'اليوم',
      eventTimeSlot,
      items: [...cartItems],
      subtotal,
      deliveryFee,
      grandTotal,
      status: 'confirmed',
      driverName: 'كابتن محمود رضا',
      driverPhone: '01000000000',
      notes: orderNotes,
      lastUpdated: nowTimestamp,
      activityLog: [
        createActivityLogEntry(
          'confirmed',
          'تم إنشاء الطلب وتأكيد بيانات التوصيل عبر سلة متجر بهجة.',
          nowTimestamp
        ),
      ],
    };

    if (onCreateOrder) {
      onCreateOrder(newOrder);
    }
    if (appliedGiftCard) {
      onRedeemGiftCard?.(appliedGiftCard.code);
      setAppliedGiftCard(null);
      setGiftCodeInput('');
      setGiftCodeFeedback(null);
    }

    setCreatedOrderNumber(generatedOrderNum);

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/201000000000?text=${encoded}`;
    
    // Open WhatsApp in new tab or app
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl relative animate-slide-left">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD8] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#B46D52]" />
            <h3 className="font-extrabold text-base text-[#2D2421]">سلة طلبات الضيافة</h3>
            <span className="text-xs text-[#82726B] font-bold tabular-nums">
              ({cartItems.length} عناصر)
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#EAE0D7] flex items-center justify-center text-[#2D2421] transition-colors"
            aria-label="إغلاق السلة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF0EA] text-[#B46D52] mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-[#2D2421]">سلة مناسبتك فارغة حالياً</h4>
              <p className="text-xs text-[#7D6B64] max-w-xs mx-auto">
                استعرض قائمتنا أو صمّم بوكسك المخصص من الميني ساندوتشات والجاتوهات الفرنسية.
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B46D52] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <span>ابدأ التسوق واختيار البوكسات</span>
              </button>
            </div>
          ) : (
            <>
              {/* Order Placed / Payment Success Banner */}
              {createdOrderNumber && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>
                      {paymentReceipt
                        ? `تم الدفع وتأكيد الطلب #${createdOrderNumber} بنجاح!`
                        : `تم تسجيل طلبك بنجاح برقم #${createdOrderNumber}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    {paymentReceipt
                      ? `تم سداد ${paymentReceipt.amount} ج.م عبر (${paymentReceipt.methodLabel}). يمكنك متابعة مراحل التجهيز أو طباعة الفاتورة.`
                      : 'تم فتح الواتساب للتأكيد، ويمكنك متابعة مرحلة الخبز والتوصيل حياً الآن.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (onTrackOrder) onTrackOrder(createdOrderNumber);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>تتبع الطلب الآن</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCreatedOrderNumber(null);
                        setPaymentReceipt(null);
                        onClearCart();
                      }}
                      className="px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      إفراغ السلة لطلب جديد
                    </button>
                  </div>
                </div>
              )}

              {/* Item List */}
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-xl border border-[#E8DFD8] bg-[#FAF7F5] flex items-start gap-3 justify-between"
                  >
                    {/* Item Image Thumbnail */}
                    {item.image && (
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F0EBE6] shrink-0 border border-[#DECFC0] shadow-2xs">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.type === 'gift_card' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-extrabold">
                            <Gift className="w-3 h-3" />
                            <span>بطاقة هدايا رقمية</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#2D2421] leading-tight line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="text-xs font-extrabold text-[#B46D52] tabular-nums">
                        {item.price} ج.م
                      </div>

                      {item.details && (
                        <div className="text-[11px] text-[#7D6B64] space-y-0.5 pt-1">
                          {item.details.map((d, i) => (
                            <div key={i} className="truncate max-w-[220px]">· {d}</div>
                          ))}
                        </div>
                      )}

                      {item.type === 'gift_card' && item.giftCardDetails && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyGiftCardCode(item.giftCardDetails!.code)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[#D9CCC2] hover:border-[#B46D52] text-[10px] font-bold text-[#2D2421] cursor-pointer"
                          >
                            {copiedGiftCode === item.giftCardDetails.code ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#B46D52]" />
                            )}
                            <span>
                              {copiedGiftCode === item.giftCardDetails.code ? 'تم نسخ الكود' : 'نسخ الكود'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDispatchGiftCardFromCart(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            {item.giftCardDetails.deliveryChannel === 'email' ? (
                              <Mail className="w-3 h-3" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>
                              {item.giftCardDetails.deliveryChannel === 'email'
                                ? 'إرسال بالإيميل'
                                : 'إرسال بالواتساب'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-[#96847C] hover:text-rose-600 p-1"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-[#D9CCC2]">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#2D2421] hover:bg-[#F5ECE5] rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#2D2421] hover:bg-[#F5ECE5] rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details Form */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD8] space-y-3 pt-4">
                <h4 className="text-xs font-bold text-[#2D2421] pb-1 border-b border-[#E8DFD8]">
                  بيانات التوصيل والتسليم
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-[#7D6B64] block mb-0.5">الاسم الكريم:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="اسمك للتواصل وفاتورة الطلب"
                      className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:border-[#B46D52] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#7D6B64] block mb-0.5">رقم الجوال (واتساب):</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:border-[#B46D52] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#7D6B64] block mb-0.5">عنوان الحفل / القاعة / المنزل:</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="المدينة، الحي، اسم القاعة أو المنزل"
                      className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:border-[#B46D52] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#7D6B64] block mb-0.5">تاريخ الحفل:</label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-[#D9CCC2] bg-white focus:border-[#B46D52] outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#7D6B64] block mb-0.5">موعد التسليم:</label>
                      <select
                        value={eventTimeSlot}
                        onChange={(e) => setEventTimeSlot(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-[#D9CCC2] bg-white focus:border-[#B46D52] outline-none text-xs"
                      >
                        <option value="صباحاً (10:00 ص - 1:00 م)">صباحاً (10:00 - 1:00)</option>
                        <option value="عصراً (3:00 م - 6:00 م)">عصراً (3:00 - 6:00)</option>
                        <option value="مساءً (7:00 م - 10:00 م)">مساءً (7:00 - 10:00)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#7D6B64] block mb-0.5">ملاحظات إضافية:</label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="أي تنبيهات للحساسية أو موعد الاستلام..."
                      className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:border-[#B46D52] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD8] space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-1.5">
                  <h4 className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>اختيار طريقة الدفع</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-[#7D6B64]">دفع آمن ومباشر</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'card' as const, label: 'بطاقة بنكية', Icon: CreditCard },
                    { id: 'wallet' as const, label: 'محفظة / إنستا', Icon: Wallet },
                    { id: 'cash' as const, label: 'عند الاستلام', Icon: Banknote },
                  ].map(({ id, label, Icon }) => {
                    const isSelected = paymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2D2421] text-white border-[#2D2421] shadow-xs'
                            : 'bg-white text-[#4F413B] border-[#D9CCC2] hover:border-[#B46D52]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FFE8B3]' : 'text-[#B46D52]'}`} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* E-Gift Card / Discount Code Redemption */}
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD8] space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-1.5">
                  <h4 className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-[#B46D52]" />
                    <span>استخدام كود بطاقة الهدايا</span>
                  </h4>
                  {!appliedGiftCard && (
                    <button
                      type="button"
                      onClick={() => handleApplyGiftCode('BAHJAH-GIFT-100')}
                      className="text-[10px] font-bold text-[#B46D52] hover:underline cursor-pointer"
                    >
                      جرب كود الترحيب (BAHJAH-GIFT-100)
                    </button>
                  )}
                </div>

                {appliedGiftCard ? (
                  <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                    <div className="text-emerald-800 font-bold">
                      كود مفعل: <span className="font-mono" dir="ltr">{appliedGiftCard.code}</span> (-{giftCardDiscount} ج.م)
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveGiftCode}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      إزالة
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={giftCodeInput}
                      onChange={(e) => {
                        setGiftCodeInput(e.target.value);
                        if (giftCodeFeedback) setGiftCodeFeedback(null);
                      }}
                      placeholder="أدخل كود بطاقة الهدايا (BAHJAH-...)"
                      dir="ltr"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:border-[#B46D52] outline-none font-mono uppercase text-right"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyGiftCode()}
                      className="px-3.5 py-2 rounded-lg bg-[#2D2421] hover:bg-[#B46D52] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      تطبيق
                    </button>
                  </div>
                )}

                {giftCodeFeedback && (
                  <p
                    className={`text-[11px] font-bold ${
                      giftCodeFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {giftCodeFeedback.text}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8DFD8] bg-[#FAF7F2] space-y-3">
            <div className="space-y-1.5 text-xs text-[#6B5B55]">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold tabular-nums text-[#2D2421]">{subtotal} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>{isDigitalOnlyOrder ? 'التوصيل الرقمي:' : 'التوصيل المبرد:'}</span>
                <span className="font-bold tabular-nums">
                  {deliveryFee === 0 ? <span className="text-emerald-700">مجاني</span> : `${deliveryFee} ج.م`}
                </span>
              </div>
              {giftCardDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>خصم بطاقة الهدايا ({appliedGiftCard?.code}):</span>
                  <span className="tabular-nums">-{giftCardDiscount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#2D2421] pt-1.5 border-t border-[#E8DFD8]">
                <span>المجموع النهائي:</span>
                <span className="text-base text-[#B46D52] tabular-nums">{grandTotal} ج.م</span>
              </div>
            </div>

            {pdfFeedback && (
              <div
                className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${
                  pdfFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {pdfFeedback.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{pdfFeedback.text}</span>
              </div>
            )}

            {checkoutError && (
              <div className="px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border bg-rose-50 text-rose-700 border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={isProcessingPayment}
                className="w-full flex items-center justify-center gap-2 py-3 px-3 bg-[#B46D52] hover:bg-[#9B5A42] disabled:opacity-70 text-white font-extrabold rounded-xl text-xs shadow-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                {isProcessingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>
                  {isProcessingPayment
                    ? 'جاري تأكيد عملية الدفع...'
                    : `تأكيد الدفع وإتمام الطلب (${grandTotal} ج.م)`}
                </span>
              </button>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={handleWhatsAppOrder}
                  className="flex items-center justify-center gap-1 py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>واتساب</span>
                </button>

                <button
                  onClick={handleDownloadInvoicePdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center justify-center gap-1 py-2.5 px-2 bg-[#FAF0EA] hover:bg-[#F2DFD4] disabled:opacity-60 text-[#B46D52] border border-[#E6CFC2] font-bold rounded-xl text-[11px] shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{isGeneratingPdf ? 'تجهيز...' : 'طباعة الفاتورة'}</span>
                </button>

                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center justify-center gap-1 py-2.5 px-2 bg-[#2D2421] hover:bg-[#433531] text-white font-bold rounded-xl text-[11px] shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>المعاينة</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Invoice Modal Preview */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E8DFD8] shadow-2xl relative text-right">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 left-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#2D2421]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-3 border-b border-[#E8DFD8]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#B46D52] inline-block mb-1"></div>
              <h3 className="font-extrabold text-base text-[#2D2421]">فاتورة طلب مبدئية</h3>
              <p className="text-[11px] text-[#82726B]">مشروع بَهْجَة لتوزيعات وضيافة المناسبات</p>
              <div className="text-[10px] text-[#A69389] mt-0.5">رقم الطلب: #{activeInvoiceNumber}</div>
            </div>

            <div className="text-xs space-y-1.5 text-[#6B5B55]">
              <div><strong>العميل:</strong> {customerName || 'ضيف عزيز'}</div>
              <div><strong>الجوال:</strong> {customerPhone || 'غير محدد'}</div>
              <div><strong>العنوان:</strong> {deliveryAddress || 'غير محدد'}</div>
              <div><strong>موعد الحفل:</strong> {eventDate || 'فوري'} ({eventTimeSlot})</div>
            </div>

            <div className="border-t border-b border-[#F0E8E1] py-2.5 space-y-2 text-xs">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[#2D2421]">
                  <span>{item.quantity}x {item.title}</span>
                  <span className="font-bold tabular-nums">{item.price * item.quantity} ج.م</span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1 text-[#6B5B55]">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold tabular-nums">{subtotal} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>التوصيل:</span>
                <span className="font-bold tabular-nums">{deliveryFee === 0 ? 'مجاني' : `${deliveryFee} ج.م`}</span>
              </div>
              {giftCardDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>خصم بطاقة الهدايا:</span>
                  <span className="tabular-nums">-{giftCardDiscount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#2D2421] pt-1 border-t border-[#E8DFD8]">
                <span>المبلغ المستحق:</span>
                <span className="text-[#B46D52] tabular-nums">{grandTotal} ج.م</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleDownloadInvoicePdf}
                disabled={isGeneratingPdf}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FAF0EA] hover:bg-[#F2DFD4] disabled:opacity-60 text-[#B46D52] border border-[#E6CFC2] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                <span>{isGeneratingPdf ? 'جاري إنشاء PDF...' : 'طباعة الفاتورة (PDF)'}</span>
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  handleWhatsAppOrder();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                تأكيد عبر واتساب
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
