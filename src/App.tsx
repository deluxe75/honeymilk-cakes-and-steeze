import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

// Pages
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { ProductDetail } from './pages/ProductDetail';
import { CustomOrder } from './pages/CustomOrder';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { OrderTracking } from './pages/OrderTracking';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppRoutes() {
  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/custom-order" element={<CustomOrder />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
      <Route path="/track-order" element={<OrderTracking />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2C221E] selection:bg-[#E6B655] selection:text-[#2C221E]">
      <Navbar />
      <CartDrawer />
      <main className="flex-grow">{routes}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <AppRoutes />
      </CartProvider>
    </BrowserRouter>
  );
}
