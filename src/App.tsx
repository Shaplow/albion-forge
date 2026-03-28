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
import IPTargetTab from './components/IPTargetTab';

type TabId = 'resultats' | 'ip-cible' | 'consommables';

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
  const [activeTab, setActiveTab] = useState<TabId>('resultats');

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

  const tabs: { id: TabId; label: string }[] = [
    ...(hasEquipment ? [
      { id: 'resultats' as TabId, label: 'Analyse des coûts' },
      { id: 'ip-cible' as TabId, label: 'Objectif IP' },
    ] : []),
    ...(consumableSlots.length > 0 ? [
      { id: 'consommables' as TabId, label: 'Consommables' },
    ] : []),
  ];

  // Drop back to first tab if the active tab becomes unavailable
  useEffect(() => {
    if ((activeTab === 'ip-cible') && !hasEquipment) setActiveTab('resultats');
    if (activeTab === 'consommables' && consumableSlots.length === 0) setActiveTab('resultats');
  }, [activeTab, hasEquipment, consumableSlots.length]);

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

      {/* Settings bar */}
      <div className="border-b border-albion-border bg-albion-dark/80 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto">
          <GlobalSettingsBar settings={settings} onChange={setSettings} />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-4">

        {/* Build config — always visible */}
        <div className="flex justify-center py-2">
          <BuildConfig
            selected={selectedItems}
            is2H={is2H}
            specLevels={specLevels}
            lang={settings.lang}
            onChange={handleItemChange}
            onSpecChange={handleSpecChange}
          />
        </div>

        {!hasItems && (
          <div className="text-center py-12 text-gray-600">
            <div className="text-4xl mb-3">⚔</div>
            <p className="text-sm">Clique sur un slot pour sélectionner tes items</p>
          </div>
        )}

        {/* Tab bar + légende contextuelle — centré, épuré */}
        {(hasEquipment || consumableSlots.length > 0) && (
          <div className="flex flex-col items-center gap-4 py-4">

            {/* Pills de navigation */}
            <nav className="flex items-center gap-1 bg-albion-dark/60 border border-albion-border rounded-full px-1.5 py-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-albion-gold/15 text-albion-gold border border-albion-gold/30'
                      : 'text-gray-500 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Légende contextuelle selon l'onglet */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-gray-600 min-h-[1.5rem]">
              {activeTab === 'resultats' && (<>
                <span><span className="text-green-500 font-medium">enchant</span> = acheter le .0 et enchanter coûte moins cher</span>
                <span className="text-gray-700">·</span>
                <span><span className="text-gray-400 font-medium">direct</span> = acheter l'item déjà enchanté est préférable</span>
                <span className="text-gray-700">·</span>
                <span><span className="text-yellow-600 font-bold">↓</span> = prix d'une qualité inférieure (qualité demandée indisponible)</span>
                <span className="text-gray-700">·</span>
                <span><span className="text-amber-500/80">⚠ N manquants</span> = items sans prix direct, total partiel</span>
                <span className="text-gray-700">·</span>
                <span>Prix absent ? <span className="text-gray-500 underline underline-offset-2 decoration-dotted cursor-help">cliquer sur la cellule</span> dans le détail pour le saisir</span>
              </>)}
              {activeTab === 'ip-cible' && (<>
                <span>Entre l'<span className="text-albion-gold font-medium">IP moyen cible</span> et l'algo trouve la combo tier·enchant la moins chère pour l'atteindre</span>
                <span className="text-gray-700">·</span>
                <span>Le <span className="text-gray-500">bag</span> ne compte pas dans l'IP moyen — laissé au moins cher</span>
                <span className="text-gray-700">·</span>
                <span>Optimisation basée sur les prix disponibles — saisir des prix manquants dans <span className="text-gray-500 underline underline-offset-2 decoration-dotted">Analyse des coûts</span> améliore les résultats</span>
              </>)}
              {activeTab === 'consommables' && (<>
                <span>Prix récupérés en <span className="text-gray-400 font-medium">Normal (Q1)</span> — les consommables n'existent qu'en qualité normale</span>
                <span className="text-gray-700">·</span>
                <span>Les consommables <span className="text-gray-500">n'affectent pas</span> l'IP du personnage</span>
              </>)}
            </div>

          </div>
        )}

        {/* Tab content */}
        {/* 📊 Analyse des coûts */}
        {activeTab === 'resultats' && hasEquipment && (
          <section className="space-y-5">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-2xl mb-2">⟳</div>
                <div>Récupération des prix sur le marché…</div>
              </div>
            ) : (
              <>
                <OverviewTable tierResults={tierResults} />
                <h2 className="text-xs text-gray-500 uppercase tracking-widest pt-4">
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

        {/* 🎯 Objectif IP */}
        {activeTab === 'ip-cible' && (
          <IPTargetTab tierResults={tierResults} lang={settings.lang} />
        )}

        {/* 🍖 Consommables */}
        {activeTab === 'consommables' && (
          <section>
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

      </div>
    </div>
  );
}
