import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type FilterKey = 'city' | 'basket' | 'chain';

export interface FilterBarProps {
  city: string;
  basket: string;
  chain: string;
  /** City options derived from the loaded data, including a leading "All". */
  cityOptions: readonly string[];
  /** Chain options derived from the loaded data, including a leading "All". */
  chainOptions: readonly string[];
  onChange: (key: FilterKey, value: string) => void;
  onReset: () => void;
}

export const BASKET_OPTIONS: readonly string[] = [
  'All',
  'South Asian',
  'Chinese',
  'Filipino',
  'Korean',
  'European',
  'Indigenous',
  'Others',
];

interface FilterPillProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function FilterPill({ label, value, options, onChange }: FilterPillProps): React.JSX.Element {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const active = hovered || focused;

  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        backgroundColor: active ? '#FFFFFF' : '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '0px',
        padding: '12px 14px',
        cursor: 'pointer',
        boxShadow: focused
          ? '0 0 0 3px rgba(37,99,235,0.24)'
          : hovered
            ? '0 4px 12px rgba(17,24,39,0.08)'
            : 'none',
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          fontWeight: 500,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: "'Inter', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            color: '#111827',
            cursor: 'pointer',
            width: '100%',
            paddingRight: '22px',
          }}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          color="#9CA3AF"
          style={{ position: 'absolute', right: 0, pointerEvents: 'none' }}
        />
      </div>
    </label>
  );
}

interface FilterConfig {
  key: FilterKey;
  label: string;
  value: string;
  options: readonly string[];
}

function ResetButton({ onReset }: { onReset: () => void }): React.JSX.Element {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onReset}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        color: '#4B5563',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0 8px',
        textDecoration: hovered ? 'underline' : 'none',
      }}
    >
      Reset
    </button>
  );
}

/** Bottom sheet that slides up from the screen edge on mobile. */
function FilterDrawer({
  open,
  activeCount,
  configs,
  onChange,
  onReset,
  onClose,
}: {
  open: boolean;
  activeCount: number;
  configs: FilterConfig[];
  onChange: (key: FilterKey, value: string) => void;
  onReset: () => void;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filter results"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: '85vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '0px',
              boxShadow: '0 -8px 32px rgba(17,24,39,0.16)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <header className="flex items-center justify-between">
              <h2
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Filter results
                {activeCount > 0 ? ` · ${activeCount} active` : ''}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '0px',
                  border: 'none',
                  background: '#F3F4F6',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </header>

            <div className="grid grid-cols-1 gap-3">
              {configs.map((config) => (
                <FilterPill
                  key={config.key}
                  label={config.label}
                  value={config.value}
                  options={config.options}
                  onChange={(value) => onChange(config.key, value)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <ResetButton onReset={onReset} />
              <button
                type="button"
                onClick={onClose}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: '#111827',
                  border: 'none',
                  borderRadius: '0px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                }}
              >
                Show results
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function FilterBar({
  city,
  basket,
  chain,
  cityOptions,
  chainOptions,
  onChange,
  onReset,
}: FilterBarProps): React.JSX.Element {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The per-store filter lives in the Store-level results section, not here, so
  // people land on the full set of stores for a City / Basket / Chain selection
  // instead of having to hunt for one specific store up front.
  const configs: FilterConfig[] = [
    { key: 'city', label: 'City', value: city, options: cityOptions },
    { key: 'basket', label: 'Household Basket', value: basket, options: BASKET_OPTIONS },
    { key: 'chain', label: 'Chain', value: chain, options: chainOptions },
  ];

  const activeCount = configs.filter((config) => config.value !== 'All').length;

  return (
    <section
      className="sticky top-4 z-20"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '0px',
        boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
        padding: '16px',
      }}
    >
      {/* Desktop / tablet: filters laid out inline. */}
      <div className="hidden gap-4 md:flex md:flex-row md:items-stretch">
        <div className="grid flex-1 grid-cols-3 gap-3">
          {configs.map((config) => (
            <FilterPill
              key={config.key}
              label={config.label}
              value={config.value}
              options={config.options}
              onChange={(value) => onChange(config.key, value)}
            />
          ))}
        </div>

        <div className="flex items-stretch">
          <ResetButton onReset={onReset} />
        </div>
      </div>

      {/* Mobile: a single trigger that opens the filter drawer. */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="w-full md:hidden"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px',
          fontWeight: 600,
          color: '#111827',
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '0px',
          padding: '14px 16px',
          cursor: 'pointer',
        }}
      >
        <SlidersHorizontal size={16} color="#6B7280" />
        Filter results
        {activeCount > 0 ? ` · ${activeCount} active` : ''}
      </button>

      <FilterDrawer
        open={drawerOpen}
        activeCount={activeCount}
        configs={configs}
        onChange={onChange}
        onReset={onReset}
        onClose={() => setDrawerOpen(false)}
      />
    </section>
  );
}
