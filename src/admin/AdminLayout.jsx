import { Suspense, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowLeftRight, BarChart3, Calculator, Coins, CreditCard, ExternalLink, History, LayoutDashboard, Loader2, LogOut, Package, Percent, RotateCcw, ShoppingBag, TrendingUp, TriangleAlert, Undo2 } from 'lucide-react';
import Toaster from '../components/common/Toast';
import { BRAND } from '../data/brand';
import { classNames } from '../utils/format';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import { backendConfigured } from './api';
import { Field, Notice, Spinner } from './ui';

const NAV = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard, group: 'Inventory & gold rates' },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
  { to: '/admin/stock', label: 'Stock adjustment', icon: ArrowLeftRight },
  { to: '/admin/history', label: 'Inventory history', icon: History },
  { to: '/admin/low-stock', label: 'Low stock', icon: TriangleAlert },
  { to: '/admin/gold-rates', label: 'Gold rates', icon: Coins },
  { to: '/admin/gold-rate-history', label: 'Gold rate history', icon: TrendingUp },
  { to: '/admin/charges', label: 'Making & wastage', icon: Percent },
  { to: '/admin/calculator', label: 'Price calculator', icon: Calculator },
  { to: '/admin/order-dashboard', label: 'Order dashboard', icon: BarChart3, group: 'Orders' },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { to: '/admin/refunds', label: 'Refunds', icon: Undo2 },
];

function Frame({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-ivory font-sans text-ink">
      {children}
      <Toaster />
    </div>
  );
}

function Brand() {
  return (
    <Link to="/admin" className="flex items-baseline gap-2">
      <span className="font-display text-2xl text-rose-deep">{BRAND.name}</span>
      <span className="text-[10px] uppercase tracking-luxe text-ink-faint">Admin</span>
    </Link>
  );
}

function SetupNotice() {
  return (
    <Frame>
      <div className="mx-auto w-full max-w-lg px-4 py-16">
        <Brand />
        <div className="card mt-8 p-6">
          <h1 className="font-display text-3xl">Backend not connected</h1>
          <p className="mt-2 text-sm text-ink-soft">
            The admin area talks to the Artistry backend. This build has no backend address, so there is nothing to sign in to.
          </p>
          <p className="mt-4 text-sm text-ink-soft">To use it on this computer, add this line to the frontend’s <code className="rounded bg-rose-blush px-1.5 py-0.5 text-ink">.env</code> file and restart the dev server:</p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-rose-blush px-4 py-3 text-sm text-ink">VITE_BACKEND_URL=http://localhost:5000/api</pre>
          <Link to="/" className="btn-outline mt-6">Back to the store</Link>
        </div>
      </div>
    </Frame>
  );
}

function Login() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Frame>
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <Brand />
        <form onSubmit={submit} className="card mt-8 p-6" noValidate>
          <h1 className="font-display text-3xl">Sign in</h1>
          <p className="mt-1.5 text-sm text-ink-soft">For Artistry admin and staff accounts.</p>
          {error && <div className="mt-4"><Notice>{error.message}</Notice></div>}
          <Field label="Email" htmlFor="admin-email" error={error?.fields?.email} className="mt-5">
            <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          </Field>
          <Field label="Password" htmlFor="admin-password" error={error?.fields?.password} className="mt-4">
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
          </Field>
          <button className="btn-primary mt-6 w-full" disabled={busy}>
            {busy && <Loader2 size={15} className="animate-spin" />} Sign in
          </button>
          <Link to="/" className="mt-4 block text-center text-xs text-rose-deep hover:underline">Back to the store</Link>
        </form>
      </div>
    </Frame>
  );
}

function Shell() {
  const { user, logout } = useAdminAuth();
  return (
    <Frame>
      <header className="sticky top-0 z-20 border-b border-rose-light/60 bg-ivory">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Brand />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-ink">{user.name}</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-ink-faint">{user.role}</span>
            </span>
            <Link to="/" className="chip" title="Open the storefront">
              <ExternalLink size={13} /> <span className="hidden sm:inline">Store</span>
            </Link>
            <button type="button" onClick={logout} className="chip">
              <LogOut size={13} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
        {/* Phone and tablet: the sections scroll sideways under the header */}
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-rose-light/40 px-3 py-2 lg:hidden" aria-label="Admin sections">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => classNames('flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs', isActive ? 'bg-rose-blush text-rose-deep' : 'text-ink-soft')}>
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="flex w-full flex-1">
        <nav className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-rose-light/60 p-3 lg:flex" aria-label="Admin sections">
          {NAV.map(({ to, end, label, icon: Icon, group }) => [
            group && <p key={`g-${group}`} className="mt-3 px-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-ink-faint first:mt-0">{group}</p>,
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => classNames('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', isActive ? 'border border-rose-light bg-rose-blush/60 text-rose-deep' : 'border border-transparent text-ink-soft hover:bg-rose-blush/40')}
            >
              <Icon size={16} /> {label}
            </NavLink>,
          ])}
        </nav>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </Frame>
  );
}

function Gate() {
  const { status } = useAdminAuth();
  if (status === 'checking') return <Frame><Spinner label="Checking your session" /></Frame>;
  if (status === 'signed-out') return <Login />;
  return <Shell />;
}

/** Root of everything under /admin. It has its own frame: the storefront header, footer and cart are not shown here. */
export default function AdminLayout() {
  if (!backendConfigured) return <SetupNotice />;
  return (
    <AdminAuthProvider>
      <Gate />
    </AdminAuthProvider>
  );
}
