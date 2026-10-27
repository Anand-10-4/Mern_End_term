import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Globe2,
  Layers,
  Activity,
  Award,
  RefreshCw,
  Scale,
} from 'lucide-react';

export default function Analytics() {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <RefreshCw className="w-8 h-8 text-palette-gold animate-spin" />
        <p className="text-xs font-mono text-[#B8A490]">Synthesizing telemetry data...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const originDist = data?.originDistribution || [];
  const processDist = data?.processDistribution || [];
  const recentLogs = data?.recentActivity || [];

  const maxOriginCount = Math.max(...originDist.map((o) => o.count), 1);
  const maxProcessCount = Math.max(...processDist.map((p) => p.count), 1);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 text-palette-gold text-xs font-mono uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Platform Telemetry & Roast Yield Analytics</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-palette-cream">
            Sensory & Roastery Operations
          </h1>
          <p className="text-xs text-[#B8A490] font-mono mt-1">
            Real-time harvest origin distribution, roast shrinkage curves, and verifiable audit records
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#281A0E] hover:bg-[#382312] text-xs font-mono text-palette-gold border border-palette-amber/30 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <span className="text-xs font-mono text-[#B8A490]">Total Lots Registered</span>
          <div className="text-3xl font-extrabold font-mono text-palette-gold">{summary.totalLots}</div>
          <span className="text-[11px] text-emerald-400 font-medium">100% Q-Grader Audited</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <span className="text-xs font-mono text-[#B8A490]">Available Allocation</span>
          <div className="text-3xl font-extrabold font-mono text-palette-cream">
            {summary.totalAvailableKg}
            <span className="text-xs text-[#B8A490] font-normal ml-1">kg</span>
          </div>
          <span className="text-[11px] text-[#B8A490]">Active wholesale stock</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <span className="text-xs font-mono text-[#B8A490]">Avg Specialty Score</span>
          <div className="text-3xl font-extrabold font-mono text-palette-gold">
            {summary.avgScaScore}
          </div>
          <span className="text-[11px] text-palette-cream font-medium">Presidential & Specialty Tier</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <span className="text-xs font-mono text-[#B8A490]">Roast Shrinkage Ratio</span>
          <div className="text-3xl font-extrabold font-mono text-palette-cream">
            {summary.roastShrinkagePct}%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Optimal caramelization</span>
        </div>
      </div>

      {/* Visual Distribution Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
          <h3 className="text-base font-bold font-display text-palette-cream flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-palette-gold" />
            <span>Terroir Origin Distribution</span>
          </h3>

          <div className="space-y-3 pt-2">
            {originDist.map((item) => {
              const widthPct = Math.round((item.count / maxOriginCount) * 100);
              return (
                <div key={item._id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-palette-cream font-semibold">{item._id}</span>
                    <span className="text-palette-gold font-bold">
                      {item.count} lots ({item.totalKg} kg)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#120A05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-palette-amber to-palette-gold rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Processing Method Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
          <h3 className="text-base font-bold font-display text-palette-cream flex items-center gap-2">
            <Layers className="w-5 h-5 text-palette-gold" />
            <span>Processing Method Breakdown</span>
          </h3>

          <div className="space-y-3 pt-2">
            {processDist.map((item) => {
              const widthPct = Math.round((item.count / maxProcessCount) * 100);
              return (
                <div key={item._id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-palette-cream font-semibold">{item._id}</span>
                    <span className="text-palette-gold font-bold">{item.count} lots</span>
                  </div>
                  <div className="w-full h-2 bg-[#120A05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-palette-gold to-palette-amber rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
        <h3 className="text-base font-bold font-display text-palette-cream flex items-center gap-2">
          <Activity className="w-5 h-5 text-palette-gold" />
          <span>System Operation Audit Log</span>
        </h3>

        <div className="divide-y divide-palette-amber/10">
          {recentLogs.map((log) => (
            <div key={log._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-palette-gold flex-shrink-0" />
                <span className="font-mono font-bold text-palette-gold">{log.action}</span>
                <span className="text-palette-cream">
                  {log.user ? `${log.user.name} (${log.user.role})` : 'System Core'}
                </span>
                <span className="text-[#8C6239] font-mono text-[11px]">[{log.entityType}]</span>
              </div>
              <div className="text-right text-[#8C6239] font-mono text-[11px]">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
