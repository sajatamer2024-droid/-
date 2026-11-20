import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { CustomBoxBuilder } from './components/CustomBoxBuilder';
import { CateringCalculator } from './components/CateringCalculator';
import { EventBudgetPlanner } from './components/EventBudgetPlanner';
import { OrderTracker } from './components/OrderTracker';
import { EventCountdownReminder } from './components/EventCountdownReminder';
import { AiEventAssistant } from './components/AiEventAssistant';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Footer } from './components/Footer';
import { PublishShareModal } from './components/PublishShareModal';
import { MobileAppInstallModal } from './components/MobileAppInstallModal';
import { EventShowcaseSlideshow } from './components/EventShowcaseSlideshow';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { EGiftCardModal } from './components/EGiftCardModal';
import { ToastContainer, AppToast } from './components/ToastContainer';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  CartItem,
  TrackedOrder,
  OrderStatus,
  OrderRating,
  CateringProduct,
  EGiftCardRecord
} from './types/catering';
import { INITIAL_ORDERS, CATERING_PRODUCTS } from './data/cateringData';
import { createActivityLogEntry, ensureOrderActivityLog, formatActivityTimestamp, getOrderStatusLabel } from './utils/orderActivity';

const DEFAULT_GIFT_CARD_RECORDS: EGiftCardRecord[] = [
  {
    id: 'demo-gift-100',
    code: 'BAHJAH-GIFT-100',
    amount: 100,
    recipientName: 'ضيف بهجة',
    senderName: 'إدارة متجر بهجة',
    deliveryChannel: 'whatsapp',
    recipientContact: '',
    personalMessage: 'هدية ترحيبية بقيمة 100 ج.م صالحة للاستخدام على جميع بوكسات الضيافة.',
    createdAt: 'مفعّل الآن',
    isRedeemed: false,
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isGiftCardModalOpen, setIsGiftCardModalOpen] = useState<boolean>(false);
  const [selectedGiftCardProduct, setSelectedGiftCardProduct] = useState<CateringProduct | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleDirectInstall = async () => {
    if (isInstalled) {
      pushToast({
        variant: 'info',
        title: 'التطبيق مثبت بالفعل',
        message: 'أنت تستخدم الآن نسخة تطبيق «بَهْجَة» المثبتة على جهازك.',
      });
      return;
    }

    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        pushToast({
          variant: 'payment',
          title: 'تم تثبيت تطبيق «بَهْجَة» بنجاح! 🎉',
          message: 'تمت إضافة التطبيق بشعار بهجة إلى شاشتك الرئيسية بنجاح.',
        });
      }
      return;
    }

    setIsInstallModalOpen(true);
  };

  const pushToast = (toast: Omit<AppToast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [{ ...toast, id }, ...prev].slice(0, 4));
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  // Issued E-Gift Cards State (persisted in localStorage for redemption inside CartDrawer)
  const [issuedGiftCards, setIssuedGiftCards] = useState<EGiftCardRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bahjah_issued_gift_cards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasDemo = parsed.some((c: EGiftCardRecord) => c.code === 'BAHJAH-GIFT-100');
          return hasDemo ? parsed : [...parsed, ...DEFAULT_GIFT_CARD_RECORDS];
        }
      }
    } catch (e) {
      console.error('Error loading gift cards from localStorage:', e);
    }
    return DEFAULT_GIFT_CARD_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bahjah_issued_gift_cards', JSON.stringify(issuedGiftCards));
    } catch (e) {
      console.error('Error saving gift cards to localStorage:', e);
    }
  }, [issuedGiftCards]);

  const handleOpenGiftCardModal = (product?: CateringProduct) => {
    const fallbackGiftProduct = products.find(p => p.isGiftCard || p.category === 'gift_cards') || null;
    setSelectedGiftCardProduct(product || fallbackGiftProduct);
    setIsGiftCardModalOpen(true);
  };

  const handleIssueGiftCard = (record: EGiftCardRecord) => {
    setIssuedGiftCards(prev => {
      const exists = prev.some(c => c.code.toUpperCase() === record.code.toUpperCase());
      if (exists) {
        return prev.map(c =>
          c.code.toUpperCase() === record.code.toUpperCase() ? { ...c, ...record, isRedeemed: c.isRedeemed } : c
        );
      }
      return [record, ...prev];
    });
  };

  const handleRedeemGiftCard = (code: string) => {
    setIssuedGiftCards(prev =>
      prev.map(c =>
        c.code.toUpperCase() === code.trim().toUpperCase() ? { ...c, isRedeemed: true } : c
      )
    );
  };

  // Dynamic Catalog Products State (persisted in localStorage for Admin Dashboard, Weekly Deals & E-Gift Card edits)
  const [products, setProducts] = useState<CateringProduct[]>(() => {
    try {
      const saved = localStorage.getItem('bahjah_catalog_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let nextList: CateringProduct[] = parsed;

          const alreadySeededDeals = localStorage.getItem('bahjah_weekly_deals_seeded');
          if (!alreadySeededDeals) {
            localStorage.setItem('bahjah_weekly_deals_seeded', '1');
            const defaultsById = new Map(CATERING_PRODUCTS.map(p => [p.id, p]));
            nextList = nextList.map((item: CateringProduct) => {
              if (item.isWeeklyDeal !== undefined) return item;
              const def = defaultsById.get(item.id);
              if (def?.isWeeklyDeal) {
                return {
                  ...item,
                  isWeeklyDeal: def.isWeeklyDeal,
                  discountPercent: def.discountPercent,
                };
              }
              return item;
            });
          }

          const alreadySeededGiftCard = localStorage.getItem('bahjah_giftcard_seeded');
          if (!alreadySeededGiftCard) {
            localStorage.setItem('bahjah_giftcard_seeded', '1');
            const defaultGiftCard = CATERING_PRODUCTS.find(p => p.id === 'prod-egift-card');
            if (defaultGiftCard && !nextList.some(p => p.id === 'prod-egift-card' || p.category === 'gift_cards')) {
              nextList = [...nextList, defaultGiftCard];
            }
          }

          return nextList;
        }
      }
      localStorage.setItem('bahjah_weekly_deals_seeded', '1');
      localStorage.setItem('bahjah_giftcard_seeded', '1');
    } catch (e) {
      console.error('Error loading saved products:', e);
    }
    return CATERING_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bahjah_catalog_products', JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage:', e);
    }
  }, [products]);

  const handleUpdateProduct = (updatedProduct: CateringProduct) => {
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const handleAddProduct = (newProduct: CateringProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleResetDefaultProducts = () => {
    setProducts(CATERING_PRODUCTS);
  };
  
  // Wishlist State (persisted in localStorage)
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bahjah_wishlist_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading wishlist from localStorage:', e);
    }
    // Initial sample saved favorites for immediate delight
    return ['prod-solo-signature-box', 'prod-gateaux-royal'];
  });

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem('bahjah_wishlist_ids', JSON.stringify(wishlistProductIds));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlistProductIds]);

  const handleToggleWishlist = (productId: string) => {
    setWishlistProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistProductIds(prev => prev.filter(id => id !== productId));
  };

  const handleClearWishlist = () => {
    setWishlistProductIds([]);
  };

  // Derived full CateringProduct objects in wishlist
  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlistProductIds.includes(p.id));
  }, [wishlistProductIds, products]);

  // Tracked Orders State (with localStorage persistence fallback & activityLog hydration)
  const [orders, setOrders] = useState<TrackedOrder[]>(() => {
    try {
      const saved = localStorage.getItem('bahjah_tracked_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initialByNum = new Map(INITIAL_ORDERS.map(o => [o.orderNumber, o]));
          const hydrated = parsed.map((o: TrackedOrder) => {
            if (o.activityLog && o.activityLog.length > 0) return o;
            const initialMatch = initialByNum.get(o.orderNumber);
            if (initialMatch?.activityLog) {
              return { ...o, activityLog: initialMatch.activityLog };
            }
            return { ...o, activityLog: ensureOrderActivityLog(o) };
          });
          const existingNumbers = new Set(hydrated.map((o: TrackedOrder) => o.orderNumber));
          const missingInitial = INITIAL_ORDERS.filter(o => !existingNumbers.has(o.orderNumber));
          return [...hydrated, ...missingInitial];
        }
      }
    } catch (e) {
      console.error('Error loading saved orders:', e);
    }
    return INITIAL_ORDERS;
  });

  const [activeTrackedOrderNumber, setActiveTrackedOrderNumber] = useState<string>('BAH-1045');

  // Persist orders
  useEffect(() => {
    try {
      localStorage.setItem('bahjah_tracked_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders to localStorage:', e);
    }
  }, [orders]);

  // Navigation helper
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      // If it's a catalog item and already exists, increment quantity
      if (item.type === 'catalog') {
        const existingIdx = prev.findIndex(i => i.title === item.title && i.type === 'catalog');
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + item.quantity,
          };
          return updated;
        }
      }
      return [item, ...prev];
    });

    pushToast({
      variant: 'cart',
      title: 'تمت إضافة المنتج إلى السلة',
      message: `${item.title} (${item.price} ج.م)`,
      actionLabel: 'فتح السلة',
      onAction: () => setIsCartOpen(true),
    });
  };

  const handleAddBudgetPackage = (packageTitle: string, items: CartItem[], totalCost: number) => {
    setCartItems(prev => {
      const updated = [...prev];
      for (const item of items) {
        const existingIdx = updated.findIndex(i => i.title === item.title && i.type === 'catalog');
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + item.quantity,
          };
        } else {
          updated.unshift(item);
        }
      }
      return updated;
    });

    pushToast({
      variant: 'cart',
      title: 'تمت إضافة باقة الميزانية إلى السلة',
      message: `${packageTitle} (${totalCost} ج.م)`,
      actionLabel: 'فتح السلة',
      onAction: () => setIsCartOpen(true),
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Tracker Handlers
  const handleUpdateOrderStatus = (orderNumber: string, newStatus: OrderStatus) => {
    const timestamp = formatActivityTimestamp();
    setOrders(prev =>
      prev.map(order => {
        if (order.orderNumber !== orderNumber) return order;
        const existingLogs = ensureOrderActivityLog(order);
        const nextEntry = createActivityLogEntry(newStatus, undefined, timestamp);
        return {
          ...order,
          status: newStatus,
          lastUpdated: timestamp,
          activityLog: [...existingLogs, nextEntry],
        };
      })
    );

    pushToast({
      variant: 'order_status',
      title: `تحديث حالة الطلب #${orderNumber}`,
      message: `المرحلة الحالية: ${getOrderStatusLabel(newStatus)} (${timestamp})`,
      actionLabel: 'عرض الطلب',
      onAction: () => handleTrackSpecificOrder(orderNumber),
    });
  };

  const handleAddOrderRating = (orderNumber: string, rating: OrderRating) => {
    setOrders(prev =>
      prev.map(order =>
        order.orderNumber === orderNumber
          ? {
              ...order,
              rating,
              lastUpdated: 'الآن',
            }
          : order
      )
    );
  };

  const handleCreateOrder = (newOrder: TrackedOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackedOrderNumber(newOrder.orderNumber);
  };

  const handleTrackSpecificOrder = (orderNumber: string) => {
    setActiveTrackedOrderNumber(orderNumber);
    handleNavigate('tracker');
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#231815] flex flex-col font-sans">
      {/* Top Navigation conforming to strict contract */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistProductIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenInstallModal={handleDirectInstall}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onOpenAdminDashboard={() => setIsAdminModalOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <div id="hero">
          <HeroSection
            onStartCustomBox={() => handleNavigate('builder')}
            onExploreCatalog={() => handleNavigate('catalog')}
            onOpenReminder={() => handleNavigate('reminder')}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
            onOpenInstallModal={handleDirectInstall}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
          />
        </div>

        {/* Event Countdown & Booking Lead-Time Reminder */}
        <EventCountdownReminder
          onStartBooking={() => handleNavigate('builder')}
        />

        {/* Real Event Showcase Slideshow (العرض التقديمي لتوزيعات المناسبات السابقة مع زر طلب تنسيق مشابه) */}
        <div id="showcase">
          <EventShowcaseSlideshow
            onAddToCart={handleAddToCart}
            onOpenCustomBuilder={() => handleNavigate('builder')}
          />
        </div>

        {/* Ready-made Collections / Catalog */}
        <ProductCatalog 
          products={products}
          onAddToCart={handleAddToCart}
          onUpdateProduct={handleUpdateProduct}
          wishlistProductIds={wishlistProductIds}
          onToggleWishlist={handleToggleWishlist}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAdminDashboard={() => setIsAdminModalOpen(true)}
          onOpenGiftCardModal={handleOpenGiftCardModal}
        />

        {/* Interactive Custom Box Builder */}
        <CustomBoxBuilder onAddCustomBoxToCart={handleAddToCart} />

        {/* Smart Catering & Portions Calculator */}
        <CateringCalculator onAddRecommendedBundleToCart={handleAddToCart} />

        {/* Event Budget Planner */}
        <EventBudgetPlanner
          products={products}
          onAddPackageToCart={handleAddBudgetPackage}
        />

        {/* Order Tracker Component */}
        <OrderTracker
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAddOrderRating={handleAddOrderRating}
          initialSearchQuery={activeTrackedOrderNumber}
          onExploreMenu={() => handleNavigate('catalog')}
        />

        {/* AI Event Stylist & Card Message Generator */}
        <AiEventAssistant />
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCreateOrder={handleCreateOrder}
        onTrackOrder={handleTrackSpecificOrder}
        onPaymentSuccess={({ orderNumber, amount, methodLabel }) => {
          pushToast({
            variant: 'payment',
            title: 'تمت عملية الدفع بنجاح!',
            message: `تم سداد ${amount} ج.م عبر (${methodLabel}) وتأكيد طلبك #${orderNumber}.`,
            actionLabel: 'تتبع الطلب',
            onAction: () => {
              setIsCartOpen(false);
              handleTrackSpecificOrder(orderNumber);
            },
          });
        }}
        onNotifyError={(msg) => {
          pushToast({
            variant: 'error',
            title: 'يرجى استكمال البيانات',
            message: msg,
          });
        }}
        issuedGiftCards={issuedGiftCards}
        onRedeemGiftCard={handleRedeemGiftCard}
        onNotifyGiftCardSent={({ code, recipientName, channel }) => {
          pushToast({
            variant: 'gift_card',
            title: 'تم تجهيز إرسال بطاقة الهدايا',
            message: `تم فتح ${channel === 'whatsapp' ? 'الواتساب' : 'البريد الإلكتروني'} لإرسال كود (${code}) إلى ${recipientName}.`,
          });
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onClearWishlist={handleClearWishlist}
        onAddToCart={handleAddToCart}
        onExploreCatalog={() => handleNavigate('catalog')}
        onOpenGiftCardModal={handleOpenGiftCardModal}
      />

      {/* Digital E-Gift Card Customization Modal */}
      <EGiftCardModal
        isOpen={isGiftCardModalOpen}
        onClose={() => setIsGiftCardModalOpen(false)}
        product={selectedGiftCardProduct}
        onAddToCart={handleAddToCart}
        onIssueGiftCard={handleIssueGiftCard}
        onGiftCardSentToast={({ code, amount, recipientName, channel }) => {
          pushToast({
            variant: 'gift_card',
            title: 'تم إرسال بطاقة الهدايا وتفعيل الكود!',
            message: `كود الخصم ${code} بقيمة ${amount} ج.م جاهز الآن للمستلم (${recipientName}) عبر ${
              channel === 'whatsapp' ? 'الواتساب' : 'البريد الإلكتروني'
            }.`,
          });
        }}
      />

      {/* Admin Control Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        products={products}
        onUpdateProduct={handleUpdateProduct}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetDefaults={handleResetDefaultProducts}
      />

      {/* Mobile App Install Modal (PWA fallback / iOS guide) */}
      <MobileAppInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstalled={() => {
          pushToast({
            variant: 'payment',
            title: 'تم تثبيت تطبيق «بَهْجَة» بنجاح! 🎉',
            message: 'تمت إضافة التطبيق بشعار بهجة إلى شاشتك الرئيسية.',
          });
        }}
      />

      {/* Publish & Share Modal */}
      <PublishShareModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
        onOpenInstallModal={handleDirectInstall}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onOpenAdminDashboard={() => setIsAdminModalOpen(true)}
      />
    </div>
  );
}
