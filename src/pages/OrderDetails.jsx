import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Download, FileText, Loader2, Package, RotateCcw, XCircle } from 'lucide-react';
import SmartImage from '../components/common/SmartImage';
import CoinArt from '../components/goldCoins/CoinArt';
import BackendLogin from '../components/account/BackendLogin';
import { usePayOrder } from '../components/checkout/PaymentGateway';
import { ORDER_LABEL, PAYMENT_LABEL, REFUND_LABEL, RETURN_LABEL, StatusPill, day, money, orderTone, when } from '../components/account/orderUi';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { openProtectedFile, shopApi } from '../admin/api';
import { itemBySku } from '../data/products';
import { classNames } from '../utils/format';

function Thumb({ item }) {
  const local = itemBySku(item.sku);
  if (local?.isCoin) return <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-rose-blush"><CoinArt motif={local.coin.motif} size={60} /></span>;
  if (local?.image) return <SmartImage name={local.image} width={240} sizes="80px" className="h-20 w-20 shrink-0 rounded-2xl" />;
  return <span className="h-20 w-20 shrink-0 rounded-2xl bg-rose-blush" />;
}

function Section({ title, children, action }) {
  return (
    <section className="rounded-3xl border border-rose-light/60 bg-ivory p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Timeline({ steps }) {
  return (
    <ol className="space-y-0" aria-label="Order progress">
      {steps.map((s, i) => (
        <li key={s.status} className="relative flex gap-4 pb-5 last:pb-0">
          {i < steps.length - 1 && <span className={classNames('absolute left-[13px] top-7 h-[calc(100%-20px)] w-px', s.done && steps[i + 1].done ? 'bg-rose' : 'bg-rose-light')} />}
          <span className={classNames('relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px]', s.done ? 'border-rose bg-rose text-white' : 'border-rose-light bg-ivory text-ink-faint')}>
            {s.done ? <Check size={13} /> : i + 1}
          </span>
          <div className="pt-0.5">
            <p className={classNames('text-sm', s.done ? 'font-medium text-ink' : 'text-ink-faint')}>{s.label}</p>
            {s.at && <p className="text-xs text-ink-faint">{when(s.at)}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ReturnForm({ order, onDone }) {
  const { toast } = useUI();
  const returnable = order.items.filter((i) => i.quantity - (i.returnedQuantity || 0) > 0);
  const [qty, setQty] = useState(Object.fromEntries(returnable.map((i) => [i.id, 0])));
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const chosen = Object.entries(qty).filter(([, q]) => q > 0);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await shopApi(`/orders/${order.id}/return`, { method: 'POST', body: { items: chosen.map(([itemId, quantity]) => ({ itemId, quantity })), reason: reason.trim(), details: details.trim() } });
      toast({ title: 'Return requested', body: 'We will review it and let you know.' });
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-sm text-ink-soft">Choose what you would like to send back. Returns are accepted within {order.returnWindowDays} days of delivery.</p>
      <ul className="divide-y divide-rose-light/40 rounded-2xl border border-rose-light/60">
        {returnable.map((item) => {
          const max = item.quantity - (item.returnedQuantity || 0);
          return (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0">
                <span className="block text-sm text-ink">{item.name}{item.variantName ? ` · ${item.variantName}` : ''}</span>
                <span className="text-xs text-ink-faint">{item.sku} · {money(item.unitPrice)} each · up to {max}</span>
              </span>
              <label className="flex items-center gap-2 text-xs text-ink-soft">
                Return
                <select value={qty[item.id]} onChange={(e) => setQty((q) => ({ ...q, [item.id]: Number(e.target.value) }))} className="rounded-lg border border-rose-light bg-ivory px-2 py-1.5 text-sm text-ink" aria-label={`How many ${item.name} to return`}>
                  {Array.from({ length: max + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </li>
          );
        })}
      </ul>
      <div>
        <label className="label" htmlFor="ret-reason">Reason</label>
        <select id="ret-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="input">
          <option value="">Choose a reason</option>
          {['Does not fit', 'Not as pictured', 'Damaged or defective', 'Received the wrong item', 'Changed my mind', 'Other'].map((r) => <option key={r}>{r}</option>)}
        </select>
        {error?.fields?.reason && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{error.fields.reason}</p>}
      </div>
      <div>
        <label className="label" htmlFor="ret-details">More details (optional)</label>
        <textarea id="ret-details" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} rows={3} className="input" />
      </div>
      {error && !Object.keys(error.fields || {}).length && <p className="text-sm text-rose-deep" role="alert">{error.message}</p>}
      <button className="btn-primary" disabled={busy || !chosen.length || !reason}>{busy && <Loader2 size={15} className="animate-spin" />} Request return</button>
    </form>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const { user, backend, status } = useAuth();
  const { toast } = useUI();
  const { pay, gatewayWindow } = usePayOrder();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returning, setReturning] = useState(false);

  const load = useCallback(() => shopApi(`/orders/${id}`).then((d) => { setOrder(d.order); setError(null); }).catch(setError), [id]);
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (!backend) return <div className="shell py-20 text-center text-sm text-ink-soft">Order details are available when the shop is connected to its server. <Link to="/account?tab=orders" className="text-rose-deep underline">Back to My Orders</Link></div>;
  if (status === 'checking') return <div className="py-24 text-center text-sm text-ink-soft">Loading…</div>;
  if (!user) return <div className="shell max-w-lg py-16"><h1 className="font-display text-3xl">Sign in to see this order</h1><div className="mt-5"><BackendLogin /></div></div>;
  if (error) return <div className="shell py-20 text-center"><p className="font-display text-3xl">Order not found</p><p className="mt-2 text-sm text-ink-soft">{error.message}</p><Link to="/account?tab=orders" className="btn-outline mt-6">My Orders</Link></div>;
  if (!order) return <div className="shell py-16"><div className="h-64 animate-pulse rounded-3xl bg-rose-blush/50" /></div>;

  const act = async (key, fn) => {
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      toast({ title: 'Something went wrong', body: err.message, tone: 'neutral' });
    } finally {
      setBusy(null);
    }
  };

  const payNow = () =>
    act('pay', async () => {
      const result = await pay(order.id);
      if (result.status === 'paid') toast({ title: 'Payment successful', body: 'Your order is confirmed.' });
      else toast({ title: result.message, tone: 'neutral' });
      await load();
    });

  const cancel = (e) => {
    e.preventDefault();
    act('cancel', async () => {
      const { refund } = await shopApi(`/orders/${order.id}/cancel`, { method: 'POST', body: { reason: cancelReason.trim() } });
      toast({ title: 'Order cancelled', body: refund ? (refund.status === 'completed' ? 'Your refund has been issued.' : 'Your refund is being processed.') : undefined });
      setCancelling(false);
      await load();
    });
  };

  const p = order.pricing;
  const a = order.shippingAddress;
  const openReturns = order.returns.filter((r) => ['requested', 'approved', 'pickup_scheduled', 'received', 'inspected'].includes(r.status));

  return (
    <section className="w-full bg-gradient-to-b from-cream to-ivory pb-24 pt-8">
      {gatewayWindow}
      <div className="shell">
        <Link to="/account?tab=orders" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-rose-deep hover:underline"><ArrowLeft size={13} /> My Orders</Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Order</p>
            <h1 className="mt-1 font-display text-4xl" data-testid="order-number">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-ink-soft">Placed {when(order.placedAt)} · {order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={orderTone(order.status)}>{ORDER_LABEL[order.status]}</StatusPill>
            <StatusPill tone={order.payment.status === 'paid' ? 'accent' : order.payment.status === 'failed' ? 'strong' : 'neutral'}>{PAYMENT_LABEL[order.payment.status]}</StatusPill>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {order.customerActions.canPay && <button onClick={payNow} disabled={busy === 'pay'} className="btn-primary">{busy === 'pay' && <Loader2 size={15} className="animate-spin" />} Pay {money(p.grandTotal)}</button>}
          {order.invoiceAvailable && (
            <>
              <button onClick={() => act('inv', () => openProtectedFile(`/orders/${order.id}/invoice?format=html`))} disabled={busy === 'inv'} className="btn-outline"><FileText size={14} /> View invoice</button>
              <button onClick={() => act('pdf', () => openProtectedFile(`/orders/${order.id}/invoice?format=pdf`, { download: `${order.orderNumber}.pdf` }))} disabled={busy === 'pdf'} className="btn-outline"><Download size={14} /> Download PDF</button>
            </>
          )}
          {order.customerActions.canCancel && !cancelling && <button onClick={() => setCancelling(true)} className="btn-outline"><XCircle size={14} /> Cancel order</button>}
          {order.customerActions.canReturn && !returning && <button onClick={() => setReturning(true)} className="btn-outline"><RotateCcw size={14} /> Return items</button>}
        </div>

        {cancelling && (
          <form onSubmit={cancel} className="mt-4 max-w-xl rounded-2xl border border-rose bg-rose-blush/40 p-5">
            <label className="label" htmlFor="cancel-reason">Why are you cancelling?</label>
            <input id="cancel-reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} maxLength={300} className="input" />
            <p className="mt-2 text-xs text-ink-soft">{order.payment.status === 'paid' ? `The full amount of ${money(p.grandTotal - (order.payment.refundedAmount || 0))} will be refunded to your original payment method.` : 'Nothing has been charged, so there is nothing to refund.'}</p>
            <div className="mt-4 flex gap-3">
              <button className="btn-primary" disabled={!cancelReason.trim() || busy === 'cancel'}>{busy === 'cancel' && <Loader2 size={15} className="animate-spin" />} Cancel order</button>
              <button type="button" onClick={() => setCancelling(false)} className="btn-outline">Keep order</button>
            </div>
          </form>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px] [&>*]:min-w-0">
          <div className="space-y-6">
            {returning && (
              <Section title="Return items" action={<button onClick={() => setReturning(false)} className="text-[11px] uppercase tracking-[0.16em] text-ink-soft hover:text-rose-deep">Close</button>}>
                <ReturnForm order={order} onDone={() => { setReturning(false); load(); }} />
              </Section>
            )}

            <Section title="Items">
              <ul className="divide-y divide-rose-light/40">
                {order.items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <Thumb item={item} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="font-display text-xl text-ink">{item.name}{item.variantName ? ` · ${item.variantName}` : ''}</p>
                        <p className="text-sm font-medium tabular-nums text-ink">{money(item.lineTotal)}</p>
                      </div>
                      <p className="text-xs text-ink-faint">{item.sku} · Qty {item.quantity}{item.returnedQuantity ? ` · ${item.returnedQuantity} returned` : ''}</p>
                      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-soft sm:grid-cols-3">
                        {item.goldPurity && <div><dt className="inline text-ink-faint">Gold </dt><dd className="inline">{item.goldPurity}{item.goldWeight ? ` · ${item.goldWeight} g` : ''}</dd></div>}
                        {item.goldRatePerGram && <div><dt className="inline text-ink-faint">Rate </dt><dd className="inline">{money(item.goldRatePerGram)}/g</dd></div>}
                        <div><dt className="inline text-ink-faint">Gold value </dt><dd className="inline">{money(item.goldValue)}</dd></div>
                        <div><dt className="inline text-ink-faint">Making </dt><dd className="inline">{money(item.makingCharges)}</dd></div>
                        {item.wastageCharges > 0 && <div><dt className="inline text-ink-faint">Wastage </dt><dd className="inline">{money(item.wastageCharges)}</dd></div>}
                        {item.stoneCharges > 0 && <div><dt className="inline text-ink-faint">Stones </dt><dd className="inline">{money(item.stoneCharges)}</dd></div>}
                        <div><dt className="inline text-ink-faint">GST </dt><dd className="inline">{item.taxPercentage}% · {money(item.taxAmount)}</dd></div>
                      </dl>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            {order.returns.length > 0 && (
              <Section title="Returns">
                <ul className="space-y-3">
                  {order.returns.map((r) => (
                    <li key={r.id} className="rounded-2xl border border-rose-light/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink">{r.returnNumber}</p>
                        <StatusPill tone={r.status === 'requested' ? 'strong' : r.status === 'completed' ? 'accent' : 'neutral'}>{RETURN_LABEL[r.status]}</StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">{r.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')} · {r.reason}</p>
                      <p className="mt-1 text-xs text-ink-faint">Requested {day(r.createdAt)} · refund {money(r.refundAmount)}</p>
                      {r.status === 'requested' && (
                        <button onClick={() => act(`ret-${r.id}`, async () => { await shopApi(`/returns/${r.id}/cancel`, { method: 'POST' }); toast({ title: 'Return request withdrawn' }); await load(); })} className="mt-2 text-xs text-rose-deep hover:underline">Withdraw request</button>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {order.refunds.length > 0 && (
              <Section title="Refunds">
                <ul className="space-y-3">
                  {order.refunds.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-light/60 p-4">
                      <div>
                        <p className="text-sm font-medium text-ink">{money(r.amount)} · {r.type === 'full' ? 'Full refund' : 'Partial refund'}</p>
                        <p className="text-xs text-ink-faint">{r.refundNumber} · {r.reason} · {day(r.createdAt)}{r.gatewayRefundId ? ` · ref ${r.gatewayRefundId}` : ''}</p>
                      </div>
                      <StatusPill tone={r.status === 'completed' ? 'accent' : r.status === 'failed' ? 'strong' : 'neutral'}>{REFUND_LABEL[r.status]}</StatusPill>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          <div className="space-y-6">
            <Section title="Tracking">
              <Timeline steps={order.timeline} />
              {order.shipment.trackingNumber && <p className="mt-4 rounded-xl bg-rose-blush/60 px-4 py-3 text-sm text-ink"><Package size={14} className="mr-1.5 inline text-rose" />{order.shipment.courier || 'Courier'} · {order.shipment.trackingNumber}</p>}
              {order.shippingMethod.estimatedDelivery && !['delivered', 'cancelled', 'returned', 'refunded'].includes(order.status) && <p className="mt-3 text-xs text-ink-soft">Estimated {order.shippingMethod.code === 'pickup' ? 'ready for pickup' : 'delivery'}: {day(order.shippingMethod.estimatedDelivery)}</p>}
              {openReturns.length > 0 && <p className="mt-3 text-xs text-rose-deep">A return is in progress.</p>}
            </Section>

            <Section title="Price">
              <dl className="space-y-2 text-sm">
                {[
                  ['Items (incl. GST)', money(p.itemsTotal)],
                  ['Gold value', money(p.goldValue), true],
                  ['Making charges', money(p.makingCharges), true],
                  ...(p.wastageCharges ? [['Wastage', money(p.wastageCharges), true]] : []),
                  ...(p.stoneCharges ? [['Stones & diamonds', money(p.stoneCharges), true]] : []),
                  ['GST included', money(p.tax), true],
                  ...(p.discount ? [[`Coupon${p.couponCode ? ` (${p.couponCode})` : ''}`, `− ${money(p.discount)}`]] : []),
                  [order.shippingMethod.label, p.shipping ? money(p.shipping) : 'Free'],
                ].map(([k, v, sub]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className={sub ? 'pl-3 text-xs text-ink-faint' : 'text-ink-soft'}>{k}</dt>
                    <dd className={classNames('tabular-nums', sub ? 'text-xs text-ink-faint' : 'text-ink')}>{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-rose-light/60 pt-3">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-display text-2xl text-rose-deep">{money(p.grandTotal)}</dd>
                </div>
                {order.payment.refundedAmount > 0 && <div className="flex justify-between gap-4"><dt className="text-ink-soft">Refunded</dt><dd className="tabular-nums text-ink">{money(order.payment.refundedAmount)}</dd></div>}
              </dl>
            </Section>

            <Section title="Delivery address">
              <p className="text-sm font-medium text-ink">{a.fullName}</p>
              <p className="text-sm text-ink-soft">{[a.addressLine1, a.addressLine2, a.landmark].filter(Boolean).join(', ')}</p>
              <p className="text-sm text-ink-soft">{a.city}, {a.state} {a.postalCode}, {a.country}</p>
              <p className="mt-1 text-xs text-ink-faint">{a.phone}</p>
            </Section>

            <Section title="Payment">
              <p className="text-sm text-ink">{order.payment.method === 'cod' ? 'Cash on delivery' : 'Online payment'}</p>
              <p className="text-xs text-ink-soft">{PAYMENT_LABEL[order.payment.status]}{order.payment.paidAt ? ` · ${when(order.payment.paidAt)}` : ''}</p>
              {order.payment.record?.gatewayPaymentId && <p className="mt-1 text-xs text-ink-faint">Transaction {order.payment.record.gatewayPaymentId}</p>}
            </Section>
          </div>
        </div>
      </div>
    </section>
  );
}
