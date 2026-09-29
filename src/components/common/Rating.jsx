import { Star } from 'lucide-react';

export default function Rating({ value = 5, size = 13, showValue = false, count }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      <span className="flex text-gold">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={size} strokeWidth={1.5} fill={i < Math.round(value) ? 'currentColor' : 'none'} />
        ))}
      </span>
      {showValue && <span className="text-xs font-medium text-ink">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-ink-faint">({count})</span>}
    </span>
  );
}
