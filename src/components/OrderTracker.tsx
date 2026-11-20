import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  PackageCheck, 
  ChefHat, 
  Gift, 
  Truck, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  Sliders,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Star,
  Heart,
  Edit3,
  Bell,
  BellRing,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Layers,
  Box,
  AlertCircle,
  Quote,
  Send,
  Navigation,
  Home,
  History,
  ArrowUpDown
} from 'lucide-react';
import { TrackedOrder, OrderStatus, OrderRating, CartItem } from '../types/catering';
import { ORDER_TIMELINE_STEPS, BOX_FILLINGS, RIBBON_COLORS, OCCASIONS_LIST, IMAGES } from '../data/cateringData';
import { ensureOrderActivityLog } from '../utils/orderActivity';

export interface OrderNotification {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface OrderTrackerProps {
  orders: TrackedOrder[];
  onUpdateOrderStatus: (orderNumber: string, newStatus: OrderStatus) => void;
  onAddOrderRating?: (orderNumber: string, rating: OrderRating) => void;
  initialSearchQuery?: string;
  onExploreMenu?: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  onUpdateOrderStatus,
  onAddOrderRating,
  initialSearchQuery = '',
  onExploreMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || (orders[0]?.orderNumber || 'BAH-1045'));
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusUpdatedToast, setStatusUpdatedToast] = useState<{
    orderNumber: string;
    status: OrderStatus;
    title: string;
    description: string;
  } | null>(null);

  // Instant notification feed state
  const [notifications, setNotifications] = useState<OrderNotification[]>([
    {
      id: 'notif-init-1',
      orderNumber: 'BAH-1045',
      status: 'baking',
      statusLabel: 'جاري الخبز والتحضير',
      message: 'تم إدخال الميني كرواسون والبريوش إلى أفران بهجة الساخنة لتجهيز بوكساتك طازجة.',
      timestamp: 'منذ 10 دقائق',
      isRead: false,
    },
    {
      id: 'notif-init-2',
      orderNumber: 'BAH-1039',
      status: 'out_for_delivery',
      statusLabel: 'في الطريق مع التوصيل المبرّد',
      message: 'الكابتن أحمد حسام استلم البوكسات بسيارة مبردة وهو في اتجاه موقع الحفل بالشيخ زايد.',
      timestamp: 'منذ 5 دقائق',
      isRead: false,
    }
  ]);

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Product Image Showcase & Custom Box Inspection states
  const [showItemImages, setShowItemImages] = useState(true);
  const [inspectedItem, setInspectedItem] = useState<CartItem | null>(null);
  const [previewingFillingImage, setPreviewingFillingImage] = useState<{
    name: string;
    image: string;
    desc: string;
    qty?: number;
  } | null>(null);

  // Detailed Rating Form State (General, Packaging, Ingredients Quality, Delivery Speed)
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [packagingRating, setPackagingRating] = useState<number>(5);
  const [packagingHover, setPackagingHover] = useState<number>(0);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [qualityHover, setQualityHover] = useState<number>(0);
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [deliveryHover, setDeliveryHover] = useState<number>(0);

  const MAX_REVIEW_CHARS = 240;

  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [showDetailedAspects, setShowDetailedAspects] = useState<boolean>(true);
  const [selectedRatingTags, setSelectedRatingTags] = useState<string[]>([
    'تغليف فاخر وشرائط راقية 🎁',
    'مكونات طازجة وشوكولاتة بلجيكية 🥐',
    'توصيل مبرد في الوقت المحدد ⏰'
  ]);
  const [isEditingRating, setIsEditingRating] = useState<boolean>(false);
  const [ratingToast, setRatingToast] = useState<string | null>(null);
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);

  // Sync external initialSearchQuery updates
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Active matched order
  const currentOrder = useMemo(() => {
    const cleanQuery = searchQuery.trim().replace(/^#/, '').toUpperCase();
    return orders.find(o => o.orderNumber.toUpperCase() === cleanQuery || o.orderNumber.toUpperCase().includes(cleanQuery));
  }, [searchQuery, orders]);

  // Activity Log sorting & resolved entries
  const [logSortOrder, setLogSortOrder] = useState<'newest' | 'oldest'>('newest');

  const orderActivityLog = useMemo(() => {
    if (!currentOrder) return [];
    return ensureOrderActivityLog(currentOrder);
  }, [currentOrder]);

  const sortedActivityLog = useMemo(() => {
    const indexed = orderActivityLog.map((entry, idx) => ({
      ...entry,
      sequenceNumber: idx + 1,
      isLatest: idx === orderActivityLog.length - 1,
    }));
    return logSortOrder === 'newest' ? [...indexed].reverse() : indexed;
  }, [orderActivityLog, logSortOrder]);

  // Reset review form state cleanly when switching orders
  useEffect(() => {
    setIsEditingRating(false);
    setRatingError(null);
    if (currentOrder?.rating) {
      setRatingStars(currentOrder.rating.stars);
      setPackagingRating(currentOrder.rating.packagingRating || 5);
      setQualityRating(currentOrder.rating.qualityRating || 5);
      setDeliveryRating(currentOrder.rating.deliveryRating || 5);
      setRatingComment(currentOrder.rating.comment || '');
      setSelectedRatingTags(currentOrder.rating.tags || []);
    } else {
      setRatingStars(5);
      setPackagingRating(5);
      setQualityRating(5);
      setDeliveryRating(5);
      setRatingComment('');
      setSelectedRatingTags([
        'طازج ولذيذ جداً 🥐',
        'تغليف فاخر يشرّف 🎁',
        'التزام دقيق بالوقت ⏰'
      ]);
    }
  }, [currentOrder?.orderNumber]);

  const QUICK_REVIEW_SUGGESTIONS = [
    'التوزيعات وصلت طازجة ومبهرة، التغليف بالشرائط راقي جداً والضيوف أشادوا بالطعم!',
    'تجربة ممتازة؛ الساندوتشات هشة والجاتوه الفرنسي لذيذ والتوصيل كان في الموعد بالدقيقة.',
    'بوكسات أنيقة ومحكمة الإغلاق، مثالية لضيافة المناسبات وسنكرر الطلب بالتأكيد 🌟'
  ];

  // All delivered orders that have customer reviews
  const recentDeliveredReviews = useMemo(() => {
    return orders.filter(o => o.status === 'delivered' && o.rating);
  }, [orders]);

  // Interactive Mini Map stage mapping (4 primary stages: تم الاستلام، قيد التجهيز، جاري التوصيل، تم التوصيل)
  const getMapStageIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'confirmed': return 0;
      case 'baking':
      case 'packaging': return 1;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const [inspectedMapStageIdx, setInspectedMapStageIdx] = useState<number | null>(null);

  useEffect(() => {
    setInspectedMapStageIdx(null);
  }, [currentOrder?.orderNumber, currentOrder?.status]);

  const MINI_MAP_STAGES = [
    {
      idx: 0,
      label: 'تم الاستلام',
      targetStatus: 'confirmed' as OrderStatus,
      locationLabel: 'استقبال طلبات بهجة',
      detail: 'تم استلام وتأكيد طلبك ومراجعة تفاصيل الصناديق وكروت الإهداء.',
      icon: 'received',
    },
    {
      idx: 1,
      label: 'قيد التجهيز',
      targetStatus: 'baking' as OrderStatus,
      locationLabel: 'مطبخ وأفران بهجة',
      detail: 'يتم الآن الخَبز الطازج والتغليف الفاخر بشرائط الساتان وطباعة الكروت.',
      icon: 'preparing',
    },
    {
      idx: 2,
      label: 'جاري التوصيل',
      targetStatus: 'out_for_delivery' as OrderStatus,
      locationLabel: 'سيارة التوصيل المبرّدة',
      detail: 'الطلب في طريقه إليك الآن مع المندوب للحفاظ على أعلى درجات الطزاجة.',
      icon: 'delivering',
    },
    {
      idx: 3,
      label: 'تم التوصيل',
      targetStatus: 'delivered' as OrderStatus,
      locationLabel: 'موقع المناسبة',
      detail: 'وصلت التوزيعات بنجاح إلى عنوان المناسبة! نتمنى لكم وقتاً سعيداً.',
      icon: 'delivered',
    },
  ];

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationDescription = (status: OrderStatus, orderNum: string) => {
    switch (status) {
      case 'confirmed':
        return `تم تأكيد طلبك #${orderNum} وتجهيز المكونات الفاخرة وأجود أنواع الزبدة والشوكولاتة البلجيكية.`;
      case 'baking':
        return `بدأ خبز الميني ساندوتش والكرواسون وتجهيز قطع الجاتوه في أفران بهجة الصباحية.`;
      case 'packaging':
        return `مرحلة التغليف والشرائط: يتم الآن تعبئة بوكساتك بعناية، ربط شرائط الساتان وطباعة كروت الإهداء المخصصة.`;
      case 'out_for_delivery':
        return `طلبك الآن في سيارة التوصيل المبردة متجهاً إلى موقع المناسبة لضمان الانتعاش والبرودة المثالية.`;
      case 'delivered':
        return `تم تسليم بوكسات وضيافة مناسبتك بنجاح في الموقع! نتمنى لكم حفلاً سعيداً وذكريات تدوم.`;
      default:
        return `تم تحديث حالة الطلب #${orderNum}.`;
    }
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!currentOrder) return;
    onUpdateOrderStatus(currentOrder.orderNumber, newStatus);
    const stepObj = ORDER_TIMELINE_STEPS.find(s => s.status === newStatus);
    const title = stepObj?.label || 'تحديث جديد';
    const description = getNotificationDescription(newStatus, currentOrder.orderNumber);

    // 1. Trigger instantaneous interactive state notification toast
    setStatusUpdatedToast({
      orderNumber: currentOrder.orderNumber,
      status: newStatus,
      title,
      description,
    });
    setTimeout(() => {
      setStatusUpdatedToast(null);
    }, 6000);

    // 2. Add to real-time notifications feed in state
    const newNotif: OrderNotification = {
      id: `notif-${Date.now()}`,
      orderNumber: currentOrder.orderNumber,
      status: newStatus,
      statusLabel: title,
      message: description,
      timestamp: 'الآن',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const stepOrder: OrderStatus[] = ['confirmed', 'baking', 'packaging', 'out_for_delivery', 'delivered'];

  const getStepIndex = (status: OrderStatus) => {
    return stepOrder.indexOf(status);
  };

  const getStepIcon = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed': return <PackageCheck className="w-5 h-5" />;
      case 'baking': return <ChefHat className="w-5 h-5" />;
      case 'packaging': return <Gift className="w-5 h-5" />;
      case 'out_for_delivery': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle2 className="w-5 h-5" />;
      default: return <PackageCheck className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return { label: 'تم تأكيد الطلب', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'baking':
        return { label: 'جاري الخبز والتحضير', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'packaging':
        return { label: 'مرحلة التغليف والشرائط', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'out_for_delivery':
        return { label: 'في الطريق مع التوصيل المبرد', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'delivered':
        return { label: 'تم التسليم بنجاح', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'قيد المعالجة', color: 'bg-gray-50 text-gray-800 border-gray-200' };
    }
  };

  const handleNextStatus = () => {
    if (!currentOrder) return;
    const currentIdx = getStepIndex(currentOrder.status);
    if (currentIdx < stepOrder.length - 1) {
      handleStatusChange(stepOrder[currentIdx + 1]);
    }
  };

  const AVAILABLE_RATING_TAGS = [
    'طازج ولذيذ جداً 🥐',
    'تغليف فاخر يشرّف 🎁',
    'التزام دقيق بالوقت ⏰',
    'كروت الإهداء روعة 🏷️',
    'الكميات وفيرة وممتلئة ✨',
    'السواريه هش ومتقن 🍰',
  ];

  const handleToggleRatingTag = (tag: string) => {
    setSelectedRatingTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    const trimmedComment = ratingComment.trim();
    if (trimmedComment.length < 3) {
      setRatingError('يرجى كتابة تقييم نصي قصير (3 أحرف على الأقل) يصف تجربتك مع النجوم.');
      return;
    }

    setRatingError(null);

    const newRating: OrderRating = {
      stars: ratingStars,
      packagingRating,
      qualityRating,
      deliveryRating,
      comment: trimmedComment.slice(0, MAX_REVIEW_CHARS),
      tags: selectedRatingTags,
      submittedAt: 'الآن',
    };

    if (onAddOrderRating) {
      onAddOrderRating(currentOrder.orderNumber, newRating);
    }

    setIsEditingRating(false);
    setRatingToast('شكراً جزيلاً لتقييمك النصي والنجوم! تم حفظ رأيك وعرضه بنجاح 💖');
    setTimeout(() => setRatingToast(null), 4500);
  };

  const getStarLabel = (stars: number) => {
    switch (stars) {
      case 5: return 'ممتاز جداً وفاق التوقعات! 🌟';
      case 4: return 'جيد جداً وضيافة مميزة 💖';
      case 3: return 'جيد ومقبول ✨';
      case 2: return 'يحتاج إلى تحسين';
      case 1: return 'غير راضٍ';
      default: return '';
    }
  };

  const handleCopyOrderInfo = () => {
    if (!currentOrder) return;
    const text = `تتبع طلبك #${currentOrder.orderNumber} من مشروع بهجة للضيافة والتوزيعات - الحالة الحالية: ${getStatusBadge(currentOrder.status).label}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <section id="tracker" className="py-12 lg:py-20 bg-[#FAF7F2] border-t border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Real-Time Notification Bell */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10 relative">
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#B46D52]">
              <Truck className="w-4 h-4" />
              <span>نظام تتبع الطلبات الحية (OrderTracker)</span>
            </div>

            {/* Notification Bell Badge Button */}
            <div className="relative inline-block text-right">
              <button
                onClick={() => setIsNotificationCenterOpen(prev => !prev)}
                className="relative inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#F5EBE1] text-[#2D2421] border border-[#D9CCC2] rounded-full text-xs font-bold transition-all shadow-2xs"
                title="تنبيهات حالة الطلب اللحظية"
              >
                {unreadNotificationsCount > 0 ? (
                  <BellRing className="w-4 h-4 text-[#B46D52] animate-bounce" />
                ) : (
                  <Bell className="w-4 h-4 text-[#7A6A63]" />
                )}
                <span>التنبيهات</span>
                {unreadNotificationsCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#B46D52] text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown Popover */}
              {isNotificationCenterOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#DECFC0] p-4 z-40 animate-in fade-in zoom-in-95 text-right space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F0E8E1] pb-2.5">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-[#B46D52]" />
                      <span className="font-bold text-xs text-[#2D2421]">تنبيهات الحالة اللحظية ({notifications.length})</span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-[#B46D52] hover:underline font-semibold"
                      >
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#8C7A72]">
                        لا توجد تنبيهات جديدة حالياً.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border text-xs transition-colors space-y-1 ${
                            n.isRead 
                              ? 'bg-[#FAF7F5] border-[#E8DFD8] text-[#6B5B55]' 
                              : 'bg-[#FFF8F3] border-[#EADACF] text-[#2D2421] ring-1 ring-[#B46D52]/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#B46D52] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#B46D52]"></span>
                              طلب #{n.orderNumber}
                            </span>
                            <span className="text-[10px] text-[#8C7A72] tabular-nums">{n.timestamp}</span>
                          </div>
                          <div className="font-semibold text-xs text-[#2D2421]">{n.statusLabel}</div>
                          <p className="text-[11px] text-[#5E4D46] leading-relaxed">{n.message}</p>
                          <div className="pt-1 flex justify-between items-center text-[10px]">
                            <button
                              onClick={() => {
                                setSearchQuery(n.orderNumber);
                                setIsNotificationCenterOpen(false);
                              }}
                              className="text-[#B46D52] hover:underline font-bold"
                            >
                              عرض هذا الطلب ←
                            </button>
                            <button
                              onClick={() => clearNotification(n.id)}
                              className="text-[#9C8B82] hover:text-rose-600"
                            >
                              حذف التنبيه
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2421] [text-wrap:balance]">
            تتبع حالة بوكسات وتوزيعات مناسبتك لحظة بلحظة
          </h2>
          <p className="text-base text-[#6B5B55] [text-wrap:balance]">
            أدخل رقم طلبك لمعرفة مرحلة الخَبز، التغليف الفاخر، وموعد وصول سيارة التوصيل المبردة إلى موقع مناسبتك بدقة، مع إمكانية استعراض صور محتويات الصندوق المخصص.
          </p>
        </div>

        {/* Search Bar & Quick Sample Orders */}
        <div className="max-w-2xl mx-auto mb-10 space-y-3">
          <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-[#E0D4CA] p-2 focus-within:border-[#B46D52] focus-within:ring-2 focus-within:ring-[#B46D52]/20 transition-all">
            <Search className="w-5 h-5 text-[#8C7A72] mr-3 ml-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="أدخل رقم الطلب (مثال: BAH-1042)..."
              className="w-full text-sm sm:text-base bg-transparent border-none outline-none text-[#2D2421] placeholder-[#A89890]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#8C7A72] hover:text-[#2D2421] px-2 py-1"
              >
                مسح
              </button>
            )}
          </div>

          {/* Quick Select Chips */}
          <div className="flex flex-wrap items-center gap-2 justify-center text-xs text-[#7D6B64]">
            <span className="font-semibold">طلبات للتجربة السريعة:</span>
            {orders.slice(0, 6).map(o => {
              const isDeliveredReadyToReview = o.status === 'delivered' && !o.rating;
              const isDeliveredRated = o.status === 'delivered' && !!o.rating;

              return (
                <button
                  key={o.orderNumber}
                  onClick={() => setSearchQuery(o.orderNumber)}
                  className={`px-3 py-1.5 rounded-lg border transition-all tabular-nums flex items-center gap-1.5 cursor-pointer ${
                    currentOrder?.orderNumber === o.orderNumber
                      ? 'bg-[#2D2421] text-white border-[#2D2421] font-bold shadow-xs'
                      : isDeliveredReadyToReview
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:border-amber-500 font-semibold'
                      : 'bg-white text-[#6B5B55] border-[#E8DFD8] hover:border-[#B46D52]'
                  }`}
                >
                  <span>#{o.orderNumber} ({o.customerName})</span>
                  {isDeliveredReadyToReview && (
                    <span className="text-[10px] bg-amber-400 text-[#2D2421] px-1.5 py-0.5 rounded font-black">
                      ⭐ قيّم عند الاستلام
                    </span>
                  )}
                  {isDeliveredRated && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      ★ {o.rating?.stars}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Instant Alert / Toast for Status Change */}
        {statusUpdatedToast && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-gradient-to-r from-emerald-50 via-[#FAF7F2] to-amber-50 border-2 border-emerald-300 text-emerald-950 rounded-2xl text-xs shadow-md animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <BellRing className="w-4 h-4 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#2D2421]">
                      تحديث لحظي لطلبك #{statusUpdatedToast.orderNumber}: {statusUpdatedToast.title}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      تنبيه نشط الآن
                    </span>
                  </div>
                  <p className="text-xs text-[#5E4D46] leading-relaxed">
                    {statusUpdatedToast.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStatusUpdatedToast(null)}
                className="text-[#8C7A72] hover:text-[#2D2421] p-1 rounded-lg"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Order Display */}
        {currentOrder ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Timeline & Live Status Stepper (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD8] shadow-sm space-y-8">
              
              {/* Order Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E8E1] pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#2D2421] tabular-nums">
                      طلب #{currentOrder.orderNumber}
                    </h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(currentOrder.status).color}`}>
                      {getStatusBadge(currentOrder.status).label}
                    </span>
                  </div>
                  <div className="text-xs text-[#7D6B64] mt-1 flex items-center gap-2">
                    <span>تاريخ الطلب: {currentOrder.createdAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>آخر تحديث: {currentOrder.lastUpdated}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyOrderInfo}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF7F5] hover:bg-[#F2EAE5] text-[#4F413B] text-xs font-semibold rounded-xl border border-[#E0D4CA] transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'مشاركة الطلب'}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Mini Order Route Map (خريطة تفاعلية مصغرة لمراحل الطلب) */}
              {(() => {
                const activeMapIdx = getMapStageIndex(currentOrder.status);
                const focusedMapIdx = inspectedMapStageIdx !== null ? inspectedMapStageIdx : activeMapIdx;
                const focusedStage = MINI_MAP_STAGES[focusedMapIdx];
                const routeProgressPercent = (activeMapIdx / (MINI_MAP_STAGES.length - 1)) * 100;

                const renderMapIcon = (iconType: string, isActive: boolean, isCompleted: boolean) => {
                  const cls = `w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`;
                  switch (iconType) {
                    case 'received':
                      return <PackageCheck className={cls} />;
                    case 'preparing':
                      return <ChefHat className={cls} />;
                    case 'delivering':
                      return <Truck className={cls} />;
                    case 'delivered':
                      return isCompleted || isActive ? <CheckCircle2 className={cls} /> : <Home className={cls} />;
                    default:
                      return <MapPin className={cls} />;
                  }
                };

                return (
                  <div className="bg-gradient-to-br from-[#FBF7F1] via-[#F6EEE3] to-[#FAF3EA] rounded-2xl border border-[#E5D5C8] p-4 sm:p-5 space-y-4 relative overflow-hidden">
                    {/* Decorative subtle map grid background */}
                    <svg
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <pattern id="bahjah-mini-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#D9C5B4" strokeWidth="0.8" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#bahjah-mini-grid)" />
                    </svg>

                    {/* Map Header */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#B46D52] text-white flex items-center justify-center shadow-2xs">
                          <Navigation className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-[#2D2421]">
                            خريطة مسار الطلب التفاعلية
                          </div>
                          <div className="text-[10px] text-[#7D6B64]">
                            اضغط على أي أيقونة لمعاينة تفاصيل المرحلة أو تحديث المسار
                          </div>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/90 text-[#2D2421] px-2.5 py-1 rounded-full border border-[#E5D5C8] shadow-2xs max-w-[230px] truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#B46D52] shrink-0" />
                        <span className="truncate">{currentOrder.deliveryAddress}</span>
                      </div>
                    </div>

                    {/* Interactive Route Line + 4 Stage Pins */}
                    <div className="relative z-10 pt-3 pb-2 px-2 sm:px-6">
                      {/* Background Track Line (Right to Left for RTL) */}
                      <div className="relative flex items-center justify-between">
                        {/* Inactive dashed road line */}
                        <div className="absolute top-6 right-7 left-7 h-1.5 bg-[#E3D4C6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-l from-emerald-500 via-[#B46D52] to-[#D97736] rounded-full transition-all duration-500"
                            style={{ width: `${routeProgressPercent}%`, marginRight: '0', marginLeft: 'auto' }}
                          />
                        </div>

                        {MINI_MAP_STAGES.map((stage) => {
                          const isCompleted = stage.idx < activeMapIdx;
                          const isCurrent = stage.idx === activeMapIdx;
                          const isInspected = stage.idx === focusedMapIdx;

                          return (
                            <button
                              key={stage.idx}
                              type="button"
                              onClick={() => setInspectedMapStageIdx(stage.idx)}
                              className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none w-1/4"
                              aria-label={`مرحلة ${stage.label}`}
                            >
                              {/* Floating "أنت هنا / الموقع الحالي" indicator */}
                              {isCurrent && (
                                <span className="absolute -top-5 px-2 py-0.5 rounded-full bg-[#B46D52] text-white text-[9px] font-black shadow-xs whitespace-nowrap animate-bounce">
                                  الموقع الآن
                                </span>
                              )}

                              {/* Pin Icon Circle */}
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 shadow-sm ${
                                  isCurrent
                                    ? 'bg-[#B46D52] text-white border-white ring-4 ring-[#B46D52]/30 scale-105'
                                    : isCompleted
                                    ? 'bg-emerald-600 text-white border-white shadow-xs'
                                    : 'bg-white text-[#9C8B82] border-[#DECFC0] group-hover:border-[#B46D52] group-hover:text-[#B46D52]'
                                } ${isInspected && !isCurrent ? 'ring-2 ring-[#2D2421]/30 scale-105' : ''}`}
                              >
                                {renderMapIcon(stage.icon, isCurrent, isCompleted)}
                              </div>

                              {/* Stage Title Label */}
                              <div className="text-center space-y-0.5">
                                <div
                                  className={`text-[11px] sm:text-xs font-extrabold transition-colors ${
                                    isCurrent
                                      ? 'text-[#B46D52]'
                                      : isCompleted
                                      ? 'text-emerald-800'
                                      : 'text-[#6B5B55]'
                                  }`}
                                >
                                  {stage.label}
                                </div>
                                <div className="hidden sm:block text-[9px] text-[#8C7A72]">
                                  {stage.locationLabel}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Selected Map Pin Detail Bar */}
                    <div className="relative z-10 bg-white/95 backdrop-blur-xs rounded-xl border border-[#E5D5C8] p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            focusedMapIdx === activeMapIdx
                              ? 'bg-[#FAF0EA] text-[#B46D52]'
                              : focusedMapIdx < activeMapIdx
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-[#F5F0EB] text-[#7D6B64]'
                          }`}
                        >
                          {renderMapIcon(focusedStage.icon, focusedMapIdx === activeMapIdx, focusedMapIdx < activeMapIdx)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#2D2421]">
                              {focusedStage.label} — {focusedStage.locationLabel}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                focusedMapIdx === activeMapIdx
                                  ? 'bg-[#FAF0EA] text-[#B46D52]'
                                  : focusedMapIdx < activeMapIdx
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {focusedMapIdx === activeMapIdx
                                ? 'المرحلة الحالية'
                                : focusedMapIdx < activeMapIdx
                                ? 'مكتملة ✓'
                                : 'قادمة'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5E4D46] leading-relaxed">
                            {focusedStage.detail}
                            {focusedMapIdx === 2 && currentOrder.driverName
                              ? ` (المندوب: ${currentOrder.driverName})`
                              : ''}
                          </p>
                        </div>
                      </div>

                      {focusedMapIdx !== activeMapIdx && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(focusedStage.targetStatus)}
                          className="px-3 py-1.5 bg-[#2D2421] hover:bg-[#B46D52] text-white text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
                        >
                          تفعيل «{focusedStage.label}»
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Progress Stepper */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#2D2421]">مراحل تجهيز وتسليم الضيافة:</span>
                  <span className="text-xs font-semibold text-[#B46D52]">
                    المرحلة {getStepIndex(currentOrder.status) + 1} من {stepOrder.length}
                  </span>
                </div>

                {/* Vertical Stepper with connected line + recorded stage timestamps */}
                <div className="relative space-y-6 pr-4 sm:pr-6 border-r-2 border-[#E8DFD8]">
                  {ORDER_TIMELINE_STEPS.map((step, idx) => {
                    const currentIdx = getStepIndex(currentOrder.status);
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const stageLogEntry = [...orderActivityLog]
                      .reverse()
                      .find(entry => entry.status === step.status);

                    return (
                      <div key={step.status} className="relative flex items-start gap-4">
                        
                        {/* Dot / Icon Node positioned on the right border */}
                        <div
                          className={`absolute -right-[25px] sm:-right-[33px] w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                            isCurrent
                              ? 'bg-[#B46D52] text-white ring-4 ring-[#FAF0EA]'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border-2 border-[#D9CCC2] text-[#A69389]'
                          }`}
                        >
                          {isCompleted ? <Check className="w-5 h-5" /> : getStepIcon(step.status as OrderStatus)}
                        </div>

                        {/* Step Description */}
                        <div className="mr-8 sm:mr-10 space-y-1 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className={`text-sm sm:text-base font-bold ${
                                isCurrent ? 'text-[#B46D52]' : isCompleted ? 'text-[#2D2421]' : 'text-[#8C7A72]'
                              }`}>
                                {step.label}
                              </h4>
                              {isCurrent && (
                                <span className="text-[11px] font-bold text-[#B46D52] bg-[#FAF0EA] px-2 py-0.5 rounded-md animate-pulse">
                                  المرحلة الحالية
                                </span>
                              )}
                            </div>

                            {stageLogEntry && (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#6B5B55] bg-[#FAF6F0] border border-[#E5D5C8] px-2 py-0.5 rounded-md tabular-nums">
                                <Clock className="w-3 h-3 text-[#B46D52]" />
                                <span>{stageLogEntry.timestamp}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B5B55] leading-relaxed max-w-lg">
                            {step.description}
                          </p>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Simulator Control (Requirement: تحديثها بناءً على رقم الطلب) */}
              <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#E8DFD8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D2421]">
                    <Sliders className="w-4 h-4 text-[#B46D52]" />
                    <span>لوحة تحكم وتحديث مرحلة الطلب (للمنسق والعميل):</span>
                  </div>
                  <span className="text-[11px] text-[#8C7A72]">تحديث فوري للحالة</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {ORDER_TIMELINE_STEPS.map(step => {
                    const isSelected = currentOrder.status === step.status;
                    return (
                      <button
                        key={step.status}
                        onClick={() => handleStatusChange(step.status as OrderStatus)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#B46D52] text-white shadow-xs'
                            : 'bg-white text-[#6B5B55] border border-[#D9CCC2] hover:border-[#B46D52]'
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}

                  {getStepIndex(currentOrder.status) < stepOrder.length - 1 && (
                    <div className="flex flex-wrap items-center gap-2 mr-auto">
                      <button
                        onClick={handleNextStatus}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D2421] hover:bg-[#433531] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <span>الانتقال للمرحلة التالية</span>
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleStatusChange('delivered');
                          setTimeout(() => {
                            reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 120);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>تأكيد الاستلام وكتابة تقييم</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Historical Activity Log (السجل التاريخي لتغييرات حالة الطلب) */}
              <div className="bg-[#FAF7F5] rounded-2xl border border-[#E5D5C8] p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAE0D7]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#2D2421] text-[#FFE8B3] flex items-center justify-center shadow-2xs">
                      <History className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-extrabold text-[#2D2421]">
                          السجل التاريخي لتغييرات الحالة (Activity Log)
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0EA] text-[#B46D52] border border-[#E6CFC2] tabular-nums">
                          {orderActivityLog.length} أحداث
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7D6B64]">
                        توثيق زمني كامل لكل انتقال في مراحل تجهيز وتوصيل الطلب #{currentOrder.orderNumber}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLogSortOrder(prev => (prev === 'newest' ? 'oldest' : 'newest'))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5ECE5] border border-[#DECFC0] text-[11px] font-bold text-[#2D2421] transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#B46D52]" />
                    <span>{logSortOrder === 'newest' ? 'الأحدث أولاً' : 'الأقدم أولاً'}</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pl-1">
                  {sortedActivityLog.map((entry) => {
                    const statusBadge = getStatusBadge(entry.status);
                    return (
                      <div
                        key={entry.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          entry.isLatest
                            ? 'bg-white border-[#B46D52]/50 ring-1 ring-[#B46D52]/15 shadow-2xs'
                            : 'bg-white/80 border-[#EAE0D7]'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${statusBadge.color}`}
                        >
                          {getStepIcon(entry.status)}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-black text-[#8C766B] tabular-nums">
                                #{entry.sequenceNumber}
                              </span>
                              <span className="text-xs font-extrabold text-[#2D2421]">
                                {entry.statusLabel}
                              </span>
                              {entry.isLatest && (
                                <span className="text-[10px] font-bold bg-[#B46D52] text-white px-2 py-0.5 rounded-full">
                                  آخر تغيير
                                </span>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F413B] bg-[#FAF6F0] border border-[#E5D5C8] px-2.5 py-0.5 rounded-md tabular-nums">
                              <Clock className="w-3 h-3 text-[#B46D52]" />
                              <span>{entry.timestamp}</span>
                            </span>
                          </div>

                          {entry.note && (
                            <p className="text-[11px] text-[#5E4D46] leading-relaxed">
                              {entry.note}
                            </p>
                          )}

                          {entry.actor && (
                            <div className="text-[10px] font-semibold text-[#8C7A72]">
                              بواسطة: {entry.actor}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#FBF8F5] rounded-xl border border-[#EDE4DC] space-y-2">
                  <div className="text-xs font-bold text-[#4F413B] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#B46D52]" />
                    <span>موقع التسليم والمناسبة:</span>
                  </div>
                  <p className="text-xs text-[#2D2421] font-medium leading-relaxed">
                    {currentOrder.deliveryAddress}
                  </p>
                  <div className="text-[11px] text-[#7D6B64] flex items-center gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-[#B46D52]" />
                    <span>موعد التسليم: {currentOrder.eventDate} ({currentOrder.eventTimeSlot})</span>
                  </div>
                </div>

                <div className="p-4 bg-[#FBF8F5] rounded-xl border border-[#EDE4DC] space-y-2">
                  <div className="text-xs font-bold text-[#4F413B] flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#B46D52]" />
                    <span>مندوب التوصيل المبرّد:</span>
                  </div>
                  <div className="text-xs text-[#2D2421] font-medium">
                    {currentOrder.driverName || 'كابتن محمود رضا'}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`https://wa.me/2${currentOrder.driverPhone || '01000000000'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب المندوب</span>
                    </a>
                    <a
                      href={`tel:${currentOrder.driverPhone || '01000000000'}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#D9CCC2] hover:bg-[#FAF7F5] text-[#2D2421] rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Toast for Rating Submission */}
              {ratingToast && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 animate-fade-in shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{ratingToast}</span>
                </div>
              )}

              {/* Customer Rating & Short Text Review Section (Active when status is 'delivered') */}
              {currentOrder.status === 'delivered' && (
                <div
                  ref={reviewSectionRef}
                  className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF5F0] to-[#FAF7F2] p-5 sm:p-6 rounded-2xl border-2 border-[#EADACF] shadow-sm space-y-5 animate-fade-in"
                >
                  {currentOrder.rating && !isEditingRating ? (
                    /* Submitted Review View */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                          </span>
                          <div>
                            <h4 className="text-sm font-extrabold text-[#2D2421]">
                              تقييم {currentOrder.customerName} بعد استلام الطلب
                            </h4>
                            <span className="text-[11px] text-[#7D6B64]">تم النشر: {currentOrder.rating.submittedAt}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setRatingStars(currentOrder.rating?.stars || 5);
                            setPackagingRating(currentOrder.rating?.packagingRating || 5);
                            setQualityRating(currentOrder.rating?.qualityRating || 5);
                            setDeliveryRating(currentOrder.rating?.deliveryRating || 5);
                            setRatingComment(currentOrder.rating?.comment || '');
                            setSelectedRatingTags(currentOrder.rating?.tags || []);
                            setRatingError(null);
                            setIsEditingRating(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D9CCC2] hover:border-[#B46D52] text-xs font-semibold text-[#2D2421] rounded-lg transition-colors shadow-2xs cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#B46D52]" />
                          <span>تعديل التقييم</span>
                        </button>
                      </div>

                      {/* Overall Stars + Short Text Review Card */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EADACF] shadow-2xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= (currentOrder.rating?.stars || 0)
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black text-[#2D2421] mr-1.5 tabular-nums">
                              {currentOrder.rating.stars} / 5
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#B46D52] bg-[#FAF0EA] px-2.5 py-1 rounded-full">
                            {getStarLabel(currentOrder.rating.stars)}
                          </span>
                        </div>

                        {currentOrder.rating.comment && (
                          <div className="relative p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EDE4DC] text-xs sm:text-sm text-[#2D2421] leading-relaxed font-medium flex items-start gap-2.5">
                            <Quote className="w-4 h-4 text-[#B46D52] shrink-0 mt-0.5 opacity-80" />
                            <p className="flex-1">"{currentOrder.rating.comment}"</p>
                          </div>
                        )}
                      </div>

                      {/* Detailed Aspect Ratings Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div className="p-3 bg-white rounded-xl border border-[#EDE4DC] space-y-1">
                          <span className="text-[11px] text-[#7D6B64] font-medium block">تجربة التغليف والشرائط:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-[#2D2421]">{currentOrder.rating.packagingRating || 5} / 5</span>
                            <span className="text-amber-500 text-xs">{'★'.repeat(currentOrder.rating.packagingRating || 5)}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-[#EDE4DC] space-y-1">
                          <span className="text-[11px] text-[#7D6B64] font-medium block">جودة المكونات والطزاجة:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-[#2D2421]">{currentOrder.rating.qualityRating || 5} / 5</span>
                            <span className="text-amber-500 text-xs">{'★'.repeat(currentOrder.rating.qualityRating || 5)}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-[#EDE4DC] space-y-1">
                          <span className="text-[11px] text-[#7D6B64] font-medium block">سرعة ودقة التوصيل المبرد:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-[#2D2421]">{currentOrder.rating.deliveryRating || 5} / 5</span>
                            <span className="text-amber-500 text-xs">{'★'.repeat(currentOrder.rating.deliveryRating || 5)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Selected Tags */}
                      {currentOrder.rating.tags && currentOrder.rating.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {currentOrder.rating.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-white border border-[#E3D6CD] rounded-md text-[11px] font-medium text-[#4F413B]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 font-medium">
                        ✓ تم تسجيل تقييمك بالنجوم والتعليق النصي بنجاح، شكراً لمشاركتنا تجربتك!
                      </div>
                    </div>
                  ) : (
                    /* Interactive Star & Short Text Review Form */
                    <form onSubmit={handleSubmitRating} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                            🎉
                          </span>
                          <div>
                            <h4 className="text-sm font-extrabold text-[#2D2421]">
                              تم تسليم الطلب! اكتب تقييمك القصير مع النجوم
                            </h4>
                            <p className="text-[11px] text-[#7D6B64]">
                              اختر عدد النجوم واكتب رأيك السريع في تجربة الضيافة والتوزيعات.
                            </p>
                          </div>
                        </div>

                        {isEditingRating && (
                          <button
                            type="button"
                            onClick={() => setIsEditingRating(false)}
                            className="text-xs text-[#8C7A72] hover:text-[#2D2421] cursor-pointer"
                          >
                            إلغاء التعديل
                          </button>
                        )}
                      </div>

                      {/* 1. Primary Star Rating + Short Text Review Block */}
                      <div className="p-4 rounded-2xl bg-white border border-[#E5D5C8] shadow-2xs space-y-4">
                        {/* Star Picker */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-xs font-extrabold text-[#2D2421]">
                              1. تقييمك بالنجوم:
                            </label>
                            <span className="text-xs font-bold text-[#B46D52] bg-[#FAF0EA] px-2.5 py-0.5 rounded-full">
                              {(ratingHover || ratingStars)} / 5 · {getStarLabel(ratingHover || ratingStars)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map(star => {
                              const isFilled = (ratingHover || ratingStars) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setRatingHover(star)}
                                  onMouseLeave={() => setRatingHover(0)}
                                  onClick={() => setRatingStars(star)}
                                  className="p-1.5 rounded-xl hover:bg-amber-50 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                                  aria-label={`تقييم ${star} نجوم`}
                                >
                                  <Star
                                    className={`w-7 h-7 transition-colors ${
                                      isFilled
                                        ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                                        : 'text-[#D9CCC2] hover:text-amber-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Short Text Review Textarea with Counter & Quick Suggestions */}
                        <div className="space-y-2 pt-2 border-t border-[#F3ECE6]">
                          <div className="flex items-center justify-between gap-2">
                            <label htmlFor="short-review-input" className="text-xs font-extrabold text-[#2D2421]">
                              2. تقييمك النصي القصير عند الاستلام:
                            </label>
                            <span
                              className={`text-[11px] font-bold tabular-nums ${
                                ratingComment.length >= MAX_REVIEW_CHARS - 20
                                  ? 'text-[#B85333]'
                                  : 'text-[#8C7A72]'
                              }`}
                            >
                              {ratingComment.length} / {MAX_REVIEW_CHARS} حرف
                            </span>
                          </div>

                          {/* One-tap quick review starter chips */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#8C7A72]">اقتراحات سريعة:</span>
                            {QUICK_REVIEW_SUGGESTIONS.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setRatingComment(suggestion.slice(0, MAX_REVIEW_CHARS));
                                  setRatingError(null);
                                }}
                                className="text-[10px] px-2.5 py-1 rounded-full bg-[#FAF7F2] hover:bg-[#F2E5DB] text-[#5E4D46] border border-[#E5D5C8] transition-colors cursor-pointer text-right"
                              >
                                + {suggestion.slice(0, 34)}...
                              </button>
                            ))}
                          </div>

                          <textarea
                            id="short-review-input"
                            rows={3}
                            maxLength={MAX_REVIEW_CHARS}
                            value={ratingComment}
                            onChange={(e) => {
                              setRatingComment(e.target.value);
                              if (e.target.value.trim().length >= 3) {
                                setRatingError(null);
                              }
                            }}
                            placeholder="اكتب تقييماً نصياً قصيراً عن رأيك في الطعم، التغليف، وموعد التسليم (مثال: البوكسات وصلت طازجة ومبهرة)..."
                            className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border bg-[#FCF9F6] focus:bg-white outline-none resize-none transition-all ${
                              ratingError
                                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                                : 'border-[#D9CCC2] focus:border-[#B46D52] focus:ring-2 focus:ring-[#B46D52]/20'
                            }`}
                          />

                          {ratingError && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{ratingError}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Optional Detailed Aspects Accordion Toggle */}
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setShowDetailedAspects(prev => !prev)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B5B55] hover:text-[#B46D52] cursor-pointer"
                        >
                          {showDetailedAspects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <span>{showDetailedAspects ? 'إخفاء التقييم التفصيلي والوسوم' : 'إضافة تقييم تفصيلي (التغليف، الجودة، التوصيل)'}</span>
                        </button>

                        {showDetailedAspects && (
                          <div className="space-y-4">
                            {/* Detailed Aspects: Packaging, Ingredients Quality, Delivery Speed */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Packaging Experience */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#EDE4DC] space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                                    <span>🎁</span>
                                    <span>تجربة التغليف</span>
                                  </span>
                                  <span className="text-xs font-extrabold text-[#B46D52] tabular-nums">
                                    {packagingHover || packagingRating} / 5
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#7D6B64] leading-tight">
                                  جمال العلبة، إحكام الغلق، والشرائط وكارت الإهداء
                                </p>
                                <div className="flex items-center gap-0.5 pt-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      onMouseEnter={() => setPackagingHover(star)}
                                      onMouseLeave={() => setPackagingHover(0)}
                                      onClick={() => setPackagingRating(star)}
                                      className="p-0.5 focus:outline-none cursor-pointer"
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          (packagingHover || packagingRating) >= star
                                            ? 'fill-amber-400 text-amber-500'
                                            : 'text-[#D9CCC2]'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Ingredients Quality & Freshness */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#EDE4DC] space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                                    <span>🥐</span>
                                    <span>جودة المكونات</span>
                                  </span>
                                  <span className="text-xs font-extrabold text-[#B46D52] tabular-nums">
                                    {qualityHover || qualityRating} / 5
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#7D6B64] leading-tight">
                                  طزاجة المخبوزات، الزبدة الفرنسية، ونقاء الشوكولاتة
                                </p>
                                <div className="flex items-center gap-0.5 pt-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      onMouseEnter={() => setQualityHover(star)}
                                      onMouseLeave={() => setQualityHover(0)}
                                      onClick={() => setQualityRating(star)}
                                      className="p-0.5 focus:outline-none cursor-pointer"
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          (qualityHover || qualityRating) >= star
                                            ? 'fill-amber-400 text-amber-500'
                                            : 'text-[#D9CCC2]'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Delivery Speed & Temperature */}
                              <div className="p-3.5 rounded-xl bg-white border border-[#EDE4DC] space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                                    <span>🚚</span>
                                    <span>سرعة التوصيل</span>
                                  </span>
                                  <span className="text-xs font-extrabold text-[#B46D52] tabular-nums">
                                    {deliveryHover || deliveryRating} / 5
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#7D6B64] leading-tight">
                                  دقة الوصول بموعد الحفل وبرودة السيارة والحفظ
                                </p>
                                <div className="flex items-center gap-0.5 pt-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      onMouseEnter={() => setDeliveryHover(star)}
                                      onMouseLeave={() => setDeliveryHover(0)}
                                      onClick={() => setDeliveryRating(star)}
                                      className="p-0.5 focus:outline-none cursor-pointer"
                                    >
                                      <Star
                                        className={`w-4 h-4 ${
                                          (deliveryHover || deliveryRating) >= star
                                            ? 'fill-amber-400 text-amber-500'
                                            : 'text-[#D9CCC2]'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Quick Appreciation Tags */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-[#4F413B] block">
                                أبرز مزايا الضيافة التي نالت إعجابك:
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {AVAILABLE_RATING_TAGS.map(tag => {
                                  const isSelected = selectedRatingTags.includes(tag);
                                  return (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={() => handleToggleRatingTag(tag)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#B46D52] text-white shadow-xs font-semibold'
                                          : 'bg-white text-[#6B5B55] border border-[#D9CCC2] hover:border-[#B46D52]'
                                      }`}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#EADACF]">
                        <button
                          type="submit"
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#B46D52] hover:bg-[#9B5A42] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>نشر التقييم والنجوم</span>
                        </button>
                        <span className="text-[11px] text-[#8C7A72]">يظهر تقييمك مباشرة في سجل آراء عملاء بهجة</span>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>

            {/* Order Items & Receipt Summary (4 cols) with Images & Custom Box Inspection */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#E3D6CD] shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0E8E1] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-[#2D2421]">تفاصيل أصناف الطلب</span>
                  <span className="text-[11px] text-[#82726B] font-bold tabular-nums">
                    ({currentOrder.items.length})
                  </span>
                </div>

                {/* Toggle Images Option Button */}
                <button
                  type="button"
                  onClick={() => setShowItemImages(prev => !prev)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#D9CCC2] bg-[#FAF7F5] hover:bg-[#F2EAE5] text-[#2D2421] transition-colors"
                  title="إظهار أو إخفاء صور المنتجات للتحقق من المحتويات"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#B46D52]" />
                  <span>{showItemImages ? 'إخفاء الصور' : 'عرض الصور'}</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {currentOrder.items.map(item => {
                  const isCustomBox = item.type === 'custom_box' || !!item.customBoxConfig;

                  return (
                    <div
                      key={item.cartItemId}
                      className="p-3 bg-[#FAF7F5] rounded-xl border border-[#E8DFD8] space-y-2 hover:border-[#D1C3B9] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Optional Product Image Preview Thumbnail */}
                        {showItemImages && (
                          <div 
                            onClick={() => setInspectedItem(item)}
                            className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F0EBE6] shrink-0 border border-[#DECFC0] cursor-pointer group shadow-2xs"
                            title="اضغط لتكبير الصورة ومعاينة محتويات الصندوق"
                          >
                            <img
                              src={item.image || IMAGES.favors}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                            {isCustomBox && (
                              <span className="absolute bottom-0 inset-x-0 bg-[#B46D52]/90 text-white text-[8px] font-bold py-0.5 text-center leading-none">
                                مخصص
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-xs font-bold text-[#2D2421] leading-snug line-clamp-2">
                              {item.title}
                            </h5>
                            <span className="text-xs font-extrabold text-[#B46D52] tabular-nums whitespace-nowrap shrink-0">
                              {item.price * item.quantity} ج.م
                            </span>
                          </div>

                          <div className="text-[11px] text-[#7D6B64] flex items-center gap-2 mt-1">
                            <span>الكمية: {item.quantity} بوكس</span>
                            {item.piecesCount && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>({item.piecesCount} قطعة)</span>
                              </>
                            )}
                          </div>

                          {/* Quick action to inspect custom box contents with photos */}
                          <button
                            type="button"
                            onClick={() => setInspectedItem(item)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#B46D52] hover:text-[#9B5A42] hover:underline cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>
                              {isCustomBox ? 'تأكيد ومطابقة محتويات الصندوق المخصص بالصور' : 'معاينة صورة الصندوق والتفاصيل'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Details summary */}
                      {item.details && item.details.length > 0 && (
                        <div className="text-[10px] text-[#8C7A72] pt-1.5 space-y-0.5 border-t border-[#F0E8E1] max-h-24 overflow-y-auto">
                          {item.details.map((d, i) => (
                            <div key={i} className="truncate">· {d}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Customer Notes */}
              {currentOrder.notes && (
                <div className="p-3 bg-[#FFFDFB] rounded-xl border border-[#F0E8E1] text-xs space-y-1">
                  <span className="font-bold text-[#4F413B] block">ملاحظات العميل:</span>
                  <p className="text-[#6B5B55] italic leading-relaxed">
                    "{currentOrder.notes}"
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-[#F0E8E1] text-xs text-[#6B5B55]">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold tabular-nums text-[#2D2421]">{currentOrder.subtotal} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>التوصيل المبرد:</span>
                  <span className="font-bold tabular-nums">
                    {currentOrder.deliveryFee === 0 ? <span className="text-emerald-700">مجاني</span> : `${currentOrder.deliveryFee} ج.م`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#2D2421] pt-1.5 border-t border-[#E8DFD8]">
                  <span>المجموع الإجمالي:</span>
                  <span className="text-base text-[#B46D52] tabular-nums">{currentOrder.grandTotal} ج.م</span>
                </div>
              </div>

              {/* Help Button */}
              <a
                href={`https://wa.me/201000000000?text=${encodeURIComponent(`مرحباً، أستفسر عن طلبي رقم #${currentOrder.orderNumber}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2D2421] hover:bg-[#433531] text-white font-bold rounded-xl text-xs shadow-xs transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>محادثة خدمة عملاء بهجة للمناسبات</span>
              </a>

            </div>

          </div>
        ) : (
          /* Empty / Not Found State */
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-[#E8DFD8] text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#FAF0EA] text-[#B46D52] mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#2D2421]">لم يتم العثور على طلب برقم «{searchQuery}»</h3>
            <p className="text-xs text-[#7D6B64] leading-relaxed">
              يرجى التأكد من كتابة رقم الطلب بصورة صحيحة مثل <strong className="font-mono text-[#2D2421]">BAH-1042</strong> أو اختيار أحد الطلبات التجريبية الجاهزة أعلاه.
            </p>
            {onExploreMenu && (
              <button
                onClick={onExploreMenu}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B46D52] hover:bg-[#9B5A42] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <span>العودة لقائمة التوزيعات والبوكسات</span>
              </button>
            )}
          </div>
        )}

        {/* Delivered Orders Verified Customer Reviews Showcase */}
        {recentDeliveredReviews.length > 0 && (
          <div className="max-w-5xl mx-auto mt-10 bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DFD8] shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0E8E1] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#2D2421]">
                    تقييمات عملائنا عند استلام الطلبات
                  </h3>
                  <p className="text-[11px] text-[#7D6B64]">
                    آراء حقيقية بالنجوم والتعليقات النصية القصيرة بعد تسليم الضيافة
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#B46D52] bg-[#FAF0EA] px-3 py-1 rounded-full">
                {recentDeliveredReviews.length} {recentDeliveredReviews.length === 1 ? 'تقييم موثق' : 'تقييمات موثقة'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentDeliveredReviews.map(order => (
                <div
                  key={order.orderNumber}
                  onClick={() => setSearchQuery(order.orderNumber)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    currentOrder?.orderNumber === order.orderNumber
                      ? 'bg-[#FFF9F4] border-[#B46D52] shadow-xs'
                      : 'bg-[#FAF7F5] border-[#E8DFD8] hover:border-[#D9C3B4]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-[#2D2421]">{order.customerName}</div>
                      <div className="text-[10px] text-[#8C7A72] tabular-nums">
                        طلب #{order.orderNumber} · {order.rating?.submittedAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 bg-white px-2.5 py-1 rounded-full border border-[#EDE4DC]">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (order.rating?.stars || 0)
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {order.rating?.comment && (
                    <p className="text-xs text-[#4F413B] leading-relaxed bg-white p-3 rounded-xl border border-[#EDE4DC]">
                      "{order.rating.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Inspection & Custom Box Verification Modal */}
        {inspectedItem && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setInspectedItem(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8DFD8] shadow-2xl relative text-right"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setInspectedItem(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#2D2421] z-20 shadow-sm border border-[#E0D4CA]"
                aria-label="إغلاق المعاينة"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Main Product Header Image */}
              <div className="relative aspect-[16/9] bg-[#F5ECE1] overflow-hidden">
                <img
                  src={inspectedItem.image || IMAGES.favors}
                  alt={inspectedItem.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 right-4 left-4 text-white">
                  <div className="inline-block text-[11px] font-bold bg-[#B46D52] px-2.5 py-1 rounded-md mb-1.5 shadow-sm">
                    {inspectedItem.type === 'custom_box' ? 'صندوق ضيافة مخصص 🎁' : 'صندوق ضيافة معتمد ✨'}
                  </div>
                  <h4 className="text-lg sm:text-xl font-black">{inspectedItem.title}</h4>
                  <div className="text-xs text-white/90 mt-0.5">
                    الكمية: {inspectedItem.quantity} بوكس · السعر: {inspectedItem.price * inspectedItem.quantity} ج.م
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* Custom Box Verification Block */}
                {inspectedItem.customBoxConfig ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F0E8E1] pb-2">
                      <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-[#B46D52]" />
                        <h5 className="font-extrabold text-sm sm:text-base text-[#2D2421]">
                          تأكيد ومطابقة محتويات الصندوق المخصص
                        </h5>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        مطابق للمواصفات
                      </span>
                    </div>

                    {/* Occasion & Ribbon & Card Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#E8DFD8]">
                        <span className="text-[10px] text-[#8C7A72] block">ثيم المناسبة:</span>
                        <span className="text-xs font-bold text-[#2D2421]">
                          {OCCASIONS_LIST.find(o => o.id === inspectedItem.customBoxConfig?.occasion)?.label || inspectedItem.customBoxConfig?.occasion}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#E8DFD8]">
                        <span className="text-[10px] text-[#8C7A72] block">لون الشريط المعتمد:</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                            style={{ 
                              backgroundColor: inspectedItem.customBoxConfig?.ribbonColor || '#D4AF37'
                            }}
                          ></span>
                          <span className="text-xs font-bold text-[#2D2421]">
                            {inspectedItem.customBoxConfig?.ribbonColorName || 'شريط ستان فاخر'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#E8DFD8]">
                        <span className="text-[10px] text-[#8C7A72] block">سعة الصندوق:</span>
                        <span className="text-xs font-bold text-[#B46D52]">
                          {inspectedItem.piecesCount || inspectedItem.customBoxConfig?.maxPieces || 24} قطعة طازجة
                        </span>
                      </div>
                    </div>

                    {/* Card Message Preview Tag */}
                    {(inspectedItem.customBoxConfig.recipientName || inspectedItem.customBoxConfig.cardMessage) && (
                      <div className="p-4 rounded-xl bg-[#FFFDFB] border border-dashed border-[#D4C3B7] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#4F413B]">
                          <span>🏷️ كارت الإهداء والتهنئة المطبوع مجاناً:</span>
                        </div>
                        {inspectedItem.customBoxConfig.recipientName && (
                          <div className="text-xs font-extrabold text-[#B46D52]">
                            {inspectedItem.customBoxConfig.recipientName}
                          </div>
                        )}
                        {inspectedItem.customBoxConfig.cardMessage && (
                          <div className="text-xs text-[#5E4D46] italic">
                            "{inspectedItem.customBoxConfig.cardMessage}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Visual Breakdown of Fillings with Photos */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h6 className="text-xs font-bold text-[#2D2421] flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#B46D52]" />
                          <span>قطع الساندوتش والجاتوهات داخل الصندوق (بالصور والأعداد):</span>
                        </h6>
                        <span className="text-[11px] text-[#8C7A72]">اضغط على الصنف لتكبير الصورة</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {inspectedItem.customBoxConfig.selectedFillings && Object.keys(inspectedItem.customBoxConfig.selectedFillings).length > 0 ? (
                          Object.entries(inspectedItem.customBoxConfig.selectedFillings).map(([fillingId, qty]) => {
                            if (qty <= 0) return null;
                            const fillingData = BOX_FILLINGS.find(b => b.id === fillingId);
                            if (!fillingData) return null;
                            const fillingImage = fillingData.category === 'savory' ? IMAGES.savory : IMAGES.gateaux;

                            return (
                              <div
                                key={fillingId}
                                onClick={() => setPreviewingFillingImage({
                                  name: fillingData.name,
                                  image: fillingImage,
                                  desc: fillingData.description,
                                  qty: qty
                                })}
                                className="p-2.5 rounded-xl border border-[#E8DFD8] bg-[#FAF7F5] hover:bg-[#F2ECE5] flex items-center gap-3 transition-colors cursor-pointer group"
                              >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F0EBE6] shrink-0 border border-[#DECFC0]">
                                  <img
                                    src={fillingImage}
                                    alt={fillingData.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-[#2D2421] truncate">
                                    {fillingData.name}
                                  </div>
                                  <div className="text-[10px] text-[#7D6B64] truncate">
                                    {fillingData.type} · {fillingData.description}
                                  </div>
                                </div>
                                <span className="font-extrabold text-xs text-[#B46D52] bg-white px-2 py-1 rounded-md border border-[#E8DFD8] tabular-nums shrink-0">
                                  {qty}x
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          // Fallback parsing from details array
                          inspectedItem.details?.filter(d => /^\d+x/.test(d)).map((d, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl border border-[#E8DFD8] bg-[#FAF7F5] flex items-center justify-between text-xs font-medium text-[#2D2421]"
                            >
                              <span>{d}</span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                                معتمد
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard / Catalog Item Inspection */
                  <div className="space-y-4">
                    <div className="border-b border-[#F0E8E1] pb-2">
                      <h5 className="font-extrabold text-sm text-[#2D2421]">محتويات الصندوق ومواصفاته</h5>
                    </div>

                    <div className="space-y-2">
                      {inspectedItem.details && inspectedItem.details.map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#5E4D46]">
                          <Check className="w-3.5 h-3.5 text-[#B46D52] shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Confirmation Notice */}
                <div className="pt-4 border-t border-[#F0E8E1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A6A63]">
                  <span>✨ تحضير طازج ومطابق بالكامل لاختياراتك المعتمدة.</span>
                  <button
                    onClick={() => setInspectedItem(null)}
                    className="px-5 py-2 bg-[#2D2421] hover:bg-[#433531] text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    تم التأكيد والاطلاع
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* High-Resolution Individual Item Photo Zoom Modal */}
        {previewingFillingImage && (
          <div
            className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setPreviewingFillingImage(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-[#DECFC0] shadow-2xl relative text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewingFillingImage(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#2D2421] z-10 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="aspect-[4/3] bg-[#F5ECE1] overflow-hidden">
                <img
                  src={previewingFillingImage.image}
                  alt={previewingFillingImage.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-[#2D2421]">
                    {previewingFillingImage.name}
                  </h4>
                  {previewingFillingImage.qty && (
                    <span className="text-xs font-bold text-[#B46D52] bg-[#FAF0EA] px-2 py-0.5 rounded-md tabular-nums">
                      العدد في الصندوق: {previewingFillingImage.qty} قطع
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B5B55] leading-relaxed">
                  {previewingFillingImage.desc}
                </p>
                <div className="pt-2 text-[11px] text-[#8C7A72] border-t border-[#F0E8E1]">
                  مخبوز ومحضّر طازج صباح يوم المناسبة بزبدة طبيعية ومكونات فاخرة.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
