import { motion } from 'framer-motion';

export default function FindingSection(): React.JSX.Element {
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
            This Week's Finding
          </p>

          <blockquote>
            <p
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug"
              style={{ fontFamily: "'Inter', sans-serif", color: '#111827' }}
            >
              South Asian households in North Vancouver pay{' '}
              <span style={{ color: '#F97316' }}>31% more for staples</span>{' '}
              than families in Surrey, because toor dal and bulk atta don't exist at their nearest store.
            </p>
          </blockquote>

          <p
            className="mt-8 text-sm"
            style={{ fontFamily: "'DM Mono', monospace", color: '#6B7280' }}
          >
            Save-On-Foods Lonsdale · June 2026 · 140 prices collected
          </p>
        </motion.div>
      </div>
    </section>
  );
}
