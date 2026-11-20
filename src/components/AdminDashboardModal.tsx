import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Settings,
  Plus,
  Search,
  Save,
  RotateCcw,
  Trash2,
  Image as ImageIcon,
  Upload,
  Check,
  Tag,
  Package,
  DollarSign,
  Edit3,
  AlertCircle,
  Sparkles,
  Link2,
  Flame,
  Percent
} from 'lucide-react';
import { CateringProduct } from '../types/catering';
import { IMAGES, CATERING_PRODUCTS } from '../data/cateringData';
import { getProductPricing } from '../utils/productPricing';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: CateringProduct[];
  onUpdateProduct: (updatedProduct: CateringProduct) => void;
  onAddProduct: (newProduct: CateringProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onResetDefaults: () => void;
}

const PRESET_IMAGES = [
  { label: 'بوكس السعادة الفردي', url: IMAGES.solo },
  { label: 'ميني ساندوتشات وموالح', url: IMAGES.savory },
  { label: 'جاتوهات وسواريه فرنسية', url: IMAGES.gateaux },
  { label: 'علب توزيعات المناسبات', url: IMAGES.favors },
  { label: 'بوفيه وطاولة الضيافة', url: IMAGES.hero },
];

const CATEGORY_OPTIONS: { id: CateringProduct['category']; label: string }[] = [
  { id: 'solo', label: 'بوكسات شخص واحد' },
  { id: 'sandwiches', label: 'ميني ساندوتشات وموالح' },
  { id: 'gateaux', label: 'جاتوهات وسواريه' },
  { id: 'favors', label: 'علب توزيعات فردية' },
  { id: 'bundles', label: 'بكجات الحفلات المتكاملة' },
  { id: 'gift_cards', label: 'بطاقات الهدايا الرقمية 🎁' },
];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onResetDefaults,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<CateringProduct | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory =
        filterCategory === 'all' ||
        (filterCategory === 'weekly_deals'
          ? getProductPricing(p).hasDiscount
          : p.category === filterCategory);
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, filterCategory, searchTerm]);

  const stats = useMemo(() => {
    const count = products.length;
    const avgPrice = count > 0 ? Math.round(products.reduce((s, p) => s + getProductPricing(p).finalPrice, 0) / count) : 0;
    const weeklyDealsCount = products.filter(p => getProductPricing(p).hasDiscount).length;
    return { count, avgPrice, weeklyDealsCount };
  }, [products]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleStartEdit = (product: CateringProduct) => {
    setIsCreatingNew(false);
    setImageError(null);
    setEditingProduct({ ...product, itemsList: [...product.itemsList] });
  };

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setImageError(null);
    setEditingProduct({
      id: `prod-custom-${Date.now()}`,
      title: '',
      category: 'solo',
      price: 80,
      piecesCount: 4,
      servesPeople: 'شخص واحد (بوكس متكامل)',
      description: 'تشكيلة مختارة طازجة من ميني ساندوتش وجاتوه فرنسي وتغليف فاخر.',
      image: IMAGES.solo,
      itemsList: [
        '2x ميني ساندوتش طازج',
        '1x قطعة جاتوه فرنسي فاخر',
        'تغليف أنيق بشريط ستان'
      ],
      badge: 'جديد',
      popular: false,
    });
  };

  const handleQuickPriceChange = (product: CateringProduct, delta: number) => {
    const nextPrice = Math.max(10, product.price + delta);
    onUpdateProduct({ ...product, price: nextPrice });
    showToast(`تم تحديث سعر «${product.title.slice(0, 28)}...» إلى ${nextPrice} ج.م`);
  };

  const handleToggleProductWeeklyDeal = (product: CateringProduct) => {
    const currentlyActive = getProductPricing(product).hasDiscount;
    if (currentlyActive) {
      onUpdateProduct({ ...product, isWeeklyDeal: false });
      showToast(`تم إيقاف العرض الأسبوعي لـ «${product.title}»`);
    } else {
      const percent = product.discountPercent && product.discountPercent > 0 ? product.discountPercent : 15;
      const updated = { ...product, isWeeklyDeal: true, discountPercent: percent };
      onUpdateProduct(updated);
      const nextPricing = getProductPricing(updated);
      showToast(`تم تفعيل خصم ${percent}% على «${product.title}» (${nextPricing.finalPrice} ج.م)`);
    }
  };

  // Compress uploaded image into lightweight JPEG Data URL for safe localStorage storage
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    if (!file.type.startsWith('image/')) {
      setImageError('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).');
      return;
    }

    setImageError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setEditingProduct(prev => (prev ? { ...prev, image: compressedDataUrl } : prev));
          showToast('تم رفع الصورة وتجهيزها بنجاح 📸');
        }
      };
      img.onerror = () => {
        setImageError('تعذر قراءة الصورة المختارة، جرب صورة أخرى.');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.title.trim()) {
      setImageError('يرجى إدخال اسم المنتج قبل الحفظ.');
      return;
    }

    const sanitized: CateringProduct = {
      ...editingProduct,
      title: editingProduct.title.trim(),
      price: Math.max(1, Number(editingProduct.price) || 1),
      piecesCount: Math.max(1, Number(editingProduct.piecesCount) || 1),
      image: editingProduct.image.trim() || IMAGES.solo,
      itemsList: editingProduct.itemsList.filter(item => item.trim().length > 0),
    };

    if (isCreatingNew) {
      onAddProduct(sanitized);
      showToast(`تمت إضافة المنتج «${sanitized.title}» إلى المتجر ✅`);
    } else {
      onUpdateProduct(sanitized);
      showToast(`تم حفظ تعديلات «${sanitized.title}» وتحديث الأسعار والصور ✅`);
    }

    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF6F0] rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-[#DECFC0] shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="bg-gradient-to-l from-[#231815] via-[#36251F] to-[#4A3229] text-white px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#B85333] text-white flex items-center justify-center shadow-md shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight">
                  لوحة التحكم — إدارة المنتجات والأسعار والصور
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>تحديث فوري للمتجر</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/75 mt-0.5">
                عدّل أسماء البوكسات، الأسعار بالجنيه المصري، والصور أو أضف منتجات جديدة ليظهر التغيير فوراً للعملاء.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق لوحة التحكم"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification inside Dashboard */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 flex items-center justify-center gap-2 shrink-0 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {editingProduct ? (
            /* Product Edit / Create Form View */
            <form
              onSubmit={handleSaveEditor}
              className="bg-white rounded-2xl border border-[#E5D5C8] p-5 sm:p-6 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#F0E8E1] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF0EA] text-[#B85333] flex items-center justify-center">
                    {isCreatingNew ? <Plus className="w-5 h-5" /> : <Edit3 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#231815]">
                      {isCreatingNew ? 'إضافة منتج جديد للكتالوج' : `تعديل المنتج: ${editingProduct.title}`}
                    </h3>
                    <span className="text-[11px] text-[#8C766B]">
                      قم بتحديث البيانات والأسعار والصورة ثم اضغط حفظ التغييرات
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsCreatingNew(false);
                    setImageError(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#66544D] hover:text-[#231815] bg-[#FAF6F0] rounded-lg border border-[#E8DCD0] cursor-pointer"
                >
                  ← العودة لقائمة المنتجات
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Image Manager (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <label className="text-xs font-extrabold text-[#231815] block">
                    صورة المنتج الحالية والمعاينة:
                  </label>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F5ECE1] border-2 border-[#E5D5C8] shadow-inner">
                    <img
                      src={editingProduct.image || IMAGES.solo}
                      alt={editingProduct.title || 'معاينة الصورة'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {getProductPricing(editingProduct).hasDiscount && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-200" />
                        <span>خصم {getProductPricing(editingProduct).discountPercent}%</span>
                      </span>
                    )}
                    {editingProduct.badge && (
                      <span className="absolute top-3 right-3 bg-white/95 text-[#231815] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                        {editingProduct.badge}
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 bg-[#231815]/90 text-white text-xs font-extrabold px-3 py-1 rounded-lg tabular-nums flex items-center gap-1.5">
                      {getProductPricing(editingProduct).hasDiscount ? (
                        <>
                          <span className="text-rose-300">{getProductPricing(editingProduct).finalPrice} ج.م</span>
                          <span className="line-through text-white/60 text-[10px]">{editingProduct.price}</span>
                        </>
                      ) : (
                        <span>{editingProduct.price} ج.م</span>
                      )}
                    </span>
                  </div>

                  {/* Upload Custom Image Button */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF0E6] hover:bg-[#F2DFD4] text-[#B85333] border border-[#ECD9CA] rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>رفع صورة جديدة من جهازك / الموبايل</span>
                    </button>
                  </div>

                  {/* Image URL Direct Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#66544D] flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5 text-[#B85333]" />
                      <span>أو لصق رابط صورة مباشر (URL):</span>
                    </label>
                    <input
                      type="text"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="https://... أو اختر من الصور الجاهزة بالأسفل"
                      dir="ltr"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none font-mono"
                    />
                  </div>

                  {/* Preset Bahjah Studio Gallery */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#66544D] block">
                      أو اختر من صور استوديو «بهجة» الجاهزة:
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_IMAGES.map(preset => {
                        const isSelected = editingProduct.image === preset.url;
                        return (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, image: preset.url })}
                            title={preset.label}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#B85333] ring-2 ring-[#B85333]/30 scale-105'
                                : 'border-[#E5D5C8] hover:border-[#B85333]/60 opacity-85 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Product Info & Pricing (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#231815] block">
                      اسم المنتج / البوكس:
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.title}
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      placeholder="مثال: بوكس البهجة الفردي الكلاسيكي..."
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#231815] block">
                        السعر (ج.م):
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: Number(e.target.value) || 0 })
                        }
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none font-black text-[#B85333] tabular-nums"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#231815] block">
                        عدد القطع:
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editingProduct.piecesCount}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, piecesCount: Number(e.target.value) || 1 })
                        }
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none font-bold tabular-nums"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#231815] block">
                        التصنيف:
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value as CateringProduct['category'],
                          })
                        }
                        className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none font-semibold"
                      >
                        {CATEGORY_OPTIONS.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#231815] block">
                        يكفي لعدد (مثال: شخص واحد أو 8-12 فرد):
                      </label>
                      <input
                        type="text"
                        value={editingProduct.servesPeople}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, servesPeople: e.target.value })
                        }
                        className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-[#231815] block">
                        الشارة الترويجية (Badge):
                      </label>
                      <input
                        type="text"
                        value={editingProduct.badge || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                        placeholder="مثال: الأكثر طلباً / عرض خاص"
                        className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none"
                      />
                    </div>
                  </div>

                  {/* Weekly Deal & Auto-Discount Controls */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-extrabold text-[#231815]">
                          إعدادات «العروض الأسبوعية» (ملصق خصم وسعر مخفض تلقائي)
                        </span>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProduct.isWeeklyDeal)}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              isWeeklyDeal: e.target.checked,
                              discountPercent: e.target.checked
                                ? editingProduct.discountPercent || 15
                                : editingProduct.discountPercent,
                            })
                          }
                          className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-rose-700">
                          {editingProduct.isWeeklyDeal ? 'مفعّل ضمن العروض الأسبوعية' : 'تفعيل العرض الأسبوعي'}
                        </span>
                      </label>
                    </div>

                    {editingProduct.isWeeklyDeal && (() => {
                      const previewPricing = getProductPricing(editingProduct);
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-rose-200/70">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#66544D] block">
                              نسبة الخصم (٪):
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {[10, 15, 20, 25, 30].map(pct => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() =>
                                    setEditingProduct({ ...editingProduct, discountPercent: pct })
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                    (editingProduct.discountPercent || 0) === pct
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-white text-[#66544D] border border-rose-200 hover:bg-rose-100'
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                              <input
                                type="number"
                                min={1}
                                max={90}
                                value={editingProduct.discountPercent || 15}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    discountPercent: Math.min(90, Math.max(1, Number(e.target.value) || 1)),
                                  })
                                }
                                className="w-16 px-2 py-1 text-center text-xs font-black rounded-lg border border-rose-300 bg-white outline-none tabular-nums"
                              />
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-rose-200 px-3.5 py-2.5 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] font-semibold text-[#7D6B64]">
                                السعر المخفض المحسوب تلقائياً:
                              </div>
                              <div className="text-sm font-black text-rose-600 tabular-nums">
                                {previewPricing.finalPrice} ج.م
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="text-[10px] text-[#8C766B] line-through tabular-nums">
                                {previewPricing.originalPrice} ج.م
                              </div>
                              <div className="text-[10px] font-bold text-emerald-700 tabular-nums">
                                توفير {previewPricing.savings} ج.م
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#231815] block">
                      وصف المنتج:
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#231815] block">
                      محتويات الصندوق (سطر لكل صنف):
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.itemsList.join('\n')}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          itemsList: e.target.value.split('\n'),
                        })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-[#FAF7F5] focus:bg-white focus:border-[#B85333] outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {imageError && (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{imageError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0E8E1]">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-[#B85333] hover:bg-[#9E472A] text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isCreatingNew ? 'إضافة المنتج للمتجر' : 'حفظ التعديلات في المتجر'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsCreatingNew(false);
                      }}
                      className="px-4 py-2.5 text-xs font-bold text-[#66544D] hover:text-[#231815] cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Main Catalog Inventory List */
            <>
              {/* Quick KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-[#E8DCD0] flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF0EA] text-[#B85333] flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#8C766B] font-semibold">إجمالي المنتجات المعروضة</div>
                    <div className="text-lg font-black text-[#231815] tabular-nums">{stats.count} منتج</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DCD0] flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#8C766B] font-semibold">متوسط سعر البوكس</div>
                    <div className="text-lg font-black text-[#231815] tabular-nums">{stats.avgPrice} ج.م</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DCD0] flex items-center gap-3 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#8C766B] font-semibold">العروض الأسبوعية المفعّلة</div>
                    <div className="text-lg font-black text-rose-600 tabular-nums">{stats.weeklyDealsCount} عروض</div>
                  </div>
                </div>
              </div>

              {/* Toolbar: Search, Filter, Add New, Reset */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8DCD0] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                  <div className="relative flex items-center flex-1 bg-[#FAF6F0] rounded-xl border border-[#E5D5C8] px-3 py-2">
                    <Search className="w-4 h-4 text-[#8C766B] ml-2 shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ابحث باسم المنتج أو الوصف لتعديله..."
                      className="w-full text-xs bg-transparent outline-none text-[#231815]"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs font-bold px-3 py-2.5 rounded-xl border border-[#E5D5C8] bg-[#FAF6F0] text-[#231815] outline-none"
                  >
                    <option value="all">كل التصنيفات ({products.length})</option>
                    <option value="weekly_deals">العروض الأسبوعية فقط ({stats.weeklyDealsCount})</option>
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#B85333] hover:bg-[#9E472A] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة منتج جديد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onResetDefaults();
                      showToast(`تمت استعادة المنتجات الافتراضية (${CATERING_PRODUCTS.length} منتج) 🔄`);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FAF6F0] hover:bg-[#F2EAE2] text-[#66544D] border border-[#DECFC0] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    title="إرجاع الأسعار والصور الافتراضية للمشروع"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>استعادة الافتراضي</span>
                  </button>
                </div>
              </div>

              {/* Products Management Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map(product => {
                  const pricing = getProductPricing(product);
                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-2xl border p-4 flex flex-col sm:flex-row gap-4 transition-all shadow-2xs ${
                        pricing.hasDiscount
                          ? 'border-rose-300 ring-1 ring-rose-100'
                          : 'border-[#E8DCD0] hover:border-[#B85333]/60'
                      }`}
                    >
                      {/* Thumbnail with quick edit overlay */}
                      <div
                        onClick={() => handleStartEdit(product)}
                        className="relative w-full sm:w-32 h-36 sm:h-32 rounded-xl overflow-hidden bg-[#F5ECE1] border border-[#E5D5C8] shrink-0 cursor-pointer group"
                        title="اضغط لتغيير الصورة وتعديل المنتج"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        {pricing.hasDiscount && (
                          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                            خصم {pricing.discountPercent}%
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                          <ImageIcon className="w-4 h-4" />
                          <span>تغيير الصورة</span>
                        </div>
                      </div>

                      {/* Details + Inline Quick Price Adjuster */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-extrabold text-[#231815] leading-snug line-clamp-2">
                              {product.title}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF0EA] text-[#B85333] shrink-0">
                              {CATEGORY_OPTIONS.find(c => c.id === product.category)?.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7D6B64] line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        </div>

                        {/* Quick Price & Weekly Deal Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2ECE6]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Quick +/- Price Control */}
                            <div className="flex items-center gap-1.5 bg-[#FAF6F0] px-2 py-1 rounded-xl border border-[#E5D5C8]">
                              <button
                                type="button"
                                onClick={() => handleQuickPriceChange(product, -5)}
                                className="w-6 h-6 rounded-lg bg-white hover:bg-[#F2EAE2] text-[#231815] font-black text-xs border border-[#DECFC0] flex items-center justify-center cursor-pointer"
                                title="تخفيض 5 ج.م"
                              >
                                -
                              </button>
                              <div className="px-1.5 text-center tabular-nums">
                                {pricing.hasDiscount ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-black text-rose-600">{pricing.finalPrice} ج.م</span>
                                    <span className="text-[10px] text-[#8C766B] line-through">{pricing.originalPrice}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs font-black text-[#B85333]">{product.price} ج.م</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleQuickPriceChange(product, 5)}
                                className="w-6 h-6 rounded-lg bg-white hover:bg-[#F2EAE2] text-[#231815] font-black text-xs border border-[#DECFC0] flex items-center justify-center cursor-pointer"
                                title="زيادة 5 ج.م"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleProductWeeklyDeal(product)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-colors cursor-pointer ${
                                pricing.hasDiscount
                                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              }`}
                              title="تفعيل أو إلغاء العرض الأسبوعي"
                            >
                              <Percent className="w-3 h-3" />
                              <span>{pricing.hasDiscount ? `خصم ${pricing.discountPercent}% ✓` : 'عرض أسبوعي'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(product)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#231815] hover:bg-[#3D2C27] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-[#FFE8B3]" />
                              <span>تعديل</span>
                            </button>

                            {confirmDeleteId === product.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteProduct(product.id);
                                  setConfirmDeleteId(null);
                                  showToast(`تم حذف «${product.title}» من المتجر`);
                                }}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                              >
                                تأكيد الحذف
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(product.id)}
                                className="p-1.5 text-[#8C766B] hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                title="حذف المنتج"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
