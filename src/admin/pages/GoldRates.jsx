import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAdminAuth } from '../AdminAuthContext';
import { api, request } from '../api';
import { Async, Card, Empty, Field, Notice, PageHeader, Pill, Table, dateTime, money, smallButton, useAsync } from '../ui';

const DEFAULT_PURITIES = ['24K', '22K', '18K', '14K'];
const karat = (purity) => Number(String(purity).replace(/k$/i, ''));
const validPurity = (text) => /^(?:[1-9]|1\d|2[0-4])K$/.test(text);
const validRate = (text) => text !== '' && Number.isFinite(Number(text)) && Number(text) > 0;

/** One form for the morning update: every purity on a row, changed rows are sent together. */
function TodayRates({ rates, onSaved }) {
  const { toast } = useUI();
  const [values, setValues] = useState({});
  const [extra, setExtra] = useState([]);
  const [newPurity, setNewPurity] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const current = Object.fromEntries(rates.filter((r) => r.isActive).map((r) => [r.purity, r.ratePerGram]));
  const purities = [...new Set([...DEFAULT_PURITIES, ...Object.keys(current), ...extra])].sort((a, b) => karat(b) - karat(a));

  // Start each row from the current rate
  useEffect(() => {
    setValues(Object.fromEntries(Object.entries(current).map(([purity, rate]) => [purity, String(rate)])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates]);

  const changed = purities.filter((p) => validRate(values[p] ?? '') && Number(values[p]) !== current[p]);
  const invalid = purities.filter((p) => (values[p] ?? '') !== '' && !validRate(values[p]));

  const fillFrom24 = () => {
    const base = Number(values['24K']);
    if (!validRate(values['24K'] ?? '')) return;
    setValues((v) => ({ ...v, ...Object.fromEntries(purities.filter((p) => p !== '24K').map((p) => [p, String(Math.round((base * karat(p)) / 24))])) }));
  };

  const addPurity = () => {
    const code = newPurity.trim().toUpperCase();
    if (!validPurity(code) || purities.includes(code)) return;
    setExtra((list) => [...list, code]);
    setNewPurity('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await request('/gold-rates', { method: 'POST', body: { rates: changed.map((purity) => ({ purity, ratePerGram: Number(values[purity]) })), note: note.trim() || undefined } });
      toast({ title: 'Gold rates updated', body: data.repricedProducts ? `${data.repricedProducts} product price${data.repricedProducts === 1 ? '' : 's'} recalculated` : `${changed.length} rate${changed.length === 1 ? '' : 's'} saved` });
      setNote('');
      setExtra([]);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Update today’s rates" action={<button type="button" onClick={fillFrom24} className={smallButton} disabled={!validRate(values['24K'] ?? '')} title="Work the other purities out from the 24K rate">Fill from 24K</button>}>
      <form onSubmit={submit} noValidate>
        <p className="text-sm text-ink-soft">Type the rate per gram. Only the rows you change are saved, each with the current date and time. Products priced from the gold rate are recalculated straight away.</p>
        {error && <div className="mt-3"><Notice>{error.message}{Object.values(error.fields)[0] ? ` — ${Object.values(error.fields)[0]}` : ''}</Notice></div>}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {purities.map((purity) => (
            <Field key={purity} label={`${purity} · ₹ per gram`} htmlFor={`rate-${purity}`} error={invalid.includes(purity) ? 'Enter a rate greater than 0' : undefined} hint={current[purity] ? `Current ${money(current[purity])}` : 'No rate yet'}>
              <input id={`rate-${purity}`} type="number" inputMode="decimal" min="0" step="0.01" value={values[purity] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [purity]: e.target.value }))} className="input" />
            </Field>
          ))}
        </div>

        <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <Field label="Note (optional)" htmlFor="rate-note" hint="For the history, e.g. “Morning board rate”.">
            <input id="rate-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="input" />
          </Field>
          <div className="flex items-end gap-2">
            <Field label="Add a purity" htmlFor="rate-new">
              <input id="rate-new" value={newPurity} onChange={(e) => setNewPurity(e.target.value)} placeholder="20K" maxLength={3} className="input w-24" />
            </Field>
            <button type="button" onClick={addPurity} disabled={!validPurity(newPurity.trim().toUpperCase())} className="chip mb-0.5 h-[46px]" aria-label="Add purity"><Plus size={14} /></button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button className="btn-primary" disabled={busy || !changed.length || invalid.length > 0}>
            {busy && <Loader2 size={15} className="animate-spin" />} Save {changed.length || ''} rate{changed.length === 1 ? '' : 's'}
          </button>
          <p className="text-xs text-ink-faint">{changed.length ? `Changing: ${changed.join(', ')}` : 'No rate has been changed yet.'}</p>
        </div>
      </form>
    </Card>
  );
}

/** Fix a typing mistake in the current rate without creating a new "previous" rate. */
function Correct({ rate, onSaved }) {
  const { toast } = useUI();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(rate.ratePerGram));
  const [busy, setBusy] = useState(false);

  const act = async (body, title) => {
    setBusy(true);
    try {
      const { data } = await request(`/gold-rates/${rate.id}`, { method: 'PUT', body });
      toast({ title, body: data.repricedProducts ? `${data.repricedProducts} product price${data.repricedProducts === 1 ? '' : 's'} recalculated` : rate.purity });
      setOpen(false);
      onSaved();
    } catch (err) {
      toast({ title: 'Could not save', body: err.message, tone: 'neutral' });
    } finally {
      setBusy(false);
    }
  };
  const deactivate = async () => {
    setBusy(true);
    try {
      await request(`/gold-rates/${rate.id}`, { method: 'DELETE' });
      toast({ title: `${rate.purity} switched off`, body: 'Its history is kept.' });
      onSaved();
    } catch (err) {
      toast({ title: 'Could not switch off', body: err.message, tone: 'neutral' });
    } finally {
      setBusy(false);
    }
  };

  if (!rate.isActive) return <button type="button" disabled={busy} onClick={() => act({ isActive: true }, `${rate.purity} switched on`)} className={smallButton}>Switch on</button>;
  if (!open) {
    return (
      <span className="flex justify-end gap-2">
        <button type="button" onClick={() => { setValue(String(rate.ratePerGram)); setOpen(true); }} className={smallButton}>Correct</button>
        <button type="button" disabled={busy} onClick={deactivate} className={smallButton}>Switch off</button>
      </span>
    );
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); act({ ratePerGram: Number(value) }, `${rate.purity} rate corrected`); }} className="flex items-center justify-end gap-2">
      <input type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} autoFocus aria-label={`Correct ${rate.purity} rate per gram`} className="w-28 rounded-lg border border-rose-light bg-ivory px-2 py-1.5 text-right text-sm focus:border-rose focus:outline-none" />
      <button className={smallButton} disabled={busy || !validRate(value)}>Save</button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-soft hover:underline">Cancel</button>
    </form>
  );
}

export default function GoldRates() {
  const { isAdmin } = useAdminAuth();
  const state = useAsync(() => api('/gold-rates'), []);

  return (
    <>
      <PageHeader eyebrow="Gold rates" title="Gold rate management" description="The rate per gram for each purity. The storefront and every price calculated from the gold rate use these figures." actions={<Link to="/admin/gold-rate-history" className="btn-outline">Rate history</Link>} />

      <div className="space-y-6">
        {!isAdmin && <Notice tone="info">Only admins can change gold rates. You can view them here.</Notice>}
        <Async state={state}>
          {(data) => (
            <div className="space-y-6">
              {isAdmin && <TodayRates rates={data.rates} onSaved={state.reload} />}
              <Card title="Current rates" padded={false}>
                <Table
                  minWidth={820}
                  rowKey={(r) => r.id}
                  rows={data.rates}
                  empty={<Empty title="No gold rates yet">{isAdmin ? 'Use the form above to add today’s rates.' : 'An admin has not added any rates yet.'}</Empty>}
                  columns={[
                    { key: 'purity', label: 'Purity', render: (r) => <span className="font-medium">{r.purity}</span> },
                    { key: 'ratePerGram', label: 'Per gram', align: 'right', render: (r) => <span className="font-semibold">{money(r.ratePerGram)}</span> },
                    { key: 'ratePer10Gram', label: 'Per 10 g', align: 'right', render: (r) => money(r.ratePer10Gram) },
                    { key: 'previousRatePerGram', label: 'Previous', align: 'right', render: (r) => (r.previousRatePerGram == null ? '—' : money(r.previousRatePerGram)) },
                    { key: 'change', label: 'Change', align: 'right', render: (r) => (r.change ? `${r.change > 0 ? '▲' : '▼'} ${money(Math.abs(r.change))} (${Math.abs(r.changePercent)}%)` : '—') },
                    { key: 'effectiveFrom', label: 'Effective from', render: (r) => <span className="whitespace-nowrap text-ink-soft">{dateTime(r.effectiveFrom)}</span> },
                    { key: 'isActive', label: 'Status', render: (r) => <Pill strong={r.isActive}>{r.isActive ? 'Active' : 'Off'}</Pill> },
                    ...(isAdmin ? [{ key: 'actions', label: '', render: (r) => <Correct rate={r} onSaved={state.reload} /> }] : []),
                  ]}
                />
              </Card>
            </div>
          )}
        </Async>
      </div>
    </>
  );
}
