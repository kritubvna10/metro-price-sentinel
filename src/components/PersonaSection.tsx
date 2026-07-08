import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMasterRows, buildStores, storeChoicePremium } from '../hooks/usePriceData';

/**
 * Presentation config for each community basket. Labels match the CSV's
 * `persona` values exactly; colors are purely visual. Every number shown
 * (basket cost, best store) is computed from the CSV at runtime — nothing here
 * is a hardcoded metric.
 */
const PERSONA_META: { name: string; color: string }[] = [
  { name: 'South Asian', color: '#F97316' },
  { name: 'Chinese', color: '#EF4444' },
  { name: 'Filipino', color: '#8B5CF6' },
  { name: 'Korean', color: '#06B6D4' },
  { name: 'European', color: '#10B981' },
  { name: 'Indigenous', color: '#F59E0B' },
  { name: 'Others', color: '#64748B' },
];

interface PersonaCardData {
  id: string;
  label: string;
  color: string;
  /** Cheapest store's basket cost for this community, in whole dollars. */
  basketCost: number;
  /** Name of that cheapest store. */
  bestStore: string;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function PersonaCard({ persona, index }: { persona: PersonaCardData; index: number }): React.JSX.Element {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-white rounded-none shadow-sm border overflow-hidden flex flex-col"
      style={{ borderColor: '#E5E7EB' }}
    >
      <div className="h-1 w-full" style={{ backgroundColor: persona.color }} />
      <div className="p-6 flex flex-col gap-3 flex-1">
        <h3
          className="font-bold text-lg"
          style={{ fontFamily: "'Inter', sans-serif", color: '#111827' }}
        >
          {persona.label}
        </h3>
        <div>
          <p
            className="text-3xl font-bold tabular-nums"
            style={{ fontFamily: "'DM Mono', monospace", color: '#111827' }}
          >
            ${persona.basketCost}
            <span
              className="text-sm font-normal ml-1"
              style={{ fontFamily: "'Inter', sans-serif", color: '#6B7280' }}
            >
              /basket
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>
            Best value store:
          </p>
          <p
            className="text-sm font-semibold"
            style={{ fontFamily: "'Inter', sans-serif", color: persona.color }}
          >
            {persona.bestStore}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export default function PersonaSection(): React.JSX.Element {
  const { rows, loading } = useMasterRows();

  const personas = useMemo<PersonaCardData[]>(() => {
    const present = new Set(rows.map((row) => row.persona?.trim()).filter(Boolean));
    return PERSONA_META.filter((meta) => present.has(meta.name))
      .map((meta) => {
        const { stores } = buildStores(rows, meta.name);
        const { cheapest } = storeChoicePremium(stores);
        return {
          id: slugify(meta.name),
          label: meta.name,
          color: meta.color,
          basketCost: cheapest ? Math.round(cheapest.basketCost) : 0,
          bestStore: cheapest ? cheapest.name : '—',
        };
      })
      .filter((persona) => persona.basketCost > 0);
  }, [rows]);

  return (
    <section className="py-24 bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "'Inter', sans-serif", color: '#111827' }}
          >
            Your household, your basket
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", color: '#6B7280' }}>
            The cheapest store for each community&rsquo;s basket, computed from the
            latest collected prices.
          </p>
        </motion.div>

        {loading ? (
          <p style={{ fontFamily: "'DM Mono', monospace", color: '#9CA3AF' }}>
            Loading latest prices…
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {personas.map((persona, index) => (
              <PersonaCard key={persona.id} persona={persona} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
