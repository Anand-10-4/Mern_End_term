import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Flame,
  Coffee,
  Scale,
  ShieldCheck,
  PlusCircle,
  FileCheck2,
  BarChart3,
  LogOut,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, switchDemoUser } = useAuth();
  const { addToast } = useToast();

  const handleRoleSwitch = async (role) => {
    try {
      await switchDemoUser(role);
      addToast(`Switched active session to ${role.toUpperCase()} role`, 'success');
    } catch (err) {
      addToast(`Failed to switch role: ${err.message}`, 'error');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Executive Lab', icon: BarChart3 },
    { id: 'marketplace', label: 'Allocation Lots', icon: Coffee },
    { id: 'cupping', label: 'SCA Cupping Lab', icon: Scale },
    { id: 'orders', label: 'Escrow Ledger', icon: FileCheck2 },
    { id: 'analytics', label: 'Roast Telemetry', icon: Sparkles },
  ];

  if (user && (user.role === 'roaster' || user.role === 'admin')) {
    navItems.splice(3, 0, { id: 'createLot', label: 'Register Micro-Lot', icon: PlusCircle });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#140A04]/90 backdrop-blur-md border-b border-palette-amber/20">
      {/* Top Banner: Quick Demo Role Selector */}
      <div className="bg-[#1E1107] border-b border-[#3D2716]/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-palette-cream font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-palette-gold" />
          <span>Interactive Evaluation Mode: Quick Switch Persona</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleRoleSwitch('buyer')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold ${
              user?.role === 'buyer'
                ? 'bg-palette-gold text-palette-espresso ring-1 ring-palette-cream font-bold'
                : 'bg-[#291A0E] text-amber-200 hover:bg-[#382312]'
            }`}
          >
            Buyer (Julian - Gold)
          </button>
          <button
            onClick={() => handleRoleSwitch('roaster')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold ${
              user?.role === 'roaster'
                ? 'bg-palette-gold text-palette-espresso ring-1 ring-palette-cream font-bold'
                : 'bg-[#291A0E] text-amber-200 hover:bg-[#382312]'
            }`}
          >
            Roaster (Marcus - Kaffa)
          </button>
          <button
            onClick={() => handleRoleSwitch('qgrader')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold ${
              user?.role === 'qgrader'
                ? 'bg-palette-gold text-palette-espresso ring-1 ring-palette-cream font-bold'
                : 'bg-[#291A0E] text-amber-200 hover:bg-[#382312]'
            }`}
          >
            Q-Grader (Dr. Aaron, CQI)
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2.5 py-0.5 rounded-full transition-all text-xs font-semibold ${
              user?.role === 'admin'
                ? 'bg-palette-gold text-palette-espresso ring-1 ring-palette-cream font-bold'
                : 'bg-[#291A0E] text-amber-200 hover:bg-[#382312]'
            }`}
          >
            Admin (Director)
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-palette-gold via-palette-amber to-palette-espresso p-0.5 shadow-glow-gold group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#1A0F07] rounded-[10px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-palette-gold animate-pulse" />
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-lg tracking-wider text-palette-cream group-hover:text-palette-gold transition-colors">
              AMBER<span className="text-palette-gold">ROAST</span> <span className="text-xs tracking-normal font-sans px-1.5 py-0.5 rounded bg-palette-amber/20 border border-palette-amber/40 text-palette-gold ml-1">OS</span>
            </div>
            <div className="text-[10px] tracking-widest text-[#B8A490] font-mono uppercase">
              Specialty Allocation Protocol
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
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

        {/* User Status / Action */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="text-xs font-bold text-palette-cream flex items-center gap-1.5">
                  <span>{user.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-palette-gold/20 text-palette-gold border border-palette-gold/30 uppercase font-mono">
                    {user.role}
                  </span>
                </div>
                <div className="text-[11px] text-palette-cream/70 font-mono">
                  Tier: <span className="text-palette-gold font-medium">{user.tier}</span>
                  {user.role === 'buyer' && (
                    <span className="ml-1 text-stone-400">
                      ({user.usedQuotaKg}/{user.allocationQuotaKg} kg)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg bg-[#281A0E] hover:bg-[#3D2716] text-[#C5B39F] hover:text-white transition-colors border border-palette-amber/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-palette-gold to-palette-amber text-palette-espresso font-bold text-sm shadow-glow-gold hover:opacity-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Enter Lab</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
