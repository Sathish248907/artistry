import { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import CoinArt from './CoinArt';
import WishlistButton from '../product/WishlistButton';
import { fadeUp } from '../common/Reveal';
import { useShop } from '../../context/ShopContext';
import { coinVariantId } from '../../data/products';
import { coinPrice } from '../../data/coins';
import { formatINR, classNames } from '../../utils/format';

// Each card gets a distinct backdrop so no two coins read as the same visual.
const BACKDROPS = [
  'from-ivory via-cream to-champagne/70',
  'from-champagne/70 via-ivory to-ivory',
  'from-peach via-ivory to-ivory',
  'from-cream via-champagne/50 to-ivory',
  'from-ivory via-ivory to-champagne/60',
  'from-ivory via-peach to-ivory',
];

export default function GoldCoinCard({ coin, index = 0, onWeightChange }) {
  const { addToCart } = useShop();
  const [weight, setWeight] = useState(coin.weight);
  const price = coinPrice(weight);

  return (
    <motion.article variants={fadeUp} className="group flex flex-col rounded-[26px] border border-rose-light/60 bg-ivory p-3 shadow-soft transition duration-500 hover:border-rose hover:shadow-rose-lg">
      <div className={classNames('relative flex aspect-square items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br', BACKDROPS[index % BACKDROPS.length])}>
        <div className="absolute inset-6 rounded-full border border-rose-light/60" />
        <motion.div whileHover={{ rotateY: 180 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} style={{ transformStyle: 'preserve-3d' }} className="relative drop-shadow-[0_18px_22px_rgba(169,122,38,0.35)]">
          <CoinArt motif={coin.motif} weight={weight} shape={coin.shape} size={170} />
        </motion.div>
        <WishlistButton id={coin.id} className="absolute right-3 top-3" />
        {!coin.inStock && <span className="absolute left-3 top-3 rounded-full bg-ivory px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">Restocking</span>}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-rose">{coin.category}</p>
        <h3 className="mt-1 font-display text-[22px] leading-tight">{coin.name}</h3>
        <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
          <dt className="text-ink-faint">Purity</dt>
          <dd className="text-right text-ink">24K · {coin.fineness}</dd>
          <dt className="text-ink-faint">Finish</dt>
          <dd className="text-right text-ink">{coin.finish}</dd>
        </dl>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-soft">
          <BadgeCheck size={14} className="text-rose" /> {coin.certification}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Weight">
          {coin.weights.map((w) => (
            <button
              key={w}
              role="radio"
              aria-checked={w === weight}
              onClick={() => {
                setWeight(w);
                onWeightChange?.(w);
              }}
              className={classNames('rounded-full border px-3 py-1 text-xs transition', w === weight ? 'border-rose bg-rose-blush text-rose-deep' : 'border-rose-light/70 text-ink-soft hover:border-rose')}
            >
              {w}g
            </button>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">Price incl. GST</p>
            <p className="font-display text-2xl text-rose-deep">{formatINR(price)}</p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} disabled={!coin.inStock} onClick={() => addToCart(coinVariantId(coin, weight))} className="btn-primary !px-5 !py-3">
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
