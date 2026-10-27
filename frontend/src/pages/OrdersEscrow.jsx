import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CertificateModal from '../components/CertificateModal';
import confetti from 'canvas-confetti';
import {
  FileCheck2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

export default function OrdersEscrow() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleAdvanceStatus = async (orderId, nextStatus, actionNote) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus, actionNote);
      addToast(`Order transitioned to ${nextStatus.replace('_', ' ').toUpperCase()}`, 'success');

      if (nextStatus === 'escrow_released') {
        confetti({
          particleCount: 100,
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

  const statusPipeline = [
    { key: 'escrow_held', label: 'Escrow Held' },
    { key: 'roasting_scheduled', label: 'Roast Scheduled' },
    { key: 'cupping_verified', label: 'Sensory Audited' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'escrow_released', label: 'Escrow Released' },
  ];

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.escrowStatus === filterStatus);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 text-palette-gold text-xs font-mono uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Sig Smart Escrow Ledger</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-palette-cream">
            Wholesale Escrow Contracts
          </h1>
          <p className="text-xs text-[#B8A490] font-mono mt-1">
            Milestone settlement pipeline: funds locked until batch quality verification & physical delivery
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#281A0E] hover:bg-[#382312] text-xs font-mono text-palette-gold border border-palette-amber/30 transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Ledger</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            filterStatus === 'all'
              ? 'bg-palette-gold text-palette-espresso font-bold'
              : 'bg-[#1D1208] text-[#B8A490] hover:text-white'
          }`}
        >
          All Contracts ({orders.length})
        </button>
        {statusPipeline.map((st) => (
          <button
            key={st.key}
            onClick={() => setFilterStatus(st.key)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              filterStatus === st.key
                ? 'bg-palette-gold text-palette-espresso font-bold'
                : 'bg-[#1D1208] text-[#B8A490] hover:text-white'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-palette-gold animate-spin" />
          <p className="text-xs font-mono text-[#B8A490]">Verifying ledger milestones...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-palette-amber/20 space-y-4">
          <FileCheck2 className="w-12 h-12 text-palette-amber mx-auto opacity-60" />
          <h3 className="text-lg font-bold font-display text-palette-cream">No Active Contracts in this Stage</h3>
          <p className="text-xs text-[#B8A490] max-w-md mx-auto">
            Browse the Allocation Lots to lock a wholesale contract with milestone escrow settlement.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentIdx = statusPipeline.findIndex((s) => s.key === order.escrowStatus);
            const lot = order.batchLot || {};

            return (
              <div
                key={order._id}
                className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-palette-amber/15">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-[#281A0E] text-palette-gold font-mono font-bold text-xs border border-palette-amber/40">
                      {order.orderNumber}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-palette-cream font-display">
                        {lot.name || 'Specialty Batch Lot'}
                      </h3>
                      <span className="text-xs font-mono text-[#B8A490]">
                        {lot.origin?.country} • {order.quantityKg} kg @ ${order.unitPricePerKg}/kg
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-[#8C6239] block">
                      Escrow Vault Amount
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-palette-gold">
                      ${order.totalAmount?.toFixed(2)}
                    </div>
                    {order.tierDiscountPercent > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ({order.tierDiscountPercent}% Tier Discount Applied)
                      </span>
                    )}
                  </div>
                </div>

                {/* Milestone Progress Bar */}
                <div className="space-y-2">
                  <div className="hidden sm:grid grid-cols-6 gap-2 text-center">
                    {statusPipeline.map((st, idx) => {
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={st.key} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              isComplete ? 'bg-palette-gold' : 'bg-[#281A0E]'
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
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="sm:hidden flex items-center justify-between text-xs font-mono text-palette-gold">
                    <span>Status: {order.escrowStatus.replace('_', ' ').toUpperCase()}</span>
                    <span>Step {currentIdx + 1} of 6</span>
                  </div>
                </div>

                {/* Contract Meta & Parties */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#140A04] text-xs font-mono border border-palette-amber/15">
                  <div>
                    <span className="text-[#8C6239] block text-[10px] uppercase">Buyer Cafe</span>
                    <span className="text-palette-cream font-semibold">
                      {order.buyer?.name} ({order.buyer?.company})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C6239] block text-[10px] uppercase">Artisan Roaster</span>
                    <span className="text-palette-cream font-semibold">
                      {order.roaster?.name} ({order.roaster?.company})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C6239] block text-[10px] uppercase">DHL Express Tracking</span>
                    <span className="text-palette-gold font-semibold">{order.trackingNumber}</span>
                  </div>
                </div>

                {/* Action Triggers depending on role & stage */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setSelectedCert(order)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#281A0E] hover:bg-[#382312] text-xs font-semibold text-palette-cream border border-palette-amber/30 transition-colors"
                  >
                    <FileCheck className="w-4 h-4 text-palette-gold" />
                    <span>View Cryptographic Certificate</span>
                  </button>

                  {/* Contextual Action Button to Progress Pipeline */}
                  <div className="flex items-center gap-2">
                    {order.escrowStatus === 'escrow_held' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'roasting_scheduled',
                            'Drum roaster calibrated for Nordic light profile'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95"
                      >
                        Roaster: Confirm Roast Schedule
                      </button>
                    )}

                    {order.escrowStatus === 'roasting_scheduled' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'cupping_verified',
                            'Sensory cupping passed with verified specialty score'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95"
                      >
                        Q-Grader: Verify Cupping & Seal Batch
                      </button>
                    )}

                    {order.escrowStatus === 'cupping_verified' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'dispatched',
                            'Vacuum nitrogen packaged and dispatched via DHL Air'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95"
                      >
                        Roaster: Dispatch Shipment
                      </button>
                    )}

                    {order.escrowStatus === 'dispatched' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'delivered',
                            'Wholesale lot delivered at cafe roastery intake'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95"
                      >
                        Courier: Confirm Physical Delivery
                      </button>
                    )}

                    {order.escrowStatus === 'delivered' && (
                      <button
                        onClick={() =>
                          handleAdvanceStatus(
                            order._id,
                            'escrow_released',
                            'Buyer inspected package and approved payout release'
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-palette-gold text-black font-extrabold text-xs shadow-glow-gold hover:opacity-95"
                      >
                        Buyer: Release Escrow Funds (${order.totalAmount?.toFixed(2)})
                      </button>
                    )}

                    {order.escrowStatus === 'escrow_released' && (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Contract Settled & Payout Released</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
}
