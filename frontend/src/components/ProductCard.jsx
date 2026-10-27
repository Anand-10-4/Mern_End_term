import React from 'react';
import { Flame, Clock, Sparkles, Plus, Check } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  if (!product) return null;

  const isSoldOut = product.availableStock <= 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= 5;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative group border border-palette-amber/20 hover:border-palette-gold/50 shadow-card-dark">
      {/* Decorative Warm Glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-palette-gold/10 rounded-full blur-2xl group-hover:bg-palette-gold/20 transition-all pointer-events-none" />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.isChefSpecial && (
              <span className="px-2 py-0.5 rounded-full bg-palette-gold text-palette-espresso font-mono text-[10px] font-extrabold uppercase">
                Chef Special
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-[#29170A] text-palette-cream font-mono text-[10px] border border-palette-amber/30 uppercase">
              {product.category?.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-palette-gold">
            <span>★ {product.rating || 4.9}</span>
            <span className="text-[#8C6239]">({product.reviewCount || 24})</span>
          </div>
        </div>

        {/* Emoji Icon & Title */}
        <div className="mt-3 flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#28160B] border border-palette-amber/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {product.imageEmoji || '🥐'}
          </div>
          <div>
            <h3
              onClick={() => onQuickView && onQuickView(product)}
              className="text-base font-bold font-display text-palette-cream group-hover:text-palette-gold transition-colors cursor-pointer leading-tight"
            >
              {product.name}
            </h3>
            <p className="text-xs text-[#B8A490] line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {/* Dietary Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(product.dietaryTags || []).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-[#251508] text-amber-200 text-[10px] font-medium border border-palette-amber/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stock Bar & Pricing Footer */}
      <div className="mt-4 pt-3.5 border-t border-palette-amber/15 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#B8A490] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-palette-gold" />
            <span>{product.bakeTime || 'Baked Fresh Daily'}</span>
          </span>
          <span
            className={`font-bold ${
              isSoldOut
                ? 'text-red-400'
                : isLowStock
                ? 'text-amber-400'
                : 'text-palette-cream'
            }`}
          >
            {isSoldOut ? 'Sold Out' : `${product.availableStock} left today`}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] text-[#8C6239] uppercase font-mono block">Warm Batch Price</span>
            <span className="text-xl font-bold font-mono text-palette-gold">
              ${product.price?.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isSoldOut}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-palette-gold via-palette-amber to-palette-espresso text-palette-espresso font-bold text-xs shadow-glow-gold hover:opacity-95 transition-all disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
