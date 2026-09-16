import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface AddToCartOptions {
  size: string;
  flavor: string;
  filling?: string;
  addons?: string[];
  quantity: number;
  notes?: string;
  calculatedPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, options: AddToCartOptions) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'honeymilk_cart_v2';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage error handled
    }
  }, [items]);

  const addToCart = (product: Product, options: AddToCartOptions) => {
    const basePrice = product.base_price ?? product.price ?? 45000;
    const unitPrice = options.calculatedPrice ?? basePrice;

    // Check if duplicate item with exact same options exists
    const addonsKey = (options.addons || []).slice().sort().join('|');
    const existingIndex = items.findIndex((item) => {
      const itemAddonsKey = (item.addons || []).slice().sort().join('|');
      return (
        item.productId === product.id &&
        item.size === options.size &&
        item.flavor === options.flavor &&
        (item.filling || '') === (options.filling || '') &&
        itemAddonsKey === addonsKey &&
        (item.notes || '') === (options.notes || '')
      );
    });

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += options.quantity;
      setItems(updated);
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        name: product.name,
        price: unitPrice,
        base_price: basePrice,
        quantity: options.quantity,
        size: options.size,
        flavor: options.flavor,
        filling: options.filling,
        addons: options.addons || [],
        notes: options.notes,
        image_url: product.image_url,
      };
      setItems((prev) => [newItem, ...prev]);
    }

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
