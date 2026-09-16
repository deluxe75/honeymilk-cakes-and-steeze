import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  Clock,
  Heart,
  Truck,
  Utensils,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Product, formatNaira } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const DEFAULT_SIZES = [
  { name: '6" Petite Round (Serves 6-8)', extra: 0 },
  { name: '8" Classic Celebration (Serves 12-16)', extra: 15000 },
  { name: '10" Grand Gathering (Serves 20-26)', extra: 32000 },
  { name: '12" Sovereign 3-Tier (Serves 35-45)', extra: 55000 },
];

const DEFAULT_FLAVORS = [
  'Signature Honeycomb & Sweet Milk Sponge',
  'Deep Cocoa Red Velvet with Cream Cheese',
  'Rich Belgian Dark Chocolate Ganache',
  'Spiced Biscoff Caramel & Roasted Pecan',
  'Tahitian Vanilla Bean & Strawberry Coulis',
];

const DEFAULT_FILLINGS = [
  'Whipped Honey-Gold Buttercream',
  'Salted Caramel Drizzle Core',
  'White Chocolate Silk Ganache',
  'Passionfruit & Mango Curd',
];

const ADDONS_LIST = [
  { id: 'gold', name: '24 Karat Edible Gold Leaf Gilding', price: 6500 },
  { id: 'topper', name: 'Custom Mirrored Acrylic Cake Topper', price: 4500 },
  { id: 'candles', name: 'Luxury Champagne Sparkler Candle Set', price: 3000 },
  { id: 'box', name: 'Couture Clear-View Presentation Box with Silk Ribbon', price: 5500 },
];

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Customization selection
  const [selectedSize, setSelectedSize] = useState(DEFAULT_SIZES[0].name);
  const [selectedFlavor, setSelectedFlavor] = useState(DEFAULT_FLAVORS[0]);
  const [selectedFilling, setSelectedFilling] = useState(DEFAULT_FILLINGS[0]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [cakeNotes, setCakeNotes] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const item = await api.getProductById(parseInt(id, 10));
        if (item) {
          setProduct(item);
        }
      } catch (err) {
        console.error('Failed to load cake details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FDFBF7] px-4">
        <div className="w-12 h-12 border-4 border-[#E6B655] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg text-[#6E5446]">Preparing couture cake specification...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#2C221E]">Cake Not Found</h2>
        <p className="text-sm text-[#7A6354]">
          The cake you are looking for may have been retired or moved to our secret reserve.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2C221E] text-white rounded-full text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>
      </div>
    );
  }

  // Calculate dynamic unit price
  const basePrice = product.base_price || product.price || 45000;
  const sizeObj = DEFAULT_SIZES.find((s) => s.name === selectedSize);
  const sizeExtra = sizeObj ? sizeObj.extra : 0;
  const addonsTotal = selectedAddons.reduce((sum, addonName) => {
    const matched = ADDONS_LIST.find((a) => a.name === addonName);
    return sum + (matched ? matched.price : 0);
  }, 0);

  const calculatedUnitPrice = basePrice + sizeExtra + addonsTotal;
  const grandTotal = calculatedUnitPrice * quantity;

  const toggleAddon = (name: string) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, {
      size: selectedSize,
      flavor: selectedFlavor,
      filling: selectedFilling,
      addons: selectedAddons,
      quantity,
      notes: cakeNotes.trim() || undefined,
      calculatedPrice: calculatedUnitPrice,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6E5446] hover:text-[#2C221E] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collection</span>
          </button>
          <span className="text-xs text-[#8A7565] capitalize">
            {product.category_slug || 'Celebration Cakes'}
          </span>
        </div>

        {/* Product Customizer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image Showcase & Tasting Notes */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-stone-100 border border-[#F0E6D8] shadow-sm aspect-square">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-700"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 bg-[#2C221E]/95 text-[#E6B655] font-bold text-xs uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-sm">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Chef Tasting Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#F0E6D8] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#B38528]">
                <Utensils className="w-4 h-4" />
                <span>Atelier Tasting & Craft Notes</span>
              </div>
              <p className="text-xs sm:text-sm text-[#735A4B] leading-relaxed">
                {product.description ||
                  'Slow-baked using pure sweet churned butter, real Madagascar bourbon vanilla bean, and honeyed sponge layers crowned with handcrafted gold accents.'}
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] text-[#523A2B] border-t border-[#F4EFEA]">
                <div>
                  <span className="text-[#8A7565] block font-semibold">Prep Time</span>
                  <span className="font-bold text-[#2C221E]">24 - 48 Hours</span>
                </div>
                <div>
                  <span className="text-[#8A7565] block font-semibold">Storage</span>
                  <span className="font-bold text-[#2C221E]">Chill below 16°C</span>
                </div>
                <div>
                  <span className="text-[#8A7565] block font-semibold">Serving Guide</span>
                  <span className="font-bold text-[#2C221E]">Room temp 30m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Form & Add to Cart */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#B38528] bg-[#E6B655]/15 px-3 py-1 rounded-full inline-block mb-2">
                Customise Your Piece
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2C221E] font-bold">
                {product.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#B38528]">
                  {formatNaira(calculatedUnitPrice)}
                </span>
                {sizeExtra > 0 && (
                  <span className="text-xs text-[#8A7565]">
                    (Base: {formatNaira(basePrice)} + {formatNaira(sizeExtra)} size tier)
                  </span>
                )}
              </div>
            </div>

            {/* Size Options */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[#8A7565] tracking-wider">
                Select Cake Tier & Size *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_SIZES.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSize(s.name)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedSize === s.name
                        ? 'border-[#2C221E] bg-[#FAF4EC] ring-2 ring-[#E6B655]/40 text-[#2C221E]'
                        : 'border-[#E9DFD1] bg-[#FDFBF7] text-[#735A4B] hover:border-stone-400'
                    }`}
                  >
                    <div className="font-semibold text-xs text-[#2C221E]">{s.name}</div>
                    <div className="text-[11px] text-[#8A7565] mt-0.5">
                      {s.extra === 0 ? 'Included' : `+${formatNaira(s.extra)}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Options */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[#8A7565] tracking-wider">
                Signature Sponge Flavor *
              </label>
              <select
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs font-semibold text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
              >
                {DEFAULT_FLAVORS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Filling Options */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[#8A7565] tracking-wider">
                Interlayer Filling & Crema
              </label>
              <select
                value={selectedFilling}
                onChange={(e) => setSelectedFilling(e.target.value)}
                className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs font-semibold text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
              >
                {DEFAULT_FILLINGS.map((fil) => (
                  <option key={fil} value={fil}>
                    {fil}
                  </option>
                ))}
              </select>
            </div>

            {/* Add-ons Checklist */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[#8A7565] tracking-wider">
                Luxury Add-Ons & Steeze Touches
              </label>
              <div className="space-y-2">
                {ADDONS_LIST.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.name);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.name)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#FAF4EC] border-[#2C221E] text-[#2C221E]'
                          : 'bg-[#FDFBF7] border-[#E9DFD1] text-[#735A4B] hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-[#2C221E] border-[#2C221E]' : 'border-stone-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#B38528]">+{formatNaira(addon.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fondant Inscription */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-bold text-[#8A7565] tracking-wider">
                Complimentary Plaque Inscription
              </label>
              <input
                type="text"
                maxLength={45}
                value={cakeNotes}
                onChange={(e) => setCakeNotes(e.target.value)}
                placeholder="e.g. Steeze King Turns 28"
                className="w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
              />
            </div>

            {/* Quantity Selector & Add to Bag */}
            <div className="pt-4 border-t border-[#F4EFEA] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[#8A7565]">Quantity</span>
                <div className="flex items-center gap-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-2xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl hover:bg-stone-200 flex items-center justify-center text-[#2C221E] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold font-mono text-sm px-2 text-[#2C221E]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-xl hover:bg-stone-200 flex items-center justify-center text-[#2C221E] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 bg-[#2C221E] hover:bg-[#3B2516] text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#E6B655]" />
                <span>Add to Bag • {formatNaira(grandTotal)}</span>
              </button>

              {addedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Added to your bag! Ready for celebration checkout.</span>
                  </div>
                  <Link to="/checkout" className="underline font-bold text-emerald-900">
                    Checkout Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
