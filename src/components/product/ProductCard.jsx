import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, GitCompareArrows } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import WishlistButton from './WishlistButton';
import Rating from '../common/Rating';
import { fadeUp } from '../common/Reveal';
import { useShop } from '../../context/ShopContext';
import { useUI } from '../../context/UIContext';
import { formatINR } from '../../utils/format';
import { mrpPrice, productPrice } from '../../utils/pricing';
import { classNames } from '../../utils/format';

export default function ProductCard({ product: p, variant = 'grid', className, animate = true }) {
  const { addToCart, compare, toggleCompare } = useShop();
  const { openQuickView } = useUI();
  const navigate = useNavigate();
  const price = productPrice(p);
  const mrp = mrpPrice(p);
  const inCompare = compare.includes(p.id);

  const buyNow = () => {
    addToCart(p.id, 1, { silent: true });
    navigate('/checkout');
  };

  return (
    <motion.article
      variants={animate ? fadeUp : undefined}
      className={classNames('group relative flex flex-col', variant === 'carousel' && 'w-[72vw] shrink-0 snap-start sm:w-[42vw] md:w-[31vw] lg:w-[23vw] 2xl:w-[18.5vw]', className)}
    >
      <div className="relative overflow-hidden rounded-[22px] border border-transparent bg-ivory shadow-soft transition-all duration-500 group-hover:border-rose-light group-hover:shadow-rose-lg">
        <Link to={`/product/${p.slug}`} aria-label={p.name} className="block">
          <SmartImage name={p.image} width={700} sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw" zoom className="aspect-[4/5] w-full" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {p.isNew && <span className="rounded-full bg-ivory/95 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-rose-deep shadow-soft">New</span>}
          {p.discountPct && <span className="rounded-full bg-rose px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white">{p.discountPct}% off</span>}
          {p.availability === 'made-to-order' && <span className="rounded-full bg-champagne/95 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink">Made to order</span>}
          {p.availability === 'low-stock' && <span className="rounded-full bg-champagne/95 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink">Few left</span>}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <WishlistButton id={p.id} />
          <button
            type="button"
            onClick={() => toggleCompare(p.id)}
            aria-pressed={inCompare}
            aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
            className={classNames(
              'flex h-10 w-10 items-center justify-center rounded-full shadow-soft backdrop-blur transition md:translate-x-14 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100',
              inCompare ? 'bg-rose text-white md:translate-x-0 md:opacity-100' : 'bg-ivory/90 text-ink-soft hover:text-rose',
            )}
          >
            <GitCompareArrows size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => openQuickView(p.id)}
          className="absolute inset-x-3 bottom-3 hidden translate-y-4 items-center justify-center gap-2 rounded-full bg-ivory/95 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-rose-deep opacity-0 shadow-soft backdrop-blur transition-all duration-300 hover:bg-rose-blush group-hover:translate-y-0 group-hover:opacity-100 md:flex"
        >
          <Eye size={14} /> Quick View
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-ink-faint">
            {p.purity} · {p.weight} g
          </p>
          <span className="hidden sm:block">
            <Rating value={p.rating} size={11} />
          </span>
        </div>
        <Link to={`/product/${p.slug}`} className="mt-1.5 line-clamp-1 font-display text-[19px] leading-snug text-ink transition group-hover:text-rose-deep sm:text-[21px]">
          {p.name}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[15px] font-medium text-ink">{formatINR(price)}</span>
          {mrp && <span className="text-xs text-ink-faint line-through">{formatINR(mrp)}</span>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => addToCart(p.id)}
            className="whitespace-nowrap rounded-full border border-rose/50 py-2.5 text-[9.5px] font-medium uppercase tracking-[0.04em] text-rose-deep transition hover:bg-rose-blush sm:text-[10.5px] sm:tracking-[0.16em]"
          >
            Add to Cart
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={buyNow}
            className="whitespace-nowrap rounded-full bg-rose py-2.5 text-[9.5px] font-medium uppercase tracking-[0.04em] text-white shadow-rose transition hover:shadow-rose-lg sm:text-[10.5px] sm:tracking-[0.16em]"
          >
            Buy Now
          </motion.button>
        </div>
        <button type="button" onClick={() => openQuickView(p.id)} className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ink-faint md:hidden">
          Quick view
        </button>
      </div>
    </motion.article>
  );
}
