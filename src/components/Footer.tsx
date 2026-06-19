export default function Footer(): React.JSX.Element {
  return (
    <footer style={{ backgroundColor: '#111827' }}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Left */}
          <div className="flex flex-col gap-2">
            <p
              className="font-bold text-lg tracking-widest"
              style={{ fontFamily: "'DM Mono', monospace", color: '#F97316' }}
            >
              PRICE SENTINEL
            </p>
            <p className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: '#9CA3AF' }}>
              Independent Civic Data · Metro Vancouver
            </p>
            <p
              className="text-sm"
              style={{ fontFamily: "'DM Mono', monospace", color: '#6B7280' }}
            >
              22 stores tracked · June 2026
            </p>
          </div>

          {/* Center */}
          <div className="flex flex-col gap-3">
            <a
              href={`${import.meta.env.BASE_URL}data/sentinel_prices_master.csv`}
              download
              className="px-4 py-2 rounded-none text-sm font-medium border transition-colors hover:bg-white/10 text-left"
              style={{
                fontFamily: "'Inter', sans-serif",
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#F9FAFB',
                textDecoration: 'none',
              }}
            >
              Download Full Dataset CSV
            </a>
            <button
              type="button"
              className="px-4 py-2 rounded-none text-sm font-medium border transition-colors hover:bg-white/10 text-left"
              style={{
                fontFamily: "'Inter', sans-serif",
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#F9FAFB',
              }}
            >
              Methodology & Sources
            </button>
            <a
              href="https://github.com/kritubvnasharma/metro-price-sentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-none text-sm font-medium border transition-colors hover:bg-white/10 text-left"
              style={{
                fontFamily: "'Inter', sans-serif",
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#F9FAFB',
                textDecoration: 'none',
              }}
            >
              GitHub Repository
            </a>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-2">
            <p
              className="text-sm font-semibold mb-1"
              style={{ fontFamily: "'Inter', sans-serif", color: '#D1D5DB' }}
            >
              Data sources:
            </p>
            <p className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: '#6B7280' }}>
              Statistics Canada Table 18-10-0245-01
            </p>
            <p className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: '#6B7280' }}>
              Store prices: Direct collection via scraping
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t py-5 text-center"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <p
          className="text-xs max-w-2xl mx-auto px-6 leading-relaxed"
          style={{ fontFamily: "'DM Mono', monospace", color: '#4B5563' }}
        >
          ▲ PILOT DATA. Prices are illustrative. Automated weekly collection launching Q3 2026.
        </p>
      </div>
    </footer>
  );
}
