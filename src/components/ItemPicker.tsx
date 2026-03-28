import { useState, useEffect, useRef } from 'react';
import type { SlotId, ItemDef } from '../types';
import { SLOT_MAP } from '../constants/slots';
import { itemLabel } from '../i18n/fr';

const RENDER_BASE = 'https://render.albiononline.com/v1/item';
const TIER_FALLBACKS = ['T4', 'T5', 'T6', 'T7', 'T8'];

interface Props {
  slotId: SlotId;
  lang: 'en' | 'fr';
  onSelect: (itemId: string) => void;
  onClose: () => void;
}

function ItemThumb({ baseId, label }: { baseId: string; label: string }) {
  const [tierIdx, setTierIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const isFullId = /^T\d+_/.test(baseId);

  if (failed) {
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-albion-dark rounded text-gray-600 text-xs shrink-0">?</div>
    );
  }

  if (isFullId) {
    return (
      <img
        src={`${RENDER_BASE}/${baseId}.png?count=1&quality=1`}
        alt={label}
        onError={() => setFailed(true)}
        className="w-10 h-10 object-contain rounded shrink-0"
        draggable={false}
      />
    );
  }

  return (
    <img
      key={TIER_FALLBACKS[tierIdx]}
      src={`${RENDER_BASE}/${TIER_FALLBACKS[tierIdx]}_${baseId}.png?count=1&quality=1`}
      alt={label}
      onError={() => {
        if (tierIdx < TIER_FALLBACKS.length - 1) setTierIdx(tierIdx + 1);
        else setFailed(true);
      }}
      className="w-10 h-10 object-contain rounded shrink-0"
      draggable={false}
    />
  );
}

export default function ItemPicker({ slotId, lang, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const inputRef = useRef<HTMLInputElement>(null);

  const slot = SLOT_MAP[slotId];
  // Combine 1H and 2H lists (deduped) — relevant for weapon/offhand slots
  const items: ItemDef[] = [
    ...slot.items1H,
    ...slot.items2H.filter((i) => !slot.items1H.some((j) => j.id === i.id)),
  ];

  // Unique categories in order of appearance
  const categories = ['Tous', ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter(
    (item) =>
      (activeCategory === 'Tous' || item.category === activeCategory) &&
      itemLabel(item.id, lang, item.label).toLowerCase().includes(search.toLowerCase()),
  );

  // Focus search on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
      onClick={onClose}
    >
      <div
        className="bg-albion-card border border-albion-border rounded-xl w-[480px] max-h-[75vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-albion-gold font-semibold text-sm uppercase tracking-wide">
            {slot.label} — Sélectionner un item
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un item…"
            className="w-full bg-albion-dark border border-albion-border rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-albion-gold"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-4 pb-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                activeCategory === cat
                  ? 'bg-albion-gold text-black font-semibold'
                  : 'bg-albion-dark text-gray-400 hover:text-gray-200 border border-albion-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Item list */}
        <div className="overflow-y-auto flex-1 px-2 pb-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">Aucun résultat</div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.id); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-albion-card-hover transition-colors text-left group"
                >
                  <ItemThumb baseId={item.id} label={itemLabel(item.id, lang, item.label)} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-gray-200 text-xs font-medium group-hover:text-white truncate">
                      {itemLabel(item.id, lang, item.label)}
                    </span>
                    <span className="text-gray-600 text-[10px]">{item.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear option */}
        <div className="border-t border-albion-border px-4 py-2">
          <button
            onClick={() => { onSelect(''); onClose(); }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ✕ Retirer cet item
          </button>
        </div>
      </div>
    </div>
  );
}
