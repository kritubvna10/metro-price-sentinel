import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo } from 'react';
import type { Store } from '../../hooks/usePriceData';
import { useIsMobile } from '../../hooks/useIsMobile';

export interface PremiumChartProps {
  /** Stores to plot, as aggregated from the master price CSV. */
  stores: Store[];
}

const INTER = "'Inter', sans-serif";
const DM_MONO = "'DM Mono', monospace";

/** Accent for stores that cost more than the cheapest in view. */
const TERRACOTTA = '#B85C4A';

/** Accent for the cheapest / best-value store. */
const BEST_VALUE = '#2E7D5B';

/**
 * The cheapest store has percentMore === 0, i.e. a zero-length bar — and
 * recharts drops zero-dimension rectangles before building LabelList entries,
 * so without a floor that store would render neither a bar nor its label.
 * Giving the Bar this `minPointSize` forces a short but clearly visible bar
 * (and a label) for the best-value store. Bars at or below this width are
 * treated as the cheapest/reference row.
 */
const BEST_VALUE_BAR_MIN = 14;

interface ChartDatum {
  name: string;
  /** Percentage above the cheapest store (drives the bar length; always ≥ 0). */
  percentMore: number;
  /** Observed basket cost in dollars, shown in the tooltip. */
  basketCost: number;
  /** Weekly dollars paid above the cheapest store in view ($0 for the cheapest). */
  povertyPenalty: number;
}

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '0px',
  boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
  padding: '24px',
};

/** Builds chart rows sorted most-expensive-first. */
function buildData(source: Store[]): ChartDatum[] {
  // The poverty penalty is the weekly gap against the cheapest basket in view,
  // computed from the rounded dollar figures so it stays consistent with the
  // basket costs shown in the tooltip (cheapest store reads $0).
  const rounded = source.map((store) => Math.round(store.basketCost));
  const cheapest = rounded.length > 0 ? Math.min(...rounded) : 0;

  return source
    .map((store) => {
      const basketCost = Math.round(store.basketCost);
      return {
        name: store.name,
        percentMore: store.percentMore,
        basketCost,
        povertyPenalty: Math.max(basketCost - cheapest, 0),
      };
    })
    .sort((a, b) => b.percentMore - a.percentMore);
}

function formatPercentMore(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/** Upper axis bound rounded up to the next multiple of 5, with padding. */
function domainBound(data: ChartDatum[]): number {
  const max = data.reduce((acc, d) => Math.max(acc, d.percentMore), 0);
  return Math.ceil((max + 4) / 5) * 5;
}

interface AxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string | number };
}

function XTick({ x = 0, y = 0, payload }: AxisTickProps): React.JSX.Element {
  const value = Number(payload?.value ?? 0);
  return (
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="middle"
      style={{ fontFamily: DM_MONO, fontSize: 11, fill: '#6B7280' }}
    >
      {`${value}%`}
    </text>
  );
}

function YTick({
  x = 0,
  y = 0,
  payload,
  fontSize = 11,
}: AxisTickProps & { fontSize?: number }): React.JSX.Element {
  return (
    <text
      x={x - 12}
      y={y}
      dy={4}
      textAnchor="end"
      style={{ fontFamily: INTER, fontSize, fontWeight: 500, fill: '#4B5563' }}
    >
      {String(payload?.value ?? '')}
    </text>
  );
}

interface BaselineLabelProps {
  viewBox?: { x?: number; y?: number };
}

function BaselineLabel({ viewBox }: BaselineLabelProps): React.JSX.Element {
  const cx = viewBox?.x ?? 0;
  const top = viewBox?.y ?? 0;
  return (
    <text
      x={cx}
      y={top - 8}
      textAnchor="middle"
      style={{ fontFamily: INTER, fontSize: 12, fontWeight: 600, fill: '#6B7280' }}
    >
      Cheapest in view
    </text>
  );
}

interface BarValueLabelProps {
  /** Label value recharts supplies from dataKey="basketCost" (dollars). */
  value?: unknown;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  /**
   * recharts 3 also mirrors the bar geometry under viewBox. cx/cy are only
   * present on the polar viewBox variant; including them keeps this type
   * structurally compatible with recharts' ViewBox union (we never read them).
   */
  viewBox?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    cx?: number;
    cy?: number;
  };
}

/**
 * Renders the basket cost (e.g. "$330/wk") at the end of each bar.
 *
 * recharts 3 does NOT pass an `index` into a LabelList content renderer, so we
 * never look up a `data[index]` datum. Instead the dollar amount comes straight
 * from the `value` prop (dataKey="basketCost"), and the geometry is coerced
 * defensively because recharts may supply it at the root or under `viewBox`.
 *
 * The cheapest store has percentMore === 0; recharts would otherwise drop its
 * zero-width bar (and its label) entirely, so the Bar uses
 * `minPointSize={BEST_VALUE_BAR_MIN}` to give it a short, visible bar. We detect
 * that near-baseline width and flag it as the reference
 * ("$330/wk · cheapest") so the row never reads as blank.
 */
function BarValueLabel(props: BarValueLabelProps): React.JSX.Element | null {
  if (props.value === null || props.value === undefined) return null;
  const value = Number(props.value);
  if (Number.isNaN(value)) return null;

  const x = Number(props.x ?? props.viewBox?.x ?? 0);
  const y = Number(props.y ?? props.viewBox?.y ?? 0);
  const width = Number(props.width ?? props.viewBox?.width ?? 0);
  const height = Number(props.height ?? props.viewBox?.height ?? 0);

  const isCheapest = width <= BEST_VALUE_BAR_MIN + 0.5;
  const text = isCheapest
    ? `$${Math.round(value)}/wk · cheapest`
    : `$${Math.round(value)}/wk`;

  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      textAnchor="start"
      style={{
        fontFamily: DM_MONO,
        fontSize: 12,
        fontWeight: 600,
        fill: '#111827',
      }}
    >
      {text}
    </text>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
}

function ChartTooltip({ active, payload }: TooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;

  const datum = payload[0].payload;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '0px',
        boxShadow: '0 12px 32px rgba(17,24,39,0.16)',
        padding: '14px 16px',
        maxWidth: '280px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <p
        style={{
          fontFamily: INTER,
          fontSize: '14px',
          fontWeight: 700,
          color: '#111827',
          lineHeight: 1.35,
        }}
      >
        {datum.name}
      </p>
      <p style={{ fontFamily: INTER, fontSize: '13px', color: '#374151' }}>
        <span style={{ fontFamily: DM_MONO, fontWeight: 600, color: TERRACOTTA }}>
          {formatPercentMore(datum.percentMore)}
        </span>{' '}
        more than cheapest
      </p>
      <p style={{ fontFamily: INTER, fontSize: '13px', color: '#374151' }}>
        Basket cost:{' '}
        <span style={{ fontFamily: DM_MONO, fontWeight: 600, color: '#111827' }}>
          ${datum.basketCost}/week
        </span>
      </p>
      <p style={{ fontFamily: INTER, fontSize: '13px', color: '#374151' }}>
        Poverty penalty:{' '}
        <span style={{ fontFamily: DM_MONO, fontWeight: 600, color: TERRACOTTA }}>
          ${datum.povertyPenalty}/week
        </span>
      </p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }): React.JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '0px',
          backgroundColor: color,
        }}
      />
      <span style={{ fontFamily: INTER, fontSize: '13px', color: '#4B5563' }}>
        {label}
      </span>
    </span>
  );
}

export default function PremiumChart({ stores }: PremiumChartProps): React.JSX.Element {
  const isMobile = useIsMobile();
  // Memoize so the array identity is stable across unrelated re-renders
  // (hover, isMobile changes). recharts keys its animation/diffing off the
  // data reference; a fresh array each render makes it restart needlessly.
  const data = useMemo(() => buildData(stores), [stores]);
  const bound = useMemo(() => domainBound(data), [data]);
  const ROW_HEIGHT = 56;
  const chartHeight = data.length * ROW_HEIGHT + 64;
  // At 375px the chart is narrow; give the bars more room and shrink the
  // store-name labels a step so longer names don't overflow the axis.
  const yAxisWidth = isMobile ? 124 : 190;
  const yTickFontSize = isMobile ? 10 : 11;

  return (
    <section style={CARD_STYLE}>
      <header style={{ marginBottom: '20px' }}>
        <h2
          style={{
            fontFamily: INTER,
            fontWeight: 700,
            fontSize: '20px',
            color: '#111827',
            lineHeight: 1.3,
          }}
        >
          How stores compare with the cheapest store
        </h2>
        <p
          style={{
            fontFamily: INTER,
            fontWeight: 400,
            fontSize: '14px',
            color: '#4B5563',
            lineHeight: 1.55,
            marginTop: '6px',
            maxWidth: '620px',
          }}
        >
          All stores compared with the cheapest basket in view. 0% is the
          cheapest store; higher means more expensive.
        </p>
      </header>

      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 24, right: 96, bottom: 8, left: 16 }}
            barCategoryGap="28%"
          >
            <CartesianGrid horizontal vertical={false} stroke="#EEF2F7" />
            <XAxis
              type="number"
              domain={[0, bound]}
              tickLine={false}
              axisLine={false}
              tick={<XTick />}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              tickLine={false}
              axisLine={false}
              tick={<YTick fontSize={yTickFontSize} />}
            />
            <Tooltip
              cursor={{ fill: 'rgba(17,24,39,0.04)' }}
              content={<ChartTooltip />}
            />
            <ReferenceLine x={0} stroke="#6B7280" strokeDasharray="4 4">
              <Label content={<BaselineLabel />} position="top" />
            </ReferenceLine>
            <Bar
              dataKey="percentMore"
              barSize={36}
              minPointSize={BEST_VALUE_BAR_MIN}
              radius={[0, 0, 0, 0]}
              // recharts 3's entrance animation is driven by a mount effect.
              // Under React 19 StrictMode that effect double-fires, interrupting
              // the animation and leaving bars stuck at width 0 ("no bar") until
              // an unrelated re-render (e.g. hover) snaps them to final size.
              // Render at final geometry immediately instead.
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell
                  key={d.name}
                  fill={d.percentMore === 0 ? BEST_VALUE : TERRACOTTA}
                />
              ))}
              <LabelList dataKey="basketCost" content={BarValueLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #EEF2F7',
        }}
      >
        <LegendDot color={BEST_VALUE} label="Best value in view" />
        <LegendDot color={TERRACOTTA} label="More expensive than cheapest" />
      </footer>
    </section>
  );
}
