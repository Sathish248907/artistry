import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellOff, Share2, ShoppingBag, Trash2 } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import EmptyState from '../components/common/EmptyState';
import SmartImage from '../components/common/SmartImage';
import CoinArt from '../components/goldCoins/CoinArt';
import { useShop } from '../context/ShopContext';
import { useUI } from '../context/UIContext';
import { findItem } from '../data/products';
import { wishlistService } from '../services';
import { formatINR, classNames } from '../utils/format';
import { productPrice } from '../utils/pricing';
import { BRAND } from '../data/brand';

export default function Wishlist() {
  const { wishlist, toggleWishlist, moveToCart, priceAlerts, togglePriceAlert, addToCart } = useShop();
  const { toast } = useUI();
  const [params] = useSearchParams();
  const sharedIds = params.get('ids')?.split(',').filter(Boolean);
  const shared = Boolean(sharedIds);
  const items = (sharedIds || wishlist).map(findItem).filter(Boolean);

  const share = async () => {
    const { url } = await wishlistService.share(wishlist);
    try {
      if (navigator.share) await navigator.share({ title: `My ${BRAND.name} wishlist`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Wishlist link copied', body: 'Share it with family — perfect for wedding planning.' });
      }
    } catch {
      /* share dismissed */
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-cream to-ivory pb-24 pt-8">
      <div className="shell">
        <Breadcrumbs items={[['Wishlist']]} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="heading-lg">{shared ? 'A Shared Wishlist' : 'My Wishlist'}</h1>
            <p className="mt-2 text-sm text-ink-soft">{items.length} saved {items.length === 1 ? 'piece' : 'pieces'} · turn on alerts to hear about price drops</p>
          </div>
          {!shared && items.length > 0 && (
            <button onClick={share} className="btn-outline">
              <Share2 size={14} /> Share Wishlist
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Nothing saved yet" copy="Tap the heart on any piece to keep it here — we’ll let you know if its price drops." action={{ label: 'Discover jewellery', to: '/products' }} />
          </div>
        ) : (
          <motion.ul layout className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5">
            <AnimatePresence>
              {items.map((p) => {
                const alert = priceAlerts.includes(p.id);
                return (
                  <motion.li key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group flex flex-col">
                    <Link to={p.isCoin ? '/gold-coins' : `/product/${p.slug}`} className="relative block overflow-hidden rounded-[22px] bg-ivory shadow-soft">
                      {p.isCoin ? (
                        <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-ivory to-champagne/60">
                          <CoinArt motif={p.coin.motif} weight={p.weight} shape={p.coin.shape} size={150} />
                        </div>
                      ) : (
                        <SmartImage name={p.image} width={600} sizes="(min-width:1024px) 25vw, 50vw" zoom className="aspect-[4/5] w-full" />
                      )}
                    </Link>
                    <p className="mt-3 text-[10.5px] uppercase tracking-[0.18em] text-ink-faint">{p.purity} · {p.weight} g</p>
                    <p className="line-clamp-1 font-display text-xl">{p.name}</p>
                    <p className="text-sm font-medium">{formatINR(productPrice(p))}</p>
                    {shared ? (
                      <button onClick={() => addToCart(p.id)} className="btn-primary mt-3 !py-2.5 !text-[10.5px]">Add to Cart</button>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => moveToCart(p.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rose py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                          <ShoppingBag size={13} /> Move to Cart
                        </button>
                        <button onClick={() => togglePriceAlert(p.id)} className={classNames('flex h-10 w-10 items-center justify-center rounded-full border transition', alert ? 'border-rose bg-rose-blush text-rose-deep' : 'border-rose-light text-ink-soft')} aria-label={alert ? 'Turn off price drop alert' : 'Notify me on price drop'} title="Price drop alert">
                          {alert ? <Bell size={15} /> : <BellOff size={15} />}
                        </button>
                        <button onClick={() => toggleWishlist(p.id)} className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-light text-ink-soft hover:text-rose-deep" aria-label="Remove from wishlist">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </section>
  );
}
