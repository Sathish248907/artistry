import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, CheckCircle2, Clock, PackageCheck, RefreshCw, RotateCcw, ShoppingBag, Truck, Undo2, Wallet } from 'lucide-react';
import { api } from '../api';
import { BarList, TrendChart } from '../charts';
import { ORDER_STATUS, PAYMENT_STATUS } from '../orderLabels';
import { Async, Card, Empty, PageHeader, Pill, Select, StatTile, Table, count, dateTime, money, moneyCompact, smallButton, useAsync } from '../ui';

const DAYS = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days']];

/** Fill the days that had no orders, so the line does not skip them. */
const fillDays = (rows, days, key) => {
  const byDate = Object.fromEntries(rows.map((r) => [r.date, r[key]]));
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toLocaleDateString('en-CA');
    out.push({ date, value: byDate[date] || 0 });
  }
  return out;
};

export default function OrdersDashboard() {
  const [days, setDays] = useState('30');
  const state = useAsync(() => api('/admin/orders/dashboard', { query: { days } }), [days]);

  return (
    <>
      <PageHeader
        eyebrow="Orders"
        title="Order dashboard"
        description="Orders, revenue, what needs attention, and the latest orders."
        actions={
          <>
            <Select id="od-days" aria-label="Period" value={days} onChange={setDays} options={DAYS} className="!w-auto !py-2 text-xs" />
            <button type="button" onClick={state.reload} className={smallButton} disabled={state.loading}><RefreshCw size={13} className={state.loading ? 'animate-spin' : ''} /> Refresh</button>
          </>
        }
      />
      <Async state={state}>
        {(d) => (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <StatTile label="Total revenue" value={moneyCompact(d.summary.totalRevenue)} hint={`${money(d.summary.grossRevenue)} paid − ${money(d.summary.refundedAmount)} refunded`} icon={Wallet} />
              <StatTile label="Total orders" value={count(d.summary.totalOrders)} icon={ShoppingBag} />
              <StatTile label="Pending" value={count(d.summary.pendingOrders)} hint="Waiting for payment" icon={Clock} />
              <StatTile label="Confirmed" value={count(d.summary.confirmedOrders)} hint="Ready to process" icon={CheckCircle2} />
              <StatTile label="Processing" value={count(d.summary.processingOrders)} icon={PackageCheck} />
              <StatTile label="Shipped" value={count(d.summary.shippedOrders)} icon={Truck} />
              <StatTile label="Delivered" value={count(d.summary.deliveredOrders)} icon={CheckCircle2} />
              <StatTile label="Cancelled" value={count(d.summary.cancelledOrders)} icon={Ban} />
              <StatTile label="Return requests" value={count(d.summary.returnRequests)} hint="Open returns" icon={RotateCcw} />
              <StatTile label="Refund requests" value={count(d.summary.refundRequests)} hint="Pending or processing" icon={Undo2} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card title={`Orders per day · ${DAYS.find(([v]) => v === days)[1].toLowerCase()}`}>
                <TrendChart points={fillDays(d.perDay, d.days, 'orders')} label="Orders" format={count} axisFormat={count} minZero wholeNumbers emptyText="No orders in this period." />
              </Card>
              <Card title={`Revenue per day · ${DAYS.find(([v]) => v === days)[1].toLowerCase()}`}>
                <TrendChart points={fillDays(d.perDay, d.days, 'revenue')} label="Revenue" format={money} axisFormat={(v) => moneyCompact(v)} minZero emptyText="No revenue in this period." />
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card title="Orders by status">
                <BarList rows={Object.entries(ORDER_STATUS).map(([key, label]) => ({ key, label, value: d.statusCounts[key] || 0 }))} emptyText="No orders yet." />
              </Card>
              <Card title="Orders by payment status">
                <BarList rows={Object.entries(PAYMENT_STATUS).map(([key, label]) => ({ key, label, value: d.paymentCounts[key] || 0 }))} emptyText="No orders yet." />
              </Card>
            </div>

            <Card title="Recent orders" padded={false} action={<Link to="/admin/orders" className="text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline">All orders</Link>}>
              <Table
                rowKey={(o) => o.id}
                rows={d.recentOrders}
                empty={<Empty title="No orders yet" />}
                columns={[
                  { key: 'orderNumber', label: 'Order', render: (o) => <Link to={`/admin/orders/${o.id}`} className="whitespace-nowrap font-medium text-rose-deep hover:underline">{o.orderNumber}</Link> },
                  { key: 'createdAt', label: 'Placed', render: (o) => <span className="whitespace-nowrap text-ink-soft">{dateTime(o.createdAt)}</span> },
                  { key: 'user', label: 'Customer', render: (o) => o.user?.name || '—' },
                  { key: 'status', label: 'Status', render: (o) => <Pill strong={['pending', 'return_requested'].includes(o.status)}>{ORDER_STATUS[o.status]}</Pill> },
                  { key: 'payment', label: 'Payment', render: (o) => <span className="text-ink-soft">{PAYMENT_STATUS[o.payment.status]} · {o.payment.method === 'cod' ? 'Cash' : 'Online'}</span> },
                  { key: 'total', label: 'Total', align: 'right', render: (o) => money(o.pricing.grandTotal) },
                ]}
              />
            </Card>
          </div>
        )}
      </Async>
    </>
  );
}
