import React from 'react';
import {
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Info,
  Gift,
  X
} from 'lucide-react';

export type ToastVariant = 'cart' | 'order_status' | 'payment' | 'gift_card' | 'error' | 'info';

export interface AppToast {
  id: string;
  variant: ToastVariant;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContainerProps {
  toasts: AppToast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const getVariantStyles = (variant: ToastVariant) => {
    switch (variant) {
      case 'cart':
        return {
          wrapper: 'bg-white border-[#DECFC0] ring-1 ring-[#B85333]/20',
          iconWrap: 'bg-[#FAF0EA] text-[#B85333] border border-[#E6CFC2]',
          badge: 'السلة',
          badgeClass: 'bg-[#FAF0EA] text-[#B85333]',
          actionClass: 'bg-[#231815] hover:bg-[#B85333] text-white',
          icon: <ShoppingBag className="w-4 h-4" />,
        };
      case 'order_status':
        return {
          wrapper: 'bg-white border-amber-200 ring-1 ring-amber-400/20',
          iconWrap: 'bg-amber-50 text-amber-700 border border-amber-200',
          badge: 'تحديث الطلب',
          badgeClass: 'bg-amber-100 text-amber-800',
          actionClass: 'bg-amber-700 hover:bg-amber-800 text-white',
          icon: <Truck className="w-4 h-4" />,
        };
      case 'payment':
        return {
          wrapper: 'bg-white border-emerald-200 ring-1 ring-emerald-500/25',
          iconWrap: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
          badge: 'نجاح الدفع',
          badgeClass: 'bg-emerald-100 text-emerald-800',
          actionClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: <CreditCard className="w-4 h-4" />,
        };
      case 'gift_card':
        return {
          wrapper: 'bg-white border-amber-300 ring-1 ring-amber-400/25',
          iconWrap: 'bg-amber-50 text-amber-800 border border-amber-200',
          badge: 'بطاقة هدايا',
          badgeClass: 'bg-amber-100 text-amber-900',
          actionClass: 'bg-[#231815] hover:bg-[#B85333] text-white',
          icon: <Gift className="w-4 h-4" />,
        };
      case 'error':
        return {
          wrapper: 'bg-white border-rose-200 ring-1 ring-rose-500/20',
          iconWrap: 'bg-rose-50 text-rose-600 border border-rose-200',
          badge: 'تنبيه',
          badgeClass: 'bg-rose-100 text-rose-700',
          actionClass: 'bg-rose-600 hover:bg-rose-700 text-white',
          icon: <AlertCircle className="w-4 h-4" />,
        };
      default:
        return {
          wrapper: 'bg-white border-[#DECFC0]',
          iconWrap: 'bg-[#FAF6F0] text-[#231815] border border-[#E5D5C8]',
          badge: 'إشعار',
          badgeClass: 'bg-[#FAF6F0] text-[#66544D]',
          actionClass: 'bg-[#231815] hover:bg-[#3D2C27] text-white',
          icon: <Info className="w-4 h-4" />,
        };
    }
  };

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:w-96 z-[80] flex flex-col gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const style = getVariantStyles(toast.variant);
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-2xl border p-3.5 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 text-right ${style.wrapper}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${style.iconWrap}`}
              >
                {toast.variant === 'payment' ? (
                  <CheckCircle2 className="w-4.5 h-4.5" />
                ) : (
                  style.icon
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-extrabold text-[#231815] truncate">
                      {toast.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${style.badgeClass}`}
                    >
                      {style.badge}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="p-1 text-[#9C8B82] hover:text-[#231815] rounded-lg transition-colors cursor-pointer shrink-0"
                    aria-label="إغلاق الإشعار"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] sm:text-xs text-[#5E4D46] leading-relaxed line-clamp-2">
                  {toast.message}
                </p>

                {toast.actionLabel && toast.onAction && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        toast.onAction?.();
                        onDismiss(toast.id);
                      }}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${style.actionClass}`}
                    >
                      {toast.actionLabel}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
