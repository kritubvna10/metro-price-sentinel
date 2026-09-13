import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import {
  useForecastData,
  type ForecastProduct,
  type ForecastStore,
} from '../../hooks/useForecastData';

/**
 * "Price forecast" feature (ml_feature_design_spec.md).
 *
 * A compact, secondary feature next to the live data: a collapsed entry point
 * that expands into a per-store forecast for each store's NEXT collection cycle.
 * Everything here is an estimate for the next visit (~3 weeks out), never a
 * per-day figure — the model has no intra-week resolution, so no calendar, no
 * "best day", no per-day price appears anywhere in this component.
 */

const INTER = "'Inter', sans-serif";
const DM_MONO = "'DM Mono', monospace";

const GREEN = '#2F855A';
const GREEN_BG = '#EAF6EF';
const RED = '#B85C4A';
const RED_BG = '#FBEDEA';
const NEUTRAL = '#475569';
const NEUTRAL_BG = '#F1F5F9';

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '0px',
  boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
  overflow: 'hidden',
};

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "2026-09-01" → "Sep 1". Returns the raw string if it can't be parsed. */
function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  const mi = Number.parseInt(m, 10) - 1;
  const day = Number.parseInt(d, 10);
  if (!y || Number.isNaN(mi) || mi < 0 || mi > 11 || Number.isNaN(day)) return iso;
  return `${MONTHS_SHORT[mi]} ${day}`;
}

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

type SortKey = 'increase' | 'name' | 'predicted';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'increase', label: 'Biggest rise' },
  { key: 'predicted', label: 'Predicted price' },
  { key: 'name', label: 'A–Z' },
];

function sortStores(source: ForecastStore[], key: SortKey): ForecastStore[] {
  const copy = [...source];
  switch (key) {
    case 'increase':
      // Largest predicted increase first — the most useful signal for someone
      // worried about cost. change = predicted − last actual.
      return copy.sort(
        (a, b) =>
          b.predicted_basket -
          b.last_actual_basket -
          (a.predicted_basket - a.last_actual_basket),
      );
    case 'predicted':
      return copy.sort((a, b) => b.predicted_basket - a.predicted_basket);
    case 'name':
      return copy.sort((a, b) => a.store_name.localeCompare(b.store_name));
  }
}

function SortPill({
  option,
  active,
  onSelect,
}: {
  option: { key: SortKey; label: string };
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

/** Small "est." tag that marks a number as a model estimate, not a measurement. */
function EstTag(): React.JSX.Element {
  return (
    <span
      style={{
        fontFamily: INTER,
        fontWeight: 600,
        fontSize: '10px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: '#9CA3AF',
        marginLeft: '6px',
        verticalAlign: 'middle',
      }}
    >
      est.
    </span>
  );
}

/** Coloured change indicator: down = green (good), up = red. */
function DirectionBadge({
  change,
  base,
}: {
  change: number;
  base: number;
}): React.JSX.Element {
  const pct = base > 0 ? Math.abs(change / base) * 100 : 0;
  const flat = Math.abs(change) < 0.005;

  const color = flat ? NEUTRAL : change < 0 ? GREEN : RED;
  const bg = flat ? NEUTRAL_BG : change < 0 ? GREEN_BG : RED_BG;
  const Icon = change < 0 ? TrendingDown : TrendingUp;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: DM_MONO,
        fontWeight: 500,
        fontSize: '13px',
        lineHeight: 1,
        padding: '6px 10px',
        borderRadius: '0px',
        backgroundColor: bg,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {flat ? (
        'roughly flat'
      ) : (
        <>
          <Icon size={14} aria-hidden />
          {money(Math.abs(change))} ({pct.toFixed(1)}%)
        </>
      )}
    </span>
  );
}

const DETAIL_LABEL: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 700,
  fontSize: '11px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#6B7280',
};

/** Per-store product detail: what is moving at this store next cycle. */
function StoreDetail({
  store,
}: {
  store: ForecastStore;
}): React.JSX.Element {
  const products: ForecastProduct[] = [...store.products].sort(
    (a, b) => Math.abs(b.change) - Math.abs(a.change),
  );

  return (
    <div style={{ padding: '4px 24px 20px', backgroundColor: '#FBFCFD' }}>
      <p
        style={{
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: '14px',
          color: '#111827',
          margin: '12px 0',
        }}
      >
        What&rsquo;s moving at {store.store_name}
      </p>

      {products.length === 0 ? (
        <p style={{ fontFamily: INTER, fontSize: '13px', color: '#6B7280' }}>
          No individual products show a meaningful predicted move this cycle.
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...DETAIL_LABEL, textAlign: 'left', padding: '8px 0' }}>
                Product
              </th>
              <th style={{ ...DETAIL_LABEL, textAlign: 'right', padding: '8px 12px' }}>
                Last actual
              </th>
              <th style={{ ...DETAIL_LABEL, textAlign: 'right', padding: '8px 12px' }}>
                Predicted next
              </th>
              <th style={{ ...DETAIL_LABEL, textAlign: 'right', padding: '8px 0' }}>
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_name} style={{ borderTop: '1px solid #EEF2F7' }}>
                <td
                  style={{
                    fontFamily: INTER,
                    fontSize: '13px',
                    color: '#374151',
                    padding: '10px 0',
                  }}
                >
                  {p.product_name}
                </td>
                <td
                  style={{
                    fontFamily: DM_MONO,
                    fontSize: '13px',
                    color: '#111827',
                    textAlign: 'right',
                    padding: '10px 12px',
                  }}
                >
                  {money(p.last_actual)}
                </td>
                <td
                  style={{
                    fontFamily: DM_MONO,
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: '#6B7280',
                    textAlign: 'right',
                    padding: '10px 12px',
                  }}
                >
                  {money(p.predicted)}
                  <EstTag />
                </td>
                <td style={{ textAlign: 'right', padding: '10px 0' }}>
                  <DirectionBadge change={p.change} base={p.last_actual} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p
        style={{
          fontFamily: INTER,
          fontSize: '12px',
          color: '#6B7280',
          lineHeight: 1.6,
          marginTop: '14px',
        }}
      >
        Based on this store&rsquo;s own price history. Products not listed are
        predicted to stay roughly flat.
      </p>
    </div>
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
  padding: '14px 24px',
  whiteSpace: 'nowrap',
};

const HIDE_ON_MOBILE = 'hidden md:table-cell';

/** One store row in the forecast list; click toggles its product detail. */
function StoreForecastRow({ store }: { store: ForecastStore }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const change = store.predicted_basket - store.last_actual_basket;

  return (
    <>
      <tr
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-expanded={open}
        style={{
          backgroundColor: hovered || open ? '#F9FAFB' : '#FFFFFF',
          borderTop: '1px solid #EEF2F7',
          cursor: 'pointer',
          transition: 'background-color 0.12s ease',
        }}
      >
        <td
          style={{
            fontFamily: INTER,
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
            padding: '16px 24px',
            verticalAlign: 'middle',
          }}
        >
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {open ? (
              <ChevronDown size={16} color="#9CA3AF" aria-hidden />
            ) : (
              <ChevronRight size={16} color="#9CA3AF" aria-hidden />
            )}
            {store.store_name}
          </span>
        </td>

        {/* Last actual — REAL measured data: solid weight, dark. */}
        <td
          className={HIDE_ON_MOBILE}
          style={{
            fontFamily: DM_MONO,
            fontSize: '14px',
            color: '#111827',
            textAlign: 'right',
            padding: '16px 24px',
            verticalAlign: 'middle',
          }}
        >
          {money(store.last_actual_basket)}
          <span
            style={{
              fontFamily: INTER,
              fontSize: '12px',
              color: '#9CA3AF',
              marginLeft: '8px',
            }}
          >
            {shortDate(store.last_actual_date)}
          </span>
        </td>

        {/* Predicted next — model ESTIMATE: lighter, italic, tagged "est." so it
            can never be mistaken for the measured column. */}
        <td
          style={{
            fontFamily: DM_MONO,
            fontStyle: 'italic',
            fontSize: '14px',
            color: '#6B7280',
            textAlign: 'right',
            padding: '16px 24px',
            verticalAlign: 'middle',
          }}
        >
          {money(store.predicted_basket)}
          <EstTag />
        </td>

        <td
          style={{
            textAlign: 'right',
            padding: '16px 24px',
            verticalAlign: 'middle',
          }}
        >
          <DirectionBadge change={change} base={store.last_actual_basket} />
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={4} style={{ padding: 0 }}>
            <StoreDetail store={store} />
          </td>
        </tr>
      )}
    </>
  );
}

/** The permanently-visible honesty note (spec §COMPONENT 4). Do not hide. */
function HonestyNote(): React.JSX.Element {
  return (
    <div
      style={{
        borderTop: '1px solid #EEF2F7',
        backgroundColor: '#FBFCFD',
        padding: '18px 24px',
      }}
    >
      <p
        style={{
          fontFamily: INTER,
          fontSize: '13px',
          color: '#4B5563',
          lineHeight: 1.65,
          maxWidth: '760px',
        }}
      >
        <strong style={{ color: '#111827' }}>How to read this.</strong> Think of
        these as smart estimates, not promises. We check each store about once
        every three weeks, so each number is our best guess for the next visit
        &mdash; not a price for any single day. When we tested it on prices it had
        never seen, it came out about 38% closer to reality than assuming nothing
        changes. It&rsquo;s a research prototype, so treat these as signals worth
        watching, not sure things.
      </p>
    </div>
  );
}

/** Collapsed entry point (spec §COMPONENT 1). */
function EntryButton({ onOpen }: { onOpen: () => void }): React.JSX.Element {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={false}
      style={{
        ...CARD_STYLE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        width: '100%',
        textAlign: 'left',
        border: 'none',
        cursor: 'pointer',
        padding: '18px 24px',
        backgroundColor: hovered ? '#F9FAFB' : '#FFFFFF',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <TrendingUp size={20} color="#111827" aria-hidden />
        <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: INTER,
              fontWeight: 700,
              fontSize: '16px',
              color: '#111827',
            }}
          >
            Price forecast
            <span
              style={{
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: '10px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#6B7280',
                backgroundColor: '#F1F5F9',
                padding: '2px 7px',
                borderRadius: '0px',
              }}
            >
              Prototype
            </span>
          </span>
          <span
            style={{ fontFamily: INTER, fontSize: '13px', color: '#6B7280' }}
          >
            Next collection, ~3 weeks out
          </span>
        </span>
      </span>
      <ChevronRight size={20} color="#9CA3AF" aria-hidden />
    </button>
  );
}

export default function ForecastPanel(): React.JSX.Element | null {
  const { forecast, loading, error } = useForecastData();
  const [open, setOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('increase');

  const sortedStores = useMemo(
    () => (forecast ? sortStores(forecast.stores, sortKey) : []),
    [forecast, sortKey],
  );

  // The forecast is a secondary, optional feature: if the file is missing,
  // still loading, or empty, render nothing rather than an error surface.
  if (loading || error || !forecast || forecast.stores.length === 0) {
    return null;
  }

  if (!open) {
    return <EntryButton onOpen={() => setOpen(true)} />;
  }

  return (
    <section style={CARD_STYLE} aria-label="Price forecast">
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
        <div style={{ maxWidth: '620px' }}>
          <span
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <h2
              style={{
                fontFamily: INTER,
                fontWeight: 700,
                fontSize: '20px',
                color: '#111827',
                lineHeight: 1.3,
              }}
            >
              Forecast for next collection
            </h2>
            <span
              style={{
                fontFamily: INTER,
                fontWeight: 600,
                fontSize: '10px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#6B7280',
                backgroundColor: '#F1F5F9',
                padding: '2px 7px',
              }}
            >
              Prototype
            </span>
          </span>
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
            Predicted basket cost when each store is next visited (around 17 to 21
            September 2026). Estimates, not guarantees.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              fontFamily: INTER,
              fontWeight: 600,
              fontSize: '13px',
              color: '#6B7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Hide forecast
          </button>
          <div
            role="group"
            aria-label="Sort forecast"
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
              <th scope="col" style={{ ...TH_STYLE, textAlign: 'left' }}>
                Store
              </th>
              <th
                scope="col"
                className={HIDE_ON_MOBILE}
                style={{ ...TH_STYLE, textAlign: 'right' }}
              >
                Last actual
              </th>
              <th scope="col" style={{ ...TH_STYLE, textAlign: 'right' }}>
                Predicted next
              </th>
              <th scope="col" style={{ ...TH_STYLE, textAlign: 'right' }}>
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStores.map((store) => (
              <StoreForecastRow key={store.store_name} store={store} />
            ))}
          </tbody>
        </table>
      </div>

      <HonestyNote />
    </section>
  );
}
