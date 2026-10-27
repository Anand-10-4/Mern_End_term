import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  Flame,
  Scale,
  MapPin,
  Sparkles,
  Droplets,
  DollarSign,
  PlusCircle,
  FileCheck,
} from 'lucide-react';

export default function CreateLot({ onLotCreated }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [lotNumber, setLotNumber] = useState(
    `LOT-${Math.floor(100 + Math.random() * 900)}-${new Date().getFullYear()}`
  );
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [region, setRegion] = useState('');
  const [estate, setEstate] = useState('');
  const [altitudeMeters, setAltitudeMeters] = useState(1950);
  const [varietal, setVarietal] = useState('Gesha / Heirloom');
  const [processMethod, setProcessMethod] = useState('Washed');
  const [roastProfile, setRoastProfile] = useState('Light Cinnamon');

  const [greenWeightKg, setGreenWeightKg] = useState(120);
  const [roastedWeightKg, setRoastedWeightKg] = useState(102);
  const [pricePerKg, setPricePerKg] = useState(42.0);

  const [moistureContentPercent, setMoistureContentPercent] = useState(10.8);
  const [densityGramsPerLiter, setDensityGramsPerLiter] = useState(720);
  const [defectCount, setDefectCount] = useState(0);

  const [story, setStory] = useState('');
  const [flavorNoteInput, setFlavorNoteInput] = useState('');
  const [flavorNotes, setFlavorNotes] = useState(['Jasmine', 'Bergamot', 'Peach']);
  const [submitting, setSubmitting] = useState(false);

  // Live Roast Shrinkage Calculation
  const green = parseFloat(greenWeightKg) || 0;
  const roasted = parseFloat(roastedWeightKg) || 0;
  const shrinkagePercent = green > 0 ? Math.round(((green - roasted) / green) * 1000) / 10 : 0;

  const addNote = () => {
    if (flavorNoteInput.trim() && !flavorNotes.includes(flavorNoteInput.trim())) {
      setFlavorNotes([...flavorNotes, flavorNoteInput.trim()]);
      setFlavorNoteInput('');
    }
  };

  const removeNote = (note) => {
    setFlavorNotes(flavorNotes.filter((n) => n !== note));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || (user.role !== 'roaster' && user.role !== 'admin')) {
      addToast('You must be authenticated as an Artisan Roaster or Admin to register lots', 'warning');
      return;
    }

    if (!name || !region) {
      addToast('Please provide a lot name and region', 'warning');
      return;
    }

    if (roastedWeightKg >= greenWeightKg) {
      addToast('Roasted weight must be less than green weight due to moisture loss', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        lotNumber,
        name,
        origin: {
          country,
          region,
          estate: estate || 'Independent Micro-Estate',
          altitudeMeters: Number(altitudeMeters),
          varietal,
          processMethod,
        },
        roastProfile,
        greenWeightKg: Number(greenWeightKg),
        roastedWeightKg: Number(roastedWeightKg),
        pricePerKg: Number(pricePerKg),
        moistureContentPercent: Number(moistureContentPercent),
        densityGramsPerLiter: Number(densityGramsPerLiter),
        defectCount: Number(defectCount),
        flavorNotes,
        story: story || 'Artisan micro-batch harvested at peak Brix ripeness.',
      };

      const res = await api.createBatch(payload);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F9E6A8', '#F2A900', '#CC6F00', '#4D2A00'],
      });

      addToast(`Micro-lot ${lotNumber} successfully registered with cryptographic seal!`, 'success');
      onLotCreated && onLotCreated(res.batch._id);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 text-palette-gold text-xs font-mono uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5" />
          <span>Roaster Craft Ingestion Protocol</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-palette-cream">
          Register New Artisan Micro-Lot
        </h1>
        <p className="text-xs text-[#B8A490] font-mono mt-1">
          Catalog fresh harvests with moisture chemistry, roast yield ratios, and cryptographic lot verification
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Lot Identity & Origin */}
        <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>1. Lot Identity & Terroir Origin</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Lot Identifier:</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                required
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-gold font-mono uppercase focus:outline-none focus:border-palette-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Batch / Lot Name:</label>
              <input
                type="text"
                placeholder="e.g. Yirgacheffe Banko Gotiti Natural G1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Country:</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
              >
                <option value="Ethiopia">Ethiopia</option>
                <option value="Panama">Panama</option>
                <option value="Colombia">Colombia</option>
                <option value="Kenya">Kenya</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Guatemala">Guatemala</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Region / Micro-Zone:</label>
              <input
                type="text"
                placeholder="e.g. Gedeb, Gedeo Zone"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Farm / Cooperative:</label>
              <input
                type="text"
                placeholder="e.g. Banko Gotiti Micro-Mill"
                value={estate}
                onChange={(e) => setEstate(e.target.value)}
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Elevation (m MASL):</label>
              <input
                type="number"
                value={altitudeMeters}
                onChange={(e) => setAltitudeMeters(e.target.value)}
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Botanical Varietal:</label>
              <input
                type="text"
                value={varietal}
                onChange={(e) => setVarietal(e.target.value)}
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Processing Method:</label>
              <select
                value={processMethod}
                onChange={(e) => setProcessMethod(e.target.value)}
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
              >
                <option value="Washed">Washed</option>
                <option value="Natural">Natural</option>
                <option value="Honey (Yellow/Red/Black)">Honey (Yellow/Red/Black)</option>
                <option value="Anaerobic Slow Dry">Anaerobic Slow Dry</option>
                <option value="Thermal Shock">Thermal Shock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Roast Yield & Moisture Chemistry */}
        <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>2. Roast Yield Ratios & Chemistry</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              Roast Shrinkage: <strong>{shrinkagePercent}%</strong> (13-16% optimal)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Green Weight Ingested (kg):</label>
              <input
                type="number"
                value={greenWeightKg}
                onChange={(e) => setGreenWeightKg(e.target.value)}
                required
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Roasted Yield Weight (kg):</label>
              <input
                type="number"
                value={roastedWeightKg}
                onChange={(e) => setRoastedWeightKg(e.target.value)}
                required
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Roast Profile Style:</label>
              <select
                value={roastProfile}
                onChange={(e) => setRoastProfile(e.target.value)}
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
              >
                <option value="Light Cinnamon">Light Cinnamon (Nordic Filter)</option>
                <option value="Medium City+">Medium City+ (Balance & Body)</option>
                <option value="Full City">Full City (Rich & Chocolate)</option>
                <option value="Omni-Roast">Omni-Roast (Espresso & Filter)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-palette-amber/15">
            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Moisture Level (%):</label>
              <input
                type="number"
                step="0.1"
                value={moistureContentPercent}
                onChange={(e) => setMoistureContentPercent(e.target.value)}
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Density (g/L):</label>
              <input
                type="number"
                value={densityGramsPerLiter}
                onChange={(e) => setDensityGramsPerLiter(e.target.value)}
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#B8A490] block mb-1">Wholesale Rate ($ / kg):</label>
              <input
                type="number"
                step="0.5"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                required
                className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-gold focus:outline-none focus:border-palette-gold font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Story & Flavor Notes */}
        <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>3. Sensory Story & Flavor Tags</span>
          </h3>

          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Harvest & Terroir Story:</label>
            <textarea
              rows="3"
              placeholder="Describe fermentation protocol, shade conditions, soil characteristics..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl p-3 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Add Flavor Notes:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Honeysuckle, Tangerine, Dark Cocoa..."
                value={flavorNoteInput}
                onChange={(e) => setFlavorNoteInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNote())}
                className="flex-1 bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
              />
              <button
                type="button"
                onClick={addNote}
                className="px-4 py-2 rounded-xl bg-[#281A0E] text-palette-gold font-bold text-xs border border-palette-amber/30"
              >
                Add Note
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {flavorNotes.map((note) => (
                <span
                  key={note}
                  onClick={() => removeNote(note)}
                  className="cursor-pointer px-2.5 py-1 rounded-md bg-[#25170B] text-amber-200 text-xs font-medium border border-palette-amber/30 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                >
                  {note} ×
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-sm shadow-glow-gold hover:opacity-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? 'Registering...' : 'Commit Lot to Specialty Registry'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
