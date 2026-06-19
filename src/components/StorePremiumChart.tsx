import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { stores } from '../data/storeData';

const INTER = "'Inter', sans-serif";
const DM_MONO = "'DM Mono', monospace";
const BELOW_COLOR = '#16A34A'; // cheaper than baseline
const ABOVE_COLOR = '#DC2626'; // pricier than baseline

interface RowDatum {
  name: string;
  premium: number;
}

/** One ranked row: a bar diverging left/right from the central baseline. */
function PremiumRow({
  datum,
  maxAbs,
  index,
  inView,
}: {
  datum: RowDatum;
  maxAbs: number;
  index: number;
  inView: boolean;
}): React.JSX.Element {
  const [hovered, setHovered] = useState(false);
  const below = datum.premium < 0;
  const color = below ? BELOW_COLOR : ABOVE_COLOR;
  const widthPct = (Math.abs(datum.premium) / maxAbs) * 50;

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
        {/* Central StatCan baseline tick. */}
        <div
          className="absolute top-0 bottom-0"
          style={{ left: '50%', width: '1px', backgroundColor: '#D1D5DB' }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${widthPct}%` } : { width: 0 }}
          transition={{ duration: 0.8, delay: index * 0.06, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '64%',
            backgroundColor: color,
            opacity: hovered ? 1 : 0.9,
            ...(below ? { right: '50%' } : { left: '50%' }),
          }}
        />
      </div>

      <span
        className="shrink-0 tabular-nums text-right"
        style={{ width: '52px', fontFamily: DM_MONO, fontSize: '13px', fontWeight: 600, color }}
      >
        {datum.premium > 0 ? '+' : ''}{datum.premium}%
      </span>
    </div>
  );
}

export default function StorePremiumChart(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // Most expensive first, so the question "which charge more?" is answered top-down.
  const data: RowDatum[] = [...stores]
    .map((s) => ({ name: s.name, premium: s.premium }))
    .sort((a, b) => b.premium - a.premium);
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.premium)), 1);

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
            Each bar is a store's basket price against the Statistics Canada baseline.
            Bars to the right cost more; bars to the left cost less.
          </p>

          <div ref={ref} className="bg-white border p-6" style={{ borderColor: '#E5E7EB' }}>
            {/* Header aligned to the row layout, with the baseline marker centered. */}
            <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
              <span style={{ width: '120px' }} className="shrink-0" />
              <div className="relative flex-1" style={{ height: '16px' }}>
                <span
                  className="absolute -translate-x-1/2 whitespace-nowrap"
                  style={{ left: '50%', fontFamily: DM_MONO, fontSize: '11px', color: '#6B7280' }}
                >
                  StatCan baseline
                </span>
              </div>
              <span style={{ width: '52px' }} className="shrink-0" />
            </div>

            <div className="flex flex-col">
              {data.map((datum, index) => (
                <PremiumRow
                  key={datum.name}
                  datum={datum}
                  maxAbs={maxAbs}
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
                <span style={{ width: '12px', height: '12px', backgroundColor: BELOW_COLOR }} />
                <span style={{ fontFamily: INTER, fontSize: '13px', color: '#4B5563' }}>
                  Cheaper than baseline
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span style={{ width: '12px', height: '12px', backgroundColor: ABOVE_COLOR }} />
                <span style={{ fontFamily: INTER, fontSize: '13px', color: '#4B5563' }}>
                  Pricier than baseline
                </span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
