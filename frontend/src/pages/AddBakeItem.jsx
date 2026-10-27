import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { Flame, PlusCircle, Sparkles, Scale, Clock } from 'lucide-react';

export default function AddBakeItem({ onBakeAdded }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('croissants_pastries');
  const [price, setPrice] = useState(5.5);
  const [dailyStock, setDailyStock] = useState(20);
  const [description, setDescription] = useState('');
  const [imageEmoji, setImageEmoji] = useState('🥐');
  const [bakeTime, setBakeTime] = useState('6:30 AM Daily');
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emojiOptions = ['🥖', '🥐', '🍞', '🥯', '🥨', '🍰', '🧁', '🥧', '🍫', '🧀', '🍓'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description) {
      addToast('Please fill out all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        category,
        price: Number(price),
        dailyStock: Number(dailyStock),
        description,
        imageEmoji,
        bakeTime,
        isChefSpecial,
        dietaryTags: ['Vegetarian'],
      };

      const res = await api.createProduct(payload);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F9E6A8', '#F2A900', '#CC6F00', '#4D2A00'],
      });

      addToast(`Added '${name}' to daily fresh bake menu!`, 'success');
      onBakeAdded && onBakeAdded(res.product);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 text-palette-gold text-xs font-mono uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5" />
          <span>Head Baker Craft Studio</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-palette-cream">
          Add New Daily Bake Item
        </h1>
        <p className="text-xs text-[#B8A490] font-mono mt-1">
          Catalog fresh morning creations, set daily batch yields and oven bake schedules
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-palette-amber/20 space-y-4">
        <div>
          <label className="text-xs font-mono text-[#B8A490] block mb-1">Item Name:</label>
          <input
            type="text"
            required
            placeholder="e.g. Pistachio Cardamom Morning Bun"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
            >
              <option value="breads">Artisan Breads</option>
              <option value="croissants_pastries">Croissants & Viennoiserie</option>
              <option value="tarts_cakes">Tarts & Gateaux</option>
              <option value="savory_bakes">Savory Bakes</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Price ($):</label>
            <input
              type="number"
              step="0.25"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-gold font-mono font-bold focus:outline-none focus:border-palette-gold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Daily Batch Quantity:</label>
            <input
              type="number"
              required
              value={dailyStock}
              onChange={(e) => setDailyStock(e.target.value)}
              className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream font-mono focus:outline-none focus:border-palette-gold"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#B8A490] block mb-1">Oven Bake Schedule:</label>
            <input
              type="text"
              value={bakeTime}
              onChange={(e) => setBakeTime(e.target.value)}
              className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl px-3 py-2 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-[#B8A490] block mb-1">Icon Representation:</label>
          <div className="flex gap-2 flex-wrap">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setImageEmoji(emoji)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                  imageEmoji === emoji
                    ? 'bg-palette-gold border-palette-gold shadow-sm scale-105'
                    : 'bg-[#180C05] border-palette-amber/20'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-[#B8A490] block mb-1">Description:</label>
          <textarea
            rows="3"
            required
            placeholder="Describe crust, crumb, organic flours, butter lamination..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#140A04] border border-palette-amber/30 rounded-xl p-3 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="chefSpecial"
            checked={isChefSpecial}
            onChange={(e) => setIsChefSpecial(e.target.checked)}
            className="accent-palette-gold"
          />
          <label htmlFor="chefSpecial" className="text-xs text-palette-cream cursor-pointer font-medium">
            Feature as Chef's Daily Special ⭐
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-extrabold text-xs shadow-glow-gold hover:opacity-95 transition-all mt-2"
        >
          {submitting ? 'Adding...' : 'Add to Bakery Daily Menu'}
        </button>
      </form>
    </div>
  );
}
