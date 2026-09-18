import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  Cake,
  ShoppingBag,
  Palette,
  Sparkles,
  Database,
  Search,
  RefreshCw,
  Volume2,
  VolumeX,
  Printer,
  X,
  Radio,
  Sliders,
  DollarSign,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { orderStream } from '../services/sse';
import { playOrderChime } from '../services/sound';
import {
  Product,
  Order,
  CustomOrder,
  AdminUser,
  OrderStatus,
  PaymentStatus,
  CustomOrderStatus,
  BakerySettings,
  formatNaira
} from '../types';

export const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'custom' | 'settings' | 'system'>('orders');

  // Live SSE connection & audio chime
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestAlert, setLatestAlert] = useState<{ title: string; desc: string; orderId?: number } | null>(null);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [settings, setSettings] = useState<BakerySettings | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustom, setSelectedCustom] = useState<CustomOrder | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Quote input for custom orders
  const [customQuoteInput, setCustomQuoteInput] = useState('');

  // Settings form
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('honeymilk_admin_token');
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    api.getCurrentAdmin()
      .then((admin) => {
        localStorage.setItem('honeymilk_admin_user', JSON.stringify(admin));
        setCurrentUser(admin);
      })
      .catch(() => {
        localStorage.removeItem('honeymilk_admin_token');
        localStorage.removeItem('honeymilk_admin_user');
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadAllData();

      // Subscribe to real-time SSE stream!
      const unsubStatus = orderStream.onStatusChange((connected) => {
        setIsLiveConnected(connected);
      });

      const unsubStream = orderStream.subscribe((event, data) => {
        if (event === 'new_order') {
          if (soundEnabled) playOrderChime();
          setLatestAlert({
            title: `New Order Received — #${data.order_number}`,
            desc: `${data.customer_name} placed an order for ${formatNaira(data.total)}`,
            orderId: data.order_id,
          });
          // Refresh orders list
          loadOrders();
        } else if (event === 'new_custom_order') {
          if (soundEnabled) playOrderChime();
          setLatestAlert({
            title: `New Bespoke Commission — #${data.reference_id}`,
            desc: `${data.name} requested a custom cake for ${data.occasion}`,
          });
          loadCustomOrders();
        } else if (event === 'order_status_updated' || event === 'payment_verified') {
          loadOrders();
        }
      });

      return () => {
        unsubStatus();
        unsubStream();
      };
    }
  }, [currentUser, soundEnabled]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#171412] flex items-center justify-center text-[#E6B655]">
        <Shield className="w-7 h-7 animate-pulse" aria-label="Checking administrator access" />
      </div>
    );
  }

  const loadOrders = async () => {
    try {
      const o = await api.getOrders();
      setOrders(o);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const loadCustomOrders = async () => {
    try {
      const c = await api.getCustomOrders();
      setCustomOrders(c);
    } catch (err) {
      console.error('Error fetching custom orders:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [o, p, c, s] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getCustomOrders(),
        api.getSettings(),
      ]);
      setOrders(o);
      setProducts(p);
      setCustomOrders(c);
      setSettings(s);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const res = await api.loginAdmin(username.trim(), password.trim());
      if (res.token && res.admin) {
        localStorage.setItem('honeymilk_admin_token', res.token);
        localStorage.setItem('honeymilk_admin_user', JSON.stringify(res.admin));
        setCurrentUser(res.admin);
      } else {
        setLoginError('Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Login failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('honeymilk_admin_token');
    localStorage.removeItem('honeymilk_admin_user');
    setCurrentUser(null);
  };

  // Order status update
  const handleOrderStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, { order_status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus } : null));
      }
    } catch (err) {
      alert('Failed to update status on server');
    }
  };

  const handlePaymentStatusChange = async (orderId: number, newPaymentStatus: PaymentStatus) => {
    try {
      await api.updateOrderStatus(orderId, { payment_status: newPaymentStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, payment_status: newPaymentStatus } : null));
      }
    } catch (err) {
      alert('Failed to update payment status on server');
    }
  };

  // Custom order status & quote update
  const handleCustomStatusChange = async (customId: number, newStatus: CustomOrderStatus, quote?: number) => {
    try {
      const payload: { status: string; estimated_price?: number } = { status: newStatus };
      if (quote !== undefined) payload.estimated_price = quote;

      await api.updateCustomOrder(customId, payload);
      setCustomOrders((prev) =>
        prev.map((c) =>
          c.id === customId ? { ...c, status: newStatus, ...(quote ? { estimated_price: quote } : {}) } : c
        )
      );
      if (selectedCustom?.id === customId) {
        setSelectedCustom((prev) =>
          prev ? { ...prev, status: newStatus, ...(quote ? { estimated_price: quote } : {}) } : null
        );
      }
    } catch (err) {
      alert('Failed to update custom order on server');
    }
  };

  // Product save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.base_price || !editingProduct?.image_url) {
      alert('Please fill out name, price, and image URL');
      return;
    }

    try {
      if (isNewProduct) {
        const created = await api.createProduct(editingProduct);
        setProducts((prev) => [created, ...prev]);
      } else if (editingProduct.id) {
        const updated = await api.updateProduct(editingProduct.id, editingProduct);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      }
      setEditingProduct(null);
    } catch (err) {
      alert('Error saving product to catalog');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to remove this cake from the menu catalog?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update bakery settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.order_status !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const numMatch = o.order_number.toLowerCase().includes(q);
      const nameMatch = o.customer_name.toLowerCase().includes(q);
      const phoneMatch = o.customer_phone.includes(q);
      if (!numMatch && !nameMatch && !phoneMatch) return false;
    }
    return true;
  });

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-16 h-16 bg-[#2C221E] text-[#E6B655] rounded-3xl flex items-center justify-center mx-auto shadow-md mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B38528] bg-[#E6B655]/15 px-3 py-1 rounded-full">
            Restricted Staff Portal
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#2C221E]">
            HoneyMilk Bakery Admin
          </h2>
          <p className="mt-2 text-xs text-[#735A4B]">
            Sign in to manage real-time orders, cake catalog, and bespoke commissions
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-[#F0E6D8] sm:px-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A7565] mb-1.5">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A7565] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#2C221E] hover:bg-[#3B2516] text-white font-medium rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Enter Atelier Dashboard'}
              </button>
            </form>

          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-16">
      {/* Real-time Order Popup Banner */}
      {latestAlert && (
        <div className="bg-[#2C221E] text-white py-3 px-4 shadow-lg border-b border-[#E6B655]/40 animate-slideDown sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#E6B655] animate-ping shrink-0" />
              <div>
                <span className="font-bold text-sm text-[#E6B655] block sm:inline mr-2">
                  {latestAlert.title}
                </span>
                <span className="text-xs text-stone-300">{latestAlert.desc}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLatestAlert(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Admin Bar */}
      <header className="bg-white border-b border-[#F0E6D8] px-4 sm:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2C221E] text-[#E6B655] flex items-center justify-center font-bold font-serif text-lg">
              HM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-[#2C221E]">HoneyMilk Command Studio</h1>
                {/* SSE Indicator */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isLiveConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                  title={isLiveConnected ? 'SSE Live Connection Active' : 'Attempting Reconnection'}
                >
                  <Radio className={`w-3 h-3 ${isLiveConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                  <span>{isLiveConnected ? 'Live SSE Active' : 'Connecting'}</span>
                </div>
              </div>
              <p className="text-xs text-[#8A7565]">
                Signed in as <span className="font-semibold text-[#2C221E]">{currentUser.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                soundEnabled
                  ? 'bg-amber-50 border-amber-200 text-[#B38528]'
                  : 'bg-stone-50 border-stone-200 text-stone-500'
              }`}
              title={soundEnabled ? 'Chime sound enabled for new orders' : 'Sound muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
            </button>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 rounded-xl border border-[#E9DFD1] hover:bg-stone-50 text-[#735A4B] cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-[#2C221E] text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F0E6D8] pb-4 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#2C221E] text-white shadow-sm'
                : 'bg-white text-[#735A4B] hover:bg-stone-100 border border-[#F0E6D8]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#E6B655]" />
            <span>Orders</span>
            <span className="bg-[#E6B655]/30 text-xs px-1.5 py-0.2 rounded-full font-mono font-bold ml-1">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#2C221E] text-white shadow-sm'
                : 'bg-white text-[#735A4B] hover:bg-stone-100 border border-[#F0E6D8]'
            }`}
          >
            <Cake className="w-4 h-4 text-[#E6B655]" />
            <span>Cake Catalog</span>
            <span className="bg-stone-200 text-stone-800 text-xs px-1.5 py-0.2 rounded-full font-mono font-bold ml-1">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#2C221E] text-white shadow-sm'
                : 'bg-white text-[#735A4B] hover:bg-stone-100 border border-[#F0E6D8]'
            }`}
          >
            <Palette className="w-4 h-4 text-[#E6B655]" />
            <span>Bespoke Commissions</span>
            <span className="bg-amber-100 text-amber-900 text-xs px-1.5 py-0.2 rounded-full font-mono font-bold ml-1">
              {customOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#2C221E] text-white shadow-sm'
                : 'bg-white text-[#735A4B] hover:bg-stone-100 border border-[#F0E6D8]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#E6B655]" />
            <span>Bakery Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-[#2C221E] text-white shadow-sm'
                : 'bg-white text-[#735A4B] hover:bg-stone-100 border border-[#F0E6D8]'
            }`}
          >
            <Database className="w-4 h-4 text-[#E6B655]" />
            <span>System & DB</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: ORDERS MANAGEMENT
           ------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter Toolbar */}
            <div className="bg-white rounded-2xl border border-[#F0E6D8] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-[#8A7565] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by order #, customer, or phone..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs font-medium text-[#2C221E]"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">In Oven (Preparing)</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs font-medium text-[#2C221E]"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Payment Pending</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                </select>
              </div>

              <div className="text-xs text-[#8A7565] font-semibold">
                Showing <span className="text-[#2C221E] font-bold">{filteredOrders.length}</span> orders
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-[#F0E6D8] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] border-b border-[#F0E6D8] text-[#8A7565] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Order Ref</th>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Cakes</th>
                      <th className="px-5 py-3.5">Total (₦)</th>
                      <th className="px-5 py-3.5">Payment</th>
                      <th className="px-5 py-3.5">Kitchen Status</th>
                      <th className="px-5 py-3.5">Fulfillment</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFEA]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8A7565]">
                          No orders found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FDFBF7] transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-[#2C221E]">
                            {ord.order_number}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-[#2C221E]">{ord.customer_name}</div>
                            <div className="text-[11px] text-[#735A4B]">{ord.customer_phone}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-[#2C221E] font-medium">
                              {ord.items?.length || 1} Cake(s)
                            </div>
                            <div className="text-[10px] text-[#8A7565] truncate max-w-[150px]">
                              {ord.items?.[0]?.product_name}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold text-[#2C221E]">
                            {formatNaira(ord.total)}
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={ord.payment_status}
                              onChange={(e) =>
                                handlePaymentStatusChange(ord.id, e.target.value as PaymentStatus)
                              }
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold capitalize border cursor-pointer ${
                                ord.payment_status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="cash_on_delivery">Cash on Hand</option>
                              <option value="failed">Failed</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={ord.order_status}
                              onChange={(e) =>
                                handleOrderStatusChange(ord.id, e.target.value as OrderStatus)
                              }
                              className="px-2.5 py-1 bg-[#FAF4EC] border border-[#EADFCF] rounded-lg text-xs font-semibold text-[#2C221E] capitalize cursor-pointer focus:ring-1 focus:ring-[#E6B655]"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">In Oven (Preparing)</option>
                              <option value="ready">Ready</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-5 py-4 text-[11px]">
                            <span className="font-semibold text-[#2C221E] block">
                              {ord.delivery_date}
                            </span>
                            <span className="text-[#8A7565] capitalize">
                              {ord.delivery_type === 'delivery' ? 'Courier' : 'Pickup'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-[#2C221E] hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: PRODUCT CATALOG MANAGEMENT
           ------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#F0E6D8]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#2C221E]">Couture Cake Catalog</h2>
                <p className="text-xs text-[#8A7565]">Manage sizes, flavors, and pricing in Nigerian Naira</p>
              </div>
              <button
                onClick={() => {
                  setIsNewProduct(true);
                  setEditingProduct({
                    name: '',
                    category_slug: 'celebration',
                    base_price: 45000,
                    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
                    description: '',
                    badge: 'Chef Signature',
                    is_available: true,
                    is_featured: false,
                    is_popular: false,
                  });
                }}
                className="px-4 py-2.5 bg-[#2C221E] hover:bg-[#3B2516] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#E6B655]" />
                <span>Add New Cake</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-[#F0E6D8] overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      {prod.badge && (
                        <span className="absolute top-3 left-3 bg-[#2C221E]/90 text-[#E6B655] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                          {prod.badge}
                        </span>
                      )}
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prod.is_available !== false
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {prod.is_available !== false ? 'Active' : 'Sold Out'}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="text-[10px] text-[#B38528] uppercase tracking-wider font-bold mb-1">
                        {prod.category_slug}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#2C221E] mb-2">{prod.name}</h3>
                      <p className="text-xs text-[#735A4B] line-clamp-2 mb-3">{prod.description}</p>
                      <div className="text-base font-bold text-[#2C221E]">
                        Base Price: {formatNaira(prod.base_price || prod.price || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF6F0] border-t border-[#F0E6D8] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsNewProduct(false);
                        setEditingProduct(prod);
                      }}
                      className="px-3 py-1.5 bg-white border border-[#E9DFD1] hover:bg-stone-50 rounded-xl text-xs font-semibold text-[#2C221E] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Cake</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete cake"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: BESPOKE CUSTOM ORDERS MANAGEMENT
           ------------------------------------------------------------- */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-[#F0E6D8]">
              <h2 className="font-serif text-lg font-bold text-[#2C221E]">Bespoke Commission Requests</h2>
              <p className="text-xs text-[#8A7565]">
                Review moodboards, reference photos, provide estimated price quotes, and manage client consultations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customOrders.map((cust) => (
                <div
                  key={cust.id}
                  className="bg-white rounded-3xl border border-[#F0E6D8] p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-[#F4EFEA]">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#B38528] block">
                          {cust.reference_id}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#2C221E]">{cust.name}</h3>
                        <p className="text-xs text-[#735A4B]">
                          {cust.phone} • {cust.email}
                        </p>
                      </div>
                      <span
                        className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full ${
                          cust.status === 'quoted'
                            ? 'bg-sky-100 text-sky-800'
                            : cust.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-[#523A2B] mb-4">
                      <div>
                        <strong>Occasion:</strong> {cust.occasion} | <strong>Date:</strong>{' '}
                        {cust.event_date}
                      </div>
                      <div>
                        <strong>Flavor & Size:</strong> {cust.flavor} ({cust.size})
                      </div>
                      <div>
                        <strong>Budget Expectation:</strong> {cust.budget_tier} ({cust.servings} Servings)
                      </div>
                      {cust.special_instructions && (
                        <p className="italic bg-[#FAF6F0] p-2.5 rounded-xl border border-[#EFE8DC] mt-2">
                          "{cust.special_instructions}"
                        </p>
                      )}
                    </div>

                    {/* Photos Preview */}
                    {cust.images && cust.images.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[11px] font-semibold text-[#8A7565] block mb-1">
                          Client Reference Photo:
                        </span>
                        <div className="flex gap-2 overflow-x-auto">
                          {cust.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Moodboard"
                              className="w-16 h-16 object-cover rounded-xl border border-[#E9DFD1]"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#F4EFEA] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-[#8A7565] block font-semibold">Estimated Quote:</span>
                      <span className="font-bold text-[#2C221E] text-sm">
                        {cust.estimated_price ? formatNaira(cust.estimated_price) : 'Pending Quote'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={cust.status}
                        onChange={(e) =>
                          handleCustomStatusChange(cust.id, e.target.value as CustomOrderStatus)
                        }
                        className="px-2.5 py-1.5 bg-[#FAF6F0] border border-[#E9DFD1] rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="quoted">Quoted</option>
                        <option value="accepted">Accepted / Booked</option>
                        <option value="rejected">Declined</option>
                      </select>

                      <button
                        onClick={() => setSelectedCustom(cust)}
                        className="px-3 py-1.5 bg-[#2C221E] text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#3B2516]"
                      >
                        Quote & Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: BAKERY SETTINGS
           ------------------------------------------------------------- */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#2C221E] pb-3 border-b border-[#F4EFEA] mb-6">
              Bakery Atelier Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-[#8A7565] mb-1">Brand Name</label>
                <input
                  type="text"
                  value={settings.bakery_name || ''}
                  onChange={(e) => setSettings({ ...settings, bakery_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-[#8A7565] mb-1">Bakery Tagline</label>
                <input
                  type="text"
                  value={settings.bakery_tagline || ''}
                  onChange={(e) => setSettings({ ...settings, bakery_tagline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={settings.contact_phone || ''}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1">WhatsApp Line</label>
                  <input
                    type="text"
                    value={settings.contact_whatsapp || ''}
                    onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-[#8A7565] mb-1">Flagship Studio Address</label>
                <input
                  type="text"
                  value={settings.studio_address || ''}
                  onChange={(e) => setSettings({ ...settings, studio_address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1">Standard Courier Delivery (₦)</label>
                  <input
                    type="number"
                    value={settings.standard_delivery_fee || '4500'}
                    onChange={(e) => setSettings({ ...settings, standard_delivery_fee: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1">Free Delivery Threshold (₦)</label>
                  <input
                    type="number"
                    value={settings.free_delivery_threshold || '90000'}
                    onChange={(e) => setSettings({ ...settings, free_delivery_threshold: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                  />
                </div>
              </div>

              {settingsSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium">
                  Bakery settings saved successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3 bg-[#2C221E] hover:bg-[#3B2516] text-white font-bold rounded-xl transition-colors cursor-pointer mt-4"
              >
                {savingSettings ? 'Saving...' : 'Update Settings'}
              </button>
            </form>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: SYSTEM & DATABASE ARCHITECTURE
           ------------------------------------------------------------- */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-[#2C221E] pb-3 border-b border-[#F4EFEA] mb-4">
                Full-Stack Architecture & Database Diagnostics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#523A2B]">
                <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#ECE2D2] space-y-3">
                  <h3 className="font-serif font-bold text-sm text-[#2C221E]">MySQL 8+ Production Schema</h3>
                  <p>All tables configured with InnoDB, UTF8mb4, and strict foreign keys:</p>
                  <ul className="list-disc pl-4 space-y-1 font-mono text-[11px]">
                    <li>products & product_options (sizes, fillings, add-ons)</li>
                    <li>orders & order_items & order_status_history</li>
                    <li>payments (Paystack reference audit log)</li>
                    <li>custom_orders & custom_order_images</li>
                    <li>settings, notifications (SSE stream log)</li>
                  </ul>
                  <div className="pt-2">
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded">
                      Files: /database/schema.sql & /database/seed.sql
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#ECE2D2] space-y-3">
                  <h3 className="font-serif font-bold text-sm text-[#2C221E]">PHP 8+ REST API Engine</h3>
                  <p>Production backend ready for Apache/Nginx/cPanel/VPS deployment:</p>
                  <ul className="list-disc pl-4 space-y-1 font-mono text-[11px]">
                    <li>/backend/index.php (Master REST Router)</li>
                    <li>/backend/api/orders.php (Server Price Calculation)</li>
                    <li>/backend/api/stream.php (Server-Sent Events)</li>
                    <li>/backend/api/payments.php (Paystack Initialize/Verify)</li>
                    <li>/backend/api/upload.php (MIME & Size validation)</li>
                  </ul>
                  <div className="pt-2">
                    <span className="text-sky-800 font-bold bg-sky-100 px-2 py-1 rounded">
                      Target: PDO + MySQL + JWT + Paystack
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          MODAL: VIEW ORDER & PRINT RECEIPT
         ------------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs uppercase font-bold tracking-widest text-[#B38528] bg-[#E6B655]/15 px-3 py-1 rounded-full">
                Order Receipt
              </span>
              <span className="font-mono text-base font-bold text-[#2C221E]">
                {selectedOrder.order_number}
              </span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#2C221E] mb-1">
              {selectedOrder.customer_name}
            </h2>
            <p className="text-xs text-[#735A4B] mb-6">
              Phone: {selectedOrder.customer_phone} | Email: {selectedOrder.customer_email}
            </p>

            {/* Quick Status Control */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF6F0] mb-6 text-xs">
              <div>
                <span className="text-[#8A7565] block font-semibold mb-1">Kitchen Status:</span>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) =>
                    handleOrderStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="w-full px-3 py-2 bg-white border border-[#E9DFD1] rounded-xl font-bold capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">In Oven (Preparing)</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <span className="text-[#8A7565] block font-semibold mb-1">Payment Status:</span>
                <select
                  value={selectedOrder.payment_status}
                  onChange={(e) =>
                    handlePaymentStatusChange(selectedOrder.id, e.target.value as PaymentStatus)
                  }
                  className="w-full px-3 py-2 bg-white border border-[#E9DFD1] rounded-xl font-bold capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Cake Message Plaque */}
            {selectedOrder.cake_message && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl mb-6 text-xs">
                <span className="font-bold text-[#B38528] block">Inscribed Plaque Message:</span>
                <span className="font-serif italic text-[#2C221E] text-sm">
                  "{selectedOrder.cake_message}"
                </span>
              </div>
            )}

            {/* Items Breakdown */}
            <div className="border-t border-[#F4EFEA] pt-4 mb-6">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#8A7565] mb-3">
                Cakes Ordered
              </h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start pb-3 border-b border-[#FAF6F0] last:border-b-0 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#2C221E] text-sm">
                        {it.quantity}x {it.product_name}
                      </div>
                      <div className="text-[#735A4B] mt-0.5 space-x-2">
                        <span>{it.size_selected}</span>
                        <span>•</span>
                        <span>{it.flavor_selected}</span>
                        {it.filling_selected && (
                          <>
                            <span>•</span>
                            <span>{it.filling_selected}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-[#2C221E] text-sm">
                      {formatNaira(it.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-[#F4EFEA] pt-3 text-xs space-y-1.5 mb-6">
              <div className="flex justify-between text-[#735A4B]">
                <span>Subtotal:</span>
                <span>{formatNaira(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#735A4B]">
                <span>Delivery:</span>
                <span>{formatNaira(selectedOrder.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#2C221E] pt-2 border-t border-[#F4EFEA]">
                <span>Total Amount:</span>
                <span className="text-[#B38528] text-lg">{formatNaira(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-[#2C221E] hover:bg-[#3B2516] text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Kitchen Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3 border border-[#E9DFD1] text-[#735A4B] font-medium rounded-xl text-xs hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: EDIT / CREATE PRODUCT
         ------------------------------------------------------------- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-[#2C221E] mb-4">
              {isNewProduct ? 'Add New Cake' : 'Edit Cake'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-[#8A7565] mb-1">Cake Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1">Category</label>
                  <select
                    value={editingProduct.category_slug || 'celebration'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category_slug: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs"
                  >
                    <option value="celebration">Celebration</option>
                    <option value="birthday">Birthday</option>
                    <option value="wedding">Wedding</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="cupcakes">Cupcakes</option>
                    <option value="mini">Mini & Bento</option>
                    <option value="dessert_boxes">Dessert Boxes</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1">Base Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.base_price || editingProduct.price || 45000}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, base_price: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-[#8A7565] mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={editingProduct.image_url || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-[#8A7565] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_available !== false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_available: e.target.checked })
                    }
                  />
                  <span className="font-semibold text-[#2C221E]">In Stock & Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_featured)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_featured: e.target.checked })
                    }
                  />
                  <span className="font-semibold text-[#2C221E]">Featured Hero</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-3 border border-[#E9DFD1] text-[#735A4B] font-medium rounded-xl text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2C221E] hover:bg-[#3B2516] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save Cake to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CUSTOM ORDER QUOTE & CHAT
         ------------------------------------------------------------- */}
      {selectedCustom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedCustom(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif text-2xl font-bold text-[#2C221E] mb-1">
              Bespoke Quote: {selectedCustom.name}
            </h2>
            <p className="text-xs text-[#735A4B] mb-4">
              Ref: <code className="font-bold">{selectedCustom.reference_id}</code> | Occasion:{' '}
              {selectedCustom.occasion}
            </p>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="block uppercase font-bold text-[#8A7565] mb-1">
                  Estimated Pricing Quote (₦)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={customQuoteInput || selectedCustom.estimated_price || ''}
                  onChange={(e) => setCustomQuoteInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const price = parseFloat(customQuoteInput);
                    if (price > 0) {
                      handleCustomStatusChange(selectedCustom.id, 'quoted', price);
                      setSelectedCustom(null);
                    } else {
                      alert('Please enter a valid price quote');
                    }
                  }}
                  className="flex-1 py-3 bg-[#2C221E] text-white font-bold rounded-xl text-xs hover:bg-[#3B2516] cursor-pointer"
                >
                  Save & Set as Quoted
                </button>
              </div>

              <div className="pt-2 text-center">
                <a
                  href={`https://wa.me/${selectedCustom.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedCustom.name}, this is Chef Simone from HoneyMilk Cakes. We have reviewed your bespoke commission #${selectedCustom.reference_id} for ${selectedCustom.event_date}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-emerald-700 font-bold hover:underline"
                >
                  <span>Open WhatsApp Conversation with Client</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
