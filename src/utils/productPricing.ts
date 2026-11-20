import { CateringProduct } from '../types/catering';

export interface ProductPricingInfo {
  hasDiscount: boolean;
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  savings: number;
}

export function getProductPricing(product: Pick<CateringProduct, 'price' | 'isWeeklyDeal' | 'discountPercent'>): ProductPricingInfo {
  const originalPrice = Math.max(1, Number(product.price) || 1);
  const rawPercent = Number(product.discountPercent) || 0;
  const isDealActive = Boolean(product.isWeeklyDeal) && rawPercent > 0 && rawPercent < 100;

  if (!isDealActive) {
    return {
      hasDiscount: false,
      originalPrice,
      discountPercent: 0,
      finalPrice: originalPrice,
      savings: 0,
    };
  }

  const discountPercent = Math.min(90, Math.max(1, Math.round(rawPercent)));
  const finalPrice = Math.max(1, Math.round(originalPrice * (1 - discountPercent / 100)));
  const savings = Math.max(0, originalPrice - finalPrice);

  return {
    hasDiscount: true,
    originalPrice,
    discountPercent,
    finalPrice,
    savings,
  };
}
