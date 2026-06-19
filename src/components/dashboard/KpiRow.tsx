import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Store } from '../../hooks/usePriceData';

export interface KpiRowProps {
  /** Stores in view, as aggregated from the master price CSV. */
  stores: Store[];
  /** Lowest basket cost across the data — the comparison reference point. */
  cheapestCost: number;
}

const INTER = "'Inter', sans-serif";
const DM_MONO = "'DM Mono', monospace";

interface KpiValues {
  /** Cheapest basket cost in view (the reference store's cost). */
  cheapestCost: number;
  /** Name of the store achieving the cheapest basket cost. */
  bestValueStore: string;
  /** Largest percentage any store sits above the cheapest one. */
  maxPercentMore: number;
  /** Yearly gap between the most and least expensive baskets in view. */
  yearlyImpact: number;
}

/** Recomputes the headline KPIs from the stores currently in view. */
function computeKpis(stores: Store[], cheapestCost: number): KpiValues {
  const bestValue = stores.reduce((best, store) =>
    store.basketCost < best.basketCost ? store : best,
  );
  const highestBasketCost = stores.reduce(
    (max, store) => Math.max(max, store.basketCost),
    0,
  );
  const maxPercentMore = stores.reduce(
    (max, store) => Math.max(max, store.percentMore),
    0,
  );

  return {
    cheapestCost,
    bestValueStore: bestValue.name,
    maxPercentMore,
    yearlyImpact: Math.round((highestBasketCost - cheapestCost) * 52),
  };
}

/**
 * The four KPIs render as one connected panel rather than four separate cards.
 * The panel is clipped with square corners; a 1px grid gap reveals the panel's
 * divider color between cells, so they read as a single unit at every breakpoint.
 */
const PANEL_STYLE: React.CSSProperties = {
  backgroundColor: '#EEF2F7',
  borderRadius: '0px',
  boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
  overflow: 'hidden',
};

const CELL_STYLE: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontSize: '13px',
  fontWeight: 600,
  color: '#6B7280',
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontSize: '13px',
  fontWeight: 400,
  color: '#6B7280',
  lineHeight: 1.5,
};

/** Neutral for small gaps above the cheapest store, red as the gap grows. */
function premiumColor(pct: number): string {
  return pct > 5 ? '#B85C4A' : '#475569';
}

/** Formats a non-negative gap above the cheapest store, e.g. "+12%". */
function formatPercentMore(pct: number): string {
  return `+${Math.round(pct)}%`;
}

/** Formats a whole-dollar basket cost, e.g. "$142". */
function formatCost(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-CA')}`;
}

/** Formats a signed dollar amount, e.g. "+$2,184". */
function formatDollars(amount: number): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}$${Math.abs(Math.round(amount)).toLocaleString('en-CA')}`;
}

/**
 * Crossfades its content whenever `animationKey` changes, so KPI figures
 * transition smoothly as filters narrow the store set.
 */
function AnimatedValue({
  animationKey,
  style,
  children,
}: {
  animationKey: string | number;
  style: React.CSSProperties;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <span style={{ display: 'inline-flex', overflow: 'hidden' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={animationKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ display: 'inline-block', ...style }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function KpiRow({ stores, cheapestCost }: KpiRowProps): React.JSX.Element {
  const {
    cheapestCost: cheapest,
    bestValueStore,
    maxPercentMore,
    yearlyImpact,
  } = useMemo(() => computeKpis(stores, cheapestCost), [stores, cheapestCost]);

  const premiumHue = premiumColor(maxPercentMore);
  const yearlyHue =
    yearlyImpact > 0 ? '#B85C4A' : yearlyImpact < 0 ? '#2F855A' : '#475569';

  return (
    <section style={PANEL_STYLE}>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: '1px', backgroundColor: '#EEF2F7' }}
      >
      {/* Card 1 — Selected basket cost */}
      <article style={CELL_STYLE}>
        <span style={LABEL_STYLE}>Selected basket cost</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <AnimatedValue
            animationKey={cheapest}
            style={{
              fontFamily: DM_MONO,
              fontSize: '36px',
              fontWeight: 600,
              color: '#111827',
              lineHeight: 1,
            }}
          >
            {formatCost(cheapest)}
          </AnimatedValue>
          <span style={{ fontFamily: DM_MONO, fontSize: '13px', color: '#6B7280' }}>
            /week
          </span>
        </div>
        <p style={DESCRIPTION_STYLE}>
          Cost of the selected household basket at the cheapest store in view.
        </p>
      </article>

      {/* Card 2 — Best-value store */}
      <article style={CELL_STYLE}>
        <span style={LABEL_STYLE}>Best-value store</span>
        <AnimatedValue
          animationKey={bestValueStore}
          style={{
            fontFamily: INTER,
            fontSize: '20px',
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.25,
          }}
        >
          {bestValueStore}
        </AnimatedValue>
        <p style={DESCRIPTION_STYLE}>
          Lowest observed basket cost for the current filters.
        </p>
      </article>

      {/* Card 3 — Most expensive vs cheapest */}
      <article style={CELL_STYLE}>
        <span style={LABEL_STYLE}>Most expensive vs cheapest</span>
        <AnimatedValue
          animationKey={formatPercentMore(maxPercentMore)}
          style={{
            fontFamily: DM_MONO,
            fontSize: '36px',
            fontWeight: 600,
            color: premiumHue,
            lineHeight: 1,
          }}
        >
          {formatPercentMore(maxPercentMore)}
        </AnimatedValue>
        <p style={DESCRIPTION_STYLE}>
          How much more the priciest store charges than the cheapest in view.
        </p>
      </article>

      {/* Card 4 — Estimated yearly impact */}
      <article style={CELL_STYLE}>
        <span style={LABEL_STYLE}>Estimated yearly impact</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <AnimatedValue
            animationKey={formatDollars(yearlyImpact)}
            style={{
              fontFamily: DM_MONO,
              fontSize: '36px',
              fontWeight: 600,
              color: yearlyHue,
              lineHeight: 1,
            }}
          >
            {formatDollars(yearlyImpact)}
          </AnimatedValue>
          <span style={{ fontFamily: DM_MONO, fontSize: '13px', color: '#6B7280' }}>
            /year
          </span>
        </div>
        <p style={DESCRIPTION_STYLE}>
          Yearly gap between the most and least expensive baskets in view.
        </p>
      </article>
      </div>
    </section>
  );
}
