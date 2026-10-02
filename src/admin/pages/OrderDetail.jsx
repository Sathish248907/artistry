import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAdminAuth } from '../AdminAuthContext';
import { api, request } from '../api';
import { ORDER_STATUS, PAYMENT_RECORD_STATUS, PAYMENT_STATUS, REFUND_STATUS, RETURN_STATUS } from '../orderLabels';
import { Async, Card, Empty, Field, MOVEMENT_LABEL, Notice, PageHeader, Pill, Select, Table, count, dateTime, money, signed, useAsync } from '../ui';

function StatusForm({ order, onSaved }) {
  const { toast } = useUI();
  const [status, setStatus] = useState(order.allowedStatuses[0] || '');
  const [note, setNote] = useState('');
  const [courier, setCourier] = useState('');
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!order.allowedStatuses.length) return <p className="text-sm text-ink-soft">No manual status change is possible now. Returns and refunds move this order on automatically.</p>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { message } = await request(`/admin/orders/${order.id}/status`, { method: 'PUT', body: { status, note: note.trim() || undefined, courier: courier.trim() || undefined, trackingNumber: tracking.trim() || undefined } });
      toast({ title: message, body: order.orderNumber });
      setNote('');
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      {error && <Notice>{error.message}</Notice>}
      <Field label="New status" htmlFor="od-status"><Select id="od-status" value={status} onChange={setStatus} options={order.allowedStatuses.map((s) => [s, ORDER_STATUS[s]])} /></Field>
      {status === 'shipped' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Courier" htmlFor="od-courier"><input id="od-courier" value={courier} onChange={(e) => setCourier(e.target.value)} className="input" /></Field>
          <Field label="Tracking number" htmlFor="od-tracking"><input id="od-tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} className="input" /></Field>
        </div>
      )}
      <Field label={status === 'cancelled' ? 'Reason (shown to the customer)' : 'Note (optional)'} htmlFor="od-note"><input id="od-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="input" /></Field>
      {status === 'cancelled' && <p className="text-xs text-ink-soft">Cancelling returns the stock{order.payment.status === 'paid' ? ' and refunds the customer in full' : ''}.</p>}
      <button className="btn-primary" disabled={busy || !status || (status === 'cancelled' && !note.trim())}>{busy && <Loader2 size={15} className="animate-spin" />} Update status</button>
    </form>
  );
}

function RefundForm({ order, onSaved }) {
  const { toast } = useUI();
  const outstanding = Math.round((order.pricing.grandTotal - (order.payment.refundedAmount || 0)) * 100) / 100;
  const [amount, setAmount] = useState(String(outstanding));
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { message } = await request(`/payments/${order.payment.paymentId}/refund`, { method: 'POST', body: { amount: Number(amount), reason: reason.trim() } });
      toast({ title: message, body: order.orderNumber });
      setReason('');
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      {error && <Notice>{error.message}</Notice>}
      <p className="text-xs text-ink-soft">Up to {money(outstanding)} can still be refunded.</p>
      <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
        <Field label="Amount ₹" htmlFor="rf-amount"><input id="rf-amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" /></Field>
        <Field label="Reason" htmlFor="rf-reason"><input id="rf-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} className="input" /></Field>
      </div>
      <button className="btn-primary" disabled={busy || !reason.trim() || !(Number(amount) > 0)}>{busy && <Loader2 size={15} className="animate-spin" />} Refund</button>
    </form>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { isAdmin } = useAdminAuth();
  const state = useAsync(() => api(`/admin/orders/${id}`), [id]);

  return (
    <>
      <Link to="/admin/orders" className="mb-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-rose-deep hover:underline"><ArrowLeft size={13} /> All orders</Link>
      <Async state={state}>
        {({ order }) => {
          const p = order.pricing;
          const a = order.shippingAddress;
          const record = order.payment.record;
          return (
            <>
              <PageHeader eyebrow="Order" title={order.orderNumber} description={`Placed ${dateTime(order.placedAt)} by ${order.user?.name || 'a customer'}`} actions={<><Pill strong>{ORDER_STATUS[order.status]}</Pill><Pill>{PAYMENT_STATUS[order.payment.status]}</Pill></>} />
              <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
                <div className="min-w-0 space-y-6">
                  <Card title="Items and pricing" padded={false}>
                    <Table
                      minWidth={900}
                      rowKey={(i) => i.id}
                      rows={order.items}
                      columns={[
                        { key: 'name', label: 'Item', render: (i) => (<><span className="block">{i.name}{i.variantName ? ` · ${i.variantName}` : ''}</span><span className="text-xs text-ink-faint">{i.sku}{i.goldPurity ? ` · ${i.goldPurity} · ${i.goldWeight} g` : ''}</span></>) },
                        { key: 'qty', label: 'Qty', align: 'right', render: (i) => (<>{i.quantity}{i.returnedQuantity ? <span className="block text-xs text-ink-faint">{i.returnedQuantity} returned</span> : null}</>) },
                        { key: 'rate', label: 'Rate / g', align: 'right', render: (i) => (i.goldRatePerGram ? money(i.goldRatePerGram) : '—') },
                        { key: 'gold', label: 'Gold value', align: 'right', render: (i) => money(i.goldValue) },
                        { key: 'making', label: 'Making', align: 'right', render: (i) => money(i.makingCharges) },
                        { key: 'wastage', label: 'Wastage', align: 'right', render: (i) => money(i.wastageCharges) },
                        { key: 'stones', label: 'Stones+other', align: 'right', render: (i) => money(i.stoneCharges + i.otherCharges) },
                        { key: 'unit', label: 'Unit price', align: 'right', render: (i) => money(i.unitPrice) },
                        { key: 'total', label: 'Line total', align: 'right', render: (i) => <span className="font-semibold">{money(i.lineTotal)}</span> },
                      ]}
                    />
                    <dl className="grid gap-x-8 gap-y-1.5 border-t border-rose-light/50 px-5 py-4 text-sm sm:grid-cols-2">
                      {[['Items (incl. GST)', money(p.itemsTotal)], ['GST included', money(p.tax)], ['Coupon', p.discount ? `− ${money(p.discount)}${p.couponCode ? ` (${p.couponCode})` : ''}` : '—'], ['Delivery', `${p.shipping ? money(p.shipping) : 'Free'} · ${order.shippingMethod.label}`], ['Grand total', money(p.grandTotal)], ['Refunded', money(order.payment.refundedAmount || 0)]].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4"><dt className="text-ink-soft">{k}</dt><dd className="tabular-nums text-ink">{v}</dd></div>
                      ))}
                    </dl>
                  </Card>

                  <Card title="Status history" padded={false}>
                    <Table minWidth={560} rowKey={(h) => h.id} rows={[...order.statusHistory].reverse()} columns={[
                      { key: 'at', label: 'When', render: (h) => <span className="whitespace-nowrap text-ink-soft">{dateTime(h.at)}</span> },
                      { key: 'status', label: 'Status', render: (h) => <Pill>{ORDER_STATUS[h.status]}</Pill> },
                      { key: 'by', label: 'By', render: (h) => <span className="text-ink-soft">{h.changedByRole}</span> },
                      { key: 'note', label: 'Note', render: (h) => <span className="text-ink-soft">{h.note || '—'}</span> },
                    ]} />
                  </Card>

                  <Card title="Inventory impact" padded={false}>
                    <Table minWidth={620} rowKey={(t) => t.id} rows={order.inventoryImpact} empty={<Empty title="No stock movements" />} columns={[
                      { key: 'createdAt', label: 'When', render: (t) => <span className="whitespace-nowrap text-ink-soft">{dateTime(t.createdAt)}</span> },
                      { key: 'sku', label: 'SKU', render: (t) => t.sku },
                      { key: 'type', label: 'Movement', render: (t) => <Pill>{MOVEMENT_LABEL[t.type] || t.type}</Pill> },
                      { key: 'qty', label: 'Qty', align: 'right', render: (t) => count(t.quantity) },
                      { key: 'avail', label: 'Available', align: 'right', render: (t) => `${signed(t.availableChange)} → ${count(t.availableAfter)}` },
                      { key: 'ref', label: 'Reference', render: (t) => <span className="text-xs text-ink-soft">{t.reference}</span> },
                    ]} />
                  </Card>

                  {(order.returns.length > 0 || order.refunds.length > 0) && (
                    <Card title="Returns and refunds" padded={false}>
                      <Table minWidth={620} rowKey={(r) => r.id} rows={[...order.returns.map((r) => ({ ...r, kind: 'return' })), ...order.refunds.map((r) => ({ ...r, kind: 'refund' }))]} columns={[
                        { key: 'num', label: 'Reference', render: (r) => (r.kind === 'return' ? <Link to={`/admin/returns?open=${r.id}`} className="font-medium text-rose-deep hover:underline">{r.returnNumber}</Link> : <span className="font-medium">{r.refundNumber}</span>) },
                        { key: 'kind', label: 'Type', render: (r) => (r.kind === 'return' ? 'Return' : `Refund · ${r.type}`) },
                        { key: 'status', label: 'Status', render: (r) => <Pill>{r.kind === 'return' ? RETURN_STATUS[r.status] : REFUND_STATUS[r.status]}</Pill> },
                        { key: 'amount', label: 'Amount', align: 'right', render: (r) => money(r.kind === 'return' ? r.refundAmount : r.amount) },
                        { key: 'at', label: 'Created', render: (r) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(r.createdAt)}</span> },
                      ]} />
                    </Card>
                  )}
                </div>

                <div className="min-w-0 space-y-6">
                  <Card title="Update status"><StatusForm order={order} onSaved={state.reload} /></Card>
                  <Card title="Customer">
                    <p className="text-sm font-medium text-ink">{order.user?.name}</p>
                    <p className="text-sm text-ink-soft">{order.user?.email}{order.user?.phone ? ` · ${order.user.phone}` : ''}</p>
                    {order.customerNote && <p className="mt-3 rounded-xl bg-rose-blush/60 px-3 py-2 text-xs text-ink">Note: {order.customerNote}</p>}
                  </Card>
                  <Card title="Delivery">
                    <p className="text-sm text-ink">{a.fullName} · {a.phone}</p>
                    <p className="text-sm text-ink-soft">{[a.addressLine1, a.addressLine2, a.landmark].filter(Boolean).join(', ')}, {a.city}, {a.state} {a.postalCode}, {a.country}</p>
                    <p className="mt-2 text-xs text-ink-faint">{order.shippingMethod.label}{order.shipment.trackingNumber ? ` · ${order.shipment.courier} ${order.shipment.trackingNumber}` : ''}</p>
                  </Card>
                  <Card title="Payment">
                    <dl className="space-y-1.5 text-sm">
                      {[['Method', order.payment.method === 'cod' ? 'Cash on delivery' : 'Online'], ['Order payment', PAYMENT_STATUS[order.payment.status]], ['Gateway', record ? `${record.gateway} · ${PAYMENT_RECORD_STATUS[record.status]}` : '—'], ['Transaction', record?.gatewayPaymentId || '—'], ['Paid at', dateTime(order.payment.paidAt)], ['Attempts', record ? count(record.attempts) : '—']].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4"><dt className="text-ink-soft">{k}</dt><dd className="truncate text-right text-ink">{v}</dd></div>
                      ))}
                    </dl>
                  </Card>
                  {isAdmin && ['paid', 'partially_refunded'].includes(order.payment.status) && (
                    <Card title="Refund"><RefundForm order={order} onSaved={state.reload} /></Card>
                  )}
                </div>
              </div>
            </>
          );
        }}
      </Async>
    </>
  );
}

