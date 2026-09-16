import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import { CakeCard } from '../components/CakeCard';
import { Product, CakeCategory } from '../types';
import { api } from '../services/api';

const CATEGORIES: { label: string; value: CakeCategory }[] = [
  { label: 'All Creations', value: 'all' },
  { label: 'Signature Steeze', value: 'signature' },
  { label: 'Birthday Celebrations', value: 'birthday' },
  { label: 'Architectural Wedding', value: 'wedding' },
  { label: 'Bento Mini Duos', value: 'bento' },
  { label: 'Couture Cupcakes', value: 'cupcakes' },
];

export const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = (searchParams.get('category') as CakeCategory) || 'all';

  const [selectedCategory, setSelectedCategory] = useState<CakeCategory>(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get('category') as CakeCategory;
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchCakes() {
      setLoading(true);
      try {
        const list = await api.getProducts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
        });
        setProducts(list);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchCakes();
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleCategoryClick = (cat: CakeCategory) => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Client sort
  const getP = (p: Product) => p.base_price ?? p.price ?? 0;
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return getP(a) - getP(b);
    if (sortBy === 'price-desc') return getP(b) - getP(a);
    return 0; // default featured
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EADFCF] text-[#5E4333] text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#B37B1B]" />
          <span>The Bakery Catalog</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2C221E] tracking-tight">
          Artisan Cakes & Pâtisserie
        </h1>
        <p className="text-sm sm:text-base text-[#6E5446]">
          Every cake is baked to order from scratch with unpasteurized raw wildflower honey, French Normandy butter, and decadent infused ganaches.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#EADFCF] shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#A89885] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="menu-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by flavor, cake name..."
              className="w-full bg-[#FDFBF7] border border-[#E0D2C0] rounded-full pl-10 pr-4 py-2 text-sm text-[#2C221E] placeholder-[#998070] focus:outline-none focus:border-[#B37B1B]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-auto flex items-center justify-end gap-2 text-xs font-medium text-[#6E5446]">
            <SlidersHorizontal className="w-4 h-4 text-[#A89885]" />
            <span>Sort by:</span>
            <select
              id="menu-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FDFBF7] border border-[#E0D2C0] rounded-xl px-3 py-2 text-xs text-[#2C221E] font-semibold focus:outline-none focus:border-[#B37B1B]"
            >
              <option value="featured">Featured Curations</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              id={`cat-filter-${cat.value}`}
              onClick={() => handleCategoryClick(cat.value)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#2C221E] text-[#FDFBF7] shadow-sm'
                  : 'bg-[#FAF4EC] text-[#5E4738] hover:bg-[#F2E8D8] border border-[#EADFCF]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cakes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-96 bg-[#F2E8D8]/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EADFCF] p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF4EC] text-[#A6886B] mx-auto flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#2C221E]">
            No cakes found matching your filter
          </h3>
          <p className="text-sm text-[#7A6354] max-w-sm mx-auto">
            Try searching for different ingredients or reset filters to browse our signature collection.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setSearchParams({});
            }}
            className="px-6 py-2.5 bg-[#2C221E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#433026] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <CakeCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
