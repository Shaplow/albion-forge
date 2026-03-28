import type { Tier, Enchant, SlotId } from '../types';
import { SLOT_MAP, CONSUMABLE_SLOT_IDS } from '../constants/slots';

/** Build the full Albion item ID for a given tier and enchant level.
 *  e.g. buildItemId('HEAD_LEATHER_SET1', 5, 2) → "T5_HEAD_LEATHER_SET1@2"
 */
export function buildItemId(baseId: string, tier: Tier, enchant: Enchant): string {
  const prefix = `T${tier}_${baseId}`;
  return enchant === 0 ? prefix : `${prefix}@${enchant}`;
}

/** Build the material item ID for runes/souls/relics at a given tier.
 *  Albion uses the same tier as the item being enchanted.
 */
export function materialId(type: 'RUNE' | 'SOUL' | 'RELIC', tier: Tier): string {
  return `T${tier}_${type}`;
}

/** Collect all item IDs needed for a given build configuration.
 *  Returns a deduplicated array of item IDs to fetch from the API.
 */
export function collectItemIds(
  selectedItems: Partial<Record<SlotId, string>>,
  is2H: boolean,
  tiers: readonly Tier[],
  enchants: readonly Enchant[],
): string[] {
  const ids = new Set<string>();

  // Item IDs for each selected slot
  for (const [slotId, baseId] of Object.entries(selectedItems)) {
    if (!baseId) continue;
    // Full IDs (consumables like T5_MEAL_OMELETTE) — add directly, no tier/enchant variants
    if (/^T\d+_/.test(baseId)) {
      ids.add(baseId);
      continue;
    }
    const isConsumable = CONSUMABLE_SLOT_IDS.includes(slotId as SlotId);
    for (const tier of tiers) {
      if (isConsumable) {
        ids.add(buildItemId(baseId, tier, 0));
      } else {
        for (const enchant of enchants) {
          ids.add(buildItemId(baseId, tier, enchant));
        }
      }
    }
  }

  // In 2H mode, also fetch weapon with base matCount (offhand grayed, weapon = 384 runes)
  // The offhand slot item IDs are already excluded if not selected — that's fine.
  void is2H;

  // Material IDs (rune, soul, relic) for each tier
  for (const tier of tiers) {
    ids.add(materialId('RUNE', tier));
    ids.add(materialId('SOUL', tier));
    ids.add(materialId('RELIC', tier));
  }

  return Array.from(ids);
}

/** Get the effective mat count for a slot given 2H mode. */
export function getMatCount(slotId: SlotId, is2H: boolean): number {
  const slot = SLOT_MAP[slotId];
  if (!slot) return 0;
  if (slotId === 'weapon') return is2H ? slot.matCount2H : slot.matCount1H;
  return slot.matCount1H;
}
