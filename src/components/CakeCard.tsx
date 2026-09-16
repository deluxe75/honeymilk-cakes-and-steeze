import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { Product, formatNaira } from '../types';

interface CakeCardProps {
  product: Product;
}

export const CakeCard: React.FC<CakeCardProps> = ({ product }) => {
  const displayPrice = product.base_price ?? product.price ?? 45000;
  const categoryLabel = (product.category_slug || product.category || 'Celebration').replace(/_/g, ' ');

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#EADFCF] shadow-xs hover:shadow-xl hover:border-[#D49B28]/50 transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F4E9D8]">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-[#2C221E]/90 backdrop-blur-xs text-[#E6B655] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#E6B655]/30 flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#E6B655]" />
            <span>{product.badge}</span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-[#523A2B] text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs capitalize">
          {categoryLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C221E] group-hover:text-[#B37B1B] transition-colors line-clamp-1">
              {product.name}
            </h3>
            <span className="font-serif font-bold text-base sm:text-lg text-[#B38528] shrink-0">
              {formatNaira(displayPrice)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#6E5446] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-[#F2E8D8] flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#998070]">
            Handcrafted with Steeze
          </span>

          <Link
            to={`/product/${product.id}`}
            id={`cake-card-btn-${product.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2C221E] group-hover:text-[#B37B1B] transition-colors"
          >
            <span>Customise</span>
            <div className="w-7 h-7 rounded-full bg-[#FAF5EE] group-hover:bg-[#2C221E] group-hover:text-white flex items-center justify-center transition-all">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
