import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, Flame, Clock, Sparkles, Filter, RefreshCw } from 'lucide-react';

export default function BakeryMenu({ onAddToCart, onNavigateCustomCake }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState('all');
  const [dietary, setDietary] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'all', label: 'All Fresh Bakes', emoji: '✨' },
    { id: 'breads', label: 'Artisan Breads', emoji: '🥖' },
    { id: 'croissants_pastries', label: 'Croissants & Viennoiserie', emoji: '🥐' },
    { id: 'tarts_cakes', label: 'Tarts & Gateaux', emoji: '🍰' },
    { id: 'savory_bakes', label: 'Savory Bakes', emoji: '🧀' },
  ];

  const dietaryOptions = ['all', 'Vegetarian', 'Vegan', 'Eggless', 'Gluten-Free', 'Nut-Free'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (dietary !== 'all') params.append('dietary', dietary);
      if (search) params.append('search', search);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.getProducts(params.toString());
      setProducts(res.products || []);
    } catch (err) {
      console.error('Error fetching bakery products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, dietary, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-palette-gold/30 bg-gradient-to-br from-[#271408] via-[#1D0E05] to-[#120703] shadow-card-dark">
        <div className="absolute top-0 right-0 w-80 h-80 bg-palette-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-gold/15 border border-palette-gold/30 text-palette-gold text-xs font-mono uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Deck Ovens Fired at 5:30 AM Daily</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-palette-cream leading-tight">
            Artisan Sourdough, Flaky Pastries & <br />
            <span className="amber-gradient-text">Bespoke Celebration Cakes</span>
          </h1>

          <p className="text-sm text-[#D4BEA2] leading-relaxed">
            Slow wild yeast fermentation, cultured French butter, and organic stone-milled flours. Baked fresh every morning with real-time oven batch inventory.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onNavigateCustomCake}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Custom Cake Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap font-semibold transition-all ${
                category === c.id
                  ? 'bg-palette-gold text-palette-espresso font-bold shadow-sm'
                  : 'bg-[#25150A] text-[#B8A490] hover:text-white'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-palette-gold absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search croissants, sourdough, tart..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1D0F06] border border-palette-amber/30 text-xs text-palette-cream placeholder-[#8C6239] focus:outline-none focus:border-palette-gold"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-palette-gold text-palette-espresso font-bold text-xs"
          >
            Find
          </button>
        </form>
      </div>

      {/* Secondary Dietary & Sort Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-palette-amber/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[#8C6239] font-mono uppercase text-[10px] flex-shrink-0">
            Dietary:
          </span>
          {dietaryOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setDietary(opt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                dietary === opt
                  ? 'bg-palette-amber text-palette-cream font-bold'
                  : 'bg-[#1C0E06] text-[#B8A490] hover:text-white'
              }`}
            >
              {opt === 'all' ? 'All' : opt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#8C6239] font-mono uppercase text-[10px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#140A04] border border-palette-amber/30 rounded-lg px-2 py-1 text-xs text-palette-cream focus:outline-none focus:border-palette-gold"
          >
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Catalog Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-palette-gold animate-spin" />
          <p className="text-xs font-mono text-[#B8A490]">Pulling fresh bakes from ovens...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-palette-amber/20 space-y-3">
          <span className="text-4xl block">🥐</span>
          <h3 className="text-base font-bold font-display text-palette-cream">No bakery items found</h3>
          <p className="text-xs text-[#B8A490]">Try clearing dietary filters or searching another keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
