import { Fragment, useState } from 'react';
import type { TierResult, Enchant, EnchantResult } from '../types';
import { itemLabel } from '../i18n/fr';

const RENDER_BASE = 'https://render.albiononline.com/v1/item';

interface Props {
  result: TierResult;
  lang: 'en' | 'fr';
  priceOverrides: Record<string, number>;
  onPriceOverride: (itemId: string, price: number) => void;
}

function fmt(n: number): string {
  if (n === 0) return '—';
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n);
}

function EcoCell({ economy, craftCost }: { economy: number; craftCost: number }) {
  if (craftCost === 0) return <td className="px-2 py-1.5 text-gray-700 text-center">—</td>;
  const color = economy > 0 ? 'text-green-400' : economy < 0 ? 'text-red-400' : 'text-gray-500';
  return (
    <td className={`px-2 py-1.5 text-center font-medium ${color}`}>
      {economy > 0 ? '+' : ''}{fmt(economy)}
    </td>
  );
}

// Columns: 1 (slot) + 2 (IP + .0 prix) + 3×3 (.1/.2/.3) = 12

export default function TierTable({ result, lang, priceOverrides, onPriceOverride }: Props) {
  if (result.slots.length === 0) return null;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editMarketPrice, setEditMarketPrice] = useState(0);

  const startEdit = (e: EnchantResult) => {
    const cur = e.itemId in priceOverrides ? priceOverrides[e.itemId] : e.marketPrice;
    setEditValue(cur > 0 ? String(cur) : '');
    setEditingId(e.itemId);
    setEditMarketPrice(e.marketPrice);
  };

  const commitEdit = (itemId: string) => {
    const val = parseInt(editValue.replace(/[\s,]/g, ''), 10);
    const effective = isNaN(val) ? 0 : val;
    // If the typed value matches the market price, clear any override instead of storing one
    onPriceOverride(itemId, effective === editMarketPrice ? 0 : effective);
    setEditingId(null);
  };

  const renderPriceCell = (e: EnchantResult, borderLeft = false) => {
    const isOverride = e.itemId in priceOverrides;
    const displayPrice = isOverride ? priceOverrides[e.itemId] : e.marketPrice;
    const borderCls = borderLeft ? 'border-l border-albion-border' : '';

    if (editingId === e.itemId) {
      return (
        <td className={`px-1 py-1 text-center ${borderCls}`}>
          <input
            type="number"
            autoFocus
            value={editValue}
            onChange={(ev) => setEditValue(ev.target.value)}
            onBlur={() => commitEdit(e.itemId)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') commitEdit(e.itemId);
              if (ev.key === 'Escape') setEditingId(null);
            }}
            className="w-20 bg-albion-dark border border-albion-gold text-albion-gold text-center text-xs rounded px-1 py-0.5 focus:outline-none"
          />
        </td>
      );
    }

    return (
      <td
        className={`px-2 py-1.5 text-center cursor-pointer select-none group ${borderCls} ${
          isOverride ? 'text-albion-gold' : e.available ? 'text-gray-200' : 'text-gray-600'
        }`}
        onClick={() => startEdit(e)}
        title="Clic pour saisir un prix manuellement"
      >
        {e.qualityFallback && !isOverride && (
          <span className="text-gray-600 mr-0.5" title="Prix d'une qualité inférieure (données insuffisantes)">~</span>
        )}
        {fmt(displayPrice)}
        {isOverride && (
          <button
            className="ml-1 text-gray-600 hover:text-red-400 text-[10px] leading-none"
            onClick={(ev) => { ev.stopPropagation(); onPriceOverride(e.itemId, 0); }}
            title="Réinitialiser au prix du marché"
          >×</button>
        )}
        {!isOverride && (
          <span className="ml-1 text-gray-700 opacity-0 group-hover:opacity-100 text-[10px] pointer-events-none">✎</span>
        )}
      </td>
    );
 };

  const totalMat = result.totalMats.runes;

  return (
    <div className="bg-albion-card border border-albion-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-albion-dark border-b border-albion-border flex items-center gap-3">
        <span className="text-albion-gold font-bold text-sm">T{result.tier}</span>
        {result.totals[0].avgIP > 0 && (
          <span className="text-gray-500 text-xs">
            IP moy. du set : {result.totals[0].avgIP} → {result.totals[3].avgIP}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-gray-300 border-collapse">
          <thead>
            {/* Row 1 — enchant group headers */}
            <tr className="border-b border-albion-border">
              <th className="px-3 py-2 text-left text-gray-500 w-32" rowSpan={2}>Slot / Item</th>
              <th className="px-2 py-2 text-center text-gray-500 border-l border-albion-border" rowSpan={2}>IP</th>
              <th className="px-2 py-2 text-center border-l border-albion-border text-albion-gold/70">
                .0
              </th>
              {([1, 2, 3] as Enchant[]).map((e) => (
                <th key={e} colSpan={3} className="px-2 py-2 text-center border-l border-albion-border text-albion-gold/70">
                  .{e} <span className="text-gray-600 font-normal text-[10px]">(+{e * 100} IP)</span>
                </th>
              ))}
            </tr>
            {/* Row 2 — sub-column labels */}
            <tr className="border-b border-albion-border bg-albion-dark/40 text-gray-500">
              <th className="px-2 py-1.5 text-center border-l border-albion-border">Prix direct</th>
              {([1, 2, 3] as Enchant[]).map((e) => (
                <Fragment key={e}>
                  <th className="px-2 py-1.5 text-center border-l border-albion-border">Prix direct</th>
                  <th className="px-2 py-1.5 text-center">
                    Revient à
                    <div className="text-[9px] font-normal text-gray-600">depuis .0</div>
                  </th>
                  <th className="px-2 py-1.5 text-center text-green-700/80">Économie</th>
                </Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {result.slots.map((slot, si) => {
              const e0 = slot.enchants[0];
              return (
                <tr
                  key={slot.slotId}
                  className={`border-b border-albion-border/50 ${si % 2 !== 0 ? 'bg-albion-dark/20' : ''} hover:bg-albion-card-hover transition-colors`}
                >
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={`${RENDER_BASE}/${slot.enchants[0].itemId}.png?quality=1`}
                        alt=""
                        className="w-7 h-7 object-contain flex-shrink-0 opacity-80"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <div className="font-medium text-gray-200">{slot.label}</div>
                        <div className="text-gray-500 truncate max-w-[7rem]" title={itemLabel(slot.baseId, lang, slot.itemLabel)}>
                          {itemLabel(slot.baseId, lang, slot.itemLabel)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* IP (.0 base for this slot) */}
                  <td className="px-2 py-1.5 text-center text-gray-500 border-l border-albion-border font-mono">
                    {e0.ip}
                  </td>

                  {/* .0 — prix direct */}
                  {renderPriceCell(e0, true)}

                  {/* .1 / .2 / .3 */}
                  {([1, 2, 3] as Enchant[]).map((enchant) => {
                    const e = slot.enchants[enchant];
                    return (
                      <Fragment key={enchant}>
                        {renderPriceCell(e, true)}
                        <td className={`px-2 py-1.5 text-center ${e.craftCost > 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                          {fmt(e.craftCost)}
                        </td>
                        <EcoCell economy={e.economy} craftCost={e.craftCost} />
                      </Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            {/* Total set row */}
            <tr className="border-t-2 border-albion-border bg-albion-dark/80 font-semibold">
              <td className="px-3 py-2.5 text-albion-gold/80 text-xs uppercase tracking-wide">Full set</td>
              {/* IP total (.0) */}
              <td className="px-2 py-2.5 text-center text-gray-500 border-l border-albion-border font-mono">
                {result.totals[0].totalIP}
              </td>
              {/* .0 */}
              {(() => {
                const t = result.totals[0];
                return (
                  <td className="px-2 py-2.5 text-center border-l border-albion-border text-gray-200">
                    {!t.available && t.market > 0 && <span className="text-gray-500 mr-0.5" title="Coût incomplet — prix manquants pour certains items">≈</span>}
                    {t.market > 0 ? fmt(t.market) : '—'}
                  </td>
                );
              })()}
              {([1, 2, 3] as Enchant[]).map((e) => {
                const t = result.totals[e];
                const eco = t.market > 0 && t.craft > 0 ? t.market - t.craft : 0;
                return (
                  <Fragment key={e}>
                    <td className="px-2 py-2.5 text-center border-l border-albion-border text-gray-200">
                      {!t.available && t.market > 0 && <span className="text-gray-500 mr-0.5" title="Coût incomplet — prix manquants pour certains items">≈</span>}
                      {t.market > 0 ? fmt(t.market) : '—'}
                    </td>
                    <td className="px-2 py-2.5 text-center text-gray-300">
                      {t.craft > 0 ? fmt(t.craft) : '—'}
                    </td>
                    <td className={`px-2 py-2.5 text-center font-bold ${eco > 0 ? 'text-green-400' : eco < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                      {eco !== 0 ? `${eco > 0 ? '+' : ''}${fmt(eco)}` : '—'}
                    </td>
                  </Fragment>
                );
              })}
            </tr>

            {/* Mats per enchant step */}
            {totalMat > 0 && (
              <tr className="border-t border-albion-border/30 bg-albion-dark/40">
                <td className="px-3 py-1.5 text-gray-600 text-[10px]">Mats enchant</td>
                <td className="px-2 py-1.5 border-l border-albion-border" />
                {/* .0 — no mats */}
                <td className="px-2 py-1.5 border-l border-albion-border" />
                {/* .1 — runes */}
                <td colSpan={3} className="px-2 py-1.5 border-l border-albion-border">
                  <span className="text-gray-600 text-[10px]">
                    <span className="text-gray-400">{totalMat}</span> runes
                  </span>
                </td>
                {/* .2 — runes + âmes */}
                <td colSpan={3} className="px-2 py-1.5 border-l border-albion-border">
                  <span className="text-gray-600 text-[10px]">
                    <span className="text-gray-400">{totalMat}</span> r. + <span className="text-gray-400">{totalMat}</span> âmes
                  </span>
                </td>
                {/* .3 — tout */}
                <td colSpan={3} className="px-2 py-1.5 border-l border-albion-border">
                  <span className="text-gray-600 text-[10px]">
                    <span className="text-gray-400">{totalMat}</span> r. + <span className="text-gray-400">{totalMat}</span> â. + <span className="text-gray-400">{totalMat}</span> rel.
                  </span>
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );
}
