import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { api, request } from '../api';
import { RETURN_STATUS, options } from '../orderLabels';
import { Async, Card, Empty, Field, FilterBar, Notice, PageHeader, Pagination, Pill, Select, Table, dateTime, money, useAsync } from '../ui';

function ReturnPanel({ id, onClose, onChanged }) {
  const { toast } = useUI();
  const state = useAsync(() => api(`/admin/returns/${id}`), [id]);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [internal, setInternal] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const act = async (key, fn) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
      state.reload();
      onChanged();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card title="Return request" action={<button type="button" onClick={onClose} className="rounded-full p-1 text-ink-faint hover:bg-rose-blush" aria-label="Close"><X size={16} /></button>}>
      <Async state={state}>
        {({ return: r }) => (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-2xl">{r.returnNumber}</p>
                <p className="text-xs text-ink-soft">Order <Link to={`/admin/orders/${r.order}`} className="text-rose-deep hover:underline">{r.orderNumber}</Link> · {r.user?.name} · {dateTime(r.createdAt)}</p>
              </div>
              <Pill strong>{RETURN_STATUS[r.status]}</Pill>
            </div>
            <ul className="divide-y divide-rose-light/40 rounded-xl border border-rose-light/60 text-sm">
              {r.items.map((i) => <li key={i.id} className="flex justify-between gap-3 px-3 py-2"><span>{i.quantity} × {i.name} <span className="text-xs text-ink-faint">{i.sku}</span></span><span className="tabular-nums">{money(i.unitPrice * i.quantity)}</span></li>)}
            </ul>
            <p className="text-sm"><span className="text-ink-soft">Reason:</span> {r.reason}{r.details ? ` — ${r.details}` : ''}</p>
            <p className="text-sm"><span className="text-ink-soft">Refund on completion:</span> {money(r.refundAmount)}{r.refundRecord ? ` · refund ${r.refundRecord.refundNumber} ${r.refundRecord.status}` : ''}</p>

            {error && <Notice>{error.message}</Notice>}
            {r.allowedStatuses.length > 0 && (
              <form onSubmit={(e) => { e.preventDefault(); act('status', async () => { const { message } = await request(`/admin/returns/${r.id}/status`, { method: 'PUT', body: { status, note: note.trim() || undefined, refundAmount: status === 'completed' && refundAmount !== '' ? Number(refundAmount) : undefined } }); toast({ title: message }); setNote(''); setStatus(''); }); }} className="space-y-3 rounded-xl border border-rose-light/60 p-4">
                <Field label="Move to" htmlFor="rt-status"><Select id="rt-status" value={status} onChange={setStatus} options={[['', 'Choose…'], ...r.allowedStatuses.map((s) => [s, RETURN_STATUS[s]])]} /></Field>
                {status === 'completed' && (
                  <Field label="Refund amount ₹ (optional)" htmlFor="rt-amount" hint={`Leave empty to refund ${money(r.refundAmount)}. Completing restores the stock.`}>
                    <input id="rt-amount" type="number" min="0" step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="input" />
                  </Field>
                )}
                <Field label="Note for the customer (optional)" htmlFor="rt-note"><input id="rt-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="input" /></Field>
                <button className="btn-primary" disabled={!status || busy === 'status'}>{busy === 'status' && <Loader2 size={15} className="animate-spin" />} Update return</button>
              </form>
            )}

            <div>
              <p className="label">Internal notes</p>
              {r.internalNotes.length ? (
                <ul className="space-y-2">{r.internalNotes.map((n) => <li key={n.id} className="rounded-xl bg-rose-blush/50 px-3 py-2 text-sm"><span className="block text-ink">{n.note}</span><span className="text-xs text-ink-faint">{n.by?.name} · {dateTime(n.at)}</span></li>)}</ul>
              ) : <p className="text-xs text-ink-faint">None yet. Notes are never shown to the customer.</p>}
              <form onSubmit={(e) => { e.preventDefault(); act('note', async () => { await request(`/admin/returns/${r.id}/notes`, { method: 'POST', body: { note: internal.trim() } }); setInternal(''); }); }} className="mt-2 flex gap-2">
                <input value={internal} onChange={(e) => setInternal(e.target.value)} maxLength={1000} aria-label="Add an internal note" placeholder="Add an internal note" className="input" />
                <button className="btn-outline !px-5" disabled={!internal.trim() || busy === 'note'}>Add</button>
              </form>
            </div>

            <div>
              <p className="label">History</p>
              <ul className="space-y-1 text-xs text-ink-soft">{[...r.statusHistory].reverse().map((h) => <li key={h.id}>{dateTime(h.at)} · {RETURN_STATUS[h.status]} · {h.changedBy?.name || h.changedByRole}{h.note ? ` — ${h.note}` : ''}</li>)}</ul>
            </div>
          </div>
        )}
      </Async>
    </Card>
  );
}

export default function Returns() {
  const [params, setParams] = useSearchParams();
  const [version, setVersion] = useState(0);
  const filters = { status: params.get('status') || '', page: Number(params.get('page')) || 1 };
  const open = params.get('open');
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === 'status') next.delete('page');
    setParams(next, { replace: true });
  };
  const state = useAsync(() => api('/admin/returns', { query: { ...filters, limit: 20 } }), [filters.status, filters.page, version]);

  return (
    <>
      <PageHeader eyebrow="Orders" title="Returns" description="Approve or reject return requests and follow them through pickup, inspection and completion. Completing a return restores the stock and refunds the customer." />
      <FilterBar>
        <Field label="Status" htmlFor="r-status"><Select id="r-status" value={filters.status} onChange={(v) => setParam('status', v)} options={options(RETURN_STATUS, 'Any status')} /></Field>
      </FilterBar>
      <div className={open ? 'grid gap-6 xl:grid-cols-[1fr_28rem]' : ''}>
        <Card padded={false} title="Return requests">
          <Async state={state}>
            {(data) => (
              <>
                <Table
                  minWidth={760}
                  rowKey={(r) => r.id}
                  rows={data.returns}
                  empty={<Empty title="No returns">Requests appear here when customers ask to send something back.</Empty>}
                  columns={[
                    { key: 'num', label: 'Return', render: (r) => <button type="button" onClick={() => setParam('open', r.id)} className="whitespace-nowrap font-medium text-rose-deep hover:underline">{r.returnNumber}</button> },
                    { key: 'order', label: 'Order', render: (r) => <Link to={`/admin/orders/${r.order}`} className="whitespace-nowrap hover:underline">{r.orderNumber}</Link> },
                    { key: 'user', label: 'Customer', render: (r) => r.user?.name || '—' },
                    { key: 'reason', label: 'Reason', render: (r) => <span className="text-ink-soft">{r.reason}</span> },
                    { key: 'status', label: 'Status', render: (r) => <Pill strong={['requested', 'received', 'inspected'].includes(r.status)}>{RETURN_STATUS[r.status]}</Pill> },
                    { key: 'amount', label: 'Refund', align: 'right', render: (r) => money(r.refundAmount) },
                    { key: 'at', label: 'Requested', render: (r) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(r.createdAt)}</span> },
                  ]}
                />
                <Pagination pagination={data.pagination} onPage={(page) => setParam('page', page > 1 ? String(page) : '')} />
              </>
            )}
          </Async>
        </Card>
        {open && <ReturnPanel id={open} onClose={() => setParam('open', '')} onChanged={() => setVersion((v) => v + 1)} />}
      </div>
    </>
  );
}
