import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Truck } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import EmptyState from '../components/common/EmptyState';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import SectionHeading from '../components/common/SectionHeading';
import ProductCard from '../components/product/ProductCard';
import { StaggerGroup } from '../components/common/Reveal';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';

export default function Cart() {
  const { cart, cartCount, clearCart } = useShop();
  const suggestions = PRODUCTS.filter((p) => !cart.some((l) => l.id === p.id) && p.collection.includes('best-sellers')).slice(0, 4);

  return (
    <>
      <section className="w-full bg-gradient-to-b from-cream to-ivory pb-16 pt-8">
        <div className="shell">
          <Breadcrumbs items={[['Cart']]} />
          <div className="mt-6 flex items-end justify-between">
            <h1 className="heading-lg">Your Cart <span className="text-ink-faint">({cartCount})</span></h1>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-[11px] uppercase tracking-[0.18em] text-ink-faint hover:text-rose-deep">
                Clear cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="mt-10">
              <EmptyState title="Your cart is empty" copy="Find a piece that feels like you — every price is live to today’s gold rate." action={{ label: 'Shop gold', to: '/products' }} secondary={{ label: 'View wishlist', to: '/wishlist' }} />
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] [&>*]:min-w-0">
              <div className="rounded-[28px] border border-rose-light/60 bg-ivory px-5 sm:px-8">
                <div className="hidden grid-cols-[1fr_auto] border-b border-rose-light/50 py-4 text-[11px] uppercase tracking-[0.18em] text-ink-faint sm:grid">
                  <span>Product</span>
                  <span>Price</span>
                </div>
                <ul className="divide-y divide-rose-light/50">
                  <AnimatePresence initial={false}>
                    {cart.map((l) => (
                      <CartItem key={l.id} line={l} />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
              <div className="lg:sticky lg:top-24 lg:self-start">
                <OrderSummary>
                  <Link to="/checkout" className="btn-primary w-full">
                    <Lock size={14} /> Proceed to Checkout
                  </Link>
                  <div className="mt-4 flex justify-center gap-5 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
                    <span className="flex items-center gap-1.5"><Truck size={13} className="text-rose" /> Insured delivery</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-rose" /> BIS hallmarked</span>
                  </div>
                </OrderSummary>
              </div>
            </div>
          )}
        </div>
      </section>
      {suggestions.length > 0 && (
        <section className="w-full bg-ivory pb-20">
          <div className="shell">
            <SectionHeading eyebrow="Complete your look" title="Best Sellers" />
            <StaggerGroup className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
              {suggestions.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}
    </>
  );
}
