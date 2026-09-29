import { priceBreakup, ratePerGram } from '../../utils/pricing';
import { formatINR, formatNumber } from '../../utils/format';

export default function PriceBreakup({ product, compact = false }) {
  const b = priceBreakup(product);
  const rows = [
    [`Gold value (${product.purity} · ${product.weight} g @ ₹${formatNumber(ratePerGram(product.purity))}/g)`, b.goldValue],
    [`Making charges (${product.makingPct}%)`, b.making],
    ...(b.stoneValue ? [['Gemstone value', b.stoneValue]] : []),
    ['GST (3%)', b.gst],
  ];
  return (
    <div className={compact ? '' : 'rounded-2xl border border-rose-light/60 bg-ivory p-5'}>
      {!compact && <p className="eyebrow mb-4">Transparent price break-up</p>}
      <dl className="space-y-2.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-ink-soft">{k}</dt>
            <dd className="shrink-0 tabular-nums text-ink">{formatINR(v)}</dd>
          </div>
        ))}
        <div className="rose-rule my-3" />
        <div className="flex justify-between text-base">
          <dt className="font-medium text-ink">Total price</dt>
          <dd className="font-display text-2xl text-rose-deep">{formatINR(b.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
