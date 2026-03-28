export type SlotId = 'head' | 'armor' | 'feet' | 'weapon' | 'offhand' | 'bag' | 'cape' | 'potion' | 'food';
export type Tier = 4 | 5 | 6 | 7 | 8;
export type Enchant = 0 | 1 | 2 | 3;

export interface ItemDef {
  id: string;      // base ID without tier prefix, e.g. "HEAD_LEATHER_SET1"
  label: string;
  category: string; // e.g. 'Tissu' | 'Cuir' | 'Plaque' | 'Épée' | etc.
}

export interface SlotDef {
  id: SlotId;
  label: string;
  matCount1H: number; // rune count in 1H mode (or for non-weapon slots)
  matCount2H: number; // rune count in 2H mode (weapon slot: 288+96, others same)
  isConsumable?: boolean; // potions/food — direct price only, no enchant calc
  items1H: ItemDef[];
  items2H: ItemDef[]; // weapon slot uses this list in 2H mode; other slots = same as items1H
}

export interface GlobalSettings {
  city: string;
  server: 'west' | 'east';
  lang: 'en' | 'fr';
  mastery: number;    // 0-100, default 100
  quality: 1 | 2 | 3 | 4 | 5;
  otherSpecBonus: number;
}

export type SelectedItems = Partial<Record<SlotId, string>>;

// API response types
export interface ApiPriceEntry {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}

export interface ApiHistoryEntry {
  location: string;
  item_id: string;
  quality: number;
  data: { item_count: number; avg_price: number; timestamp: string }[];
}

export type PriceMap = Record<string, number>; // item_id -> price (0 = unavailable)

// Calculation result types
export interface EnchantResult {
  enchant: Enchant;
  itemId: string;      // full API ID, e.g. "T5_MAIN_RAPIER_MORGANA@2"
  ip: number;
  marketPrice: number;
  craftCost: number;   // cost to craft from .0 base; 0 if base price unknown
  economy: number;     // marketPrice - craftCost (positive = craft saves money)
  available: boolean;  // false if marketPrice is 0
  qualityFallback: boolean; // true if price resolved from a lower quality than requested
}

export interface SlotResult {
  slotId: SlotId;
  label: string;
  baseId: string;    // item base ID without tier/enchant, e.g. "MAIN_RAPIER_MORGANA"
  itemLabel: string; // English label from slots.ts (use itemLabel() for localised)
  matCount: number;
  enchants: EnchantResult[];
}

export interface TierResult {
  tier: Tier;
  slots: SlotResult[];
  totalMats: { runes: number; souls: number; relics: number };
  totals: Record<Enchant, { market: number; craft: number; available: boolean; totalIP: number; avgIP: number }>;
}
