import React from 'react';
import { Sparkles, Heart, Award, ShieldCheck, Flame, Compass, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F7F2E9] to-[#FDFBF7] py-16 sm:py-24 border-b border-[#EADFCF]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EADFCF] text-[#5E4333] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#B37B1B]" />
            <span>The Soho Pâtisserie Manifesto</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#2C221E] tracking-tight">
            Honey, Cream & Pure Unapologetic{' '}
            <span className="italic text-[#B37B1B]">Steeze.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#6B5244] max-w-2xl mx-auto leading-relaxed">
            Born out of a desire to eliminate dry grocery-store sponges and pastel clichés. We bake sculpture, flavor, and high confidence into every tier.
          </p>
        </div>
      </section>

      {/* The Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-[#5E4738] text-sm sm:text-base leading-relaxed">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B37B1B]">
              <Compass className="w-4 h-4" />
              <span>Our Origin</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
              Why "HoneyMilk" and Why "Steeze"?
            </h2>

            <p>
              Traditional high-end bakeries often fell into two traps: either saccharine-sweet fondant sculptures that tasted like cardboard, or stuffy European tea rooms that felt stuck in 1890.
            </p>

            <p>
              In 2021, Head Pastry Architect Simone Laurent set up an experimental oven in Soho. The recipe was simple but uncompromising: replace refined white sugar bases with <strong className="text-[#2C221E]">raw unpasteurized wildflower honey</strong> from Catskills apiaries, fold in <strong className="text-[#2C221E]">cultured French Normandy butter</strong>, and finish with bold, architectural presentation.
            </p>

            <p>
              "Steeze" is our cultural ethos. It means effortless style, swagger, and modern edge. We believe celebrating milestone moments—whether your 30th birthday, an editorial magazine launch, or a rooftop wedding—demands a cake that matches your personal aesthetic.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80"
              alt="Artisan Pastry Preparation"
              className="rounded-3xl object-cover h-64 w-full border border-[#EADFCF] shadow-md"
              referrerPolicy="no-referrer"
            />
            <img
              src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80"
              alt="Architectural Cake"
              className="rounded-3xl object-cover h-64 w-full border border-[#EADFCF] shadow-md mt-6"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* 4 Pillars of HoneyMilk Sourcing */}
      <section className="bg-[#FAF4EC] py-16 border-y border-[#EADFCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-display font-bold tracking-widest text-[#B37B1B]">
              No Compromise
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E] mt-1">
              Our 4 Ingredient Commitments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#EADFCF] shadow-xs space-y-3">
              <span className="text-2xl font-serif font-bold text-[#B37B1B]">01</span>
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">Raw Catskills Honey</h3>
              <p className="text-xs text-[#6E5446] leading-relaxed">
                Small-batch harvested, wildflower and buckwheat varieties providing complex floral, malty notes that synthetic sugar syrups cannot imitate.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EADFCF] shadow-xs space-y-3">
              <span className="text-2xl font-serif font-bold text-[#B37B1B]">02</span>
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">Normandy Cultured Butter</h3>
              <p className="text-xs text-[#6E5446] leading-relaxed">
                84% butterfat European butter creates silky, airy Italian meringue buttercreams that melt instantaneously on the tongue without greasiness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EADFCF] shadow-xs space-y-3">
              <span className="text-2xl font-serif font-bold text-[#B37B1B]">03</span>
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">Single-Origin Valrhona</h3>
              <p className="text-xs text-[#6E5446] leading-relaxed">
                70% Guanaja and caramelized Dulcey blond chocolates roasted in Tain-l'Hermitage for deep, bittersweet richness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#EADFCF] shadow-xs space-y-3">
              <span className="text-2xl font-serif font-bold text-[#B37B1B]">04</span>
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">Zero Artificial Dye</h3>
              <p className="text-xs text-[#6E5446] leading-relaxed">
                Colors are achieved via freeze-dried dragonfruit, Japanese ceremonial matcha, crushed raspberries, and edible 24-karat gold leaf.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E]">
          Ready to taste the difference?
        </h2>
        <p className="text-sm sm:text-base text-[#6E5446] max-w-lg mx-auto">
          Order a signature honeycomb drop for this weekend or book a custom bespoke commission with our head bakers.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/menu"
            className="px-8 py-3.5 bg-[#2C221E] text-white font-bold text-sm rounded-full hover:bg-[#433026] transition-colors"
          >
            Explore The Menu
          </Link>
          <Link
            to="/custom-order"
            className="px-8 py-3.5 bg-white border border-[#D5C2AA] text-[#2C221E] font-bold text-sm rounded-full hover:bg-[#FAF4EC] transition-colors"
          >
            Commission Custom Cake
          </Link>
        </div>
      </section>
    </div>
  );
};
