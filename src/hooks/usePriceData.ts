import { useEffect, useMemo, useState } from 'react';
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
  /** Human-readable collection window, e.g. "May–July 2026" (full-file span). */
  dateRangeLabel: string;
  /** Distinct stores present in the file (basket-independent). */
  storeCount: number;
  /** Total price rows in the file (basket-independent). */
  observationCount: number;
  /** Distinct store × collection_date snapshots in the file (basket-independent). */
  snapshotCount: number;
  /** Distinct persona baskets present in the file (basket-independent). */
  basketCount: number;
}

/** One row of the master CSV; only the columns we aggregate on are typed. */
export interface RawRow {
  store_name: string;
  price_cad: string;
  available: string;
  persona: string;
  size_type: string;
  collection_date: string;
}

const CSV_URL = `${import.meta.env.BASE_URL}data/sentinel_prices_master.csv`;

/** Bi-weekly shopping trips in a year — the multiplier behind annual figures. */
export const TRIPS_PER_YEAR = 26;

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
export function buildStores(
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

/** The store-to-store price gap for one costed basket, plus its annual scale. */
export interface StoreChoicePremium {
  cheapest: Store | null;
  priciest: Store | null;
  /** Priciest basket minus cheapest basket, in dollars per trip. */
  perTrip: number;
  /** `perTrip` scaled across a year of bi-weekly trips. */
  annual: number;
}

/**
 * Derives the "store choice premium": how much more the most expensive store
 * charges than the cheapest for the same costed basket. Returns zeros until at
 * least two distinct stores carry a positive basket cost, so callers never show
 * a gap invented from a single store.
 */
export function storeChoicePremium(stores: Store[]): StoreChoicePremium {
  const priced = stores.filter((store) => store.basketCost > 0);
  if (priced.length === 0) {
    return { cheapest: null, priciest: null, perTrip: 0, annual: 0 };
  }

  let cheapest = priced[0];
  let priciest = priced[0];
  for (const store of priced) {
    if (store.basketCost < cheapest.basketCost) cheapest = store;
    if (store.basketCost > priciest.basketCost) priciest = store;
  }

  const perTrip =
    cheapest.name === priciest.name ? 0 : priciest.basketCost - cheapest.basketCost;
  return { cheapest, priciest, perTrip, annual: perTrip * TRIPS_PER_YEAR };
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Formats a "Month YYYY" from an ISO `YYYY-MM-DD` string, or '' if unparseable. */
function monthYear(iso: string): { month: string; year: string } | null {
  const [year, month] = iso.split('-');
  const index = Number.parseInt(month, 10) - 1;
  if (!year || Number.isNaN(index) || index < 0 || index > 11) return null;
  return { month: MONTHS[index], year };
}

/**
 * Builds a compact collection-window label from the full span of
 * `collection_date` values, e.g. "May–July 2026", "July 2026", or
 * "December 2025–January 2026". Returns '' when no dates are present.
 */
export function formatDateRange(rows: RawRow[]): string {
  let min = '';
  let max = '';
  for (const row of rows) {
    const date = row.collection_date?.trim();
    if (!date) continue;
    if (!min || date < min) min = date;
    if (!max || date > max) max = date;
  }
  if (!min) return '';

  const start = monthYear(min);
  const end = monthYear(max);
  if (!start || !end) return '';

  if (start.year === end.year) {
    return start.month === end.month
      ? `${start.month} ${start.year}`
      : `${start.month}–${end.month} ${start.year}`;
  }
  return `${start.month} ${start.year}–${end.month} ${end.year}`;
}

// --- Shared master-CSV loader -------------------------------------------------
// The CSV is static for the life of a page load, so we fetch + parse it once and
// share the parsed rows across every hook instance. This keeps usePriceData the
// single source of truth for all displayed totals without each section (hero,
// navbar, footer, dashboard, persona cards…) re-downloading a ~1 MB file.

let cachedRows: RawRow[] | null = null;
let inflight: Promise<RawRow[]> | null = null;

function loadMasterRows(): Promise<RawRow[]> {
  if (cachedRows) return Promise.resolve(cachedRows);
  if (!inflight) {
    inflight = fetch(CSV_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load price data (${response.status})`);
        }
        return response.text();
      })
      .then((text) => {
        const parsed = Papa.parse<RawRow>(text, {
          header: true,
          skipEmptyLines: true,
        });
        cachedRows = parsed.data;
        return cachedRows;
      })
      .catch((err) => {
        inflight = null; // allow a later retry after a transient failure
        throw err;
      });
  }
  return inflight;
}

interface MasterRows {
  rows: RawRow[];
  loading: boolean;
  error: string | null;
}

/** Loads (once) and returns the raw master-CSV rows shared across the app. */
export function useMasterRows(): MasterRows {
  const [rows, setRows] = useState<RawRow[]>(cachedRows ?? []);
  const [loading, setLoading] = useState(cachedRows === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial state already reflects "loading" when the cache is cold, so the
    // effect only resolves the shared load — no synchronous setState here.
    if (cachedRows) return;
    let cancelled = false;

    loadMasterRows()
      .then((loaded) => {
        if (!cancelled) {
          setRows(loaded);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load price data');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { rows, loading, error };
}

/**
 * Loads the master price CSV, aggregates it per store, and derives the cheapest
 * basket cost, each store's percentage above it, and file-level descriptors
 * (collection window, store/observation/snapshot counts).
 *
 * `selectedBasket` selects which persona's basket to cost. When it is 'All',
 * every persona's rows are included; otherwise only rows whose `persona`
 * matches are aggregated. The file-level descriptors are basket-independent.
 */
export function usePriceData(selectedBasket: string = 'All'): PriceData {
  const { rows, loading, error } = useMasterRows();

  const { stores, cheapestCost } = useMemo(
    () => buildStores(rows, selectedBasket),
    [rows, selectedBasket],
  );

  const meta = useMemo(() => {
    const storeNames = new Set<string>();
    const snapshots = new Set<string>();
    const baskets = new Set<string>();
    for (const row of rows) {
      const name = row.store_name?.trim();
      const date = row.collection_date?.trim();
      const persona = row.persona?.trim();
      if (name) storeNames.add(name);
      if (persona) baskets.add(persona);
      if (name && date) snapshots.add(`${name} ${date}`);
    }
    return {
      dateRangeLabel: formatDateRange(rows),
      storeCount: storeNames.size,
      observationCount: rows.length,
      snapshotCount: snapshots.size,
      basketCount: baskets.size,
    };
  }, [rows]);

  return { stores, loading, error, cheapestCost, ...meta };
}
