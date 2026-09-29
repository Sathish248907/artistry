import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({ value, onChange, min = 1, max = 10, small = false }) {
  const btn = small ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <div className="inline-flex items-center rounded-full border border-rose-light/70 bg-ivory">
      <button type="button" className={`${btn} flex items-center justify-center text-ink-soft transition hover:text-rose-deep disabled:opacity-30`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus size={14} />
      </button>
      <span className="w-7 text-center text-sm font-medium tabular-nums">{value}</span>
      <button type="button" className={`${btn} flex items-center justify-center text-ink-soft transition hover:text-rose-deep disabled:opacity-30`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={14} />
      </button>
    </div>
  );
}
