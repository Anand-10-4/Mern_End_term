import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag,
  Cake,
  Flame,
  ChefHat,
  BarChart3,
  LogOut,
  UserCheck,
  Sparkles,
  Layers,
  Heart,
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, cartCount = 0, onOpenCart }) {
  const { user, logout, switchDemoUser } = useAuth();
  const { addToast } = useToast();

  const handleRoleSwitch = async (role) => {
    try {
      await switchDemoUser(role);
      addToast(`Switched persona to: ${role.toUpperCase()}`, 'success');
    } catch (err) {
      addToast(`Failed to switch: ${err.message}`, 'error');
    }
  };

  const navItems = [
    { id: 'menu', label: 'Fresh Bakes', icon: ShoppingBag },
    { id: 'cakeStudio', label: 'Custom Cake Studio', icon: Cake },
    { id: 'kitchen', label: 'Kitchen Tracker', icon: ChefHat },
    { id: 'analytics', label: 'Bakery Analytics', icon: BarChart3 },
  ];

  if (user && (user.role === 'baker' || user.role === 'admin')) {
    navItems.splice(2, 0, { id: 'addBake', label: 'Add Bake Item', icon: Flame });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#160B05]/95 backdrop-blur-md border-b border-palette-amber/25">
      {/* 1-Click Evaluation Persona Switcher */}
      <div className="bg-[#1F1007] border-b border-[#3D2513] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-palette-cream font-medium">
          <Sparkles className="w-3.5 h-3.5 text-palette-gold" />
          <span>Interactive Viva/Evaluation Persona Selector:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleRoleSwitch('customer')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold ${
              user?.role === 'customer'
                ? 'bg-palette-gold text-palette-espresso font-bold ring-1 ring-palette-cream'
                : 'bg-[#2E180A] text-amber-200 hover:bg-[#3E210E]'
            }`}
          >
            Customer (Alice • 120 pts)
          </button>
          <button
            onClick={() => handleRoleSwitch('baker')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold ${
              user?.role === 'baker'
                ? 'bg-palette-gold text-palette-espresso font-bold ring-1 ring-palette-cream'
                : 'bg-[#2E180A] text-amber-200 hover:bg-[#3E210E]'
            }`}
          >
            Chef Baker (Pierre)
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold ${
              user?.role === 'admin'
                ? 'bg-palette-gold text-palette-espresso font-bold ring-1 ring-palette-cream'
                : 'bg-[#2E180A] text-amber-200 hover:bg-[#3E210E]'
            }`}
          >
            Manager (Admin)
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActivePage('menu')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-palette-gold via-palette-amber to-palette-espresso p-0.5 shadow-glow-gold group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#1C0F06] rounded-[10px] flex items-center justify-center text-xl">
              🥖
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-lg tracking-wider text-palette-cream group-hover:text-palette-gold transition-colors">
              GOLDEN<span className="text-palette-gold">CRUST</span>
              <span className="text-xs font-sans px-1.5 py-0.5 rounded bg-palette-amber/20 border border-palette-amber/40 text-palette-gold ml-1.5 uppercase font-mono">
                BAKERY
              </span>
            </div>
            <div className="text-[10px] tracking-widest text-[#B8A490] font-mono uppercase">
              Artisan Oven & Custom Cake Studio
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-palette-gold/20 to-palette-amber/10 text-palette-cream border border-palette-gold/40 shadow-sm'
                    : 'text-[#C5B39F] hover:text-palette-cream hover:bg-[#281A0E]/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-palette-gold' : 'text-amber-500/70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Status / Cart Trigger */}
        <div className="flex items-center gap-3">
          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#29170A] hover:bg-[#3D2311] border border-palette-amber/30 text-palette-cream text-xs font-bold transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-palette-gold" />
            <span>Bag</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-palette-gold text-palette-espresso font-mono text-xs font-extrabold animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="text-xs font-bold text-palette-cream flex items-center gap-1.5">
                  <span>{user.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-palette-gold/20 text-palette-gold border border-palette-gold/30 uppercase font-mono">
                    {user.role}
                  </span>
                </div>
                {user.role === 'customer' && (
                  <div className="text-[11px] text-palette-gold font-mono">
                    ✨ {user.loyaltyPoints} Loyalty Points
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-[#29170A] hover:bg-[#3D2311] text-[#C5B39F] hover:text-white transition-colors border border-palette-amber/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-palette-gold to-palette-amber text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
