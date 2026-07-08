import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { usePriceData } from '../hooks/usePriceData';

const INTER = "'Inter', sans-serif";
const DM_MONO = "'DM Mono', monospace";

/** Bi-weekly shopping trips in a year — the multiplier behind the annual gap. */
const TRIPS_PER_YEAR = 26;

/** Counts up to `target` once `active` becomes true (used on scroll-into-view). */
function useCountUp(target: number, duration: number, active: boolean): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();

    const tick = (now: number): void => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, active]);

  return value;
}

/** One animated basket-cost bar that grows from zero when scrolled into view. */
function BasketBar({
  label,
  cost,
  axisMax,
  color,
  inView,
  delay,
}: {
  label: string;
  cost: number;
  axisMax: number;
  color: string;
  inView: boolean;
  delay: number;
}): React.JSX.Element {
  const widthPct = axisMax > 0 ? (cost / axisMax) * 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span style={{ fontFamily: INTER, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
          {label}
        </span>
        <span style={{ fontFamily: DM_MONO, fontSize: '14px', fontWeight: 600, color }}>
          ${cost.toFixed(2)}
        </span>
      </div>
      <div style={{ height: '20px', backgroundColor: '#EEF2F7', width: '100%' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${widthPct}%` } : { width: 0 }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
          style={{ height: '100%', backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function PovertyPenaltySection(): React.JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const { stores, loading } = usePriceData('All');

  // Only stores with a real basket cost can anchor the comparison.
  const priced = stores.filter((store) => store.basketCost > 0);
  const cheapest = priced.reduce<typeof priced[number] | null>(
    (min, store) => (min === null || store.basketCost < min.basketCost ? store : min),
    null,
  );
  const priciest = priced.reduce<typeof priced[number] | null>(
    (max, store) => (max === null || store.basketCost > max.basketCost ? store : max),
    null,
  );

  const gap =
    cheapest && priciest ? priciest.basketCost - cheapest.basketCost : 0;
  const annualGap = gap * TRIPS_PER_YEAR;
  const penalty = useCountUp(gap, 1.2, inView);

  // Nothing to honestly show until the CSV yields at least two priced stores.
  if (loading || !cheapest || !priciest || cheapest.name === priciest.name) {
    return null;
  }

  return (
    <section className="py-24 bg-[#F9FAFB]">
      <div
        ref={ref}
        className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-12 items-center"
      >
        {/* Left column — the explanation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: INTER, color: '#111827' }}
          >
            The Store Choice Premium
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ fontFamily: INTER, color: '#6B7280' }}
          >
            The same basket costs different amounts depending on where you shop.
            A household buying at {priciest.name} pays{' '}
            <strong style={{ color: '#111827' }}>${gap.toFixed(2)}</strong> more
            per trip than one buying at {cheapest.name} &mdash; for identical
            groceries. Where you shop is a hidden tax.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: INTER, color: '#9CA3AF' }}
          >
            Bulk-vs-small &ldquo;poverty penalty&rdquo; analysis is future work,
            pending structured package-size data across all stores. The figure
            above is the store-to-store gap computed live from the current basket.
          </p>
        </motion.div>

        {/* Right column — the animated comparison */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white border p-8 flex flex-col gap-6"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex flex-col gap-5">
            <BasketBar
              label={`${cheapest.name} (${cheapest.city})`}
              cost={cheapest.basketCost}
              axisMax={priciest.basketCost}
              color="#16A34A"
              inView={inView}
              delay={0.15}
            />
            <BasketBar
              label={`${priciest.name} (${priciest.city})`}
              cost={priciest.basketCost}
              axisMax={priciest.basketCost}
              color="#DC2626"
              inView={inView}
              delay={0.35}
            />
          </div>

          {/* The gap between the two stores, made explicit. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center justify-between gap-4 p-5"
            style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}
          >
            <div className="flex flex-col">
              <span style={{ fontFamily: INTER, fontSize: '13px', color: '#6B7280' }}>
                You pay this much more for the same basket
              </span>
              <span
                className="tabular-nums"
                style={{ fontFamily: DM_MONO, fontSize: '34px', fontWeight: 700, color: '#DC2626', lineHeight: 1.1 }}
              >
                +${penalty.toFixed(2)}
              </span>
            </div>
            <span
              className="text-center px-3 py-2"
              style={{ fontFamily: DM_MONO, fontSize: '14px', fontWeight: 700, color: '#FFFFFF', backgroundColor: '#DC2626' }}
            >
              ${Math.round(annualGap).toLocaleString()}
              <br />
              per year
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
