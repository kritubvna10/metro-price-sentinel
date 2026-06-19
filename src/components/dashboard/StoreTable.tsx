import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Store } from '../../hooks/usePriceData';

export interface StoreTableProps {
  /** Stores to list, as aggregated from the master price CSV. */
  stores: Store[];
}

const INTER = "'Inter', sans-serif";
const DM_MONO = "'DM Mono', monospace";

type SortKey = 'best' | 'expensive' | 'alpha';

interface SortOption {
  key: SortKey;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'best', label: 'Best value' },
  { key: 'expensive', label: 'Most expensive' },
  { key: 'alpha', label: 'A-Z' },
];

interface ColumnDef {
  label: string;
  align: 'left' | 'right';
  /** Hidden below the `md` breakpoint to keep the table readable on phones. */
  hideOnMobile: boolean;
}

const COLUMNS: ColumnDef[] = [
  { label: 'Store', align: 'left', hideOnMobile: false },
  { label: 'City', align: 'left', hideOnMobile: true },
  { label: 'Chain', align: 'left', hideOnMobile: true },
  { label: 'Basket cost', align: 'right', hideOnMobile: false },
  { label: 'Store premium', align: 'right', hideOnMobile: false },
  { label: 'Items matched', align: 'right', hideOnMobile: true },
];

/** Tailwind utility that collapses a cell on mobile and restores it at `md`. */
const HIDE_ON_MOBILE = 'hidden md:table-cell';

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '0px',
  boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
  overflow: 'hidden',
};

function sortStores(source: Store[], key: SortKey): Store[] {
  const copy = [...source];
  switch (key) {
    case 'best':
      return copy.sort((a, b) => a.basketCost - b.basketCost);
    case 'expensive':
      return copy.sort((a, b) => b.basketCost - a.basketCost);
    case 'alpha':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

interface ChipStyle {
  background: string;
  color: string;
  label: string;
}

/** Maps a store's gap above the cheapest store to a colored chip. */
function premiumChip(percentMore: number): ChipStyle {
  // The cheapest store sits at the reference point: green, called out as such.
  if (percentMore <= 0) {
    return { background: '#EAF6EF', color: '#2F855A', label: '0% — cheapest' };
  }

  const label = `+${Math.round(percentMore)}%`;

  // Larger gaps read red; smaller gaps stay neutral.
  if (percentMore > 10) {
    return { background: '#FBEDEA', color: '#B85C4A', label };
  }

  return { background: '#F1F5F9', color: '#475569', label };
}

function PremiumChip({ percentMore }: { percentMore: number }): React.JSX.Element {
  const chip = premiumChip(percentMore);
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: INTER,
        fontWeight: 600,
        fontSize: '13px',
        lineHeight: 1,
        padding: '6px 10px',
        borderRadius: '0px',
        backgroundColor: chip.background,
        color: chip.color,
        whiteSpace: 'nowrap',
      }}
    >
      {chip.label}
    </span>
  );
}

function SortPill({
  option,
  active,
  onSelect,
}: {
  option: SortOption;
  active: boolean;
  onSelect: (key: SortKey) => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.key)}
      aria-pressed={active}
      style={{
        fontFamily: INTER,
        fontWeight: 600,
        fontSize: '13px',
        lineHeight: 1,
        padding: '9px 16px',
        borderRadius: '0px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: active ? '#111827' : '#F9FAFB',
        color: active ? '#FFFFFF' : '#6B7280',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      {option.label}
    </button>
  );
}

/** Store dropdown, relocated here from the top filter bar. */
function StoreFilter({
  store,
  storeOptions,
  onStoreChange,
}: {
  store: string;
  storeOptions: readonly string[];
  onStoreChange: (value: string) => void;
}): React.JSX.Element {
  const [focused, setFocused] = useState(false);

  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '0px',
        padding: '8px 12px',
        cursor: 'pointer',
        minWidth: '200px',
        boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.24)' : 'none',
        transition: 'box-shadow 0.15s ease',
      }}
    >
      <span
        style={{
          fontFamily: INTER,
          fontSize: '11px',
          fontWeight: 500,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Store
      </span>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          value={store}
          onChange={(e) => onStoreChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: INTER,
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
            cursor: 'pointer',
            width: '100%',
            paddingRight: '22px',
          }}
        >
          {storeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          color="#9CA3AF"
          style={{ position: 'absolute', right: 0, pointerEvents: 'none' }}
        />
      </div>
    </label>
  );
}

const TH_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 700,
  fontSize: '12px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#6B7280',
  backgroundColor: '#F9FAFB',
  textAlign: 'left',
  padding: '14px 24px',
  whiteSpace: 'nowrap',
};

const TD_TEXT_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontSize: '14px',
  color: '#374151',
  padding: '16px 24px',
  verticalAlign: 'middle',
};

const TD_NUM_STYLE: React.CSSProperties = {
  ...TD_TEXT_STYLE,
  fontFamily: DM_MONO,
  textAlign: 'right',
  color: '#111827',
};

function StoreRow({ store }: { store: Store }): React.JSX.Element {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#F9FAFB' : '#FFFFFF',
        borderTop: '1px solid #EEF2F7',
        transition: 'background-color 0.12s ease',
      }}
    >
      <td style={{ ...TD_TEXT_STYLE, fontWeight: 600, color: '#111827' }}>
        {store.name}
      </td>
      <td className={HIDE_ON_MOBILE} style={TD_TEXT_STYLE}>
        {store.city}
      </td>
      <td className={HIDE_ON_MOBILE} style={TD_TEXT_STYLE}>
        {store.chain}
      </td>
      <td style={TD_NUM_STYLE}>${Math.round(store.basketCost)}</td>
      <td style={{ ...TD_TEXT_STYLE, textAlign: 'right' }}>
        <PremiumChip percentMore={store.percentMore} />
      </td>
      <td className={HIDE_ON_MOBILE} style={TD_NUM_STYLE}>
        {store.availableCount} / {store.totalCount}
      </td>
    </tr>
  );
}

export default function StoreTable({ stores }: StoreTableProps): React.JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('best');

  // The store filter is local to this section: it only narrows the table rows
  // and never touches the top filters, KPI cards, or comparison chart. Its
  // options are the stores currently in view (after the top City / Basket /
  // Chain filters), so it always offers a consistent, non-empty set.
  const [selectedStore, setSelectedStore] = useState('All');
  const storeOptions = useMemo<readonly string[]>(
    () => ['All', ...stores.map((s) => s.name).sort((a, b) => a.localeCompare(b))],
    [stores],
  );
  // Guard against a stale selection once the top filters change the store set.
  const activeStore = stores.some((s) => s.name === selectedStore)
    ? selectedStore
    : 'All';

  const sorted = useMemo(() => {
    const scoped =
      activeStore === 'All'
        ? stores
        : stores.filter((s) => s.name === activeStore);
    return sortStores(scoped, sortKey);
  }, [stores, sortKey, activeStore]);

  return (
    <section style={CARD_STYLE}>
      <header
        style={{
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: INTER,
              fontWeight: 700,
              fontSize: '20px',
              color: '#111827',
              lineHeight: 1.3,
            }}
          >
            Store-level results
          </h2>
          <p
            style={{
              fontFamily: INTER,
              fontWeight: 400,
              fontSize: '14px',
              color: '#4B5563',
              lineHeight: 1.55,
              marginTop: '6px',
            }}
          >
            Sort and compare stores in this analysis.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: '12px',
          }}
        >
          <StoreFilter
            store={activeStore}
            storeOptions={storeOptions}
            onStoreChange={setSelectedStore}
          />
          <div
            role="group"
            aria-label="Sort stores"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
          >
            {SORT_OPTIONS.map((option) => (
              <SortPill
                key={option.key}
                option={option}
                active={sortKey === option.key}
                onSelect={setSortKey}
              />
            ))}
          </div>
        </div>
      </header>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={column.hideOnMobile ? HIDE_ON_MOBILE : undefined}
                  style={{
                    ...TH_STYLE,
                    textAlign: column.align,
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((store) => (
              <StoreRow key={store.name} store={store} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
