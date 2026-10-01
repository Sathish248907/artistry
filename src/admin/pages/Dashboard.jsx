import { Link } from 'react-router-dom';
import { Boxes, Coins, Gem, PackageX, RefreshCw, TriangleAlert, Wallet } from 'lucide-react';
import { api } from '../api';
import { RateTrendChart, StockStatusBar } from '../charts';
import { Async, Card, Empty, MOVEMENT_LABEL, PageHeader, Pill, StatTile, Table, count, dateTime, money, moneyCompact, signed, smallButton, useAsync } from '../ui';

const rateChange = (rate) => {
  if (!rate || rate.previousRatePerGram == null || !rate.change) return 'No change yet';
  return `${rate.change > 0 ? '▲' : '▼'} ${money(Math.abs(rate.change))} (${Math.abs(rate.changePercent)}%) since the last rate`;
};

const itemName = (record) => `${record.product?.name || 'Unknown product'}${record.variant ? ` · ${record.variant.name || record.variant.size || record.variant.sku}` : ''}`;

function StockList({ records, emptyTitle, emptyText }) {
  if (!records.length) return <Empty title={emptyTitle}>{emptyText}</Empty>;
  return (
    <ul className="divide-y divide-rose-light/40">
      {records.map((record) => (
        <li key={record.id} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{itemName(record)}</p>
            <p className="text-xs text-ink-faint">{record.sku} · minimum {count(record.lowStockThreshold)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-semibold tabular-nums text-ink">{count(record.availableQuantity)}</span>
            <Link to={`/admin/stock?sku=${encodeURIComponent(record.sku)}`} className={smallButton}>Restock</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const state = useAsync(() => api('/inventory/dashboard'), []);

  return (
    <>
      <PageHeader
        eyebrow="Inventory & gold rates"
        title="Dashboard"
        description="Stock levels, items that need attention, today’s gold rates and the latest stock movements."
        actions={
          <button type="button" onClick={state.reload} className={smallButton} disabled={state.loading}>
            <RefreshCw size={13} className={state.loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      <Async state={state}>
        {(d) => {
          const rate22 = d.goldRates.find((r) => r.purity === '22K') || d.goldRates[0];
          return (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <StatTile label="Total products" value={count(d.summary.totalProducts)} hint={`${count(d.summary.totalSkus)} SKUs tracked`} icon={Gem} />
                <StatTile label="Available stock" value={count(d.summary.availableStock)} hint={`${count(d.summary.reservedStock)} reserved · ${count(d.summary.soldStock)} sold`} icon={Boxes} />
                <StatTile label="Low stock" value={count(d.summary.lowStockCount)} hint="At or below the minimum level" icon={TriangleAlert} />
                <StatTile label="Out of stock" value={count(d.summary.outOfStockCount)} hint="Nothing available to sell" icon={PackageX} />
                <StatTile label="Total stock value" value={moneyCompact(d.summary.totalStockValue)} hint={money(d.summary.totalStockValue)} icon={Wallet} />
                <StatTile label={rate22 ? `Gold rate · ${rate22.purity}` : 'Gold rate'} value={rate22 ? `${money(rate22.ratePerGram)}/g` : 'Not set'} hint={rate22 ? rateChange(rate22) : 'Add today’s rate'} icon={Coins} />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card title="Stock status · share of SKUs">
                  <StockStatusBar inStock={d.summary.inStockCount} lowStock={d.summary.lowStockCount} outOfStock={d.summary.outOfStockCount} />
                </Card>
                <Card title={d.goldRateTrend.purity ? `${d.goldRateTrend.purity} gold rate per gram · last 30 days` : 'Gold rate trend'}>
                  <RateTrendChart points={d.goldRateTrend.points} purity={d.goldRateTrend.purity || '22K'} />
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card title="Current gold rates" padded={false} action={<Link to="/admin/gold-rates" className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline">Manage</Link>}>
                  <Table
                    minWidth={440}
                    rowKey={(r) => r.id}
                    rows={d.goldRates}
                    empty={<Empty title="No gold rates yet">Add today’s rates to price jewellery from the gold rate.</Empty>}
                    columns={[
                      { key: 'purity', label: 'Purity', render: (r) => <span className="font-medium">{r.purity}</span> },
                      { key: 'ratePerGram', label: 'Per gram', align: 'right', render: (r) => money(r.ratePerGram) },
                      { key: 'ratePer10Gram', label: 'Per 10 g', align: 'right', render: (r) => money(r.ratePer10Gram) },
                      { key: 'change', label: 'Change', align: 'right', render: (r) => (r.change ? `${r.change > 0 ? '▲' : '▼'} ${money(Math.abs(r.change))}` : '—') },
                    ]}
                  />
                </Card>
                <Card title="Gold rate changes" padded={false} action={<Link to="/admin/gold-rate-history" className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline">Full history</Link>}>
                  <Table
                    minWidth={440}
                    rowKey={(h) => h.id}
                    rows={d.goldRateChanges}
                    empty={<Empty title="No changes yet" />}
                    columns={[
                      { key: 'effectiveFrom', label: 'When', render: (h) => <span className="whitespace-nowrap text-ink-soft">{dateTime(h.effectiveFrom)}</span> },
                      { key: 'purity', label: 'Purity', render: (h) => <span className="font-medium">{h.purity}</span> },
                      { key: 'ratePerGram', label: 'Rate / g', align: 'right', render: (h) => money(h.ratePerGram) },
                      { key: 'action', label: 'Change', render: (h) => <Pill>{h.action}</Pill> },
                    ]}
                  />
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card title={`Low stock · ${count(d.summary.lowStockCount)}`} padded={false} action={<Link to="/admin/low-stock" className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline">View all</Link>}>
                  <StockList records={d.lowStock} emptyTitle="Nothing is running low" emptyText="Every SKU is above its minimum level." />
                </Card>
                <Card title={`Out of stock · ${count(d.summary.outOfStockCount)}`} padded={false} action={<Link to="/admin/low-stock" className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline">View all</Link>}>
                  <StockList records={d.outOfStock} emptyTitle="Nothing is out of stock" emptyText="Every SKU has stock available." />
                </Card>
              </div>

              <Card title="Recent inventory updates" padded={false} action={<Link to="/admin/history" className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline">Full history</Link>}>
                <Table
                  rowKey={(t) => t.id}
                  rows={d.recentTransactions}
                  empty={<Empty title="No stock movements yet" />}
                  columns={[
                    { key: 'createdAt', label: 'When', render: (t) => <span className="whitespace-nowrap text-ink-soft">{dateTime(t.createdAt)}</span> },
                    { key: 'sku', label: 'Item', render: (t) => (<><span className="block">{t.product?.name || '—'}</span><span className="text-xs text-ink-faint">{t.sku}</span></>) },
                    { key: 'type', label: 'Movement', render: (t) => <Pill>{MOVEMENT_LABEL[t.type] || t.type}</Pill> },
                    { key: 'availableChange', label: 'Change', align: 'right', render: (t) => signed(t.availableChange) },
                    { key: 'availableAfter', label: 'Available after', align: 'right', render: (t) => count(t.availableAfter) },
                    { key: 'performedBy', label: 'By', render: (t) => <span className="whitespace-nowrap text-ink-soft">{t.performedBy?.name || 'System'}</span> },
                  ]}
                />
              </Card>
            </div>
          );
        }}
      </Async>
    </>
  );
}
