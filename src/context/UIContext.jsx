import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    ({ title, body, tone = 'success', action, duration = 3200 }) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((t) => [...t.slice(-2), { id, title, body, tone, action }]);
      setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast],
  );

  const openCart = useCallback(() => setCartOpen(true), []);

  const value = useMemo(
    () => ({
      searchOpen,
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      cartOpen,
      openCart,
      closeCart: () => setCartOpen(false),
      menuOpen,
      setMenuOpen,
      notificationsOpen,
      setNotificationsOpen,
      quickViewId,
      openQuickView: (id) => setQuickViewId(id),
      closeQuickView: () => setQuickViewId(null),
      compareOpen,
      setCompareOpen,
      toasts,
      toast,
      dismissToast,
    }),
    [searchOpen, cartOpen, openCart, menuOpen, notificationsOpen, quickViewId, compareOpen, toasts, toast, dismissToast],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
};
