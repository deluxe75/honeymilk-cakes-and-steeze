import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../types';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-[#2C221E]/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#EADFCF] flex items-center justify-between bg-[#FAF4EC]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2C221E] flex items-center justify-center text-[#E6B655]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2C221E]">
                  Your Cake Bag
                </h3>
                <p className="text-xs text-[#7A6354]">
                  {totalItems} {totalItems === 1 ? 'cake' : 'cakes'} selected
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              id="close-cart-btn"
              aria-label="Close cart"
              className="p-2 rounded-full text-[#7A6354] hover:text-[#2C221E] hover:bg-[#EEDFCB] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steeze Free Delivery tier notice */}
          <div className="bg-[#F4E9D8] px-6 py-2.5 border-b border-[#EADFCF] text-xs text-[#523A2B] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B37B1B] shrink-0" />
            <span>Orders over ₦90,000 unlock complimentary climate-controlled delivery in Lagos!</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F4EADB] flex items-center justify-center text-[#A6886B] mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#2C221E]">
                  Your bag is empty
                </h4>
                <p className="text-sm text-[#7A6354] max-w-xs mt-1 mb-6">
                  Experience true artisanal flavor. Explore our honey-infused and steeze-crafted creations.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/menu');
                  }}
                  className="px-6 py-2.5 bg-[#2C221E] hover:bg-[#3E2D25] text-[#FDFBF7] font-semibold text-sm rounded-full transition-colors cursor-pointer"
                >
                  Explore The Cakes
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl bg-white border border-[#EADFCF] shadow-xs"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#EADFCF]"
                    referrerPolicy="no-referrer"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif text-sm font-bold text-[#2C221E] leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#998070] hover:text-red-600 p-1 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#7A6354] mt-1 space-y-0.5">
                      <div className="font-medium text-[#523A2B]">{item.size}</div>
                      <div>{item.flavor}</div>
                      {item.filling && <div>Filling: {item.filling}</div>}
                      {item.notes && (
                        <div className="italic text-[10px] text-[#A6886B] truncate">
                          "{item.notes}"
                        </div>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#FAF2E6]">
                      <div className="flex items-center border border-[#D5C2AA] rounded-full bg-[#FAF5EE]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#523A2B] hover:text-black cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#2C221E]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#523A2B] hover:text-black cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-sm text-[#B38528]">
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#EADFCF] bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-[#7A6354]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#2C221E] text-sm">
                    {formatNaira(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfillment Dispatch</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-[#FAF4EC]">
                <span className="font-serif font-bold text-base text-[#2C221E]">Estimated Total</span>
                <span className="font-serif font-extrabold text-xl text-[#B38528]">
                  {formatNaira(subtotal)}
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                id="drawer-checkout-btn"
                className="w-full py-4 bg-[#2C221E] hover:bg-[#3D2C24] text-[#FDFBF7] font-bold text-sm rounded-full shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#E6B655]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
