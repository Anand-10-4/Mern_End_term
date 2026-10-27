import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LotCard from '../components/LotCard';
import ReservationModal from '../components/ReservationModal';
import CertificateModal from '../components/CertificateModal';
import { Search, Filter, SlidersHorizontal, Coffee, Sparkles, RefreshCw } from 'lucide-react';

export default function Marketplace({ onSelectLot }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [processMethod, setProcessMethod] = useState('');
  const [minScaScore, setMinScaScore] = useState('');
  const [sortBy, setSortBy] = useState('scaScore');

  // Modals
  const [selectedLotForReserve, setSelectedLotForReserve] = useState(null);
  const [selectedLotForCert, setSelectedLotForCert] = useState(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (country) params.append('country', country);
      if (processMethod) params.append('processMethod', processMethod);
      if (minScaScore) params.append('minScaScore', minScaScore);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.getBatches(params.toString());
      setBatches(res.batches || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [country, processMethod, minScaScore, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBatches();
  };

  const countries = ['All', 'Ethiopia', 'Panama', 'Colombia', 'Kenya', 'Costa Rica'];
  const processes = ['All', 'Washed', 'Natural', 'Honey (Yellow/Red/Black)', 'Anaerobic Slow Dry'];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-palette-cream">
            Artisan Micro-Lot Allocations
          </h1>
          <p className="text-xs text-[#B8A490] mt-1 font-mono">
            Direct Trade Specialty Lots with Verified SCA Scores & Cryptographic Certificates
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-palette-gold absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lot, region, notes (e.g. Gesha, Bergamot)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1D1208] border border-palette-amber/30 text-xs text-palette-cream placeholder-[#8C6239] focus:outline-none focus:border-palette-gold transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs hover:bg-palette-cream transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-palette-amber/20 space-y-3">
        {/* Country Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#8C6239] font-mono uppercase text-[10px] flex-shrink-0">
            Origin:
          </span>
          {countries.map((c) => {
            const val = c === 'All' ? '' : c;
            const isSelected = country === val;
            return (
              <button
                key={c}
                onClick={() => setCountry(val)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold ${
                  isSelected
                    ? 'bg-palette-gold text-palette-espresso shadow-sm'
                    : 'bg-[#25170B] text-[#B8A490] hover:text-white'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Process, SCA Tier & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-palette-amber/15 text-xs">
          {/* Process Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#8C6239] font-mono uppercase text-[10px]">Process:</span>
            <select
              value={processMethod}
              onChange={(e) => setProcessMethod(e.target.value)}
              className="bg-[#140A04] border border-palette-amber/30 rounded-lg px-2.5 py-1 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
            >
              {processes.map((p) => (
                <option key={p} value={p === 'All' ? '' : p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Min SCA Tier Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#8C6239] font-mono uppercase text-[10px]">SCA Score:</span>
            <button
              onClick={() => setMinScaScore('')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                minScaScore === '' ? 'bg-palette-amber text-palette-cream' : 'text-[#8C6239]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMinScaScore('85')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                minScaScore === '85' ? 'bg-palette-gold text-palette-espresso font-bold' : 'text-[#B8A490]'
              }`}
            >
              85+ Excellent
            </button>
            <button
              onClick={() => setMinScaScore('90')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                minScaScore === '90' ? 'bg-palette-gold text-palette-espresso font-bold' : 'text-[#B8A490]'
              }`}
            >
              90+ Presidential
            </button>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-[#8C6239] font-mono uppercase text-[10px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#140A04] border border-palette-amber/30 rounded-lg px-2.5 py-1 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
            >
              <option value="scaScore">Highest SCA Score</option>
              <option value="newest">Newest Roast</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="available">Most Inventory Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Lot Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-palette-gold animate-spin" />
          <p className="text-xs font-mono text-[#B8A490]">Loading allocation registry...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-palette-amber/20 space-y-4">
          <Coffee className="w-12 h-12 text-palette-amber mx-auto opacity-60" />
          <h3 className="text-lg font-bold font-display text-palette-cream">No Matching Lots Found</h3>
          <p className="text-xs text-[#B8A490] max-w-md mx-auto">
            Try adjusting your origin country, processing method, or SCA score filters to view available inventory.
          </p>
          <button
            onClick={() => {
              setCountry('');
              setProcessMethod('');
              setMinScaScore('');
              setSearch('');
              setSortBy('scaScore');
            }}
            className="px-4 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((lot) => (
            <LotCard
              key={lot._id}
              lot={lot}
              onReserve={(l) => setSelectedLotForReserve(l)}
              onSelectLot={(l) => onSelectLot(l)}
              onViewCertificate={(l) => setSelectedLotForCert(l)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedLotForReserve && (
        <ReservationModal
          batch={selectedLotForReserve}
          onClose={() => setSelectedLotForReserve(null)}
          onSuccess={fetchBatches}
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
