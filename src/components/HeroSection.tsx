import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

function useCountUp(target: number, duration: number, start: boolean): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, start]);

  return count;
}

export default function HeroSection(): React.JSX.Element {
  const count = useCountUp(277, 1.5, true);
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center bg-[#F9FAFB] pt-14 relative">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
          className="text-xs tracking-[0.2em] uppercase"
          style={{ fontFamily: "'DM Mono', monospace", color: '#6B7280' }}
        >
          Metro Vancouver Grocery Affordability Tracker
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
          style={{ fontFamily: "'Inter', sans-serif", color: '#111827' }}
        >
          Who pays more for groceries in Metro Vancouver?
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="text-7xl sm:text-8xl font-bold tabular-nums"
            style={{ fontFamily: "'DM Mono', monospace", color: '#F97316' }}
          >
            ${count}
          </div>
          <p
            className="text-lg"
            style={{ fontFamily: "'Inter', sans-serif", color: '#6B7280' }}
          >
            per year, the hidden poverty penalty
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-none font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F97316', fontFamily: "'Inter', sans-serif" }}
          >
            Explore the Data
          </button>
          <a
            href={`${import.meta.env.BASE_URL}data/sentinel_prices_master.csv`}
            download
            className="px-6 py-3 rounded-none font-semibold transition-colors hover:bg-orange-50"
            style={{
              border: '2px solid #F97316',
              color: '#F97316',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Download Dataset
          </a>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown size={28} style={{ color: '#6B7280' }} />
      </motion.div>
    </section>
  );
}
