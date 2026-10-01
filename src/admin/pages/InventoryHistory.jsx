import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import { api } from '../api';
import { Async, Card, Empty, Field, FilterBar, MOVEMENT_LABEL, PageHeader, Pagination, Pill, Select, Table, count, dateTime, signed, useAsync } from '../ui';

const TYPE_OPTIONS = [['', 'Any movement'], ...Object.entries(MOVEMENT_LABEL)];

export default function InventoryHistory() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [sku, setSku] = useState(params.get('sku') || '');
  const debouncedSearch = useDebounce(search, 300);
  const debouncedSku = useDebounce(sku, 300);

  const filters = { type: params.get('type') || '', from: params.get('from') || '', to: params.get('to') || '', page: Number(params.get('page')) || 1 };
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  const resetPage = () => filters.page !== 1 && setFilter('page', '');

  const state = useAsync(
    () => api('/inventory/history', { query: { ...filters, search: debouncedSearch, sku: debouncedSku, limit: 25 } }),
    [debouncedSearch, debouncedSku, filters.type, filters.from, filters.to, filters.page],
  );

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Inventory history" description="The audit log: every stock change with the quantity, who made it, when and why. Entries can never be edited or deleted." />

      <FilterBar>
        <Field label="Search" htmlFor="hist-search" className="sm:col-span-2">
          <input id="hist-search" type="search" value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} placeholder="Product, reason or reference" className="input" />
        </Field>
        <Field label="SKU" htmlFor="hist-sku">
          <input id="hist-sku" type="search" value={sku} onChange={(e) => { setSku(e.target.value); resetPage(); }} placeholder="e.g. RG-1" className="input" />
        </Field>
        <Field label="Movement" htmlFor="hist-type">
          <Select id="hist-type" value={filters.type} onChange={(v) => setFilter('type', v)} options={TYPE_OPTIONS} />
        </Field>
        <Field label="From" htmlFor="hist-from">
          <input id="hist-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilter('from', e.target.value)} className="input" />
        </Field>
        <Field label="To" htmlFor="hist-to">
          <input id="hist-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilter('to', e.target.value)} className="input" />
        </Field>
      </FilterBar>

      <Card padded={false} title="Stock movements">
        <Async state={state}>
          {(data) => (
            <>
              <Table
                minWidth={980}
                rowKey={(t) => t.id}
                rows={data.transactions}
                empty={<Empty title="No movements match">Try a wider date range or clear the filters.</Empty>}
                columns={[
                  { key: 'createdAt', label: 'Date & time', render: (t) => <span className="whitespace-nowrap text-ink-soft">{dateTime(t.createdAt)}</span> },
                  { key: 'sku', label: 'SKU', render: (t) => <span className="whitespace-nowrap font-medium">{t.sku}</span> },
                  { key: 'product', label: 'Product', render: (t) => t.product?.name || '—' },
                  { key: 'type', label: 'Movement', render: (t) => <Pill>{MOVEMENT_LABEL[t.type] || t.type}</Pill> },
                  { key: 'quantity', label: 'Quantity', align: 'right', render: (t) => count(t.quantity) },
                  { key: 'availableChange', label: 'Available', align: 'right', render: (t) => (<>{signed(t.availableChange)} <span className="text-ink-faint">→ {count(t.availableAfter)}</span></>) },
                  { key: 'reservedAfter', label: 'Reserved', align: 'right', render: (t) => count(t.reservedAfter) },
                  { key: 'soldAfter', label: 'Sold', align: 'right', render: (t) => count(t.soldAfter) },
                  { key: 'performedBy', label: 'By', render: (t) => (t.performedBy ? <span title={t.performedBy.email}>{t.performedBy.name}</span> : <span className="text-ink-faint">System</span>) },
                  { key: 'reason', label: 'Reason', render: (t) => (<><span className="block text-ink-soft">{t.reason || '—'}</span>{t.reference && <span className="text-xs text-ink-faint">Ref {t.reference}</span>}</>) },
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
