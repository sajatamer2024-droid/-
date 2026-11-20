export type OccasionType = 
  | 'birthday'
  | 'graduation'
  | 'wedding'
  | 'baby_shower'
  | 'corporate'
  | 'eid_holiday'
  | 'general';

export interface CateringProduct {
  id: string;
  title: string;
  category: 'sandwiches' | 'gateaux' | 'favors' | 'bundles' | 'solo' | 'gift_cards';
  price: number;
  piecesCount: number;
  servesPeople: string;
  description: string;
  image: string;
  itemsList: string[];
  dietary?: string;
  badge?: string;
  popular?: boolean;
  isWeeklyDeal?: boolean;
  discountPercent?: number;
  isGiftCard?: boolean;
}

export interface BoxFillingItem {
  id: string;
  name: string;
  category: 'savory' | 'sweet' | 'drink';
  type: string;
  pricePerPiece: number;
  imageAlt: string;
  description: string;
  popular?: boolean;
}

export interface CustomBoxConfig {
  occasion: OccasionType;
  occasionTitle: string;
  boxSize: 'solo' | 'mini' | 'classic' | 'royal' | 'tower';
  boxName: string;
  maxPieces: number;
  ribbonColor: string;
  ribbonColorName: string;
  recipientName: string;
  cardMessage: string;
  selectedFillings: { [itemId: string]: number };
  baseBoxPrice: number;
}

export interface GiftCardDetails {
  code: string;
  amount: number;
  recipientName: string;
  senderName: string;
  deliveryChannel: 'whatsapp' | 'email';
  recipientContact: string;
  personalMessage?: string;
}

export interface EGiftCardRecord extends GiftCardDetails {
  id: string;
  createdAt: string;
  isRedeemed?: boolean;
}

export interface CartItem {
  cartItemId: string;
  type: 'catalog' | 'custom_box' | 'gift_card';
  title: string;
  price: number;
  quantity: number;
  image: string;
  piecesCount?: number;
  details?: string[];
  customBoxConfig?: CustomBoxConfig;
  giftCardDetails?: GiftCardDetails;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'app_blueprint' | 'marketing' | 'photography' | 'b2b_proposals' | 'card_copywriting';
  categoryLabel: string;
  recommendedModel: string;
  summary: string;
  promptText: string;
  keyOutputs: string[];
  tips: string[];
}

export type OrderStatus = 
  | 'confirmed'     // تم تأكيد واستلام الطلب
  | 'baking'        // جاري الخبز والتحضير الطازج
  | 'packaging'     // مرحلة التغليف والشرائط وطباعة الكروت
  | 'out_for_delivery' // في الطريق مع التوصيل المبرد
  | 'delivered';    // تم التسليم بنجاح في موقع الحفل

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  completedAt?: string;
}

export interface OrderRating {
  stars: number;
  packagingRating?: number;  // تجربة التغليف والشرائط
  qualityRating?: number;    // جودة المكونات والطزاجة
  deliveryRating?: number;   // سرعة ودقة التوصيل المبرد
  comment?: string;
  tags?: string[];
  submittedAt: string;
}

export interface OrderActivityLogEntry {
  id: string;
  status: OrderStatus;
  statusLabel: string;
  timestamp: string;
  note?: string;
  actor?: string;
}

export interface TrackedOrder {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  eventDate: string;
  eventTimeSlot: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  status: OrderStatus;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
  lastUpdated: string;
  activityLog?: OrderActivityLogEntry[];
  rating?: OrderRating;
}

