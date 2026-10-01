import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { classNames } from '../utils/format';

/* ------------------------------------------------------------------ data */

/**
 * Load data and keep it fresh. While reloading, the previous data stays on screen (`loading` is true),
 * so tables hold their frame instead of flashing.
 */
export function useAsync(load, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const run = useRef(0);

  const reload = useCallback(() => {
    const id = (run.current += 1);
    setState((s) => ({ ...s, loading: true }));
    load()
      .then((data) => id === run.current && setState({ data, error: null, loading: false }))
      .catch((error) => id === run.current && setState((s) => ({ data: s.data, error, loading: false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}

/* ---------------------------------------------------------------- format */

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const money = (value) => inr.format(Number(value) || 0);
export const moneyCompact = (value) => `₹${compact.format(Number(value) || 0)}`;
export const count = (value) => whole.format(Number(value) || 0);
export const signed = (value) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${whole.format(Math.abs(Number(value) || 0))}`;
export const dateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
export const dateOnly = (value) => (value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export const STOCK_STATUS = {
  in_stock: { label: 'In stock', color: '#D29CA1' },
  low_stock: { label: 'Low stock', color: '#B76E79' },
  out_of_stock: { label: 'Out of stock', color: '#7A3F4A' },
};

export const MOVEMENT_LABEL = {
  initial: 'Opening stock',
  stock_in: 'Stock in',
  stock_out: 'Stock out',
  adjustment: 'Adjustment',
  reserve: 'Reserved for order',
  release: 'Reservation released',
  sale: 'Sold',
  cancel_restore: 'Order cancelled',
  return: 'Return',
};

/* ------------------------------------------------------------- building blocks */

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className, padded = true }) {
  return (
    <section className={classNames('card min-w-0', className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-light/50 px-5 py-3.5">
          <h2 className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft">{title}</h2>
          {action}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

/** A headline number. The value uses the UI sans face so figures read cleanly at size. */
export function StatTile({ label, value, hint, icon: Icon }) {
  return (
    <div className="card flex min-w-0 items-start gap-3 p-4 sm:p-5">
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-blush text-rose">
          <Icon size={16} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
        <p className="mt-1 truncate font-sans text-2xl font-semibold text-ink">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
      </div>
    </div>
  );
}

/** Status is always written out; the dot only repeats it. */
export function StockBadge({ status }) {
  const meta = STOCK_STATUS[status] || STOCK_STATUS.in_stock;
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium',
        status === 'out_of_stock' ? 'border-rose-deep bg-rose-deep text-white' : status === 'low_stock' ? 'border-rose text-rose-deep' : 'border-rose-light text-ink-soft',
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: status === 'out_of_stock' ? '#fff' : meta.color }} />
      {meta.label}
    </span>
  );
}

export function Pill({ children, strong = false }) {
  return (
    <span className={classNames('inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium', strong ? 'border-rose text-rose-deep' : 'border-rose-light text-ink-soft')}>
      {children}
    </span>
  );
}

export function Notice({ tone = 'error', children }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className="flex items-start gap-2.5 rounded-xl border border-rose-light bg-rose-blush/60 px-4 py-3 text-sm text-ink">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-deep" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-ink-soft" role="status">
      <Loader2 size={16} className="animate-spin text-rose" /> {label}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{children}</p>}
    </div>
  );
}

/** Wraps the three states every data view has. Keeps old content visible (dimmed) while it reloads. */
export function Async({ state, children, empty }) {
  if (state.error && !state.data) return <div className="p-5"><Notice>{state.error.message}</Notice></div>;
  if (!state.data) return <Spinner />;
  return (
    <div className={classNames('transition-opacity', state.loading && 'opacity-60')} aria-busy={state.loading}>
      {state.error && <div className="p-5 pb-0"><Notice>{state.error.message}</Notice></div>}
      {empty ? empty : children(state.data)}
    </div>
  );
}

/* ----------------------------------------------------------------- table */

/** Horizontal scroll lives inside the card, so the page itself never scrolls sideways on a phone. */
export function Table({ columns, rows, rowKey, minWidth = 720, empty }) {
  if (!rows.length) return empty || <Empty title="Nothing to show" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-rose-light/60">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={classNames('whitespace-nowrap px-4 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint', col.align === 'right' && 'text-right')}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey ? rowKey(row) : index} className="border-b border-rose-light/30 last:border-0 hover:bg-rose-blush/30">
              {columns.map((col) => (
                <td key={col.key} className={classNames('px-4 py-3 align-middle text-ink', col.align === 'right' && 'text-right tabular-nums', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) {
    return pagination ? <p className="px-5 py-3 text-xs text-ink-faint">{count(pagination.total)} record{pagination.total === 1 ? '' : 's'}</p> : null;
  }
  const { page, totalPages, total, limit } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rose-light/50 px-5 py-3">
      <p className="text-xs text-ink-faint">{count(from)}–{count(to)} of {count(total)}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className="chip disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft size={14} /> Prev
        </button>
        <span className="text-xs text-ink-soft">Page {page} of {totalPages}</span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="chip disabled:opacity-40" aria-label="Next page">
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ forms */

export function Field({ label, htmlFor, error, hint, children, className }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-rose-deep" role="alert">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}

export function Select({ id, value, onChange, options, className, ...rest }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={classNames('input appearance-none pr-8', className)} {...rest}>
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>{optionLabel}</option>
      ))}
    </select>
  );
}

/** Filters always sit in one row above the content they scope. */
export function FilterBar({ children }) {
  return <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">{children}</div>;
}

export const smallButton = 'inline-flex items-center gap-1.5 rounded-full border border-rose/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-rose-deep transition hover:bg-rose hover:text-white disabled:cursor-not-allowed disabled:opacity-50';
