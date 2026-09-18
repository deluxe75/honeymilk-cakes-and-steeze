import React from 'react';
import { Link } from 'react-router-dom';
import { Cake, Instagram, Mail, Phone, MapPin, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#241A16] text-[#EFE4D6] pt-16 pb-12 border-t border-[#3B2C24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#3E2F26]">
          {/* Brand Manifesto */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E6B655] flex items-center justify-center text-[#241A16]">
                <Cake className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                HoneyMilk
              </span>
            </div>
            <p className="text-sm text-[#C9B9A6] leading-relaxed">
              Couture bakes forged with raw wildflower honey, French butter, and bold pastry architecture. High aesthetics meet unmistakable flavor.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[#E6B655]">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider bg-[#352720] px-3 py-1 rounded-full border border-[#4A372D]">
                <Sparkles className="w-3.5 h-3.5" />
                NYC Artisan Studio
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white tracking-wide">
              The Collection
            </h4>
            <ul className="space-y-2 text-sm text-[#C9B9A6]">
              <li>
                <Link to="/menu?category=signature" className="hover:text-[#E6B655] transition-colors">
                  Signature Honeycomb Cakes
                </Link>
              </li>
              <li>
                <Link to="/menu?category=wedding" className="hover:text-[#E6B655] transition-colors">
                  Architectural Wedding Tiers
                </Link>
              </li>
              <li>
                <Link to="/menu?category=bento" className="hover:text-[#E6B655] transition-colors">
                  Steeze Bento Boxes
                </Link>
              </li>
              <li>
                <Link to="/menu?category=cupcakes" className="hover:text-[#E6B655] transition-colors">
                  Couture Cupcake Flights
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-[#E6B655] transition-colors text-[#E6B655] font-semibold">
                  Track Your Cake Order →
                </Link>
              </li>
              <li>
                <Link to="/custom-order" className="hover:text-[#E6B655] transition-colors font-medium">
                  Bespoke Custom Cake Inquiry →
                </Link>
              </li>
            </ul>
          </div>

          {/* Bakery Studio Location */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white tracking-wide">
              Boutique Studio
            </h4>
            <div className="space-y-2.5 text-sm text-[#C9B9A6]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E6B655] shrink-0 mt-0.5" />
                <span>14B Admiralty Way, Lekki Phase 1<br />Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E6B655] shrink-0" />
                <span>+234 814 000 2253</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E6B655] shrink-0" />
                <span>orders@honeymilksteeze.com</span>
              </div>
              <div className="text-xs text-[#A89885] pt-1">
                Tues – Sun: 9:00 AM – 7:30 PM (Closed Mondays for creation)
              </div>
            </div>
          </div>

          {/* VIP Tasting Club */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white tracking-wide">
              Steeze Club Drops
            </h4>
            <p className="text-xs text-[#C9B9A6] leading-relaxed">
              Receive secret weekend bakes, limited-batch flavor drops, and exclusive event tastings.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Welcome to the Steeze Tasting Club! We will notify you of secret drops.');
              }}
              className="flex flex-col gap-2"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="bg-[#31231D] border border-[#48352A] text-sm text-white placeholder-[#8B7767] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E6B655]"
              />
              <button
                type="submit"
                className="bg-[#E6B655] hover:bg-[#D49B28] text-[#241A16] font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors text-center"
              >
                Join VIP Club
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9B8978]">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} HoneyMilk Cakes & Steeze LLC. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-[#E6B655] transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-[#E6B655] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
