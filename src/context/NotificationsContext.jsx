import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { NOTIFICATIONS } from '../data/content';

/**
 * In-app notification centre. Notifications persist in localStorage, so alerts you set survive reloads.
 * Types: order · collection · offer · price · rate · appointment (see NOTIFICATION_META).
 */
const NotificationsContext = createContext(null);

const TYPES = ['order', 'collection', 'offer', 'price', 'rate', 'appointment'];
const seed = () => NOTIFICATIONS.map((n) => ({ ...n, id: `seed-${n.id}` }));

export const canUseBrowserNotifications = () => typeof window !== 'undefined' && 'Notification' in window;

export function NotificationsProvider({ children }) {
  const [items, setItems] = useLocalStorage('ph.notifications', seed());
  const [prefs, setPrefs] = useLocalStorage('ph.notifPrefs', Object.fromEntries(TYPES.map((t) => [t, true])));

  /** Ask once for permission to show browser (OS-level) notifications. */
  const requestBrowserPermission = useCallback(async () => {
    if (!canUseBrowserNotifications() || Notification.permission !== 'default') return Notification?.permission;
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }, []);

  /** Show a browser notification if the user has allowed them. Falls back silently. */
  const pushBrowser = useCallback((title, body, to) => {
    if (!canUseBrowserNotifications() || Notification.permission !== 'granted') return;
    try {
      const n = new Notification(title, { body, icon: `${import.meta.env.BASE_URL}favicon.svg`, tag: `${title}-${body}` });
      if (to) n.onclick = () => window.open(`${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}${to}`, '_blank');
    } catch {
      /* some browsers block constructing notifications outside a user gesture */
    }
  }, []);

  /**
   * Add a notification. Respects the per-type preference; returns the new id (or null if muted).
   * @param {{type:string,title:string,body:string,to?:string,browser?:boolean}} n
   */
  const notify = useCallback(
    ({ type, title, body, to, browser = false }) => {
      if (prefs[type] === false) return null;
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      setItems((prev) => [{ id, type, title, body, to, at: new Date().toISOString(), read: false }, ...prev].slice(0, 60));
      if (browser) pushBrowser(title, body, to);
      return id;
    },
    [prefs, setItems, pushBrowser],
  );

  const markRead = useCallback((id) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))), [setItems]);
  const markAllRead = useCallback(() => setItems((prev) => prev.map((n) => ({ ...n, read: true }))), [setItems]);
  const clearAll = useCallback(() => setItems([]), [setItems]);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const value = useMemo(
    () => ({ items, unread, notify, markRead, markAllRead, clearAll, prefs, setPrefs, requestBrowserPermission }),
    [items, unread, notify, markRead, markAllRead, clearAll, prefs, setPrefs, requestBrowserPermission],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
};

/** "Just now", "12m ago", "3h ago", "2 days ago", or the seeded label for sample items. */
export function notificationTime(n) {
  if (!n.at) return n.time || '';
  const diff = Math.max(0, Date.now() - new Date(n.at).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
}
