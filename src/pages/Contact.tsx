import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, Instagram } from 'lucide-react';

const FAQS = [
  {
    q: 'How much notice is required for standard signature cakes?',
    a: 'For signature cakes from our regular menu, we recommend placing your order at least 24 to 48 hours in advance so our honey sponge can cold-ripen properly. Same-day emergency bakes may be available by calling our studio at (212) 555-CAKE before 11:00 AM.',
  },
  {
    q: 'Where do you deliver?',
    a: 'Our in-house white-glove pastry couriers hand-deliver throughout Manhattan, Brooklyn, and parts of Queens. Orders over $120 enjoy complimentary delivery in Manhattan and Williamsburg/DUMBO.',
  },
  {
    q: 'Can you accommodate dietary restrictions (Gluten-Friendly or Nut-Free)?',
    a: 'Yes! We offer gluten-friendly sponge variations made with organic almond and sweet rice flours, as well as nut-free options. While we sanitize surfaces thoroughly, please note our Soho studio bakes with tree nuts and dairy on premises.',
  },
  {
    q: 'How do custom wedding cake tastings work?',
    a: 'We offer curated Tasting Flight Boxes shipped directly to your door or hosted privately in our Soho atelier for couples planning a 2-tier or larger cake. Inquire through our Custom Order form to schedule.',
  },
];

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase font-display font-bold tracking-widest text-[#B37B1B]">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2C221E] tracking-tight">
          Visit Our Soho Studio
        </h1>
        <p className="text-sm sm:text-base text-[#6E5446]">
          Have questions regarding custom tiers, corporate gifting, or wholesale partnership? Reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Contact Info & Map Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADFCF] shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">
              Studio Information
            </h3>

            <div className="space-y-4 text-sm text-[#5E4738]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF3E8] text-[#B37B1B] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2C221E]">Atelier Address</p>
                  <p>184 Spring Street, Soho</p>
                  <p>New York, NY 10012</p>
                  <p className="text-xs text-[#8C6F58] mt-0.5">(Between Thompson & Sullivan)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF3E8] text-[#B37B1B] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2C221E]">Hours of Operation</p>
                  <p>Tuesday – Saturday: 9:00 AM – 7:30 PM</p>
                  <p>Sunday: 10:00 AM – 5:00 PM</p>
                  <p className="text-xs text-[#8C6F58] mt-0.5">Monday: Closed for recipe experimentation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF3E8] text-[#B37B1B] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2C221E]">Telephone</p>
                  <p>(212) 555-CAKE (2253)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAF3E8] text-[#B37B1B] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2C221E]">Email Inquiries</p>
                  <p>concierge@honeymilksteeze.com</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-[#EADFCF] flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E5446]">
                Follow:
              </span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF4EC] hover:bg-[#F2E8D8] text-xs font-semibold text-[#2C221E] transition-colors border border-[#EADFCF]"
              >
                <Instagram className="w-3.5 h-3.5 text-[#B37B1B]" />
                <span>@honeymilksteeze</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Style Embed */}
          <div className="bg-white rounded-3xl overflow-hidden border border-[#EADFCF] shadow-xs">
            <div className="p-4 bg-[#FAF4EC] border-b border-[#EADFCF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B37B1B]" />
                <span className="text-xs font-bold text-[#2C221E]">Soho Studio Location</span>
              </div>
              <span className="text-[11px] font-semibold text-[#8C6F58]">Spring St Subway (C/E)</span>
            </div>
            <div className="h-52 bg-[#EADFCF] relative overflow-hidden">
              <iframe
                title="Soho Studio Map"
                src="https://maps.google.com/maps?q=184%20Spring%20Street%20New%20York%20NY%2010012&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Right: Contact Form & FAQ */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADFCF] shadow-xs">
            <h3 className="font-serif text-xl font-bold text-[#2C221E] mb-2">
              Send a Note to Our Bakery Concierge
            </h3>
            <p className="text-xs sm:text-sm text-[#6E5446] mb-6">
              We respond to inquiries within 1 business day.
            </p>

            {submitted ? (
              <div className="p-6 bg-[#EBF6EC] border border-[#B3E1BA] rounded-2xl text-center space-y-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-10 h-10 text-[#2E7D32] mx-auto" />
                <h4 className="font-serif text-lg font-bold text-[#1E5629]">
                  Message Received!
                </h4>
                <p className="text-xs text-[#2E7D32] max-w-sm mx-auto">
                  Thank you, {formData.name}. Our Soho studio concierge has received your note and will be in touch shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="px-4 py-2 bg-[#2C221E] text-white text-xs font-bold rounded-full"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4A372E]">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Cameron Diaz"
                      className="w-full bg-[#FDFBF7] border border-[#E0D2C0] rounded-xl px-4 py-2.5 text-sm text-[#2C221E] focus:outline-none focus:border-[#B37B1B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4A372E]">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      id="contact-email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="cameron@example.com"
                      className="w-full bg-[#FDFBF7] border border-[#E0D2C0] rounded-xl px-4 py-2.5 text-sm text-[#2C221E] focus:outline-none focus:border-[#B37B1B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A372E]">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Event inquiry, dietary question, or press..."
                    className="w-full bg-[#FDFBF7] border border-[#E0D2C0] rounded-xl px-4 py-2.5 text-sm text-[#2C221E] focus:outline-none focus:border-[#B37B1B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A372E]">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you have in mind..."
                    className="w-full bg-[#FDFBF7] border border-[#E0D2C0] rounded-xl p-3.5 text-sm text-[#2C221E] placeholder-[#998070] focus:outline-none focus:border-[#B37B1B]"
                  />
                </div>

                <button
                  type="submit"
                  id="contact-submit-btn"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#2C221E] hover:bg-[#433026] text-[#FDFBF7] font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#E6B655]" />
                  <span>Send Message to Studio</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADFCF] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#2C221E]">
              <HelpCircle className="w-5 h-5 text-[#B37B1B]" />
              <h3 className="font-serif text-lg font-bold">Frequently Asked Questions</h3>
            </div>

            <div className="divide-y divide-[#EADFCF]">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-serif text-sm font-bold text-[#2C221E] hover:text-[#B37B1B] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-[#B37B1B] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#A89885] shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <p className="mt-2 text-xs text-[#6E5446] leading-relaxed animate-in fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
