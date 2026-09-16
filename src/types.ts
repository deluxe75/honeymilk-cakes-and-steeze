export type CakeCategory =
  | 'all'
  | 'signature'
  | 'celebration'
  | 'birthday'
  | 'wedding'
  | 'anniversary'
  | 'cupcakes'
  | 'mini'
  | 'bento'
  | 'dessert_boxes';

export interface ProductOption {
  id: number;
  option_type: 'size' | 'flavor' | 'filling' | 'addon';
  name: string;
  price_adjustment: number;
  is_default: boolean;
  sort_order?: number;
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  category_slug?: string;
  description: string;
  base_price?: number;
  price?: number; // fallback compatibility
  category?: string; // fallback compatibility
  image_url: string;
  badge?: string | null;
  is_featured?: boolean;
  is_popular?: boolean;
  is_available?: boolean;
  prep_time_hours?: number;
  flavor_options?: string[];
  size_options?: string[];
  created_at?: string;
  options?: {
    sizes: ProductOption[];
    flavors: ProductOption[];
    fillings: ProductOption[];
    addons: ProductOption[];
  };
}

export interface CartItem {
  id: string; // unique item instance uuid
  productId: number;
  name: string;
  price: number;
  base_price?: number;
  quantity: number;
  size: string;
  flavor: string;
  filling?: string;
  addons?: string[];
  notes?: string;
  image_url: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'baking'; // backwards compatibility

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cash_on_delivery';

export interface OrderItemDetail {
  id?: number | string;
  productId?: number | string;
  product_id?: number;
  product_name?: string;
  name?: string;
  size_selected?: string;
  size?: string;
  flavor_selected?: string;
  flavor?: string;
  filling_selected?: string;
  addons_selected?: string[] | string;
  unit_price?: number;
  price?: number;
  quantity: number;
  subtotal?: number;
  item_notes?: string;
  notes?: string;
  image_url?: string;
}

export interface OrderTimeline {
  id: number;
  order_id: number;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  changed_by?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_whatsapp?: string;
  contact?: string; // backwards compatibility
  delivery_type: 'pickup' | 'delivery';
  delivery_state?: string;
  delivery_city?: string;
  delivery_area?: string;
  delivery_address?: string | null;
  delivery_date: string;
  delivery_time_slot?: string;
  cake_message?: string | null;
  special_instructions?: string | null;
  subtotal?: number;
  delivery_fee?: number;
  discount?: number;
  tax?: number;
  total: number;
  status?: OrderStatus; // backwards compatibility
  payment_method?: 'paystack' | 'cash_on_pickup' | 'cash_on_delivery' | 'transfer';
  payment_status?: PaymentStatus;
  order_status?: OrderStatus;
  paystack_reference?: string | null;
  created_at?: string;
  updated_at?: string;
  items: OrderItemDetail[];
  timeline?: OrderTimeline[];
}

export type CustomOrderStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'rejected' | 'converted';

export interface CustomOrder {
  id: number;
  reference_id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  contact?: string; // backwards compatibility
  occasion: string;
  cake_type?: string;
  flavor: string;
  size: string;
  filling?: string;
  theme?: string;
  color_preference?: string;
  servings?: number;
  budget?: string; // backwards compatibility
  budget_tier?: string;
  event_date: string;
  cake_message?: string | null;
  special_instructions?: string | null;
  notes?: string;
  reference_image?: string | null;
  estimated_price?: number | null;
  status?: CustomOrderStatus;
  images?: string[];
  created_at?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role?: string;
  token?: string;
}

export interface BakerySettings {
  bakery_name: string;
  bakery_tagline: string;
  currency_symbol: string;
  currency_code: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_email: string;
  studio_address: string;
  opening_hours: string;
  standard_delivery_fee: string;
  free_delivery_threshold: string;
  paystack_public_key?: string;
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦');
}
