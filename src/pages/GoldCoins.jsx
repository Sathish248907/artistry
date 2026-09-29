import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, PackageCheck, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { StaggerGroup, EASE } from '../components/common/Reveal';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import CoinArt from '../components/goldCoins/CoinArt';
import GoldCoinCard from '../components/goldCoins/GoldCoinCard';
import { COIN_CATEGORIES, COINS, coinPrice } from '../data/coins';
import { GOLD_RATES } from '../data/goldRates';
import { classNames, formatNumber } from '../utils/format';

const FILTERS = {
  weight: { label: 'Weight', options: [['0-3', 'Up to 2 g'], ['3-9', '4 – 8 g'], ['9-15', '10 g'], ['15-999', '20 g & above']] },
  price: { label: 'Price', options: [['0-50000', 'Under ₹50,000'], ['50000-150000', '₹50,000 – ₹1,50,000'], ['150000-99999999', 'Above ₹1,50,000']] },
  design: { label: 'Design', options: [['Plain', 'Plain'], ['Bar', 'Bar'], ['Deity', 'Deity'], ['Festive', 'Festive'], ['Wedding', 'Wedding'], ['Gift', 'Gift']] },
  occasion: { label: 'Occasion', options: [['Investment', 'Investment'], ['Festival', 'Festival'], ['Wedding', 'Wedding'], ['Gifting', 'Gifting']] },
  purity: { label: 'Purity', options: [['24K', '24K · 999.9']] },
};

const inRange = (v, r) => {
  const [a, b] = r.split('-').map(Number);
  return v >= a && v < b;
};

function Filters({ sel, toggle, clear }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl">Refine</p>
        <button onClick={clear} className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline">Clear</button>
      </div>
      {Object.entries(FILTERS).map(([key, f]) => (
        <div key={key}>
          <p className="label">{f.label}</p>
          <div className="flex flex-wrap gap-2">
            {f.options.map(([id, label]) => (
              <button key={id} onClick={() => toggle(key, id)} className={classNames('chip', sel[key].includes(id) && 'chip-active')}>
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GoldCoins() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || 'all';
  const [sel, setSel] = useState({ weight: [], price: [], design: [], occasion: [], purity: [] });
  const [sort, setSort] = useState('popularity');
  const [drawer, setDrawer] = useState(false);

  const toggle = (k, id) => setSel((s) => ({ ...s, [k]: s[k].includes(id) ? s[k].filter((x) => x !== id) : [...s[k], id] }));
  const clear = () => setSel({ weight: [], price: [], design: [], occasion: [], purity: [] });

  const list = useMemo(() => {
    const out = COINS.filter((c) => {
      if (cat !== 'all' && c.cat !== cat) return false;
      if (sel.weight.length && !c.weights.some((w) => sel.weight.some((r) => inRange(w, r)))) return false;
      if (sel.price.length && !c.weights.some((w) => sel.price.some((r) => inRange(coinPrice(w), r)))) return false;
      if (sel.design.length && !sel.design.includes(c.design)) return false;
      if (sel.occasion.length && !sel.occasion.includes(c.occasion)) return false;
      return true;
    });
    if (sort === 'price-asc') out.sort((a, b) => coinPrice(a.weight) - coinPrice(b.weight));
    if (sort === 'price-desc') out.sort((a, b) => coinPrice(b.weight) - coinPrice(a.weight));
    if (sort === 'popularity') out.sort((a, b) => b.popularity - a.popularity);
    return out;
  }, [cat, sel, sort]);

  const setCat = (c) => {
    const next = new URLSearchParams(params);
    if (c === 'all') next.delete('cat');
    else next.set('cat', c);
    setParams(next, { replace: true });
  };

  const rate = GOLD_RATES.rates['24K'].per10g / 10;

  return (
    <>
      {/* Light illustrated hero — no photograph, animated coin artwork */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-champagne/60 via-ivory to-cream">
        <div className="shell grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }}>
            <Breadcrumbs items={[['Gold Coins']]} />
            <p className="eyebrow mt-8">24K · 999.9 Fine Gold</p>
            <h1 className="heading-xl mt-3">Gold Coins & Bars</h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">Minted, assayed and sealed in tamper-proof packs — for investment, blessings and every auspicious beginning.</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-ivory/80 px-4 py-2 text-ink">Today’s 24K rate <strong className="font-medium text-rose-deep">₹{formatNumber(rate)}/g</strong></span>
              <span className="flex items-center gap-1.5 rounded-full bg-ivory/80 px-4 py-2 text-ink-soft"><BadgeCheck size={15} className="text-rose" /> BIS hallmarked</span>
              <span className="flex items-center gap-1.5 rounded-full bg-ivory/80 px-4 py-2 text-ink-soft"><PackageCheck size={15} className="text-rose" /> Assay certificate</span>
              <span className="flex items-center gap-1.5 rounded-full bg-ivory/80 px-4 py-2 text-ink-soft"><ShieldCheck size={15} className="text-rose" /> Buy-back guarantee</span>
            </div>
          </motion.div>
          <div className="relative mx-auto h-[320px] w-full max-w-[520px] sm:h-[400px]">
            {[
              { motif: 'lotus', size: 220, x: '8%', y: '10%', d: 0 },
              { motif: 'mark', size: 150, x: '58%', y: '2%', d: 0.6, shape: 'bar' },
              { motif: 'om', size: 170, x: '52%', y: '48%', d: 1.2 },
              { motif: 'diya', size: 120, x: '4%', y: '62%', d: 1.8 },
            ].map((c) => (
              <motion.div
                key={c.motif}
                className="absolute drop-shadow-[0_24px_30px_rgba(140,95,25,0.35)]"
                style={{ left: c.x, top: c.y }}
                initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -14, 0] }}
                transition={{ opacity: { duration: 0.8, delay: c.d * 0.3 }, scale: { duration: 0.8, delay: c.d * 0.3 }, rotate: { duration: 0.8, delay: c.d * 0.3 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: c.d } }}
              >
                <CoinArt motif={c.motif} size={c.size} weight={c.shape === 'bar' ? 10 : 5} shape={c.shape} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-ivory pb-24">
        {/* Category tabs */}
        <div className="sticky top-[66px] z-30 w-full border-b border-rose-light/50 bg-ivory/95 backdrop-blur">
          <div className="shell no-scrollbar flex gap-2 overflow-x-auto py-3">
            {[{ slug: 'all', name: 'All Coins', motif: 'mark' }, ...COIN_CATEGORIES].map((c) => (
              <button key={c.slug} onClick={() => setCat(c.slug)} className={classNames('flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition', cat === c.slug ? 'border-rose bg-rose-blush text-rose-deep' : 'border-rose-light/70 bg-ivory text-ink-soft hover:border-rose')}>
                <CoinArt motif={c.motif} size={28} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="shell mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[150px]">
              <Filters sel={sel} toggle={toggle} clear={clear} />
            </div>
          </aside>
          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <button onClick={() => setDrawer(true)} className="chip lg:hidden">
                <SlidersHorizontal size={14} /> Filters
              </button>
              <p className="hidden text-sm text-ink-soft sm:block">{list.length} coins & bars</p>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-rose-light/70 bg-ivory px-4 py-2 text-sm focus:border-rose focus:outline-none" aria-label="Sort coins">
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
            {list.length ? (
              <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {list.map((c, i) => (
                  <GoldCoinCard key={c.id} coin={c} index={i} />
                ))}
              </StaggerGroup>
            ) : (
              <EmptyState title="No coins match" copy="Try a different weight or price range." action={{ label: 'View all coins', to: '/gold-coins' }} />
            )}
          </div>
        </div>
      </section>

      <Modal open={drawer} onClose={() => setDrawer(false)} size="md" title="Coin filters">
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <Filters sel={sel} toggle={toggle} clear={clear} />
          <button onClick={() => setDrawer(false)} className="btn-primary mt-8 w-full">Show {list.length} coins</button>
        </div>
      </Modal>
    </>
  );
}
