import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, CalendarClock, Gift, Package, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import Modal from '../common/Modal';
import { useUI } from '../../context/UIContext';
import { NOTIFICATIONS } from '../../data/content';
import { classNames } from '../../utils/format';

export const NOTIFICATION_META = {
  order: { icon: Package, label: 'Order Updates' },
  collection: { icon: Sparkles, label: 'New Collections' },
  offer: { icon: Gift, label: 'Offers' },
  price: { icon: TrendingDown, label: 'Wishlist Price Drops' },
  rate: { icon: TrendingUp, label: 'Gold Rate Updates' },
  appointment: { icon: CalendarClock, label: 'Appointment Reminders' },
};

export function NotificationList({ items, onRead }) {
  return (
    <ul className="space-y-2">
      {items.map((n, i) => {
        const Meta = NOTIFICATION_META[n.type];
        const I = Meta.icon;
        return (
          <motion.li key={n.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
            <button
              onClick={() => onRead?.(n.id)}
              className={classNames(
                'flex w-full gap-3 rounded-2xl border p-4 text-left transition',
                n.read ? 'border-rose-light/40 bg-ivory' : 'border-rose-light bg-gradient-to-r from-ivory to-ivory',
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory text-rose shadow-soft">
                <I size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{n.title}</span>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-rose" />}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{n.body}</span>
                <span className="mt-1.5 block text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  {Meta.label} · {n.time}
                </span>
              </span>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}

export default function NotificationPanel() {
  const { notificationsOpen, setNotificationsOpen } = useUI();
  const [items, setItems] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const close = () => setNotificationsOpen(false);
  const shown = filter === 'all' ? items : items.filter((n) => n.type === filter);

  return (
    <Modal open={notificationsOpen} onClose={close} variant="drawer" title="Notifications">
      <div className="flex h-full flex-col">
        <div className="border-b border-rose-light/50 bg-gradient-to-r from-ivory to-cream px-6 pb-5 pt-6">
          <p className="eyebrow flex items-center gap-2">
            <Bell size={13} /> Notifications
          </p>
          <h3 className="mt-2 font-display text-3xl">What’s new for you</h3>
          <button onClick={() => setItems((all) => all.map((n) => ({ ...n, read: true })))} className="mt-2 text-[11px] uppercase tracking-[0.18em] text-rose-deep hover:underline">
            Mark all as read
          </button>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-6 py-4">
          {[['all', 'All'], ...Object.entries(NOTIFICATION_META).map(([k, v]) => [k, v.label])].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} className={classNames('chip shrink-0', filter === k && 'chip-active')}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          <NotificationList items={shown} onRead={(id) => setItems((all) => all.map((n) => (n.id === id ? { ...n, read: true } : n)))} />
          <Link to="/account?tab=notifications" onClick={close} className="btn-outline mt-6 w-full">
            Notification settings
          </Link>
        </div>
      </div>
    </Modal>
  );
}
