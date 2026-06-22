import { useEffect, useState } from 'react';
import Papa from 'papaparse';

/** Per-store aggregate derived from the raw price rows in the master CSV. */
export interface Store {
  /** Store name, taken verbatim from the `store_name` column. */
  name: string;
  /** City derived from the store name (see `deriveCity`). */
  city: string;
  /** Retail chain derived from the store name (see `deriveChain`). */
  chain: string;
  /** Sum of `price_cad` across the store's available small-pack rows — the total a household actually pays for the basket. */
  basketCost: number;
  /** Number of rows where `available` is TRUE. */
  availableCount: number;
  /** Total rows recorded for the store. */
  totalCount: number;
  /** Percentage by which `basketCost` exceeds the cheapest store's cost (0% for the cheapest). */
  percentMore: number;
}

export interface PriceData {
  stores: Store[];
  loading: boolean;
  error: string | null;
  /** Lowest `basketCost` across all stores — the comparison reference point. */
  cheapestCost: number;
}

/** One row of the master CSV; only the columns we aggregate on are typed. */
interface RawRow {
  store_name: string;
  price_cad: string;
  available: string;
  persona: string;
  size_type: string;
  collection_date: string;
}

const CSV_URL = `${import.meta.env.BASE_URL}data/sentinel_prices_master.csv`;

/**
 * Maps the slug values emitted by the basket dropdown / URL (e.g. `south-asian`)
 * to the exact persona display strings used in the CSV's `persona` column. The
 * filter compares against display strings, so a raw slug would match no rows.
 */
const PERSONA_BY_SLUG: Record<string, string> = {
  'south-asian': 'South Asian',
  chinese: 'Chinese',
  filipino: 'Filipino',
  korean: 'Korean',
  european: 'European',
  indigenous: 'Indigenous',
  others: 'Others',
};

/** Maps a store name to its city using the substrings present in the name. */
function deriveCity(name: string): string {
  if (name.includes('Surrey')) return 'Surrey';
  if (name.includes('Vancouver')) return 'Vancouver';
  if (name.includes('Richmond')) return 'Richmond';
  if (name.includes('Burnaby')) return 'Burnaby';
  if (name.includes('Lonsdale')) return 'North Vancouver';
  if (name.includes('Delta')) return 'Delta';
  if (name.includes('Langley')) return 'Langley';
  if (name.includes('New Westminster')) return 'New Westminster';
  if (name.includes('Maple Ridge')) return 'Maple Ridge';
  if (name.includes('Coquitlam')) return 'Coquitlam';
  return 'Other';
}

/** Maps a store name to its retail chain using the substrings in the name. */
function deriveChain(name: string): string {
  if (name.includes('Superstore') || name.includes('Real Canadian')) return 'Loblaws';
  if (name.includes('No Frills')) return 'No Frills';
  if (name.includes('Save-On-Foods')) return 'Save-On-Foods';
  if (name.includes('Walmart')) return 'Walmart';
  if (name.includes('FreshCo') || name.includes('CHALO')) return 'FreshCo';
  return 'Other';
}

interface StoreAccumulator {
  priceSum: number;
  availableCount: number;
  totalCount: number;
}

/**
 * Folds the raw rows into per-store basket costs and derived fields.
 *
 * Rows are first narrowed to `size_type === 'small'` (small-pack prices reflect
 * what a household actually pays, not bulk) and, when `selectedBasket` is not
 * 'All', to rows whose `persona` matches the chosen basket. Each store's
 * `basketCost` is the sum of `price_cad` over its available rows in that set;
 * `cheapestCost` is the lowest such total, and each store's `percentMore` is its
 * cost expressed as a percentage above that cheapest store.
 */
function buildStores(
  rows: RawRow[],
  selectedBasket: string,
): { stores: Store[]; cheapestCost: number } {
  const groups = new Map<string, StoreAccumulator>();

  // History-aware costing. The master CSV accumulates weekly snapshots, so a
  // store can appear under several `collection_date` values. We cost only each
  // store's most recent snapshot; older snapshots stay in the file for trend
  // analysis but must not be summed into the current basket (that would
  // double-count). collection_date is ISO YYYY-MM-DD, so string max == latest.
  const latestDateByStore = new Map<string, string>();
  for (const row of rows) {
    const name = row.store_name?.trim();
    const date = row.collection_date?.trim();
    if (!name || !date) continue;
    const current = latestDateByStore.get(name);
    if (!current || date > current) latestDateByStore.set(name, date);
  }

  // Resolve the (possibly slug-formatted) selection to the CSV's persona string.
  const persona =
    selectedBasket === 'All'
      ? 'All'
      : PERSONA_BY_SLUG[selectedBasket.toLowerCase()] ?? selectedBasket;

  for (const row of rows) {
    if (row.size_type?.trim().toLowerCase() !== 'small') continue;
    if (persona !== 'All' && row.persona?.trim() !== persona) {
      continue;
    }

    const name = row.store_name?.trim();
    if (!name) continue;

    // Skip rows that aren't part of this store's latest snapshot.
    if (row.collection_date?.trim() !== latestDateByStore.get(name)) continue;

    const group = groups.get(name) ?? {
      priceSum: 0,
      availableCount: 0,
      totalCount: 0,
    };
    group.totalCount += 1;

    if (row.available?.toUpperCase() === 'TRUE') {
      const price = Number.parseFloat(row.price_cad);
      if (!Number.isNaN(price)) {
        group.priceSum += price;
        group.availableCount += 1;
      }
    }

    groups.set(name, group);
  }

  // First pass: per-store basket cost (total spend on available small packs).
  const partial = Array.from(groups.entries()).map(([name, group]) => ({
    name,
    city: deriveCity(name),
    chain: deriveChain(name),
    basketCost: group.priceSum,
    availableCount: group.availableCount,
    totalCount: group.totalCount,
  }));

  // The cheapest store anchors the comparison.
  const cheapestCost =
    partial.length > 0
      ? Math.min(...partial.map((store) => store.basketCost))
      : 0;

  // Second pass: how much more each store costs than the cheapest one.
  const stores: Store[] = partial.map((store) => ({
    ...store,
    percentMore:
      cheapestCost > 0 ? ((store.basketCost - cheapestCost) / cheapestCost) * 100 : 0,
  }));

  return { stores, cheapestCost };
}

/**
 * Loads the master price CSV, aggregates it per store, and derives the cheapest
 * basket cost and each store's percentage above it.
 *
 * `selectedBasket` selects which persona's basket to cost. When it is 'All',
 * every persona's rows are included; otherwise only rows whose `persona`
 * matches are aggregated. Changing it recomputes the stores, cheapest cost, and
 * percentages (the CSV is re-fetched).
 */
export function usePriceData(selectedBasket: string = 'All'): PriceData {
  const [stores, setStores] = useState<Store[]>([]);
  const [cheapestCost, setCheapestCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load(): Promise<void> {
      try {
        const response = await fetch(CSV_URL);
        if (!response.ok) {
          throw new Error(`Failed to load price data (${response.status})`);
        }

        const text = await response.text();
        const parsed = Papa.parse<RawRow>(text, {
          header: true,
          skipEmptyLines: true,
        });

        const { stores: nextStores, cheapestCost: nextCheapestCost } = buildStores(
          parsed.data,
          selectedBasket,
        );

        if (!cancelled) {
          setStores(nextStores);
          setCheapestCost(nextCheapestCost);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load price data');
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedBasket]);

  return { stores, loading, error, cheapestCost };
}
