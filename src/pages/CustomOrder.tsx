import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  ArrowRight,
  Shield,
  MessageCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { CustomOrder as CustomOrderType } from '../types';

const OCCASIONS = [
  'Milestone Birthday Celebration',
  'Luxury Architectural Wedding',
  'Editorial Brand Launch / VIP Activation',
  'Anniversary & Renewal of Vows',
  'Couture Baby Shower & Gender Reveal',
  'High-Society Gala / State Banquet',
  'Bespoke Steeze Art Commission',
];

const FLAVORS = [
  'Signature Wildflower Honeycomb & Sweet Milk Sponge',
  'Raw Sicilian Pistachio & Green Cardamom Ganache',
  'Midnight Belgian Dark Truffle & Espresso Dulce',
  'Champagne Sponge & Passion Fruit Velvet Curd',
  'Japanese Hokkaido Milk & Macerated Strawberries',
  'Spiced Biscoff Caramel & Salted Fleur de Sel',
  'Chef Curated Fusion (Let the Pastry Chef Surprise Us)',
];

const SIZES = [
  '1-Tier Sculptural (Serves 15 - 20)',
  '2-Tier Architectural Centerpiece (Serves 35 - 50)',
  '3-Tier Grand Statement (Serves 75 - 100)',
  '4-Tier Couture Masterpiece (Serves 120+)',
  'Curated Mini Steeze Bento Flight (25 - 40 units)',
];

const BUDGETS = [
  '₦75,000 - ₦150,000 (Single-tier bespoke or Bento flight)',
  '₦150,000 - ₦300,000 (2-Tier celebration centerpiece)',
  '₦300,000 - ₦650,000 (3-Tier architectural wedding masterpiece)',
  '₦650,000+ (Multi-tier grand gala or suspended sculpted installation)',
];

export const CustomOrder: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    occasion: OCCASIONS[0],
    flavor: FLAVORS[0],
    size: SIZES[1],
    budget: BUDGETS[1],
    event_date: '',
    cake_message: '',
    notes: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<CustomOrderType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Minimum date: 3 days in future
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateString = minDate.toISOString().split('T')[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setErrorMessage('Please provide your name, phone number, and email.');
      return;
    }

    if (!formData.event_date) {
      setErrorMessage('Please select your celebration date.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.createCustomOrder({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        occasion: formData.occasion,
        cake_type: 'Bespoke Couture',
        flavor: formData.flavor,
        size: formData.size,
        budget_tier: formData.budget,
        event_date: formData.event_date,
        cake_message: formData.cake_message.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        reference_images: images,
        reference_image: images[0] || undefined,
      });

      setSubmissionSuccess(res);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to submit custom commission. Please retry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION STATE
  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#F0E6D8] p-8 sm:p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-amber-50 text-[#E6B655] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="text-xs uppercase tracking-widest font-bold text-[#B38528] bg-[#E6B655]/15 px-3.5 py-1 rounded-full inline-block mb-3">
            Bespoke Commission Received
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#2C221E] font-bold mb-3">
            Your Vision is in Good Hands, {submissionSuccess.name}!
          </h1>

          <p className="text-sm sm:text-base text-[#735A4B] max-w-lg mx-auto mb-6">
            Chef Simone and our cake design team have logged your commission into our design studio queue.
          </p>

          <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#ECE2D2] inline-block mb-8">
            <span className="text-xs uppercase tracking-wider text-[#8A7565] font-semibold block mb-1">
              Commission Reference:
            </span>
            <span className="font-mono text-xl font-bold text-[#2C221E]">
              {submissionSuccess.reference_id}
            </span>
          </div>

          <div className="space-y-4 max-w-md mx-auto text-left text-xs bg-[#FDFBF7] p-5 rounded-2xl border border-[#F0E6D8] mb-8">
            <div className="flex justify-between pb-2 border-b border-[#F4EFEA]">
              <span className="text-[#8A7565]">Occasion:</span>
              <span className="font-bold text-[#2C221E]">{submissionSuccess.occasion}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#F4EFEA]">
              <span className="text-[#8A7565]">Celebration Date:</span>
              <span className="font-bold text-[#2C221E]">{submissionSuccess.event_date}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#F4EFEA]">
              <span className="text-[#8A7565]">Size & Tier:</span>
              <span className="font-bold text-[#2C221E]">{submissionSuccess.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A7565]">Target Budget:</span>
              <span className="font-bold text-[#2C221E]">{submissionSuccess.budget_tier}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/2348140002253?text=${encodeURIComponent(
                `Hello HoneyMilk Atelier, I just submitted bespoke cake commission #${submissionSuccess.reference_id} for ${submissionSuccess.occasion} on ${submissionSuccess.event_date}. Would love to share further sketches!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Continue on WhatsApp Concierge</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => {
                setSubmissionSuccess(null);
                setImages([]);
              }}
              className="w-full sm:w-auto px-6 py-3.5 border border-[#E9DFD1] text-[#2C221E] hover:bg-stone-50 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Title Header */}
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#B38528] bg-[#E6B655]/15 px-3.5 py-1 rounded-full inline-block mb-3">
            Haute Pâtisserie Commissions
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#2C221E] font-bold">
            Commission a Bespoke Cake
          </h1>
          <p className="text-sm sm:text-base text-[#735A4B] max-w-xl mx-auto mt-3">
            From multi-tiered Nigerian luxury weddings to avant-garde birthday sculptures. Tell us your vision, attach your Pinterest moodboard, and our master decorators will sculpt your masterpiece.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-[#F0E6D8] p-6 sm:p-10 shadow-sm">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Customer Info */}
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C221E] pb-2 border-b border-[#F4EFEA] mb-4">
                1. Client Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Somtochukwu Balogun"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="somto@example.com"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 803 123 4567"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    WhatsApp Line (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Same as phone if left blank"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Celebration Specs */}
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C221E] pb-2 border-b border-[#F4EFEA] mb-4">
                2. Celebration & Cake Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    Occasion *
                  </label>
                  <select
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    Celebration Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={minDateString}
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    Cake Scale & Tier *
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  >
                    {SIZES.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    Primary Sponge Flavor *
                  </label>
                  <select
                    value={formData.flavor}
                    onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  >
                    {FLAVORS.map((flv) => (
                      <option key={flv} value={flv}>
                        {flv}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block uppercase font-bold text-[#8A7565] mb-1.5">
                    Target Budget Range *
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
                  >
                    {BUDGETS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Reference Photos & Moodboard */}
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2C221E] pb-2 border-b border-[#F4EFEA] mb-4">
                3. Moodboard & Reference Photos (Max 4)
              </h2>

              <div className="border-2 border-dashed border-[#E9DFD1] hover:border-[#E6B655] rounded-3xl p-6 text-center transition-colors bg-[#FDFBF7]">
                <input
                  type="file"
                  id="custom-file-upload"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="custom-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-[#E6B655] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#2C221E]">
                    Click to browse or drag inspiration photos here
                  </span>
                  <span className="text-[11px] text-[#8A7565]">
                    Supports JPEG, PNG, or WEBP up to 8MB each
                  </span>
                </label>
              </div>

              {/* Uploaded Images Preview Grid */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#E9DFD1]">
                      <img src={img} alt="Inspiration" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center text-[10px] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Design Notes */}
            <div>
              <label className="block uppercase font-bold text-[#8A7565] mb-1.5 text-xs">
                Design Vision, Color Palette & Inscription
              </label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Describe your theme, floral accents, color swatches (e.g. champagne gold, emerald green, terracotta), structural heights, or dietary requirements..."
                className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E9DFD1] rounded-xl text-xs text-[#2C221E] focus:outline-none focus:ring-2 focus:ring-[#E6B655]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#2C221E] hover:bg-[#3B2516] text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting to Atelier...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E6B655]" />
                    <span>Submit Bespoke Commission Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
