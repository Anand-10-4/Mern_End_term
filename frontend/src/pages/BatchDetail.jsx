import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CuppingRadar from '../components/CuppingRadar';
import ReservationModal from '../components/ReservationModal';
import CertificateModal from '../components/CertificateModal';
import {
  ArrowLeft,
  Award,
  Scale,
  Compass,
  MapPin,
  Clock,
  Sparkles,
  FileCheck,
  ShieldCheck,
  Flame,
  Droplets,
  Zap,
} from 'lucide-react';

export default function BatchDetail({ batchId, onBack }) {
  const [lot, setLot] = useState(null);
  const [cuppingHistory, setCuppingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    const fetchLotDetail = async () => {
      try {
        const [lotRes, cuppingsRes] = await Promise.all([
          api.getBatchById(batchId),
          api.getLotCuppingHistory(batchId),
        ]);
        setLot(lotRes.batch);
        setCuppingHistory(cuppingsRes.sessions || []);
      } catch (err) {
        console.error('Error fetching lot details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (batchId) {
      fetchLotDetail();
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-2 border-palette-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#B8A490]">Loading lot terroir profile...</p>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-palette-cream">Batch lot not found</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isPresidential = lot.scaScore >= 90;
  const percentAvailable = lot.roastedWeightKg > 0
    ? Math.round((lot.availableKg / lot.roastedWeightKg) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#B8A490] hover:text-palette-gold transition-colors font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Allocation Lots</span>
      </button>

      {/* Hero Banner Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-palette-amber/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-palette-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-palette-amber/20 text-palette-cream font-mono text-xs border border-palette-amber/40">
                {lot.lotNumber}
              </span>
              <span className="text-xs font-mono text-palette-gold uppercase tracking-wider">
                {lot.origin?.country} • {lot.origin?.region}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-palette-cream">
              {lot.name}
            </h1>

            <p className="text-xs text-[#B8A490] max-w-xl font-mono">
              Farm: <span className="text-palette-cream">{lot.origin?.estate}</span> | Elevation:{' '}
              <span className="text-palette-cream">{lot.origin?.altitudeMeters}m MASL</span> | Varietal:{' '}
              <span className="text-palette-cream">{lot.origin?.varietal}</span>
            </p>
          </div>

          {/* Right Hero: SCA Score Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#140A04]/80 border border-palette-amber/40 min-w-[200px]">
            <span className="text-[10px] font-mono uppercase text-[#B8A490]">Official SCA Score</span>
            <div className="text-4xl font-extrabold font-mono text-palette-gold flex items-center gap-1 mt-0.5">
              <span>{lot.scaScore?.toFixed(2)}</span>
              <span className="text-sm font-sans text-stone-500 font-normal">/100</span>
            </div>
            <span className={`text-[11px] font-bold mt-1 uppercase ${isPresidential ? 'text-palette-gold' : 'text-palette-cream'}`}>
              {lot.scaClassification}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Terroir Details + Cupping Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Terroir & Chemistry (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Terroir & Origin Story */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-3">
            <h3 className="text-lg font-bold font-display text-palette-cream flex items-center gap-2">
              <MapPin className="w-5 h-5 text-palette-gold" />
              <span>Terroir & Cultivation Profile</span>
            </h3>
            <p className="text-sm text-[#D4BEA2] leading-relaxed">
              {lot.story}
            </p>

            {/* Micro-climate chemistry grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3 rounded-xl bg-[#140A04] border border-palette-amber/20 text-xs">
                <span className="text-[#8C6239] block font-mono text-[10px] uppercase">Process</span>
                <span className="font-bold text-palette-cream">{lot.origin?.processMethod}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#140A04] border border-palette-amber/20 text-xs">
                <span className="text-[#8C6239] block font-mono text-[10px] uppercase">Roast Profile</span>
                <span className="font-bold text-palette-gold">{lot.roastProfile}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#140A04] border border-palette-amber/20 text-xs">
                <span className="text-[#8C6239] block font-mono text-[10px] uppercase">Moisture Content</span>
                <span className="font-bold text-palette-cream">{lot.moistureContentPercent}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#140A04] border border-palette-amber/20 text-xs">
                <span className="text-[#8C6239] block font-mono text-[10px] uppercase">Bean Density</span>
                <span className="font-bold text-palette-cream">{lot.densityGramsPerLiter} g/L</span>
              </div>
            </div>
          </div>

          {/* Flavor Notes Tag Cloud */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-3">
            <h3 className="text-lg font-bold font-display text-palette-cream flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-palette-gold" />
              <span>Sensory Tasting Notes & Aromatics</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {(lot.flavorNotes || []).map((note, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-[#28180C] border border-palette-amber/30 text-amber-200 text-xs font-semibold"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>

          {/* Cupping History Log */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
            <h3 className="text-lg font-bold font-display text-palette-cream flex items-center gap-2">
              <Award className="w-5 h-5 text-palette-gold" />
              <span>Q-Grader Cupping Audits ({cuppingHistory.length})</span>
            </h3>

            {cuppingHistory.length === 0 ? (
              <p className="text-xs text-[#8C6239] font-mono">No external cupping audits logged yet.</p>
            ) : (
              <div className="space-y-3">
                {cuppingHistory.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 rounded-xl bg-[#140A04] border border-palette-amber/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-palette-cream text-sm">
                        {session.sessionTitle}
                      </div>
                      <div className="text-[#B8A490] font-mono mt-0.5">
                        Evaluator: {session.evaluator?.name} ({session.evaluator?.company || 'Specialty Lab'})
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-base font-extrabold font-mono text-palette-gold">
                          {session.totalScore}
                        </span>
                        <span className="text-[10px] text-[#B8A490] block">SCA Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Radar Chart & Reservation Lock Box (1 col) */}
        <div className="space-y-6">
          {/* SCA 10-Attribute Radar Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 text-center space-y-2">
            <span className="text-xs font-mono uppercase text-palette-gold tracking-wider">
              Sensory Radar Wheel
            </span>
            <h4 className="font-display font-bold text-palette-cream">10-Attribute SCA Breakdown</h4>
            <CuppingRadar scores={lot.cuppingScores || {}} size={240} />
          </div>

          {/* Allocation Action Box */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-gold/40 space-y-4 relative overflow-hidden shadow-glow-gold">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#B8A490]">Wholesale Rate</span>
                <div className="text-3xl font-extrabold font-mono text-palette-gold">
                  ${lot.pricePerKg?.toFixed(2)}
                  <span className="text-xs text-[#B8A490] font-sans font-normal"> / kg</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#B8A490]">Remaining</span>
                <div className="text-xl font-bold font-mono text-palette-cream">
                  {lot.availableKg} kg
                </div>
              </div>
            </div>

            {/* Inventory Bar */}
            <div className="w-full h-2 bg-[#140A04] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-palette-amber to-palette-gold rounded-full"
                style={{ width: `${percentAvailable}%` }}
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowReserveModal(true)}
                disabled={lot.availableKg <= 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95 transition-all disabled:opacity-40"
              >
                {lot.availableKg > 0 ? 'Lock Allocation / Direct Escrow' : 'Lot Sold Out'}
              </button>

              <button
                onClick={() => setShowCertModal(true)}
                className="w-full py-2.5 rounded-xl bg-[#291A0E] hover:bg-[#3D2716] border border-palette-amber/30 text-palette-cream font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FileCheck className="w-4 h-4 text-palette-gold" />
                <span>View Authenticity Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReserveModal && (
        <ReservationModal
          batch={lot}
          onClose={() => setShowReserveModal(false)}
          onSuccess={() => {
            api.getBatchById(batchId).then((res) => setLot(res.batch));
          }}
        />
      )}

      {showCertModal && (
        <CertificateModal
          certificate={lot}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
