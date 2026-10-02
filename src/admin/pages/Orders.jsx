import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import { api } from '../api';
import { ORDER_STATUS, PAYMENT_STATUS, options } from '../orderLabels';
import { Async, Card, Empty, Field, FilterBar, PageHeader, Pagination, Pill, Select, Table, count, dateTime, money, useAsync } from '../ui';

const SORTS = [['newest', 'Newest first'], ['oldest', 'Oldest first'], ['amount_desc', 'Highest amount'], ['amount_asc', 'Lowest amount']];

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('orderNumber') || '');
  const [customer, setCustomer] = useState(params.get('customer') || '');
  const [minAmount, setMinAmount] = useState(params.get('minAmount') || '');
  const [maxAmount, setMaxAmount] = useState(params.get('maxAmount') || '');
  const debounced = { orderNumber: useDebounce(orderNumber, 300), customer: useDebounce(customer, 300), minAmount: useDebounce(minAmount, 400), maxAmount: useDebounce(maxAmount, 400) };

  const filters = { status: params.get('status') || '', paymentStatus: params.get('paymentStatus') || '', from: params.get('from') || '', to: params.get('to') || '', sort: params.get('sort') || 'newest', page: Number(params.get('page')) || 1 };
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const state = useAsync(
    () => api('/admin/orders', { query: { ...filters, ...debounced, limit: 20 } }),
    [filters.status, filters.paymentStatus, filters.from, filters.to, filters.sort, filters.page, debounced.orderNumber, debounced.customer, debounced.minAmount, debounced.maxAmount],
  );

  return (
    <>
      <PageHeader eyebrow="Orders" title="All orders" description="Search, filter and open any order to update its status, see the payment and handle returns." />
      <FilterBar>
        <Field label="Order number" htmlFor="o-number"><input id="o-number" type="search" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ART-…" className="input" /></Field>
        <Field label="Customer" htmlFor="o-customer"><input id="o-customer" type="search" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Name, email or phone" className="input" /></Field>
        <Field label="Order status" htmlFor="o-status"><Select id="o-status" value={filters.status} onChange={(v) => setFilter('status', v)} options={options(ORDER_STATUS, 'Any status')} /></Field>
        <Field label="Payment" htmlFor="o-pay"><Select id="o-pay" value={filters.paymentStatus} onChange={(v) => setFilter('paymentStatus', v)} options={options(PAYMENT_STATUS, 'Any payment')} /></Field>
        <Field label="From" htmlFor="o-from"><input id="o-from" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} className="input" /></Field>
        <Field label="To" htmlFor="o-to"><input id="o-to" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} className="input" /></Field>
        <Field label="Min amount ₹" htmlFor="o-min"><input id="o-min" type="number" min="0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="input" /></Field>
        <Field label="Max amount ₹" htmlFor="o-max"><input id="o-max" type="number" min="0" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="input" /></Field>
      </FilterBar>
      <Card padded={false} title="Orders" action={<Select id="o-sort" aria-label="Sort" value={filters.sort} onChange={(v) => setFilter('sort', v === 'newest' ? '' : v)} options={SORTS} className="!w-auto !py-1.5 text-xs" />}>
        <Async state={state}>
          {(data) => (
            <>
              <Table
                minWidth={940}
                rowKey={(o) => o.id}
                rows={data.orders}
                empty={<Empty title="No orders match">Try a different search or clear the filters.</Empty>}
                columns={[
                  { key: 'orderNumber', label: 'Order', render: (o) => <Link to={`/admin/orders/${o.id}`} className="whitespace-nowrap font-medium text-rose-deep hover:underline">{o.orderNumber}</Link> },
                  { key: 'createdAt', label: 'Placed', render: (o) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(o.createdAt)}</span> },
                  { key: 'user', label: 'Customer', render: (o) => (<><span className="block">{o.user?.name || '—'}</span><span className="text-xs text-ink-faint">{o.user?.email}</span></>) },
                  { key: 'items', label: 'Items', align: 'right', render: (o) => count(o.itemCount) },
                  { key: 'status', label: 'Status', render: (o) => <Pill strong={['pending', 'confirmed', 'return_requested'].includes(o.status)}>{ORDER_STATUS[o.status]}</Pill> },
                  { key: 'payment', label: 'Payment', render: (o) => <span className="whitespace-nowrap text-ink-soft">{PAYMENT_STATUS[o.payment.status]} · {o.payment.method === 'cod' ? 'Cash' : 'Online'}</span> },
                  { key: 'total', label: 'Total', align: 'right', render: (o) => <span className="font-semibold">{money(o.pricing.grandTotal)}</span> },
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
