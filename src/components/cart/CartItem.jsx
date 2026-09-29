import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import QuantityStepper from '../common/QuantityStepper';
import CoinArt from '../goldCoins/CoinArt';
import { useShop } from '../../context/ShopContext';
import { formatINR } from '../../utils/format';
import { productPrice } from '../../utils/pricing';

export default function CartItem({ line, compact = false }) {
  const { updateQty, removeFromCart, moveToWishlist } = useShop();
  const p = line.product;
  const to = p.isCoin ? '/gold-coins' : `/product/${p.slug}`;

  return (
    <motion.li layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }} className="flex gap-4 py-5">
      <Link to={to} className="shrink-0">
        {p.isCoin ? (
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-ivory to-champagne/60 sm:h-28 sm:w-28">
            <CoinArt motif={p.coin.motif} weight={p.weight} shape={p.coin.shape} size={compact ? 70 : 84} />
          </div>
        ) : (
          <SmartImage name={p.image} width={300} sizes="112px" className="h-24 w-24 rounded-2xl sm:h-28 sm:w-28" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <Link to={to} className="line-clamp-1 font-display text-xl text-ink hover:text-rose-deep">
              {p.name}
            </Link>
            <p className="mt-0.5 text-xs text-ink-faint">
              {p.purity} · {p.weight} g{line.qty > 1 && ` · ${(p.weight * line.qty).toFixed(2)} g total`}
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium tabular-nums text-ink">{formatINR(productPrice(p) * line.qty)}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <QuantityStepper value={line.qty} onChange={(q) => updateQty(p.id, q)} small />
          <div className="flex items-center gap-1">
            <button onClick={() => moveToWishlist(p.id)} className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10.5px] uppercase tracking-[0.14em] text-ink-soft transition hover:bg-rose-blush hover:text-rose-deep" aria-label="Move to wishlist">
              <Heart size={14} /> {!compact && 'Wishlist'}
            </button>
            <button onClick={() => removeFromCart(p.id)} className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[10.5px] uppercase tracking-[0.14em] text-ink-soft transition hover:bg-rose-blush hover:text-rose-deep" aria-label="Remove">
              <Trash2 size={14} /> {!compact && 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
