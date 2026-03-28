import { useMemo, useState } from 'react';
import type { TierResult, SlotId, Tier, Enchant, EnchantResult } from '../types';
import { AVERAGE_IP_SLOT_IDS } from '../constants/slots';
import { itemLabel } from '../i18n/fr';

const RENDER_BASE = 'https://render.albiononline.com/v1/item';

interface SlotOption {
  slotId: SlotId;
  tier: Tier;
  enchant: Enchant;
  ip: number;
  price: number;
  method: 'direct' | 'enchant';
  itemId: string;
  label: string;
  itemLabel: string;
  baseId: string;
}

function getBestPrice(e: EnchantResult): { price: number; method: 'direct' | 'enchant' } | null {
  const m = e.marketPrice > 0 ? e.marketPrice : null;
  const c = e.craftCost > 0 ? e.craftCost : null;
  if (m === null && c === null) return null;
  if (m !== null && (c === null || m <= c)) return { price: m, method: 'direct' };
  return { price: c!, method: 'enchant' };
}

function fmt(n: number): string {
  if (n === 0) return '—';
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n);
}

interface Props {
  tierResults: TierResult[];
  lang: 'en' | 'fr';
}

export default function IPTargetTab({ tierResults, lang }: Props) {
  const [targetIP, setTargetIP] = useState(1300);

  // Build all available (tier, enchant) options per slot, with their best price
  const optionsBySlot = useMemo(() => {
    const map = new Map<SlotId, SlotOption[]>();
    for (const result of tierResults) {
      for (const slot of result.slots) {
        if (!map.has(slot.slotId)) map.set(slot.slotId, []);
        for (const e of slot.enchants) {
          const best = getBestPrice(e);
          if (!best) continue;
          map.get(slot.slotId)!.push({
            slotId: slot.slotId,
            tier: result.tier,
            enchant: e.enchant,
            ip: e.ip,
            price: best.price,
            method: best.method,
            itemId: e.itemId,
            label: slot.label,
            itemLabel: slot.itemLabel,
            baseId: slot.baseId,
          });
        }
      }
    }
    // Sort cheapest first so initialisation picks the cheapest option
    for (const opts of map.values()) opts.sort((a, b) => a.price - b.price);
    return map;
  }, [tierResults]);

  // Greedy optimisation: find cheapest combination reaching targetIP
  const optimResult = useMemo(() => {
    if (optionsBySlot.size === 0) return null;

    // Start: cheapest option per slot
    const chosen = new Map<SlotId, SlotOption>();
    for (const [slotId, opts] of optionsBySlot) {
      if (opts.length > 0) chosen.set(slotId, opts[0]);
    }

    const avgIPSlotIds = [...chosen.keys()].filter((s) => AVERAGE_IP_SLOT_IDS.includes(s));
    const computeAvgIP = () => {
      if (avgIPSlotIds.length === 0) return 0;
      return Math.round(
        avgIPSlotIds.reduce((s, id) => s + (chosen.get(id)?.ip ?? 0), 0) / avgIPSlotIds.length,
      );
    };

    // Greedy: at each step, pick the upgrade with the best IP-gain/cost ratio
    let iters = 0;
    while (computeAvgIP() < targetIP && iters++ < 1000) {
      let bestRatio = -Infinity;
      let bestSlot: SlotId | null = null;
      let bestOpt: SlotOption | null = null;

      for (const [slotId, cur] of chosen) {
        // Only upgrade slots that contribute to avgIP
        if (!AVERAGE_IP_SLOT_IDS.includes(slotId)) continue;
        for (const opt of optionsBySlot.get(slotId) ?? []) {
          const dIP = opt.ip - cur.ip;
          if (dIP <= 0) continue;
          const dCost = opt.price - cur.price;
          // ratio: IP gained per silver — higher is better; free upgrade = ∞
          const ratio = dCost <= 0 ? Infinity : dIP / dCost;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestSlot = slotId;
            bestOpt = opt;
          }
        }
      }

      if (!bestSlot || !bestOpt) break; // No more upgrades available
      chosen.set(bestSlot, bestOpt);
    }

    return { chosen, avgIP: computeAvgIP() };
  }, [optionsBySlot, targetIP]);

  const isEmpty = tierResults.every((r) => r.slots.length === 0);

  if (isEmpty) {
    return (
      <div className="text-center py-16 text-gray-600">
        <div className="text-3xl mb-3">🎯</div>
        <p className="text-sm">Configure ton build dans l'onglet <span className="text-gray-400">Configuration</span> pour utiliser l'optimiseur IP</p>
      </div>
    );
  }

  const entries = optimResult ? [...optimResult.chosen.entries()] : [];
  const totalCost = entries.reduce((s, [, o]) => s + o.price, 0);
  const achieved = optimResult?.avgIP ?? 0;
  const reached = achieved >= targetIP;
  const maxPossible = optimResult
    ? (() => {
        const ids = [...optimResult.chosen.keys()].filter((s) => AVERAGE_IP_SLOT_IDS.includes(s));
        return Math.round(
          ids.reduce((s, slotId) => {
            const opts = optionsBySlot.get(slotId) ?? [];
            const max = opts.reduce((m, o) => (o.ip > m ? o.ip : m), 0);
            return s + max;
          }, 0) / (ids.length || 1),
        );
      })()
    : 0;

  return (
    <div className="space-y-3">
      {/* Target input bar */}
      <div className="bg-albion-card border border-albion-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-4">
        <span className="text-albion-gold font-bold text-sm">🎯 Objectif IP</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={3000}
            step={10}
            value={targetIP}
            onChange={(e) => setTargetIP(Math.max(0, Number(e.target.value)))}
            className="w-24 bg-albion-dark border border-albion-border rounded px-2 py-1 text-gray-200 text-sm text-center focus:outline-none focus:border-albion-gold/60"
          />
          <span className="text-gray-500 text-xs">IP moyen cible</span>
        </div>

        {optimResult && (
          <div className="ml-auto flex items-center gap-4 flex-wrap">
            {!reached && maxPossible < targetIP && (
              <span className="text-red-400 text-xs">
                Max atteignable : {maxPossible} IP (données insuffisantes)
              </span>
            )}
            <span className={`text-sm font-semibold ${reached ? 'text-green-400' : 'text-amber-400'}`}>
              {reached ? '✓' : '⚠'} IP obtenu : {achieved}
            </span>
            <span className="text-gray-400 text-sm">
              Coût total : <span className="text-albion-gold font-semibold">{fmt(totalCost)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Result table */}
      {optimResult && entries.length > 0 && (
        <div className="bg-albion-card border border-albion-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-albion-dark border-b border-albion-border">
            <span className="text-gray-500 text-xs">
              Meilleure combinaison pour atteindre{' '}
              <span className="text-albion-gold">{targetIP} IP</span>{' '}
              au coût minimum · les slots bag/cape sont laissés au moins cher (n'affectent pas l'IP moyen)
            </span>
          </div>

          <table className="w-full text-xs text-gray-300 border-collapse">
            <thead>
              <tr className="border-b border-albion-border bg-albion-dark/60 text-gray-500">
                <th className="px-3 py-2 text-left">Slot / Item</th>
                <th className="px-3 py-2 text-center text-albion-gold/80">Tier · Enchant</th>
                <th className="px-3 py-2 text-center">IP</th>
                <th className="px-3 py-2 text-center">Prix</th>
                <th className="px-3 py-2 text-center">Méthode</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([slotId, opt], i) => {
                const isIPSlot = AVERAGE_IP_SLOT_IDS.includes(slotId);
                return (
                  <tr
                    key={slotId}
                    className={`border-b border-albion-border/50 ${i % 2 !== 0 ? 'bg-albion-dark/20' : ''} ${!isIPSlot ? 'opacity-60' : ''}`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={`${RENDER_BASE}/${opt.itemId}.png?quality=1`}
                          alt=""
                          className="w-7 h-7 object-contain flex-shrink-0 opacity-80"
                          onError={(ev) => { (ev.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div>
                          <div className="font-medium text-gray-200">
                            {opt.label}
                            {!isIPSlot && <span className="ml-1 text-gray-600 font-normal text-[10px]">(hors IP moy.)</span>}
                          </div>
                          <div className="text-gray-500 truncate max-w-[10rem]">
                            {itemLabel(opt.baseId, lang, opt.itemLabel)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="font-bold text-albion-gold/90">T{opt.tier}</span>
                      <span className="text-gray-500">.{opt.enchant}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-gray-400">{opt.ip}</td>
                    <td className="px-3 py-2 text-center font-mono text-gray-200">{fmt(opt.price)}</td>
                    <td className="px-3 py-2 text-center">
                      {opt.method === 'enchant'
                        ? <span className="text-green-500 text-[10px]">enchant</span>
                        : <span className="text-gray-500 text-[10px]">direct</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-albion-border bg-albion-dark/80 font-semibold">
                <td className="px-3 py-2.5 text-albion-gold/80 text-xs uppercase tracking-wide">Full set</td>
                <td className="px-3 py-2.5 text-center text-gray-400 font-mono text-xs">{achieved} IP moy.</td>
                <td />
                <td className="px-3 py-2.5 text-center text-gray-200 font-mono">{fmt(totalCost)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
