import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { findItem } from '../data/products';
import { cartTotals } from '../utils/pricing';
import { useUI } from './UIContext';

const ShopContext = createContext(null);
const MAX_COMPARE = 4;

export function ShopProvider({ children }) {
  const { toast, openCart } = useUI();
  const [cartRaw, setCartRaw] = useLocalStorage('ph.cart', []);
  const [wishlist, setWishlist] = useLocalStorage('ph.wishlist', []);
  const [compare, setCompare] = useLocalStorage('ph.compare', []);
  const [priceAlerts, setPriceAlerts] = useLocalStorage('ph.priceAlerts', []);
  const [coupon, setCoupon] = useLocalStorage('ph.coupon', null);

  // Resolve stored ids against the catalogue; silently drop anything no longer sold.
  const cart = useMemo(
    () => cartRaw.map((l) => ({ ...l, product: findItem(l.id) })).filter((l) => l.product),
    [cartRaw],
  );

  const addToCart = useCallback(
    (id, qty = 1, { silent = false, size } = {}) => {
      setCartRaw((prev) => {
        const found = prev.find((l) => l.id === id);
        if (found) return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + qty, 10) } : l));
        return [...prev, { id, qty, size }];
      });
      if (!silent) {
        const item = findItem(id);
        toast({ title: 'Added to cart', body: item?.name, tone: 'success', action: { label: 'View cart', onClick: openCart } });
      }
    },
    [setCartRaw, toast, openCart],
  );

  const updateQty = useCallback(
    (id, qty) => setCartRaw((prev) => prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(qty, 10)) } : l))),
    [setCartRaw],
  );
  const removeFromCart = useCallback((id) => setCartRaw((prev) => prev.filter((l) => l.id !== id)), [setCartRaw]);
  const clearCart = useCallback(() => setCartRaw([]), [setCartRaw]);

  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);
  const toggleWishlist = useCallback(
    (id) => {
      const on = wishlist.includes(id);
      setWishlist((prev) => (on ? prev.filter((x) => x !== id) : [id, ...prev]));
      toast({ title: on ? 'Removed from wishlist' : 'Saved to wishlist', body: findItem(id)?.name, tone: on ? 'neutral' : 'love' });
    },
    [wishlist, setWishlist, toast],
  );

  const moveToCart = useCallback(
    (id) => {
      setWishlist((prev) => prev.filter((x) => x !== id));
      addToCart(id);
    },
    [setWishlist, addToCart],
  );

  const moveToWishlist = useCallback(
    (id) => {
      removeFromCart(id);
      setWishlist((prev) => (prev.includes(id) ? prev : [id, ...prev]));
      toast({ title: 'Moved to wishlist', body: findItem(id)?.name, tone: 'love' });
    },
    [removeFromCart, setWishlist, toast],
  );

  const togglePriceAlert = useCallback(
    (id) => {
      const on = priceAlerts.includes(id);
      setPriceAlerts((prev) => (on ? prev.filter((x) => x !== id) : [...prev, id]));
      toast({ title: on ? 'Price alert off' : 'Price drop alert on', body: on ? undefined : 'We’ll notify you when the price drops.' });
    },
    [priceAlerts, setPriceAlerts, toast],
  );

  const toggleCompare = useCallback(
    (id) => {
      if (compare.includes(id)) {
        setCompare((prev) => prev.filter((x) => x !== id));
        return;
      }
      if (compare.length >= MAX_COMPARE) {
        toast({ title: 'Compare is full', body: `You can compare up to ${MAX_COMPARE} pieces.`, tone: 'neutral' });
        return;
      }
      setCompare((prev) => [...prev, id]);
    },
    [compare, setCompare, toast],
  );

  const totals = useMemo(() => cartTotals(cart, { coupon }), [cart, coupon]);
  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);

  const value = {
    cart,
    cartCount,
    totals,
    coupon,
    setCoupon,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    moveToWishlist,
    wishlist,
    isWishlisted,
    toggleWishlist,
    moveToCart,
    priceAlerts,
    togglePriceAlert,
    compare,
    toggleCompare,
    clearCompare: () => setCompare([]),
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside ShopProvider');
  return ctx;
};
