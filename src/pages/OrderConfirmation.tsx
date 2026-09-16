import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Calendar, Printer, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Order, formatNaira } from '../types';

export const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadAndVerifyOrder() {
      if (!orderNumber) return;
      setLoading(true);

      const paystackRef = searchParams.get('reference');
      if (paystackRef) {
        setPaymentVerifying(true);
        try {
          await api.verifyPayment(paystackRef);
        } catch (err) {
          console.warn('Payment verify notice:', err);
        } finally {
          setPaymentVerifying(false);
        }
      }

      try {
        const data = await api.trackOrder(orderNumber);
        setOrder(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not load order details.');
      } finally {
        setLoading(false);
      }
    }

    loadAndVerifyOrder();
  }, [orderNumber, searchParams]);

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFBF7] px-4">
        <div className="w-12 h-12 border-4 border-[#E6B655] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="font-serif text-2xl text-[#2C221E]">Verifying Your Cake Order...</h2>
        <p className="text-sm text-[#735A4B] mt-1">Connecting to HoneyMilk Pâtisserie</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFBF7] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">!</span>
        </div>
        <h2 className="font-serif text-3xl text-[#2C221E] mb-2">Order Not Found</h2>
        <p className="text-[#735A4B] max-w-md mb-6">{error || 'We could not locate this order in our records.'}</p>
        <Link
          to="/menu"
          className="px-6 py-3 bg-[#2C221E] text-white rounded-xl hover:bg-[#3B2516] transition-colors"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Card Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0E6D8] shadow-sm text-center mb-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#E6B655]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#E6B655] border-4 border-white shadow-sm">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="inline-block text-xs uppercase tracking-widest text-[#B38528] font-bold bg-[#E6B655]/15 px-3 py-1 rounded-full mb-3">
            Order Confirmed & Sent to Kitchen
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#2C221E] font-bold mb-3">
            Thank You, {order.customer_name}!
          </h1>

          <p className="text-[#735A4B] text-base max-w-lg mx-auto mb-6">
            Your artisanal cake order has been locked in with our pastry chefs. A confirmation receipt and status alerts have been dispatched.
          </p>

          {/* Reference Pill */}
          <div className="inline-flex items-center gap-3 bg-[#FDFBF7] border border-[#E9DFD1] px-5 py-2.5 rounded-2xl">
            <span className="text-xs uppercase tracking-wider text-[#8A7565] font-semibold">Order Reference:</span>
            <span className="font-mono text-base font-bold text-[#2C221E]">{order.order_number}</span>
            <button
              onClick={copyOrderNumber}
              className="text-xs text-[#B38528] hover:underline font-semibold ml-1 cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {paymentVerifying && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Reconciling Paystack transaction...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8 no-print">
          <Link
            to={`/track-order?order=${order.order_number}&phone=${encodeURIComponent(order.customer_phone)}`}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2C221E] hover:bg-[#3B2516] text-white font-medium rounded-2xl transition-all shadow-sm"
          >
            <Clock className="w-4 h-4 text-[#E6B655]" />
            <span>Track Live Order Status</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-stone-50 border border-[#E9DFD1] text-[#2C221E] font-medium rounded-2xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#735A4B]" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Order Details Grid */}
        <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="font-serif text-xl text-[#2C221E] font-bold pb-4 border-b border-[#F4EFEA] mb-6">
            Order Summary & Receipt
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#E6B655] mt-0.5" />
                <div>
                  <div className="text-xs text-[#8A7565] uppercase tracking-wider font-semibold">Fulfillment Date</div>
                  <div className="text-[#2C221E] font-medium">{order.delivery_date} ({order.delivery_time_slot})</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#E6B655] mt-0.5" />
                <div>
                  <div className="text-xs text-[#8A7565] uppercase tracking-wider font-semibold">Fulfillment Method</div>
                  <div className="text-[#2C221E] font-medium capitalize">
                    {order.delivery_type === 'delivery' ? 'Courier Dispatch' : 'Boutique Studio Pickup'}
                  </div>
                  {order.delivery_address && (
                    <div className="text-xs text-[#735A4B] mt-0.5">{order.delivery_address}, {order.delivery_area}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#E6B655] mt-0.5" />
                <div>
                  <div className="text-xs text-[#8A7565] uppercase tracking-wider font-semibold">Payment Details</div>
                  <div className="text-[#2C221E] font-medium capitalize">
                    {order.payment_method.replace(/_/g, ' ')}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                      order.payment_status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-[#735A4B] mt-0.5">Contact: {order.customer_phone}</div>
                </div>
              </div>

              {order.cake_message && (
                <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#F4EFEA]">
                  <span className="text-xs text-[#8A7565] font-semibold block">Plaque Inscription:</span>
                  <span className="text-sm font-serif italic text-[#2C221E]">"{order.cake_message}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-[#F4EFEA] pt-6 mb-6">
            <h3 className="text-xs uppercase tracking-wider text-[#8A7565] font-bold mb-4">Cakes in this Order</h3>
            <div className="space-y-4">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4 pb-4 border-b border-[#FAF6F0] last:border-b-0">
                  <div>
                    <div className="font-medium text-[#2C221E] text-base">
                      {it.quantity}x {it.product_name}
                    </div>
                    <div className="text-xs text-[#735A4B] mt-1 space-x-2">
                      <span className="bg-stone-100 px-2 py-0.5 rounded">{it.size_selected}</span>
                      <span className="bg-stone-100 px-2 py-0.5 rounded">{it.flavor_selected}</span>
                      {it.filling_selected && (
                        <span className="bg-stone-100 px-2 py-0.5 rounded">{it.filling_selected}</span>
                      )}
                    </div>
                  </div>
                  <div className="font-semibold text-[#2C221E] text-base whitespace-nowrap">
                    {formatNaira(it.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-[#F4EFEA] pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#735A4B]">
              <span>Subtotal:</span>
              <span>{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#735A4B]">
              <span>Delivery Fee:</span>
              <span>{order.delivery_fee > 0 ? formatNaira(order.delivery_fee) : 'Free'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2C221E] pt-2 border-t border-[#F4EFEA]">
              <span>Total Paid / Due:</span>
              <span className="text-xl text-[#B38528]">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Concierge Note */}
        <div className="bg-[#FAF6F0] rounded-2xl p-6 border border-[#ECE2D2] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-medium text-[#2C221E]">Need special adjustments or fast-track courier assistance?</h4>
            <p className="text-xs text-[#735A4B] mt-0.5">Our Lekki Phase 1 studio concierge is active on WhatsApp.</p>
          </div>
          <a
            href="https://wa.me/2348140002253"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <span>Chat with Concierge</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
