import type { Tier, Enchant, SlotId, SlotResult, TierResult, EnchantResult, PriceMap } from '../types';
import { buildItemId, materialId, getMatCount } from './itemIds';
import { SLOT_MAP, TIERS, ENCHANTS, CONSUMABLE_SLOT_IDS, COMBAT_SPEC_SLOT_IDS, AVERAGE_IP_SLOT_IDS } from '../constants/slots';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Mastery modifier applied to raw spec bonus per tier (T4 = no extra amplification). */
const TIER_MULTIPLIER: Record<Tier, number> = {
  4: 1.00,
  5: 1.05,
  6: 1.10,
  7: 1.15,
  8: 1.20,
};

/** Flat IP bonus per quality level. */
export const QUALITY_IP: Record<number, number> = {
  1: 0,   // Normal
  2: 20,  // Good
  3: 40,  // Outstanding
  4: 60,  // Excellent
  5: 100, // Masterpiece
};

/** Quality labels for UI. */
export const QUALITY_LABELS: Record<number, string> = {
  1: 'Normal',
  2: 'Good',
  3: 'Outstanding',
  4: 'Excellent',
  5: 'Masterpiece',
};

// ─── IP Formula ───────────────────────────────────────────────────────────────

/**
 * Compute the spec IP bonus for a given slot.
 * bonusBrut = mastery × 0.2 + spec × 2 + otherSpecBonus
 * final = floor(bonusBrut × TIER_MULTIPLIER[tier])
 */
export function calcSpecIP(mastery: number, spec: number, tier: Tier, otherSpecBonus = 0): number {
  const raw = mastery * 0.2 + spec * 2 + otherSpecBonus;
  return Math.floor(raw * TIER_MULTIPLIER[tier]);
}

/**
 * Total IP for a slot at a given tier + enchant.
 * base = 300 + tier×100 + enchant×100
 * + spec bonus (tier-amplified) + quality bonus
 */
export function calcIP(
  tier: Tier,
  enchant: Enchant,
  mastery: number,
  spec: number,
  quality: number,
  otherSpecBonus = 0,
): number {
  return (
    300 +
    tier * 100 +
    enchant * 100 +
    calcSpecIP(mastery, spec, tier, otherSpecBonus) +
    (QUALITY_IP[quality] ?? 0)
  );
}

// ─── Craft Cost ───────────────────────────────────────────────────────────────

/**
 * Craft cost to produce an enchanted item from a .0 base.
 *   enchant=0 → basePrice  (no materials)
 *   enchant=1 → basePrice + matCount × runePrice
 *   enchant=2 → basePrice + matCount × (runePrice + soulPrice)
 *   enchant=3 → basePrice + matCount × (runePrice + soulPrice + relicPrice)
 */
export function calcCraftCost(
  basePrice: number,
  matCount: number,
  runePrice: number,
  soulPrice: number,
  relicPrice: number,
  enchant: Enchant,
): number {
  if (enchant === 0) return basePrice;
  const matCost =
    runePrice +
    (enchant >= 2 ? soulPrice : 0) +
    (enchant >= 3 ? relicPrice : 0);
  return basePrice + matCount * matCost;
}

// ─── Per-slot Calculation ─────────────────────────────────────────────────────

function calcSlotTier(
  slotId: SlotId,
  baseId: string,
  tier: Tier,
  is2H: boolean,
  mastery: number,
  spec: number,
  quality: number,
  prices: PriceMap,
  otherSpecBonus = 0,
  qualityFallbackIds: Set<string> = new Set(),
): { matCount: number; enchants: EnchantResult[] } {
  const matCount = getMatCount(slotId, is2H);

  const basePrice = prices[buildItemId(baseId, tier, 0)] ?? 0;
  const runePrice = prices[materialId('RUNE', tier)] ?? 0;
  const soulPrice = prices[materialId('SOUL', tier)] ?? 0;
  const relicPrice = prices[materialId('RELIC', tier)] ?? 0;

  const enchants: EnchantResult[] = ENCHANTS.map((enchant) => {
    const marketPrice = prices[buildItemId(baseId, tier, enchant)] ?? 0;
    const craftCost =
      basePrice > 0
        ? calcCraftCost(basePrice, matCount, runePrice, soulPrice, relicPrice, enchant)
        : 0;
    const economy = marketPrice > 0 && craftCost > 0 ? marketPrice - craftCost : 0;
    return {
      enchant,
      itemId: buildItemId(baseId, tier, enchant),
      ip: calcIP(tier, enchant, mastery, spec, quality, otherSpecBonus),
      marketPrice,
      craftCost,
      economy,
      available: marketPrice > 0,
      qualityFallback: qualityFallbackIds.has(buildItemId(baseId, tier, enchant)),
    };
  });

  return { matCount, enchants };
}

// ─── Tier-level Aggregation ───────────────────────────────────────────────────

export function calcTierResult(
  selectedItems: Partial<Record<SlotId, string>>,
  is2H: boolean,
  mastery: number,
  quality: number,
  specLevels: Partial<Record<SlotId, number>>,
  tier: Tier,
  prices: PriceMap,
  otherSpecBonus = 0,
  qualityFallbackIds: Set<string> = new Set(),
): TierResult {
  const slots: SlotResult[] = [];

  for (const [slotId, baseId] of Object.entries(selectedItems) as [SlotId, string][]) {
    if (!baseId) continue;
    if (is2H && slotId === 'offhand') continue;
    if (CONSUMABLE_SLOT_IDS.includes(slotId)) continue;

    const slotDef = SLOT_MAP[slotId];
    const items = is2H ? slotDef.items2H : slotDef.items1H;
    const itemDef = items.find((i) => i.id === baseId);
    const spec = specLevels[slotId] ?? 100;
    const isCombat = COMBAT_SPEC_SLOT_IDS.includes(slotId);

    const { matCount, enchants } = calcSlotTier(slotId, baseId, tier, is2H, isCombat ? mastery : 0, isCombat ? spec : 0, quality, prices, isCombat ? otherSpecBonus : 0, qualityFallbackIds);

    slots.push({
      slotId,
      label: slotDef.label,
      baseId,
      itemLabel: itemDef?.label ?? baseId,
      matCount,
      enchants,
    });
  }

  // Total mats for the full set (same count for runes/souls/relics — one type per enchant step)
  const totalMatCount = slots.reduce((s, slot) => s + slot.matCount, 0);
  const totalMats = { runes: totalMatCount, souls: totalMatCount, relics: totalMatCount };

  // Count IP-averaging slots (excludes bag; matches in-game avg IP logic)
  const avgIPSlotCount = slots.filter((s) => AVERAGE_IP_SLOT_IDS.includes(s.slotId)).length;

  // Totals per enchant level
  const totals = {} as TierResult['totals'];
  for (const enchant of ENCHANTS) {
    let market = 0, craft = 0, totalIP = 0, avgIPSum = 0;
    let available = true;
    for (const slot of slots) {
      const e = slot.enchants[enchant];
      market += e.marketPrice;
      craft += e.craftCost;
      totalIP += e.ip;
      if (AVERAGE_IP_SLOT_IDS.includes(slot.slotId)) avgIPSum += e.ip;
      if (!e.available) available = false;
    }
    const avgIP = avgIPSlotCount > 0 ? Math.round(avgIPSum / avgIPSlotCount) : 0;
    totals[enchant] = { market, craft, available, totalIP, avgIP };
  }

  return { tier, slots, totalMats, totals };
}

export function calcAllTiers(
  selectedItems: Partial<Record<SlotId, string>>,
  is2H: boolean,
  mastery: number,
  quality: number,
  specLevels: Partial<Record<SlotId, number>>,
  prices: PriceMap,
  otherSpecBonus = 0,
  qualityFallbackIds: Set<string> = new Set(),
): TierResult[] {
  if (Object.keys(selectedItems).length === 0) return [];
  return TIERS.map((tier) =>
    calcTierResult(selectedItems, is2H, mastery, quality, specLevels, tier, prices, otherSpecBonus, qualityFallbackIds),
  );
}
