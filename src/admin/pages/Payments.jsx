import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import { api } from '../api';
import { PAYMENT_RECORD_STATUS, options } from '../orderLabels';
import { Async, Card, Empty, Field, FilterBar, PageHeader, Pagination, Pill, Select, Table, dateTime, money, useAsync } from '../ui';

export default function Payments() {
  const [params, setParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const debounced = useDebounce(orderNumber, 300);
  const filters = { status: params.get('status') || '', gateway: params.get('gateway') || '', from: params.get('from') || '', to: params.get('to') || '', page: Number(params.get('page')) || 1 };
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  const state = useAsync(() => api('/admin/payments', { query: { ...filters, orderNumber: debounced, limit: 20 } }), [filters.status, filters.gateway, filters.from, filters.to, filters.page, debounced]);

  return (
    <>
      <PageHeader eyebrow="Orders" title="Payments" description="Every payment attempt with its gateway, transaction id and outcome. Payments are marked paid only after the gateway's signature is verified on the server." />
      <FilterBar>
        <Field label="Order number" htmlFor="p-order"><input id="p-order" type="search" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="input" placeholder="ART-…" /></Field>
        <Field label="Status" htmlFor="p-status"><Select id="p-status" value={filters.status} onChange={(v) => setFilter('status', v)} options={options(PAYMENT_RECORD_STATUS, 'Any status')} /></Field>
        <Field label="Gateway" htmlFor="p-gw"><Select id="p-gw" value={filters.gateway} onChange={(v) => setFilter('gateway', v)} options={[['', 'Any gateway'], ['mock', 'Simulated'], ['razorpay', 'Razorpay'], ['cod', 'Cash on delivery']]} /></Field>
        <Field label="From" htmlFor="p-from"><input id="p-from" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} className="input" /></Field>
        <Field label="To" htmlFor="p-to"><input id="p-to" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} className="input" /></Field>
      </FilterBar>
      <Card padded={false} title="Payments">
        <Async state={state}>
          {(data) => (
            <>
              <Table
                minWidth={940}
                rowKey={(p) => p.id}
                rows={data.payments}
                empty={<Empty title="No payments match" />}
                columns={[
                  { key: 'createdAt', label: 'Created', render: (p) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(p.createdAt)}</span> },
                  { key: 'order', label: 'Order', render: (p) => <Link to={`/admin/orders/${p.order}`} className="whitespace-nowrap font-medium text-rose-deep hover:underline">{p.orderNumber}</Link> },
                  { key: 'user', label: 'Customer', render: (p) => p.user?.name || '—' },
                  { key: 'gateway', label: 'Gateway', render: (p) => (<><span className="block">{p.gateway === 'mock' ? 'Simulated' : p.gateway === 'cod' ? 'Cash' : 'Razorpay'}</span>{p.methodDetail && <span className="text-xs text-ink-faint">{p.methodDetail}</span>}</>) },
                  { key: 'txn', label: 'Transaction', render: (p) => <span className="text-xs text-ink-soft">{p.gatewayPaymentId || '—'}</span> },
                  { key: 'status', label: 'Status', render: (p) => <Pill strong={p.status === 'failed'}>{PAYMENT_RECORD_STATUS[p.status]}</Pill> },
                  { key: 'amount', label: 'Amount', align: 'right', render: (p) => (<><span className="font-semibold">{money(p.amount)}</span>{p.refundedAmount > 0 && <span className="block text-xs text-ink-faint">{money(p.refundedAmount)} refunded</span>}</>) },
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
