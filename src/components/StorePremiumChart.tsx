import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { usePriceData } from '../hooks/usePriceData';

const INTER = "'Inter', sans-serif";
const DM_MONO = "'DM Mono', monospace";
const CHEAPEST_COLOR = '#16A34A'; // the reference store (0% more)
const ABOVE_COLOR = '#DC2626'; // costs more than the cheapest

interface RowDatum {
  name: string;
  percentMore: number;
}

/** One ranked row: a bar growing from the left, longer the pricier the store. */
function PremiumRow({
  datum,
  maxPercent,
  index,
  inView,
}: {
  datum: RowDatum;
  maxPercent: number;
  index: number;
  inView: boolean;
}): React.JSX.Element {
  const [hovered, setHovered] = useState(false);
  const isCheapest = datum.percentMore < 0.5;
  const color = isCheapest ? CHEAPEST_COLOR : ABOVE_COLOR;
  const widthPct = maxPercent > 0 ? (datum.percentMore / maxPercent) * 100 : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3"
      style={{
        padding: '6px 8px',
        backgroundColor: hovered ? '#F9FAFB' : 'transparent',
        transition: 'background-color 0.12s ease',
      }}
    >
      <span
        className="shrink-0 truncate text-right"
        style={{
          width: '120px',
          fontFamily: INTER,
          fontSize: '13px',
          fontWeight: hovered ? 700 : 500,
          color: '#374151',
        }}
        title={datum.name}
      >
        {datum.name}
      </span>

      <div className="relative flex-1" style={{ height: '28px' }}>
        {/* Left edge marks the cheapest store — the 0% reference. */}
        <div
          className="absolute top-0 bottom-0"
          style={{ left: '0', width: '1px', backgroundColor: '#D1D5DB' }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${widthPct}%` } : { width: 0 }}
          transition={{ duration: 0.8, delay: index * 0.06, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            height: '64%',
            minWidth: isCheapest ? '2px' : undefined,
            backgroundColor: color,
            opacity: hovered ? 1 : 0.9,
          }}
        />
      </div>

      <span
        className="shrink-0 tabular-nums text-right"
        style={{ width: '68px', fontFamily: DM_MONO, fontSize: '13px', fontWeight: 600, color }}
      >
        {isCheapest ? 'cheapest' : `+${Math.round(datum.percentMore)}%`}
      </span>
    </div>
  );
}

export default function StorePremiumChart(): React.JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { stores, loading } = usePriceData('All');

  // Most expensive first, so the question "which charge more?" is answered top-down.
  const data: RowDatum[] = stores
    .filter((store) => store.basketCost > 0)
    .map((store) => ({ name: store.name, percentMore: store.percentMore }))
    .sort((a, b) => b.percentMore - a.percentMore);
  const maxPercent = Math.max(...data.map((d) => d.percentMore), 1);

  // Nothing to chart until the CSV yields priced stores.
  if (loading || data.length === 0) return null;

  return (
    <section id="stores" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: INTER, color: '#111827' }}
          >
            Which stores charge more?
          </h2>
          <p className="mb-10" style={{ fontFamily: INTER, color: '#6B7280' }}>
            Each bar is a store&rsquo;s basket price measured against the cheapest
            store in the network. Longer bars cost more; the cheapest store is the
            0% reference.
          </p>

          <div ref={ref} className="bg-white border p-6" style={{ borderColor: '#E5E7EB' }}>
            {/* Header aligned to the row layout, with the reference marker at the left. */}
            <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
              <span style={{ width: '120px' }} className="shrink-0" />
              <div className="relative flex-1" style={{ height: '16px' }}>
                <span
                  className="absolute whitespace-nowrap"
                  style={{ left: '0', fontFamily: DM_MONO, fontSize: '11px', color: '#6B7280' }}
                >
                  cheapest store
                </span>
              </div>
              <span style={{ width: '68px' }} className="shrink-0" />
            </div>

            <div className="flex flex-col">
              {data.map((datum, index) => (
                <PremiumRow
                  key={datum.name}
                  datum={datum}
                  maxPercent={maxPercent}
                  index={index}
                  inView={inView}
                />
              ))}
            </div>

            {/* Legend */}
            <div
              className="flex flex-wrap gap-5"
              style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #EEF2F7' }}
            >
              <span className="inline-flex items-center gap-2">
                <span style={{ width: '12px', height: '12px', backgroundColor: CHEAPEST_COLOR }} />
                <span style={{ fontFamily: INTER, fontSize: '13px', color: '#4B5563' }}>
                  Cheapest store (0%)
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span style={{ width: '12px', height: '12px', backgroundColor: ABOVE_COLOR }} />
                <span style={{ fontFamily: INTER, fontSize: '13px', color: '#4B5563' }}>
                  Costs more than the cheapest
                </span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
