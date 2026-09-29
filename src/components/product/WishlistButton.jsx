import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { classNames } from '../../utils/format';

const BURST = Array.from({ length: 6 }, (_, i) => (i * Math.PI * 2) / 6);

export default function WishlistButton({ id, className, size = 18, withLabel = false }) {
  const { isWishlisted, toggleWishlist } = useShop();
  const on = isWishlisted(id);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(id);
      }}
      aria-pressed={on}
      aria-label={on ? 'Remove from wishlist' : 'Add to wishlist'}
      className={classNames(
        'relative flex items-center justify-center gap-2 rounded-full transition-colors',
        withLabel ? 'btn-outline' : 'h-10 w-10 bg-ivory/90 shadow-soft backdrop-blur hover:bg-rose-blush',
        on ? 'text-rose' : 'text-ink-soft hover:text-rose',
        className,
      )}
    >
      <motion.span key={on ? 'on' : 'off'} initial={{ scale: on ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }} className="flex">
        <Heart size={size} strokeWidth={1.7} fill={on ? 'currentColor' : 'none'} />
      </motion.span>
      {withLabel && <span>{on ? 'Wishlisted' : 'Wishlist'}</span>}
      <AnimatePresence>
        {on &&
          BURST.map((a) => (
            <motion.span
              key={a}
              className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-rose"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(a) * 20, y: Math.sin(a) * 20, opacity: 0, scale: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>
    </motion.button>
  );
}
