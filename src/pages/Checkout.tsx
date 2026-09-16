import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  Store,
  Calendar,
  ShieldCheck,
  CreditCard,
  Banknote,
  Clock,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatNaira } from '../types';

export const Checkout: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Customer Contact State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');

  // Delivery / Pickup State
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [deliveryState, setDeliveryState] = useState('Lagos');
  const [deliveryArea, setDeliveryArea] = useState('Lekki Phase 1');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('12:00 PM - 3:00 PM');

  // Cake Customization State
  const [cakeMessage, setCakeMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'cash_on_delivery'>('paystack');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculations
  const deliveryFee = deliveryType === 'delivery' ? (subtotal >= 90000 ? 0 : 4500) : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (step === 1) {
      if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
        setErrorMessage('Please provide your full name, email, and mobile phone number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
        setErrorMessage('Please enter your full street address for courier dispatch.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Send order payload to server (Server recalculates & validates every price!)
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        customer_whatsapp: customerWhatsapp.trim() || customerPhone.trim(),
        items: items.map((it) => ({
          product_id: it.productId,
          name: it.name,
          base_price: it.price,
          size: it.size,
          flavor: it.flavor,
          filling: it.filling,
          addons: it.addons,
          quantity: it.quantity,
          notes: it.notes,
        })),
        delivery_type: deliveryType,
        delivery_state: deliveryState,
        delivery_city: 'Lagos',
        delivery_area: deliveryArea,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress.trim() : 'Studio Pickup - Lekki Phase 1',
        delivery_date: deliveryDate,
        delivery_time_slot: deliveryTimeSlot,
        cake_message: cakeMessage.trim() || undefined,
        special_instructions: specialInstructions.trim() || undefined,
        payment_method: paymentMethod,
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();

      // 2. Handle Payment Flow
      if (paymentMethod === 'paystack') {
        try {
          const payRes = await api.initializePayment(
            createdOrder.order_number,
            `${window.location.origin}/order-confirmation/${createdOrder.order_number}`
          );
          if (payRes.authorization_url) {
            window.location.href = payRes.authorization_url;
            return;
          }
        } catch (payErr) {
          console.warn('Paystack redirection fallback:', payErr);
        }
      }

      // 3. Navigate directly to Order Confirmation
      navigate(`/order-confirmation/${createdOrder.order_number}`);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Error processing your order. Please check the details and retry.'
      );
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFBF7] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF4EC] flex items-center justify-center text-[#E6B655] mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#2C221E] mb-2">Your Cake Bag is Empty</h2>
        <p className="text-[#735A4B] text-sm max-w-sm mb-6">
          Explore our couture cake collections and select your celebration pieces to begin checkout.
        </p>
        <Link
          to="/menu"
          className="px-6 py-3 bg-[#2C221E] hover:bg-[#3B2516] text-white text-sm font-medium rounded-xl transition-colors"
        >
          Explore Cake Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8A7565] hover:text-[#2C221E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Header & Step Tracker */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B38528] bg-[#E6B655]/15 px-3 py-1 rounded-full inline-block mb-2">
            Secure Pâtisserie Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2C221E] font-bold">Fulfill Your Celebration</h1>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-6">
            {[
              { num: 1, label: 'Contact' },
              { num: 2, label: 'Delivery' },
              { num: 3, label: 'Customise' },
              { num: 4, label: 'Review & Pay' },
            ].map((s) => (
              <div
                key={s.num}
                onClick={() => (s.num < step ? setStep(s.num as any) : null)}
                className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl border transition-all ${
                  step === s.num
                    ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-sm'
                    : s.num < step
                    ? 'bg-white text-[#2C221E] border-[#E9DFD1] cursor-pointer'
                    : 'bg-[#F9F6F0] text-[#A6978A] border-[#EFE8DC]'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step === s.num ? 'bg-[#E6B655] text-[#2C221E]' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {s.num}
                </span>
                <span className="text-xs font-semibold truncate hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Attention Required</p>
              <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Body */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm">
            {/* STEP 1: Customer Information */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-[#2C221E] pb-3 border-b border-[#F4EFEA]">
                  Step 1: Customer Contact Details
                </h2>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tiwa Adeleke"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tiwa@example.com"
                      className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                    WhatsApp Number (for delivery live status)
                  </label>
                  <input
                    type="tel"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="+234 803 123 4567 (leave blank if same as phone)"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#2C221E] hover:bg-[#3B2516] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Continue to Delivery Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Delivery & Date Options */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#F4EFEA]">
                  <h2 className="font-serif text-xl font-bold text-[#2C221E]">
                    Step 2: Delivery & Date Selection
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#8A7565] hover:text-[#2C221E] underline cursor-pointer"
                  >
                    Edit Contact
                  </button>
                </div>

                {/* Pickup vs Delivery Tabs */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'border-[#2C221E] bg-[#2C221E] text-white shadow-sm'
                        : 'border-[#E9DFD1] bg-[#FDFBF7] text-[#735A4B] hover:border-stone-400'
                    }`}
                  >
                    <Truck className="w-6 h-6 mb-1.5" />
                    <span className="font-semibold text-sm">Courier Dispatch</span>
                    <span className="text-[11px] opacity-80 mt-0.5">White-glove climate control</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'border-[#2C221E] bg-[#2C221E] text-white shadow-sm'
                        : 'border-[#E9DFD1] bg-[#FDFBF7] text-[#735A4B] hover:border-stone-400'
                    }`}
                  >
                    <Store className="w-6 h-6 mb-1.5" />
                    <span className="font-semibold text-sm">Studio Pickup</span>
                    <span className="text-[11px] opacity-80 mt-0.5">Lekki Phase 1, Lagos</span>
                  </button>
                </div>

                {deliveryType === 'delivery' ? (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                          State / Territory
                        </label>
                        <select
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value)}
                          className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                        >
                          <option value="Lagos">Lagos State</option>
                          <option value="Abuja">FCT Abuja</option>
                          <option value="Ogun">Ogun State (Interstate Dispatch)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                          Area / Neighborhood *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryArea}
                          onChange={(e) => setDeliveryArea(e.target.value)}
                          placeholder="e.g. Lekki Phase 1, Ikoyi, Victoria Island"
                          className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                        Street Address *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House / Flat number, Street name, Estate gate instructions"
                        className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FAF4EC] border border-[#EADFCF] text-xs text-[#523A2B] space-y-1">
                    <p className="font-bold text-[#2C221E] uppercase tracking-wider">Studio Pickup Location:</p>
                    <p>HoneyMilk Steeze Atelier, 14B Admiralty Way, Lekki Phase 1, Lagos</p>
                    <p className="text-[11px] text-[#735A4B]">Complimentary luxury packaging with cooling gel packs provided.</p>
                  </div>
                )}

                {/* Scheduled Fulfillment Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                      Fulfillment Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                      Preferred Time Slot
                    </label>
                    <select
                      value={deliveryTimeSlot}
                      onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                    >
                      <option value="10:00 AM - 1:00 PM">Morning Window (10:00 AM - 1:00 PM)</option>
                      <option value="1:00 PM - 4:00 PM">Afternoon Window (1:00 PM - 4:00 PM)</option>
                      <option value="4:00 PM - 7:00 PM">Evening Window (4:00 PM - 7:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-[#E9DFD1] text-[#735A4B] font-medium rounded-xl text-sm hover:bg-stone-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#2C221E] hover:bg-[#3B2516] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Proceed to Cake Inscription</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Customization & Special Message */}
            {step === 3 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F4EFEA]">
                  <h2 className="font-serif text-xl font-bold text-[#2C221E]">
                    Step 3: Cake Inscription & Notes
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-[#8A7565] hover:text-[#2C221E] underline cursor-pointer"
                  >
                    Edit Delivery
                  </button>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                    Fondant Plaque Inscription (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={cakeMessage}
                    onChange={(e) => setCakeMessage(e.target.value)}
                    placeholder="e.g. Happy 30th Birthday Tiwa!"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                  <p className="text-[11px] text-[#8A7565] mt-1">
                    Complimentary custom chocolate calligraphy banner. Max 50 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                    Chef Tasting & Handling Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Dietary allergies, gate access codes, or preferred candle color preference..."
                    className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-[#2C221E] text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-3 border border-[#E9DFD1] text-[#735A4B] font-medium rounded-xl text-sm hover:bg-stone-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#2C221E] hover:bg-[#3B2516] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Review Order & Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Payment Selection & Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#F4EFEA]">
                  <h2 className="font-serif text-xl font-bold text-[#2C221E]">
                    Step 4: Payment Method & Place Order
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-[#8A7565] hover:text-[#2C221E] underline cursor-pointer"
                  >
                    Edit Message
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs uppercase font-semibold text-[#8A7565] tracking-wider mb-1.5">
                    Select Payment Gateway *
                  </label>

                  {/* Paystack Option */}
                  <div
                    onClick={() => setPaymentMethod('paystack')}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'paystack'
                        ? 'border-[#2C221E] bg-[#FAF4EC] ring-2 ring-[#E6B655]/40'
                        : 'border-[#E9DFD1] bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#2C221E] block">
                          Paystack (Cards, Bank Transfer, USSD)
                        </span>
                        <span className="text-xs text-[#735A4B]">
                          Instant verification for priority kitchen queue
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'paystack' ? 'border-[#2C221E] bg-[#2C221E]' : 'border-stone-300'
                      }`}
                    >
                      {paymentMethod === 'paystack' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Cash on Delivery / Pickup Option */}
                  <div
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-[#2C221E] bg-[#FAF4EC] ring-2 ring-[#E6B655]/40'
                        : 'border-[#E9DFD1] bg-white hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#2C221E] block">
                          Cash / POS on {deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
                        </span>
                        <span className="text-xs text-[#735A4B]">
                          Settle upon cake handoff at your doorstep or studio
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-[#2C221E] bg-[#2C221E]'
                          : 'border-stone-300'
                      }`}
                    >
                      {paymentMethod === 'cash_on_delivery' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Security Guarantee */}
                <div className="p-3 bg-stone-50 rounded-xl flex items-center gap-2.5 text-xs text-[#735A4B]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Server-validated pricing. All orders are recorded directly in the atelier database.
                  </span>
                </div>

                {/* Final Submit Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-3.5 border border-[#E9DFD1] text-[#735A4B] font-medium rounded-xl text-sm hover:bg-stone-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handlePlaceOrder}
                    className="flex-1 py-4 bg-[#2C221E] hover:bg-[#3B2516] text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Locking in Your Cake...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#E6B655]" />
                        <span>Confirm & Place Order ({formatNaira(grandTotal)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Order Summary Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#F0E6D8] p-6 shadow-sm sticky top-24">
            <h3 className="font-serif text-lg font-bold text-[#2C221E] pb-3 border-b border-[#F4EFEA] mb-4">
              Your Cake Selection ({items.length})
            </h3>

            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b border-[#FAF6F0] last:border-b-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-[#2C221E] truncate">{item.name}</h4>
                    <p className="text-[11px] text-[#8A7565] mt-0.5">
                      {item.size} • {item.flavor}
                    </p>
                    {item.filling && (
                      <p className="text-[10px] text-[#A6978A]">{item.filling}</p>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-[#735A4B]">Qty: {item.quantity}</span>
                      <span className="text-xs font-bold text-[#2C221E]">
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-[#F4EFEA] pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-[#735A4B]">
                <span>Cakes Subtotal:</span>
                <span className="font-medium text-[#2C221E]">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#735A4B]">
                <span>Courier Dispatch:</span>
                <span className="font-medium text-[#2C221E]">
                  {deliveryFee > 0 ? formatNaira(deliveryFee) : 'Complimentary'}
                </span>
              </div>
              {subtotal >= 90000 && deliveryType === 'delivery' && (
                <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                  🎉 Free Lagos Dispatch unlocked on orders over ₦90,000!
                </p>
              )}
              <div className="flex justify-between text-base font-bold text-[#2C221E] pt-2 border-t border-[#F4EFEA]">
                <span>Total Due:</span>
                <span className="text-[#B38528] text-lg">{formatNaira(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
