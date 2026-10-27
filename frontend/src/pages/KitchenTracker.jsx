import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  Cake,
  ShoppingBag,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export default function KitchenTracker() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let res;
      // If baker or admin, view all kitchen orders; if customer, view customer orders
      if (user && (user.role === 'baker' || user.role === 'admin')) {
        res = await api.getKitchenOrders(statusFilter === 'all' ? '' : statusFilter);
      } else {
        res = await api.getMyOrders();
      }
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, statusFilter]);

  const handleAdvanceStatus = async (orderId, nextStatus, note) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus, note);
      addToast(`Order updated to ${nextStatus.toUpperCase()}!`, 'success');

      if (nextStatus === 'ready' || nextStatus === 'completed') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F9E6A8', '#F2A900', '#CC6F00', '#4D2A00'],
        });
      }

      fetchOrders();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const pipelineStages = [
    { key: 'placed', label: '1. Order Received', emoji: '📝' },
    { key: 'baking', label: '2. In Deck Oven', emoji: '🔥' },
    { key: 'decorating', label: '3. Glazing & Decor', emoji: '🎨' },
    { key: 'ready', label: '4. Ready for Pickup', emoji: '✨' },
    { key: 'completed', label: '5. Completed', emoji: '🎉' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 text-palette-gold text-xs font-mono uppercase tracking-wider mb-2">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Live Kitchen Order Prep Queue</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-palette-cream">
            Kitchen Preparation & Order Tracker
          </h1>
          <p className="text-xs text-[#B8A490] font-mono mt-1">
            Real-time oven queue state transitions: Received → Deck Oven → Glazing → Pickup Counter
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#28160B] hover:bg-[#3D2311] text-xs font-mono text-palette-gold border border-palette-amber/30 transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            statusFilter === 'all'
              ? 'bg-palette-gold text-palette-espresso font-bold'
              : 'bg-[#25150A] text-[#B8A490] hover:text-white'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {pipelineStages.map((stage) => (
          <button
            key={stage.key}
            onClick={() => setStatusFilter(stage.key)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              statusFilter === stage.key
                ? 'bg-palette-gold text-palette-espresso font-bold'
                : 'bg-[#25150A] text-[#B8A490] hover:text-white'
            }`}
          >
            {stage.emoji} {stage.label}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-palette-gold animate-spin" />
          <p className="text-xs font-mono text-[#B8A490]">Tracking oven status...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-palette-amber/20 space-y-3">
          <ChefHat className="w-12 h-12 text-palette-amber mx-auto opacity-60" />
          <h3 className="text-base font-bold font-display text-palette-cream">No orders in this stage</h3>
          <p className="text-xs text-[#B8A490]">Switch filter or place an order from the bakery menu.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentIdx = pipelineStages.findIndex((s) => s.key === order.status);

            return (
              <div
                key={order._id}
                className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-palette-amber/15">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-[#28160B] text-palette-gold font-mono font-bold text-xs border border-palette-amber/40">
                      {order.orderNumber}
                    </span>
                    <div>
                      <span className="text-xs font-mono text-palette-cream font-bold block">
                        Customer: {order.customer?.name || 'In-Store Guest'}
                      </span>
                      <span className="text-[11px] text-[#B8A490] font-mono">
                        {order.fulfillmentType === 'pickup' ? 'Counter Pickup' : 'Courier Delivery'} •{' '}
                        {order.scheduledSlot}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-[#8C6239] block">Order Total</span>
                    <span className="text-xl font-bold font-mono text-palette-gold">
                      ${order.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Pipeline Progress Visualizer */}
                <div className="space-y-2">
                  <div className="hidden sm:grid grid-cols-5 gap-2 text-center">
                    {pipelineStages.map((stage, idx) => {
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={stage.key} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              isComplete ? 'bg-palette-gold' : 'bg-[#29170A]'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-mono block ${
                              isCurrent
                                ? 'text-palette-gold font-bold uppercase'
                                : isComplete
                                ? 'text-palette-cream'
                                : 'text-stone-600'
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="sm:hidden flex items-center justify-between text-xs font-mono text-palette-gold">
                    <span>Status: {order.status?.toUpperCase()}</span>
                    <span>Step {currentIdx + 1} of 5</span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-3.5 rounded-xl bg-[#140A04] border border-palette-amber/15 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#8C6239] block">Order Contents:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span>{item.imageEmoji || '🥐'}</span>
                        <span className="font-semibold text-palette-cream">
                          {item.quantity}x {item.name}
                        </span>
                        {item.isCustomCake && item.cakeDetails?.customMessage && (
                          <span className="text-[10px] text-palette-gold font-mono italic">
                            ("{item.cakeDetails.customMessage}")
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] font-mono text-[#8C6239]">
                    Ordered: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Advance State Machine buttons for Baker / Admin */}
                  <div className="flex items-center gap-2">
                    {order.status === 'placed' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'baking',
                            'Items loaded into bakery deck oven at 220°C'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95"
                      >
                        Baker: Start Baking in Oven 🔥
                      </button>
                    )}

                    {order.status === 'baking' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'decorating',
                            'Baked fresh, cooling on racks & glazing/packaging'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95"
                      >
                        Baker: Move to Decor & Box 🎨
                      </button>
                    )}

                    {order.status === 'decorating' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'ready',
                            'Boxed with ribbon, ready on shelf for pickup'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95"
                      >
                        Staff: Mark Ready on Shelf ✨
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'completed',
                            'Order handed to customer / delivered'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-sm hover:opacity-95"
                      >
                        Staff: Complete Handover 🎉
                      </button>
                    )}

                    {order.status === 'completed' && (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Fulfilled & Picked Up</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
