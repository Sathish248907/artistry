import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import Modal from '../common/Modal';
import CartItem from './CartItem';
import { useShop } from '../../context/ShopContext';
import { useUI } from '../../context/UIContext';
import { formatINR } from '../../utils/format';

const FREE_GIFT_AT = 150000;

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUI();
  const { cart, totals, cartCount } = useShop();
  const navigate = useNavigate();
  const progress = Math.min(100, (totals.total / FREE_GIFT_AT) * 100);

  const go = (to) => {
    closeCart();
    navigate(to);
  };

  return (
    <Modal open={cartOpen} onClose={closeCart} variant="drawer" title="Your cart">
      <div className="flex h-full flex-col">
        <div className="border-b border-rose-light/50 bg-gradient-to-r from-ivory to-cream px-6 pb-5 pt-6">
          <p className="eyebrow flex items-center gap-2">
            <ShoppingBag size={13} /> Your cart
          </p>
          <h3 className="mt-2 font-display text-3xl">
            {cartCount} {cartCount === 1 ? 'piece' : 'pieces'}
          </h3>
          {cart.length > 0 && (
            <div className="mt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-ivory">
                <div className="h-full rounded-full bg-gradient-to-r from-rose to-gold transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                {progress >= 100 ? 'You’ve unlocked a complimentary silver-lined jewellery box.' : `Add ${formatINR(FREE_GIFT_AT - totals.total)} more for a complimentary jewellery box.`}
              </p>
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-blush text-rose">
              <ShoppingBag size={30} strokeWidth={1.4} />
            </div>
            <p className="mt-5 font-display text-2xl">Your cart is waiting</p>
            <p className="mt-2 text-sm text-ink-soft">Discover hallmarked gold priced live to today’s rate.</p>
            <button onClick={() => go('/products')} className="btn-primary mt-7">
              Shop Gold
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-rose-light/50 overflow-y-auto px-6">
              <AnimatePresence initial={false}>
                {cart.map((l) => (
                  <CartItem key={l.id} line={l} compact />
                ))}
              </AnimatePresence>
            </ul>
            <div className="border-t border-rose-light/60 bg-cream px-6 pb-6 pt-5 pb-safe">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <dt>Gold value + making</dt>
                  <dd className="tabular-nums">{formatINR(totals.subtotal + totals.making - totals.discount)}</dd>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <dt>GST (3%)</dt>
                  <dd className="tabular-nums">{formatINR(totals.gst)}</dd>
                </div>
                <div className="flex items-baseline justify-between pt-2">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-display text-2xl text-rose-deep">{formatINR(totals.total)}</dd>
                </div>
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => go('/cart')} className="btn-outline">
                  View Cart
                </button>
                <button onClick={() => go('/checkout')} className="btn-primary">
                  Checkout
                </button>
              </div>
              <div className="mt-4 flex justify-center gap-5 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                <span className="flex items-center gap-1.5"><Truck size={13} className="text-rose" /> Free insured shipping</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-rose" /> Secure payment</span>
              </div>
              <Link to="/products" onClick={closeCart} className="mt-3 block text-center text-[11px] uppercase tracking-[0.18em] text-rose-deep hover:underline">
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
