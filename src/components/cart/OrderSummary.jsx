import { useState } from 'react';
import { Tag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { offerService } from '../../services';
import { formatINR } from '../../utils/format';

export default function OrderSummary({ children, showCoupon = true, extras = [] }) {
  const { totals, coupon, setCoupon, cartCount } = useShop();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);

  const apply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const res = await offerService.validate(code.trim());
    if (res.valid) {
      setCoupon(res.code);
      setMsg({ ok: true, text: `${res.code} applied — 10% off making charges.` });
    } else {
      setMsg({ ok: false, text: 'This code isn’t valid. Try GOLDEN10.' });
    }
  };

  const rows = [
    [`Subtotal · gold value (${cartCount} item${cartCount === 1 ? '' : 's'}, ${totals.weight.toFixed(2)} g)`, formatINR(totals.subtotal)],
    ['Making charges', formatINR(totals.making)],
    ['Discount', totals.discount ? `– ${formatINR(totals.discount)}` : formatINR(0)],
    ['GST (3%)', formatINR(totals.gst)],
    ['Shipping (insured)', totals.shipping ? formatINR(totals.shipping) : 'Free'],
    ...extras.map(([k, v]) => [k, formatINR(v)]),
  ];

  return (
    <div className="rounded-3xl border border-rose-light/60 bg-gradient-to-b from-ivory to-ivory p-6 shadow-soft">
      <p className="font-display text-2xl">Order summary</p>
      <dl className="mt-5 space-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-ink-soft">{k}</dt>
            <dd className={`shrink-0 tabular-nums ${k === 'Discount' && totals.discount ? 'text-rose-deep' : 'text-ink'}`}>{v}</dd>
          </div>
        ))}
      </dl>
      {showCoupon && (
        <form onSubmit={apply} className="mt-5">
          {coupon ? (
            <div className="flex items-center justify-between rounded-xl border border-dashed border-rose bg-rose-blush/60 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-rose-deep">
                <Tag size={15} /> {coupon}
              </span>
              <button type="button" onClick={() => { setCoupon(null); setMsg(null); }} className="text-[11px] uppercase tracking-[0.16em] text-ink-faint hover:text-rose-deep">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="input !py-2.5" aria-label="Coupon code" />
              <button className="btn-outline !px-5 !py-2.5">Apply</button>
            </div>
          )}
          {msg && <p className={`mt-2 text-xs ${msg.ok ? 'text-rose-deep' : 'text-rose-deep'}`}>{msg.text}</p>}
        </form>
      )}
      <div className="rose-rule my-5" />
      <div className="flex items-baseline justify-between">
        <span className="font-medium">Total</span>
        <span className="font-display text-3xl text-rose-deep">{formatINR(totals.total + extras.reduce((n, [, v]) => n + v, 0))}</span>
      </div>
      <p className="mt-1 text-right text-[11px] text-ink-faint">Inclusive of all taxes · priced at today’s gold rate</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
