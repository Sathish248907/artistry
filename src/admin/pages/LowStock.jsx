import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAdminAuth } from '../AdminAuthContext';
import { api, request } from '../api';
import { Async, Card, Empty, Field, Notice, PageHeader, Pagination, Select, StockBadge, Table, count, dateTime, smallButton, useAsync } from '../ui';

const columns = [
  { key: 'sku', label: 'SKU', render: (r) => <span className="whitespace-nowrap font-medium">{r.sku}</span> },
  { key: 'product', label: 'Product', render: (r) => `${r.product?.name || 'Unknown product'}${r.variant ? ` · ${r.variant.name || r.variant.size || 'variant'}` : ''}` },
  { key: 'availableQuantity', label: 'Available', align: 'right', render: (r) => <span className="font-semibold">{count(r.availableQuantity)}</span> },
  { key: 'lowStockThreshold', label: 'Minimum', align: 'right', render: (r) => count(r.lowStockThreshold) },
  { key: 'stockStatus', label: 'Status', render: (r) => <StockBadge status={r.stockStatus} /> },
  { key: 'updatedAt', label: 'Last change', render: (r) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(r.lastMovementAt || r.updatedAt)}</span> },
  { key: 'actions', label: '', render: (r) => <span className="flex justify-end"><Link to={`/admin/stock?sku=${encodeURIComponent(r.sku)}`} className={smallButton}>Restock</Link></span> },
];

function StockSection({ title, path, emptyTitle, emptyText, version }) {
  const [page, setPage] = useState(1);
  const state = useAsync(() => api(path, { query: { page, limit: 10, sort: 'stock_asc' } }), [page, version]);
  return (
    <Card padded={false} title={state.data ? `${title} · ${count(state.data.pagination.total)}` : title}>
      <Async state={state}>
        {(data) => (
          <>
            <Table minWidth={760} rowKey={(r) => r.id} rows={data.inventory} columns={columns} empty={<Empty title={emptyTitle}>{emptyText}</Empty>} />
            <Pagination pagination={data.pagination} onPage={setPage} />
          </>
        )}
      </Async>
    </Card>
  );
}

/** Admins set the minimum stock level for every SKU, or for one category. */
function MinimumLevel({ onSaved }) {
  const { toast } = useUI();
  const categories = useAsync(() => api('/categories', { auth: false }), []);
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const options = [['', 'Every SKU'], ...((categories.data?.categories || []).map((c) => [c.id, c.parentCategory ? `${c.parentCategory.name} › ${c.name}` : c.name]))];

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data } = await request('/inventory/thresholds', { method: 'PATCH', body: { lowStockThreshold: Number(level), category: category || undefined } });
      toast({ title: 'Minimum stock level updated', body: `${count(data.matched)} SKU${data.matched === 1 ? '' : 's'} now alert at ${count(data.lowStockThreshold)}` });
      setLevel('');
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Minimum stock level">
      <p className="text-sm text-ink-soft">A SKU counts as low stock when its available quantity is at or below this number. One SKU can also be changed from the inventory list.</p>
      {error && !Object.keys(error.fields).length && <div className="mt-3"><Notice>{error.message}</Notice></div>}
      <form onSubmit={submit} className="mt-4 grid items-end gap-3 sm:grid-cols-[10rem_1fr_auto]" noValidate>
        <Field label="Minimum level" htmlFor="min-level" error={error?.fields.lowStockThreshold}>
          <input id="min-level" type="number" min="0" step="1" inputMode="numeric" value={level} onChange={(e) => setLevel(e.target.value)} className="input" required />
        </Field>
        <Field label="Apply to" htmlFor="min-category" error={error?.fields.category}>
          <Select id="min-category" value={category} onChange={setCategory} options={options} />
        </Field>
        <button className="btn-primary" disabled={busy || level === '' || !Number.isInteger(Number(level)) || Number(level) < 0}>
          {busy && <Loader2 size={15} className="animate-spin" />} Apply
        </button>
      </form>
    </Card>
  );
}

export default function LowStock() {
  const { isAdmin } = useAdminAuth();
  const [version, setVersion] = useState(0);

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Low stock" description="Items at or below their minimum level, and items with nothing left to sell. Out-of-stock items cannot be bought." />
      <div className="space-y-6">
        {isAdmin && <MinimumLevel onSaved={() => setVersion((v) => v + 1)} />}
        <StockSection title="Low stock" path="/inventory/low-stock" emptyTitle="Nothing is running low" emptyText="Every SKU is above its minimum level." version={version} />
        <StockSection title="Out of stock" path="/inventory/out-of-stock" emptyTitle="Nothing is out of stock" emptyText="Every SKU has stock available." version={version} />
      </div>
    </>
  );
}
