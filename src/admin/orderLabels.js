export const ORDER_STATUS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return requested',
  returned: 'Returned',
  refunded: 'Refunded',
};
export const PAYMENT_STATUS = { pending: 'Pending', paid: 'Paid', failed: 'Failed', refunded: 'Refunded', partially_refunded: 'Partly refunded' };
export const PAYMENT_RECORD_STATUS = { created: 'Created', pending: 'Pending', paid: 'Paid', failed: 'Failed', cancelled: 'Cancelled', refunded: 'Refunded', partially_refunded: 'Partly refunded' };
export const RETURN_STATUS = { requested: 'Requested', approved: 'Approved', rejected: 'Rejected', pickup_scheduled: 'Pickup scheduled', received: 'Received', inspected: 'Inspected', completed: 'Completed', cancelled: 'Cancelled' };
export const REFUND_STATUS = { pending: 'Pending', processing: 'Processing', completed: 'Completed', failed: 'Failed' };

export const options = (labels, anyLabel) => [['', anyLabel], ...Object.entries(labels)];

/** Statuses that need someone on the team to act. */
export const NEEDS_ACTION = new Set(['pending', 'confirmed', 'processing', 'return_requested', 'requested', 'received', 'inspected', 'failed']);
