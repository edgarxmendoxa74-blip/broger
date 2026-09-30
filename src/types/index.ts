export interface Variation {
  id: string;
  name: string;
  price: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image?: string;
  popular?: boolean;
  available?: boolean;
  sort_order?: number;
  variations?: Variation[];
  addOns?: AddOn[];
  // Discount pricing fields
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  discountActive?: boolean;
  // Computed effective price (calculated in the app)
  effectivePrice?: number;
  isOnDiscount?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariation?: Variation;
  selectedAddOns?: AddOn[];
  totalPrice: number;
}

export interface OrderData {
  items: CartItem[];
  customerName: string;
  contactNumber: string;
  serviceType: 'dine-in' | 'pickup' | 'delivery';
  address?: string;
  pickupTime?: string;
  // Dine-in specific fields
  partySize?: number;
  dineInTime?: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  total: number;
  notes?: string;
}

export type PaymentMethod = 'gcash' | 'maya' | 'bank-transfer' | 'cash-on-delivery';
export type ServiceType = 'dine-in' | 'pickup' | 'delivery';

// Service Option Types
export interface ServiceOption {
  id: string;
  name: string;
  icon: string;
  description?: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Site Settings Types
export interface SiteSetting {
  id: string;
  value: string;
  type: 'text' | 'image' | 'boolean' | 'number';
  description?: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_logo: string;
  site_description: string;
  currency: string;
  currency_code: string;
  hero_image: string;
  free_delivery_threshold: number;
}

// Review Types
export interface Review {
  id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  approved: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewFormData {
  customer_name: string;
  customer_email?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
}