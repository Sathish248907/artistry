import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { classNames } from '../../utils/format';
import { useAdminAuth } from '../AdminAuthContext';
import { api, request } from '../api';
import { Card, Empty, Field, Notice, PageHeader, Pill, Select, money, smallButton, useAsync } from '../ui';

const TYPE_OPTIONS = [['percentage', '% of the gold value'], ['fixed', 'Fixed amount'], ['per_gram', 'Amount per gram']];
const number = (text) => (text === '' ? undefined : Number(text));

/** The price, line by line, exactly as the backend worked it out. */
function Breakdown({ result }) {
  const { price, product, variant } = result;
  const makingNote = price.makingCharges.type === 'percentage' ? `${price.makingCharges.value}% of gold value` : price.makingCharges.type === 'per_gram' ? `${money(price.makingCharges.value)} × ${price.goldWeight} g` : 'Fixed amount';
  const rows = [
    ['Gold value', `${money(price.ratePerGram)} × ${price.goldWeight} g · ${price.purity}`, price.goldValue],
    ['Making charges', `${makingNote}${price.makingCharges.source ? ` · ${price.makingCharges.source}` : ''}`, price.makingCharges.amount],
    ['Wastage', `${price.wastage.percentage}% of gold value${price.wastage.source ? ` · ${price.wastage.source}` : ''}`, price.wastage.amount],
    ['Stone / diamond charges', '', price.stoneCharges],
    ['Other charges', '', price.otherCharges],
  ];
  return (
    <div>
      {product && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{product.name}{variant ? ` · ${variant.name || variant.sku}` : ''}</p>
            <p className="text-xs text-ink-faint">{variant ? variant.sku : product.sku} · listed at {money(product.listedPrice)}</p>
          </div>
          <Pill strong={product.pricingMode === 'dynamic'}>{product.pricingMode === 'dynamic' ? 'Follows the gold rate' : 'Fixed price'}</Pill>
        </div>
      )}
      <dl className="divide-y divide-rose-light/40">
        {rows.map(([label, note, amount]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="min-w-0">
              <span className="block text-sm text-ink">{label}</span>
              {note && <span className="block text-xs text-ink-faint">{note}</span>}
            </dt>
            <dd className="shrink-0 text-sm tabular-nums text-ink">{money(amount)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-sm text-ink-soft">Subtotal</dt>
          <dd className="text-sm tabular-nums text-ink">{money(price.subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-sm text-ink">GST <span className="text-xs text-ink-faint">{price.tax.percentage}%</span></dt>
          <dd className="text-sm tabular-nums text-ink">{money(price.tax.amount)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm font-medium uppercase tracking-[0.14em] text-ink">Final price</dt>
          <dd className="font-sans text-2xl font-semibold tabular-nums text-ink" data-testid="final-price">{money(price.finalPrice)}</dd>
        </div>
        {price.quantity > 1 && (
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-sm text-ink-soft">Total for {price.quantity}</dt>
            <dd className="text-sm font-semibold tabular-nums text-ink">{money(price.totalPrice)}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-xs text-ink-faint">Rate used: {price.rateSource || 'current gold rate'}{price.rateEffectiveFrom ? `, effective ${new Date(price.rateEffectiveFrom).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}.</p>
    </div>
  );
}

export default function PriceCalculator() {
  const { isAdmin } = useAdminAuth();
  const { toast } = useUI();
  const rates = useAsync(() => api('/gold-rates/current', { auth: false }), []);
  const [mode, setMode] = useState('custom'); // custom | item
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({ purity: '22K', goldWeight: '', ratePerGram: '', makingChargeType: 'percentage', makingChargeValue: '', wastagePercentage: '', stoneCharges: '', otherCharges: '', gstPercentage: '3', quantity: '1', sku: '' });
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: typeof value === 'string' ? value : value.target.value }));

  const rateList = rates.data?.rates || [];
  const purityOptions = (rateList.length ? rateList.map((r) => r.purity) : ['24K', '22K', '18K', '14K']).map((p) => [p, p]);
  const currentRate = rateList.find((r) => r.purity === form.purity);

  const calculate = async (event) => {
    event?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body =
        mode === 'item'
          ? { sku: form.sku.trim().toUpperCase(), quantity: number(form.quantity) }
          : {
              purity: form.purity,
              goldWeight: number(form.goldWeight),
              ratePerGram: number(form.ratePerGram),
              makingChargeType: form.makingChargeType,
              makingChargeValue: number(form.makingChargeValue),
              wastagePercentage: number(form.wastagePercentage),
              stoneCharges: number(form.stoneCharges),
              otherCharges: number(form.otherCharges),
              gstPercentage: number(form.gstPercentage),
              quantity: number(form.quantity),
            };
      setResult(await api('/pricing/calculate', { method: 'POST', body, auth: false }));
    } catch (err) {
      setResult(null);
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const setPricingMode = async (pricingMode) => {
    setBusy(true);
    try {
      const { message } = await request(`/pricing/products/${result.product.id}`, { method: 'PUT', body: { pricingMode } });
      toast({ title: message, body: result.product.name });
      await calculate();
    } catch (err) {
      toast({ title: 'Could not change pricing', body: err.message, tone: 'neutral' });
      setBusy(false);
    }
  };

  const fieldError = (name) => error?.fields?.[name];
  const canCalculate = mode === 'item' ? form.sku.trim().length > 1 : form.goldWeight !== '' && Number(form.goldWeight) > 0;

  return (
    <>
      <PageHeader eyebrow="Pricing" title="Jewellery price calculator" description="Gold value = gold rate × net gold weight. The final price adds making, wastage, stone and other charges, then tax." />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Figures">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="What to price">
            {[['custom', 'Type the figures'], ['item', 'A catalogue item (SKU)']].map(([key, label]) => (
              <button key={key} type="button" role="radio" aria-checked={mode === key} onClick={() => { setMode(key); setError(null); setResult(null); }} className={classNames('chip', mode === key && 'chip-active')}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={calculate} className="mt-5" noValidate>
            {error && !Object.keys(error.fields || {}).length && <div className="mb-4"><Notice>{error.message}</Notice></div>}

            {mode === 'item' ? (
              <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                <Field label="SKU" htmlFor="calc-sku" error={fieldError('sku')} hint="A product or a variant. Its own weight, purity and charge rules are used.">
                  <input id="calc-sku" value={form.sku} onChange={set('sku')} placeholder="e.g. RG-1" className="input" autoComplete="off" />
                </Field>
                <Field label="Quantity" htmlFor="calc-qty-item" error={fieldError('quantity')}>
                  <input id="calc-qty-item" type="number" min="1" step="1" value={form.quantity} onChange={set('quantity')} className="input" />
                </Field>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Gold purity" htmlFor="calc-purity" error={fieldError('purity')}>
                  <Select id="calc-purity" value={form.purity} onChange={set('purity')} options={purityOptions} />
                </Field>
                <Field label="Net gold weight (g)" htmlFor="calc-weight" error={fieldError('goldWeight')}>
                  <input id="calc-weight" type="number" inputMode="decimal" min="0" step="0.001" value={form.goldWeight} onChange={set('goldWeight')} className="input" required />
                </Field>
                <Field label="Gold rate ₹ per gram" htmlFor="calc-rate" error={fieldError('ratePerGram')} hint={currentRate ? `Leave empty to use today’s ${form.purity} rate, ${money(currentRate.ratePerGram)}` : `No ${form.purity} rate is set — type one`} className="sm:col-span-2">
                  <input id="calc-rate" type="number" inputMode="decimal" min="0" step="0.01" value={form.ratePerGram} onChange={set('ratePerGram')} placeholder={currentRate ? String(currentRate.ratePerGram) : ''} className="input" />
                </Field>
                <Field label="Making charge" htmlFor="calc-making-type">
                  <Select id="calc-making-type" value={form.makingChargeType} onChange={set('makingChargeType')} options={TYPE_OPTIONS} />
                </Field>
                <Field label={form.makingChargeType === 'percentage' ? 'Making %' : 'Making ₹'} htmlFor="calc-making" error={fieldError('makingChargeValue')}>
                  <input id="calc-making" type="number" inputMode="decimal" min="0" step="0.01" value={form.makingChargeValue} onChange={set('makingChargeValue')} placeholder="0" className="input" />
                </Field>
                <Field label="Wastage %" htmlFor="calc-wastage" error={fieldError('wastagePercentage')}>
                  <input id="calc-wastage" type="number" inputMode="decimal" min="0" max="100" step="0.01" value={form.wastagePercentage} onChange={set('wastagePercentage')} placeholder="0" className="input" />
                </Field>
                <Field label="GST %" htmlFor="calc-gst" error={fieldError('gstPercentage')}>
                  <input id="calc-gst" type="number" inputMode="decimal" min="0" max="100" step="0.01" value={form.gstPercentage} onChange={set('gstPercentage')} className="input" />
                </Field>
                <Field label="Stone / diamond charges ₹" htmlFor="calc-stone" error={fieldError('stoneCharges')}>
                  <input id="calc-stone" type="number" inputMode="decimal" min="0" step="0.01" value={form.stoneCharges} onChange={set('stoneCharges')} placeholder="0" className="input" />
                </Field>
                <Field label="Other charges ₹" htmlFor="calc-other" error={fieldError('otherCharges')}>
                  <input id="calc-other" type="number" inputMode="decimal" min="0" step="0.01" value={form.otherCharges} onChange={set('otherCharges')} placeholder="0" className="input" />
                </Field>
                <Field label="Quantity" htmlFor="calc-qty" error={fieldError('quantity')}>
                  <input id="calc-qty" type="number" min="1" step="1" value={form.quantity} onChange={set('quantity')} className="input" />
                </Field>
              </div>
            )}

            <button className="btn-primary mt-5" disabled={busy || !canCalculate}>
              {busy && <Loader2 size={15} className="animate-spin" />} Calculate
            </button>
          </form>
        </Card>

        <Card title="Price breakdown">
          {result ? (
            <>
              <Breakdown result={result} />
              {isAdmin && result.product && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-rose-light/50 pt-4">
                  <p className="min-w-0 flex-1 text-xs text-ink-soft">
                    {result.product.pricingMode === 'dynamic' ? 'This product’s listed price is recalculated whenever the gold rate or a charge rule changes.' : 'This product has a fixed listed price. It can follow the gold rate instead.'}
                  </p>
                  <button type="button" disabled={busy} onClick={() => setPricingMode(result.product.pricingMode === 'dynamic' ? 'fixed' : 'dynamic')} className={smallButton}>
                    {result.product.pricingMode === 'dynamic' ? 'Use a fixed price' : 'Follow the gold rate'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <Empty title="No calculation yet">Fill in the figures and press Calculate.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
