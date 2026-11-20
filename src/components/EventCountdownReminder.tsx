import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  MessageCircle, 
  CalendarPlus, 
  BookmarkCheck,
  RefreshCw
} from 'lucide-react';
import { OccasionType } from '../types/catering';
import { OCCASIONS_LIST } from '../data/cateringData';

interface EventCountdownReminderProps {
  onStartBooking?: (occasion?: OccasionType) => void;
}

interface SavedEventData {
  eventDate: string;
  occasionType: OccasionType;
  eventTitle: string;
  guestCount: number;
}

export const EventCountdownReminder: React.FC<EventCountdownReminderProps> = ({
  onStartBooking,
}) => {
  // Tomorrow as default minimum date
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // Default to a week from now
    return d.toISOString().split('T')[0];
  };

  // State
  const [eventDate, setEventDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bahjah_saved_event');
      if (saved) {
        const parsed: SavedEventData = JSON.parse(saved);
        if (parsed.eventDate) return parsed.eventDate;
      }
    } catch {
      // ignore
    }
    return getTomorrowString();
  });

  const [occasionType, setOccasionType] = useState<OccasionType>(() => {
    try {
      const saved = localStorage.getItem('bahjah_saved_event');
      if (saved) {
        const parsed: SavedEventData = JSON.parse(saved);
        if (parsed.occasionType) return parsed.occasionType;
      }
    } catch {
      // ignore
    }
    return 'graduation';
  });

  const [eventTitle, setEventTitle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bahjah_saved_event');
      if (saved) {
        const parsed: SavedEventData = JSON.parse(saved);
        if (parsed.eventTitle) return parsed.eventTitle;
      }
    } catch {
      // ignore
    }
    return 'حفل تخرج وتفوق عائلي';
  });

  const [guestCount, setGuestCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bahjah_saved_event');
      if (saved) {
        const parsed: SavedEventData = JSON.parse(saved);
        if (parsed.guestCount) return parsed.guestCount;
      }
    } catch {
      // ignore
    }
    return 20;
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Current time ticker for live countdown
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute countdown calculations
  const countdownDetails = useMemo(() => {
    if (!eventDate) return null;

    const targetDate = new Date(`${eventDate}T18:00:00`);
    const diffMs = targetDate.getTime() - now.getTime();

    // Recommended order deadline is 4 days before event (minimum 48 hours for fresh baking & ribbons)
    const idealOrderDate = new Date(targetDate.getTime() - (4 * 24 * 60 * 60 * 1000));
    const urgentCutoffDate = new Date(targetDate.getTime() - (2 * 24 * 60 * 60 * 1000));

    const daysUntilEvent = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    // Live countdown broken down
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Remaining days until ideal booking deadline
    const msUntilIdealOrder = idealOrderDate.getTime() - now.getTime();
    const daysUntilIdealDeadline = Math.ceil(msUntilIdealOrder / (1000 * 60 * 60 * 24));

    // Urgency Status
    let statusTone: 'plenty' | 'ideal' | 'urgent' | 'today' | 'past' = 'ideal';
    let statusBadge = '';
    let recommendationText = '';

    if (diffMs < 0) {
      statusTone = 'past';
      statusBadge = 'الموعد انقضى';
      recommendationText = 'يرجى تحديد موعد مستقبلي لمناسبتك القادمة لحساب التذكير والمهلة بدقة.';
    } else if (daysUntilEvent <= 1) {
      statusTone = 'today';
      statusBadge = 'اليوم / غداً موعد الحفل! 🎉';
      recommendationText = 'مناسبتك على الأبواب! نرجو لكم يوماً سعيداً ومبهجاً. للطلبات السريعة العاجلة، تواصل معنا مباشرة عبر الواتساب.';
    } else if (daysUntilEvent <= 3) {
      statusTone = 'urgent';
      statusBadge = '⚠️ تنبيه: موعد حرج ومستعجل';
      recommendationText = 'متبقي أقل من 72 ساعة على الحفل! يفضل تأكيد طلبك الآن فوراً لضمان توفر فريق الخبز وتجهيز كروت الإهداء المطبوعة.';
    } else if (daysUntilEvent <= 7) {
      statusTone = 'ideal';
      statusBadge = '✨ التوقيت الذهبي لتأكيد الحجز';
      recommendationText = 'أنت الآن في التوقيت المثالي لحجز بوكسات الضيافة؛ لديك متسع لاختيار ألوان الشرائط وتنسيق محتويات البوكسات وكروت الإهداء بالاسم.';
    } else {
      statusTone = 'plenty';
      statusBadge = '🌱 في أمان وتخطيط مريح';
      recommendationText = 'أمامك متسع رائع للتخطيط بهدوء. احفظ الموعد وسنذكرك بالطلب قبل الحفل بـ 5 أيام لضمان حجز الموعد دون أي تأخير.';
    }

    return {
      targetDate,
      idealOrderDate,
      urgentCutoffDate,
      daysUntilEvent,
      days,
      hours,
      minutes,
      seconds,
      daysUntilIdealDeadline,
      statusTone,
      statusBadge,
      recommendationText,
      formattedDate: targetDate.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      formattedIdealOrderDate: idealOrderDate.toLocaleDateString('ar-EG', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    };
  }, [eventDate, now]);

  // Save event in localStorage
  const handleSaveEvent = () => {
    try {
      const data: SavedEventData = {
        eventDate,
        occasionType,
        eventTitle,
        guestCount,
      };
      localStorage.setItem('bahjah_saved_event', JSON.stringify(data));
      setIsSaved(true);
      setToastMessage('تم حفظ موعد مناسبتك بنجاح! سنبقيك على اطلاع دائم بالوقت المتبقي.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage('تم الحفظ مؤقتاً في هذه الجلسة.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Quick preset dates
  const handleQuickPreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const dateStr = d.toISOString().split('T')[0];
    setEventDate(dateStr);
    setIsSaved(false);
  };

  // WhatsApp Reminder Generator
  const handleWhatsAppReminder = () => {
    const occLabel = OCCASIONS_LIST.find(o => o.id === occasionType)?.label || 'المناسبة';
    const msg = `مرحباً فريق بهجة للضيافة 🌸
لدي مناسبة قادمة وأود تسجيلها لديكم لمتابعة حجز بوكسات الضيافة:
- عنوان المناسبة: ${eventTitle}
- نوع المناسبة: ${occLabel}
- تاريخ الحفل: ${countdownDetails?.formattedDate || eventDate}
- عدد المعازيم المتوقع: ${guestCount} شخص
- موعد الحجز الموصى به: ${countdownDetails?.formattedIdealOrderDate || 'خلال أيام'}

أرجو التواصل معي لتنسيق قائمة الميني ساندوتش والجاتوهات وتثبيت الموعد. شكراً لكم!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/201000000000?text=${encoded}`, '_blank');
  };

  // Google Calendar Link Generator
  const handleAddToGoogleCalendar = () => {
    if (!eventDate) return;
    const cleanDate = eventDate.replace(/-/g, '');
    const startTime = `${cleanDate}T150000`;
    const endTime = `${cleanDate}T220000`;
    const title = encodeURIComponent(`مناسبة بهجة: ${eventTitle}`);
    const details = encodeURIComponent(`توزيعات وضيافة مناسبة «${eventTitle}». لا تنسَ استلام بوكسات الميني ساندوتش والجاتوهات الطازجة من بهجة.`);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
    window.open(gcalUrl, '_blank');
  };

  const currentOcc = OCCASIONS_LIST.find(o => o.id === occasionType);

  return (
    <section id="reminder" className="py-12 lg:py-16 bg-[#FAF7F2] border-t border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2.5 mb-10">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B46D52] bg-[#FAF0EA] px-3 py-1 rounded-full border border-[#E8CFC2]">
            <Bell className="w-3.5 h-3.5" />
            <span>مخطط المواعيد والعد التنازلي الذكي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2D2421] [text-wrap:balance]">
            سجّل موعد مناسبتك.. ولا تشيل هم الضيافة في اللحظة الأخيرة
          </h2>
          <p className="text-sm sm:text-base text-[#6B5B55] [text-wrap:balance]">
            أدخل موعد حفلتك القادمة، وسيحسب لك التطبيق الأيام المتبقية وينبهك بالموعد الذهبي لتأكيد حجز البوكسات وتجهيز الكروت المطبوعة بدون أي توتر.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DFD8] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0E8E1] pb-3">
              <span className="font-bold text-sm text-[#2D2421] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B46D52]" />
                بيانات مناسبتك القادمة
              </span>
              <span className="text-[11px] text-[#82726B]">حفظ تلقائي</span>
            </div>

            {/* Event Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2421] block">
                اسم أو وصف المناسبة:
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => {
                  setEventTitle(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="مثال: حفل خطوبة سارة ومحمد، عيد ميلاد ليلى"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] focus:border-[#B46D52] focus:ring-1 focus:ring-[#B46D52] outline-none transition-all bg-[#FAF8F5]"
              />
            </div>

            {/* Occasion Type Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2421] block">
                نوع الاحتفال:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OCCASIONS_LIST.map(occ => {
                  const isSelected = occasionType === occ.id;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => {
                        setOccasionType(occ.id as OccasionType);
                        setIsSaved(false);
                      }}
                      className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#B46D52] bg-[#FAF0EA] text-[#2D2421] font-bold ring-1 ring-[#B46D52]'
                          : 'border-[#E8DFD8] hover:border-[#D4C3B7] bg-white text-[#6B5B55]'
                      }`}
                    >
                      <span className="text-base">{occ.icon}</span>
                      <span className="text-[11px] truncate">{occ.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event Date Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B46D52]" />
                  <span>تاريخ ويوم المناسبة:</span>
                </label>
                <span className="text-[11px] text-[#B46D52] font-semibold">
                  {countdownDetails?.formattedDate || eventDate}
                </span>
              </div>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E8DFD8] focus:border-[#B46D52] focus:ring-1 focus:ring-[#B46D52] outline-none transition-all bg-[#FAF8F5]"
              />

              {/* Quick Date Shortcuts */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-[#82726B]">خيارات سريعة:</span>
                {[
                  { label: 'بعد 3 أيام', days: 3 },
                  { label: 'خلال أسبوع', days: 7 },
                  { label: 'بعد أسبوعين', days: 14 },
                  { label: 'بعد شهر', days: 30 },
                ].map(p => (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => handleQuickPreset(p.days)}
                    className="px-2 py-0.5 rounded-md bg-[#F4EDE7] hover:bg-[#EAE0D7] text-[#6B5B55] transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Count */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2D2421]">
                  عدد الضيوف المتوقع:
                </label>
                <span className="text-xs font-extrabold text-[#B46D52] tabular-nums">
                  {guestCount} ضيفاً
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={guestCount}
                onChange={(e) => {
                  setGuestCount(parseInt(e.target.value, 10));
                  setIsSaved(false);
                }}
                className="w-full accent-[#B46D52] cursor-pointer"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveEvent}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2D2421] hover:bg-[#433531] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <BookmarkCheck className="w-4 h-4 text-[#E8CFC2]" />
                <span>{isSaved ? 'تم الحفظ في المتصفح' : 'حفظ موعد المناسبة'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToGoogleCalendar}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-[#FAF0EA] text-[#2D2421] text-xs font-semibold rounded-xl border border-[#E8DFD8] transition-colors"
                title="إضافة الموعد لتقويم جوجل"
              >
                <CalendarPlus className="w-4 h-4 text-[#B46D52]" />
                <span className="hidden sm:inline">للتقويم</span>
              </button>
            </div>

            {toastMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}
          </div>

          {/* Countdown & Smart Lead-Time Display (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Countdown Clock Card */}
            <div className="bg-gradient-to-br from-[#2D2421] via-[#3A2F2B] to-[#2D2421] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Background celebration glow */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-[#B46D52]/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 space-y-6">
                
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentOcc?.icon || '🎉'}</span>
                    <div>
                      <h3 className="font-bold text-base text-white">
                        {eventTitle || 'مناسبتك القادمة'}
                      </h3>
                      <p className="text-xs text-[#D8CCC4]">
                        {countdownDetails?.formattedDate || eventDate}
                      </p>
                    </div>
                  </div>

                  {countdownDetails?.statusBadge && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-xs ${
                      countdownDetails.statusTone === 'urgent'
                        ? 'bg-rose-500/90 text-white animate-pulse'
                        : countdownDetails.statusTone === 'ideal'
                        ? 'bg-amber-400 text-[#2D2421]'
                        : countdownDetails.statusTone === 'today'
                        ? 'bg-emerald-400 text-[#2D2421]'
                        : 'bg-white/20 text-white'
                    }`}>
                      {countdownDetails.statusBadge}
                    </span>
                  )}
                </div>

                {/* 4-Box Digital Countdown Counter */}
                <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/10">
                    <div className="text-2xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                      {countdownDetails?.days ?? 0}
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#E5DACF] mt-1 font-medium">يوم</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/10">
                    <div className="text-2xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                      {String(countdownDetails?.hours ?? 0).padStart(2, '0')}
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#E5DACF] mt-1 font-medium">ساعة</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/10">
                    <div className="text-2xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                      {String(countdownDetails?.minutes ?? 0).padStart(2, '0')}
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#E5DACF] mt-1 font-medium">دقيقة</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/10">
                    <div className="text-2xl sm:text-4xl font-extrabold text-[#E8A598] tabular-nums tracking-tight">
                      {String(countdownDetails?.seconds ?? 0).padStart(2, '0')}
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#E5DACF] mt-1 font-medium">ثانية</div>
                  </div>
                </div>

                {/* Lead-Time Progress Bar */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-[#D8CCC4]">
                    <span>تجهيز الضيافة والبوكسات</span>
                    <span className="font-semibold text-white">
                      {countdownDetails?.daysUntilEvent && countdownDetails.daysUntilEvent > 0 
                        ? `باقي ${countdownDetails.daysUntilEvent} يوم على الحفل` 
                        : 'حان موعد المناسبة'}
                    </span>
                  </div>
                  <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#B46D52] to-[#E8A598] transition-all duration-500 rounded-full"
                      style={{ 
                        width: `${Math.max(10, Math.min(100, 100 - ((countdownDetails?.daysUntilEvent || 0) / 30) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Smart Recommendation & Booking Deadline Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DFD8] shadow-sm space-y-5">
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF0EA] text-[#B46D52] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#2D2421]">
                    نصيحة وتوقيت بهجة لحجز ضيافة متقنة
                  </h4>
                  <p className="text-xs text-[#6B5B55] leading-relaxed">
                    {countdownDetails?.recommendationText}
                  </p>
                </div>
              </div>

              {/* Deadline Milestones Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0E8E1]">
                
                {/* Ideal Booking Date */}
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EDE4DC] space-y-1">
                  <div className="text-[11px] font-bold text-[#B46D52] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>الموعد الذهبي لتأكيد الطلب:</span>
                  </div>
                  <div className="text-xs font-bold text-[#2D2421]">
                    {countdownDetails?.formattedIdealOrderDate}
                  </div>
                  <div className="text-[10px] text-[#82726B]">
                    (قبل الحفل بـ 4 أيام لضمان حجز الشرائط وطباعة كروت الإهداء مجاناً)
                  </div>
                </div>

                {/* Recommended Catering Plan */}
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EDE4DC] space-y-1">
                  <div className="text-[11px] font-bold text-[#2D2421] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B46D52]" />
                    <span>التوزيع المقترح لـ {guestCount} ضيفاً:</span>
                  </div>
                  <div className="text-xs font-bold text-[#2D2421]">
                    {guestCount} بوكس فردي (ساندوتشين + جاتوه + عصير)
                  </div>
                  <div className="text-[10px] text-[#82726B]">
                    أو ما يعادل {Math.ceil((guestCount * 4) / 24)} بوكس ضيافة عائلي مشكل
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onStartBooking?.(occasionType)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#B46D52] hover:bg-[#9B5A42] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  <span>صمّم واختر بوكسات هذه المناسبة الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppReminder}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تثبيت وتذكير واتساب</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
