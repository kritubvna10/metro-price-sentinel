import { useState } from 'react';

const INTER = "'Inter', sans-serif";

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 700,
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#6B7280',
  marginBottom: '14px',
};

const BODY_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 400,
  fontSize: '15px',
  color: '#4B5563',
  lineHeight: 1.65,
  maxWidth: '760px',
};

function OutlinedButton(): React.JSX.Element {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`${import.meta.env.BASE_URL}data/sentinel_prices_master.csv`}
      download
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block w-full text-center md:inline-block md:w-auto"
      style={{
        fontFamily: INTER,
        fontWeight: 600,
        fontSize: '14px',
        color: '#111827',
        textDecoration: 'none',
        padding: '11px 20px',
        borderRadius: '0px',
        border: '1px solid #111827',
        backgroundColor: hovered ? '#111827' : 'transparent',
        transition: 'background-color 0.15s ease, color 0.15s ease',
        whiteSpace: 'nowrap',
        ...(hovered ? { color: '#FFFFFF' } : null),
      }}
    >
      Download Full Dataset CSV
    </a>
  );
}

function MethodologyLink(): React.JSX.Element {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="/methodology"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block w-full text-center md:inline-block md:w-auto md:text-left"
      style={{
        fontFamily: INTER,
        fontWeight: 600,
        fontSize: '14px',
        color: '#111827',
        textDecoration: hovered ? 'underline' : 'none',
        textUnderlineOffset: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      Read Methodology
    </a>
  );
}

export default function MethodologyFooter(): React.JSX.Element {
  return (
    <footer
      style={{
        backgroundColor: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px',
        }}
      >
        <h2 style={HEADING_STYLE}>About this comparison</h2>

        <p style={BODY_STYLE}>
          Prices were collected from 22 Metro Vancouver stores in June 2026 and
          compared against Statistics Canada provincial average food price
          baselines (Table 18-10-0245-01). Store Premium shows how much higher or
          lower a store&rsquo;s observed prices are compared with that baseline for
          the selected basket.
        </p>

        <p style={{ ...BODY_STYLE, marginTop: '16px' }}>
          This is a baseline comparison, not a claim about store markup, profit,
          or price gouging.
        </p>

        <div className="mt-6 flex flex-col items-stretch gap-4 md:flex-row md:flex-wrap md:items-center md:gap-5">
          <OutlinedButton />
          <MethodologyLink />
        </div>
      </div>
    </footer>
  );
}
