import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Pencil, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import useDebounce from '../../hooks/useDebounce';
import { useAdminAuth } from '../AdminAuthContext';
import { api, request } from '../api';
import { Async, Card, Empty, Field, FilterBar, PageHeader, Pagination, Select, StockBadge, Table, count, dateTime, smallButton, useAsync } from '../ui';

const STATUS_OPTIONS = [['', 'Any status'], ['in_stock', 'In stock'], ['low_stock', 'Low stock'], ['out_of_stock', 'Out of stock']];
const SORT_OPTIONS = [['updated', 'Recently changed'], ['stock_asc', 'Lowest stock first'], ['stock_desc', 'Highest stock first'], ['sku', 'SKU A–Z']];

/** Click-to-edit minimum stock level (admins only). */
function Threshold({ record, canEdit, onSaved }) {
  const { toast } = useUI();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(record.lowStockThreshold));
  const [busy, setBusy] = useState(false);

  if (!editing) {
    return (
      <span className="inline-flex items-center justify-end gap-1.5">
        {count(record.lowStockThreshold)}
        {canEdit && (
          <button type="button" onClick={() => { setValue(String(record.lowStockThreshold)); setEditing(true); }} className="text-ink-faint hover:text-rose-deep" aria-label={`Change the minimum level for ${record.sku}`}>
            <Pencil size={12} />
          </button>
        )}
      </span>
    );
  }

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await request(`/inventory/${record.id}`, { method: 'PUT', body: { lowStockThreshold: Number(value) } });
      toast({ title: 'Minimum level updated', body: `${record.sku} · ${value}` });
      setEditing(false);
      onSaved();
    } catch (error) {
      toast({ title: 'Could not update', body: error.fields.lowStockThreshold || error.message, tone: 'neutral' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="inline-flex items-center justify-end gap-1">
      <input type="number" min="0" step="1" value={value} onChange={(e) => setValue(e.target.value)} autoFocus aria-label={`Minimum level for ${record.sku}`} className="w-16 rounded-lg border border-rose-light bg-ivory px-2 py-1 text-right text-sm focus:border-rose focus:outline-none" />
      <button type="submit" disabled={busy} className="rounded-full p-1 text-rose-deep hover:bg-rose-blush" aria-label="Save"><Check size={14} /></button>
      <button type="button" onClick={() => setEditing(false)} className="rounded-full p-1 text-ink-faint hover:bg-rose-blush" aria-label="Cancel"><X size={14} /></button>
    </form>
  );
}

export default function InventoryList() {
  const { isAdmin } = useAdminAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    status: params.get('status') || '',
    category: params.get('category') || '',
    from: params.get('from') || '',
    to: params.get('to') || '',
    sort: params.get('sort') || 'updated',
    page: Number(params.get('page')) || 1,
  };
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const categories = useAsync(() => api('/categories', { auth: false }), []);
  const state = useAsync(
    () => request('/inventory', { query: { ...filters, search: debouncedSearch, limit: 20 } }).then((r) => r.data),
    [debouncedSearch, filters.status, filters.category, filters.from, filters.to, filters.sort, filters.page],
  );

  const categoryOptions = [['', 'Any category'], ...((categories.data?.categories || []).map((c) => [c.id, c.parentCategory ? `${c.parentCategory.name} › ${c.name}` : c.name]))];

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Inventory list" description="Every SKU with what is available, reserved for orders and sold. Quantities change only through stock movements." actions={<Link to="/admin/stock" className="btn-primary">Adjust stock</Link>} />

      <FilterBar>
        <Field label="Search" htmlFor="inv-search" className="sm:col-span-2">
          <input id="inv-search" type="search" value={search} onChange={(e) => { setSearch(e.target.value); if (filters.page !== 1) setFilter('page', ''); }} placeholder="SKU or product name" className="input" />
        </Field>
        <Field label="Stock status" htmlFor="inv-status">
          <Select id="inv-status" value={filters.status} onChange={(v) => setFilter('status', v)} options={STATUS_OPTIONS} />
        </Field>
        <Field label="Category" htmlFor="inv-category">
          <Select id="inv-category" value={filters.category} onChange={(v) => setFilter('category', v)} options={categoryOptions} />
        </Field>
        <Field label="Changed from" htmlFor="inv-from">
          <input id="inv-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilter('from', e.target.value)} className="input" />
        </Field>
        <Field label="Changed to" htmlFor="inv-to">
          <input id="inv-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilter('to', e.target.value)} className="input" />
        </Field>
      </FilterBar>

      <Card padded={false} title="Stock records" action={<Select id="inv-sort" aria-label="Sort" value={filters.sort} onChange={(v) => setFilter('sort', v === 'updated' ? '' : v)} options={SORT_OPTIONS} className="!w-auto !py-1.5 text-xs" />}>
        <Async state={state}>
          {(data) => (
            <>
              <Table
                minWidth={900}
                rowKey={(r) => r.id}
                rows={data.inventory}
                empty={<Empty title="No stock records match">Try a different search or clear the filters.</Empty>}
                columns={[
                  { key: 'sku', label: 'SKU', render: (r) => <span className="whitespace-nowrap font-medium">{r.sku}</span> },
                  {
                    key: 'product',
                    label: 'Product',
                    render: (r) => (
                      <>
                        <span className="block">{r.product?.name || 'Unknown product'}</span>
                        <span className="text-xs text-ink-faint">{r.variant ? `Variant · ${[r.variant.name, r.variant.size && `size ${r.variant.size}`, r.variant.goldWeight && `${r.variant.goldWeight} g`, r.variant.goldPurity].filter(Boolean).join(' · ')}` : [r.product?.goldPurity, r.product?.goldWeight && `${r.product.goldWeight} g`].filter(Boolean).join(' · ')}</span>
                      </>
                    ),
                  },
                  { key: 'availableQuantity', label: 'Available', align: 'right', render: (r) => <span className="font-semibold">{count(r.availableQuantity)}</span> },
                  { key: 'reservedQuantity', label: 'Reserved', align: 'right', render: (r) => count(r.reservedQuantity) },
                  { key: 'soldQuantity', label: 'Sold', align: 'right', render: (r) => count(r.soldQuantity) },
                  { key: 'lowStockThreshold', label: 'Minimum', align: 'right', render: (r) => <Threshold record={r} canEdit={isAdmin} onSaved={state.reload} /> },
                  { key: 'stockStatus', label: 'Status', render: (r) => <StockBadge status={r.stockStatus} /> },
                  { key: 'updatedAt', label: 'Last change', render: (r) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(r.lastMovementAt || r.updatedAt)}</span> },
                  {
                    key: 'actions',
                    label: '',
                    render: (r) => (
                      <span className="flex justify-end gap-2">
                        <Link to={`/admin/stock?sku=${encodeURIComponent(r.sku)}`} className={smallButton}>Adjust</Link>
                        <Link to={`/admin/history?sku=${encodeURIComponent(r.sku)}`} className={smallButton}>History</Link>
                      </span>
                    ),
                  },
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
