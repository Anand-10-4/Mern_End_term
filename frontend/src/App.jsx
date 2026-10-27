import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import CartModal from './components/CartModal';
import BakeryMenu from './pages/BakeryMenu';
import CustomCakeStudio from './pages/CustomCakeStudio';
import KitchenTracker from './pages/KitchenTracker';
import AddBakeItem from './pages/AddBakeItem';
import BakeryAnalytics from './pages/BakeryAnalytics';
import LoginRegister from './pages/LoginRegister';

function AppContent() {
  const [activePage, setActivePage] = useState('menu');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart operations
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => !item.isCustomCake && item._id === product._id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleAddCustomCakeToCart = (cakeItem) => {
    setCart((prev) => [...prev, cakeItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index, newQty) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-roast-bg text-roast-textLight font-sans">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activePage === 'menu' && (
          <BakeryMenu
            onAddToCart={handleAddToCart}
            onNavigateCustomCake={() => setActivePage('cakeStudio')}
          />
        )}

        {activePage === 'cakeStudio' && (
          <CustomCakeStudio
            onAddCustomCakeToCart={handleAddCustomCakeToCart}
          />
        )}

        {activePage === 'kitchen' && <KitchenTracker />}

        {activePage === 'addBake' && (
          <AddBakeItem
            onBakeAdded={() => setActivePage('menu')}
          />
        )}

        {activePage === 'analytics' && <BakeryAnalytics />}

        {activePage === 'login' && (
          <LoginRegister onAuthSuccess={() => setActivePage('menu')} />
        )}
      </main>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onOrderPlaced={() => setActivePage('kitchen')}
      />

      {/* Footer */}
      <footer className="border-t border-palette-amber/20 bg-[#0F0703] py-8 text-xs text-[#8C6239]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-palette-gold" />
            <span className="font-bold text-palette-cream">GOLDENCRUST BAKERY</span>
            <span>— Artisan Deck Ovens & Bespoke Cake Studio</span>
          </div>

          <div className="flex items-center gap-4 text-[#B8A490]">
            <span>MERN Stack (MongoDB, Express, React, Node)</span>
            <span>•</span>
            <span>TailwindCSS</span>
            <span>•</span>
            <span className="text-palette-gold font-bold">End-Term Software Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
