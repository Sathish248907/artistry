import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Bell, ChevronDown, GitCompareArrows, MapPin, RotateCcw, Share2, ShieldCheck, Truck } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Rating from '../components/common/Rating';
import QuantityStepper from '../components/common/QuantityStepper';
import EmptyState from '../components/common/EmptyState';
import SectionHeading from '../components/common/SectionHeading';
import { StaggerGroup } from '../components/common/Reveal';
import ProductGallery from '../components/product/ProductGallery';
import PriceBreakup from '../components/product/PriceBreakup';
import WishlistButton from '../components/product/WishlistButton';
import ProductCard from '../components/product/ProductCard';
import { PRODUCTS, productBySlug } from '../data/products';
import { categoryBySlug } from '../data/categories';
import { useShop } from '../context/ShopContext';
import { useUI } from '../context/UIContext';
import { addBusinessDays, classNames, formatDate, formatINR } from '../utils/format';
import { mrpPrice, priceBreakup } from '../utils/pricing';
import { BRAND } from '../data/brand';

const SIZES = { rings: ['10', '12', '14', '16', '18', '20'], bangles: ['2.4', '2.6', '2.8', '2.10'] };
const AVAIL = { 'in-stock': ['In stock', 'Ships in 24 hours'], 'low-stock': ['Only 2 left', 'Ships in 24 hours'], 'made-to-order': ['Made to order', 'Crafted in 18–21 days'] };

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-rose-light/60">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={open}>
        <span className="text-[12px] font-medium uppercase tracking-[0.18em]">{title}</span>
        <ChevronDown size={16} className={classNames('text-rose transition', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-5 text-sm leading-relaxed text-ink-soft">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const p = productBySlug(slug);
  const navigate = useNavigate();
  const { addToCart, compare, toggleCompare, priceAlerts, togglePriceAlert } = useShop();
  const { toast } = useUI();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(null);
  const [pincode, setPincode] = useState('');
  const [delivery, setDelivery] = useState(null);

  const similar = useMemo(() => (p ? PRODUCTS.filter((x) => x.id !== p.id && x.categories.some((c) => p.categories.includes(c))).slice(0, 4) : []), [p]);
  const alsoLike = useMemo(() => (p ? PRODUCTS.filter((x) => x.id !== p.id && !similar.includes(x) && x.occasion.some((o) => p.occasion.includes(o))).slice(0, 4) : []), [p, similar]);

  if (!p) {
    return (
      <div className="shell py-24">
        <EmptyState title="This piece has found its home" copy="It may have sold out or moved to a new collection." action={{ label: 'Browse jewellery', to: '/products' }} />
      </div>
    );
  }

  const b = priceBreakup(p);
  const mrp = mrpPrice(p);
  const sizes = SIZES[p.category];
  const [availLabel, availNote] = AVAIL[p.availability];
  const cat = categoryBySlug(p.category);

  const checkPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setDelivery({ error: 'Enter a valid 6-digit pincode' });
      return;
    }
    const metro = ['40', '11', '56', '60', '70', '50'].includes(pincode.slice(0, 2));
    const days = (p.availability === 'made-to-order' ? 18 : 0) + (metro ? 2 : 4);
    setDelivery({ date: addBusinessDays(days), metro });
  };

  const add = (buy) => {
    if (sizes && !size) {
      toast({ title: 'Please choose a size', body: 'Not sure? Our free sizing kit ships with every order.', tone: 'neutral' });
      return;
    }
    addToCart(p.id, qty, { silent: buy, size });
    if (buy) navigate('/checkout');
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copied', body: 'Share it with someone special.' });
      }
    } catch {
      /* share cancelled */
    }
  };

  return (
    <>
      <section className="w-full bg-gradient-to-b from-cream to-ivory pb-16 pt-6 lg:pb-24">
        <div className="shell">
          <Breadcrumbs items={[['Jewellery', '/products'], [cat?.name || 'Gold', `/products?category=${p.category}`], [p.name]]} />
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] xl:gap-16">
            <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <ProductGallery product={p} />
            </div>

            <div className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Product code · {p.code}</p>
                  <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{p.name}</h1>
                </div>
                <div className="flex gap-2">
                  <WishlistButton id={p.id} className="border border-rose-light" />
                  <button onClick={share} className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-light bg-ivory text-ink-soft hover:text-rose" aria-label="Share">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <Rating value={p.rating} showValue count={p.reviews} />
                <span className={classNames('rounded-full px-3 py-1 text-[11px] font-medium', p.availability === 'made-to-order' ? 'bg-champagne/70 text-ink' : 'bg-rose-blush text-rose-deep')}>
                  {availLabel} · {availNote}
                </span>
              </div>

              <div className="mt-6 flex items-end gap-3">
                <p className="font-display text-5xl text-rose-deep">{formatINR(b.total)}</p>
                {mrp && <p className="pb-2 text-base text-ink-faint line-through">{formatINR(mrp)}</p>}
                {p.discountPct && <p className="pb-2 text-sm font-medium text-rose-deep">{p.discountPct}% off making</p>}
              </div>
              <p className="mt-1 text-xs text-ink-faint">Inclusive of GST · Price updates with today’s gold rate</p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ['Gold Purity', `${p.purity} (${p.purity === '22K' ? '916' : p.purity === '18K' ? '750' : '999'})`],
                  ['Gold Weight', `${p.weight} g`],
                  ['Certification', 'BIS HUID'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-rose-light/60 bg-ivory p-3 text-center">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">{k}</p>
                    <p className="mt-1 text-sm font-medium text-ink">{v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <PriceBreakup product={p} />
              </div>

              {sizes && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <span className="label">{p.category === 'rings' ? 'Ring size (Indian)' : 'Bangle size'}</span>
                    <button className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline" onClick={() => toast({ title: 'Size guide', body: 'Measure an existing piece’s inner diameter, or request our free sizing kit.', tone: 'neutral' })}>
                      Size guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button key={s} onClick={() => setSize(s)} className={classNames('h-11 min-w-11 rounded-full border px-3 text-sm transition', size === s ? 'border-rose bg-rose-blush text-rose-deep' : 'border-rose-light/70 bg-ivory text-ink-soft hover:border-rose')}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery */}
              <form onSubmit={checkPincode} className="mt-6 rounded-2xl border border-rose-light/60 bg-ivory p-5">
                <p className="label flex items-center gap-2"><MapPin size={13} className="text-rose" /> Delivery</p>
                <div className="flex gap-2">
                  <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="Enter pincode" className="input !py-2.5" aria-label="Pincode" />
                  <button className="btn-outline !px-5 !py-2.5">Check</button>
                </div>
                {delivery?.error && <p className="mt-2 text-xs text-rose-deep">{delivery.error}</p>}
                {delivery?.date && (
                  <p className="mt-3 text-sm text-ink">
                    Estimated delivery by <strong className="font-medium text-rose-deep">{formatDate(delivery.date, { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                    {delivery.metro && <span className="text-ink-soft"> · Same-day in-store pickup available</span>}
                  </p>
                )}
                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-ink-soft">
                  <span className="flex items-center gap-1.5"><Truck size={14} className="text-rose" /> Free insured shipping</span>
                  <span className="flex items-center gap-1.5"><RotateCcw size={14} className="text-rose" /> 15-day easy returns</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-rose" /> Lifetime exchange</span>
                </div>
              </form>

              <div className="mt-6 hidden items-center gap-3 md:flex">
                <QuantityStepper value={qty} onChange={setQty} />
                <button onClick={() => add(false)} className="btn-outline flex-1">Add to Cart</button>
                <button onClick={() => add(true)} className="btn-primary flex-1">Buy Now</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <WishlistButton id={p.id} withLabel className="!py-2.5 !text-[11px]" size={15} />
                <button onClick={() => togglePriceAlert(p.id)} className={classNames('chip', priceAlerts.includes(p.id) && 'chip-active')}>
                  <Bell size={13} /> {priceAlerts.includes(p.id) ? 'Price alert on' : 'Notify on price drop'}
                </button>
                <button onClick={() => toggleCompare(p.id)} className={classNames('chip', compare.includes(p.id) && 'chip-active')}>
                  <GitCompareArrows size={13} /> {compare.includes(p.id) ? 'In compare' : 'Compare'}
                </button>
              </div>

              <div className="mt-8">
                <Accordion title="Description" defaultOpen>
                  {p.description} Finished with a high-polish lustre and hand-set details, it arrives in our signature rose-gold keepsake box.
                </Accordion>
                <Accordion title="Specifications">
                  <dl className="grid grid-cols-2 gap-y-2">
                    <dt>Metal</dt><dd className="text-ink">{p.purity} Yellow Gold</dd>
                    <dt>Gross weight</dt><dd className="text-ink">{p.weight} g</dd>
                    <dt>Style</dt><dd className="capitalize text-ink">{p.type.replace('-', ' ')}</dd>
                    <dt>Occasion</dt><dd className="capitalize text-ink">{p.occasion.join(', ')}</dd>
                    <dt>Gender</dt><dd className="capitalize text-ink">{p.gender}</dd>
                  </dl>
                </Accordion>
                <Accordion title="Certification">
                  <p className="flex items-start gap-2"><BadgeCheck size={16} className="mt-0.5 shrink-0 text-rose" /> BIS hallmarked with a unique 6-digit HUID. Verify purity instantly on the BIS CARE app. Ships with a {BRAND.name} certificate of authenticity.</p>
                </Accordion>
                <Accordion title="Shipping & Returns">
                  Free, fully insured shipping in tamper-proof packaging. 15-day no-questions returns and lifetime exchange at the prevailing gold rate.
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      {[['You may also like', similar], ['Complete the look', alsoLike]].map(([title, list]) =>
        list.length ? (
          <section key={title} className="w-full bg-ivory pb-16">
            <div className="shell">
              <SectionHeading eyebrow="Curated for you" title={title} />
              <StaggerGroup className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
                {list.map((x) => (
                  <ProductCard key={x.id} product={x} />
                ))}
              </StaggerGroup>
            </div>
          </section>
        ) : null,
      )}

      {/* Sticky mobile add-to-cart */}
      <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-3 border-t border-rose-light/60 bg-ivory/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-ink-soft">{p.name}</p>
          <p className="font-display text-xl text-rose-deep">{formatINR(b.total)}</p>
        </div>
        <button onClick={() => add(false)} className="btn-outline !px-4 !py-3">Add</button>
        <button onClick={() => add(true)} className="btn-primary !px-5 !py-3">Buy Now</button>
      </div>
      <Link to="/products" className="sr-only">Back to jewellery</Link>
    </>
  );
}
