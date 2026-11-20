import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  RotateCcw, 
  ShoppingBag, 
  SlidersHorizontal,
  Heart,
  Palette
} from 'lucide-react';
import { 
  BOX_FILLINGS, 
  OCCASIONS_LIST, 
  RIBBON_COLORS, 
  BOX_SIZES,
  IMAGES
} from '../data/cateringData';
import { OccasionType, CustomBoxConfig, CartItem } from '../types/catering';

interface CustomBoxBuilderProps {
  onAddCustomBoxToCart: (cartItem: CartItem) => void;
}

export const CustomBoxBuilder: React.FC<CustomBoxBuilderProps> = ({
  onAddCustomBoxToCart,
}) => {
  // State
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>('graduation');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('classic');
  const [ribbonColorId, setRibbonColorId] = useState<string>('gold');
  const [recipientName, setRecipientName] = useState<string>('ألف مبروك التخرج يا سارة');
  const [cardMessage, setCardMessage] = useState<string>('فرحتنا بكِ لا تسعها الكلمات، عقبال أعلى الدرجات والمستقبل المشرق!');
  const [fillingsFilter, setFillingsFilter] = useState<'all' | 'savory' | 'sweet' | 'drink'>('all');
  
  // Selected counts: { itemId: quantity }
  const [selectedFillings, setSelectedFillings] = useState<{ [id: string]: number }>({
    'fill-croissant-turkey': 6,
    'fill-brioche-roastbeef': 6,
    'fill-eclair-belgian': 6,
    'fill-tart-berries': 6,
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Derived current size
  const currentSize = useMemo(() => {
    return BOX_SIZES.find(b => b.id === selectedSizeId) || BOX_SIZES[1];
  }, [selectedSizeId]);

  // Derived current occasion
  const currentOccasion = useMemo(() => {
    return OCCASIONS_LIST.find(o => o.id === selectedOccasion) || OCCASIONS_LIST[0];
  }, [selectedOccasion]);

  // Derived current ribbon
  const currentRibbon = useMemo(() => {
    return RIBBON_COLORS.find(r => r.id === ribbonColorId) || RIBBON_COLORS[0];
  }, [ribbonColorId]);

  // Total count of selected items
  const totalSelectedPieces = useMemo(() => {
    return Object.values(selectedFillings).reduce((sum, count) => sum + count, 0);
  }, [selectedFillings]);

  // Remaining slots
  const remainingSlots = currentSize.maxPieces - totalSelectedPieces;

  // Total price calculation
  const calculatedPrice = useMemo(() => {
    // Base box packaging + items individual calculation
    const fillingsCost = Object.entries(selectedFillings).reduce((sum, [id, count]) => {
      const item = BOX_FILLINGS.find(f => f.id === id);
      return sum + (item ? item.pricePerPiece * count : 0);
    }, 0);

    // If customer selected full pieces, calculate fair price based on box base and fillings
    return Math.max(currentSize.basePrice, Math.round(fillingsCost + 15));
  }, [selectedFillings, currentSize]);

  // Handlers
  const handleOccasionChange = (occId: OccasionType) => {
    setSelectedOccasion(occId);
    const occ = OCCASIONS_LIST.find(o => o.id === occId);
    if (occ) {
      setCardMessage(occ.defaultMsg);
      if (occId === 'birthday') setRecipientName('سنة حلوة يا غالي');
      else if (occId === 'wedding') setRecipientName('ألف مبروك لأجمل عروسين');
      else if (occId === 'baby_shower') setRecipientName('نورت الدنيا يا ضيفنا الصغير');
      else if (occId === 'corporate') setRecipientName('شركاء النجاح والتميز');
      else if (occId === 'graduation') setRecipientName('ألف مبروك التخرج والتميز');
    }
  };

  const handleSizeChange = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    const newSize = BOX_SIZES.find(b => b.id === sizeId);
    if (!newSize) return;

    if (sizeId === 'solo') {
      // Auto setup solo box components: 2 sandwiches + 1 gateau + 1 fresh juice
      setSelectedFillings({
        'fill-croissant-turkey': 1,
        'fill-brioche-roastbeef': 1,
        'fill-eclair-belgian': 1,
        'fill-juice-orange': 1,
      });
      showToast('تم ضبط البوكس الفردي: (2 ميني ساندوتش + 1 جاتوه + 1 عصير طبيعي)!');
      return;
    }

    // Adjust selections if over limit
    let currentTotal = Object.values(selectedFillings).reduce((sum, count) => sum + count, 0);
    if (currentTotal > newSize.maxPieces || currentTotal <= 4) {
      autoFillPreset(newSize.maxPieces);
    }
  };

  const handleUpdateItem = (id: string, delta: number) => {
    const current = selectedFillings[id] || 0;
    const next = Math.max(0, current + delta);

    if (delta > 0 && remainingSlots <= 0) {
      showToast(`تم الوصول للحد الأقصى للبوكس (${currentSize.maxPieces} قطعة). قم بإنقاص صنف آخر أولاً.`);
      return;
    }

    setSelectedFillings(prev => {
      const updated = { ...prev };
      if (next === 0) {
        delete updated[id];
      } else {
        updated[id] = next;
      }
      return updated;
    });
  };

  const autoFillPreset = (targetPieces: number = currentSize.maxPieces) => {
    if (targetPieces === 4 || selectedSizeId === 'solo') {
      setSelectedFillings({
        'fill-croissant-turkey': 1,
        'fill-brioche-roastbeef': 1,
        'fill-eclair-belgian': 1,
        'fill-juice-orange': 1,
      });
      showToast('تم تنسيق بوكس الفرد الواحد: (2 ساندوتش + 1 جاتوه + 1 عصير)!');
      return;
    }

    const quarter = Math.floor(targetPieces / 4);
    const remainder = targetPieces - (quarter * 4);

    setSelectedFillings({
      'fill-croissant-turkey': quarter + remainder,
      'fill-brioche-roastbeef': quarter,
      'fill-eclair-belgian': quarter,
      'fill-tart-berries': quarter,
    });
    showToast(`تم توزيع الأصناف بنجاح (${targetPieces} قطعة متوازنة بين المالح والحلو)!`);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleAddToCart = () => {
    if (totalSelectedPieces === 0) {
      showToast('يرجى اختيار صنف واحد على الأقل لتعبئة البوكس');
      return;
    }

    const config: CustomBoxConfig = {
      occasion: selectedOccasion,
      occasionTitle: currentOccasion.label,
      boxSize: currentSize.id as any,
      boxName: currentSize.name,
      maxPieces: currentSize.maxPieces,
      ribbonColor: currentRibbon.hex,
      ribbonColorName: currentRibbon.name,
      recipientName: recipientName.trim() || 'ضيوفنا الكرام',
      cardMessage: cardMessage.trim() || currentOccasion.defaultMsg,
      selectedFillings: { ...selectedFillings },
      baseBoxPrice: calculatedPrice,
    };

    // Format details list
    const details: string[] = [
      `المناسبة: ${currentOccasion.label}`,
      `الحجم: ${currentSize.name} (${totalSelectedPieces} قطعة)`,
      `لون الشريط: ${currentRibbon.name}`,
      `اسم الكارت: ${config.recipientName}`,
    ];

    Object.entries(selectedFillings).forEach(([id, qty]) => {
      const item = BOX_FILLINGS.find(f => f.id === id);
      if (item && qty > 0) {
        details.push(`${qty}x ${item.name}`);
      }
    });

    const cartItem: CartItem = {
      cartItemId: `custom-box-${Date.now()}`,
      type: 'custom_box',
      title: `${currentSize.name} - بتنسيق مخصص (${currentOccasion.label})`,
      price: calculatedPrice,
      quantity: 1,
      image: IMAGES.favors,
      piecesCount: totalSelectedPieces,
      details,
      customBoxConfig: config,
    };

    onAddCustomBoxToCart(cartItem);
    showToast('تمت إضافة البوكس المخصص إلى سلة المشتريات بنجاح!');
  };

  // Filtered list of fillings
  const visibleFillings = useMemo(() => {
    if (fillingsFilter === 'all') return BOX_FILLINGS;
    return BOX_FILLINGS.filter(f => f.category === fillingsFilter);
  }, [fillingsFilter]);

  return (
    <section id="builder" className="py-12 lg:py-20 bg-[#FAF7F2] border-t border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#B46D52]">
            <Sparkles className="w-4 h-4" />
            <span>استوديو التخصيص الحصري</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2421] [text-wrap:balance]">
            صمّم بوكس مناسبتك خطوة بخطوة.. بالطعم واللون الذي يسعدك
          </h2>
          <p className="text-base text-[#6B5B55] [text-wrap:balance]">
            اختر الحجم، نسّق قطع الميني ساندوتش والجاتوهات الفرنسية بكل حرية، وحدد لون الشريط وكارت الإهداء المطبوع بالاسم مجاناً.
          </p>
        </div>

        {/* Builder Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Occasion */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DFD8] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#2D2421] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FAF0EA] text-[#B46D52] flex items-center justify-center text-xs font-bold">1</span>
                  نوع المناسبة
                </span>
                <span className="text-xs text-[#82726B]">سيتم تجهيز الثيم والكارت بناءً على اختيارك</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {OCCASIONS_LIST.map(occ => {
                  const isSelected = selectedOccasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      onClick={() => handleOccasionChange(occ.id as OccasionType)}
                      className={`flex items-center gap-2 p-3 text-right rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#B46D52] bg-[#FAF0EA] text-[#2D2421] font-semibold ring-1 ring-[#B46D52]'
                          : 'border-[#E8DFD8] hover:border-[#D1C3B9] text-[#6B5B55] bg-white'
                      }`}
                    >
                      <span className="text-xl">{occ.icon}</span>
                      <span className="text-xs sm:text-sm truncate">{occ.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Box Size */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DFD8] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#2D2421] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FAF0EA] text-[#B46D52] flex items-center justify-center text-xs font-bold">2</span>
                  حجم البوكس وعدد القطع
                </span>
                <span className="text-xs font-medium text-[#B46D52]">
                  السعة الحالية: {currentSize.maxPieces} قطعة
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOX_SIZES.map(box => {
                  const isSelected = selectedSizeId === box.id;
                  return (
                    <button
                      key={box.id}
                      onClick={() => handleSizeChange(box.id)}
                      className={`p-4 text-right rounded-xl border transition-all relative ${
                        isSelected
                          ? 'border-[#B46D52] bg-[#FAF0EA]/60 ring-1 ring-[#B46D52]'
                          : 'border-[#E8DFD8] hover:border-[#D1C3B9] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-[#2D2421]">{box.name}</span>
                        <span className="text-xs font-semibold text-[#B46D52] tabular-nums">
                          تبدأ من {box.basePrice} ج.م
                        </span>
                      </div>
                      <div className="text-xs text-[#7D6B64]">{box.idealFor}</div>
                      <div className="mt-2 text-[11px] text-[#A0887E]">{box.tag}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Mix & Match Fillings */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DFD8] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E8E1] pb-4">
                <div>
                  <span className="text-sm font-bold text-[#2D2421] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FAF0EA] text-[#B46D52] flex items-center justify-center text-xs font-bold">3</span>
                    تشكيلة الميني ساندوتش والجاتوهات
                  </span>
                  <p className="text-xs text-[#7D6B64] mt-0.5">
                    وزّع {currentSize.maxPieces} قطعة بحرية بين الموالح الفاخرة والحلويات الفرنسية
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => autoFillPreset()}
                    className="text-xs font-medium text-[#B46D52] hover:text-[#9B5A42] flex items-center gap-1 px-3 py-1.5 bg-[#FAF0EA] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    تعبئة متوازنة تلقائية
                  </button>
                  <button
                    onClick={() => setSelectedFillings({})}
                    className="text-xs text-[#82726B] hover:text-[#2D2421] flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    title="تفريغ الاختيارات"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    إعادة ضبط
                  </button>
                </div>
              </div>

              {/* Live Capacity Meter */}
              <div className="space-y-1.5 bg-[#FBF8F5] p-3.5 rounded-xl border border-[#EDE4DC]">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#2D2421]">
                    المجموع المختار: <span className="tabular-nums font-bold text-[#B46D52]">{totalSelectedPieces}</span> من أصل <span className="tabular-nums">{currentSize.maxPieces}</span> قطعة
                  </span>
                  <span className={`tabular-nums ${remainingSlots === 0 ? 'text-emerald-700 font-bold' : remainingSlots < 0 ? 'text-rose-600' : 'text-[#82726B]'}`}>
                    {remainingSlots === 0 ? '✓ البوكس مكتمل بالتمام' : remainingSlots > 0 ? `متبقي ${remainingSlots} قطعة` : `تجاوزت السعة بـ ${Math.abs(remainingSlots)}!`}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#E8DFD8] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      remainingSlots === 0 
                        ? 'bg-emerald-600' 
                        : remainingSlots < 0 
                        ? 'bg-rose-500' 
                        : 'bg-[#B46D52]'
                    }`}
                    style={{ width: `${Math.min(100, (totalSelectedPieces / currentSize.maxPieces) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Solo Box Guidance Notice */}
              {selectedSizeId === 'solo' && (
                <div className="bg-[#FAF0EA] border border-[#E8CFC2] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-[#2D2421] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#B46D52]" />
                      <span>بوكس الفرد الواحد المثالي (وجبة شخص واحد)</span>
                    </div>
                    <p className="text-[#6B5B55]">
                      المعادلة الذهبية للبوكس: 2 ميني ساندوتش طازج + 1 قطعة جاتوه فرنسي + 1 زجاجة عصير فريش طبيعي.
                    </p>
                  </div>
                  <button
                    onClick={() => autoFillPreset(4)}
                    className="px-3 py-1.5 bg-[#B46D52] hover:bg-[#9B5A42] text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                  >
                    توزيع البوكس التلقائي
                  </button>
                </div>
              )}

              {/* Fillings Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4EDE7] rounded-lg w-fit text-xs font-medium">
                <button
                  onClick={() => setFillingsFilter('all')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    fillingsFilter === 'all' ? 'bg-white text-[#2D2421] shadow-xs font-bold' : 'text-[#6B5B55] hover:text-[#2D2421]'
                  }`}
                >
                  جميع الأصناف ({BOX_FILLINGS.length})
                </button>
                <button
                  onClick={() => setFillingsFilter('savory')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    fillingsFilter === 'savory' ? 'bg-white text-[#2D2421] shadow-xs font-bold' : 'text-[#6B5B55] hover:text-[#2D2421]'
                  }`}
                >
                  ساندوتشات وموالح ({BOX_FILLINGS.filter(f => f.category === 'savory').length})
                </button>
                <button
                  onClick={() => setFillingsFilter('sweet')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    fillingsFilter === 'sweet' ? 'bg-white text-[#2D2421] shadow-xs font-bold' : 'text-[#6B5B55] hover:text-[#2D2421]'
                  }`}
                >
                  جاتوهات وسواريه ({BOX_FILLINGS.filter(f => f.category === 'sweet').length})
                </button>
                <button
                  onClick={() => setFillingsFilter('drink')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    fillingsFilter === 'drink' ? 'bg-white text-[#2D2421] shadow-xs font-bold' : 'text-[#6B5B55] hover:text-[#2D2421]'
                  }`}
                >
                  عصائر طبيعية فريش ({BOX_FILLINGS.filter(f => f.category === 'drink').length})
                </button>
              </div>

              {/* Items List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {visibleFillings.map(item => {
                  const qty = selectedFillings[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        qty > 0 
                          ? 'border-[#B46D52] bg-[#FAF5F2]' 
                          : 'border-[#E8DFD8] hover:border-[#D6C7BE] bg-white'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2D2421]">{item.name}</span>
                        </div>
                        <p className="text-[11px] text-[#7D6B64] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="text-[11px] text-[#937D74] pt-0.5">
                          <span>{item.type}</span>
                          <span aria-hidden="true"> · </span>
                          <span className="font-medium text-[#B46D52] tabular-nums">{item.pricePerPiece} ج.م / قطعة</span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-[#E3D6CD] shrink-0 self-center">
                        <button
                          onClick={() => handleUpdateItem(item.id, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5ECE5] disabled:opacity-30 disabled:hover:bg-transparent text-[#2D2421] transition-colors"
                          aria-label={`إنقاص ${item.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold tabular-nums text-[#2D2421]">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleUpdateItem(item.id, +1)}
                          disabled={remainingSlots <= 0}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-[#FAF0EA] hover:bg-[#F2DFD4] text-[#B46D52] transition-colors disabled:opacity-40"
                          aria-label={`زيادة ${item.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Ribbon & Custom Tag */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8DFD8] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#2D2421] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FAF0EA] text-[#B46D52] flex items-center justify-center text-xs font-bold">4</span>
                  لمسات التزيين وكارت الإهداء المجاني
                </span>
                <span className="text-xs text-[#82726B]">طباعة مجانية لاسم المحتفى به وثيمك</span>
              </div>

              {/* Ribbon Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#4F413B] block">
                  اختر لون شريط الساتان الحريري للبوكس:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RIBBON_COLORS.map(ribbon => {
                    const isSelected = ribbonColorId === ribbon.id;
                    return (
                      <button
                        key={ribbon.id}
                        onClick={() => setRibbonColorId(ribbon.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all ${
                          isSelected
                            ? 'border-[#B46D52] bg-[#FAF0EA] ring-1 ring-[#B46D52]'
                            : 'border-[#E8DFD8] hover:border-[#D6C7BE] bg-white'
                        }`}
                      >
                        <span 
                          className="w-5 h-5 rounded-full border border-black/10 shrink-0 shadow-xs"
                          style={{ backgroundColor: ribbon.hex }}
                        ></span>
                        <span className="text-xs font-medium text-[#2D2421] truncate">{ribbon.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name and Card input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4F413B] block">
                    الاسم أو العنوان المطبوع على الكارت الخارجي:
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="مثال: ألف مبروك التخرج يا سارة"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] focus:border-[#B46D52] focus:ring-1 focus:ring-[#B46D52] outline-none bg-[#FAF7F5]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4F413B] block">
                    عبارة التهنئة المطبوعة داخل الكارت:
                  </label>
                  <input
                    type="text"
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder="اكتب تهنئة خاصة أو عبارة شكر للضيوف..."
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D9CCC2] focus:border-[#B46D52] focus:ring-1 focus:ring-[#B46D52] outline-none bg-[#FAF7F5]"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Summary / Live Preview (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-[#E3D6CD] shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0E8E1] pb-3.5">
                <span className="font-extrabold text-base text-[#2D2421]">معاينة البوكس المخصص</span>
                <span className="text-xs font-medium text-[#B46D52]">تجهيز فوري</span>
              </div>

              {/* Visual Box Mockup Representation */}
              <div className="relative rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8DFD8] p-4 text-center space-y-3">
                {/* Ribbon strip across mockup */}
                <div 
                  className="h-2.5 w-full rounded-full shadow-xs"
                  style={{ backgroundColor: currentRibbon.hex }}
                  title={`شريط ${currentRibbon.name}`}
                ></div>

                {/* Box Title & Occasion */}
                <div>
                  <div className="text-xs font-bold text-[#B46D52]">{currentOccasion.label}</div>
                  <div className="text-base font-extrabold text-[#2D2421] mt-0.5">{currentSize.name}</div>
                  <div className="text-xs text-[#7D6B64] mt-0.5">
                    {totalSelectedPieces} قطعة مشكلة مع تغليف حراري فاخر
                  </div>
                </div>

                {/* Printable Card Tag Mockup */}
                <div className="bg-[#FFFDFB] border border-dashed border-[#D4C3B7] p-3 rounded-lg text-right shadow-xs space-y-1">
                  <div className="text-[10px] text-[#A69389]">كارت الإهداء الخارجي المطبوع:</div>
                  <div className="text-xs font-bold text-[#2D2421]">{recipientName || 'بدون اسم مخصص'}</div>
                  <div className="text-[11px] text-[#6B5B55] italic">"{cardMessage || 'أهلاً وسهلاً بضيوفنا'}"</div>
                </div>

                {/* Mini Breakdown of Selected Flavors */}
                <div className="text-right text-xs space-y-1 pt-1 border-t border-[#F0E8E1]">
                  <div className="font-semibold text-[#4F413B]">الأصناف المختارة:</div>
                  {totalSelectedPieces === 0 ? (
                    <div className="text-[#A38E84] text-[11px] py-1">لم يتم اختيار أصناف بعد. اضغط تعبئة متوازنة أو اختر يدوياً.</div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                      {Object.entries(selectedFillings).map(([id, qty]) => {
                        const item = BOX_FILLINGS.find(f => f.id === id);
                        if (!item || qty <= 0) return null;
                        return (
                          <div key={id} className="flex items-center justify-between text-[11px] text-[#6B5B55]">
                            <span className="truncate max-w-[170px]">{item.name}</span>
                            <span className="font-bold tabular-nums text-[#2D2421]">{qty}x</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 pt-2 border-t border-[#F0E8E1]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B5B55]">قيمة البوكس والمحتويات:</span>
                  <span className="font-extrabold text-xl text-[#2D2421] tabular-nums">
                    {calculatedPrice} ج.م
                  </span>
                </div>
                <div className="text-[11px] text-[#8C7A72]">
                  شامل طباعة الكارت المخصص، الشريط الساتان، والتغليف الحراري المحكم.
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={totalSelectedPieces === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-base font-bold text-white bg-[#B46D52] hover:bg-[#9B5A42] disabled:opacity-50 disabled:hover:bg-[#B46D52] rounded-xl shadow-md transition-all whitespace-nowrap"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>إضافة البوكس المخصص للسلة</span>
              </button>

            </div>

            {/* Notification Banner */}
            {notification && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold text-center animate-fade-in">
                {notification}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
