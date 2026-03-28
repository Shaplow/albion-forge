import { useQuery } from '@tanstack/react-query';
import type { PriceMap, ApiHistoryEntry, ApiPriceEntry } from '../types';
import { aodpBase } from '../constants/cities';

interface FetchResult {
  prices: PriceMap;
  qualityFallbackIds: Set<string>; // item IDs resolved at a lower quality than requested
  lastUpdated: string | null;
  isFallback: boolean;
}

/** Compute 7-day volume-weighted average from history data. */
function weightedAvg7d(data: ApiHistoryEntry['data']): number {
  const recent = data.slice(-7);
  const totalCount = recent.reduce((s, d) => s + d.item_count, 0);
  if (totalCount === 0) return 0;
  return Math.round(
    recent.reduce((s, d) => s + d.avg_price * d.item_count, 0) / totalCount,
  );
}

/** Runes, souls, and relics only exist at quality 1 — never filter them by the selected item quality. */
const MAT_ID_RE = /^T\d+_(RUNE|SOUL|RELIC)$/;

/** All quality levels available in Albion Online (1=Normal … 5=Masterpiece). */
const ALL_QUALITIES = '1,2,3,4,5';

async function fetchPrices(itemIds: string[], city: string, quality: number, server: 'west' | 'east'): Promise<FetchResult> {
  if (itemIds.length === 0) return { prices: {}, qualityFallbackIds: new Set(), lastUpdated: null, isFallback: false };

  const base = aodpBase(server);

  const matIds     = itemIds.filter((id) =>  MAT_ID_RE.test(id));
  const regularIds = itemIds.filter((id) => !MAT_ID_RE.test(id));
  const cityEncoded = encodeURIComponent(city);

  const requests: Promise<[ApiHistoryEntry[], ApiPriceEntry[]]>[] = [];

  // Regular items — fetch ALL qualities so we can fall back to a lower quality if the
  // selected quality has no data (AODP data is crowd-sourced and can be sparse).
  if (regularIds.length > 0) {
    const ids = regularIds.join(',');
    requests.push(Promise.all([
      fetch(`${base}/stats/history/${ids}?locations=${cityEncoded}&qualities=${ALL_QUALITIES}&time-scale=24`)
        .then((r) => r.json() as Promise<ApiHistoryEntry[]>).catch(() => [] as ApiHistoryEntry[]),
      fetch(`${base}/stats/prices/${ids}?locations=${cityEncoded}&qualities=${ALL_QUALITIES}`)
        .then((r) => r.json() as Promise<ApiPriceEntry[]>).catch(() => [] as ApiPriceEntry[]),
    ]));
  }

  // Materials — always quality 1 (runes/souls/relics have no quality variants)
  if (matIds.length > 0) {
    const ids = matIds.join(',');
    requests.push(Promise.all([
      fetch(`${base}/stats/history/${ids}?locations=${cityEncoded}&qualities=1&time-scale=24`)
        .then((r) => r.json() as Promise<ApiHistoryEntry[]>).catch(() => [] as ApiHistoryEntry[]),
      fetch(`${base}/stats/prices/${ids}?locations=${cityEncoded}&qualities=1`)
        .then((r) => r.json() as Promise<ApiPriceEntry[]>).catch(() => [] as ApiPriceEntry[]),
    ]));
  }

  const results = await Promise.all(requests);
  const histRes: ApiHistoryEntry[]  = results.flatMap(([h]) => h);
  const priceRes: ApiPriceEntry[]   = results.flatMap(([, p]) => p);

  // Build a quality-aware intermediate map: item_id -> quality -> price
  const qualityMap: Record<string, Record<number, number>> = {};
  let latestTimestamp: string | null = null;
  let isFallback = false;

  // Populate from history (preferred — volume-weighted 7d avg)
  for (const entry of histRes) {
    if (entry.data && entry.data.length > 0) {
      const avg = weightedAvg7d(entry.data);
      if (avg > 0) {
        if (!qualityMap[entry.item_id]) qualityMap[entry.item_id] = {};
        qualityMap[entry.item_id][entry.quality] = avg;
        const ts = entry.data[entry.data.length - 1]?.timestamp;
        if (ts && (!latestTimestamp || ts > latestTimestamp)) latestTimestamp = ts;
      }
    }
  }

  // Fill missing with sell_price_min from snapshot (fallback)
  for (const entry of priceRes) {
    const existing = qualityMap[entry.item_id]?.[entry.quality] ?? 0;
    if (existing === 0) {
      const price = entry.sell_price_min > 0
        ? entry.sell_price_min
        : entry.buy_price_max > 0
          ? entry.buy_price_max
          : 0;
      if (price > 0) {
        if (!qualityMap[entry.item_id]) qualityMap[entry.item_id] = {};
        qualityMap[entry.item_id][entry.quality] = price;
        isFallback = true;
      }
    }
  }

  // Resolve final PriceMap: prefer selected quality, fall back to highest quality below it.
  const map: PriceMap = {};
  const qualityFallbackIds = new Set<string>();
  for (const [itemId, qPrices] of Object.entries(qualityMap)) {
    for (let q = quality; q >= 1; q--) {
      if (qPrices[q] && qPrices[q] > 0) {
        map[itemId] = qPrices[q];
        if (q < quality) qualityFallbackIds.add(itemId);
        break;
      }
    }
  }

  return { prices: map, qualityFallbackIds, lastUpdated: latestTimestamp, isFallback };
}

export function usePrices(itemIds: string[], city: string, quality: number, server: 'west' | 'east' = 'west'): {
  prices: PriceMap;
  qualityFallbackIds: Set<string>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  lastUpdated: string | null;
  isFallback: boolean;
} {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['prices', itemIds.slice().sort().join(','), city, quality, server],
    queryFn: () => fetchPrices(itemIds, city, quality, server),
    enabled: itemIds.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    prices: data?.prices ?? {},
    qualityFallbackIds: data?.qualityFallbackIds ?? new Set(),
    isLoading: isLoading && itemIds.length > 0,
    isError,
    refetch,
    lastUpdated: data?.lastUpdated ?? null,
    isFallback: data?.isFallback ?? false,
  };
}
