import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LotCard from '../components/LotCard';
import ReservationModal from '../components/ReservationModal';
import CertificateModal from '../components/CertificateModal';
import {
  Flame,
  Award,
  Scale,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Coffee,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function Dashboard({ setActivePage, onSelectLot }) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [featuredLots, setFeaturedLots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLotForReserve, setSelectedLotForReserve] = useState(null);
  const [selectedLotForCert, setSelectedLotForCert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, batchesData] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getBatches('sortBy=scaScore'),
        ]);
        setAnalytics(statsData);
        setFeaturedLots((batchesData.batches || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const summary = analytics?.summary || {
    totalLots: 5,
    totalRoastedKg: 497,
    avgScaScore: 88.6,
    totalEscrowVolume: 8450,
    roastShrinkagePct: 14.1,
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-palette-gold/30 bg-gradient-to-br from-[#24150A] via-[#1A0E06] to-[#120803] shadow-card-dark">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-palette-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-palette-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 border border-palette-gold/30 text-palette-gold text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AmberRoast OS Sensory Allocation Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-palette-cream leading-tight">
            Specialty Batch Allocation & <br />
            <span className="amber-gradient-text">Sensory Cupping Ledger</span>
          </h1>

          <p className="text-sm sm:text-base text-[#D4BEA2] leading-relaxed max-w-2xl">
            A unified operating protocol connecting certified Q-Graders, artisanal micro-roasters, and specialty cafe buyers. Real-time SCA 100-point cupping calibrations, expiring reservation locks, and milestone-backed escrow execution.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActivePage('marketplace')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-sm shadow-glow-gold hover:opacity-95 transition-all"
            >
              <Coffee className="w-4 h-4" />
              <span>Browse Allocation Lots</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setActivePage('cupping')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#291A0E] hover:bg-[#3D2716] border border-palette-amber/30 text-palette-cream font-semibold text-sm transition-all"
            >
              <Scale className="w-4 h-4 text-palette-gold" />
              <span>Launch Cupping Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#B8A490]">
            <span>Average Specialty Score</span>
            <Award className="w-4 h-4 text-palette-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-palette-gold">
            {summary.avgScaScore}
            <span className="text-xs text-[#B8A490] font-sans font-normal ml-1">/ 100 SCA</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            Tier 1 & Presidential Grade Lots
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#B8A490]">
            <span>Total Roasted Inventory</span>
            <Scale className="w-4 h-4 text-palette-amber" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-palette-cream">
            {summary.totalRoastedKg}
            <span className="text-xs text-[#B8A490] font-sans font-normal ml-1">kg</span>
          </div>
          <div className="text-[11px] text-[#B8A490]">
            Active micro-batch registry
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#B8A490]">
            <span>Escrow Settlement Value</span>
            <DollarSign className="w-4 h-4 text-palette-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-palette-gold">
            ${summary.totalEscrowVolume.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            100% Escrow milestone secured
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-palette-amber/20 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#B8A490]">
            <span>Roast Shrinkage Ratio</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-palette-cream">
            {summary.roastShrinkagePct}%
          </div>
          <div className="text-[11px] text-[#B8A490]">
            Optimal specialty caramelization
          </div>
        </div>
      </div>

      {/* Featured Micro-Lots Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-palette-cream">
              Exemplar Allocation Lots
            </h2>
            <p className="text-xs text-[#B8A490] mt-0.5">
              Highest-scoring lots verified through the SCA 10-Attribute protocol
            </p>
          </div>
          <button
            onClick={() => setActivePage('marketplace')}
            className="flex items-center gap-1.5 text-xs font-bold text-palette-gold hover:text-palette-cream transition-colors font-mono"
          >
            <span>View All {analytics?.summary?.totalLots || 5} Lots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredLots.map((lot) => (
            <LotCard
              key={lot._id}
              lot={lot}
              onReserve={(l) => setSelectedLotForReserve(l)}
              onSelectLot={(l) => onSelectLot(l)}
              onViewCertificate={(l) => setSelectedLotForCert(l)}
            />
          ))}
        </div>
      </div>

      {/* Audit & Operational Activity Feed */}
      <div className="glass-panel rounded-2xl p-6 border border-palette-amber/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-palette-gold" />
            <h3 className="text-base font-bold text-palette-cream font-display">
              Protocol Audit Trail & Operational Feed
            </h3>
          </div>
          <span className="text-xs font-mono text-[#B8A490]">
            Real-Time State Transitions
          </span>
        </div>

        <div className="divide-y divide-palette-amber/10">
          {(analytics?.recentActivity || []).map((activity, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-palette-gold flex-shrink-0" />
                <div>
                  <span className="font-mono font-bold text-palette-gold mr-2">
                    {activity.action}
                  </span>
                  <span className="text-palette-cream">
                    by {activity.user?.name || 'System Operator'} ({activity.user?.role || 'System'})
                  </span>
                </div>
              </div>
              <span className="text-[#8C6239] font-mono text-[11px]">
                {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedLotForReserve && (
        <ReservationModal
          batch={selectedLotForReserve}
          onClose={() => setSelectedLotForReserve(null)}
          onSuccess={() => {
            // refresh lots
            api.getBatches('sortBy=scaScore').then((data) => setFeaturedLots((data.batches || []).slice(0, 3)));
          }}
        />
      )}

      {selectedLotForCert && (
        <CertificateModal
          certificate={selectedLotForCert}
          onClose={() => setSelectedLotForCert(null)}
        />
      )}
    </div>
  );
}
