import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  Clock,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function ReservationModal({ batch, onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [amountKg, setAmountKg] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState('direct_escrow'); // 'direct_escrow' or 'reservation_lock'

  if (!batch) return null;

  const unitPrice = batch.pricePerKg || 40;
  const subtotal = amountKg * unitPrice;

  // Calculate discount based on user tier
  let discountPercent = 0;
  if (user?.tier === 'Gold Reserve') discountPercent = 10;
  else if (user?.tier === 'Silver') discountPercent = 5;

  const discountAmount = (subtotal * (discountPercent / 100));
  const finalTotal = subtotal - discountAmount;

  const maxOrderable = Math.min(
    batch.availableKg,
    user ? user.allocationQuotaKg - user.usedQuotaKg : 500
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login as a Buyer to reserve or purchase allocations', 'warning');
      return;
    }

    if (amountKg < 5) {
      addToast('Minimum wholesale allocation size is 5 kg', 'warning');
      return;
    }

    if (amountKg > batch.availableKg) {
      addToast(`Only ${batch.availableKg} kg remaining in this lot`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'reservation_lock') {
        // Workflow: Lock 15-minute reservation
        const res = await api.reserveBatch(batch._id, amountKg);
        addToast(res.message, 'success');
        refreshUser();
        onSuccess && onSuccess();
        onClose();
      } else {
        // Workflow: Direct Escrow Purchase Contract
        const res = await api.createOrder({
          batchId: batch._id,
          quantityKg: amountKg,
          shippingAddress: {
            street: '742 Evergreen Specialty Lane',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'USA',
          },
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F9E6A8', '#F2A900', '#CC6F00', '#4D2A00'],
        });

        addToast(`Escrow contract ${res.order.orderNumber} successfully locked!`, 'success');
        refreshUser();
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#1A1007] border border-palette-gold/30 rounded-2xl p-6 shadow-2xl text-palette-cream overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-palette-gold/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-palette-amber/20">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-palette-gold">
              Lot Allocation Protocol • {batch.lotNumber}
            </span>
            <h3 className="text-xl font-bold font-display text-palette-cream mt-0.5">
              {batch.name}
            </h3>
            <p className="text-xs text-[#B8A490] mt-0.5">
              {batch.origin?.country} • {batch.origin?.region} • {batch.origin?.altitudeMeters}m
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#291A0E] text-[#B8A490] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Action Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#120A05] rounded-xl border border-palette-amber/20">
            <button
              type="button"
              onClick={() => setMode('direct_escrow')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                mode === 'direct_escrow'
                  ? 'bg-palette-gold text-palette-espresso shadow-md font-bold'
                  : 'text-[#B8A490] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Escrow Contract</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('reservation_lock')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                mode === 'reservation_lock'
                  ? 'bg-palette-gold text-palette-espresso shadow-md font-bold'
                  : 'text-[#B8A490] hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>15-Min Reservation Lock</span>
            </button>
          </div>

          {/* Allocation Quantity Slider & Input */}
          <div className="p-4 rounded-xl bg-[#241708] border border-palette-amber/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-palette-cream flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-palette-gold" />
                <span>Allocation Weight (kg)</span>
              </label>
              <span className="text-xs font-mono text-palette-cream/70">
                Available: <strong className="text-palette-gold">{batch.availableKg} kg</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max={Math.max(5, maxOrderable)}
                step="5"
                value={amountKg}
                onChange={(e) => setAmountKg(Number(e.target.value))}
                className="w-full h-2 bg-[#140A04] rounded-lg cursor-pointer accent-palette-gold"
              />
              <div className="flex items-center gap-1 bg-[#140A04] px-3 py-1.5 rounded-lg border border-palette-amber/40 min-w-[80px] justify-center">
                <span className="font-mono font-bold text-base text-palette-gold">{amountKg}</span>
                <span className="text-xs text-[#B8A490]">kg</span>
              </div>
            </div>

            {user && (
              <div className="text-[11px] font-mono text-[#B8A490] flex justify-between">
                <span>Buyer Quota Remaining:</span>
                <span className="text-palette-cream font-semibold">
                  {user.allocationQuotaKg - user.usedQuotaKg} kg
                </span>
              </div>
            )}
          </div>

          {/* Real-time Pricing Summary */}
          <div className="p-4 rounded-xl bg-[#140A04] border border-palette-amber/20 space-y-2 text-xs">
            <div className="flex justify-between text-[#B8A490]">
              <span>Base Rate per kg:</span>
              <span className="font-mono text-palette-cream">${unitPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#B8A490]">
              <span>Subtotal ({amountKg} kg):</span>
              <span className="font-mono text-palette-cream">${subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-palette-gold">
                <span>{user?.tier} Discount ({discountPercent}%):</span>
                <span className="font-mono">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-palette-amber/20 flex justify-between items-baseline">
              <span className="font-bold text-sm text-palette-cream">Total Settlement:</span>
              <span className="font-mono text-lg font-bold text-palette-gold">
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notice info */}
          {mode === 'reservation_lock' ? (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-palette-amber/10 border border-palette-amber/30 text-xs text-amber-200">
              <Clock className="w-4 h-4 text-palette-gold flex-shrink-0 mt-0.5" />
              <p>
                <strong>15-Minute Lock:</strong> This allocation will be temporarily reserved in your cart. If order is not confirmed within 15 minutes, the inventory automatically returns to the open market.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Escrow Security:</strong> Funds are locked in smart escrow. Payout is released to the roaster only after cupping check and shipment verification.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#281A0E] hover:bg-[#382312] text-xs font-semibold text-[#B8A490] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || amountKg > batch.availableKg}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span>Processing Contract...</span>
              ) : mode === 'reservation_lock' ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Lock 15-Min Reservation</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Escrow Order (${finalTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
