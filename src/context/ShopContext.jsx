import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { findItem } from '../data/products';
import { cartTotals, productPrice } from '../utils/pricing';
import { formatINR } from '../utils/format';
import { useUI } from './UIContext';
import { useNotifications } from './NotificationsContext';

const ShopContext = createContext(null);
const MAX_COMPARE = 4;

export function ShopProvider({ children }) {
  const { toast, openCart } = useUI();
  const { notify, requestBrowserPermission } = useNotifications();
  const [cartRaw, setCartRaw] = useLocalStorage('ph.cart', []);
  const [wishlist, setWishlist] = useLocalStorage('ph.wishlist', []);
  const [compare, setCompare] = useLocalStorage('ph.compare', []);
  const [priceAlerts, setPriceAlerts] = useLocalStorage('ph.priceAlerts', []);
  // Per alert: the price when it was set and the last price we notified about, so each drop is reported once.
  const [alertMeta, setAlertMeta] = useLocalStorage('ph.priceAlertMeta', {});
  // Drops already reported this session (id@price) — guards against double effects and rapid re-runs
  const reportedDrops = useRef(new Set());
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

  const productLink = (item) => (item.isCoin ? '/gold-coins' : `/product/${item.slug}`);

  const togglePriceAlert = useCallback(
    (id) => {
      const item = findItem(id);
      if (!item) return;
      const on = priceAlerts.includes(id);
      if (on) {
        setPriceAlerts((prev) => prev.filter((x) => x !== id));
        setAlertMeta((m) => { const next = { ...m }; delete next[id]; return next; });
        toast({ title: 'Price alert off', body: item.name, tone: 'neutral' });
        return;
      }
      const price = productPrice(item);
      setPriceAlerts((prev) => [...prev, id]);
      setAlertMeta((m) => ({ ...m, [id]: { price, notified: null, since: new Date().toISOString() } }));
      toast({ title: 'Price drop alert on', body: `We’ll notify you when ${item.name} drops below ${formatINR(price)}.` });
      notify({ type: 'price', title: 'Price alert set', body: `${item.name} · we’ll tell you when it drops below ${formatINR(price)}.`, to: productLink(item) });
      requestBrowserPermission();
    },
    [priceAlerts, setPriceAlerts, setAlertMeta, toast, notify, requestBrowserPermission],
  );

  // Watch alerted products: on load and every minute, compare today's price with the price saved when the
  // alert was set. A drop creates a bell notification (+ browser notification) once per new low.
  useEffect(() => {
    const check = () => {
      priceAlerts.forEach((id) => {
        const item = findItem(id);
        if (!item) return;
        const current = productPrice(item);
        const meta = alertMeta[id];
        if (!meta) {
          // Alerts saved before price tracking existed: start tracking from today's price
          setAlertMeta((m) => ({ ...m, [id]: { price: current, notified: null, since: new Date().toISOString() } }));
          return;
        }
        const key = `${id}@${current}`;
        if (current < meta.price && current !== meta.notified && !reportedDrops.current.has(key)) {
          reportedDrops.current.add(key);
          const saving = meta.price - current;
          notify({
            type: 'price',
            title: `Price drop: ${item.name}`,
            body: `Now ${formatINR(current)} — was ${formatINR(meta.price)} when you set the alert (${formatINR(saving)} less).`,
            to: productLink(item),
            browser: true,
          });
          toast({ title: 'Price drop on your wishlist', body: `${item.name} is now ${formatINR(current)}`, tone: 'love' });
          setAlertMeta((m) => ({ ...m, [id]: { ...m[id], notified: current } }));
        }
      });
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, [priceAlerts, alertMeta, notify, toast, setAlertMeta]);

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
    alertMeta,
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
