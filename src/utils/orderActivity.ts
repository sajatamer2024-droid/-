import { OrderActivityLogEntry, OrderStatus, TrackedOrder } from '../types/catering';

export function formatActivityTimestamp(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'confirmed':
      return 'تم تأكيد واستلام الطلب';
    case 'baking':
      return 'جاري الخَبز والتحضير الطازج';
    case 'packaging':
      return 'التغليف الفاخر وربط الشرائط';
    case 'out_for_delivery':
      return 'في الطريق مع التوصيل المبرّد';
    case 'delivered':
      return 'تم التسليم في موقع الحفل بنجاح';
    default:
      return 'تحديث حالة الطلب';
  }
}

export function getOrderStatusActor(status: OrderStatus): string {
  switch (status) {
    case 'confirmed':
      return 'استقبال طلبات بهجة';
    case 'baking':
      return 'فريق المطبخ والأفران';
    case 'packaging':
      return 'قسم التغليف والتنسيق';
    case 'out_for_delivery':
      return 'كابتن التوصيل المبرّد';
    case 'delivered':
      return 'تأكيد التسليم للعميل';
    default:
      return 'منسق الطلبات';
  }
}

export function getOrderStatusDefaultNote(status: OrderStatus): string {
  switch (status) {
    case 'confirmed':
      return 'تم استلام وتأكيد الطلب ومراجعة تفاصيل الصناديق وكروت الإهداء.';
    case 'baking':
      return 'بدء خبز المخبوزات الطازجة وتجهيز الجاتوهات بالزبدة الطبيعية.';
    case 'packaging':
      return 'تنسيق البوكسات وربط شرائط الساتان وطباعة كروت المناسبة.';
    case 'out_for_delivery':
      return 'خرج الطلب في سيارة توصيل مبردة متجهاً إلى موقع المناسبة.';
    case 'delivered':
      return 'تم تسليم الطلب بنجاح في موقع المناسبة بحالة مثالية.';
    default:
      return 'تم تحديث مرحلة الطلب.';
  }
}

export function createActivityLogEntry(
  status: OrderStatus,
  note?: string,
  timestamp?: string
): OrderActivityLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status,
    statusLabel: getOrderStatusLabel(status),
    timestamp: timestamp || formatActivityTimestamp(),
    note: note || getOrderStatusDefaultNote(status),
    actor: getOrderStatusActor(status),
  };
}

export function ensureOrderActivityLog(order: TrackedOrder): OrderActivityLogEntry[] {
  if (order.activityLog && order.activityLog.length > 0) {
    return order.activityLog;
  }

  const entries: OrderActivityLogEntry[] = [
    {
      id: `fallback-${order.orderNumber}-confirmed`,
      status: 'confirmed',
      statusLabel: getOrderStatusLabel('confirmed'),
      timestamp: order.createdAt || 'مسجّل',
      note: getOrderStatusDefaultNote('confirmed'),
      actor: getOrderStatusActor('confirmed'),
    },
  ];

  if (order.status !== 'confirmed') {
    entries.push({
      id: `fallback-${order.orderNumber}-${order.status}`,
      status: order.status,
      statusLabel: getOrderStatusLabel(order.status),
      timestamp: order.lastUpdated || 'محدّث',
      note: getOrderStatusDefaultNote(order.status),
      actor: getOrderStatusActor(order.status),
    });
  }

  return entries;
}
