import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Mail, PenLine, RefreshCcw } from 'lucide-react';
import PageBanner from '../components/common/PageBanner';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/common/EmptyState';
import CoinArt from '../components/goldCoins/CoinArt';
import { StaggerGroup, fadeUp } from '../components/common/Reveal';
import { GIFT_CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { productPrice } from '../utils/pricing';
import { classNames } from '../utils/format';

const MATCH = {
  birthday: (p) => p.occasion.includes('birthday'),
  wedding: (p) => p.occasion.includes('wedding'),
  anniversary: (p) => p.occasion.includes('anniversary'),
  baby: (p) => p.gender === 'kids' || (p.weight < 4 && p.type === 'daily-wear'),
  festival: (p) => p.occasion.includes('festival'),
  corporate: (p) => p.occasion.includes('gifting') && p.gender !== 'women',
};
const BUDGETS = [
  ['all', 'Any budget', 0, Infinity],
  ['u50', 'Under ₹50,000', 0, 50000],
  ['50-100', '₹50,000 – ₹1,00,000', 50000, 100000],
  ['100+', 'Above ₹1,00,000', 100000, Infinity],
];

export default function Gifts() {
  const [params, setParams] = useSearchParams();
  const who = params.get('for') || 'all';
  const budget = params.get('budget') || 'all';

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v === 'all') next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const list = useMemo(() => {
    const [, , min, max] = BUDGETS.find((b) => b[0] === budget) || BUDGETS[0];
    return PRODUCTS.filter((p) => (who === 'all' ? p.occasion.includes('gifting') || p.occasion.includes('birthday') : MATCH[who]?.(p))).filter((p) => {
      const price = productPrice(p);
      return price >= min && price < max;
    });
  }, [who, budget]);

  return (
    <>
      <PageBanner image="pageBanner_gifts" eyebrow="The gifting studio" title="Make Every Gift Meaningful" copy="Hand-wrapped, message-ready gold for every milestone — with a 30-day exchange promise." crumbs={[['Gifts']]} />

      <section className="w-full bg-ivory pb-24 pt-10">
        <div className="shell">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {[{ slug: 'all', name: 'All gifts' }, ...GIFT_CATEGORIES].map((g) => (
              <button key={g.slug} onClick={() => setParam('for', g.slug)} className={classNames('chip shrink-0 !px-5 !py-2.5 !text-sm', who === g.slug && 'chip-active')}>
                {g.name}
              </button>
            ))}
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-6">
            {BUDGETS.map(([id, label]) => (
              <button key={id} onClick={() => setParam('budget', id)} className={classNames('shrink-0 rounded-full px-4 py-1.5 text-xs transition', budget === id ? 'bg-rose text-white' : 'bg-rose-blush/60 text-ink-soft hover:bg-rose-blush')}>
                {label}
              </button>
            ))}
          </div>

          {who === 'corporate' && (
            <div className="mb-10 flex flex-col items-center gap-6 rounded-[28px] border border-rose-light/60 bg-gradient-to-r from-champagne/50 via-cream to-ivory p-8 sm:flex-row">
              <CoinArt motif="bow" size={120} />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-display text-3xl">Corporate gold coin gifting</p>
                <p className="mt-1 text-sm text-ink-soft">Custom-branded 24K coin packs from 1g, GST invoicing and pan-India delivery for teams of 10 to 10,000.</p>
              </div>
              <Link to="/gold-coins?cat=gift" className="btn-primary">Shop gift coins</Link>
            </div>
          )}

          {list.length ? (
            <ProductGrid products={list} />
          ) : (
            <EmptyState title="No gifts in this range" copy="Try another budget, or gift a gold coin — always the right size." action={{ label: 'Shop gift coins', to: '/gold-coins?cat=gift' }} />
          )}
        </div>
      </section>

      <section className="w-full bg-gradient-to-r from-ivory via-cream to-champagne/50 py-14">
        <StaggerGroup className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Gift, 'Signature wrapping', 'Rose-gold keepsake box with silk ribbon, free on every order.'],
            [PenLine, 'Handwritten note', 'Add a personal message, written by our calligrapher.'],
            [Mail, 'E-gift cards', 'Instant digital gift cards from ₹5,000.'],
            [RefreshCcw, '30-day gift exchange', 'Recipients can exchange size or design, hassle-free.'],
          ].map(([I, t, c]) => (
            <motion.div key={t} variants={fadeUp} className="rounded-3xl border border-rose-light/60 bg-ivory/80 p-6">
              <I size={22} className="text-rose" strokeWidth={1.5} />
              <p className="mt-4 font-display text-2xl">{t}</p>
              <p className="mt-1 text-sm text-ink-soft">{c}</p>
            </motion.div>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}
