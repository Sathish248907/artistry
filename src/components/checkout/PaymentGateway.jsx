import { useCallback, useRef, useState } from 'react';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import Modal from '../common/Modal';
import { shopApi } from '../../admin/api';
import { formatINR } from '../../utils/format';

/**
 * Paying for an order.
 *
 *   1. POST /payments/create — the backend opens a gateway order and returns what the browser needs.
 *   2. The gateway's own window takes the payment:
 *        mock      — a simulated bank page (development and demos)
 *        razorpay  — Razorpay Checkout
 *   3. The gateway's reply goes to POST /payments/verify. Only the backend decides whether it is paid.
 *
 * pay(orderId) resolves with { status: 'paid' | 'failed' | 'cancelled', order?, message }.
 */

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'));
    document.body.appendChild(script);
  });

function MockGatewayWindow({ session, onResult }) {
  const [busy, setBusy] = useState(null);
  if (!session) return null;

  const complete = async (outcome) => {
    setBusy(outcome);
    try {
      const data = await shopApi('/payments/mock/complete', { method: 'POST', body: { paymentId: session.paymentId, outcome } });
      onResult({ status: 'paid', order: data.order, message: 'Payment successful' });
    } catch (error) {
      // A declined simulated payment answers 402
      onResult({ status: error.status === 402 ? 'failed' : 'error', message: error.status === 402 ? 'The payment was declined. You can try again.' : error.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal open onClose={() => !busy && onResult({ status: 'cancelled', message: 'Payment cancelled' })} title="Simulated payment" size="sm">
      <div className="p-6 sm:p-8">
        <p className="eyebrow flex items-center gap-2"><Lock size={12} /> Test payment gateway</p>
        <h2 className="mt-2 font-display text-3xl">Pay {formatINR(session.amount)}</h2>
        <p className="mt-1 text-sm text-ink-soft">Order {session.orderNumber}</p>
        <p className="mt-4 rounded-xl bg-rose-blush/60 px-4 py-3 text-xs text-ink-soft">
          This is a simulated gateway for development. No money moves. In a live shop this window is the payment provider’s own page.
        </p>
        <div className="mt-6 grid gap-3">
          <button type="button" onClick={() => complete('success')} disabled={Boolean(busy)} className="btn-primary w-full">
            {busy === 'success' && <Loader2 size={15} className="animate-spin" />} Pay {formatINR(session.amount)}
          </button>
          <button type="button" onClick={() => complete('failure')} disabled={Boolean(busy)} className="btn-outline w-full">
            {busy === 'failure' && <Loader2 size={15} className="animate-spin" />} Simulate a declined payment
          </button>
          <button type="button" onClick={() => onResult({ status: 'cancelled', message: 'Payment cancelled' })} disabled={Boolean(busy)} className="text-xs text-ink-soft hover:underline">
            Cancel
          </button>
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-ink-faint"><ShieldCheck size={12} /> Verified by the Artistry server, never by this page</p>
      </div>
    </Modal>
  );
}

export function usePayOrder() {
  const [session, setSession] = useState(null);
  const resolver = useRef(null);

  const finish = useCallback((result) => {
    setSession(null);
    if (resolver.current) resolver.current(result);
    resolver.current = null;
  }, []);

  const pay = useCallback(async (orderId) => {
    const { checkout } = await shopApi('/payments/create', { method: 'POST', body: { orderId } });

    if (checkout.gateway === 'mock') {
      return new Promise((resolve) => {
        resolver.current = resolve;
        setSession(checkout);
      });
    }

    if (checkout.gateway === 'razorpay') {
      const Razorpay = await loadRazorpay();
      return new Promise((resolve) => {
        const rz = new Razorpay({
          key: checkout.keyId,
          order_id: checkout.gatewayOrderId,
          amount: Math.round(checkout.amount * 100),
          currency: checkout.currency,
          name: 'Artistry',
          description: `Order ${checkout.orderNumber}`,
          prefill: { name: checkout.customer.name, email: checkout.customer.email, contact: checkout.customer.phone },
          theme: { color: '#B76E79' },
          handler: async (response) => {
            try {
              const data = await shopApi('/payments/verify', {
                method: 'POST',
                body: { paymentId: checkout.paymentId, gatewayOrderId: response.razorpay_order_id, gatewayPaymentId: response.razorpay_payment_id, signature: response.razorpay_signature },
              });
              resolve({ status: 'paid', order: data.order, message: 'Payment successful' });
            } catch (error) {
              resolve({ status: 'failed', message: error.message });
            }
          },
          modal: { ondismiss: () => resolve({ status: 'cancelled', message: 'Payment cancelled' }) },
        });
        rz.on('payment.failed', (event) => resolve({ status: 'failed', message: event.error?.description || 'The payment failed' }));
        rz.open();
      });
    }
    throw new Error(`Unsupported payment gateway: ${checkout.gateway}`);
  }, []);

  return { pay, gatewayWindow: <MockGatewayWindow session={session} onResult={finish} /> };
}
