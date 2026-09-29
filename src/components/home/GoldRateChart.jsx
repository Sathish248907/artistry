import { useMemo, useRef, useState } from 'react';
import { formatDate, formatNumber } from '../../utils/format';

/**
 * Lightweight single-series area chart (no chart library). 2px rose line, recessive grid,
 * crosshair + tooltip on hover/touch. Values are ₹ per 10g for the chosen purity.
 */
export default function GoldRateChart({ data, factor = 1, height = 220, days = 30 }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = height;
  const pad = { t: 16, r: 12, b: 26, l: 12 };

  const points = useMemo(() => {
    const slice = data.slice(-days).map((d) => ({ ...d, v: Math.round((d.rate24 * factor) / 10) * 10 }));
    const vals = slice.map((d) => d.v);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    return slice.map((d, i) => ({
      ...d,
      x: pad.l + (i / (slice.length - 1)) * (W - pad.l - pad.r),
      y: pad.t + (1 - (d.v - min) / span) * (H - pad.t - pad.b),
    }));
  }, [data, factor, days, H]);

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${points.at(-1).x},${H - pad.b} L${points[0].x},${H - pad.b} Z`;
  const last = points.at(-1);

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * W;
    let nearest = points[0];
    points.forEach((p) => {
      if (Math.abs(p.x - x) < Math.abs(nearest.x - x)) nearest = p;
    });
    setHover(nearest);
  };

  const active = hover || last;

  return (
    <div ref={wrapRef} className="relative w-full select-none" onMouseMove={onMove} onTouchMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Gold price trend over the last ${days} days`}>
        <defs>
          <linearGradient id="rate-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B76E79" stopOpacity="0.28" />
            <stop offset="1" stopColor="#B76E79" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={pad.l} x2={W - pad.r} y1={pad.t + t * (H - pad.t - pad.b)} y2={pad.t + t * (H - pad.t - pad.b)} stroke="#E8C4C4" strokeOpacity="0.45" strokeDasharray="3 5" />
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#E8C4C4" />
        <path d={area} fill="url(#rate-fill)" />
        <path d={line} fill="none" stroke="#B76E79" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <line x1={active.x} x2={active.x} y1={pad.t} y2={H - pad.b} stroke="#B76E79" strokeOpacity="0.35" />
        <circle cx={active.x} cy={active.y} r="5" fill="#B76E79" stroke="#FFFAF9" strokeWidth="2" />
        {[points[0], points[Math.floor(points.length / 2)], last].map((p) => (
          <text key={p.date} x={p.x} y={H - 8} textAnchor={p === points[0] ? 'start' : p === last ? 'end' : 'middle'} fontSize="11" fill="#B39A9D" fontFamily="Jost, sans-serif">
            {formatDate(p.date, { day: 'numeric', month: 'short' })}
          </text>
        ))}
      </svg>
      <div
        className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-xl border border-rose-light/70 bg-ivory/95 px-3 py-1.5 text-xs shadow-soft"
        style={{ left: `${Math.min(88, Math.max(12, (active.x / W) * 100))}%` }}
      >
        <span className="text-ink-faint">{formatDate(active.date, { day: 'numeric', month: 'short' })} · </span>
        <span className="font-medium text-ink">₹{formatNumber(active.v)}</span>
      </div>
    </div>
  );
}
