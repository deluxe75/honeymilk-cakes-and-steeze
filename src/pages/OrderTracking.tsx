import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, ChefHat, Sparkles, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus, formatNaira } from '../types';

const STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Order Placed', desc: 'Order received & awaiting review' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Ingredients reserved & scheduled' },
  { key: 'preparing', label: 'In the Oven', desc: 'Sponge baking & cream whipping' },
  { key: 'ready', label: 'Artisan Finish', desc: 'Decorated, boxed & sealed with gold' },
  { key: 'out_for_delivery', label: 'In Transit', desc: 'Dispatched with climate-controlled courier' },
  { key: 'delivered', label: 'Delivered', desc: 'Safely arrived for your celebration' },
];

export const OrderTracking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get('order') || '');
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (orderNum: string, phoneNum?: string) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await api.trackOrder(orderNum.trim(), phoneNum?.trim());
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setError(err.response?.data?.message || 'We could not find an order matching these details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialOrder = searchParams.get('order');
    const initialPhone = searchParams.get('phone');
    if (initialOrder) {
      fetchTracking(initialOrder, initialPhone || undefined);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) return;

    setSearchParams({
      order: orderNumberInput.trim(),
      ...(phoneInput.trim() ? { phone: phoneInput.trim() } : {}),
    });
    fetchTracking(orderNumberInput, phoneInput);
  };

  const getStageIndex = (status: OrderStatus): number => {
    if (status === 'completed') return 5;
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIdx = order ? getStageIndex(order.order_status) : 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#B38528] font-bold bg-[#E6B655]/15 px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Live Cake Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2C221E] font-bold">
            Track Your Cake's Journey
          </h1>
          <p className="text-[#735A4B] text-sm sm:text-base max-w-md mx-auto mt-2">
            Enter your order reference code and phone number to observe your cake moving from our Soho ovens to your doorstep.
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm mb-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A7565] mb-1.5">
                  Order Reference *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. HM-20260915-101"
                    value={orderNumberInput}
                    onChange={(e) => setOrderNumberInput(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655] uppercase"
                  />
                  <Package className="w-4 h-4 text-[#8A7565] absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#8A7565] mb-1.5">
                  Customer Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +234 803 123 4567"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#2C221E] hover:bg-[#3B2516] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching Ovens...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#E6B655]" />
                  <span>Locate My Cake</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Order Lookup Failed</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Details View */}
        {order && (
          <div className="space-y-8 animate-fadeIn">
            {/* Status Highlight Banner */}
            <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#F4EFEA]">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8A7565] font-semibold block mb-1">
                    Order Reference
                  </span>
                  <h2 className="font-mono text-2xl font-bold text-[#2C221E]">{order.order_number}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.order_status === 'delivered' || order.order_status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.order_status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {order.order_status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Visual Multi-Stage Progress Tracker */}
              <div className="py-8">
                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute top-5 left-4 right-4 h-1 bg-[#F0E6D8] -z-0">
                    <div
                      className="h-full bg-[#E6B655] transition-all duration-700"
                      style={{ width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Stage nodes */}
                  <div className="flex justify-between relative z-10">
                    {STAGES.map((st, i) => {
                      const isDone = i <= currentStageIdx;
                      const isCurrent = i === currentStageIdx;

                      return (
                        <div key={st.key} className="flex flex-col items-center text-center max-w-[80px]">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                              isCurrent
                                ? 'bg-[#2C221E] text-[#E6B655] ring-4 ring-[#E6B655]/30'
                                : isDone
                                ? 'bg-[#E6B655] text-white'
                                : 'bg-white border-2 border-[#E9DFD1] text-[#8A7565]'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                          </div>
                          <span className={`text-[11px] font-semibold mt-2 ${isCurrent ? 'text-[#2C221E]' : 'text-[#8A7565]'}`}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Current Stage Description Callout */}
              <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#ECE2D2] flex items-center gap-3">
                <ChefHat className="w-5 h-5 text-[#E6B655] shrink-0" />
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8A7565] font-bold block">Current Activity</span>
                  <span className="text-sm font-medium text-[#2C221E]">{STAGES[currentStageIdx]?.desc}</span>
                </div>
              </div>
            </div>

            {/* Cake & Fulfillment Specs */}
            <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#2C221E] mb-4 pb-3 border-b border-[#F4EFEA]">
                Cakes in this Order
              </h3>
              <div className="space-y-4 mb-6">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4 pb-3 border-b border-[#FAF6F0] last:border-b-0">
                    <div>
                      <div className="font-semibold text-[#2C221E]">{it.quantity}x {it.product_name}</div>
                      <div className="text-xs text-[#735A4B] mt-0.5 space-x-1.5">
                        <span className="bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#F0E6D8]">{it.size_selected}</span>
                        <span className="bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#F0E6D8]">{it.flavor_selected}</span>
                        {it.filling_selected && (
                          <span className="bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#F0E6D8]">{it.filling_selected}</span>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-[#2C221E]">{formatNaira(it.subtotal)}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FDFBF7] p-4 rounded-2xl border border-[#F0E6D8]">
                <div>
                  <span className="text-[#8A7565] block font-semibold">Fulfillment Schedule:</span>
                  <span className="text-[#2C221E] font-medium">{order.delivery_date} ({order.delivery_time_slot})</span>
                </div>
                <div>
                  <span className="text-[#8A7565] block font-semibold">Delivery Destination:</span>
                  <span className="text-[#2C221E] font-medium capitalize">
                    {order.delivery_type === 'delivery' ? (order.delivery_address || 'Courier Delivery') : 'Studio Pickup (Lekki Phase 1)'}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Inquiry Button */}
            <div className="text-center">
              <a
                href={`https://wa.me/2348140002253?text=${encodeURIComponent(`Hello HoneyMilk Concierge, I am tracking my cake order #${order.order_number}. Could I get a status update?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-semibold transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Need Instant Help? WhatsApp Concierge</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
