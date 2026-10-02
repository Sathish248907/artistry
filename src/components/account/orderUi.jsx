import { classNames } from '../../utils/format';

const inrWhole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrPaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Whole rupees show no decimals; anything else always shows two (₹88,465.20). */
export const money = (value) => {
  const n = Math.round((Number(value) || 0) * 100) / 100;
  return Number.isInteger(n) ? inrWhole.format(n) : inrPaise.format(n);
};
export const when = (v) => (v ? new Date(v).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const day = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export const ORDER_LABEL = { pending: 'Pending payment', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', return_requested: 'Return requested', returned: 'Returned', refunded: 'Refunded' };
export const PAYMENT_LABEL = { pending: 'Payment pending', paid: 'Paid', failed: 'Payment failed', refunded: 'Refunded', partially_refunded: 'Partly refunded' };
export const RETURN_LABEL = { requested: 'Requested', approved: 'Approved', rejected: 'Rejected', pickup_scheduled: 'Pickup scheduled', received: 'Received', inspected: 'Inspected', completed: 'Completed', cancelled: 'Cancelled' };
export const REFUND_LABEL = { pending: 'Pending', processing: 'Processing', completed: 'Completed', failed: 'Failed' };

/** Status chip. Stronger styling for states that need the customer's attention; the text always says the status. */
export function StatusPill({ children, tone = 'neutral' }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium',
        tone === 'strong' && 'border-rose-deep bg-rose-deep text-white',
        tone === 'accent' && 'border-rose text-rose-deep',
        tone === 'neutral' && 'border-rose-light text-ink-soft',
      )}
    >
      {children}
    </span>
  );
}

export const orderTone = (status) => (['pending', 'return_requested'].includes(status) ? 'strong' : ['cancelled', 'refunded', 'returned'].includes(status) ? 'neutral' : 'accent');
