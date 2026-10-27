import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CuppingRadar from '../components/CuppingRadar';
import confetti from 'canvas-confetti';
import {
  Scale,
  Award,
  Sparkles,
  Droplets,
  Thermometer,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function CuppingLab({ onLotCupped }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [batches, setBatches] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [sessionTitle, setSessionTitle] = useState('Official Q-Grader Certification Cupping');
  const [submitting, setSubmitting] = useState(false);

  // Environmental Parameters
  const [waterTemp, setWaterTemp] = useState(93.5);
  const [grindMicrons, setGrindMicrons] = useState(850);

  // 10 SCA Attributes (defaults to 8.5)
  const [scores, setScores] = useState({
    fragrance: 8.75,
    flavor: 8.75,
    aftertaste: 8.5,
    acidity: 8.75,
    body: 8.5,
    balance: 8.5,
    uniformity: 10,
    cleanCup: 10,
    sweetness: 10,
    overall: 8.75,
  });

  // Defects
  const [defectCups, setDefectCups] = useState(0);
  const [defectIntensity, setDefectIntensity] = useState(2); // 2 = taint, 4 = fault

  // Descriptors
  const [tastingNoteInput, setTastingNoteInput] = useState('');
  const [tastingNotes, setTastingNotes] = useState(['Jasmine Blossom', 'Meyer Lemon', 'Wild Honey', 'Apricot']);

  useEffect(() => {
    api.getBatches().then((res) => {
      const bList = res.batches || [];
      setBatches(bList);
      if (bList.length > 0) {
        setSelectedLotId(bList[0]._id);
      }
    });
  }, []);

  const handleScoreChange = (key, value) => {
    setScores((prev) => ({
      ...prev,
      [key]: parseFloat(value),
    }));
  };

  // Live calculation of SCA total score
  const rawSum = Object.values(scores).reduce((a, b) => a + b, 0);
  const defectDeduction = defectCups * defectIntensity;
  const calculatedScore = Math.max(0, Math.min(100, Math.round((rawSum - defectDeduction) * 100) / 100));

  let classification = 'Commercial / Sub-Specialty';
  let badgeColor = 'text-red-400 border-red-500/40 bg-red-950/20';

  if (calculatedScore >= 90) {
    classification = 'Presidential Exemplar (90-100)';
    badgeColor = 'text-palette-gold border-palette-gold bg-palette-gold/20 shadow-glow-gold';
  } else if (calculatedScore >= 85) {
    classification = 'Excellent Specialty (85-89.99)';
    badgeColor = 'text-amber-200 border-amber-400/40 bg-amber-950/30';
  } else if (calculatedScore >= 80) {
    classification = 'Very Good Specialty (80-84.99)';
    badgeColor = 'text-palette-cream border-palette-amber/40 bg-palette-amber/20';
  }

  const addTastingNote = () => {
    if (tastingNoteInput.trim() && !tastingNotes.includes(tastingNoteInput.trim())) {
      setTastingNotes([...tastingNotes, tastingNoteInput.trim()]);
      setTastingNoteInput('');
    }
  };

  const removeTastingNote = (note) => {
    setTastingNotes(tastingNotes.filter((n) => n !== note));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in with a Q-Grader, Roaster, or Admin account', 'warning');
      return;
    }

    if (!selectedLotId) {
      addToast('Please select a batch lot to cup', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        lotId: selectedLotId,
        sessionTitle,
        waterTempCelsius: waterTemp,
        grindMicrons,
        ...scores,
        defectCups,
        defectIntensity,
        tastingNotes,
      };

      const res = await api.evaluateCupping(payload);

      if (res.scaResult.isSpecialtyGrade) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F9E6A8', '#F2A900', '#CC6F00', '#4D2A00'],
        });
      }

      addToast(res.message, 'success');
      onLotCupped && onLotCupped(selectedLotId);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const attributeLabels = [
    { key: 'fragrance', label: 'Fragrance / Aroma', min: 6, max: 10, step: 0.25 },
    { key: 'flavor', label: 'Flavor', min: 6, max: 10, step: 0.25 },
    { key: 'aftertaste', label: 'Aftertaste', min: 6, max: 10, step: 0.25 },
    { key: 'acidity', label: 'Acidity', min: 6, max: 10, step: 0.25 },
    { key: 'body', label: 'Body', min: 6, max: 10, step: 0.25 },
    { key: 'balance', label: 'Balance', min: 6, max: 10, step: 0.25 },
    { key: 'cleanCup', label: 'Clean Cup (2 pts / cup)', min: 0, max: 10, step: 2 },
    { key: 'sweetness', label: 'Sweetness (2 pts / cup)', min: 0, max: 10, step: 2 },
    { key: 'uniformity', label: 'Uniformity (2 pts / cup)', min: 0, max: 10, step: 2 },
    { key: 'overall', label: 'Overall Impression', min: 6, max: 10, step: 0.25 },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 text-palette-gold text-xs font-mono uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>SCA Standard Cupping Protocol Protocol #2026</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-palette-cream">
            Sensory Evaluation & Cupping Bench
          </h1>
          <p className="text-xs text-[#B8A490] font-mono mt-1">
            Standardized 10-attribute protocol scoring engine with real-time radar mapping
          </p>
        </div>

        {/* Live Score Display */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${badgeColor} transition-all`}>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider block opacity-80">
              Live Verified Score
            </span>
            <div className="text-3xl font-extrabold font-mono flex items-baseline gap-1">
              <span>{calculatedScore.toFixed(2)}</span>
              <span className="text-xs font-sans opacity-70">/ 100</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider block">
              {classification}
            </span>
            {defectDeduction > 0 && (
              <span className="text-[10px] text-red-300 font-mono block">
                -{defectDeduction} pts defect penalty
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Lot Selection & 10 Attributes Sliders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lot & Lab Environment Configuration */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold">
              1. Lot & Sample Calibration Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-[#B8A490] block mb-1">
                  Target Batch Lot:
                </label>
                <select
                  value={selectedLotId}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold font-mono"
                >
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.lotNumber} - {b.name} ({b.origin?.country}) [Current: {b.scaScore}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-[#B8A490] block mb-1">
                  Session Title:
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-palette-amber/15 text-xs">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-500" />
                <span className="text-[#B8A490]">Water Temp:</span>
                <span className="font-mono text-palette-cream font-bold">{waterTemp}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-palette-gold" />
                <span className="text-[#B8A490]">Grind Particle Size:</span>
                <span className="font-mono text-palette-cream font-bold">{grindMicrons} μm</span>
              </div>
            </div>
          </div>

          {/* 10 SCA Attributes Sliders */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-5">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-palette-gold">
              2. SCA 10-Attribute Scoring Sliders
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {attributeLabels.map((attr) => (
                <div key={attr.key} className="p-3 rounded-xl bg-[#140A04] border border-palette-amber/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-palette-cream">{attr.label}</span>
                    <span className="font-mono font-bold text-palette-gold">
                      {scores[attr.key]?.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={attr.min}
                    max={attr.max}
                    step={attr.step}
                    value={scores[attr.key]}
                    onChange={(e) => handleScoreChange(attr.key, e.target.value)}
                    className="w-full h-1.5 bg-[#25170B] rounded-lg cursor-pointer accent-palette-gold"
                  />
                  <div className="flex justify-between text-[10px] text-[#8C6239] font-mono">
                    <span>{attr.min}.0</span>
                    <span>{attr.max}.0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Defect Deduction Module */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>3. Defect Cup Deductions</span>
              </h3>
              <span className="text-xs font-mono text-red-400">
                Current Deduction: -{defectDeduction} pts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-xs font-mono text-[#B8A490] block mb-1">
                  Defective Cups Count (0 - 5):
                </label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setDefectCups(count)}
                      className={`flex-1 py-1.5 rounded-lg font-mono font-bold transition-all ${
                        defectCups === count
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-[#140A04] text-[#B8A490] hover:text-white border border-palette-amber/20'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#B8A490] block mb-1">
                  Defect Intensity:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDefectIntensity(2)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-xs font-semibold ${
                      defectIntensity === 2
                        ? 'bg-palette-amber text-palette-cream border border-palette-cream/40'
                        : 'bg-[#140A04] text-[#B8A490] border border-palette-amber/20'
                    }`}
                  >
                    Taint (2 pts/cup)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefectIntensity(4)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-xs font-semibold ${
                      defectIntensity === 4
                        ? 'bg-red-600 text-white border border-red-300'
                        : 'bg-[#140A04] text-[#B8A490] border border-palette-amber/20'
                    }`}
                  >
                    Fault (4 pts/cup)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Radar Preview, Tasting Notes & Submit (1 Col) */}
        <div className="space-y-6">
          {/* Live Dynamic Radar Wheel */}
          <div className="glass-panel p-6 rounded-2xl border border-palette-amber/20 text-center space-y-2 sticky top-24">
            <span className="text-xs font-mono uppercase text-palette-gold tracking-wider">
              Live Sensory Visualizer
            </span>
            <h4 className="font-display font-bold text-palette-cream">Dynamic Cupping Radar</h4>
            <CuppingRadar scores={scores} size={240} />

            {/* Sensory Tasting Notes Tag Input */}
            <div className="text-left pt-4 border-t border-palette-amber/15 space-y-2">
              <label className="text-xs font-mono text-[#B8A490] block">
                Sensory Descriptors & Notes:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Blood Orange, Cacao..."
                  value={tastingNoteInput}
                  onChange={(e) => setTastingNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTastingNote())}
                  className="flex-1 bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-1.5 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
                />
                <button
                  type="button"
                  onClick={addTastingNote}
                  className="px-3 py-1.5 rounded-xl bg-[#281A0E] hover:bg-[#3D2716] text-palette-gold font-bold text-xs border border-palette-amber/30"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tastingNotes.map((note) => (
                  <span
                    key={note}
                    onClick={() => removeTastingNote(note)}
                    className="cursor-pointer px-2.5 py-1 rounded-md bg-[#25170B] hover:bg-red-950/40 text-amber-200 hover:text-red-300 text-[11px] font-medium border border-palette-amber/30 transition-colors"
                    title="Click to remove"
                  >
                    {note} ×
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Official Scorecard */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {submitting ? 'Recording Protocol...' : `Commit Verified Score (${calculatedScore.toFixed(2)})`}
                </span>
              </button>
              <p className="text-[10px] text-[#8C6239] font-mono mt-2">
                Commits this sensory scorecard to the immutable lot audit ledger.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
