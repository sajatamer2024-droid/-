import React, { useState } from 'react';
import {
  ShoppingBag,
  Share2,
  Sparkles,
  Heart,
  Smartphone,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  onOpenInstallModal?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onOpenAdminDashboard?: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenPublishModal: () => void;
}

const NAV_LINKS = [
  { id: 'hero', label: 'الرئيسية' },
  { id: 'reminder', label: 'العد التنازلي' },
  { id: 'showcase', label: 'معرض الأعمال' },
  { id: 'catalog', label: 'البوكسات' },
  { id: 'builder', label: 'صمّم بوكسك' },
  { id: 'calculator', label: 'حاسبة المعازيم' },
  { id: 'budget', label: 'مخطط الميزانية' },
  { id: 'tracker', label: 'تتبع الطلبات' },
];

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist,
  onOpenInstallModal,
  isInstallable = false,
  isInstalled = false,
  onOpenAdminDashboard,
  activeSection,
  onNavigate,
  onOpenPublishModal,
}) => {
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 w-full max-w-full overflow-x-clip">
      {/* Top Announcement Bar */}
      {showTopBanner && (
        <div className="bg-gradient-to-r from-[#8E3B20] via-[#B85333] to-[#D97736] text-white text-xs py-1.5 px-3 sm:px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="shrink-0 flex items-center gap-1 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#FFE8B3]" />
                <span>رابط النشر المباشر:</span>
              </span>
              <button
                onClick={onOpenPublishModal}
                className="underline underline-offset-2 hover:text-[#FFE8B3] font-bold shrink-0 transition-colors cursor-pointer"
              >
                نسخ ومشاركة 🔗
              </button>
              {onOpenInstallModal && !isInstalled && (
                <button
                  onClick={onOpenInstallModal}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-0.5 rounded-full shrink-0 transition-all cursor-pointer flex items-center gap-1.5 text-[11px]"
                >
                  <img
                    src="/pwa-192x192.png"
                    alt="شعار بهجة"
                    className="w-4 h-4 rounded-full object-cover bg-[#FAF8F3]"
                  />
                  <span>{isInstallable ? 'تثبيت التطبيق مباشرة' : 'تثبيت التطبيق 📲'}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowTopBanner(false)}
              className="text-white/80 hover:text-white text-[11px] shrink-0 px-1.5 py-0.5 cursor-pointer"
              aria-label="إخفاء الشريط"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Header — Zero Horizontal Overflow */}
      <header className="bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#E8DCD0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          {/* Zone 1: Brand Wordmark + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="xl:hidden p-2 rounded-xl bg-white hover:bg-[#F5ECE1] border border-[#DECFC0] text-[#231815] transition-colors cursor-pointer"
              aria-label="فتح قائمة الأقسام والإعدادات"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleLinkClick('hero')}
              className="text-lg sm:text-xl font-black tracking-tight text-[#231815] hover:text-[#B85333] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <img
                src="/pwa-192x192.png"
                alt="شعار بهجة للضيافة"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain bg-[#FAF8F3] border border-[#DECFC0] shadow-2xs shrink-0"
              />
              <span className="flex items-baseline gap-1.5">
                <span>بَهْجَة</span>
                <span className="text-[11px] font-semibold text-[#8C766B] hidden sm:inline">للضيافة</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Wide Desktop Nav Links (only on xl+ where space is guaranteed) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-[13px] font-semibold text-[#66544D] min-w-0">
            {NAV_LINKS.map(link => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`hover:text-[#231815] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                    isActive
                      ? 'text-[#B85333] font-bold underline underline-offset-8 decoration-2 decoration-[#B85333]'
                      : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Toolbar & Settings Actions — Always 100% Visible Inside Viewport */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Settings / Admin Dashboard Button */}
            {onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold text-[#231815] bg-white hover:bg-[#F5ECE1] border border-[#DECFC0] rounded-xl transition-all whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
                title="لوحة تحكم المنتجات والأسعار والصور"
                aria-label="الإعدادات ولوحة التحكم"
              >
                <Settings className="w-4 h-4 text-[#B85333]" />
                <span className="hidden sm:inline">لوحة التحكم</span>
              </button>
            )}

            {/* Wishlist Button */}
            {onOpenWishlist && (
              <button
                onClick={onOpenWishlist}
                className="relative flex items-center justify-center p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
                title="قائمة أمنياتك المحفوظة"
                aria-label="عرض قائمة الأمنيات"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-rose-600'}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold tabular-nums shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile App Direct Install Button */}
            {onOpenInstallModal && !isInstalled && (
              <button
                onClick={onOpenInstallModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#B85333] bg-[#FAF0E6] hover:bg-[#F2DFD4] border border-[#ECD9CA] rounded-xl transition-all whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
                title={isInstallable ? 'تثبيت التطبيق مباشرة على جهازك' : 'تثبيت التطبيق على الموبايل'}
                aria-label="تثبيت تطبيق بهجة"
              >
                <img
                  src="/pwa-192x192.png"
                  alt=""
                  className="w-4.5 h-4.5 rounded-md object-contain bg-[#FAF8F3] border border-[#DECFC0]"
                />
                <span className="hidden md:inline">
                  {isInstallable ? 'تثبيت التطبيق' : 'التطبيق'}
                </span>
              </button>
            )}

            {/* Share Published URL Button */}
            <button
              onClick={onOpenPublishModal}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-[#B85333] bg-[#F5ECE1] hover:bg-[#EBDDCF] border border-[#DECFC0] rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer"
              title="رابط النشر ومشاركة المتجر"
              aria-label="مشاركة المتجر"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">مشاركة</span>
            </button>

            {/* Primary Action: Shopping Cart */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold text-white bg-[#231815] hover:bg-[#3D2C27] rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
              aria-label="عرض سلة المشتريات"
            >
              <ShoppingBag className="w-4 h-4 text-[#D97736]" />
              <span>السلة</span>
              {cartCount > 0 && (
                <span className="bg-[#B85333] text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Compact Visible Quick-Nav Strip on screens < xl (always inside viewport, horizontal scroll if narrow) */}
        <div className="xl:hidden border-t border-[#ECE0D4] bg-[#F6EFE6]/90 px-3 py-1.5 overflow-x-auto">
          <div className="flex items-center gap-1.5 w-max mx-auto">
            {NAV_LINKS.map(link => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#B85333] text-white shadow-2xs'
                      : 'bg-white/80 text-[#5E4D46] hover:bg-white hover:text-[#231815] border border-[#E5D5C8]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Expandable Dropdown Menu for Mobile / Tablet Tools & Settings */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-[#E5D5C8] px-4 py-4 shadow-lg space-y-4 animate-in fade-in">
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold text-[#8C766B]">أقسام الصفحة</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {NAV_LINKS.map(link => {
                  const isActive = activeSection === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-right border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#FAF0EA] text-[#B85333] border-[#B85333]'
                          : 'bg-[#FAF6F0] text-[#231815] border-[#E8DCD0] hover:bg-[#F2ECE4]'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#F0E8E1]">
              <div className="text-[11px] font-extrabold text-[#8C766B]">الأدوات والإعدادات السريعة</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {onOpenAdminDashboard && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAdminDashboard();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#231815] text-white text-xs font-bold cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#FFE8B3]" />
                    <span>لوحة التحكم (المنتجات والأسعار)</span>
                  </button>
                )}

                {onOpenInstallModal && !isInstalled && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenInstallModal();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#FAF0E6] text-[#B85333] border border-[#ECD9CA] text-xs font-bold cursor-pointer"
                  >
                    <img
                      src="/pwa-192x192.png"
                      alt=""
                      className="w-4.5 h-4.5 rounded-md object-contain bg-[#FAF8F3]"
                    />
                    <span>{isInstallable ? 'تثبيت التطبيق مباشرة' : 'تثبيت التطبيق على الموبايل'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPublishModal();
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#F5ECE1] text-[#B85333] border border-[#DECFC0] text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة رابط المتجر</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
