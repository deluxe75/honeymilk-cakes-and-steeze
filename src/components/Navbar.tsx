import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sparkles, Shield, Cake } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu & Shop', path: '/menu' },
    { name: 'Custom Order', path: '/custom-order' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EADFCF]/80 transition-all">
      {/* Announcement Bar */}
      <div className="bg-[#2C221E] text-[#F3E8D6] text-xs font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#E6B655] animate-pulse" />
        <span>Fresh Honeycomb Velvet drop every morning • Pickup in Soho or Hand Delivery</span>
        <span className="hidden sm:inline-block text-[#D49B28] font-bold">#SteezeCertified</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group" id="nav-brand-logo">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E6B655] to-[#B37B1B] p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-[#2C221E] rounded-full flex items-center justify-center text-[#E6B655]">
                <Cake className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2C221E] group-hover:text-[#B37B1B] transition-colors leading-none">
                HoneyMilk
              </span>
              <span className="text-[10px] uppercase font-display font-bold tracking-[0.25em] text-[#A67C52] mt-0.5">
                Cakes & Steeze
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-[#2C221E] text-[#FDFBF7] shadow-sm'
                    : 'text-[#5A453B] hover:text-[#2C221E] hover:bg-[#F2E8D8]/70'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions: Admin & Cart */}
          <div className="flex items-center space-x-3">
            <Link
              to="/admin"
              title="Admin Order Portal"
              id="nav-admin-link"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-[#D5C2AA] text-[#6E5446] hover:text-[#2C221E] hover:border-[#B37B1B] hover:bg-[#FAF4EC] transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#B37B1B]" />
              <span>Admin</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              id="nav-cart-btn"
              aria-label="View Shopping Cart"
              className="relative p-2.5 rounded-full bg-[#FAF4EC] hover:bg-[#F2E8D8] text-[#2C221E] transition-all border border-[#E5D7C5] hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 text-[#2C221E]" />
              {totalItems > 0 && (
                <span
                  id="nav-cart-badge"
                  className="absolute -top-1 -right-1 bg-[#B37B1B] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce"
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="nav-mobile-toggle"
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-lg text-[#2C221E] hover:bg-[#F2E8D8] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-b border-[#EADFCF] px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-[#2C221E] text-white font-semibold'
                  : 'text-[#4A372E] hover:bg-[#F4EBDE]'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#EADFCF]/60">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#8C6239] hover:bg-[#F4EBDE] rounded-xl"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Order & Catalog Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
