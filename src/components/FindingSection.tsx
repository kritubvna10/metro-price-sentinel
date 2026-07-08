import { motion } from 'framer-motion';
import { usePriceData, storeChoicePremium } from '../hooks/usePriceData';

export default function FindingSection(): React.JSX.Element | null {
  const { stores, loading, dateRangeLabel, observationCount } = usePriceData('All');
  const { cheapest, priciest, perTrip } = storeChoicePremium(stores);

  // The finding is the real store-to-store gap; show nothing until the CSV
  // yields two distinct priced stores to compare.
  if (loading || !cheapest || !priciest || cheapest.name === priciest.name) {
    return null;
  }

  const percentMore = Math.round((perTrip / cheapest.basketCost) * 100);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center"
        >
          <p
            className="text-xs tracking-[0.2em] uppercase mb-8"
            style={{ fontFamily: "'DM Mono', monospace", color: '#6B7280' }}
          >
            This Week&rsquo;s Finding
          </p>

          <blockquote>
            <p
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug"
              style={{ fontFamily: "'Inter', sans-serif", color: '#111827' }}
            >
              A household shopping at {priciest.name} in {priciest.city} pays{' '}
              <span style={{ color: '#F97316' }}>
                {percentMore}% more (${perTrip.toFixed(2)} per trip)
              </span>{' '}
              for the same basket than one shopping at {cheapest.name} in{' '}
              {cheapest.city}.
            </p>
          </blockquote>

          <p
            className="mt-8 text-sm"
            style={{ fontFamily: "'DM Mono', monospace", color: '#6B7280' }}
          >
            {cheapest.name} vs {priciest.name} · {dateRangeLabel} ·{' '}
            {observationCount.toLocaleString()} prices collected
          </p>
        </motion.div>
      </div>
    </section>
  );
}
