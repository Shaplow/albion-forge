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
  craftBetter: boolean;
  available: boolean;
}

export default function OverviewTable({ tierResults }: Props) {
  if (tierResults.length === 0 || tierResults.every((r) => r.slots.length === 0)) return null;

  const cells: CellData[] = [];
  for (const result of tierResults) {
    for (const enchant of ENCHANTS) {
      const t = result.totals[enchant];
      const ip = t.avgIP;
      const available = t.available;
      const craftBetter = t.craft > 0 && t.market > 0 && t.craft < t.market;
      const best = t.craft > 0 && t.market > 0
        ? Math.min(t.market, t.craft)
        : t.market || t.craft;
      cells.push({ tier: result.tier, enchant, ip, market: t.market, craft: t.craft, best, craftBetter, available });
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
                            {!c.available && <span className="text-gray-500 mr-0.5 font-normal text-xs" title="Coût incomplet — prix manquants pour certains items">≈</span>}
                            {fmt(c.best)}
                          </span>
                          {c.craftBetter ? (
                            <span className="text-green-500 text-[9px] leading-none">enchant</span>
                          ) : c.craft > 0 && c.market > 0 ? (
                            <span className="text-gray-600 text-[9px] leading-none">direct</span>
                          ) : null}
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
