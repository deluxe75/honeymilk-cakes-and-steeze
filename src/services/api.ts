import axios from 'axios';
import {
  Product,
  Order,
  CustomOrder,
  AdminUser,
  BakerySettings
} from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token for admin routes
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('honeymilk_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // ----------------------------------------------------
  // PRODUCTS
  // ----------------------------------------------------
  async getProducts(params?: {
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
  }): Promise<Product[]> {
    const res = await apiClient.get('/products', { params });
    return res.data.data;
  },

  async getProductById(id: number): Promise<Product> {
    const res = await apiClient.get(`/products/${id}`);
    return res.data.data;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await apiClient.post('/products', product);
    return res.data.data;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const res = await apiClient.put(`/products/${id}`, product);
    return res.data.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  // ----------------------------------------------------
  // ORDERS (Customer & Admin)
  // ----------------------------------------------------
  async createOrder(payload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_whatsapp?: string;
    items: Array<{
      product_id?: number;
      name?: string;
      base_price?: number;
      size?: string;
      flavor?: string;
      filling?: string;
      addons?: string[];
      quantity: number;
      notes?: string;
    }>;
    delivery_type: 'pickup' | 'delivery';
    delivery_state?: string;
    delivery_city?: string;
    delivery_area?: string;
    delivery_address?: string;
    delivery_date?: string;
    delivery_time_slot?: string;
    cake_message?: string;
    special_instructions?: string;
    payment_method: 'paystack' | 'cash_on_pickup' | 'cash_on_delivery' | 'transfer';
  }): Promise<Order> {
    const res = await apiClient.post('/orders', payload);
    return res.data.data;
  },

  async getOrders(params?: {
    status?: string;
    payment_status?: string;
    search?: string;
  }): Promise<Order[]> {
    const res = await apiClient.get('/orders', { params });
    return res.data.data;
  },

  async updateOrderStatus(
    id: number,
    data: {
      order_status?: string;
      payment_status?: string;
      notes?: string;
    }
  ): Promise<Order> {
    const res = await apiClient.patch(`/orders/${id}/status`, data);
    return res.data.data;
  },

  async trackOrder(orderNumber: string, phone?: string): Promise<Order> {
    const res = await apiClient.get('/orders/track', {
      params: { order_number: orderNumber, phone },
    });
    return res.data.data;
  },

  // ----------------------------------------------------
  // PAYMENTS (Paystack Gateway)
  // ----------------------------------------------------
  async initializePayment(orderNumber: string, callbackUrl?: string): Promise<{
    authorization_url: string;
    reference: string;
    amount: number;
  }> {
    const res = await apiClient.post('/payments/initialize', {
      order_number: orderNumber,
      callback_url: callbackUrl,
    });
    return res.data.data;
  },

  async verifyPayment(reference: string): Promise<{
    order_number: string;
    payment_status: string;
    order_status: string;
  }> {
    const res = await apiClient.get(`/payments/verify/${reference}`);
    return res.data.data;
  },

  // ----------------------------------------------------
  // CUSTOM COMMISSIONS
  // ----------------------------------------------------
  async createCustomOrder(payload: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
    occasion: string;
    cake_type?: string;
    flavor: string;
    size: string;
    filling?: string;
    theme?: string;
    color_preference?: string;
    servings?: number;
    budget_tier: string;
    event_date: string;
    cake_message?: string;
    notes?: string;
    reference_images?: string[];
    reference_image?: string;
  }): Promise<CustomOrder> {
    const res = await apiClient.post('/custom-orders', payload);
    return res.data.data;
  },

  async getCustomOrders(): Promise<CustomOrder[]> {
    const res = await apiClient.get('/custom-orders');
    return res.data.data;
  },

  async updateCustomOrder(
    id: number,
    data: { status?: string; estimated_price?: number }
  ): Promise<CustomOrder> {
    const res = await apiClient.patch(`/custom-orders/${id}`, data);
    return res.data.data;
  },

  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------
  async loginAdmin(username: string, password: string): Promise<{
    token: string;
    admin: AdminUser;
  }> {
    const res = await apiClient.post('/auth/admin-login', { username, password });
    return res.data;
  },

  async getCurrentAdmin(): Promise<AdminUser> {
    const res = await apiClient.get('/auth/me');
    const admin = res.data.data;
    const adminRoles = ['super_admin', 'head_baker', 'concierge'];
    if (!admin?.admin_id || !adminRoles.includes(admin.role)) {
      throw new Error('Administrator authentication required');
    }
    return {
      id: Number(admin.admin_id),
      username: admin.username,
      name: admin.name,
      role: admin.role,
    };
  },

  // ----------------------------------------------------
  // SETTINGS & REVIEWS
  // ----------------------------------------------------
  async getSettings(): Promise<BakerySettings> {
    const res = await apiClient.get('/settings');
    return res.data.data;
  },

  async updateSettings(settings: Partial<BakerySettings>): Promise<BakerySettings> {
    const res = await apiClient.put('/settings', settings);
    return res.data.data;
  },

  async getReviews(): Promise<any[]> {
    const res = await apiClient.get('/reviews');
    return res.data.data;
  },

  async submitReview(data: {
    author_name: string;
    location?: string;
    rating: number;
    comment: string;
  }): Promise<any> {
    const res = await apiClient.post('/reviews', data);
    return res.data.data;
  },

  async sendContact(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<any> {
    const res = await apiClient.post('/contact', data);
    return res.data;
  },
};
