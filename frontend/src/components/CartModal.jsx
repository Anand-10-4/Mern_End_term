import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  ShoppingBag,
  Trash2,
  Tag,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export default function CartModal({ isOpen, onClose, cart = [], onUpdateQuantity, onClearCart, onOrderPlaced }) {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [fulfillmentType, setFulfillmentType] = useState('pickup');
  const [scheduledSlot, setScheduledSlot] = useState('Today: 2:00 PM - 3:00 PM (Warm Oven Batch)');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Coupon discount
  let couponDiscount = 0;
  if (appliedCoupon === 'GOLDEN10') {
    couponDiscount = Math.round((subtotal * 0.1) * 100) / 100;
  }

  // Loyalty points discount (10 points = $1 off)
  let loyaltyDiscount = 0;
  if (useLoyaltyPoints && user && user.loyaltyPoints >= 10) {
    const maxDiscount = Math.floor(user.loyaltyPoints / 10);
    loyaltyDiscount = Math.min(maxDiscount, Math.floor(subtotal - couponDiscount));
  }

  const finalTotal = Math.max(0, Math.round((subtotal - couponDiscount - loyaltyDiscount) * 100) / 100);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'GOLDEN10') {
      setAppliedCoupon('GOLDEN10');
      addToast('Promo code GOLDEN10 applied (10% off)!', 'success');
    } else {
      addToast('Invalid coupon code. Try GOLDEN10', 'warning');
    }
  };

  const getPayload = () => ({
    items: cart.map((item) => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      isCustomCake: Boolean(item.isCustomCake),
      cakeDetails: item.cakeDetails,
    })),
    fulfillmentType,
    scheduledSlot,
    couponCode: appliedCoupon,
    useLoyaltyPoints,
  });

  const handleRazorpayCheckout = async () => {
    if (!user) {
      addToast('Please sign in or select Customer persona from the top bar to order', 'warning');
      return;
    }

    if (cart.length === 0) {
      addToast('Your bag is empty!', 'warning');
      return;
    }

    if (!window.Razorpay) {
      addToast('Razorpay SDK is loading, please wait or use standard checkout', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Order on Razorpay via Backend
      const orderRes = await api.createRazorpayOrder({
        amount: finalTotal,
        currency: 'INR',
        notes: {
          customerName: user.name,
          customerEmail: user.email,
          fulfillmentType,
        },
      });

      const options = {
        key: orderRes.keyId || 'rzp_test_TkQfS3DEVkqBxw',
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: 'GoldenCrust Artisan Bakery',
        description: `Order Settlement (${cart.length} items)`,
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081986.png',
        order_id: orderRes.order.id,
        handler: async function (response) {
          try {
            setSubmitting(true);
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: getPayload(),
            });

            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#F9E6A8', '#F2A900', '#CC6F00', '#4D2A00'],
            });

            addToast(verifyRes.message || 'Payment confirmed via Razorpay!', 'success');
            onClearCart && onClearCart();
            refreshUser && refreshUser();
            onOrderPlaced && onOrderPlaced(verifyRes.order);
            onClose();
          } catch (err) {
            addToast(err.message || 'Payment verification failed', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: user.name || 'Golden Customer',
          email: user.email || 'customer@goldencrust.com',
          contact: '9999999999',
        },
        theme: {
          color: '#F2A900',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            addToast('Payment cancelled or closed', 'info');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        addToast(`Payment Failed: ${response.error.description}`, 'error');
        setSubmitting(false);
      });
      razorpay.open();
    } catch (err) {
      addToast(err.message || 'Could not initiate Razorpay payment', 'error');
      setSubmitting(false);
    }
  };

  const handleStandardCheckout = async () => {
    if (!user) {
      addToast('Please sign in or select Customer persona from the top bar to order', 'warning');
      return;
    }

    if (cart.length === 0) {
      addToast('Your bag is empty!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createOrder(getPayload());

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#F9E6A8', '#F2A900', '#CC6F00', '#4D2A00'],
      });

      addToast(res.message, 'success');
      onClearCart && onClearCart();
      refreshUser && refreshUser();
      onOrderPlaced && onOrderPlaced(res.order);
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#1A0E07] border border-palette-gold/30 rounded-2xl p-6 shadow-2xl text-palette-cream overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-palette-amber/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-palette-gold" />
            <h3 className="text-xl font-bold font-display text-palette-cream">Your Bakery Bag</h3>
            <span className="text-xs font-mono text-[#B8A490]">({cart.length} items)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#28160B] text-[#B8A490] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 divide-y divide-palette-amber/10">
          {cart.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <span className="text-4xl">🥖</span>
              <p className="text-sm text-palette-cream font-medium">Your bakery bag is empty</p>
              <p className="text-xs text-[#8C6239]">Explore our fresh daily bakes or design a custom cake!</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-[#28160B] border border-palette-amber/20">
                    {item.imageEmoji || '🥐'}
                  </span>
                  <div>
                    <h4 className="font-bold text-palette-cream text-sm">{item.name}</h4>
                    {item.isCustomCake && item.cakeDetails ? (
                      <p className="text-[11px] text-palette-gold font-mono">
                        {item.cakeDetails.sizeName} • {item.cakeDetails.spongeName}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#B8A490] font-mono">
                        ${item.price.toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#120803] px-2 py-1 rounded-lg border border-palette-amber/30">
                    <button
                      onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                      className="px-1 text-palette-gold hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="px-1 text-palette-gold hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-mono font-bold text-palette-gold w-14 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Controls */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-palette-amber/20 space-y-3.5">
            {/* Fulfillment Options */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                  fulfillmentType === 'pickup'
                    ? 'bg-palette-gold text-palette-espresso border-palette-gold font-bold shadow-sm'
                    : 'bg-[#28160B] border-palette-amber/20 text-[#B8A490]'
                }`}
              >
                In-Store Counter Pickup (Free)
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                  fulfillmentType === 'delivery'
                    ? 'bg-palette-gold text-palette-espresso border-palette-gold font-bold shadow-sm'
                    : 'bg-[#28160B] border-palette-amber/20 text-[#B8A490]'
                }`}
              >
                Artisan Courier Delivery
              </button>
            </div>

            {/* Promo Code & Loyalty Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Promo Code (GOLDEN10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-[#120803] border border-palette-amber/30 rounded-xl px-2.5 py-1.5 text-xs text-palette-cream font-mono uppercase focus:outline-none focus:border-palette-gold"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#28160B] hover:bg-[#3D2311] border border-palette-amber/30 rounded-xl text-palette-gold font-bold text-xs"
                >
                  Apply
                </button>
              </form>

              {user && user.loyaltyPoints >= 10 && (
                <label className="flex items-center gap-2 p-2 rounded-xl bg-[#28160B] border border-palette-amber/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLoyaltyPoints}
                    onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                    className="accent-palette-gold"
                  />
                  <span className="text-[11px] text-palette-cream">
                    Redeem {Math.floor(user.loyaltyPoints / 10) * 10} pts (-${Math.floor(user.loyaltyPoints / 10)})
                  </span>
                </label>
              )}
            </div>

            {/* Price Calculations */}
            <div className="p-3 rounded-xl bg-[#120803] border border-palette-amber/20 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#B8A490]">
                <span>Subtotal:</span>
                <span className="text-palette-cream">${subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-palette-gold">
                  <span>Coupon GOLDEN10 (10%):</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-palette-gold">
                  <span>Loyalty Points Discount:</span>
                  <span>-${loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-palette-amber/15 flex justify-between items-baseline text-sm font-bold">
                <span className="text-palette-cream font-sans">Total Settlement:</span>
                <span className="text-xl text-palette-gold font-mono">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Razorpay Badge */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#28160B] border border-palette-amber/20 text-[11px] text-[#B8A490]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-palette-gold" />
                <span>Secured by <strong>Razorpay Payment Gateway</strong></span>
              </div>
              <span className="font-mono text-[10px] text-palette-gold bg-[#120803] px-2 py-0.5 rounded border border-palette-amber/30">
                rzp_test_TkQfS3DEVkqBxw
              </span>
            </div>

            {/* Place Order CTA Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleRazorpayCheckout}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2B84EA] via-[#1A68D5] to-[#0C4EAC] text-white font-extrabold text-sm shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {submitting ? 'Connecting Razorpay...' : `Pay with Razorpay • $${finalTotal.toFixed(2)}`}
                </span>
              </button>

              <button
                onClick={handleStandardCheckout}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-[#28160B] hover:bg-[#382011] border border-palette-amber/30 text-palette-gold font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pay on Counter / Cash on Delivery</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
