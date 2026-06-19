import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const INTER = "'Inter', sans-serif";
const DM_MONO = "'DM Mono', monospace";

/** Same milk, two package sizes — the gap between them is the poverty penalty. */
const BULK = { label: '4L jug (bulk)', perLitre: 1.55, total: 6.19, color: '#16A34A' };
const SMALL = { label: '4 × 1L bottles', perLitre: 3.25, total: 13.0, color: '#DC2626' };
const PENALTY = SMALL.total - BULK.total; // $6.81 extra for the same 4 litres
const PERCENT_MORE = Math.round((SMALL.perLitre / BULK.perLitre - 1) * 100); // ~110%
const AXIS_MAX = 3.5; // $/L scale the bars are drawn against

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

/** One animated $/litre bar that grows from zero when scrolled into view. */
function PriceBar({
  label,
  perLitre,
  color,
  inView,
  delay,
}: {
  label: string;
  perLitre: number;
  color: string;
  inView: boolean;
  delay: number;
}): React.JSX.Element {
  const widthPct = (perLitre / AXIS_MAX) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span style={{ fontFamily: INTER, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
          {label}
        </span>
        <span style={{ fontFamily: DM_MONO, fontSize: '14px', fontWeight: 600, color }}>
          ${perLitre.toFixed(2)}/L
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

export default function PovertyPenaltySection(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const penalty = useCountUp(PENALTY, 1.2, inView);

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
            What is the Poverty Penalty?
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ fontFamily: INTER, color: '#6B7280' }}
          >
            Low-income households often can't afford bulk sizes. Smaller packages
            cost far more per unit, a hidden tax on poverty. The same 4 litres of
            milk, bought small, costs you more for nothing extra.
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
            <PriceBar {...BULK} inView={inView} delay={0.15} />
            <PriceBar {...SMALL} inView={inView} delay={0.35} />
          </div>

          {/* The gap between the two bars, made explicit. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center justify-between p-5"
            style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}
          >
            <div className="flex flex-col">
              <span style={{ fontFamily: INTER, fontSize: '13px', color: '#6B7280' }}>
                You pay this much more for the same 4 litres
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
              {PERCENT_MORE}% more
              <br />
              per litre
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
