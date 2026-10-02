import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, CheckCircle2, CreditCard, Loader2, Lock, Store, Truck, Zap } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import SmartImage from '../common/SmartImage';
import CoinArt from '../goldCoins/CoinArt';
import AddressBook from '../account/AddressBook';
import { LoginStep, STEPS, Stepper } from './CheckoutSteps';
import { usePayOrder } from './PaymentGateway';
import { EASE } from '../common/Reveal';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import { useUI } from '../../context/UIContext';
import { shopApi, shopRequest } from '../../admin/api';
import { itemBySku } from '../../data/products';
import { classNames, formatDate } from '../../utils/format';
import { money } from '../account/orderUi';


const SHIPPING_ICONS = { standard: Truck, express: Zap, pickup: Store };

function Thumb({ sku, size = 48 }) {
  const item = itemBySku(sku);
  if (item?.isCoin) return <span className="flex shrink-0 items-center justify-center rounded-xl bg-rose-blush" style={{ width: size, height: size }}><CoinArt motif={item.coin.motif} size={size * 0.75} /></span>;
  if (item?.image) return <SmartImage name={item.image} width={160} sizes={`${size}px`} className="shrink-0 rounded-xl" style={{ width: size, height: size }} />;
  return <span className="shrink-0 rounded-xl bg-rose-blush" style={{ width: size, height: size }} />;
}

/** The order total as the backend worked it out, line by line. */
export function QuoteSummary({ quote, children }) {
  const { applyCoupon } = useShop();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  if (!quote) return <div className="h-64 animate-pulse rounded-3xl bg-rose-blush/50" />;
  const t = quote.totals;
  const rows = [
    [`Items (${t.itemCount}) · incl. GST`, money(t.itemsTotal)],
    ['  Gold value', money(t.goldValue), true],
    ['  Making charges', money(t.makingCharges), true],
    ...(t.wastageCharges ? [['  Wastage', money(t.wastageCharges), true]] : []),
    ...(t.stoneCharges ? [['  Stones & diamonds', money(t.stoneCharges), true]] : []),
    ...(t.otherCharges ? [['  Other charges', money(t.otherCharges), true]] : []),
    ['  GST included', money(t.tax), true],
    ...(t.discount ? [[`Coupon${quote.coupon ? ` (${quote.coupon.code})` : ''}`, `− ${money(t.discount)}`]] : []),
    [`Delivery${quote.shippingMethod ? ` · ${quote.shippingMethod.label}` : ''}`, t.shipping ? money(t.shipping) : 'Free'],
  ];
  return (
    <div className="rounded-3xl border border-rose-light/60 bg-ivory p-6 shadow-soft">
      <p className="font-display text-2xl">Order summary</p>
      {children && <div className="mt-4">{children}</div>}
      <dl className="mt-5 space-y-2.5 text-sm">
        {rows.map(([k, v, sub]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className={sub ? 'pl-3 text-xs text-ink-faint' : 'text-ink-soft'}>{k.trim()}</dt>
            <dd className={classNames('shrink-0 tabular-nums', sub ? 'text-xs text-ink-faint' : 'text-ink')}>{v}</dd>
          </div>
        ))}
      </dl>
      <form
        className="mt-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (code.trim()) setMsg(await applyCoupon(code.trim()));
        }}
      >
        {quote.coupon ? (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-rose bg-rose-blush/60 px-4 py-3 text-sm text-rose-deep">
            <span>{quote.coupon.code} · {money(quote.coupon.discount)} off</span>
            <button type="button" onClick={async () => { setMsg(await applyCoupon(null)); setCode(''); }} className="text-[11px] uppercase tracking-[0.16em] text-ink-faint hover:text-rose-deep">Remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="input !py-2.5" aria-label="Coupon code" />
            <button className="btn-outline !px-5 !py-2.5">Apply</button>
          </div>
        )}
        {msg && <p className={classNames('mt-2 text-xs', msg.ok ? 'text-ink-soft' : 'text-rose-deep')} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}
      </form>
      <div className="rose-rule my-5" />
      <div className="flex items-baseline justify-between">
        <span className="font-medium">Total payable</span>
        <span className="font-display text-3xl text-rose-deep" data-testid="grand-total">{money(t.grandTotal)}</span>
      </div>
      <p className="mt-1 text-right text-[11px] text-ink-faint">Priced on the server at today’s gold rate</p>
    </div>
  );
}

export default function BackendCheckout() {
  const { user, status } = useAuth();
  const { cart, cartMode, refreshCart, sizes } = useShop();
  const { toast } = useUI();
  const { pay, gatewayWindow } = usePayOrder();

  const [step, setStep] = useState(user ? 1 : 0);
  const [addressId, setAddressId] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [paymentProblem, setPaymentProblem] = useState(null);
  const idempotencyKey = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    if (user && step === 0) setStep(1);
  }, [user, step]);

  const recalculate = useCallback(async () => {
    if (!user) return null;
    try {
      const data = await shopApi('/checkout/calculate', { method: 'POST', body: { addressId: addressId || undefined, shippingMethod } });
      setQuote(data);
      return data;
    } catch (err) {
      setError(err);
      return null;
    }
  }, [user, addressId, shippingMethod]);

  useEffect(() => {
    recalculate();
  }, [recalculate, cart]);

  const sizeNote = useMemo(() => {
    const parts = cart.filter((l) => l.sku && sizes[l.sku]).map((l) => `${l.product.name}: size ${sizes[l.sku]}`);
    return parts.length ? `Sizes — ${parts.join('; ')}` : '';
  }, [cart, sizes]);

  const settlePayment = async (placed) => {
    const result = await pay(placed.id);
    if (result.status === 'paid') {
      setOrder(result.order);
      setPaymentProblem(null);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPaymentProblem(result);
    }
  };

  const placeOrder = async () => {
    setBusy(true);
    setError(null);
    setPaymentProblem(null);
    try {
      const { data } = await shopRequest('/checkout/create-order', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
        body: { addressId, shippingMethod, paymentMethod, customerNote: sizeNote || undefined },
      });
      await refreshCart().catch(() => {});
      if (data.next === 'pay') {
        setOrder(data.order);
        await settlePayment(data.order);
      } else {
        setOrder(data.order);
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err);
      if (err.code === 'CHECKOUT_BLOCKED') recalculate();
    } finally {
      setBusy(false);
    }
  };

  const retryPayment = async () => {
    setBusy(true);
    try {
      await settlePayment(order);
    } catch (err) {
      toast({ title: 'Payment could not start', body: err.message, tone: 'neutral' });
    } finally {
      setBusy(false);
    }
  };

  if (status === 'checking') return <div className="w-full bg-ivory py-24 text-center text-sm text-ink-soft">Loading…</div>;

  if (step !== 4 && !order && cartMode === 'backend' && quote && !quote.items.length) {
    return (
      <div className="w-full bg-ivory py-20">
        <div className="shell"><EmptyState title="Nothing to check out yet" copy="Add a piece to your cart to begin." action={{ label: 'Shop gold', to: '/products' }} /></div>
      </div>
    );
  }
  if (!user && !cart.length) {
    return (
      <div className="w-full bg-ivory py-20">
        <div className="shell"><EmptyState title="Nothing to check out yet" copy="Add a piece to your cart to begin." action={{ label: 'Shop gold', to: '/products' }} /></div>
      </div>
    );
  }

  const blocking = quote ? quote.issues.filter((i) => i.type !== 'address' && i.type !== 'coupon') : [];
  const stepLabel = (i) => {
    if (i === 1 && addressId && quote?.address) return `${quote.address.addressType} · ${quote.address.city}`;
    if (i === 2 && quote?.shippingMethod) return quote.shippingMethod.label;
    return 'Done';
  };

  return (
    <section className="w-full bg-gradient-to-b from-cream via-ivory to-ivory pb-24 pt-8">
      {gatewayWindow}
      <div className="shell">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl">Secure Checkout</h1>
          <span className="flex items-center gap-1.5 text-xs text-ink-soft"><Lock size={13} className="text-rose" /> Prices checked on our server</span>
        </div>
        <div className="mt-8 max-w-3xl"><Stepper step={step} /></div>

        {step === 4 && order ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mx-auto mt-12 max-w-2xl rounded-[32px] border border-rose-light/60 bg-ivory p-8 text-center shadow-soft sm:p-12" data-testid="order-confirmation">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose text-white shadow-rose-lg"><CheckCircle2 size={36} /></span>
            <h2 className="mt-6 font-display text-4xl">Thank you — your order is confirmed</h2>
            <p className="mt-2 text-sm text-ink-soft">Order <strong className="font-medium text-ink" data-testid="order-number">{order.orderNumber}</strong> · {order.payment.method === 'cod' ? 'Pay on delivery' : 'Paid online'}</p>
            {order.shippingMethod?.estimatedDelivery && (
              <p className="mt-1 text-sm text-ink-soft">{order.shippingMethod.code === 'pickup' ? 'Ready for pickup by ' : 'Arriving by '}<strong className="font-medium text-rose-deep">{formatDate(order.shippingMethod.estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>
            )}
            <div className="mt-8 flex justify-center gap-3">{order.items.slice(0, 4).map((i) => <Thumb key={i.sku} sku={i.sku} size={64} />)}</div>
            <p className="mt-6 font-display text-3xl text-rose-deep">{money(order.pricing.grandTotal)}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={`/account/orders/${order.id}`} className="btn-primary">View & track order</Link>
              <Link to="/products" className="btn-outline">Continue shopping</Link>
            </div>
          </motion.div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] [&>*]:min-w-0">
            <div className="space-y-4">
              {STEPS.slice(0, 4).map((s, i) => (
                <div key={s} className={classNames('rounded-[26px] border bg-ivory/90 transition', i === step ? 'border-rose shadow-rose' : 'border-rose-light/60')}>
                  <button onClick={() => i < step && !order && setStep(i)} disabled={i > step || Boolean(order)} className="flex w-full items-center justify-between px-6 py-5 text-left">
                    <span className="flex items-center gap-3">
                      <span className="font-display text-lg italic text-rose">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-display text-2xl text-ink">{s}</span>
                    </span>
                    {i < step && <span className="text-[11px] uppercase tracking-[0.16em] text-rose-deep">{stepLabel(i)}{!order && ' · Edit'}</span>}
                  </button>
                  <AnimatePresence initial={false}>
                    {i === step && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                        <div className="px-6 pb-6">
                          {i === 0 && <LoginStep onDone={() => setStep(1)} />}
                          {i === 1 && (
                            <>
                              <AddressBook selectable value={addressId} onChange={setAddressId} />
                              <button onClick={() => setStep(2)} disabled={!addressId} className="btn-primary mt-6">Deliver here</button>
                            </>
                          )}
                          {i === 2 && (
                            <>
                              <div className="space-y-3">
                                {(quote?.shippingOptions || []).map((o) => {
                                  const I = SHIPPING_ICONS[o.code] || Truck;
                                  const on = shippingMethod === o.code;
                                  return (
                                    <button key={o.code} type="button" onClick={() => setShippingMethod(o.code)} aria-pressed={on} className={classNames('flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition', on ? 'border-rose bg-ivory shadow-rose' : 'border-rose-light/60 bg-ivory/70 hover:border-rose')}>
                                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-blush text-rose"><I size={18} /></span>
                                      <span className="flex-1">
                                        <span className="block font-medium text-ink">{o.label}</span>
                                        <span className="text-xs text-ink-soft">{o.note} · about {o.estimatedDays} working day{o.estimatedDays > 1 ? 's' : ''}{o.code === 'standard' && o.charge > 0 && o.freeAbove ? ` · free above ${money(o.freeAbove)}` : ''}</span>
                                      </span>
                                      <span className="text-sm font-medium text-ink">{o.charge ? money(o.charge) : 'Free'}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              <button onClick={() => setStep(3)} className="btn-primary mt-6">Continue to payment</button>
                            </>
                          )}
                          {i === 3 && (
                            <div>
                              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
                                {[
                                  ['online', CreditCard, 'Pay online', 'UPI, cards, net banking and wallets'],
                                  ['cod', Banknote, 'Cash on delivery', 'Pay when it arrives'],
                                ].map(([key, I, label, note]) => (
                                  <button key={key} type="button" role="radio" aria-checked={paymentMethod === key} disabled={Boolean(order)} onClick={() => setPaymentMethod(key)} className={classNames('flex items-center gap-3 rounded-2xl border p-4 text-left transition', paymentMethod === key ? 'border-rose bg-ivory shadow-rose' : 'border-rose-light/60 bg-ivory/70 hover:border-rose')}>
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-blush text-rose"><I size={18} /></span>
                                    <span><span className="block font-medium text-ink">{label}</span><span className="text-xs text-ink-soft">{note}</span></span>
                                  </button>
                                ))}
                              </div>
                              {blocking.length > 0 && (
                                <ul className="mt-4 space-y-1 rounded-xl border border-rose bg-rose-blush/60 px-4 py-3 text-sm text-rose-deep" role="alert">
                                  {blocking.map((b) => <li key={`${b.type}-${b.sku || b.message}`}>{b.message}</li>)}
                                  <li><Link to="/cart" className="underline">Update your cart</Link></li>
                                </ul>
                              )}
                              {error && <p className="mt-4 text-sm text-rose-deep" role="alert">{error.message}</p>}
                              {paymentProblem && (
                                <div className="mt-4 rounded-xl border border-rose bg-rose-blush/60 px-4 py-3 text-sm text-ink" role="alert">
                                  <p className="font-medium text-rose-deep">{paymentProblem.message}</p>
                                  <p className="mt-1 text-ink-soft">Order {order?.orderNumber} is saved and the pieces are held for you. Pay now or later from My Orders.</p>
                                </div>
                              )}
                              {order ? (
                                <div className="mt-6 flex flex-wrap gap-3">
                                  <button onClick={retryPayment} disabled={busy} className="btn-primary">{busy && <Loader2 size={15} className="animate-spin" />} Try payment again</button>
                                  <Link to={`/account/orders/${order.id}`} className="btn-outline">Go to the order</Link>
                                </div>
                              ) : (
                                <button onClick={placeOrder} disabled={busy || !quote?.canCheckout} className="btn-primary mt-6 w-full sm:w-auto" data-testid="place-order">
                                  {busy && <Loader2 size={15} className="animate-spin" />} {paymentMethod === 'cod' ? 'Place order' : `Pay ${quote ? money(quote.totals.grandTotal) : ''} securely`}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <QuoteSummary quote={user ? quote : null}>
                <ul className="max-h-56 space-y-3 overflow-y-auto">
                  {(quote?.items || []).map((l) => (
                    <li key={l.id} className="flex items-center gap-3 text-sm">
                      <Thumb sku={l.sku} />
                      <span className="min-w-0 flex-1 truncate text-ink">{l.product.name}</span>
                      <span className="text-xs text-ink-faint">×{l.quantity}</span>
                    </li>
                  ))}
                </ul>
              </QuoteSummary>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
