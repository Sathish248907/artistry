import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import useDebounce from '../../hooks/useDebounce';
import { classNames } from '../../utils/format';
import { api, request } from '../api';
import { Card, Empty, Field, MOVEMENT_LABEL, Notice, PageHeader, Pill, StockBadge, Table, count, dateTime, signed } from '../ui';

const MODES = {
  'stock-in': { label: 'Stock in', verb: 'Add stock', hint: 'New stock received from the workshop or a supplier.', reasonRequired: false, quantityLabel: 'Quantity to add' },
  'stock-out': { label: 'Stock out', verb: 'Remove stock', hint: 'Stock leaving for a reason other than a sale: damage, loss, repair, sample.', reasonRequired: true, quantityLabel: 'Quantity to remove' },
  adjust: { label: 'Set exact count', verb: 'Set count', hint: 'After a stock take: type the number actually on the shelf.', reasonRequired: true, quantityLabel: 'Correct count' },
};

export default function StockAdjustment() {
  const { toast } = useUI();
  const [params, setParams] = useSearchParams();
  const sku = params.get('sku') || '';

  const [query, setQuery] = useState(sku);
  const debounced = useDebounce(query, 300);
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);

  const [record, setRecord] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const [mode, setMode] = useState('stock-in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Suggestions while typing
  useEffect(() => {
    const text = debounced.trim();
    if (!text || text.toUpperCase() === sku.toUpperCase()) {
      setMatches([]);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    api('/inventory', { query: { search: text, limit: 6, sort: 'sku' } })
      .then((data) => !cancelled && setMatches(data.inventory))
      .catch(() => !cancelled && setMatches([]))
      .finally(() => !cancelled && setSearching(false));
    return () => {
      cancelled = true;
    };
  }, [debounced, sku]);

  const load = (code) => {
    if (!code) {
      setRecord(null);
      setRecent([]);
      return Promise.resolve();
    }
    return api(`/inventory/sku/${encodeURIComponent(code)}`)
      .then((data) => {
        setRecord(data.inventory);
        setRecent(data.recentTransactions);
        setLoadError(null);
      })
      .catch((err) => {
        setRecord(null);
        setRecent([]);
        setLoadError(err);
      });
  };

  useEffect(() => {
    load(sku);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku]);

  const choose = (code) => {
    setQuery(code);
    setMatches([]);
    setParams(code ? { sku: code } : {}, { replace: true });
  };

  const config = MODES[mode];
  const amount = Number(quantity);
  const validAmount = quantity !== '' && Number.isInteger(amount) && (mode === 'adjust' ? amount >= 0 : amount > 0);
  const after = !record || !validAmount ? null : mode === 'stock-in' ? record.availableQuantity + amount : mode === 'stock-out' ? record.availableQuantity - amount : amount;

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { message } = await request(`/inventory/${mode}`, { method: 'POST', body: { sku: record.sku, quantity: amount, reason: reason.trim() || undefined, reference: reference.trim() || undefined } });
      toast({ title: message, body: `${record.sku} · ${record.product?.name || ''}` });
      setQuantity('');
      setReason('');
      setReference('');
      await load(record.sku);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Stock adjustment" description="Add stock, remove stock or correct a count. Every change is saved to the inventory history with your name, the time and the reason." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_1fr]">
        <div className="space-y-6">
          <Card title="1 · Choose the item">
            <form onSubmit={(e) => { e.preventDefault(); choose(query.trim().toUpperCase()); }} role="search">
              <Field label="SKU or product name" htmlFor="stock-search">
                <div className="relative">
                  <input id="stock-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. RG-1 or Gold Ring" autoComplete="off" className="input pr-10" />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">{searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}</span>
                </div>
              </Field>
            </form>
            {matches.length > 0 && (
              <ul className="mt-2 divide-y divide-rose-light/40 rounded-xl border border-rose-light/60">
                {matches.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => choose(m.sku)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-rose-blush/50">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink">{m.product?.name}{m.variant ? ` · ${m.variant.name || m.variant.size || 'variant'}` : ''}</span>
                        <span className="text-xs text-ink-faint">{m.sku}</span>
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-ink-soft">{count(m.availableQuantity)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {loadError && <div className="mt-3"><Notice>{loadError.status === 404 ? `No stock record has the SKU “${sku}”.` : loadError.message}</Notice></div>}

            {record && (
              <div className="mt-4 rounded-xl border border-rose-light/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{record.product?.name}</p>
                    <p className="text-xs text-ink-faint">{record.sku}{record.variant ? ` · variant ${record.variant.name || record.variant.size || ''}` : ''}</p>
                  </div>
                  <StockBadge status={record.stockStatus} />
                </div>
                <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[['Available', record.availableQuantity], ['Reserved', record.reservedQuantity], ['Sold', record.soldQuantity], ['Minimum', record.lowStockThreshold]].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-rose-blush/60 px-1 py-2">
                      <dt className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
                      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{count(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Card>

          <Card title="2 · Record the change">
            {!record ? (
              <p className="text-sm text-ink-soft">Choose an item first.</p>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Kind of change">
                  {Object.entries(MODES).map(([key, m]) => (
                    <button key={key} type="button" role="radio" aria-checked={mode === key} onClick={() => { setMode(key); setError(null); }} className={classNames('chip', mode === key && 'chip-active')}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-soft">{config.hint}</p>

                {error && !Object.keys(error.fields).length && <div className="mt-4"><Notice>{error.message}</Notice></div>}

                <Field label={config.quantityLabel} htmlFor="stock-quantity" error={error?.fields.quantity} className="mt-4">
                  <input id="stock-quantity" type="number" inputMode="numeric" min={mode === 'adjust' ? 0 : 1} step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input" required />
                </Field>
                <Field label={`Reason${config.reasonRequired ? '' : ' (optional)'}`} htmlFor="stock-reason" error={error?.fields.reason} className="mt-4">
                  <input id="stock-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder={mode === 'stock-in' ? 'Stock received' : mode === 'stock-out' ? 'e.g. Damaged in display' : 'e.g. Monthly stock take'} className="input" />
                </Field>
                <Field label="Reference (optional)" htmlFor="stock-reference" error={error?.fields.reference} hint="An invoice or job number, if there is one." className="mt-4">
                  <input id="stock-reference" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={80} className="input" />
                </Field>

                {after !== null && (
                  <p className={classNames('mt-4 rounded-xl px-4 py-3 text-sm', after < 0 ? 'border border-rose bg-rose-blush text-rose-deep' : 'bg-rose-blush/60 text-ink')} role="status">
                    {after < 0
                      ? `Only ${count(record.availableQuantity)} available — you cannot remove ${count(amount)}.`
                      : <>Available will go from <strong>{count(record.availableQuantity)}</strong> to <strong>{count(after)}</strong>{after === record.availableQuantity ? ' (no change)' : ''}.</>}
                  </p>
                )}

                <button className="btn-primary mt-5 w-full" disabled={busy || !validAmount || (after !== null && after < 0) || (config.reasonRequired && !reason.trim())}>
                  {busy && <Loader2 size={15} className="animate-spin" />} {config.verb}
                </button>
              </form>
            )}
          </Card>
        </div>

        <Card title={record ? `Recent changes · ${record.sku}` : 'Recent changes'} padded={false}>
          {!record ? (
            <Empty title="No item chosen">Its latest stock movements appear here.</Empty>
          ) : (
            <Table
              minWidth={560}
              rowKey={(t) => t.id}
              rows={recent}
              empty={<Empty title="No movements yet">This SKU has never had a stock change.</Empty>}
              columns={[
                { key: 'createdAt', label: 'When', render: (t) => <span className="whitespace-nowrap text-ink-soft">{dateTime(t.createdAt)}</span> },
                { key: 'type', label: 'Movement', render: (t) => <Pill>{MOVEMENT_LABEL[t.type] || t.type}</Pill> },
                { key: 'availableChange', label: 'Change', align: 'right', render: (t) => signed(t.availableChange) },
                { key: 'availableAfter', label: 'After', align: 'right', render: (t) => count(t.availableAfter) },
                { key: 'performedBy', label: 'By', render: (t) => <span className="whitespace-nowrap text-ink-soft">{t.performedBy?.name || 'System'}</span> },
                { key: 'reason', label: 'Reason', render: (t) => <span className="text-ink-soft">{t.reason || '—'}</span> },
              ]}
            />
          )}
        </Card>
      </div>
    </>
  );
}
