import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  ChefHat,
  Users,
  Flame,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export default function BakeryAnalytics() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardAnalytics();
      setData(res);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleMorningRestock = async () => {
    try {
      const res = await api.restockMorning();
      addToast(res.message, 'success');
      fetchAnalytics();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="w-8 h-8 text-palette-gold animate-spin" />
        <p className="text-xs font-mono text-[#B8A490]">Gathering kitchen operations telemetry...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const categories = data?.categoryDistribution || [];
  const recentLogs = data?.recentActivity || [];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 text-palette-gold text-xs font-mono uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bakery Telemetry & Kitchen Analytics</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-palette-cream">
            Bakery Operations & Revenue Telemetry
          </h1>
          <p className="text-xs text-[#B8A490] font-mono mt-1">
            Real-time daily sell-through rate, kitchen queue load, and inventory status
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user && (user.role === 'baker' || user.role === 'admin') && (
            <button
              onClick={handleMorningRestock}
              className="px-3.5 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs shadow-sm hover:opacity-95 transition-all"
            >
              Morning Reset & Restock Ovens 🔥
            </button>
          )}

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl bg-[#28160B] hover:bg-[#3D2311] text-palette-gold border border-palette-amber/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <span className="text-xs font-mono text-[#B8A490]">Total Bakery Revenue</span>
          <div className="text-3xl font-extrabold font-mono text-palette-gold">
            ${summary.totalRevenue?.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Verified Counter & Online Sales</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <span className="text-xs font-mono text-[#B8A490]">Active Kitchen Queue</span>
          <div className="text-3xl font-extrabold font-mono text-palette-cream">
            {summary.activeKitchenQueue}
            <span className="text-xs text-[#B8A490] font-normal ml-1">orders</span>
          </div>
          <span className="text-[11px] text-amber-300 font-medium">Baking & Decorating</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <span className="text-xs font-mono text-[#B8A490]">Daily Batch Sell-Through</span>
          <div className="text-3xl font-extrabold font-mono text-palette-gold">
            {summary.sellThroughRate}%
          </div>
          <span className="text-[11px] text-[#B8A490] font-mono">
            {summary.availableStockTotal} left of {summary.dailyStockTotal}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <span className="text-xs font-mono text-[#B8A490]">Total Completed Orders</span>
          <div className="text-3xl font-extrabold font-mono text-palette-cream">
            {summary.totalOrders}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Avg Order: ${summary.avgOrderValue?.toFixed(2)}</span>
        </div>
      </div>

      {/* Category Breakdown & Audit Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
          <h3 className="text-base font-bold font-display text-palette-cream flex items-center gap-2">
            <Flame className="w-5 h-5 text-palette-gold" />
            <span>Bakery Category Composition</span>
          </h3>

          <div className="space-y-3 pt-2">
            {categories.map((cat) => (
              <div key={cat._id} className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-palette-cream font-semibold uppercase">
                    {cat._id?.replace('_', ' ')}
                  </span>
                  <span className="text-palette-gold font-bold">{cat.count} items</span>
                </div>
                <div className="w-full h-2 bg-[#120803] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-palette-amber to-palette-gold rounded-full"
                    style={{ width: `${Math.min(100, cat.count * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Audit Log */}
        <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
          <h3 className="text-base font-bold font-display text-palette-cream flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-palette-gold" />
            <span>Kitchen & Operational Activity Log</span>
          </h3>

          <div className="divide-y divide-palette-amber/10">
            {recentLogs.map((log) => (
              <div key={log._id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-palette-gold flex-shrink-0" />
                  <span className="font-mono font-bold text-palette-gold">{log.action}</span>
                  <span className="text-palette-cream">
                    by {log.user?.name || 'Kitchen System'} ({log.user?.role || 'staff'})
                  </span>
                </div>
                <span className="text-[#8C6239] font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
