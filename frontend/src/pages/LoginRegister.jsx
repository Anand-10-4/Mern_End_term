import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export default function LoginRegister({ onAuthSuccess }) {
  const { login, register, switchDemoUser } = useAuth();
  const { addToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ name, email, password, phone, role: 'customer' });
        addToast('Welcome to GoldenCrust Bakery! 50 Loyalty points credited.', 'success');
      } else {
        await login(email, password);
        addToast('Signed in successfully!', 'success');
      }
      onAuthSuccess && onAuthSuccess();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleKey) => {
    try {
      await switchDemoUser(roleKey);
      addToast(`Logged in as ${roleKey.toUpperCase()}`, 'success');
      onAuthSuccess && onAuthSuccess();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-palette-gold via-palette-amber to-palette-espresso p-0.5 shadow-glow-gold mx-auto">
          <div className="w-full h-full bg-[#1C0F06] rounded-[14px] flex items-center justify-center text-2xl">
            🥖
          </div>
        </div>
        <h2 className="text-2xl font-bold font-display text-palette-cream">
          {isRegister ? 'Create Your Bakery Account' : 'Welcome to GoldenCrust'}
        </h2>
        <p className="text-xs text-[#B8A490] font-mono">
          Order warm artisan bakes, earn loyalty rewards, and design bespoke cakes
        </p>
      </div>

      {/* Quick 1-Click Persona Logins */}
      <div className="p-4 rounded-2xl bg-[#1C0F06] border border-palette-gold/30 space-y-2 text-xs">
        <span className="text-[10px] font-mono uppercase tracking-wider text-palette-gold block font-bold">
          ⚡ 1-Click Evaluation Personas:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('customer')}
            className="p-2 rounded-xl bg-[#2A160A] hover:bg-[#3D210F] text-palette-cream text-left border border-palette-amber/20"
          >
            <div className="font-bold text-palette-gold">Customer</div>
            <div className="text-[10px] text-[#8C6239] truncate">Alice Miller</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('baker')}
            className="p-2 rounded-xl bg-[#2A160A] hover:bg-[#3D210F] text-palette-cream text-left border border-palette-amber/20"
          >
            <div className="font-bold text-palette-gold">Chef Baker</div>
            <div className="text-[10px] text-[#8C6239] truncate">Pierre Dubois</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="p-2 rounded-xl bg-[#2A160A] hover:bg-[#3D210F] text-palette-cream text-left border border-palette-amber/20"
          >
            <div className="font-bold text-palette-gold">Manager</div>
            <div className="text-[10px] text-[#8C6239] truncate">Anand Mohan</div>
          </button>
        </div>
      </div>

      {/* Auth Form */}
      <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-mono text-[#B8A490] block mb-1">Full Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#B8A490] block mb-1">Mobile Phone:</label>
                <input
                  type="text"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Email Address:</label>
            <input
              type="email"
              placeholder="e.g. customer@goldencrust.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Password:</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-extrabold text-xs shadow-glow-gold hover:opacity-95 transition-all mt-2"
          >
            {submitting ? 'Authenticating...' : isRegister ? 'Register & Claim 50 Pts' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 mt-4 border-t border-palette-amber/15 text-center text-xs">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#B8A490] hover:text-palette-gold transition-colors font-mono"
          >
            {isRegister
              ? 'Already registered? Sign in here'
              : 'New guest? Create an account for 50 bonus loyalty points'}
          </button>
        </div>
      </div>
    </div>
  );
}
