const INTER = "'Inter', sans-serif";

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '0px',
  boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
  padding: '24px',
  height: '100%',
};

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 700,
  fontSize: '16px',
  color: '#111827',
  lineHeight: 1.3,
};

const PARAGRAPH_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 400,
  fontSize: '14px',
  color: '#4B5563',
  lineHeight: 1.6,
};

const HIGHLIGHT_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 500,
  fontSize: '14px',
  color: '#9A3412',
  lineHeight: 1.6,
  backgroundColor: '#FFF7ED',
  borderLeft: '3px solid #F97316',
  padding: '12px',
  borderRadius: '0px',
};

const FOOTNOTE_STYLE: React.CSSProperties = {
  fontFamily: INTER,
  fontWeight: 400,
  fontSize: '12px',
  color: '#9CA3AF',
  lineHeight: 1.5,
};

export default function ContextPanel(): React.JSX.Element {
  return (
    <aside style={CARD_STYLE}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: '14px',
        }}
      >
        <h2 style={HEADING_STYLE}>How to read this</h2>

        <p style={PARAGRAPH_STYLE}>
          0% is the cheapest store in view. Higher percentages mean more
          expensive. The cheapest store is the reference point.
        </p>

        <p style={PARAGRAPH_STYLE}>
          Large values can happen when local shelf prices, package sizes, or
          product availability differ from the cheapest store's available items.
        </p>

        <p style={HIGHLIGHT_STYLE}>
          Use this as a signal for affordability, not as a measure of store
          markup or profit.
        </p>

        <p style={{ ...FOOTNOTE_STYLE, marginTop: 'auto' }}>
          Data collected June 2026 · 22 stores · 3,088 price observations
        </p>
      </div>
    </aside>
  );
}
