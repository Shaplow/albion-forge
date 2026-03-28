import type { TierResult, Tier, Enchant } from '../types';

interface Props {
  tierResults: TierResult[];
}

const ENCHANTS: Enchant[] = [0, 1, 2, 3];
const ENCHANT_LABEL: Record<Enchant, string> = { 0: '.0', 1: '.1', 2: '.2', 3: '.3' };

function fmt(n: number): string {
  if (n === 0) return '—';
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n);
}

interface CellData {
  tier: Tier;
  enchant: Enchant;
  ip: number;
  market: number;
  craft: number;
  best: number;
  label: 'enchant' | 'direct' | null;
  available: boolean; // best comes from complete data
  missingMarket: number;
}

export default function OverviewTable({ tierResults }: Props) {
  if (tierResults.length === 0 || tierResults.every((r) => r.slots.length === 0)) return null;

  const cells: CellData[] = [];
  for (const result of tierResults) {
    for (const enchant of ENCHANTS) {
      const t = result.totals[enchant];
      const ip = t.avgIP;
      // A market total is only reliable if ALL items have a direct price
      const marketOk = t.available && t.market > 0;
      // A craft total is only reliable if ALL items have a craft cost (n/a for .0)
      const craftOk = t.craftComplete && t.craft > 0;

      let best: number;
      let label: 'enchant' | 'direct' | null;
      let available: boolean;

      if (marketOk && craftOk) {
        if (t.craft <= t.market) { best = t.craft; label = 'enchant'; }
        else                     { best = t.market; label = 'direct'; }
        available = true;
      } else if (marketOk) {
        best = t.market; label = enchant === 0 ? null : 'direct'; available = true;
      } else if (craftOk) {
        // Market is incomplete — use enchant cost as the reliable figure
        best = t.craft; label = 'enchant'; available = true;
      } else {
        // Neither complete: show best partial data, still show label for guidance (⚠ badge warns)
        if (t.market > 0 && t.craft > 0) {
          if (t.craft <= t.market) { best = t.craft; label = 'enchant'; }
          else                     { best = t.market; label = 'direct'; }
        } else {
          best = t.market || t.craft;
          label = enchant === 0 ? null : t.craft > 0 ? 'enchant' : t.market > 0 ? 'direct' : null;
        }
        available = false;
      }

      cells.push({ tier: result.tier, enchant, ip, market: t.market, craft: t.craft, best, label, available, missingMarket: t.missingMarket });
    }
  }

  const cellMap = new Map(cells.map((c) => [`${c.tier}-${c.enchant}`, c]));

  return (
    <div className="bg-albion-card border border-albion-border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-albion-dark border-b border-albion-border">
        <span className="text-albion-gold font-bold text-sm">Vue d'ensemble</span>
        <span className="ml-2 text-gray-500 text-xs">Coût du full set · meilleur prix direct ou enchant</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-albion-border bg-albion-dark/60">
              <th className="px-4 py-2 text-left text-gray-500 w-16">Tier</th>
              {ENCHANTS.map((e) => (
                <th key={e} className="px-4 py-2 text-center text-albion-gold/80 border-l border-albion-border/40">
                  {ENCHANT_LABEL[e]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tierResults.map((result, ri) => (
              <tr
                key={result.tier}
                className={`border-b border-albion-border/50 ${ri % 2 !== 0 ? 'bg-albion-dark/20' : ''}`}
              >
                <td className="px-4 py-2.5 font-bold text-albion-gold/70 text-sm">T{result.tier}</td>
                {ENCHANTS.map((enchant) => {
                  const c = cellMap.get(`${result.tier}-${enchant}`)!;
                  const hasData = c.best > 0;

                  return (
                    <td
                      key={enchant}
                      className="px-4 py-2.5 text-center border-l border-albion-border/40"
                    >
                      {hasData ? (
                        <div className="inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5">
                          <span className="text-gray-500 text-[10px] leading-none">{c.ip.toLocaleString('fr-FR')} IP</span>
                          <span className="font-semibold text-sm leading-none text-gray-200">
                            {fmt(c.best)}
                          </span>
                          {c.label === 'enchant' ? (
                            <span className="text-green-500 text-[9px] leading-none">enchant</span>
                          ) : c.label === 'direct' ? (
                            <span className="text-gray-600 text-[9px] leading-none">direct</span>
                          ) : null}
                          {c.missingMarket > 0 && (
                            <span
                              className="mt-0.5 text-[9px] leading-none text-amber-500/80 flex items-center gap-0.5"
                              title={`${c.missingMarket} item${c.missingMarket > 1 ? 's' : ''} sans prix direct`}
                            >
                              ⚠ {c.missingMarket} manquant{c.missingMarket > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-1.5 border-t border-albion-border/30 bg-albion-dark/40 flex items-center gap-4 text-[10px] text-gray-600">
        <span><span className="text-green-500">enchant</span> = acheter le .0 et enchanter coûte moins cher</span>
        <span><span className="text-gray-500">direct</span> = acheter l'item déjà enchanté est préférable</span>
      </div>
    </div>
  );
}
