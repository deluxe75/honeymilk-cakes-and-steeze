import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Star, Clock, ShieldCheck, Heart, Award, Flame } from 'lucide-react';
import { CakeCard } from '../components/CakeCard';
import { Product } from '../types';
import { api } from '../services/api';

export const Home: React.FC = () => {
  const [featuredCakes, setFeaturedCakes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCakes() {
      try {
        const products = await api.getProducts();
        // Pick top 4 signature or bestsellers
        setFeaturedCakes(products.slice(0, 4));
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    }
    loadCakes();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F2E9] via-[#FDFBF7] to-[#FDFBF7] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#EADFCF]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EADFCF]/70 border border-[#D8C7B0] text-xs font-bold uppercase tracking-widest text-[#5E4333]">
                <Sparkles className="w-3.5 h-3.5 text-[#B37B1B]" />
                <span>Haute Couture Pastry • Soho NYC</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-[#2C221E] leading-[1.08]">
                Indulgence with{' '}
                <span className="italic font-normal text-[#B37B1B] underline decoration-[#E6B655]/40 decoration-wavy">
                  Steeze.
                </span>
              </h1>

              <p className="text-base sm:text-xl text-[#6B5244] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Layered raw wildflower honey sponge, slow-cooked caramel silks, and bold architectural design. Handcrafted daily for milestones that deserve effortless style.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/menu"
                  id="hero-order-now-btn"
                  className="w-full sm:w-auto px-8 py-4 bg-[#2C221E] hover:bg-[#433026] text-[#FDFBF7] font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4 text-[#E6B655] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/custom-order"
                  id="hero-custom-order-btn"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FAF4EC] text-[#2C221E] border border-[#D5C2AA] font-bold text-sm rounded-full transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Bespoke Event Order</span>
                </Link>
              </div>

              {/* Mini Social Proof */}
              <div className="pt-6 border-t border-[#EADFCF]/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#7A6354]">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#E6B655]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-[#2C221E]">4.9/5</span>
                  <span>(1,200+ Soho Bakes)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Flame className="w-4 h-4 text-[#B37B1B]" />
                  <span>Featured in Eater NY & Vogue</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative glowing backdrops */}
                <div className="absolute -top-6 -left-6 w-72 h-72 bg-[#E6B655]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-[#B37B1B]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative rounded-3xl overflow-hidden border-2 border-[#E5D5C0] shadow-2xl bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85"
                    alt="The Golden Honeycomb Velvet Cake"
                    className="w-full aspect-4/5 object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Floating Highlight Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#2C221E]/95 backdrop-blur-md p-4 rounded-2xl border border-[#E6B655]/30 text-white shadow-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#E6B655]">
                        Today's Star Drop
                      </span>
                      <h4 className="font-serif text-sm font-bold text-white">
                        The Golden Honeycomb Velvet
                      </h4>
                      <p className="text-[11px] text-[#C9B9A6]">Wildflower Honey & 24k Gold Praline</p>
                    </div>
                    <Link
                      to="/product/1"
                      className="px-3 py-1.5 bg-[#E6B655] hover:bg-[#D49B28] text-[#2C221E] font-bold text-xs rounded-xl transition-colors shrink-0"
                    >
                      $78.00
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Steeze Standard (Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-display font-bold tracking-widest text-[#B37B1B]">
            Craft & Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E] mt-1">
            The Steeze Standard
          </h2>
          <p className="text-sm text-[#7A6354] mt-2">
            No dry sponges. No grocery-store sugar frostings. We treat cake as edible sculpture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-[#EADFCF] shadow-xs space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F0E5] text-[#B37B1B] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">
              Raw Wildflower Honey
            </h3>
            <p className="text-sm text-[#6E5446] leading-relaxed">
              We source unpasteurized honey from regional Catskills apiaries, ensuring deep botanical sweetness without refined sugar spikes.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#EADFCF] shadow-xs space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F0E5] text-[#B37B1B] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">
              48-Hour Cold Ripening
            </h3>
            <p className="text-sm text-[#6E5446] leading-relaxed">
              Every sponge is soaked in infused syrups and rested for 48 hours to lock in moisture and harmonize delicate aromatics before frosting.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#EADFCF] shadow-xs space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F0E5] text-[#B37B1B] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">
              White-Glove Courier Hand-Off
            </h3>
            <p className="text-sm text-[#6E5446] leading-relaxed">
              Never tossed around in third-party bikes. Delivered by our trained in-house pastry couriers in temperature-controlled aesthetic boxes.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Cakes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-10">
          <div>
            <span className="text-xs uppercase font-display font-bold tracking-widest text-[#B37B1B]">
              Freshly Baked
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E] mt-1">
              Curated Signatures
            </h2>
          </div>
          <Link
            to="/menu"
            id="home-view-all-cakes-link"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#B37B1B] hover:text-[#2C221E] transition-colors"
          >
            <span>View Full Menu & Flavors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-[#F4EADB]/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCakes.map((cake) => (
              <CakeCard key={cake.id} product={cake} />
            ))}
          </div>
        )}
      </section>

      {/* Custom Order Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#2C221E] text-white p-8 sm:p-12 lg:p-16 border border-[#48352A]">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6B655]/20 text-[#E6B655] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Commissions</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              Have a visionary cake concept in mind?
            </h2>

            <p className="text-sm sm:text-base text-[#D4C3B2] leading-relaxed">
              From brutalist sculptural wedding tiers to retro baroque piping for milestone birthdays, our head pastry architects build custom edible showstoppers.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/custom-order"
                id="home-custom-order-banner-btn"
                className="px-8 py-3.5 bg-[#E6B655] hover:bg-[#D49B28] text-[#2C221E] font-bold text-sm rounded-full transition-all shadow-md"
              >
                Inquire For Your Event
              </Link>
              <Link
                to="/about"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-full transition-all border border-white/20"
              >
                Our Design Process
              </Link>
            </div>
          </div>

          {/* Decorative background image */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block opacity-40 mix-blend-luminosity">
            <img
              src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80"
              alt="Sculptural Tier Cake"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
