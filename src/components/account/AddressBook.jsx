import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Home, Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { shopApi } from '../../admin/api';
import { useUI } from '../../context/UIContext';
import { classNames } from '../../utils/format';

const EMPTY = { fullName: '', phone: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', postalCode: '', country: 'India', addressType: 'Home' };
const FIELDS = [
  ['fullName', 'Full name', 'name'],
  ['phone', 'Mobile', 'tel-national'],
  ['addressLine1', 'House, street, area', 'address-line1', true],
  ['addressLine2', 'Apartment, floor (optional)', 'address-line2', true],
  ['landmark', 'Landmark (optional)', 'off'],
  ['city', 'City', 'address-level2'],
  ['state', 'State', 'address-level1'],
  ['postalCode', 'Pincode', 'postal-code'],
  ['country', 'Country', 'country-name'],
];

/** Load and change the signed-in customer's saved addresses on the backend. */
export function useAddresses() {
  const [addresses, setAddresses] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(() => shopApi('/users/addresses').then((d) => { setAddresses(d.addresses); setError(null); return d.addresses; }).catch((e) => setError(e)), []);
  useEffect(() => { load(); }, [load]);
  return { addresses, setAddresses, error, reload: load };
}

function AddressForm({ onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : key === 'postalCode' ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
      const data = await shopApi('/users/addresses', { method: 'POST', body });
      onSaved(data.address, data.addresses);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="mt-5 grid gap-3 rounded-2xl border border-rose-light/60 bg-ivory p-5 sm:grid-cols-2" noValidate>
      {FIELDS.map(([key, label, autoComplete, wide]) => (
        <div key={key} className={wide ? 'sm:col-span-2' : ''}>
          <label className="label" htmlFor={`addr-${key}`}>{label}</label>
          <input id={`addr-${key}`} value={form[key]} onChange={set(key)} autoComplete={autoComplete} inputMode={key === 'phone' || key === 'postalCode' ? 'numeric' : undefined} className="input" />
          {error?.fields?.[key] && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{error.fields[key]}</p>}
        </div>
      ))}
      <div className="sm:col-span-2">
        <span className="label">Save as</span>
        <div className="flex gap-2">
          {['Home', 'Work', 'Other'].map((type) => (
            <button key={type} type="button" onClick={() => setForm((f) => ({ ...f, addressType: type }))} className={classNames('chip', form.addressType === type && 'chip-active')}>{type}</button>
          ))}
        </div>
      </div>
      {error && !Object.keys(error.fields || {}).length && <p className="text-xs text-rose-deep sm:col-span-2" role="alert">{error.message}</p>}
      <div className="flex gap-3 sm:col-span-2">
        <button className="btn-primary" disabled={busy}>{busy && <Loader2 size={15} className="animate-spin" />} Save address</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>}
      </div>
    </motion.form>
  );
}

const lines = (a) => [a.addressLine1, a.addressLine2, a.landmark].filter(Boolean).join(', ');

/**
 * Saved addresses as cards.
 *   selectable  — checkout: pick one (value / onChange)
 *   manage      — account: set default and delete
 */
export default function AddressBook({ selectable = false, value, onChange, manage = false }) {
  const { toast } = useUI();
  const { addresses, setAddresses, error, reload } = useAddresses();
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Checkout: pick the default address once they load
  useEffect(() => {
    if (selectable && addresses && addresses.length && !value) onChange((addresses.find((a) => a.isDefault) || addresses[0]).id);
    if (addresses && addresses.length === 0) setAdding(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  const act = async (id, fn, title) => {
    setBusyId(id);
    try {
      const data = await fn();
      setAddresses(data.addresses);
      toast({ title });
    } catch (err) {
      toast({ title: 'Could not update the address', body: err.message, tone: 'neutral' });
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <p className="text-sm text-rose-deep" role="alert">{error.message} <button type="button" onClick={reload} className="underline">Try again</button></p>;
  if (!addresses) return <div className="h-32 animate-pulse rounded-2xl bg-rose-blush/50" />;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((a) => {
          const chosen = selectable && value === a.id;
          const Card = selectable ? 'button' : 'div';
          return (
            <Card
              key={a.id}
              {...(selectable ? { type: 'button', onClick: () => onChange(a.id), 'aria-pressed': chosen } : {})}
              className={classNames('rounded-2xl border p-5 text-left transition', chosen ? 'border-rose bg-ivory shadow-rose' : 'border-rose-light/60 bg-ivory/70', selectable && !chosen && 'hover:border-rose')}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-rose-deep"><Home size={13} /> {a.addressType}{a.isDefault && <span className="rounded-full bg-rose-blush px-2 py-0.5 text-[9px]">Default</span>}</span>
                {selectable && <span className={classNames('flex h-5 w-5 items-center justify-center rounded-full border', chosen ? 'border-rose bg-rose text-white' : 'border-rose-light')}>{chosen && <Check size={11} />}</span>}
              </span>
              <span className="mt-3 block font-medium text-ink">{a.fullName}</span>
              <span className="mt-1 block text-sm text-ink-soft">{lines(a)}</span>
              <span className="block text-sm text-ink-soft">{a.city}, {a.state} {a.postalCode}</span>
              <span className="mt-1 block text-xs text-ink-faint">{a.phone}</span>
              {manage && (
                <span className="mt-4 flex flex-wrap gap-2">
                  {!a.isDefault && (
                    <button type="button" disabled={busyId === a.id} onClick={() => act(a.id, () => shopApi(`/users/addresses/${a.id}/default`, { method: 'PATCH' }), 'Default address updated')} className="chip">
                      <Star size={12} /> Make default
                    </button>
                  )}
                  <button type="button" disabled={busyId === a.id} onClick={() => act(a.id, () => shopApi(`/users/addresses/${a.id}`, { method: 'DELETE' }), 'Address removed')} className="chip">
                    <Trash2 size={12} /> Remove
                  </button>
                </span>
              )}
            </Card>
          );
        })}
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-rose-light text-sm text-rose-deep hover:bg-rose-blush">
            <Plus size={18} /> Add new address
          </button>
        )}
      </div>
      {adding && (
        <AddressForm
          onCancel={addresses.length ? () => setAdding(false) : null}
          onSaved={(address, all) => {
            setAddresses(all);
            setAdding(false);
            if (selectable) onChange(address.id);
            toast({ title: 'Address saved' });
          }}
        />
      )}
    </div>
  );
}
