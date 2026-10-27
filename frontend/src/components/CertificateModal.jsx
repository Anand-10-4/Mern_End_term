import React from 'react';
import { X, Award, ShieldCheck, CheckCircle2, QrCode, Printer, Sparkles } from 'lucide-react';
import CuppingRadar from './CuppingRadar';

export default function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const lot = certificate.batchLot || certificate;
  const scaScore = certificate.scaScore || lot.scaScore || 88.5;
  const hash = certificate.digitalSealHash || certificate.qrHash || 'AR-E9284109B4F817';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF6EE] text-[#241708] rounded-2xl p-8 shadow-2xl border-4 border-palette-gold overflow-hidden">
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="print:hidden absolute top-4 right-4 p-2 rounded-full bg-[#EADCC8] text-[#4D2A00] hover:bg-palette-gold transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Decorative Frame */}
        <div className="border-2 border-[#D4B384] p-6 rounded-xl relative bg-gradient-to-b from-[#FFFDF9] to-[#F7EEDC]">
          {/* Top Seal */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/20 border border-palette-gold text-palette-espresso text-xs font-bold uppercase tracking-widest">
              <Award className="w-4 h-4 text-palette-amber" />
              <span>Specialty Coffee Association Protocol Certificate</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#4D2A00] tracking-wide pt-2">
              CERTIFICATE OF QUALITY & AUTHENTICITY
            </h2>
            <p className="text-xs font-mono text-[#8C6239] uppercase tracking-wider">
              Cryptographic Seal: <strong className="text-black">{hash}</strong>
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
            {/* Origin & Chemistry Info */}
            <div className="space-y-3 text-xs">
              <div className="border-b border-[#E0CFB3] pb-2">
                <span className="text-[10px] uppercase font-mono text-[#8C6239] block">Batch Lot Name</span>
                <span className="font-bold text-base text-[#4D2A00] font-display">{lot.name || certificate.lotName}</span>
                <span className="text-xs text-[#8C6239] block font-mono">{lot.lotNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C6239]">Origin</span>
                  <p className="font-semibold text-[#4D2A00]">{lot.origin?.country}, {lot.origin?.region}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C6239]">Elevation</span>
                  <p className="font-semibold text-[#4D2A00]">{lot.origin?.altitudeMeters || 1950}m MASL</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C6239]">Varietal</span>
                  <p className="font-semibold text-[#4D2A00]">{lot.origin?.varietal || 'Bourbon / Heirloom'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C6239]">Process Method</span>
                  <p className="font-semibold text-[#4D2A00]">{lot.origin?.processMethod || 'Washed'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-[#8C6239]">Flavor Spectrum</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(lot.flavorNotes || ['Bergamot', 'Jasmine', 'Honeycomb']).map((note, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-palette-gold/20 text-[#4D2A00] font-semibold text-[11px] border border-palette-gold/40"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Score & Cupping Radar */}
            <div className="flex flex-col items-center justify-center bg-[#FAF3E3] p-4 rounded-xl border border-[#DEC49C]">
              <div className="text-center mb-1">
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#8C6239]">
                  Verified SCA Score
                </span>
                <div className="text-3xl font-extrabold text-[#4D2A00] font-display flex items-center justify-center gap-1">
                  <span>{scaScore}</span>
                  <span className="text-sm font-sans text-stone-500 font-normal">/ 100</span>
                </div>
                <span className="text-[11px] font-bold text-palette-amber uppercase">
                  {lot.scaClassification || 'Excellent Specialty'}
                </span>
              </div>

              <CuppingRadar scores={lot.cuppingScores || {}} size={200} />
            </div>
          </div>

          {/* Bottom Verification Seal & Signatures */}
          <div className="mt-6 pt-4 border-t-2 border-[#D4B384] flex flex-wrap items-end justify-between text-xs text-[#8C6239]">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified by CQI Certified Q-Grader Protocol</span>
              </div>
              <p className="text-[10px] font-mono">Issued by AmberRoast OS Global Quality Ledger</p>
            </div>

            <div className="text-right">
              <div className="font-display font-bold text-[#4D2A00] text-sm">AMBERROAST LABS</div>
              <div className="text-[10px] font-mono">Digital Signature Validated</div>
            </div>
          </div>
        </div>

        {/* Action Controls (Hidden on Print) */}
        <div className="print:hidden mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E6D4BA] hover:bg-palette-gold text-[#4D2A00] font-bold text-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-palette-espresso text-palette-cream hover:bg-black font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
