import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Eye,
  X,
  Check,
  Sparkles,
  Heart,
  Settings,
  Tag,
  Percent,
  Flame,
  Scale,
  Trash2,
  Gift
} from 'lucide-react';
import { CATERING_PRODUCTS } from '../data/cateringData';
import { CateringProduct, CartItem } from '../types/catering';
import { getProductPricing } from '../utils/productPricing';

const CATEGORY_LABELS: Record<CateringProduct['category'], string> = {
  solo: 'بوكس فردي متكامل لكل ضيف',
  sandwiches: 'ميني ساندوتشات وموالح',
  gateaux: 'جاتوهات وسواريه فرنسية',
  favors: 'علب توزيعات فردية',
  bundles: 'بكج حفلات وضيافة متكامل',
  gift_cards: 'بطاقة هدايا رقمية (E-Gift Card)',
};

const MAX_COMPARE_ITEMS = 4;

interface ProductCatalogProps {
  products?: CateringProduct[];
  onAddToCart: (cartItem: CartItem) => void;
  onUpdateProduct?: (updatedProduct: CateringProduct) => void;
  wishlistProductIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  onOpenWishlist?: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenGiftCardModal?: (product?: CateringProduct) => void;
}

const DISCOUNT_PRESETS = [10, 15, 20, 25];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  products = CATERING_PRODUCTS,
  onAddToCart,
  onUpdateProduct,
  wishlistProductIds = [],
  onToggleWishlist,
  onOpenWishlist,
  onOpenAdminDashboard,
  onOpenGiftCardModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<CateringProduct | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAdminDealsMode, setIsAdminDealsMode] = useState<boolean>(false);
  const [compareProductIds, setCompareProductIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const comparedProducts = useMemo(() => {
    return compareProductIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is CateringProduct => Boolean(p));
  }, [compareProductIds, products]);

  const weeklyDealsProducts = useMemo(() => {
    return products.filter(p => getProductPricing(p).hasDiscount);
  }, [products]);

  const categories = [
    { id: 'all', label: 'جميع البوكسات' },
    { id: 'weekly_deals', label: `العروض الأسبوعية 🔥 (${weeklyDealsProducts.length})` },
    { id: 'gift_cards', label: 'بطاقات الهدايا الرقمية 🎁' },
    { id: 'solo', label: 'بوكسات شخص واحد (ساندوتشين + جاتوه + عصير) ⭐' },
    { id: 'sandwiches', label: 'ميني ساندوتشات وموالح' },
    { id: 'gateaux', label: 'جاتوهات وسواريه' },
    { id: 'favors', label: 'علب توزيعات فردية' },
    { id: 'bundles', label: 'بكجات الحفلات المتكاملة' },
  ];

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    if (activeCategory === 'weekly_deals') {
      return products.filter(p => getProductPricing(p).hasDiscount);
    }
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickAdd = (product: CateringProduct) => {
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

  const handleWishlistClick = (e: React.MouseEvent, productId: string, productTitle: string) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(productId);
      const isCurrentlySaved = wishlistProductIds.includes(productId);
      showToast(
        isCurrentlySaved 
          ? `تمت إزالة «${productTitle}» من قائمة الأمنيات`
          : `تم حفظ «${productTitle}» في قائمة الأمنيات ❤️`
      );
    }
  };

  const handleToggleWeeklyDeal = (product: CateringProduct) => {
    if (!onUpdateProduct) return;
    const currentlyActive = getProductPricing(product).hasDiscount;
    if (currentlyActive) {
      onUpdateProduct({
        ...product,
        isWeeklyDeal: false,
      });
      showToast(`تم إلغاء العرض الأسبوعي عن «${product.title}»`);
    } else {
      const nextPercent =
        product.discountPercent && product.discountPercent > 0 ? product.discountPercent : 15;
      onUpdateProduct({
        ...product,
        isWeeklyDeal: true,
        discountPercent: nextPercent,
      });
      const discounted = getProductPricing({
        ...product,
        isWeeklyDeal: true,
        discountPercent: nextPercent,
      }).finalPrice;
      showToast(`تم تفعيل خصم ${nextPercent}% على «${product.title}» (${discounted} ج.م)`);
    }
  };

  const handleSetDiscountPercent = (product: CateringProduct, percent: number) => {
    if (!onUpdateProduct) return;
    const clamped = Math.min(90, Math.max(1, Math.round(percent) || 1));
    onUpdateProduct({
      ...product,
      isWeeklyDeal: true,
      discountPercent: clamped,
    });
  };

  const handleToggleCompare = (e: React.MouseEvent, product: CateringProduct) => {
    e.stopPropagation();
    const exists = compareProductIds.includes(product.id);
    if (exists) {
      setCompareProductIds(prev => prev.filter(id => id !== product.id));
      showToast(`تمت إزالة «${product.title}» من المقارنة`);
      return;
    }

    if (compareProductIds.length >= MAX_COMPARE_ITEMS) {
      showToast(`الحد الأقصى للمقارنة هو ${MAX_COMPARE_ITEMS} منتجات في المرة الواحدة`);
      return;
    }

    const nextCount = compareProductIds.length + 1;
    setCompareProductIds(prev => [...prev, product.id]);
    showToast(
      nextCount >= 2
        ? `تمت إضافة «${product.title}» (${nextCount} منتجات جاهزة للمقارنة!)`
        : `تم اختيار «${product.title}» — اختر منتجاً آخر للمقارنة`
    );
  };

  return (
    <section id="catalog" className="py-12 lg:py-20 bg-white border-t border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#B46D52] tracking-wide">
              التشكيلات الجاهزة للطلب السريع
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2D2421]">
              قائمة بوكسات الضيافة وتوزيعات المناسبات
            </h2>
            <p className="text-sm sm:text-base text-[#6B5B55] max-w-2xl">
              بوكسات مُعدّة بعناية فائقة من أشهى المخبوزات والحلويات الفرنسية الفاخرة، جاهزة للتسليم في موعد مناسبتك.
            </p>
          </div>

          {/* Quick Action Bar Buttons (Gift Card + Compare + Weekly Deals Admin + Dashboard + Wishlist) */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onOpenGiftCardModal && (
              <button
                type="button"
                onClick={() => onOpenGiftCardModal(products.find(p => p.isGiftCard || p.category === 'gift_cards'))}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-[#B85333] to-[#D97736] hover:opacity-95 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer"
              >
                <Gift className="w-4 h-4 text-[#FFE8B3]" />
                <span>إهداء بطاقة هدايا رقمية</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (comparedProducts.length >= 2) {
                  setIsCompareModalOpen(true);
                } else {
                  showToast('اختر منتجين أو أكثر بالضغط على زر «قارن» في بطاقات المنتجات');
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                comparedProducts.length >= 2
                  ? 'bg-[#2D2421] text-white border-[#2D2421] hover:bg-[#B46D52] hover:border-[#B46D52]'
                  : 'bg-white text-[#2D2421] border-[#D9CCC2] hover:border-[#B46D52]'
              }`}
            >
              <Scale className="w-4 h-4 text-[#B46D52]" />
              <span>مقارنة المنتجات ({comparedProducts.length})</span>
            </button>

            {onUpdateProduct && (
              <button
                type="button"
                onClick={() => setIsAdminDealsMode(prev => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                  isAdminDealsMode
                    ? 'bg-[#B85333] text-white border-[#B85333] shadow-sm'
                    : 'bg-[#FAF0EA] hover:bg-[#F2DFD4] text-[#B85333] border-[#E6CFC2]'
                }`}
              >
                <Percent className="w-4 h-4" />
                <span>{isAdminDealsMode ? 'إنهاء وضع العروض' : 'إدارة العروض الأسبوعية'}</span>
              </button>
            )}

            {onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#231815] hover:bg-[#3D2C27] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[#FFE8B3]" />
                <span>لوحة تحكم المنتجات والأسعار</span>
              </button>
            )}

            {onOpenWishlist && (
              <button
                onClick={onOpenWishlist}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${wishlistProductIds.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-rose-600'}`} />
                <span>قائمة أمنياتك ({wishlistProductIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Weekly Deals Helper Bar */}
        {isAdminDealsMode && onUpdateProduct && (
          <div className="mb-6 p-4 rounded-2xl bg-[#231815] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B85333] flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-[#FFE8B3]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold">
                  وضع المسؤول: تمييز منتجات «العروض الأسبوعية» وحساب الخصم التلقائي
                </div>
                <p className="text-[11px] text-white/75 mt-0.5">
                  اضغط على «تفعيل عرض خصم» في أي منتج بالأسفل واختر نسبة الخصم (٪)، وسيتم حساب السعر المخفض وإظهار ملصق «خصم» تلقائياً.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAdminDealsMode(false)}
              className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold shrink-0 cursor-pointer self-end sm:self-auto"
            >
              إغلاق وضع التعديل
            </button>
          </div>
        )}

        {/* Category Filter Controls (Segmented control) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4EDE7] rounded-xl text-xs font-medium mb-6">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? cat.id === 'weekly_deals'
                      ? 'bg-[#B85333] text-white font-bold shadow-xs'
                      : 'bg-white text-[#2D2421] font-bold shadow-xs ring-1 ring-[#2D2421]/10'
                    : 'text-[#6B5B55] hover:text-[#2D2421]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Highlight Banner for Weekly Deals & Solo Boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Weekly Deals Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-[#FFF8F5] to-amber-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-[#2D2421]">
                    العروض الأسبوعية الحصرية
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    خصومات تلقائية
                  </span>
                </div>
                <p className="text-xs text-[#6B5B55] mt-0.5">
                  {weeklyDealsProducts.length > 0
                    ? `${weeklyDealsProducts.length} بوكسات مختارة بخصم أسبوعي خاص — يتم تطبيق السعر المخفض تلقائياً عند الإضافة للسلة.`
                    : 'لا توجد عروض أسبوعية مفعلة حالياً. يمكن للمسؤول تمييز أي منتج بخصم في ثوانٍ.'}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setActiveCategory(prev => (prev === 'weekly_deals' ? 'all' : 'weekly_deals'))
              }
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === 'weekly_deals'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200'
              }`}
            >
              {activeCategory === 'weekly_deals'
                ? 'عرض كل المنتجات'
                : `تصفية العروض (${weeklyDealsProducts.length})`}
            </button>
          </div>

          {/* Solo Boxes Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF0EA] via-[#FFF8F3] to-[#FAF0EA] border border-[#E8CFC2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#B46D52] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-[#2D2421]">
                    بوكسات الفرد الواحد المحكمة
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#B46D52] text-white">
                    الأكثر طلباً
                  </span>
                </div>
                <p className="text-xs text-[#7D6B64] mt-0.5">
                  علبة مخصصة لكل ضيف: 2 ميني ساندوتش طازج + قطعة جاتوه سواريه + زجاجة عصير فريش.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveCategory('solo')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === 'solo'
                  ? 'bg-[#B46D52] text-white shadow-sm'
                  : 'bg-white text-[#2D2421] hover:bg-[#2D2421] hover:text-white border border-[#E8DFD8]'
              }`}
            >
              بوكسات الفرد ({products.filter(p => p.category === 'solo').length})
            </button>
          </div>
        </div>

        {/* Selected Comparison Bar Dock (appears when 1+ products selected for comparison) */}
        {comparedProducts.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-[#FAF7F2] border-2 border-[#B46D52]/40 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-9 h-9 rounded-xl bg-[#B46D52] text-white flex items-center justify-center shadow-xs">
                  <Scale className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-[#2D2421]">
                    مقارنة المنتجات ({comparedProducts.length} / {MAX_COMPARE_ITEMS})
                  </div>
                  <div className="text-[11px] text-[#7D6B64]">
                    {comparedProducts.length < 2
                      ? 'اختر منتجاً واحداً إضافياً على الأقل لعرض جدول المقارنة'
                      : 'جاهز! اضغط على عرض جدول المقارنة لمعاينة الفروق'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {comparedProducts.map(item => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-2 bg-white border border-[#DECFC0] rounded-xl pl-2 pr-1.5 py-1 shadow-2xs max-w-[210px]"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-7 h-7 rounded-lg object-cover shrink-0"
                    />
                    <span className="text-[11px] font-bold text-[#2D2421] truncate">
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompare(e, item)}
                      className="p-0.5 text-[#8C766B] hover:text-rose-600 rounded cursor-pointer shrink-0"
                      aria-label={`إزالة ${item.title} من المقارنة`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
              <button
                type="button"
                onClick={() => setCompareProductIds([])}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-[#6B5B55] hover:text-rose-600 border border-[#DECFC0] text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح الكل</span>
              </button>

              <button
                type="button"
                disabled={comparedProducts.length < 2}
                onClick={() => setIsCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D2421] hover:bg-[#B46D52] disabled:opacity-45 disabled:hover:bg-[#2D2421] text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-[#FFE8B3]" />
                <span>عرض جدول المقارنة ({comparedProducts.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State if Weekly Deals filter has 0 items */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#2D2421]">
              لا توجد منتجات مميزة ضمن العروض الأسبوعية حالياً
            </h3>
            <p className="text-xs text-[#6B5B55] max-w-md mx-auto">
              يمكن للمسؤول تفعيل وضع «إدارة العروض الأسبوعية» أو فتح لوحة التحكم لتمييز أي منتج بملصق خصم وسعر مخفض تلقائي.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="px-4 py-2 rounded-xl bg-[#2D2421] text-white text-xs font-bold cursor-pointer"
              >
                عرض جميع المنتجات
              </button>
              {onUpdateProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setIsAdminDealsMode(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#B85333] text-white text-xs font-bold cursor-pointer"
                >
                  تفعيل عروض أسبوعية الآن
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Product Grid: 3 columns on desktop, generous gap */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map(product => {
              const pricing = getProductPricing(product);

              return (
                <div
                  key={product.id}
                  className={`group flex flex-col bg-[#FAF7F2] rounded-2xl overflow-hidden border transition-all duration-300 ${
                    pricing.hasDiscount
                      ? 'border-rose-300 ring-1 ring-rose-200/70 hover:shadow-lg'
                      : 'border-[#E8DFD8] hover:border-[#D4C3B7] hover:shadow-md'
                  }`}
                >
                  {/* Image Container with aspect ratio 4:3 */}
                  <div className="relative aspect-[4/3] bg-[#F0EBE6] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Top-right badges: Weekly Deal Discount Badge takes visual priority */}
                    <div className="absolute top-3 right-3 flex flex-col items-start gap-1.5 pointer-events-none z-10">
                      {pricing.hasDiscount && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-rose-600 px-2.5 py-1 rounded-lg shadow-md">
                          <Flame className="w-3.5 h-3.5 text-amber-200" />
                          <span>خصم {pricing.discountPercent}% · عرض أسبوعي</span>
                        </div>
                      )}
                      {product.badge && (
                        <div className="text-[11px] font-semibold text-[#2D2421] bg-white/95 backdrop-blur px-2.5 py-1 rounded-md shadow-xs">
                          {product.badge}
                        </div>
                      )}
                    </div>

                    {/* Wishlist Heart Button */}
                    {onToggleWishlist && (
                      <button
                        type="button"
                        onClick={(e) => handleWishlistClick(e, product.id, product.title)}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-rose-500 shadow-sm transition-all hover:scale-110 z-10 cursor-pointer"
                        title={wishlistProductIds.includes(product.id) ? 'إزالة من قائمة الأمنيات' : 'حفظ في قائمة الأمنيات'}
                        aria-label="حفظ في قائمة الأمنيات"
                      >
                        <Heart 
                          className={`w-4 h-4 transition-colors ${
                            wishlistProductIds.includes(product.id) 
                              ? 'fill-rose-500 text-rose-500' 
                              : 'text-[#6B5B55] hover:text-rose-500'
                          }`} 
                        />
                      </button>
                    )}

                    {/* Compare Selection Button (always visible bottom-right on image) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompare(e, product)}
                      className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg shadow-sm transition-all z-10 cursor-pointer ${
                        compareProductIds.includes(product.id)
                          ? 'bg-[#2D2421] text-white ring-2 ring-[#FFE8B3]'
                          : 'bg-white/95 hover:bg-white text-[#2D2421]'
                      }`}
                      title={compareProductIds.includes(product.id) ? 'إزالة من جدول المقارنة' : 'تحديد للمقارنة'}
                    >
                      <Scale className={`w-3.5 h-3.5 ${compareProductIds.includes(product.id) ? 'text-[#FFE8B3]' : 'text-[#B46D52]'}`} />
                      <span>{compareProductIds.includes(product.id) ? 'محدد للمقارنة ✓' : 'قارن'}</span>
                    </button>

                    {/* Quick view button */}
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-[#2D2421] text-xs font-semibold rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>تفاصيل المحتويات</span>
                    </button>
                  </div>

                  {/* Card Content with consistent field order */}
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Quiet metadata line */}
                      <div className="flex items-center justify-between gap-2 text-xs text-[#82726B]">
                        <div className="flex items-center gap-2">
                          <span>{product.piecesCount} قطعة</span>
                          <span aria-hidden="true">·</span>
                          <span>تكفي {product.servesPeople}</span>
                        </div>
                        {pricing.hasDiscount && (
                          <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                            خصم أسبوعي
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#2D2421] group-hover:text-[#B46D52] transition-colors leading-snug">
                        {product.title}
                      </h3>

                      <p className="text-xs text-[#6B5B55] line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Inline Admin Weekly Deal Controls (when admin deals mode is toggled on) */}
                    {isAdminDealsMode && onUpdateProduct && (
                      <div className="p-3 rounded-xl bg-white border border-[#E5D5C8] space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-extrabold text-[#231815] flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-[#B85333]" />
                            <span>تحديد عرض أسبوعي:</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleWeeklyDeal(product)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                              pricing.hasDiscount
                                ? 'bg-rose-600 text-white hover:bg-rose-700'
                                : 'bg-[#FAF0EA] text-[#B85333] hover:bg-[#F2DFD4] border border-[#E6CFC2]'
                            }`}
                          >
                            {pricing.hasDiscount ? 'ملصق خصم مفعّل ✓' : '+ تفعيل ملصق خصم'}
                          </button>
                        </div>

                        {pricing.hasDiscount && (
                          <div className="space-y-2 pt-1.5 border-t border-[#F2ECE6]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {DISCOUNT_PRESETS.map(pct => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => handleSetDiscountPercent(product, pct)}
                                  className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                                    pricing.discountPercent === pct
                                      ? 'bg-[#231815] text-white'
                                      : 'bg-[#FAF6F0] text-[#66544D] hover:bg-[#EFE6DD]'
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                              <div className="flex items-center gap-1 mr-auto">
                                <input
                                  type="number"
                                  min={1}
                                  max={90}
                                  value={pricing.discountPercent}
                                  onChange={(e) =>
                                    handleSetDiscountPercent(product, Number(e.target.value))
                                  }
                                  className="w-12 px-1.5 py-0.5 text-center text-xs font-black border border-[#D9CCC2] rounded-md bg-[#FAF6F0] outline-none focus:border-[#B85333] tabular-nums"
                                  aria-label="نسبة الخصم"
                                />
                                <span className="text-[11px] font-bold text-[#66544D]">%</span>
                              </div>
                            </div>
                            <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center justify-between">
                              <span>السعر المخفض التلقائي:</span>
                              <span className="tabular-nums">
                                {pricing.finalPrice} ج.م (توفير {pricing.savings} ج.م)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price & Add to Cart / Customize E-Gift Card button */}
                    <div className="pt-3 border-t border-[#E8DFD8] flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        {product.isGiftCard || product.category === 'gift_cards' ? (
                          <>
                            <span className="text-sm sm:text-base font-extrabold text-[#B85333] tabular-nums">
                              تبدأ من {pricing.finalPrice} ج.م
                            </span>
                            <span className="text-[10px] font-bold text-[#7D6B64]">
                              تحديد المبلغ + كود خصم فوري
                            </span>
                          </>
                        ) : pricing.hasDiscount ? (
                          <>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-extrabold text-rose-600 tabular-nums">
                                {pricing.finalPrice} ج.م
                              </span>
                              <span className="text-xs font-semibold text-[#8C766B] line-through tabular-nums">
                                {pricing.originalPrice} ج.م
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700">
                              وفّر {pricing.savings} ج.م ({pricing.discountPercent}% خصم)
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-extrabold text-[#2D2421] tabular-nums">
                            {pricing.finalPrice} ج.م
                          </span>
                        )}
                      </div>

                      {product.isGiftCard || product.category === 'gift_cards' ? (
                        <button
                          type="button"
                          onClick={() => onOpenGiftCardModal?.(product)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-l from-[#B85333] to-[#D97736] hover:opacity-95 text-white text-xs font-extrabold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5 text-[#FFE8B3]" />
                          <span>تخصيص وإرسال</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickAdd(product)}
                          className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer ${
                            pricing.hasDiscount
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : 'bg-[#2D2421] hover:bg-[#B46D52]'
                          }`}
                          aria-label={`إضافة ${product.title} للسلة`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>إضافة للسلة</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D2421] text-white px-5 py-2.5 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Product Details Modal */}
        {selectedProduct && (() => {
          const modalPricing = getProductPricing(selectedProduct);
          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E8DFD8] shadow-2xl relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#2D2421] z-10 cursor-pointer"
                  aria-label="إغلاق التفاصيل"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="aspect-[16/10] bg-[#F0EBE6] overflow-hidden relative">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {modalPricing.hasDiscount && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-black text-white bg-rose-600 px-3 py-1 rounded-lg shadow-md">
                      <Flame className="w-3.5 h-3.5 text-amber-200" />
                      <span>عرض أسبوعي · خصم {modalPricing.discountPercent}%</span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#82726B] mb-1">
                      <span>{selectedProduct.piecesCount} قطعة</span>
                      <span aria-hidden="true">·</span>
                      <span>تكفي {selectedProduct.servesPeople}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#2D2421]">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-sm text-[#6B5B55] mt-2 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Items List Breakdown */}
                  <div className="space-y-2 bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFD8]">
                    <h4 className="text-xs font-bold text-[#2D2421]">محتويات البوكس بالتفصيل:</h4>
                    <ul className="space-y-1.5 text-xs text-[#6B5B55]">
                      {selectedProduct.itemsList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#B46D52] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedProduct.dietary && (
                    <div className="text-xs text-[#82726B] bg-[#FFFBF8] p-3 rounded-lg border border-[#F3ECE6]">
                      ✨ {selectedProduct.dietary}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E8DFD8]">
                    <div>
                      <span className="text-xs text-[#82726B] block">
                        {modalPricing.hasDiscount ? 'السعر بعد الخصم الأسبوعي:' : 'السعر الإجمالي:'}
                      </span>
                      {modalPricing.hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-rose-600 tabular-nums">
                            {modalPricing.finalPrice} ج.م
                          </span>
                          <span className="text-sm font-semibold text-[#8C766B] line-through tabular-nums">
                            {modalPricing.originalPrice} ج.م
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-extrabold text-[#2D2421] tabular-nums">
                          {modalPricing.finalPrice} ج.م
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleCompare(e, selectedProduct)}
                        className={`flex items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          compareProductIds.includes(selectedProduct.id)
                            ? 'bg-[#2D2421] text-white border-[#2D2421]'
                            : 'bg-white text-[#4F413B] border-[#D9CCC2] hover:bg-[#FAF7F5]'
                        }`}
                      >
                        <Scale className={`w-4 h-4 ${compareProductIds.includes(selectedProduct.id) ? 'text-[#FFE8B3]' : 'text-[#B46D52]'}`} />
                        <span>{compareProductIds.includes(selectedProduct.id) ? 'في المقارنة ✓' : 'قارن'}</span>
                      </button>

                      {onToggleWishlist && (
                        <button
                          type="button"
                          onClick={(e) => handleWishlistClick(e, selectedProduct.id, selectedProduct.title)}
                          className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            wishlistProductIds.includes(selectedProduct.id)
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-white text-[#4F413B] border-[#D9CCC2] hover:bg-[#FAF7F5]'
                          }`}
                          title="حفظ في قائمة الأمنيات"
                        >
                          <Heart className={`w-4 h-4 ${wishlistProductIds.includes(selectedProduct.id) ? 'fill-rose-500 text-rose-500' : 'text-[#8C7A72]'}`} />
                          <span>{wishlistProductIds.includes(selectedProduct.id) ? 'محفوظ' : 'حفظ'}</span>
                        </button>
                      )}

                      {selectedProduct.isGiftCard || selectedProduct.category === 'gift_cards' ? (
                        <button
                          type="button"
                          onClick={() => {
                            const p = selectedProduct;
                            setSelectedProduct(null);
                            onOpenGiftCardModal?.(p);
                          }}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-[#B46D52] hover:bg-[#9B5A42] text-white font-bold rounded-xl shadow-md transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Gift className="w-4 h-4" />
                          <span>تحديد المبلغ وإرسال البطاقة</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleQuickAdd(selectedProduct);
                            setSelectedProduct(null);
                          }}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-[#B46D52] hover:bg-[#9B5A42] text-white font-bold rounded-xl shadow-md transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>إضافة إلى السلة الآن</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Product Comparison Table Modal */}
        {isCompareModalOpen && comparedProducts.length >= 2 && (() => {
          const lowestPrice = Math.min(...comparedProducts.map(p => getProductPricing(p).finalPrice));
          const maxPieces = Math.max(...comparedProducts.map(p => p.piecesCount));

          return (
            <div
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
              onClick={() => setIsCompareModalOpen(false)}
            >
              <div
                className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-[#E5D5C8] shadow-2xl overflow-hidden text-right"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Comparison Modal Header */}
                <div className="bg-gradient-to-l from-[#231815] via-[#36251F] to-[#4A3229] text-white px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#B85333] text-white flex items-center justify-center shadow-sm shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black">
                        جدول مقارنة البوكسات والتوزيعات ({comparedProducts.length} منتجات)
                      </h3>
                      <p className="text-[11px] sm:text-xs text-white/75">
                        قارن بين السعر، المكونات، نوع التوزيعة، وعدد القطع لاختيار الأنسب لمناسبتك.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="إغلاق جدول المقارنة"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Comparison Table Content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6">
                  <table className="w-full min-w-[680px] border-collapse text-right">
                    <thead>
                      <tr className="border-b-2 border-[#E8DFD8]">
                        <th className="w-40 p-3 text-xs font-extrabold text-[#7D6B64] align-top bg-[#FAF7F2] rounded-tr-xl">
                          وجه المقارنة
                        </th>
                        {comparedProducts.map(product => (
                          <th
                            key={product.id}
                            className="p-3 align-top border-r border-[#F0E8E1] min-w-[200px]"
                          >
                            <div className="space-y-2.5 relative">
                              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#F0EBE6] border border-[#E5D5C8]">
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const remaining = compareProductIds.filter(id => id !== product.id);
                                    setCompareProductIds(remaining);
                                    if (remaining.length < 2) setIsCompareModalOpen(false);
                                  }}
                                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                                  title="إزالة من المقارنة"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="text-xs sm:text-sm font-extrabold text-[#2D2421] leading-snug">
                                {product.title}
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F0E8E1] text-xs">
                      {/* Row 1: Price */}
                      <tr>
                        <td className="p-3.5 font-extrabold text-[#2D2421] bg-[#FAF7F2] align-middle">
                          السعر الإجمالي
                        </td>
                        {comparedProducts.map(product => {
                          const pricing = getProductPricing(product);
                          const isBestPrice = pricing.finalPrice === lowestPrice;
                          return (
                            <td key={product.id} className="p-3.5 border-r border-[#F0E8E1] align-middle">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-2">
                                  <span className={`text-base font-black tabular-nums ${pricing.hasDiscount ? 'text-rose-600' : 'text-[#2D2421]'}`}>
                                    {pricing.finalPrice} ج.م
                                  </span>
                                  {pricing.hasDiscount && (
                                    <span className="text-[11px] text-[#8C766B] line-through tabular-nums">
                                      {pricing.originalPrice} ج.م
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {isBestPrice && (
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                      ✓ أقل سعر
                                    </span>
                                  )}
                                  {pricing.hasDiscount && (
                                    <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                                      خصم {pricing.discountPercent}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Row 2: Package / Favor Type */}
                      <tr>
                        <td className="p-3.5 font-extrabold text-[#2D2421] bg-[#FAF7F2] align-middle">
                          نوع التوزيعة
                        </td>
                        {comparedProducts.map(product => (
                          <td key={product.id} className="p-3.5 border-r border-[#F0E8E1] align-middle space-y-1">
                            <div className="inline-block px-2.5 py-1 rounded-lg bg-[#FAF0EA] text-[#B46D52] font-bold text-[11px]">
                              {CATEGORY_LABELS[product.category]}
                            </div>
                            {product.badge && (
                              <div className="text-[11px] text-[#6B5B55] font-medium">
                                {product.badge}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Row 3: Pieces Count & Serving */}
                      <tr>
                        <td className="p-3.5 font-extrabold text-[#2D2421] bg-[#FAF7F2] align-middle">
                          عدد القطع والكفاية
                        </td>
                        {comparedProducts.map(product => {
                          const pricing = getProductPricing(product);
                          const perPiece = Math.round(pricing.finalPrice / Math.max(1, product.piecesCount));
                          const isMostPieces = product.piecesCount === maxPieces;
                          return (
                            <td key={product.id} className="p-3.5 border-r border-[#F0E8E1] align-middle space-y-1">
                              <div className="flex items-center gap-1.5 font-extrabold text-[#2D2421]">
                                <span>{product.piecesCount} قطعة</span>
                                {isMostPieces && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                    الأكثر عدداً
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#6B5B55]">
                                تكفي: {product.servesPeople}
                              </div>
                              <div className="text-[10px] text-[#8C766B] tabular-nums">
                                متوسط القطعة: ~{perPiece} ج.م
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Row 4: Ingredients / Contents */}
                      <tr>
                        <td className="p-3.5 font-extrabold text-[#2D2421] bg-[#FAF7F2] align-top">
                          المكونات والمحتويات
                        </td>
                        {comparedProducts.map(product => (
                          <td key={product.id} className="p-3.5 border-r border-[#F0E8E1] align-top">
                            <ul className="space-y-1.5 text-[11px] text-[#4F413B]">
                              {product.itemsList.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-[#B46D52] shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>

                      {/* Row 5: Highlights & Dietary */}
                      <tr>
                        <td className="p-3.5 font-extrabold text-[#2D2421] bg-[#FAF7F2] align-top">
                          مميزات التقديم
                        </td>
                        {comparedProducts.map(product => (
                          <td key={product.id} className="p-3.5 border-r border-[#F0E8E1] align-top text-[11px] text-[#6B5B55] leading-relaxed">
                            {product.dietary || product.description}
                          </td>
                        ))}
                      </tr>

                      {/* Row 6: Quick Action */}
                      <tr>
                        <td className="p-3.5 font-extrabold text-[#2D2421] bg-[#FAF7F2] align-middle rounded-br-xl">
                          الاختيار السريع
                        </td>
                        {comparedProducts.map(product => (
                          <td key={product.id} className="p-3.5 border-r border-[#F0E8E1] align-middle">
                            <button
                              type="button"
                              onClick={() => handleQuickAdd(product)}
                              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#2D2421] hover:bg-[#B46D52] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>إضافة للسلة</span>
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Comparison Modal Footer */}
                <div className="px-5 sm:px-7 py-3.5 bg-[#FAF7F2] border-t border-[#E8DFD8] flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setCompareProductIds([]);
                      setIsCompareModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7D6B64] hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح قائمة المقارنة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-[#2D2421] text-white text-xs font-bold cursor-pointer"
                  >
                    إغلاق والعودة للكتالوج
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </section>
  );
};
