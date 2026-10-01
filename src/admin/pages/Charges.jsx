import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAdminAuth } from '../AdminAuthContext';
import { api, request } from '../api';
import { Async, Card, Empty, Field, Notice, PageHeader, Pill, Select, Table, dateTime, money, smallButton, useAsync } from '../ui';

const SCOPE_OPTIONS = [['global', 'Every product'], ['category', 'One category'], ['product', 'One product (by SKU)']];
const TYPE_OPTIONS = [['percentage', '% of the gold value'], ['fixed', 'Fixed amount per piece'], ['per_gram', 'Amount per gram']];

const target = (rule) => {
  if (rule.scope === 'global') return 'Every product';
  if (rule.scope === 'category') return `Category · ${rule.category?.name || 'removed'}`;
  return `Product · ${rule.product?.name || 'removed'}${rule.product?.sku ? ` (${rule.product.sku})` : ''}`;
};
const makingValue = (rule) => (rule.chargeType === 'percentage' ? `${rule.value}% of gold value` : rule.chargeType === 'per_gram' ? `${money(rule.value)} per gram` : `${money(rule.value)} per piece`);

/** Shared form: where the rule applies, then its value. Saving the same target again updates the rule. */
function RuleForm({ kind, categories, onSaved }) {
  const { toast } = useUI();
  const making = kind === 'making';
  const [scope, setScope] = useState('global');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [chargeType, setChargeType] = useState('percentage');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const categoryOptions = [['', 'Choose a category'], ...categories.map((c) => [c.id, c.parentCategory ? `${c.parentCategory.name} › ${c.name}` : c.name])];
  const number = Number(value);
  const valid = value !== '' && Number.isFinite(number) && number >= 0 && (making && chargeType !== 'percentage' ? true : number <= 100) && (scope !== 'category' || category) && (scope !== 'product' || sku.trim());

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let product;
      if (scope === 'product') {
        const found = await api(`/inventory/sku/${encodeURIComponent(sku.trim().toUpperCase())}`);
        product = found.inventory.product.id;
      }
      const body = { scope, category: scope === 'category' ? category : undefined, product, ...(making ? { chargeType, value: number } : { percentage: number }) };
      const { data } = await request(`/pricing/${making ? 'making' : 'wastage'}-charges`, { method: 'PUT', body });
      toast({ title: making ? 'Making charge saved' : 'Wastage saved', body: data.repricedProducts ? `${data.repricedProducts} product price${data.repricedProducts === 1 ? '' : 's'} recalculated` : target(data.charge) });
      setValue('');
      onSaved();
    } catch (err) {
      setError(err.status === 404 && scope === 'product' ? { message: `No item has the SKU “${sku.trim().toUpperCase()}”.`, fields: {} } : err);
    } finally {
      setBusy(false);
    }
  };

  const id = (name) => `${kind}-${name}`;
  return (
    <form onSubmit={submit} className="border-b border-rose-light/50 p-5" noValidate>
      {error && <div className="mb-3"><Notice>{error.message}{Object.values(error.fields || {})[0] ? ` — ${Object.values(error.fields)[0]}` : ''}</Notice></div>}
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_8rem_auto]">
        <Field label="Applies to" htmlFor={id('scope')}>
          <Select id={id('scope')} value={scope} onChange={setScope} options={SCOPE_OPTIONS} />
        </Field>
        {scope === 'category' && (
          <Field label="Category" htmlFor={id('category')}>
            <Select id={id('category')} value={category} onChange={setCategory} options={categoryOptions} />
          </Field>
        )}
        {scope === 'product' && (
          <Field label="Product SKU" htmlFor={id('sku')}>
            <input id={id('sku')} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. RG-1" className="input" />
          </Field>
        )}
        {making && (
          <Field label="Charged as" htmlFor={id('type')}>
            <Select id={id('type')} value={chargeType} onChange={setChargeType} options={TYPE_OPTIONS} />
          </Field>
        )}
        <Field label={making ? (chargeType === 'percentage' ? 'Percent' : 'Amount ₹') : 'Wastage %'} htmlFor={id('value')}>
          <input id={id('value')} type="number" inputMode="decimal" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="input" />
        </Field>
        <button className="btn-primary" disabled={busy || !valid}>{busy && <Loader2 size={15} className="animate-spin" />} Save</button>
      </div>
    </form>
  );
}

function SwitchOff({ rule, kind, onSaved }) {
  const { toast } = useUI();
  const [busy, setBusy] = useState(false);
  if (!rule.isActive) return <span className="text-xs text-ink-faint">Save it again to switch on</span>;
  return (
    <button
      type="button"
      disabled={busy}
      className={smallButton}
      onClick={async () => {
        setBusy(true);
        try {
          await request(`/pricing/${kind}-charges/${rule.id}`, { method: 'DELETE' });
          toast({ title: 'Rule switched off', body: target(rule) });
          onSaved();
        } catch (err) {
          toast({ title: 'Could not switch off', body: err.message, tone: 'neutral' });
        } finally {
          setBusy(false);
        }
      }}
    >
      Switch off
    </button>
  );
}

export default function Charges() {
  const { isAdmin } = useAdminAuth();
  const state = useAsync(() => api('/pricing/charges'), []);
  const categories = useAsync(() => api('/categories', { auth: false }), []);
  const categoryList = categories.data?.categories || [];

  const columns = (kind) => [
    { key: 'target', label: 'Applies to', render: (r) => target(r) },
    { key: 'value', label: kind === 'making' ? 'Making charge' : 'Wastage', render: (r) => <span className="font-medium">{kind === 'making' ? makingValue(r) : `${r.percentage}% of gold value`}</span> },
    { key: 'isActive', label: 'Status', render: (r) => <Pill strong={r.isActive}>{r.isActive ? 'Active' : 'Off'}</Pill> },
    { key: 'updatedAt', label: 'Last changed', render: (r) => <span className="whitespace-nowrap text-xs text-ink-soft">{dateTime(r.updatedAt)}{r.updatedBy ? ` · ${r.updatedBy.name}` : ''}</span> },
    ...(isAdmin ? [{ key: 'actions', label: '', render: (r) => <span className="flex justify-end"><SwitchOff rule={r} kind={kind} onSaved={state.reload} /></span> }] : []),
  ];

  return (
    <>
      <PageHeader eyebrow="Pricing" title="Making & wastage charges" description="Rules used when a price is calculated from the gold rate. The most specific rule wins: a product rule, then its subcategory, then its category, then the rule for every product." />
      <div className="space-y-6">
        {!isAdmin && <Notice tone="info">Only admins can change charges. You can view them here.</Notice>}
        <Card title="Making charges" padded={false}>
          {isAdmin && <RuleForm kind="making" categories={categoryList} onSaved={state.reload} />}
          <Async state={state}>
            {(data) => <Table minWidth={720} rowKey={(r) => r.id} rows={data.makingCharges} columns={columns('making')} empty={<Empty title="No making charges yet">Without a rule, the amount typed on the product is used, or nothing.</Empty>} />}
          </Async>
        </Card>
        <Card title="Wastage charges" padded={false}>
          {isAdmin && <RuleForm kind="wastage" categories={categoryList} onSaved={state.reload} />}
          <Async state={state}>
            {(data) => <Table minWidth={720} rowKey={(r) => r.id} rows={data.wastageCharges} columns={columns('wastage')} empty={<Empty title="No wastage charges yet">Without a rule, no wastage is added.</Empty>} />}
          </Async>
        </Card>
      </div>
    </>
  );
}
