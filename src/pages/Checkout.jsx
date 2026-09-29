import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Lock } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import SmartImage from '../components/common/SmartImage';
import CoinArt from '../components/goldCoins/CoinArt';
import OrderSummary from '../components/cart/OrderSummary';
import { AddressStep, DELIVERY_OPTIONS, DeliveryStep, LoginStep, PaymentStep, STEPS, Stepper } from '../components/checkout/CheckoutSteps';
import { EASE } from '../components/common/Reveal';
import { useShop } from '../context/ShopContext';
import { orderService, paymentService } from '../services';
import { STORES } from '../data/content';
import { addBusinessDays, formatDate, formatINR } from '../utils/format';

export default function Checkout() {
  const { cart, totals, clearCart } = useShop();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(null);
  const [delivery, setDelivery] = useState('standard');
  const [store, setStore] = useState(STORES[0].id);
  const [method, setMethod] = useState('upi');
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);

  const fee = DELIVERY_OPTIONS.find((o) => o.id === delivery)?.fee || 0;
  const payable = totals.total + fee;

  const pay = async () => {
    setBusy(true);
    const placed = await orderService.place({ items: cart.map((l) => ({ id: l.id, qty: l.qty })), total: payable, delivery, address });
    const payment = await paymentService.pay(placed.id, method);
    setOrder({ ...placed, payment, items: cart, eta: addBusinessDays(DELIVERY_OPTIONS.find((o) => o.id === delivery).days) });
    clearCart();
    setBusy(false);
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!cart.length && !order) {
    return (
      <div className="w-full bg-ivory py-20">
        <div className="shell">
          <EmptyState title="Nothing to check out yet" copy="Add a piece to your cart to begin." action={{ label: 'Shop gold', to: '/products' }} />
        </div>
      </div>
    );
  }

  return (
    <section className="w-full bg-gradient-to-b from-cream via-ivory to-ivory pb-24 pt-8">
      <div className="shell">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl">Secure Checkout</h1>
          <span className="flex items-center gap-1.5 text-xs text-ink-soft"><Lock size={13} className="text-rose" /> 256-bit SSL</span>
        </div>
        <div className="mt-8 max-w-3xl">
          <Stepper step={step} />
        </div>

        {step === 4 && order ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mx-auto mt-12 max-w-2xl rounded-[32px] border border-rose-light/60 bg-ivory p-8 text-center shadow-soft sm:p-12">
            <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose text-white shadow-rose-lg">
              <CheckCircle2 size={36} />
            </motion.span>
            <h2 className="mt-6 font-display text-4xl">Thank you — your order is confirmed</h2>
            <p className="mt-2 text-sm text-ink-soft">Order <strong className="font-medium text-ink">{order.id}</strong> · Payment ref {order.payment.ref}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {delivery === 'pickup' ? `Ready for pickup at ${STORES.find((s) => s.id === store)?.name} by ` : 'Arriving by '}
              <strong className="font-medium text-rose-deep">{formatDate(order.eta, { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
            </p>
            <div className="mt-8 flex justify-center gap-3">
              {order.items.slice(0, 4).map((l) =>
                l.product.isCoin ? (
                  <span key={l.id} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-blush"><CoinArt motif={l.product.coin.motif} size={48} /></span>
                ) : (
                  <SmartImage key={l.id} name={l.product.image} width={160} sizes="64px" className="h-16 w-16 rounded-2xl" />
                ),
              )}
            </div>
            <p className="mt-6 font-display text-3xl text-rose-deep">{formatINR(order.total)}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/account?tab=orders" className="btn-primary">Track order</Link>
              <Link to="/products" className="btn-outline">Continue shopping</Link>
            </div>
          </motion.div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] [&>*]:min-w-0">
            <div className="space-y-4">
              {STEPS.slice(0, 4).map((s, i) => (
                <div key={s} className={`rounded-[26px] border bg-ivory/90 transition ${i === step ? 'border-rose shadow-rose' : 'border-rose-light/60'}`}>
                  <button onClick={() => i < step && setStep(i)} disabled={i > step} className="flex w-full items-center justify-between px-6 py-5 text-left">
                    <span className="flex items-center gap-3">
                      <span className="font-display text-lg italic text-rose">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-display text-2xl text-ink">{s}</span>
                    </span>
                    {i < step && (
                      <span className="text-[11px] uppercase tracking-[0.16em] text-rose-deep">
                        {i === 1 && address ? `${address.label} · ${address.city}` : i === 2 ? DELIVERY_OPTIONS.find((o) => o.id === delivery).title : 'Done'} · Edit
                      </span>
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {i === step && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                        <div className="px-6 pb-6">
                          {i === 0 && <LoginStep onDone={() => setStep(1)} />}
                          {i === 1 && <AddressStep value={address} onChange={setAddress} onDone={() => setStep(2)} />}
                          {i === 2 && <DeliveryStep value={delivery} onChange={setDelivery} store={store} onStore={setStore} onDone={() => setStep(3)} />}
                          {i === 3 && <PaymentStep method={method} onMethod={setMethod} total={payable} onPay={pay} busy={busy} />}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <OrderSummary showCoupon={step < 3} extras={fee ? [['Express delivery', fee]] : []}>
                <ul className="max-h-56 space-y-3 overflow-y-auto">
                  {cart.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 text-sm">
                      {l.product.isCoin ? (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-blush"><CoinArt motif={l.product.coin.motif} size={36} /></span>
                      ) : (
                        <SmartImage name={l.product.image} width={120} sizes="48px" className="h-12 w-12 shrink-0 rounded-xl" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-ink">{l.product.name}</span>
                      <span className="text-xs text-ink-faint">×{l.qty}</span>
                    </li>
                  ))}
                </ul>
              </OrderSummary>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
