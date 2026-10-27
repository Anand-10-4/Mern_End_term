import React from 'react';
import { Award, Compass, Scale, Sparkles, Clock, FileCheck } from 'lucide-react';

export default function LotCard({ lot, onReserve, onSelectLot, onViewCertificate }) {
  if (!lot) return null;

  const origin = lot.origin || {};
  const isPresidential = lot.scaScore >= 90;
  const isExcellent = lot.scaScore >= 85 && lot.scaScore < 90;

  const percentAvailable = lot.roastedWeightKg > 0
    ? Math.round((lot.availableKg / lot.roastedWeightKg) * 100)
    : 0;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden border border-palette-amber/20 hover:border-palette-gold/50 shadow-card-dark">
      {/* Glow on hover */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-palette-gold/10 rounded-full blur-2xl group-hover:bg-palette-gold/25 transition-all pointer-events-none" />

      {/* Header Info */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#291A0E] text-palette-cream font-mono text-[11px] border border-palette-amber/30">
              {lot.lotNumber}
            </span>
            <span className="text-xs text-[#B8A490] font-medium">
              {origin.country}
            </span>
          </div>

          {/* SCA Score Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              isPresidential
                ? 'bg-gradient-to-r from-palette-gold to-palette-amber text-palette-espresso border-palette-cream shadow-glow-gold'
                : isExcellent
                ? 'bg-palette-gold/20 text-palette-gold border-palette-gold/40'
                : 'bg-palette-amber/20 text-palette-cream border-palette-amber/40'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{lot.scaScore?.toFixed(2) || '86.50'}</span>
            <span className="text-[10px] font-normal opacity-80">SCA</span>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelectLot(lot)}
          className="text-lg font-bold font-display text-palette-cream group-hover:text-palette-gold transition-colors mt-2.5 cursor-pointer line-clamp-1"
        >
          {lot.name}
        </h3>

        {/* Origin Spec Subtitle */}
        <div className="flex items-center gap-2 text-xs text-[#B8A490] mt-1 font-mono">
          <span>{origin.region}</span>
          <span>•</span>
          <span>{origin.altitudeMeters}m MASL</span>
          <span>•</span>
          <span className="text-palette-cream">{origin.processMethod}</span>
        </div>

        {/* Flavor Notes */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(lot.flavorNotes || []).slice(0, 4).map((note, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-[#25170B] text-amber-200 text-[11px] font-medium border border-palette-amber/20"
            >
              {note}
            </span>
          ))}
        </div>
      </div>

      {/* Allocation Progress & Pricing */}
      <div className="mt-5 pt-4 border-t border-palette-amber/15 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-[#B8A490] flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-palette-gold" />
              <span>Available Inventory</span>
            </span>
            <span className="text-palette-cream font-bold">
              {lot.availableKg} / {lot.roastedWeightKg} kg
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#120A05] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-palette-amber to-palette-gold rounded-full transition-all duration-500"
              style={{ width: `${percentAvailable}%` }}
            />
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[10px] text-[#B8A490] uppercase font-mono">Wholesale Rate</div>
            <div className="text-xl font-bold font-mono text-palette-gold">
              ${lot.pricePerKg?.toFixed(2)}
              <span className="text-xs text-[#B8A490] font-sans font-normal"> / kg</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onViewCertificate(lot)}
              title="View Official Certificate"
              className="p-2 rounded-xl bg-[#291A0E] hover:bg-[#3D2716] text-[#B8A490] hover:text-palette-gold transition-colors border border-palette-amber/20"
            >
              <FileCheck className="w-4 h-4" />
            </button>

            <button
              onClick={() => onReserve(lot)}
              disabled={lot.availableKg <= 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95 transition-all disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lot.availableKg > 0 ? 'Reserve Lot' : 'Sold Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
