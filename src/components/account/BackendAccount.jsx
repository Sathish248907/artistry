import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import AddressBook from './AddressBook';
import { ORDER_LABEL, PAYMENT_LABEL, REFUND_LABEL, RETURN_LABEL, StatusPill, day, money, orderTone } from './orderUi';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { shopApi } from '../../admin/api';

/** Account panels used when the shop is connected to the backend. */

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

const useLoad = (path) => {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    let cancelled = false;
    shopApi(path).then((data) => !cancelled && setState({ data, error: null })).catch((error) => !cancelled && setState({ data: null, error }));
    return () => {
      cancelled = true;
    };
  }, [path]);
  return state;
};

export function BackendProfile() {
  const { user, updateAccount } = useAuth();
  const { toast } = useUI();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAccount({ name: name.trim(), phone });
      toast({ title: 'Profile updated' });
      setEditing(false);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="My Profile" action={!editing && <button onClick={() => setEditing(true)} className="text-[11px] uppercase tracking-[0.18em] text-rose-deep hover:underline">Edit profile</button>}>
      {editing ? (
        <form onSubmit={save} className="max-w-md rounded-2xl border border-rose-light/60 bg-ivory p-5" noValidate>
          <label className="label" htmlFor="pf-name">Full name</label>
          <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          {error?.fields?.name && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{error.fields.name}</p>}
          <label className="label mt-4" htmlFor="pf-phone">Mobile</label>
          <input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="tel" className="input" />
          {error?.fields?.phone && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{error.fields.phone}</p>}
          {error && !Object.keys(error.fields || {}).length && <p className="mt-3 text-xs text-rose-deep" role="alert">{error.message}</p>}
          <div className="mt-5 flex gap-3">
            <button className="btn-primary" disabled={busy}>{busy && <Loader2 size={15} className="animate-spin" />} Save changes</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[['Name', user.name], ['Email', user.email], ['Mobile', user.mobile || 'Not added'], ['Email status', user.verified ? 'Verified' : 'Not verified']].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-rose-light/60 bg-ivory p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">{k}</p>
              <p className="mt-1 text-ink">{v}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function BackendOrders() {
  const [page, setPage] = useState(1);
  const { data, error } = useLoad(`/orders?page=${page}&limit=10`);
  return (
    <Panel title="My Orders">
      {error && <p className="text-sm text-rose-deep" role="alert">{error.message}</p>}
      {!data && !error && <div className="h-40 animate-pulse rounded-3xl bg-rose-blush/50" />}
      {data && !data.orders.length && (
        <p className="rounded-2xl border border-dashed border-rose-light p-8 text-center text-sm text-ink-soft">No orders yet. <Link to="/products" className="text-rose-deep underline">Find something you love</Link></p>
      )}
      {data && data.orders.length > 0 && (
        <ul className="space-y-3">
          {data.orders.map((o) => (
            <li key={o.id}>
              <Link to={`/account/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-rose-light/60 bg-ivory p-5 transition hover:border-rose" data-testid="order-row">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{o.orderNumber}</p>
                  <p className="text-xs text-ink-faint">Placed {day(o.placedAt)} · {o.itemCount} item{o.itemCount === 1 ? '' : 's'} · {o.items.slice(0, 2).map((i) => i.name).join(', ')}{o.items.length > 2 ? '…' : ''}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusPill tone={orderTone(o.status)}>{ORDER_LABEL[o.status]}</StatusPill>
                    <StatusPill>{PAYMENT_LABEL[o.payment.status]}</StatusPill>
                  </div>
                </div>
                <span className="flex items-center gap-3">
                  <span className="font-display text-2xl text-rose-deep">{money(o.pricing.grandTotal)}</span>
                  <ChevronRight size={18} className="text-ink-faint" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-ink-soft">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="chip disabled:opacity-40">Previous</button>
          <span>Page {page} of {data.pagination.totalPages}</span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="chip disabled:opacity-40">Next</button>
        </div>
      )}
    </Panel>
  );
}

export function BackendAddresses() {
  return (
    <Panel title="Saved Addresses">
      <AddressBook manage />
    </Panel>
  );
}

export function BackendReturns() {
  const returns = useLoad('/returns?limit=50');
  const refunds = useLoad('/refunds?limit=50');
  return (
    <Panel title="Returns & Refunds">
      <h3 className="label">Return requests</h3>
      {returns.data && !returns.data.returns.length && <p className="rounded-2xl border border-dashed border-rose-light p-6 text-center text-sm text-ink-soft">No returns. You can ask for one from a delivered order.</p>}
      <ul className="space-y-3">
        {(returns.data?.returns || []).map((r) => (
          <li key={r.id} className="rounded-2xl border border-rose-light/60 bg-ivory p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">{r.returnNumber} · order <Link to={`/account/orders/${r.order}`} className="text-rose-deep underline">{r.orderNumber}</Link></p>
              <StatusPill tone={r.status === 'requested' ? 'strong' : r.status === 'completed' ? 'accent' : 'neutral'}>{RETURN_LABEL[r.status]}</StatusPill>
            </div>
            <p className="mt-1 text-xs text-ink-soft">{r.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')} · {r.reason} · {day(r.createdAt)}</p>
          </li>
        ))}
      </ul>
      <h3 className="label mt-8">Refunds</h3>
      {refunds.data && !refunds.data.refunds.length && <p className="rounded-2xl border border-dashed border-rose-light p-6 text-center text-sm text-ink-soft">No refunds.</p>}
      <ul className="space-y-3">
        {(refunds.data?.refunds || []).map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-light/60 bg-ivory p-4">
            <div>
              <p className="text-sm font-medium text-ink">{money(r.amount)} · order {r.orderNumber}</p>
              <p className="text-xs text-ink-faint">{r.refundNumber} · {r.reason} · {day(r.createdAt)}</p>
            </div>
            <StatusPill tone={r.status === 'completed' ? 'accent' : r.status === 'failed' ? 'strong' : 'neutral'}>{REFUND_LABEL[r.status]}</StatusPill>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
