import { useState, useMemo, useEffect } from 'react';
import type { GlobalSettings, SelectedItems, SlotId } from './types';
import { collectItemIds, buildItemId } from './utils/itemIds';
import { calcAllTiers } from './utils/calculations';
import { usePrices } from './hooks/usePrices';
import { TIERS, ENCHANTS, SLOT_MAP, CONSUMABLE_SLOT_IDS } from './constants/slots';
import GlobalSettingsBar from './components/GlobalSettings';
import BuildConfig from './components/BuildConfig';
import TierTable from './components/TierTable';
import OverviewTable from './components/OverviewTable';

const STORAGE_KEY = 'albion-refine-session';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

const DEFAULT_SETTINGS: GlobalSettings = {
  city: 'Lymhurst',
  server: 'west',
  lang: 'en',
  mastery: 100,
  quality: 1,
  otherSpecBonus: 0,
};

function fmt(n: number): string {
  if (n === 0) return '—';
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n);
}

export default function App() {
  const saved = useMemo(() => loadSession(), []);

  const [settings, setSettings] = useState<GlobalSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...(saved?.settings ?? {}),
  }));
  const [selectedItems, setSelectedItems] = useState<SelectedItems>(saved?.selectedItems ?? {});
  const [specLevels, setSpecLevels] = useState<Partial<Record<SlotId, number>>>(saved?.specLevels ?? {});
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>(saved?.priceOverrides ?? {});

  // Persist session to localStorage on every relevant change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, selectedItems, specLevels, priceOverrides }));
  }, [settings, selectedItems, specLevels, priceOverrides]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
    setSelectedItems({});
    setSpecLevels({});
    setPriceOverrides({});
  };

  const is2H = selectedItems.weapon?.startsWith('2H_') ?? false;

  const handleItemChange = (slotId: SlotId, itemId: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (!itemId) {
        delete next[slotId];
      } else {
        next[slotId] = itemId;
        if (slotId === 'weapon' && itemId.startsWith('2H_')) {
          delete next.offhand;
        }
      }
      return next;
    });
  };

  const handleSpecChange = (slotId: SlotId, spec: number) => {
    setSpecLevels((prev) => ({ ...prev, [slotId]: spec }));
  };

  const itemIds = useMemo(
    () => collectItemIds(selectedItems, is2H, TIERS, ENCHANTS),
    [selectedItems, is2H],
  );

  const { prices, qualityFallbackIds, isLoading, isError, refetch, lastUpdated, isFallback } = usePrices(
    itemIds,
    settings.city,
    settings.quality,
    settings.server,
  );

  // Merge API prices with manual overrides (overrides win)
  const effectivePrices = useMemo(
    () => ({ ...prices, ...priceOverrides }),
    [prices, priceOverrides],
  );

  const handlePriceOverride = (itemId: string, price: number) => {
    setPriceOverrides((prev) => {
      const next = { ...prev };
      if (price <= 0) delete next[itemId];
      else next[itemId] = price;
      return next;
    });
  };

  const tierResults = useMemo(
    () => calcAllTiers(selectedItems, is2H, settings.mastery, settings.quality, specLevels, effectivePrices, settings.otherSpecBonus, qualityFallbackIds),
    [selectedItems, is2H, settings.mastery, settings.quality, specLevels, effectivePrices, settings.otherSpecBonus, qualityFallbackIds],
  );

  // Consumables: single price lookup (full IDs like T5_MEAL_OMELETTE)
  const consumableSlots = useMemo(() =>
    CONSUMABLE_SLOT_IDS
      .filter((sid) => selectedItems[sid])
      .map((sid) => {
        const slot = SLOT_MAP[sid];
        const itemId = selectedItems[sid]!;
        const itemDef = slot.items1H.find((i) => i.id === itemId);
        const price = /^T\d+_/.test(itemId)
          ? (effectivePrices[itemId] ?? 0)
          : (effectivePrices[buildItemId(itemId, 4, 0)] ?? 0);
        return { slotId: sid, label: slot.label, itemLabel: itemDef?.label ?? itemId, price };
      }),
  [selectedItems, effectivePrices]);

  const hasEquipment = Object.keys(selectedItems).some(
    (k) => !CONSUMABLE_SLOT_IDS.includes(k as SlotId) && selectedItems[k as SlotId],
  );
  const hasItems = Object.keys(selectedItems).some((k) => selectedItems[k as SlotId]);

  return (
    <div className="min-h-screen bg-albion-dark">
      {/* Header */}
      <header className="border-b border-albion-border px-4 py-3 flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-albion-gold font-bold text-lg leading-tight tracking-wide">
            Albion Forge
          </h1>
          <span className="text-gray-500 text-xs">Build Cost Calculator</span>
        </div>
        {isLoading && (
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            <span className="animate-spin">⟳</span> Chargement des prix…
          </div>
        )}
        {isError && (
          <button
            onClick={() => refetch()}
            className="ml-auto text-xs text-red-400 hover:text-red-300 border border-red-800 rounded px-2 py-1"
          >
            Erreur API — Réessayer
          </button>
        )}
        {!isLoading && !isError && hasItems && (
          <div className="ml-auto flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-500" title="Date de la dernière donnée de marché reçue">
                {new Date(lastUpdated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                {' à '}
                {new Date(lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {isFallback && (
                  <span className="ml-1 text-yellow-700/70" title="Certains prix viennent du prix min de vente, pas de l'historique"> · prix min</span>
                )}
              </span>
            )}
            <button
              onClick={() => refetch()}
              className="text-xs text-gray-500 hover:text-gray-300 border border-albion-border rounded px-2 py-1 transition-colors"
            >
              ↺ Actualiser
            </button>
            <button
              onClick={handleReset}
              className="text-xs text-red-800 hover:text-red-400 border border-red-900/50 rounded px-2 py-1 transition-colors"
              title="Réinitialiser le build et tous les paramètres"
            >
              ✕ Reset
            </button>
          </div>
        )}
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">
        <GlobalSettingsBar settings={settings} onChange={setSettings} />

        {/* Build configuration */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            Configuration du build
          </h2>
          <div className="flex justify-center">
            <BuildConfig
              selected={selectedItems}
              is2H={is2H}
              specLevels={specLevels}
              lang={settings.lang}
              onChange={handleItemChange}
              onSpecChange={handleSpecChange}
            />
          </div>
        </section>

        {/* Equipment results */}
        {hasEquipment && (
          <section className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-2xl mb-2">⟳</div>
                <div>Récupération des prix sur le marché…</div>
              </div>
            ) : (
              <>
                <OverviewTable tierResults={tierResults} />
                <h2 className="text-xs text-gray-500 uppercase tracking-widest pt-2">
                  Détail par tier
                </h2>
                {tierResults.map((result) => (
                  <TierTable
                    key={result.tier}
                    result={result}
                    lang={settings.lang}
                    priceOverrides={priceOverrides}
                    onPriceOverride={handlePriceOverride}
                  />
                ))}
              </>
            )}
          </section>
        )}

        {/* Consumables */}
        {consumableSlots.length > 0 && (
          <section>
            <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-2">Consommables</h2>
            <div className="bg-albion-card border border-albion-border rounded-lg overflow-hidden">
              <table className="w-full text-xs text-gray-300 border-collapse">
                <thead>
                  <tr className="border-b border-albion-border bg-albion-dark/60">
                    <th className="px-3 py-2 text-left text-gray-500">Slot</th>
                    <th className="px-3 py-2 text-left text-gray-500">Item</th>
                    <th className="px-3 py-2 text-right text-gray-500">Prix marché</th>
                  </tr>
                </thead>
                <tbody>
                  {consumableSlots.map((c, i) => (
                    <tr key={c.slotId} className={`border-b border-albion-border/40 ${i % 2 !== 0 ? 'bg-albion-dark/20' : ''}`}>
                      <td className="px-3 py-2 text-gray-500">{c.label}</td>
                      <td className="px-3 py-2 text-gray-300">{c.itemLabel}</td>
                      <td className={`px-3 py-2 text-right font-mono ${c.price > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                        {fmt(c.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!hasItems && (
          <div className="text-center py-16 text-gray-600">
            <div className="text-4xl mb-3">⚔</div>
            <p className="text-sm">Clique sur un slot pour sélectionner tes items</p>
          </div>
        )}
      </div>
    </div>
  );
}
