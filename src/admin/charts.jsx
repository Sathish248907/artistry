import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { STOCK_STATUS, count, dateOnly, money } from './ui';

const SURFACE = '#FFFAF9';
const LINE = '#B76E79';
const GRID = '#F1E3E2'; // one step off the surface
const INK = '#4F3337';
const MUTED = '#86686C';

/** Round an axis to clean steps: 5,800 · 6,000 · 6,200 … */
const niceTicks = (min, max, target = 4) => {
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.02);
    return niceTicks(min - pad, max + pad, target);
  }
  const rough = (max - min) / target;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) || 10 * magnitude;
  const start = Math.floor(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + step * 0.999; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
};

const useWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
};

/**
 * Gold rate over time — one series, so no legend: the card title names it.
 * Pointer or arrow keys move a crosshair; every value is also available in the table view.
 * @param {{date: string, ratePerGram: number}[]} points
 */
export function RateTrendChart({ points, purity }) {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const [asTable, setAsTable] = useState(false);
  const titleId = useId();

  const height = 220;
  const margin = { top: 16, right: 64, bottom: 28, left: 52 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;

  const scale = useMemo(() => {
    if (!points.length) return null;
    const values = points.map((p) => p.ratePerGram);
    const ticks = niceTicks(Math.min(...values), Math.max(...values));
    const lo = ticks[0];
    const hi = ticks[ticks.length - 1];
    const x = (i) => margin.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = (v) => margin.top + innerH - ((v - lo) / (hi - lo || 1)) * innerH;
    return { ticks, x, y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, innerW, innerH]);

  if (!points.length) return <p className="py-8 text-center text-sm text-ink-soft">No {purity} rate has been recorded yet.</p>;

  const last = points[points.length - 1];
  const first = points[0];
  const toggle = (
    <button type="button" onClick={() => setAsTable((v) => !v)} className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline">
      {asTable ? 'View chart' : 'View as table'}
    </button>
  );

  if (asTable) {
    return (
      <div>
        <div className="mb-2 flex justify-end">{toggle}</div>
        <div className="max-h-56 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-rose-light/60 text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                <th scope="col" className="py-2 font-medium">Date</th>
                <th scope="col" className="py-2 text-right font-medium">{purity} per gram</th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p) => (
                <tr key={p.date} className="border-b border-rose-light/30 last:border-0">
                  <td className="py-1.5 text-ink">{dateOnly(p.date)}</td>
                  <td className="py-1.5 text-right tabular-nums text-ink">{money(p.ratePerGram)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const path = scale ? points.map((p, i) => `${i ? 'L' : 'M'}${scale.x(i).toFixed(1)},${scale.y(p.ratePerGram).toFixed(1)}`).join(' ') : '';
  const baseY = margin.top + innerH;
  const area = scale && points.length > 1 ? `${path} L${scale.x(points.length - 1).toFixed(1)},${baseY} L${scale.x(0).toFixed(1)},${baseY} Z` : '';
  const shown = active == null ? null : points[active];

  const nearest = (clientX, rect) => {
    const px = clientX - rect.left;
    if (points.length === 1) return 0;
    const ratio = (px - margin.left) / (innerW || 1);
    return Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1))));
  };
  const onKey = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const start = active == null ? points.length - 1 : active;
      setActive(Math.max(0, Math.min(points.length - 1, start + (event.key === 'ArrowRight' ? 1 : -1))));
    } else if (event.key === 'Escape') setActive(null);
  };

  const tipLeft = shown && scale ? Math.min(Math.max(scale.x(active), 70), Math.max(70, width - 70)) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <p id={titleId} className="text-xs text-ink-soft">
          {points.length === 1 ? `${dateOnly(first.date)} · the line appears once there are rates on more than one day` : `${dateOnly(first.date)} – ${dateOnly(last.date)}`}
        </p>
        {toggle}
      </div>
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && scale && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-labelledby={titleId}
            aria-label={`${purity} gold rate per gram, ${dateOnly(first.date)} to ${dateOnly(last.date)}. Latest ${money(last.ratePerGram)}. Use the arrow keys to read each day.`}
            tabIndex={0}
            onKeyDown={onKey}
            onBlur={() => setActive(null)}
            onPointerMove={(e) => setActive(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))}
            onPointerLeave={() => setActive(null)}
            className="block touch-pan-y rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-rose/50"
          >
            {scale.ticks.map((tick) => (
              <g key={tick}>
                <line x1={margin.left} x2={margin.left + innerW} y1={scale.y(tick)} y2={scale.y(tick)} stroke={GRID} strokeWidth="1" />
                <text x={margin.left - 8} y={scale.y(tick)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={MUTED} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {count(tick)}
                </text>
              </g>
            ))}
            <text x={margin.left} y={height - 8} fontSize="11" fill={MUTED}>{dateOnly(first.date)}</text>
            {points.length > 1 && (
              <text x={margin.left + innerW} y={height - 8} textAnchor="end" fontSize="11" fill={MUTED}>{dateOnly(last.date)}</text>
            )}

            {area && <path d={area} fill={LINE} opacity="0.1" />}
            {points.length > 1 && <path d={path} fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}

            {/* End marker with a surface ring, and the one direct label: the latest value */}
            <circle cx={scale.x(points.length - 1)} cy={scale.y(last.ratePerGram)} r="6" fill={SURFACE} />
            <circle cx={scale.x(points.length - 1)} cy={scale.y(last.ratePerGram)} r="4" fill={LINE} />
            <text x={scale.x(points.length - 1) + 10} y={scale.y(last.ratePerGram)} dominantBaseline="middle" fontSize="12" fontWeight="600" fill={INK}>
              {count(last.ratePerGram)}
            </text>

            {shown && (
              <g pointerEvents="none">
                <line x1={scale.x(active)} x2={scale.x(active)} y1={margin.top} y2={baseY} stroke={MUTED} strokeWidth="1" />
                <circle cx={scale.x(active)} cy={scale.y(shown.ratePerGram)} r="6" fill={SURFACE} />
                <circle cx={scale.x(active)} cy={scale.y(shown.ratePerGram)} r="4" fill={LINE} />
              </g>
            )}
          </svg>
        )}
        {shown && (
          <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-rose-light bg-ivory px-3 py-1.5 text-center shadow-soft" style={{ left: tipLeft }} role="status">
            <p className="text-sm font-semibold text-ink">{money(shown.ratePerGram)}</p>
            <p className="text-[11px] text-ink-soft">{dateOnly(shown.date)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Share of SKUs by stock status: one bar, three ordered segments on a single-hue ramp (light → dark = more urgent).
 * The legend carries the names and the counts, so nothing depends on colour alone.
 */
export function StockStatusBar({ inStock, lowStock, outOfStock }) {
  const [hover, setHover] = useState(null);
  const segments = [
    { key: 'in_stock', value: inStock },
    { key: 'low_stock', value: lowStock },
    { key: 'out_of_stock', value: outOfStock },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const share = (value) => (total ? Math.round((value / total) * 100) : 0);
  const visible = segments.filter((s) => s.value > 0);

  const hovered = hover ? segments.find((s) => s.key === hover) : null;

  return (
    <div>
      {/* The readout has its own line, so it never covers anything. Value first, then the name. */}
      <p className="mb-2 h-5 text-sm" role="status">
        {hovered ? (
          <>
            <span className="font-semibold text-ink">{count(hovered.value)} SKUs · {share(hovered.value)}%</span> <span className="text-ink-soft">{STOCK_STATUS[hovered.key].label}</span>
          </>
        ) : (
          <span className="text-ink-soft">{count(total)} SKUs tracked</span>
        )}
      </p>
      <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded" role="group" aria-label="SKUs by stock status">
        {total === 0 && <div className="h-full w-full rounded bg-rose-blush" />}
        {visible.map((s) => (
          <button
            key={s.key}
            type="button"
            onPointerEnter={() => setHover(s.key)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(s.key)}
            onBlur={() => setHover(null)}
            aria-label={`${STOCK_STATUS[s.key].label}: ${count(s.value)} SKUs, ${share(s.value)}%`}
            className="h-full min-w-[6px] cursor-default outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ink/40"
            style={{ flexGrow: s.value, flexBasis: 0, background: STOCK_STATUS[s.key].color, opacity: hover && hover !== s.key ? 0.55 : 1 }}
          />
        ))}
      </div>
      {/* Legend doubles as the table view: every status with its count and share */}
      <ul className="mt-4 divide-y divide-rose-light/40">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2.5 py-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: STOCK_STATUS[s.key].color }} />
            <span className="text-ink-soft">{STOCK_STATUS[s.key].label}</span>
            <span className="ml-auto font-semibold tabular-nums text-ink">{count(s.value)}</span>
            <span className="w-12 text-right text-xs tabular-nums text-ink-faint">{share(s.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
