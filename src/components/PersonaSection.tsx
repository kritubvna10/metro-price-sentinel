import { motion } from 'framer-motion';
import { personas, type Persona } from '../data/storeData';

function PersonaCard({ persona, index }: { persona: Persona; index: number }): React.JSX.Element {
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
              /week
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>
            Best nearby store:
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
            Select your community to see which stores best serve your weekly shopping needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map((persona, index) => (
            <PersonaCard key={persona.id} persona={persona} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
