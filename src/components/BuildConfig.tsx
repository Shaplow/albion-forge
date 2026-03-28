import { useState, useEffect, useRef } from 'react';
import type { SlotId, SelectedItems } from '../types';
import { SLOT_MAP } from '../constants/slots';
import { itemLabel } from '../i18n/fr';
import { getCrossMultiplier } from '../utils/calculations';
import ItemPicker from './ItemPicker';

const RENDER_BASE = 'https://render.albiononline.com/v1/item';
const TIER_FALLBACKS = ['T4', 'T5', 'T6', 'T7', 'T8'];

const ROMAN: Record<number, string> = {
  4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII',
};

const SLOT_GRID: (SlotId | null)[] = [
  'bag',    'head',   'cape',
  'weapon', 'armor',  'offhand',
  null,     'feet',   null,
  'potion', null,     'food',
];

// ─── Spec Slider Popup ────────────────────────────────────────────────────────

interface SpecSliderProps {
  spec: number;
  onChange: (v: number) => void;
  crossSpec: number | undefined;
  onCrossSpecChange: (v: number | undefined) => void;
  itemId: string;
  onClose: () => void;
}

function SpecSlider({ spec, onChange, crossSpec, onCrossSpecChange, itemId, onClose }: SpecSliderProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [openUpward, setOpenUpward] = useState(true);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.top < 0) setOpenUpward(false);
  }, []);

  return (
    <div
      ref={ref}
      className={`absolute z-20 left-1/2 -translate-x-1/2 bg-albion-card border border-albion-border rounded-lg shadow-2xl ${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'}`}
      style={{ width: 160, padding: '10px 12px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: spec value + cross contribution of this item */}
      {(() => {
        const mult = getCrossMultiplier(itemId);
        const crossContrib = Math.floor(spec * mult);
        const multLabel = mult === 0.025 ? 'cristal ×0.025' : mult === 0.1 ? 'artefact ×0.1' : 'base ×0.2';
        return (
          <>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Spécialisation</span>
              <span className="text-albion-gold font-bold text-sm">{spec}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-gray-500" title="Contribution de cet item aux autres items de la branche (sert à calculer le Spec croisé des autres)">Apport cross ({multLabel})</span>
              <span className="text-[10px] text-cyan-400 font-semibold">{crossContrib}</span>
            </div>
          </>
        );
      })()}
      <input
        type="range"
        min={0}
        max={120}
        value={spec}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-albion-gold"
        style={{ cursor: 'pointer' }}
      />
      <div className="flex justify-between text-[9px] text-gray-600 mt-1">
        <span>0</span>
        <span>120</span>
      </div>

      {/* Cross-spec override */}
      <div className="mt-3 pt-3 border-t border-albion-border">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Spec croisé</span>
          {crossSpec !== undefined && (
            <button
              onClick={() => onCrossSpecChange(undefined)}
              className="text-[9px] text-gray-500 hover:text-red-400 transition-colors"
              title="Réinitialiser (utiliser la valeur globale)"
            >
              ✕ reset
            </button>
          )}
        </div>
        <input
          type="number"
          min={0}
          value={crossSpec ?? ''}
          placeholder="0"
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
            onCrossSpecChange(v);
          }}
          className="w-full bg-albion-dark border border-albion-border text-gray-100 text-sm rounded px-2 py-1 text-center focus:outline-none focus:border-albion-gold"
          style={{ fontSize: 11 }}
        />
      </div>
    </div>
  );
}

// ─── Slot Card ────────────────────────────────────────────────────────────────

interface SlotCardProps {
  slotId: SlotId;
  selected: SelectedItems;
  is2H: boolean;
  spec: number;
  crossSpec: number | undefined;
  lang: 'en' | 'fr';
  onOpenPicker: (slotId: SlotId) => void;
  onSpecChange: (spec: number) => void;
  onCrossSpecChange: (v: number | undefined) => void;
}

function SlotCard({ slotId, selected, is2H, spec, crossSpec, lang, onOpenPicker, onSpecChange, onCrossSpecChange }: SlotCardProps) {
  const [tierIdx, setTierIdx] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

  const slot = SLOT_MAP[slotId];
  const weaponId = selected['weapon'] ?? '';
  const isDisabled = slotId === 'offhand' && (is2H || weaponId.startsWith('2H_'));
  const isCombatSlot = slotId !== 'bag' && slotId !== 'cape';
  const items = slot.items1H;
  const selectedId = isDisabled ? '' : (selected[slotId] ?? '');
  const selectedItem = items.find((i) => i.id === selectedId);
  const hasItem = !!selectedItem && !isDisabled;
  const isConsumable = slot.isConsumable;

  useEffect(() => {
    setTierIdx(0);
    setImgFailed(false);
    setShowSlider(false);
  }, [selectedId]);

  const imgSrc = /^T\d+_/.test(selectedId)
    ? `${RENDER_BASE}/${selectedId}.png?count=1&quality=1`
    : `${RENDER_BASE}/${TIER_FALLBACKS[tierIdx]}_${selectedId}.png?count=1&quality=1`;

  return (
    <div className={`flex flex-col items-center gap-1 relative ${isDisabled ? 'opacity-25 pointer-events-none' : ''}`}>
      {/* Spec slider popup — positioned relative to the card wrapper */}
      {showSlider && hasItem && !isConsumable && isCombatSlot && (
        <SpecSlider
          spec={spec}
          onChange={onSpecChange}
          crossSpec={crossSpec}
          onCrossSpecChange={onCrossSpecChange}
          itemId={selectedId}
          onClose={() => setShowSlider(false)}
        />
      )}

      {/* Item frame */}
      <button
        onClick={() => !isDisabled && onOpenPicker(slotId)}
        title={hasItem ? itemLabel(selectedItem.id, lang, selectedItem.label) : `Sélectionner ${slot.label}`}
        className="relative focus:outline-none group"
        style={{ width: 76, height: 76 }}
      >
        {/* Background */}
        <div
          className="absolute inset-0 rounded transition-all"
          style={{
            background: hasItem
              ? 'linear-gradient(145deg, #202020 0%, #101010 100%)'
              : 'linear-gradient(145deg, #161616 0%, #0a0a0a 100%)',
            boxShadow: hasItem
              ? 'inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px #3a3a3a, 0 0 0 2px #1e1e1e, 0 3px 8px rgba(0,0,0,0.7)'
              : 'inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px #262626, 0 0 0 2px #181818',
          }}
        />

        {/* Hover ring */}
        <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{
          boxShadow: '0 0 0 1px rgba(200,168,75,0.4), 0 0 8px rgba(200,168,75,0.1)',
        }} />

        {/* Corner accents */}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-2 h-2`} style={{
            background: 'radial-gradient(circle at center, #4a4040 0%, transparent 70%)',
            opacity: 0.6,
          }} />
        ))}

        {/* Item image */}
        {hasItem && !imgFailed ? (
          /^T\d+_/.test(selectedId) ? (
            <img
              src={imgSrc}
              alt={itemLabel(selectedItem.id, lang, selectedItem.label)}
              onError={() => setImgFailed(true)}
              className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain"
              draggable={false}
            />
          ) : (
            <img
              key={TIER_FALLBACKS[tierIdx]}
              src={imgSrc}
              alt={itemLabel(selectedItem.id, lang, selectedItem.label)}
              onError={() => {
                if (tierIdx < TIER_FALLBACKS.length - 1) setTierIdx(tierIdx + 1);
                else setImgFailed(true);
              }}
              className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain"
              draggable={false}
            />
          )
        ) : hasItem && imgFailed ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-bold">
            {selectedItem.label.slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] text-gray-700 uppercase tracking-widest text-center px-1 leading-tight">
              {slot.label}
            </span>
          </div>
        )}

        {/* Tier badge — top-left */}
        {hasItem && !isConsumable && (
          <div
            className="absolute top-0.5 left-0.5 text-[9px] font-bold leading-none px-1 py-0.5 rounded-sm pointer-events-none"
            style={{ color: '#c8a84b', background: 'rgba(0,0,0,0.8)' }}
          >
            {ROMAN[4]}
          </div>
        )}

        {/* 2H indicator — top-right */}
        {slotId === 'weapon' && is2H && (
          <div
            className="absolute top-0.5 right-0.5 text-[8px] font-bold px-0.5 py-0.5 rounded-sm pointer-events-none"
            style={{ color: '#c8a84b', background: 'rgba(0,0,0,0.8)' }}
          >
            2H
          </div>
        )}

        {/* Consumable badge — bottom-right */}
        {isConsumable && hasItem && (
          <div
            className="absolute bottom-0.5 right-0.5 text-[8px] font-bold px-0.5 py-0.5 rounded-sm pointer-events-none"
            style={{ color: '#6aaa6a', background: 'rgba(0,0,0,0.8)' }}
          >
            {slotId === 'potion' ? '⚗' : '🍖'}
          </div>
        )}
      </button>

      {/* Spec badge — bottom-left, clickable (combat slots only) */}
      {hasItem && !isConsumable && isCombatSlot && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowSlider((v) => !v); }}
          title={`Spéc: ${spec} / Cross: ${crossSpec ?? 0} — cliquer pour modifier`}
          className="absolute bottom-[22px] left-0.5 text-[9px] font-bold px-1 py-0.5 rounded-sm transition-colors hover:text-white"
          style={{ color: crossSpec !== undefined ? '#c8a84b' : '#6b7280', background: 'rgba(0,0,0,0.75)' }}
        >
          {spec}{crossSpec !== undefined ? ` ·${crossSpec}` : ''}
        </button>
      )}

      {/* Item name */}
      <span
        className="text-center leading-tight cursor-pointer hover:text-gray-200 transition-colors"
        style={{ fontSize: 9, color: hasItem ? '#9ca3af' : '#4b5563', maxWidth: 76 }}
        onClick={() => !isDisabled && onOpenPicker(slotId)}
        title={selectedItem ? itemLabel(selectedItem.id, lang, selectedItem.label) : undefined}
      >
        {hasItem
          ? (() => { const l = itemLabel(selectedItem.id, lang, selectedItem.label); return l.length > 12 ? l.slice(0, 11) + '…' : l; })()
          : slot.label}
      </span>
    </div>
  );
}

// ─── BuildConfig ──────────────────────────────────────────────────────────────

interface Props {
  selected: SelectedItems;
  is2H: boolean;
  specLevels: Partial<Record<SlotId, number>>;
  otherSpecBonuses: Partial<Record<SlotId, number>>;
  lang: 'en' | 'fr';
  onChange: (slotId: SlotId, itemId: string) => void;
  onSpecChange: (slotId: SlotId, spec: number) => void;
  onOtherSpecChange: (slotId: SlotId, v: number | undefined) => void;
}

export default function BuildConfig({ selected, is2H, specLevels, otherSpecBonuses, lang, onChange, onSpecChange, onOtherSpecChange }: Props) {
  const [pickerSlot, setPickerSlot] = useState<SlotId | null>(null);

  return (
    <>
      <div
        className="inline-grid gap-x-3 gap-y-2"
        style={{ gridTemplateColumns: 'repeat(3, 76px)' }}
      >
        {SLOT_GRID.map((slotId, i) =>
          slotId === null ? (
            <div key={i} />
          ) : (
            <SlotCard
              key={slotId}
              slotId={slotId}
              selected={selected}
              is2H={is2H}
              spec={specLevels[slotId] ?? 100}
              crossSpec={otherSpecBonuses[slotId]}
              lang={lang}
              onOpenPicker={setPickerSlot}
              onSpecChange={(v) => onSpecChange(slotId, v)}
              onCrossSpecChange={(v) => onOtherSpecChange(slotId, v)}
            />
          ),
        )}
      </div>

      {pickerSlot && (
        <ItemPicker
          slotId={pickerSlot}
          lang={lang}
          onSelect={(itemId) => onChange(pickerSlot, itemId)}
          onClose={() => setPickerSlot(null)}
        />
      )}
    </>
  );
}
