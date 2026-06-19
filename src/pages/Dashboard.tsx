import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FilterBar, {
  type FilterKey,
  BASKET_OPTIONS,
} from '../components/dashboard/FilterBar';
import KpiRow from '../components/dashboard/KpiRow';
import PremiumChart from '../components/dashboard/PremiumChart';
import ContextPanel from '../components/dashboard/ContextPanel';
import StoreTable from '../components/dashboard/StoreTable';
import MethodologyFooter from '../components/dashboard/MethodologyFooter';
import { usePriceData } from '../hooks/usePriceData';

interface Filters {
  city: string;
  basket: string;
  chain: string;
}

const DEFAULT_FILTERS: Filters = {
  city: 'All',
  basket: 'All',
  chain: 'All',
};

/** Converts a display label to a URL-friendly slug (e.g. "South Asian" → "south-asian"). */
function slugify(value: string): string {
  if (value === 'All') return 'all';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Resolves a URL slug back to its display label, falling back to "All". */
function labelFromSlug(slug: string | null, options: readonly string[]): string {
  if (!slug) return 'All';
  const match = options.find((option) => slugify(option) === slug.toLowerCase());
  return match ?? 'All';
}

/** Builds a sorted "All"-prefixed option list from the given values. */
function toOptions(values: string[]): readonly string[] {
  return ['All', ...Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))];
}

const STATUS_TEXT_STYLE: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '16px',
  color: '#6B7280',
  lineHeight: 1.6,
  maxWidth: '360px',
};

/** Shared white card used for the loading, error, and empty states. */
function StatusCard({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div
      className="mt-6 flex flex-col items-center justify-center gap-4 text-center"
      style={{
        minHeight: '320px',
        backgroundColor: '#FFFFFF',
        borderRadius: '0px',
        boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
        padding: '48px 24px',
      }}
    >
      {children}
    </div>
  );
}

/** Simple rotating ring used while the CSV loads. */
function Spinner(): React.JSX.Element {
  return (
    <span
      className="animate-spin"
      role="status"
      aria-label="Loading"
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '9999px',
        border: '3px solid #E5E7EB',
        borderTopColor: '#111827',
        display: 'inline-block',
      }}
    />
  );
}

export default function Dashboard(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  // The household basket selects which persona's product rows the hook costs,
  // so it is resolved from the URL up front and fed into usePriceData. Its
  // option list (BASKET_OPTIONS) is static, so it needs no loaded data.
  const basket = labelFromSlug(searchParams.get('basket'), BASKET_OPTIONS);
  const { stores: allStores, loading, error } = usePriceData(basket);

  // Filter dropdown options are derived from whatever the CSV actually contains.
  const cityOptions = useMemo(
    () => toOptions(allStores.map((store) => store.city)),
    [allStores],
  );
  const chainOptions = useMemo(
    () => toOptions(allStores.map((store) => store.chain)),
    [allStores],
  );

  // Resolve filters from the URL. The option lists are dependencies so that
  // slugs resolve to real labels once the data (and its options) have loaded.
  // The per-store filter is intentionally absent here: it lives inside the
  // Store-level results table and only narrows that table, never the KPIs,
  // chart, or these top filters.
  const filters: Filters = useMemo(
    () => ({
      city: labelFromSlug(searchParams.get('city'), cityOptions),
      basket,
      chain: labelFromSlug(searchParams.get('chain'), chainOptions),
    }),
    [searchParams, basket, cityOptions, chainOptions],
  );

  const writeFilters = (next: Filters): void => {
    setSearchParams(
      {
        city: slugify(next.city),
        basket: slugify(next.basket),
        chain: slugify(next.chain),
      },
      { replace: true },
    );
  };

  const handleChange = (key: FilterKey, value: string): void => {
    writeFilters({ ...filters, [key]: value });
  };

  const handleReset = (): void => {
    writeFilters(DEFAULT_FILTERS);
  };

  // Filter the dataset on the store-level fields. "Household Basket" is applied
  // upstream by usePriceData (it changes each store's costed rows), so it is
  // not re-applied here.
  const filteredStores = useMemo(
    () =>
      allStores.filter((store) => {
        if (filters.city !== 'All' && store.city !== filters.city) return false;
        if (filters.chain !== 'All' && store.chain !== filters.chain) return false;
        return true;
      }),
    [allStores, filters],
  );

  const cheapestInView = useMemo(
    () =>
      filteredStores.length > 0
        ? Math.min(...filteredStores.map((s) => s.basketCost))
        : 0,
    [filteredStores],
  );

  const viewStores = useMemo(
    () =>
      filteredStores.map((s) => ({
        ...s,
        percentMore:
          cheapestInView > 0
            ? ((s.basketCost - cheapestInView) / cheapestInView) * 100
            : 0,
      })),
    [filteredStores, cheapestInView],
  );

  const isEmpty = filteredStores.length === 0;

  // Keep the document title in step with how many stores are in view.
  useEffect(() => {
    if (loading) {
      document.title = 'Loading data · Price Sentinel';
      return;
    }
    document.title = isEmpty
      ? 'No matching stores · Price Sentinel'
      : `${filteredStores.length} stores · Price Sentinel`;
  }, [filteredStores.length, isEmpty, loading]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#F9FAFB' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 pt-12 md:pt-24">
        <Link
          to="/"
          className="inline-flex items-center text-sm mb-10 transition-colors hover:opacity-70"
          style={{ fontFamily: "'Inter', sans-serif", color: '#6B7280' }}
        >
          ← Back to Story
        </Link>

        <header className="mb-10">
          <h1
            className="mb-4 text-[28px] md:text-[40px]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.2,
            }}
          >
            Explore your neighborhood
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '17px',
              color: '#4B5563',
              maxWidth: '560px',
              lineHeight: 1.6,
            }}
          >
            Filter by city, household basket, chain, or store to compare grocery
            affordability across Metro Vancouver.
          </p>
        </header>

        <FilterBar
          city={filters.city}
          basket={filters.basket}
          chain={filters.chain}
          cityOptions={cityOptions}
          chainOptions={chainOptions}
          onChange={handleChange}
          onReset={handleReset}
        />

        {loading ? (
          <StatusCard>
            <Spinner />
            <p style={STATUS_TEXT_STYLE}>Loading price data…</p>
          </StatusCard>
        ) : error ? (
          <StatusCard>
            <p style={STATUS_TEXT_STYLE}>
              Couldn&rsquo;t load price data.
              <br />
              {error}
            </p>
          </StatusCard>
        ) : isEmpty ? (
          <StatusCard>
            <p style={STATUS_TEXT_STYLE}>
              No stores match these filters.
              <br />
              Try removing one filter or choosing a different city.
            </p>
          </StatusCard>
        ) : (
          <>
            <div className="mt-6">
              <KpiRow stores={viewStores} cheapestCost={cheapestInView} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr] lg:items-stretch">
              <PremiumChart stores={viewStores} />
              <ContextPanel />
            </div>

            <div className="mt-6 pb-16">
              <StoreTable stores={viewStores} />
            </div>
          </>
        )}
      </div>

      <MethodologyFooter />
    </div>
  );
}
