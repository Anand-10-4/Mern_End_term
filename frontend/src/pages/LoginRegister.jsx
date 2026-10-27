import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Flame, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginRegister({ onAuthSuccess }) {
  const { login, register, switchDemoUser } = useAuth();
  const { addToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('buyer');
  const [company, setCompany] = useState('');
  const [tier, setTier] = useState('Gold Reserve');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ name, email, password, role, company, tier });
        addToast('Account created successfully! Welcome to AmberRoast OS.', 'success');
      } else {
        await login(email, password);
        addToast('Signed in successfully.', 'success');
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
          <div className="w-full h-full bg-[#1A0F07] rounded-[14px] flex items-center justify-center">
            <Flame className="w-6 h-6 text-palette-gold" />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-display text-palette-cream">
          {isRegister ? 'Join the AmberRoast Protocol' : 'Enter the Sensory Allocation Lab'}
        </h2>
        <p className="text-xs text-[#B8A490] font-mono">
          {isRegister
            ? 'Register as an Artisan Roaster, Certified Q-Grader, or Specialty Buyer'
            : 'Authenticate to access reserved micro-lots and official cupping scorecards'}
        </p>
      </div>

      {/* Quick 1-Click Evaluation Presets */}
      <div className="p-4 rounded-2xl bg-[#1A1007] border border-palette-gold/30 space-y-2 text-xs">
        <span className="text-[10px] font-mono uppercase tracking-wider text-palette-gold block font-bold">
          ⚡ 1-Click Evaluator Quick Logins:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('buyer')}
            className="p-2 rounded-xl bg-[#291A0E] hover:bg-[#3D2716] text-palette-cream text-left border border-palette-amber/20 transition-all"
          >
            <div className="font-bold text-palette-gold">Wholesale Buyer</div>
            <div className="text-[10px] text-[#8C6239] truncate">Julian Sterling (Gold)</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('roaster')}
            className="p-2 rounded-xl bg-[#291A0E] hover:bg-[#3D2716] text-palette-cream text-left border border-palette-amber/20 transition-all"
          >
            <div className="font-bold text-palette-gold">Artisan Roaster</div>
            <div className="text-[10px] text-[#8C6239] truncate">Marcus Vance (Kaffa)</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('qgrader')}
            className="p-2 rounded-xl bg-[#291A0E] hover:bg-[#3D2716] text-palette-cream text-left border border-palette-amber/20 transition-all"
          >
            <div className="font-bold text-palette-gold">Q-Grader CQI</div>
            <div className="text-[10px] text-[#8C6239] truncate">Dr. Aaron Chen, CQI</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="p-2 rounded-xl bg-[#291A0E] hover:bg-[#3D2716] text-palette-cream text-left border border-palette-amber/20 transition-all"
          >
            <div className="font-bold text-palette-gold">Director Admin</div>
            <div className="text-[10px] text-[#8C6239] truncate">Anand Mohan</div>
          </button>
        </div>
      </div>

      {/* Main Auth Form */}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#B8A490] block mb-1">Protocol Role:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
                  >
                    <option value="buyer">Wholesale Buyer</option>
                    <option value="roaster">Artisan Roaster</option>
                    <option value="qgrader">Certified Q-Grader</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#B8A490] block mb-1">Wholesale Tier:</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
                  >
                    <option value="Standard">Standard (500 kg)</option>
                    <option value="Silver">Silver (1,000 kg)</option>
                    <option value="Gold Reserve">Gold Reserve (2,000 kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#B8A490] block mb-1">Company / Roastery:</label>
                <input
                  type="text"
                  placeholder="e.g. Highland Specialty Coffee Bar"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Email Address:</label>
            <input
              type="email"
              placeholder="e.g. buyer@amberroast.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Security Password:</label>
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Authenticate Session'}</span>
          </button>
        </form>

        <div className="pt-4 mt-4 border-t border-palette-amber/15 text-center text-xs">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#B8A490] hover:text-palette-gold transition-colors font-mono"
          >
            {isRegister
              ? 'Already have an account? Sign in here'
              : 'Need a specialty allocation account? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
}
