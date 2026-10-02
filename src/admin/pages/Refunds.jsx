import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAdminAuth } from '../AdminAuthContext';
import { api, request } from '../api';
import { REFUND_STATUS, options } from '../orderLabels';
import { Async, Card, Empty, Field, FilterBar, Notice, PageHeader, Pagination, Pill, Select, Table, dateTime, money, smallButton, useAsync } from '../ui';

function RefundAction({ refund, onSaved }) {
  const { toast } = useUI();
  const [open, setOpen] = useState(false);
  const [txn, setTxn] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const send = async (body) => {
    setBusy(true);
    setError(null);
    try {
      const { message } = await request(`/admin/refunds/${refund.id}/status`, { method: 'PUT', body });
      toast({ title: message, body: refund.refundNumber });
      setOpen(false);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  if (refund.status === 'completed') return null;
  if (['pending', 'failed'].includes(refund.status) && !open) {
    return (
      <span className="flex justify-end gap-2">
        <button type="button" disabled={busy} onClick={() => send({ status: 'processing' })} className={smallButton}>{refund.status === 'failed' ? 'Retry' : 'Process'}</button>
        <button type="button" onClick={() => setOpen(true)} className={smallButton}>Mark done</button>
      </span>
    );
  }
  if (!open) return <span className="flex justify-end"><button type="button" onClick={() => setOpen(true)} className={smallButton}>Record outcome</button></span>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); send({ status: 'completed', transactionId: txn.trim() }); }} className="flex flex-wrap items-center justify-end gap-2">
      {error && <span className="w-full text-right text-xs text-rose-deep">{error.message}</span>}
      <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="Transfer / transaction ref" aria-label="Transaction reference" className="w-44 rounded-lg border border-rose-light bg-ivory px-2 py-1.5 text-sm" />
      <button className={smallButton} disabled={busy || !txn.trim()}>{busy && <Loader2 size={12} className="animate-spin" />} Completed</button>
      <button type="button" className={smallButton} disabled={busy} onClick={() => send({ status: 'failed', note: 'Marked failed by the team' })}>Failed</button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-soft hover:underline">Cancel</button>
    </form>
  );
}

export default function Refunds() {
  const { isAdmin } = useAdminAuth();
  const [params, setParams] = useSearchParams();
  const filters = { status: params.get('status') || '', page: Number(params.get('page')) || 1 };
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  const state = useAsync(() => api('/admin/refunds', { query: { ...filters, limit: 20 } }), [filters.status, filters.page]);

  return (
    <>
      <PageHeader eyebrow="Orders" title="Refunds" description="Refunds from cancellations and completed returns. Online payments are refunded through the gateway; cash orders are refunded by bank transfer and marked completed here with the transfer reference." />
      {!isAdmin && <div className="mb-4"><Notice tone="info">Only admins can process refunds. You can view them here.</Notice></div>}
      <FilterBar>
        <Field label="Status" htmlFor="rf-status"><Select id="rf-status" value={filters.status} onChange={(v) => setFilter('status', v)} options={options(REFUND_STATUS, 'Any status')} /></Field>
      </FilterBar>
      <Card padded={false} title="Refunds">
        <Async state={state}>
          {(data) => (
            <>
              <Table
                minWidth={980}
                rowKey={(r) => r.id}
                rows={data.refunds}
                empty={<Empty title="No refunds" />}
                columns={[
                  { key: 'num', label: 'Refund', render: (r) => <span className="whitespace-nowrap font-medium">{r.refundNumber}</span> },
                  { key: 'order', label: 'Order', render: (r) => <Link to={`/admin/orders/${r.order}`} className="whitespace-nowrap text-rose-deep hover:underline">{r.orderNumber}</Link> },
                  { key: 'user', label: 'Customer', render: (r) => r.user?.name || '—' },
                  { key: 'reason', label: 'Reason', render: (r) => <span className="text-ink-soft">{r.reason}</span> },
                  { key: 'gw', label: 'Via', render: (r) => (<><span className="block">{r.gateway === 'cod' ? 'Bank transfer' : r.gateway === 'mock' ? 'Simulated gateway' : r.gateway}</span>{r.gatewayRefundId && <span className="text-xs text-ink-faint">{r.gatewayRefundId}</span>}</>) },
                  { key: 'status', label: 'Status', render: (r) => <Pill strong={['pending', 'processing', 'failed'].includes(r.status)}>{REFUND_STATUS[r.status]}</Pill> },
                  { key: 'amount', label: 'Amount', align: 'right', render: (r) => (<><span className="font-semibold">{money(r.amount)}</span><span className="block text-xs text-ink-faint">{r.type}</span></>) },
                  { key: 'at', label: 'Created', render: (r) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(r.createdAt)}</span> },
                  ...(isAdmin ? [{ key: 'act', label: '', render: (r) => <RefundAction refund={r} onSaved={state.reload} /> }] : []),
                ]}
              />
              <Pagination pagination={data.pagination} onPage={(page) => setFilter('page', page > 1 ? String(page) : '')} />
            </>
          )}
        </Async>
      </Card>
    </>
  );
}
