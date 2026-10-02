import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, ChevronRight, Coins, Heart, HelpCircle, LogOut, MapPin, Package, PenTool, RotateCcw, Search, User } from 'lucide-react';
import SmartImage from '../components/common/SmartImage';
import { LoginStep } from '../components/checkout/CheckoutSteps';
import ProfileDetailsForm from '../components/account/ProfileDetailsForm';
import { NotificationList, NOTIFICATION_META } from '../components/navbar/NotificationPanel';
import CoinArt from '../components/goldCoins/CoinArt';
import { canUseBrowserNotifications, useNotifications } from '../context/NotificationsContext';
import { productPrice } from '../utils/pricing';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useUI } from '../context/UIContext';
import { customDesignService, customerService, orderService } from '../services';
import { STORES } from '../data/content';
import { findItem } from '../data/products';
import useLocalStorage from '../hooks/useLocalStorage';
import { classNames, formatDate, formatINR } from '../utils/format';
import { EASE } from '../components/common/Reveal';
import { BackendAddresses, BackendOrders, BackendProfile, BackendReturns } from '../components/account/BackendAccount';

const TABS = [
  ['profile', 'My Profile', User],
  ['orders', 'My Orders', Package],
  ['wishlist', 'Wishlist', Heart],
  ['addresses', 'Saved Addresses', MapPin],
  ['appointments', 'Appointments', Calendar],
  ['searches', 'Saved Searches', Search],
  ['notifications', 'Notifications', Bell],
  ['savings', 'Gold Savings', Coins],
  ['designs', 'Custom Design Requests', PenTool],
  ['support', 'Help & Support', HelpCircle],
];

const STATUS_STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered'];

function Panel({ title, children, action }) {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Profile({ user }) {
  const { toast } = useUI();
  const [p, setP] = useState(null);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    customerService.profile().then(setP);
  }, []);
  if (!p) return <div className="h-40 animate-pulse rounded-3xl bg-rose-blush/50" />;
  return (
    <Panel
      title="My Profile"
      action={
        !editing && (
          <button onClick={() => setEditing(true)} className="text-[11px] uppercase tracking-[0.18em] text-rose-deep hover:underline">
            Edit profile
          </button>
        )
      }
    >
      {editing ? (
        <div className="rounded-2xl border border-rose-light/60 bg-ivory p-5">
          <ProfileDetailsForm
            intro={false}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onDone={() => {
              setEditing(false);
              toast({ title: 'Profile updated', body: 'Your details have been saved.' });
            }}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Name', user.name],
            ['Mobile', user.mobile],
            ['Email', user.email],
            ['City', user.city],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-rose-light/60 bg-ivory p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">{k}</p>
              <p className="mt-1 text-ink">{v}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-3xl border border-rose-light bg-ivory p-6">
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-luxe text-rose-deep">{p.tier} member</p>
          <p className="mt-1 font-display text-3xl">4,820 points</p>
          <p className="text-sm text-ink/70">Worth {formatINR(4820)} off making charges on your next purchase.</p>
        </div>
        <Link to="/products" className="btn-light">Redeem</Link>
      </div>
    </Panel>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    orderService.list().then(setOrders);
  }, []);
  return (
    <Panel title="My Orders">
      <div className="space-y-4">
        {orders.map((o) => {
          const idx = STATUS_STEPS.indexOf(o.status);
          return (
            <div key={o.id} className="rounded-3xl border border-rose-light/60 bg-ivory p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{o.id}</p>
                  <p className="text-xs text-ink-faint">Placed {formatDate(o.date)} · {o.items} item{o.items > 1 ? 's' : ''}</p>
                </div>
                <p className="font-display text-2xl text-rose-deep">{formatINR(o.total)}</p>
              </div>
              <div className="mt-5 flex items-center">
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="flex flex-1 items-center last:flex-none">
                    <span className={classNames('flex h-7 w-7 items-center justify-center rounded-full text-[10px]', i <= idx ? 'bg-rose text-white' : 'bg-rose-blush text-ink-faint')}>{i + 1}</span>
                    {i < STATUS_STEPS.length - 1 && <span className={classNames('mx-1 h-0.5 flex-1', i < idx ? 'bg-rose' : 'bg-rose-blush')} />}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                {STATUS_STEPS.map((s) => <span key={s}>{s}</span>)}
              </div>
              {o.eta && <p className="mt-4 text-sm text-ink-soft">Arriving by <strong className="font-medium text-rose-deep">{formatDate(o.eta, { weekday: 'long', day: 'numeric', month: 'short' })}</strong></p>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function WishlistTab() {
  const { wishlist } = useShop();
  const items = wishlist.map(findItem).filter((p) => p && !p.isCoin);
  return (
    <Panel title="Wishlist" action={<Link to="/wishlist" className="btn-ghost text-[11px]">Open wishlist <ChevronRight size={14} /></Link>}>
      {items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} className="group">
              <SmartImage name={p.image} width={400} sizes="200px" zoom className="aspect-square w-full rounded-2xl" />
              <p className="mt-2 truncate font-display text-lg">{p.name}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-rose-light p-8 text-center text-sm text-ink-soft">No saved pieces yet. <Link to="/products" className="text-rose-deep underline">Start exploring</Link>.</p>
      )}
    </Panel>
  );
}

function Addresses() {
  const [list, setList] = useState([]);
  useEffect(() => {
    customerService.addresses().then(setList);
  }, []);
  return (
    <Panel title="Saved Addresses">
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((a) => (
          <div key={a.id} className="rounded-2xl border border-rose-light/60 bg-ivory p-5">
            <p className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.16em] text-rose-deep">
              {a.label} {a.default && <span className="rounded-full bg-rose-blush px-2 py-0.5 text-[9px]">Default</span>}
            </p>
            <p className="mt-2 font-medium">{a.name}</p>
            <p className="text-sm text-ink-soft">{a.line}, {a.city} {a.pincode}</p>
            <p className="mt-1 text-xs text-ink-faint">{a.phone}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Appointments() {
  return (
    <Panel title="Appointments" action={<Link to="/appointment" className="btn-primary !py-3">Book new</Link>}>
      <div className="flex flex-wrap items-center gap-5 rounded-3xl border border-rose-light/60 bg-ivory p-6">
        <span className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-rose-blush text-rose-deep">
          <span className="text-[10px] uppercase">Sat</span>
          <span className="font-display text-2xl leading-none">04</span>
        </span>
        <div className="flex-1">
          <p className="font-display text-2xl">Bridal consultation</p>
          <p className="text-sm text-ink-soft">11:30 AM · {STORES[0].name}</p>
        </div>
        <span className="rounded-full bg-rose-blush px-3 py-1 text-xs text-rose-deep">Confirmed</span>
      </div>
    </Panel>
  );
}

function Searches() {
  const [recent, setRecent] = useLocalStorage('ph.recentSearches', []);
  const saved = [
    ['22K temple necklaces under ₹5L', '/products?type=temple&category=necklaces&purity=22K'],
    ['Everyday earrings', '/products?category=earrings&collection=everyday'],
    ['10g Lakshmi coins', '/gold-coins?cat=lakshmi'],
  ];
  return (
    <Panel title="Saved Searches">
      <ul className="space-y-2">
        {saved.map(([t, to]) => (
          <li key={t}>
            <Link to={to} className="flex items-center justify-between rounded-2xl border border-rose-light/60 bg-ivory px-5 py-4 hover:border-rose">
              <span className="flex items-center gap-3"><Search size={15} className="text-rose" /> {t}</span>
              <ChevronRight size={16} className="text-ink-faint" />
            </Link>
          </li>
        ))}
      </ul>
      {recent.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="label !mb-0">Recent searches</p>
            <button onClick={() => setRecent([])} className="text-[11px] uppercase tracking-[0.16em] text-ink-faint hover:text-rose-deep">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => <Link key={r} to={`/products?q=${encodeURIComponent(r)}`} className="chip">{r}</Link>)}
          </div>
        </div>
      )}
    </Panel>
  );
}

function Notifications() {
  const { items, prefs, setPrefs, markAllRead, clearAll, requestBrowserPermission } = useNotifications();
  const { priceAlerts, alertMeta, togglePriceAlert } = useShop();
  const [perm, setPerm] = useState(canUseBrowserNotifications() ? Notification.permission : 'unsupported');
  const alerts = priceAlerts.map((id) => ({ id, item: findItem(id), meta: alertMeta[id] })).filter((a) => a.item);

  return (
    <Panel
      title="Notifications"
      action={
        items.length > 0 && (
          <div className="flex gap-3 text-[11px] uppercase tracking-[0.16em]">
            <button onClick={markAllRead} className="text-rose-deep hover:underline">Mark all read</button>
            <button onClick={clearAll} className="text-ink-faint hover:text-rose-deep">Clear</button>
          </div>
        )
      }
    >
      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <NotificationList items={items} />

          <div>
            <p className="label">Your price alerts ({alerts.length})</p>
            {alerts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-rose-light p-6 text-sm text-ink-soft">
                No alerts yet. Open any piece and tap <strong className="font-medium text-ink">Notify on price drop</strong> — we’ll message you here (and in your browser) when its price falls.
              </p>
            ) : (
              <ul className="space-y-2">
                {alerts.map(({ id, item, meta }) => {
                  const current = productPrice(item);
                  const saved = meta?.price ?? current;
                  const diff = saved - current;
                  return (
                    <li key={id} className="flex items-center gap-4 rounded-2xl border border-rose-light/60 bg-ivory p-3">
                      {item.isCoin ? (
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-blush"><CoinArt motif={item.coin.motif} size={40} /></span>
                      ) : (
                        <SmartImage name={item.image} width={200} sizes="56px" className="h-14 w-14 shrink-0 rounded-xl" />
                      )}
                      <span className="min-w-0 flex-1">
                        <Link to={item.isCoin ? '/gold-coins' : `/product/${item.slug}`} className="block truncate font-display text-lg text-ink hover:text-rose-deep">{item.name}</Link>
                        <span className="block text-xs text-ink-soft">
                          Alert set at {formatINR(saved)} · now <strong className={classNames('font-medium', diff > 0 ? 'text-rose-deep' : 'text-ink')}>{formatINR(current)}</strong>
                          {diff > 0 ? ` · down ${formatINR(diff)}` : diff < 0 ? ` · up ${formatINR(-diff)}` : ' · unchanged'}
                        </span>
                      </span>
                      <button onClick={() => togglePriceAlert(id)} className="chip shrink-0 !px-3 !py-1.5 !text-[10px] uppercase tracking-[0.14em]">Remove</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-rose-light/60 bg-ivory p-6">
            <p className="label">Notify me about</p>
            <ul className="mt-2 space-y-3">
              {Object.entries(NOTIFICATION_META).map(([k, m]) => (
                <li key={k} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{m.label}</span>
                  <button role="switch" aria-checked={prefs[k] !== false} aria-label={m.label} onClick={() => setPrefs((p) => ({ ...p, [k]: p[k] === false }))} className={classNames('relative h-6 w-11 rounded-full transition', prefs[k] !== false ? 'bg-rose' : 'bg-rose-light/60')}>
                    <motion.span layout className={classNames('absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow', prefs[k] !== false ? 'right-0.5' : 'left-0.5')} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-rose-light/60 bg-ivory p-6">
            <p className="label">Browser notifications</p>
            {perm === 'granted' && <p className="text-sm text-ink-soft">On — price drops also pop up on this device even when you’re on another tab.</p>}
            {perm === 'denied' && <p className="text-sm text-ink-soft">Blocked in your browser. Allow notifications for this site in the address-bar settings to turn them on.</p>}
            {perm === 'unsupported' && <p className="text-sm text-ink-soft">Not supported by this browser. You’ll still get alerts in the bell menu.</p>}
            {perm === 'default' && (
              <>
                <p className="text-sm text-ink-soft">Get a pop-up on this device when a watched piece drops in price.</p>
                <button onClick={async () => setPerm(await requestBrowserPermission())} className="btn-outline mt-4 !py-2.5 !text-[11px]">Enable browser alerts</button>
              </>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Savings() {
  const paid = 7;
  return (
    <Panel title="Gold Savings">
      <div className="rounded-3xl border border-rose-light/60 bg-gradient-to-br from-ivory via-ivory to-champagne/50 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-rose-deep">Gold Savings Plan · ₹10,000 / month</p>
            <p className="mt-2 font-display text-4xl">{formatINR(paid * 10000)} saved</p>
            <p className="text-sm text-ink-soft">{paid} of 11 instalments · 12th instalment on us</p>
          </div>
          <button className="btn-primary">Pay instalment</button>
        </div>
        <div className="mt-6 grid grid-cols-11 gap-1.5">
          {Array.from({ length: 11 }, (_, i) => (
            <motion.span key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.05 }} className={classNames('h-10 origin-bottom rounded-lg', i < paid ? 'bg-gradient-to-t from-rose to-rose-light' : 'bg-ivory')} />
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-faint">Maturity on {formatDate(new Date(Date.now() + 4 * 30 * 864e5))} · redeemable for any jewellery</p>
      </div>
      <Link to="/" className="btn-ghost mt-4 text-[11px]">Explore other plans <ChevronRight size={14} /></Link>
    </Panel>
  );
}

function Designs() {
  const [list, setList] = useState([]);
  useEffect(() => {
    customDesignService.list().then(setList);
  }, []);
  return (
    <Panel title="Custom Design Requests" action={<Link to="/customize" className="btn-primary !py-3">New design</Link>}>
      {list.map((d) => (
        <div key={d.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-rose-light/60 bg-ivory p-6">
          <div>
            <p className="font-display text-2xl">{d.piece}</p>
            <p className="text-sm text-ink-soft">{d.id} · {d.purity} gold · updated {formatDate(d.updated)}</p>
          </div>
          <span className="rounded-full bg-rose-blush px-3 py-1 text-xs text-rose-deep">{d.status}</span>
        </div>
      ))}
    </Panel>
  );
}

function Support() {
  const faqs = [
    ['How is the price of my jewellery calculated?', 'Price = gold value at today’s rate × weight + making charges + any gemstone value + 3% GST. Every product page shows the full break-up.'],
    ['What is your return policy?', 'Returns within 15 days of delivery for a full refund, and lifetime exchange at the prevailing gold rate.'],
    ['How long does shipping take?', 'In-stock pieces ship within 24 hours and arrive in 2–5 working days, fully insured.'],
    ['How do I verify hallmarking?', 'Enter the 6-digit HUID on the BIS CARE app to see purity, jeweller and hallmarking centre details.'],
  ];
  const [open, setOpen] = useState(0);
  return (
    <Panel title="Help & Support">
      <div className="space-y-2">
        {faqs.map(([q, a], i) => (
          <div key={q} className="rounded-2xl border border-rose-light/60 bg-ivory">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium">
              {q}
              <ChevronRight size={16} className={classNames('text-rose transition', open === i && 'rotate-90')} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-5 pb-4 text-sm text-ink-soft">
                  {a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink-soft">Still need help? Call <strong className="font-medium text-ink">1800 419 2026</strong> or chat with us on WhatsApp, 9 AM – 9 PM.</p>
    </Panel>
  );
}

const PANELS = { profile: Profile, orders: Orders, wishlist: WishlistTab, addresses: Addresses, appointments: Appointments, searches: Searches, notifications: Notifications, savings: Savings, designs: Designs, support: Support };

// With the backend connected, profile, orders and addresses are real; returns & refunds get their own tab.
const BACKEND_PANELS = { ...PANELS, profile: BackendProfile, orders: BackendOrders, addresses: BackendAddresses, returns: BackendReturns };
const BACKEND_TABS = [...TABS.slice(0, 4), ['returns', 'Returns & Refunds', RotateCcw], ...TABS.slice(4)];

export default function Account() {
  const { user, profileComplete, logout, backend, status } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const panels = backend ? BACKEND_PANELS : PANELS;
  const tabs = backend ? BACKEND_TABS : TABS;
  const tab = panels[params.get('tab')] ? params.get('tab') : 'profile';
  const Active = panels[tab];

  const doLogout = async () => {
    await logout();
    toast({ title: 'Signed out', body: 'See you soon.', tone: 'neutral' });
    navigate('/');
  };

  return (
    <>
      <section className="relative h-48 w-full overflow-hidden sm:h-56">
        <SmartImage name="pageBanner_account" priority width={2200} className="blend-y absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/95 via-ivory/60 to-transparent" />
        <div className="shell relative flex h-full flex-col justify-center">
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">{profileComplete ? `Namaste, ${user.name.split(' ')[0]}` : user ? 'Almost there' : 'Welcome back'}</h1>
        </div>
      </section>

      <section className="w-full bg-gradient-to-b from-cream to-ivory pb-24 pt-10">
        <div className="shell">
          {status === 'checking' ? (
            <div className="mx-auto h-40 max-w-lg animate-pulse rounded-[28px] bg-rose-blush/50" />
          ) : !profileComplete ? (
            <div className="mx-auto max-w-lg rounded-[28px] border border-rose-light/60 bg-ivory p-8 shadow-soft">
              <h2 className="font-display text-3xl">{user ? 'Complete your profile' : 'Sign in to your account'}</h2>
              <div className="mt-4">
                <LoginStep onDone={(u) => toast({ title: 'Signed in', body: u?.name ? `Welcome, ${u.name.split(' ')[0]}.` : 'Welcome to your Golden Circle dashboard.' })} />
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[280px_1fr] [&>*]:min-w-0">
              <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0" aria-label="Account">
                {tabs.map(([id, label, I]) => (
                  <button key={id} onClick={() => setParams({ tab: id })} className={classNames('relative flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition lg:rounded-2xl lg:py-3', tab === id ? 'text-rose-deep' : 'text-ink-soft hover:bg-rose-blush/40')}>
                    {tab === id && <motion.span layoutId="acct-tab" className="absolute inset-0 rounded-full border border-rose-light bg-ivory shadow-soft lg:rounded-2xl" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <I size={16} className="relative" />
                    <span className="relative whitespace-nowrap">{label}</span>
                  </button>
                ))}
                <button onClick={doLogout} className="flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm text-ink-soft hover:bg-rose-blush/40 lg:mt-4 lg:rounded-2xl lg:border-t lg:border-rose-light/50 lg:py-3">
                  <LogOut size={16} /> Logout
                </button>
              </nav>
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="min-w-0">
                  <Active user={user} />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
