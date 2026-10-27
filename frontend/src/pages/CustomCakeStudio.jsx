import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  Cake,
  Sparkles,
  Plus,
  Check,
  Heart,
  Palette,
  ShieldCheck,
} from 'lucide-react';

export default function CustomCakeStudio({ onAddCustomCakeToCart }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [size, setSize] = useState('standard_6inch');
  const [sponge, setSponge] = useState('vanilla_bean');
  const [frosting, setFrosting] = useState('honey_buttercream');
  const [dietary, setDietary] = useState('standard');
  const [customMessage, setCustomMessage] = useState('Happy Birthday!');
  const [decorTheme, setDecorTheme] = useState('Gold Leaf & Caramel Drip');
  const [pricingBreakdown, setPricingBreakdown] = useState(null);

  // Sizes
  const sizeOptions = [
    { key: 'mini_4inch', label: 'Mini Petite (4-inch)', base: '$18', serves: '1-2 people' },
    { key: 'standard_6inch', label: 'Standard Celebration (6-inch)', base: '$34', serves: '6-8 people' },
    { key: 'party_8inch', label: 'Grand Party (8-inch)', base: '$48', serves: '12-16 people' },
    { key: 'celebration_2tier', label: 'Royal Two-Tier (6" + 8")', base: '$85', serves: '25-30 people' },
  ];

  // Sponges
  const spongeOptions = [
    { key: 'vanilla_bean', label: 'Madagascar Vanilla Bean', addon: '+$0' },
    { key: 'belgian_chocolate', label: 'Rich Belgian Dark Chocolate', addon: '+$3' },
    { key: 'red_velvet', label: 'Classic Velvet Crimson', addon: '+$4' },
    { key: 'spiced_carrot', label: 'Spiced Carrot & Walnut', addon: '+$4' },
  ];

  // Frostings
  const frostingOptions = [
    { key: 'honey_buttercream', label: 'Golden Honey Buttercream', addon: '+$0' },
    { key: 'salted_caramel', label: 'Salted Caramel Ganache', addon: '+$3' },
    { key: 'chocolate_fudge', label: 'Whipped Belgian Dark Fudge', addon: '+$4' },
    { key: 'vanilla_chantilly', label: 'Vanilla Bean Chantilly', addon: '+$2' },
  ];

  // Dietary
  const dietaryOptions = [
    { key: 'standard', label: 'Classic Recipe', addon: '+$0' },
    { key: 'eggless', label: '100% Eggless', addon: '+$3' },
    { key: 'gluten_free', label: 'Gluten-Free Flour', addon: '+$5' },
    { key: 'vegan', label: 'Plant-Based Vegan', addon: '+$5' },
  ];

  // Dynamic Price Calculator
  useEffect(() => {
    api.calculateCakePrice({
      size,
      sponge,
      frosting,
      dietary,
      customMessage,
    }).then((res) => {
      setPricingBreakdown(res.breakdown);
    }).catch(console.error);
  }, [size, sponge, frosting, dietary, customMessage]);

  const handleAddToCart = () => {
    const customCakeItem = {
      _id: 'custom_cake_' + Date.now(),
      name: `Custom ${pricingBreakdown?.sizeName || 'Celebration Cake'}`,
      price: pricingBreakdown?.totalPrice || 34,
      quantity: 1,
      imageEmoji: '🎂',
      isCustomCake: true,
      cakeDetails: {
        sizeName: pricingBreakdown?.sizeName,
        spongeName: pricingBreakdown?.spongeName,
        frostingName: pricingBreakdown?.frostingName,
        customMessage,
        dietary,
        decorTheme,
      },
    };

    onAddCustomCakeToCart(customCakeItem);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F9E6A8', '#F2A900', '#CC6F00', '#4D2A00'],
    });
    addToast('Custom cake design added to your bag!', 'success');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 text-palette-gold text-xs font-mono uppercase tracking-wider mb-2">
          <Cake className="w-3.5 h-3.5" />
          <span>Interactive Custom Cake Studio</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-palette-cream">
          Design Your Bespoke Celebration Cake
        </h1>
        <p className="text-xs text-[#B8A490] font-mono mt-1">
          Select tiers, artisan sponge flavors, hand-whipped ganache, and personalized piped messages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Selectors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Size */}
          <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-3">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold flex items-center gap-2">
              <span>1. Choose Cake Size & Portions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSize(opt.key)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    size === opt.key
                      ? 'bg-palette-gold/15 border-palette-gold shadow-sm'
                      : 'bg-[#180C05] border-palette-amber/20 hover:border-palette-amber/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-palette-cream">
                    <span>{opt.label}</span>
                    <span className="font-mono text-palette-gold">{opt.base}</span>
                  </div>
                  <span className="text-[11px] text-[#B8A490] font-mono mt-0.5 block">
                    Serves {opt.serves}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Sponge */}
          <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-3">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold flex items-center gap-2">
              <span>2. Select Artisan Sponge Base</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spongeOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSponge(opt.key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    sponge === opt.key
                      ? 'bg-palette-gold/15 border-palette-gold shadow-sm'
                      : 'bg-[#180C05] border-palette-amber/20 hover:border-palette-amber/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-palette-cream">
                    <span>{opt.label}</span>
                    <span className="font-mono text-palette-gold">{opt.addon}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Frosting */}
          <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-3">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold flex items-center gap-2">
              <span>3. Hand-Whipped Frosting & Filling</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {frostingOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFrosting(opt.key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    frosting === opt.key
                      ? 'bg-palette-gold/15 border-palette-gold shadow-sm'
                      : 'bg-[#180C05] border-palette-amber/20 hover:border-palette-amber/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-palette-cream">
                    <span>{opt.label}</span>
                    <span className="font-mono text-palette-gold">{opt.addon}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Dietary & Decor */}
          <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-3">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold flex items-center gap-2">
              <span>4. Dietary Preferences & Piped Message</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {dietaryOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setDietary(opt.key)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    dietary === opt.key
                      ? 'bg-palette-gold text-palette-espresso font-bold border-palette-gold'
                      : 'bg-[#180C05] border-palette-amber/20 text-[#B8A490]'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-[10px] font-mono">{opt.addon}</div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-mono text-[#B8A490] block mb-1">
                Custom Message Piped on Top (Max 50 chars):
              </label>
              <input
                type="text"
                maxLength={50}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. Happy 25th Anniversary Alex & Jamie!"
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream font-mono focus:outline-none focus:border-palette-gold"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Live Preview Canvas & Dynamic Price Card */}
        <div className="space-y-6">
          {/* Live Visual Cake Studio Card */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-gold/30 text-center space-y-4 sticky top-24 shadow-card-dark">
            <span className="text-xs font-mono uppercase text-palette-gold tracking-wider block">
              Live Cake Preview
            </span>

            {/* Visual Cake Rendering */}
            <div className="w-full h-44 rounded-2xl bg-gradient-to-b from-[#2A160A] to-[#160B05] border border-palette-amber/30 flex flex-col items-center justify-center relative overflow-hidden p-4 shadow-inner">
              <div className="text-5xl animate-bounce">🎂</div>
              <div className="mt-2 text-center">
                <span className="text-xs font-bold text-palette-cream font-display block">
                  {pricingBreakdown?.sizeName || 'Standard Cake'}
                </span>
                <span className="text-[11px] text-palette-gold font-mono italic block mt-0.5">
                  "{customMessage || 'Your Custom Message'}"
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-[#140A04] border border-palette-amber/20 space-y-1.5 text-xs font-mono text-left">
              <div className="flex justify-between text-[#B8A490]">
                <span>Base ({pricingBreakdown?.sizeName}):</span>
                <span className="text-palette-cream">${pricingBreakdown?.basePrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#B8A490]">
                <span>Sponge ({pricingBreakdown?.spongeName}):</span>
                <span className="text-palette-cream">+${pricingBreakdown?.spongeAddon?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#B8A490]">
                <span>Frosting ({pricingBreakdown?.frostingName}):</span>
                <span className="text-palette-cream">+${pricingBreakdown?.frostingAddon?.toFixed(2)}</span>
              </div>
              {pricingBreakdown?.dietaryAddon > 0 && (
                <div className="flex justify-between text-palette-gold">
                  <span>Dietary Option:</span>
                  <span>+${pricingBreakdown?.dietaryAddon?.toFixed(2)}</span>
                </div>
              )}
              {pricingBreakdown?.messageFee > 0 && (
                <div className="flex justify-between text-palette-gold">
                  <span>Extended Piped Message:</span>
                  <span>+${pricingBreakdown?.messageFee?.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-palette-amber/20 flex justify-between items-baseline font-bold">
                <span className="text-palette-cream font-sans text-sm">Total Custom Price:</span>
                <span className="text-2xl text-palette-gold font-mono">
                  ${pricingBreakdown?.totalPrice?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-extrabold text-xs shadow-glow-gold hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add Custom Cake to Bag (${pricingBreakdown?.totalPrice?.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
