import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { findItem, itemBySku, storefrontSku } from '../data/products';
import { cartTotals, productPrice } from '../utils/pricing';
import { formatINR } from '../utils/format';
import { offerService } from '../services';
import { shopApi } from '../admin/api';
import { useUI } from './UIContext';
import { useNotifications } from './NotificationsContext';
import { useAuth } from './AuthContext';

const round = (v) => Math.round(v * 100) / 100;

/** A backend cart line in the shape the cart components already use. */
const toLine = (item) => {
  const product = itemBySku(item.sku) || {
    // An item that exists in the backend but not in the storefront's catalogue
    id: item.sku,
    name: item.product.name,
    slug: item.product.slug,
    purity: item.goldPurity || item.product.goldPurity,
    weight: item.goldWeight || item.product.goldWeight || 0,
    backendOnly: true,
  };
  return { id: product.id, qty: item.quantity, product, serverId: item.id, sku: item.sku, unitPrice: item.unitPrice, lineTotal: item.lineTotal, availability: item.availability };
};

const ShopContext = createContext(null);
const MAX_COMPARE = 4;

export function ShopProvider({ children }) {
  const { toast, openCart } = useUI();
  const { notify, requestBrowserPermission } = useNotifications();
  const { user, backend } = useAuth();
  const [cartRaw, setCartRaw] = useLocalStorage('ph.cart', []);
  // Ring and bangle sizes chosen on the product page, by SKU (sent with the order as a note)
  const [sizes, setSizes] = useLocalStorage('ph.cartSizes', {});

  /*
   * Backend mode, signed in: the cart lives on the server and every price comes from it.
   * Anything added while signed out stays on this device and is moved to the server at sign-in.
   */
  const serverMode = Boolean(backend && user);
  const [server, setServer] = useState(null);
  const [serverBusy, setServerBusy] = useState(false);

  const refreshCart = useCallback(async () => {
    const data = await shopApi('/checkout/calculate', { method: 'POST', body: {} });
    setServer(data);
    return data;
  }, []);

  const serverCall = useCallback(
    async (fn, { success } = {}) => {
      setServerBusy(true);
      try {
        await fn();
        if (success) success();
        return true;
      } catch (error) {
        toast({ title: 'Cart not updated', body: error.message, tone: 'neutral' });
        return false;
      } finally {
        await refreshCart().catch(() => {});
        setServerBusy(false);
      }
    },
    [refreshCart, toast],
  );

  useEffect(() => {
    if (!serverMode) {
      setServer(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const local = cartRaw;
      for (const line of local) {
        const item = findItem(line.id);
        if (item) await shopApi('/cart/items', { method: 'POST', body: { sku: storefrontSku(item), quantity: line.qty } }).catch(() => {});
      }
      if (local.length && !cancelled) setCartRaw([]);
      if (!cancelled) await refreshCart().catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverMode, user && user.id]);
  const [wishlist, setWishlist] = useLocalStorage('ph.wishlist', []);
  const [compare, setCompare] = useLocalStorage('ph.compare', []);
  const [priceAlerts, setPriceAlerts] = useLocalStorage('ph.priceAlerts', []);
  // Per alert: the price when it was set and the last price we notified about, so each drop is reported once.
  const [alertMeta, setAlertMeta] = useLocalStorage('ph.priceAlertMeta', {});
  // Drops already reported this session (id@price) — guards against double effects and rapid re-runs
  const reportedDrops = useRef(new Set());
  const [coupon, setCoupon] = useLocalStorage('ph.coupon', null);

  // Resolve stored ids against the catalogue; silently drop anything no longer sold.
  const localCart = useMemo(
    () => cartRaw.map((l) => ({ ...l, product: findItem(l.id) })).filter((l) => l.product),
    [cartRaw],
  );
  const cart = useMemo(() => (serverMode ? (server ? server.items.map(toLine) : []) : localCart), [serverMode, server, localCart]);

  const addToCart = useCallback(
    (id, qty = 1, { silent = false, size } = {}) => {
      const item = findItem(id);
      if (serverMode) {
        if (!item) return Promise.resolve(false);
        const sku = storefrontSku(item);
        if (size) setSizes((m) => ({ ...m, [sku]: size }));
        return serverCall(() => shopApi('/cart/items', { method: 'POST', body: { sku, quantity: qty } }), {
          success: () => !silent && toast({ title: 'Added to cart', body: item.name, tone: 'success', action: { label: 'View cart', onClick: openCart } }),
        });
      }
      if (size && item) setSizes((m) => ({ ...m, [storefrontSku(item)]: size }));
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
    [setCartRaw, toast, openCart, serverMode, serverCall, setSizes],
  );

  const lineFor = useCallback((id) => cart.find((l) => l.id === id), [cart]);

  const updateQty = useCallback(
    (id, qty) => {
      const quantity = Math.max(1, Math.min(qty, 10));
      if (serverMode) {
        const line = lineFor(id);
        return line ? serverCall(() => shopApi(`/cart/items/${line.serverId}`, { method: 'PUT', body: { quantity } })) : Promise.resolve(false);
      }
      setCartRaw((prev) => prev.map((l) => (l.id === id ? { ...l, qty: quantity } : l)));
      return Promise.resolve(true);
    },
    [setCartRaw, serverMode, lineFor, serverCall],
  );
  const removeFromCart = useCallback(
    (id) => {
      if (serverMode) {
        const line = lineFor(id);
        return line ? serverCall(() => shopApi(`/cart/items/${line.serverId}`, { method: 'DELETE' })) : Promise.resolve(false);
      }
      setCartRaw((prev) => prev.filter((l) => l.id !== id));
      return Promise.resolve(true);
    },
    [setCartRaw, serverMode, lineFor, serverCall],
  );
  const clearCart = useCallback(() => {
    if (serverMode) return serverCall(() => shopApi('/cart', { method: 'DELETE' }));
    setCartRaw([]);
    return Promise.resolve(true);
  }, [setCartRaw, serverMode, serverCall]);

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

  const totals = useMemo(() => {
    if (!serverMode) return cartTotals(localCart, { coupon });
    const t = server ? server.totals : null;
    if (!t) return { subtotal: 0, making: 0, discount: 0, gst: 0, shipping: 0, total: 0, weight: 0 };
    // Same rows the summary already shows; they add up to the backend's grand total
    return {
      subtotal: t.goldValue,
      making: round(t.itemsTotal - t.goldValue - t.tax),
      discount: t.discount,
      gst: t.tax,
      shipping: t.shipping,
      total: t.grandTotal,
      weight: cart.reduce((n, l) => n + (Number(l.product.weight) || 0) * l.qty, 0),
    };
  }, [serverMode, server, localCart, coupon, cart]);
  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);

  /** Apply or remove a coupon. Resolves with { ok, text }. */
  const applyCoupon = useCallback(
    async (code) => {
      if (serverMode) {
        try {
          const { coupon: applied } = await shopApi('/cart/coupon', { method: 'PUT', body: { code: code || null } });
          await refreshCart();
          return { ok: true, text: applied ? `${applied.code} applied — ${formatINR(applied.discount)} off.` : 'Coupon removed.' };
        } catch (error) {
          return { ok: false, text: error.message };
        }
      }
      if (!code) {
        setCoupon(null);
        return { ok: true, text: 'Coupon removed.' };
      }
      const res = await offerService.validate(code);
      if (res.valid) {
        setCoupon(res.code);
        return { ok: true, text: `${res.code} applied — 10% off making charges.` };
      }
      return { ok: false, text: 'This code isn’t valid. Try GOLDEN10.' };
    },
    [serverMode, refreshCart, setCoupon],
  );

  const value = {
    cart,
    cartCount,
    totals,
    coupon: serverMode ? (server && server.coupon ? server.coupon.code : null) : coupon,
    setCoupon,
    applyCoupon,
    cartMode: serverMode ? 'backend' : 'device',
    serverCart: server,
    serverBusy,
    refreshCart,
    sizes,
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
