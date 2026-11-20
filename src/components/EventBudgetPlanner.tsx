import React, { useMemo, useState } from 'react';
import {
  Wallet,
  Sparkles,
  ShoppingBag,
  Check,
  ShieldCheck,
  PackageCheck,
  Users,
  Tag,
  TrendingDown,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import { CateringProduct, CartItem } from '../types/catering';
import { getProductPricing } from '../utils/productPricing';

interface EventBudgetPlannerProps {
  products: CateringProduct[];
  onAddPackageToCart: (packageTitle: string, items: CartItem[], totalCost: number) => void;
}

type FocusMode = 'all' | 'solo' | 'buffet' | 'luxury';

interface PlannedPackageLine {
  product: CateringProduct;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
}

interface BudgetPackageOption {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  lines: PlannedPackageLine[];
  itemsSubtotal: number;
  deliveryFee: number;
  effectiveTotal: number;
  remainingBudget: number;
  totalPieces: number;
  totalSavings: number;
  estimatedGuestsLabel: string;
}

const PRESET_BUDGETS = [500, 1000, 1500, 2500, 4000, 6000];

function estimateProductGuests(product: CateringProduct): number {
  if (product.id === 'prod-solo-pack-25') return 25;
  if (product.id === 'prod-solo-pack-10') return 10;
  if (product.id === 'prod-individual-favors') return 15;
  if (product.id === 'prod-celebration-bundle') return 20;
  if (product.category === 'solo') return 1;
  const nums = product.servesPeople.match(/\d+/g);
  if (nums && nums.length > 0) {
    const parsed = nums.map(Number);
    return Math.round(parsed.reduce((a, b) => a + b, 0) / parsed.length);
  }
  return Math.max(1, Math.round(product.piecesCount / 3));
}

function packGreedy(
  pool: { product: CateringProduct; price: number; originalPrice: number; hasDiscount: boolean; discountPercent: number }[],
  maxSpending: number,
  maxDistinctProducts = 4,
  preferVariety = false
): PlannedPackageLine[] {
  const counts = new Map<string, PlannedPackageLine>();
  let remaining = maxSpending;

  if (preferVariety) {
    // First pass: pick up to 1 of each distinct product in priority order so the package is diverse
    for (const entry of pool) {
      if (counts.size >= maxDistinctProducts) break;
      if (entry.price <= remaining) {
        counts.set(entry.product.id, {
          product: entry.product,
          quantity: 1,
          unitPrice: entry.price,
          originalUnitPrice: entry.originalPrice,
          hasDiscount: entry.hasDiscount,
          discountPercent: entry.discountPercent,
        });
        remaining -= entry.price;
      }
    }
  }

  // Fill remaining budget starting from highest-priority fitting items
  let safety = 0;
  while (safety < 60) {
    safety++;
    let addedSomething = false;
    for (const entry of pool) {
      if (entry.price <= remaining) {
        const existing = counts.get(entry.product.id);
        if (!existing && counts.size >= maxDistinctProducts) continue;
        if (existing) {
          existing.quantity += 1;
        } else {
          counts.set(entry.product.id, {
            product: entry.product,
            quantity: 1,
            unitPrice: entry.price,
            originalUnitPrice: entry.originalPrice,
            hasDiscount: entry.hasDiscount,
            discountPercent: entry.discountPercent,
          });
        }
        remaining -= entry.price;
        addedSomething = true;
        break;
      }
    }
    if (!addedSomething) break;
  }

  return Array.from(counts.values());
}

export const EventBudgetPlanner: React.FC<EventBudgetPlannerProps> = ({
  products,
  onAddPackageToCart,
}) => {
  const [totalBudget, setTotalBudget] = useState<number>(1500);
  const [focusMode, setFocusMode] = useState<FocusMode>('all');
  const [includeDeliveryInBudget, setIncludeDeliveryInBudget] = useState<boolean>(true);
  const [addedPackageId, setAddedPackageId] = useState<string | null>(null);

  const eligibleCatalog = useMemo(() => {
    return products
      .filter(p => !p.isGiftCard && p.category !== 'gift_cards')
      .map(product => {
        const pricing = getProductPricing(product);
        return {
          product,
          price: pricing.finalPrice,
          originalPrice: pricing.originalPrice,
          hasDiscount: pricing.hasDiscount,
          discountPercent: pricing.discountPercent,
          savings: pricing.savings,
        };
      })
      .filter(item => item.price > 0);
  }, [products]);

  const minItemPrice = useMemo(() => {
    if (eligibleCatalog.length === 0) return 70;
    return Math.min(...eligibleCatalog.map(i => i.price));
  }, [eligibleCatalog]);

  const minimumRequiredBudget = includeDeliveryInBudget && minItemPrice <= 750 ? minItemPrice + 50 : minItemPrice;

  const recommendedPackages = useMemo<BudgetPackageOption[]>(() => {
    const safeBudget = Math.max(0, Math.round(Number(totalBudget) || 0));
    if (eligibleCatalog.length === 0 || safeBudget < minimumRequiredBudget) {
      return [];
    }

    // Determine max items subtotal such that itemsSubtotal + (delivery if <= 750) <= safeBudget
    const maxAllowedSubtotal = (rawBudget: number): number => {
      if (!includeDeliveryInBudget) return rawBudget;
      if (rawBudget > 750) {
        // Could reach > 750 subtotal (free delivery) OR <= 750 subtotal (+50 delivery)
        return rawBudget;
      }
      return Math.max(0, rawBudget - 50);
    };

    const enforceBudgetCap = (lines: PlannedPackageLine[]): {
      lines: PlannedPackageLine[];
      itemsSubtotal: number;
      deliveryFee: number;
      effectiveTotal: number;
    } | null => {
      if (lines.length === 0) return null;
      const working = lines.map(l => ({ ...l }));

      const computeTotals = (arr: PlannedPackageLine[]) => {
        const itemsSubtotal = arr.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
        const deliveryFee = itemsSubtotal > 750 ? 0 : 50;
        const effectiveTotal = includeDeliveryInBudget ? itemsSubtotal + deliveryFee : itemsSubtotal;
        return { itemsSubtotal, deliveryFee, effectiveTotal };
      };

      let totals = computeTotals(working);
      let guard = 0;
      while (totals.effectiveTotal > safeBudget && guard < 100) {
        guard++;
        // Remove 1 unit from the lowest-quantity or smallest/cheapest adjustable line
        const sortedIdx = working
          .map((l, idx) => ({ l, idx }))
          .filter(x => x.l.quantity > 0)
          .sort((a, b) => a.l.unitPrice - b.l.unitPrice);

        if (sortedIdx.length === 0) break;
        const target = working[sortedIdx[0].idx];
        target.quantity -= 1;
        if (target.quantity <= 0) {
          working.splice(sortedIdx[0].idx, 1);
        }
        totals = computeTotals(working);
      }

      if (working.length === 0 || totals.effectiveTotal > safeBudget) {
        return null;
      }

      return {
        lines: working,
        ...totals,
      };
    };

    const spendingCap = maxAllowedSubtotal(safeBudget);

    // Build 4 complementary pools aligned with customer preferences
    const soloPool = [...eligibleCatalog].sort((a, b) => {
      const aSolo = a.product.category === 'solo' || a.product.category === 'favors' ? 1 : 0;
      const bSolo = b.product.category === 'solo' || b.product.category === 'favors' ? 1 : 0;
      if (aSolo !== bSolo) return bSolo - aSolo;
      return b.price - a.price;
    });

    const balancedPool = [...eligibleCatalog].sort((a, b) => {
      const priority = (cat: string) => {
        if (cat === 'bundles') return 5;
        if (cat === 'sandwiches') return 4;
        if (cat === 'gateaux') return 4;
        if (cat === 'favors') return 3;
        return 2;
      };
      const scoreA = priority(a.product.category) + (a.hasDiscount ? 2 : 0);
      const scoreB = priority(b.product.category) + (b.hasDiscount ? 2 : 0);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return b.price - a.price;
    });

    const maxPiecesPool = [...eligibleCatalog].sort((a, b) => {
      const ratioA = a.product.piecesCount / a.price;
      const ratioB = b.product.piecesCount / b.price;
      return ratioB - ratioA;
    });

    const luxuryPool = [...eligibleCatalog].sort((a, b) => {
      const luxScore = (p: CateringProduct) =>
        (p.id.includes('royal') || p.category === 'bundles' || p.category === 'favors' || p.category === 'gateaux' ? 3 : 1);
      const diff = luxScore(b.product) - luxScore(a.product);
      if (diff !== 0) return diff;
      return b.price - a.price;
    });

    const strategies: {
      id: string;
      focus: FocusMode[];
      title: string;
      subtitle: string;
      badge: string;
      accentColor: string;
      lines: PlannedPackageLine[];
    }[] = [
      {
        id: 'balanced-mix',
        focus: ['all', 'buffet'],
        title: 'الباقة المتوازنة (موالح + جاتوهات + توزيعات)',
        subtitle: 'توزيع متناغم بين الميني ساندوتشات والحلويات الفرنسية يناسب معظم الحفلات.',
        badge: 'الترشيح الأفضل للميزانية',
        accentColor: 'bg-[#B85333] text-white',
        lines: packGreedy(balancedPool, spendingCap, 4, true),
      },
      {
        id: 'solo-favors',
        focus: ['all', 'solo'],
        title: 'باقة البوكسات الفردية الجاهزة لكل ضيف',
        subtitle: 'علب فردية مستقلة ومغلفة بشرائط ستان تضمن تقديم نظيف ومنظم بدون هدر.',
        badge: 'توزيعات فردية منظمة',
        accentColor: 'bg-[#231815] text-white',
        lines: packGreedy(soloPool, spendingCap, 3, false),
      },
      {
        id: 'max-value',
        focus: ['all', 'buffet', 'solo'],
        title: 'باقة التوفير القصوى وأكبر عدد قطع',
        subtitle: 'تستفيد من العروض الأسبوعية وأكبر عدد قطع ممكن دون تجاوز سقف الميزانية.',
        badge: 'أعلى كمية قطع',
        accentColor: 'bg-emerald-700 text-white',
        lines: packGreedy(maxPiecesPool, spendingCap, 4, true),
      },
      {
        id: 'luxury-vip',
        focus: ['all', 'luxury'],
        title: 'باقة الفخامة والضيافة الملكية VIP',
        subtitle: 'تركّز على الأصناف الفاخرة وعلب الإهداء المطبوعة لإبهار ضيوفك بأناقة.',
        badge: 'فخامة VIP',
        accentColor: 'bg-amber-700 text-white',
        lines: packGreedy(luxuryPool, spendingCap, 3, true),
      },
    ];

    const filteredStrategies = strategies.filter(s => s.focus.includes(focusMode));
    const seenSignatures = new Set<string>();
    const results: BudgetPackageOption[] = [];

    for (const strat of filteredStrategies) {
      let capped = enforceBudgetCap(strat.lines);
      if (!capped && includeDeliveryInBudget && safeBudget > 750) {
        const retryPool =
          strat.id === 'solo-favors'
            ? soloPool
            : strat.id === 'max-value'
              ? maxPiecesPool
              : strat.id === 'luxury-vip'
                ? luxuryPool
                : balancedPool;
        const retryLines = packGreedy(
          retryPool,
          Math.max(0, safeBudget - 50),
          strat.id === 'solo-favors' || strat.id === 'luxury-vip' ? 3 : 4,
          strat.id !== 'solo-favors'
        );
        capped = enforceBudgetCap(retryLines);
      }
      if (!capped) continue;

      const signature = capped.lines
        .map(l => `${l.product.id}:${l.quantity}`)
        .sort()
        .join('|');

      if (seenSignatures.has(signature)) continue;
      seenSignatures.add(signature);

      const totalPieces = capped.lines.reduce(
        (sum, l) => sum + l.product.piecesCount * l.quantity,
        0
      );
      const totalSavings = capped.lines.reduce(
        (sum, l) => sum + (l.originalUnitPrice - l.unitPrice) * l.quantity,
        0
      );
      const estGuests = capped.lines.reduce(
        (sum, l) => sum + estimateProductGuests(l.product) * l.quantity,
        0
      );

      results.push({
        id: strat.id,
        title: strat.title,
        subtitle: strat.subtitle,
        badge: strat.badge,
        accentColor: strat.accentColor,
        lines: capped.lines,
        itemsSubtotal: capped.itemsSubtotal,
        deliveryFee: capped.deliveryFee,
        effectiveTotal: capped.effectiveTotal,
        remainingBudget: Math.max(0, safeBudget - capped.effectiveTotal),
        totalPieces,
        totalSavings,
        estimatedGuestsLabel: estGuests <= 1 ? 'شخص واحد' : `${estGuests} ضيفاً تقريباً`,
      });
    }

    return results;
  }, [eligibleCatalog, totalBudget, focusMode, includeDeliveryInBudget, minimumRequiredBudget]);

  const handleSelectPackage = (pkg: BudgetPackageOption) => {
    const timestamp = Date.now();
    const cartItems: CartItem[] = pkg.lines.map((line, idx) => {
      const details = [
        `ضمن باقة الميزانية: ${pkg.title}`,
        `الكمية: ${line.product.piecesCount} قطعة / عبوة`,
        `تكفي: ${line.product.servesPeople}`,
      ];
      if (line.hasDiscount) {
        details.push(`عرض أسبوعي -${line.discountPercent}% (بدلاً من ${line.originalUnitPrice} ج.م)`);
      }

      return {
        cartItemId: `budget-${pkg.id}-${line.product.id}-${timestamp}-${idx}`,
        type: 'catalog',
        title: line.hasDiscount
          ? `${line.product.title} (عرض أسبوعي -${line.discountPercent}%)`
          : line.product.title,
        price: line.unitPrice,
        quantity: line.quantity,
        image: line.product.image,
        piecesCount: line.product.piecesCount,
        details,
      };
    });

    onAddPackageToCart(pkg.title, cartItems, pkg.itemsSubtotal);
    setAddedPackageId(pkg.id);
    setTimeout(() => {
      setAddedPackageId(prev => (prev === pkg.id ? null : prev));
    }, 3000);
  };

  return (
    <section
      id="budget"
      className="py-14 lg:py-20 bg-gradient-to-b from-[#FAF6F0] via-[#FBF7F3] to-[#F7F2ED] border-t border-[#E8DCD0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B85333] bg-[#FAF0E6] border border-[#ECD9CA] px-3.5 py-1.5 rounded-full shadow-2xs">
            <Wallet className="w-4 h-4 text-[#D97736]" />
            <span>أداة مخطط ميزانية الحفلة الذكي</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#231815] [text-wrap:balance]">
            حدد ميزانيتك الإجمالية.. واختر باقات لا تتجاوز المبلغ أبداً
          </h2>
          <p className="text-sm sm:text-base text-[#6B5B55] [text-wrap:balance]">
            أدخل المبلغ المتاح لديك لضيافة المناسبة، وسيقوم المخطط تلقائياً بتوليد باقات توزيعات متنوعة ومضمونة السقف مع الاستفادة من العروض الأسبوعية.
          </p>
        </div>

        {/* Budget Control Card */}
        <div className="bg-white rounded-3xl border border-[#DECFC0] shadow-md p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Budget Slider & Input (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-extrabold text-[#231815] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#B85333]" />
                  <span>الميزانية الإجمالية المحددة للحفلة:</span>
                </label>

                <div className="flex items-center gap-2 bg-[#FAF6F0] border border-[#DECFC0] rounded-xl px-3 py-1.5">
                  <input
                    type="number"
                    min={50}
                    max={50000}
                    step={50}
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Math.max(0, Number(e.target.value)))}
                    className="w-24 text-center text-lg font-black text-[#B85333] bg-white border border-[#E5D5C8] rounded-lg py-0.5 outline-none focus:border-[#B85333] tabular-nums"
                    aria-label="الميزانية الإجمالية بالجنيه المصري"
                  />
                  <span className="text-xs font-extrabold text-[#231815]">ج.م</span>
                </div>
              </div>

              <input
                type="range"
                min={150}
                max={10000}
                step={50}
                value={Math.min(10000, Math.max(150, totalBudget || 150))}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full accent-[#B85333] cursor-pointer"
                aria-label="شريط تحديد ميزانية الحفلة"
              />

              {/* Quick Budget Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#7D6B64]">ميزانيات مقترحة:</span>
                {PRESET_BUDGETS.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTotalBudget(val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tabular-nums cursor-pointer border ${
                      totalBudget === val
                        ? 'bg-[#231815] text-white border-[#231815] shadow-2xs'
                        : 'bg-[#FAF6F0] text-[#5E4D46] border-[#E5D5C8] hover:border-[#B85333]'
                    }`}
                  >
                    {val.toLocaleString('en-US')} ج.م
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Mode & Delivery Guardrail (5 cols) */}
            <div className="lg:col-span-5 bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#E8DCD0] space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-[#231815] block">
                  تفضيل تنسيق الباقات المقترحة:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'كل الخيارات المتنوعة' },
                    { id: 'solo', label: 'توزيعات فردية لكل ضيف' },
                    { id: 'buffet', label: 'موالح وحلويات مشاركة' },
                    { id: 'luxury', label: 'فخامة وهدايا VIP' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFocusMode(opt.id as FocusMode)}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                        focusMode === opt.id
                          ? 'bg-[#B85333] text-white border-[#B85333] shadow-2xs'
                          : 'bg-white text-[#5E4D46] border-[#DECFC0] hover:border-[#B85333]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2.5 pt-2 border-t border-[#E8DCD0] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeDeliveryInBudget}
                  onChange={(e) => setIncludeDeliveryInBudget(e.target.checked)}
                  className="mt-0.5 accent-[#B85333] w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-[11px] text-[#5E4D46] leading-relaxed">
                  <strong className="text-[#231815]">حماية سقف الميزانية مع التوصيل:</strong> احتساب رسوم التوصيل (50 ج.م للطلبات ≤ 750 ج.م، ومجاناً فوق 750 ج.م) ضمن المبلغ المحدد.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        {recommendedPackages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#DECFC0] p-8 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#231815]">
              الميزانية المدخلة ({totalBudget} ج.م) أقل من الحد الأدنى للباقات المتاحة
            </h3>
            <p className="text-xs sm:text-sm text-[#6B5B55] leading-relaxed">
              أقل باقة ضيافة متوفرة حالياً تبدأ من{' '}
              <strong className="text-[#B85333] tabular-nums">{minimumRequiredBudget} ج.م</strong>
              {includeDeliveryInBudget && minItemPrice <= 750 ? ' (شاملة التوصيل المبرد)' : ''}.
            </p>
            <button
              type="button"
              onClick={() => setTotalBudget(Math.max(500, minimumRequiredBudget))}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B85333] hover:bg-[#9E472A] text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>ضبط الميزانية إلى {Math.max(500, minimumRequiredBudget)} ج.م</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedPackages.map(pkg => {
              const safeBudget = Math.max(1, totalBudget);
              const utilizationPct = Math.min(100, Math.round((pkg.effectiveTotal / safeBudget) * 100));
              const isJustAdded = addedPackageId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-3xl border border-[#DECFC0] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Top */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${pkg.accentColor}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{pkg.badge}</span>
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-[#231815] leading-snug pt-1">
                          {pkg.title}
                        </h3>
                        <p className="text-xs text-[#6B5B55] leading-relaxed">{pkg.subtitle}</p>
                      </div>

                      <div className="text-left shrink-0 bg-[#FAF6F0] border border-[#E8DCD0] rounded-2xl px-3.5 py-2">
                        <div className="text-[10px] font-bold text-[#7D6B64]">إجمالي الباقة</div>
                        <div className="text-xl font-black text-[#B85333] tabular-nums">
                          {pkg.effectiveTotal} <span className="text-xs font-bold">ج.م</span>
                        </div>
                      </div>
                    </div>

                    {/* Budget Utilization Bar */}
                    <div className="p-3 bg-[#FAF7F3] rounded-2xl border border-[#EDE3D9] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>ضمن الميزانية ({utilizationPct}%)</span>
                        </span>
                        <span className="text-[#5E4D46] tabular-nums">
                          متبقي من ميزانيتك: <strong className="text-[#231815]">{pkg.remainingBudget} ج.م</strong>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#EADFD4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-l from-[#B85333] to-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${utilizationPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Package Key Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 bg-[#FAF6F0] rounded-xl border border-[#EDE3D9]">
                        <div className="text-[#7D6B64] flex items-center justify-center gap-1">
                          <PackageCheck className="w-3.5 h-3.5 text-[#B85333]" />
                          <span>إجمالي القطع</span>
                        </div>
                        <div className="font-extrabold text-[#231815] mt-0.5 tabular-nums">
                          {pkg.totalPieces} قطعة
                        </div>
                      </div>
                      <div className="p-2 bg-[#FAF6F0] rounded-xl border border-[#EDE3D9]">
                        <div className="text-[#7D6B64] flex items-center justify-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#B85333]" />
                          <span>تقدير الضيوف</span>
                        </div>
                        <div className="font-extrabold text-[#231815] mt-0.5 truncate">
                          {pkg.estimatedGuestsLabel}
                        </div>
                      </div>
                      <div className="p-2 bg-[#FAF6F0] rounded-xl border border-[#EDE3D9]">
                        <div className="text-[#7D6B64] flex items-center justify-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-emerald-700" />
                          <span>التوصيل</span>
                        </div>
                        <div className="font-extrabold text-emerald-700 mt-0.5">
                          {pkg.deliveryFee === 0 ? 'مجاني' : `${pkg.deliveryFee} ج.م`}
                        </div>
                      </div>
                    </div>

                    {/* Included Products Breakdown */}
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold text-[#231815]">
                        مكونات الباقة المقترحة:
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto pl-1">
                        {pkg.lines.map(line => (
                          <div
                            key={line.product.id}
                            className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FAF7F5] border border-[#ECE2D9]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={line.product.image}
                                alt={line.product.title}
                                className="w-10 h-10 rounded-lg object-cover border border-[#DECFC0] shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#231815] truncate">
                                  <span className="inline-block bg-[#231815] text-white text-[10px] px-1.5 py-0.2 rounded ml-1.5 tabular-nums">
                                    {line.quantity}×
                                  </span>
                                  {line.product.title}
                                </div>
                                <div className="text-[10px] text-[#7D6B64] flex items-center gap-2 mt-0.5">
                                  <span>{line.product.piecesCount * line.quantity} قطعة</span>
                                  {line.hasDiscount && (
                                    <span className="text-rose-600 font-bold">
                                      عرض أسبوعي -{line.discountPercent}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-xs font-extrabold text-[#B85333] tabular-nums shrink-0">
                              {line.unitPrice * line.quantity} ج.م
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="p-4 sm:p-5 bg-[#FAF6F0] border-t border-[#E8DCD0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-[#5E4D46] space-y-0.5">
                      <div>
                        سعر المنتجات: <strong className="text-[#231815] tabular-nums">{pkg.itemsSubtotal} ج.م</strong>
                        {includeDeliveryInBudget && (
                          <span>
                            {' '}
                            + توصيل:{' '}
                            <strong className={pkg.deliveryFee === 0 ? 'text-emerald-700' : 'text-[#231815]'}>
                              {pkg.deliveryFee === 0 ? 'مجاني' : `${pkg.deliveryFee} ج.م`}
                            </strong>
                          </span>
                        )}
                      </div>
                      {pkg.totalSavings > 0 && (
                        <div className="text-emerald-700 font-bold flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>وفرّت {pkg.totalSavings} ج.م بفضل العروض الأسبوعية!</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPackage(pkg)}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#231815] hover:bg-[#B85333] text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تمت إضافة الباقة للسلة!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>اعتماد الباقة وإضافتها للسلة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
