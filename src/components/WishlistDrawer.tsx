import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { CateringProduct, CartItem } from '../types/catering';
import { getProductPricing } from '../utils/productPricing';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: CateringProduct[];
  onRemoveFromWishlist: (productId: string) => void;
  onClearWishlist: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  onExploreCatalog: () => void;
  onOpenGiftCardModal?: (product: CateringProduct) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onClearWishlist,
  onAddToCart,
  onExploreCatalog,
  onOpenGiftCardModal,
}) => {
  if (!isOpen) return null;

  const handleMoveToCart = (product: CateringProduct) => {
    if ((product.isGiftCard || product.category === 'gift_cards') && onOpenGiftCardModal) {
      onClose();
      onOpenGiftCardModal(product);
      return;
    }
    const pricing = getProductPricing(product);
    const details = [
      `الكمية: ${product.piecesCount} قطعة`,
      `تكفي: ${product.servesPeople}`,
    ];
    if (pricing.hasDiscount) {
      details.push(`عرض أسبوعي: خصم ${pricing.discountPercent}% (بدلاً من ${pricing.originalPrice} ج.م)`);
    }

    const cartItem: CartItem = {
      cartItemId: `catalog-${product.id}-${Date.now()}`,
      type: 'catalog',
      title: pricing.hasDiscount ? `${product.title} (عرض أسبوعي -${pricing.discountPercent}%)` : product.title,
      price: pricing.finalPrice,
      quantity: 1,
      image: product.image,
      piecesCount: product.piecesCount,
      details,
    };
    onAddToCart(cartItem);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-r border-[#E8DFD8]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8DFD8] flex items-center justify-between bg-[#FAF7F5]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#2D2421]">قائمة الأمنيات</h3>
                <span className="text-xs text-[#7D6B64] tabular-nums">
                  {wishlistProducts.length} منتجات محفوظة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {wishlistProducts.length > 0 && (
                <button
                  onClick={onClearWishlist}
                  className="text-xs font-semibold text-[#8C7A72] hover:text-rose-600 px-2 py-1 transition-colors cursor-pointer"
                >
                  مسح الكل
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-[#D9CCC2] hover:bg-[#F2ECE5] flex items-center justify-center text-[#2D2421] transition-colors cursor-pointer"
                aria-label="إغلاق قائمة الأمنيات"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400">
                  <Heart className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-[#2D2421]">قائمة الأمنيات فارغة</h4>
                  <p className="text-xs text-[#7D6B64] max-w-xs leading-relaxed">
                    اضغط على رمز القلب ❤️ في أي بوكس من قائمة المنتجات لحفظه والعودة إليه في أي وقت لاحقاً.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onExploreCatalog();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B46D52] hover:bg-[#9B5A42] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <span>استعراض بوكسات الضيافة</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {wishlistProducts.map(product => {
                  const pricing = getProductPricing(product);
                  return (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-2xl border border-[#E8DFD8] bg-[#FAF7F5] flex flex-col gap-3 group hover:border-[#D4C3B7] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F0EBE6] shrink-0 border border-[#DECFC0] shadow-2xs relative">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {pricing.hasDiscount && (
                          <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            خصم {pricing.discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[#2D2421] leading-snug line-clamp-2">
                            {product.title}
                          </h4>
                          <button
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="text-[#9C8B82] hover:text-rose-600 p-1 shrink-0 transition-colors cursor-pointer"
                            title="إزالة من قائمة الأمنيات"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-[11px] text-[#7D6B64] flex items-center gap-1.5">
                          <span>{product.piecesCount} قطعة</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">تكفي {product.servesPeople}</span>
                        </div>

                        <div className="flex items-baseline gap-2 pt-0.5 tabular-nums">
                          <span className={`text-xs sm:text-sm font-black ${pricing.hasDiscount ? 'text-rose-600' : 'text-[#B46D52]'}`}>
                            {pricing.finalPrice} ج.م
                          </span>
                          {pricing.hasDiscount && (
                            <span className="text-[11px] text-[#8C766B] line-through">
                              {pricing.originalPrice} ج.م
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action: Add to Cart */}
                    <div className="pt-2 border-t border-[#EDE4DC] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>متاح للطلب المباشر</span>
                      </span>

                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D2421] hover:bg-[#B46D52] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>
                          {product.isGiftCard || product.category === 'gift_cards'
                            ? 'تخصيص وإرسال'
                            : 'إضافة للسلة'}
                        </span>
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlistProducts.length > 0 && (
            <div className="p-4 border-t border-[#E8DFD8] bg-[#FAF7F5] space-y-2">
              <button
                onClick={() => {
                  wishlistProducts.forEach(product => handleMoveToCart(product));
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#B46D52] hover:bg-[#9B5A42] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>إضافة جميع العناصر المفضلة للسلة ({wishlistProducts.length})</span>
              </button>
              <p className="text-[11px] text-center text-[#8C7A72]">
                يتم حفظ قائمتك تلقائياً في جهازك لتعود إليها في أي وقت.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
