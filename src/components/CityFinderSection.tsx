import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePriceData, type Store } from '../hooks/usePriceData';

/** Best-value store for a city, derived live from the master price CSV. */
interface CityBest {
  name: string;
  bestStore: string;
  /** Best store's percentage above the cheapest store overall, rounded for display. */
  percentMore: number;
  /** Number of stores tracked in the city. */
  storeCount: number;
}

/** Groups loaded stores by city and picks the cheapest store in each. */
function buildCityBest(stores: Store[]): CityBest[] {
  const byCity = new Map<string, Store[]>();
  for (const store of stores) {
    if (store.city === 'Other') continue;
    const list = byCity.get(store.city) ?? [];
    list.push(store);
    byCity.set(store.city, list);
  }

  const result: CityBest[] = [];
  for (const [city, list] of byCity) {
    const best = list.reduce((b, s) => (s.percentMore < b.percentMore ? s : b));
    result.push({
      name: city,
      bestStore: best.name,
      percentMore: Math.round(best.percentMore),
      storeCount: list.length,
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

/** Generates a short, data-driven insight line for the selected city. */
function insightFor(city: CityBest): string {
  const stores = `${city.storeCount} ${city.storeCount === 1 ? 'store' : 'stores'}`;
  if (city.percentMore <= 0) {
    return `Home to the cheapest basket overall. Best value among ${stores} tracked here.`;
  }
  return `Most affordable of ${stores} tracked here, though still above the cheapest store overall.`;
}

export default function CityFinderSection(): React.JSX.Element {
  const { stores, loading } = usePriceData('All');
  const cities = useMemo(() => buildCityBest(stores), [stores]);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const selected = cities.find((city) => city.name === selectedName) ?? null;

  const handleSelect = (name: string): void => {
    setSelectedName((prev) => (prev === name ? null : name));
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "'Inter', sans-serif", color: '#111827' }}
          >
            Find the best value store near you
          </h2>
          <p className="mb-8" style={{ fontFamily: "'Inter', sans-serif", color: '#6B7280' }}>
            Select your city to see the best-value store and a quick insight. Updated
            automatically from the latest collected prices.
          </p>

          {loading ? (
            <p style={{ fontFamily: "'DM Mono', monospace", color: '#9CA3AF' }}>
              Loading latest prices…
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {cities.map((city) => {
                  const isSelected = selected?.name === city.name;
                  return (
                    <button
                      key={city.name}
                      onClick={() => handleSelect(city.name)}
                      className="px-4 py-3 rounded-none font-medium text-sm transition-all duration-200 text-left border"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        backgroundColor: isSelected ? '#F97316' : '#FFFFFF',
                        borderColor: isSelected ? '#F97316' : '#E5E7EB',
                        color: isSelected ? '#FFFFFF' : '#374151',
                      }}
                    >
                      {city.name}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selected && (
                  <motion.div
                    key={selected.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-none bg-white border p-8 shadow-sm"
                    style={{ borderColor: '#E5E7EB' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <h3
                          className="text-2xl font-bold mb-1"
                          style={{ fontFamily: "'Inter', sans-serif", color: '#111827' }}
                        >
                          {selected.name}
                        </h3>
                        <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
                          Best Value Store:{' '}
                          <span className="font-semibold" style={{ color: '#F97316' }}>
                            {selected.bestStore}
                          </span>
                        </p>
                        <p style={{ fontFamily: "'Inter', sans-serif", color: '#374151' }}>
                          {insightFor(selected)}
                        </p>
                      </div>

                      <span
                        className="inline-flex items-center px-4 py-2 rounded-none text-sm font-bold shrink-0 self-start"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          backgroundColor: selected.percentMore <= 0 ? '#DCFCE7' : '#FEE2E2',
                          color: selected.percentMore <= 0 ? '#16A34A' : '#DC2626',
                        }}
                      >
                        {selected.percentMore <= 0
                          ? 'cheapest overall'
                          : `+${selected.percentMore}% vs cheapest`}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
