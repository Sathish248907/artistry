import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { FILTER_OPTIONS, PRODUCTS } from '../../data/products';
import { classNames } from '../../utils/format';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const norm = (opts) => opts.map((o) => (typeof o === 'string' ? { id: o, label: cap(o) } : o));

export const FILTER_GROUPS = [
  { key: 'category', label: 'Category', options: CATEGORIES.map((c) => ({ id: c.slug, label: c.name })) },
  { key: 'price', label: 'Price', options: FILTER_OPTIONS.price },
  { key: 'purity', label: 'Gold Purity', options: norm(FILTER_OPTIONS.purity) },
  { key: 'weight', label: 'Weight', options: FILTER_OPTIONS.weight },
  { key: 'type', label: 'Jewellery Type', options: FILTER_OPTIONS.type },
  { key: 'occasion', label: 'Occasion', options: norm(FILTER_OPTIONS.occasion) },
  { key: 'collection', label: 'Collection', options: FILTER_OPTIONS.collection },
  { key: 'gender', label: 'Gender', options: FILTER_OPTIONS.gender },
  { key: 'availability', label: 'Availability', options: FILTER_OPTIONS.availability },
];

// Per-option counts from the full catalogue help shoppers avoid dead ends.
const countFor = (key, id) => {
  switch (key) {
    case 'category':
      return PRODUCTS.filter((p) => p.categories.includes(id)).length;
    case 'occasion':
      return PRODUCTS.filter((p) => p.occasion.includes(id)).length;
    case 'collection':
      return PRODUCTS.filter((p) => p.collection.includes(id)).length;
    case 'purity':
    case 'type':
    case 'gender':
    case 'availability':
      return PRODUCTS.filter((p) => p[key] === id).length;
    default:
      return null;
  }
};

function Group({ group, selected, onToggle, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-rose-light/50 py-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left" aria-expanded={open}>
        <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-ink">
          {group.label}
          {selected.length > 0 && <span className="ml-2 rounded-full bg-rose-blush px-2 py-0.5 text-[10px] text-rose-deep">{selected.length}</span>}
        </span>
        <ChevronDown size={16} className={classNames('text-rose transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="space-y-1 pt-3">
              {group.options.map((o) => {
                const on = selected.includes(o.id);
                const count = countFor(group.key, o.id);
                return (
                  <li key={o.id}>
                    <button onClick={() => onToggle(group.key, o.id)} className="group flex w-full items-center gap-3 rounded-lg py-1.5 text-left text-sm" aria-pressed={on}>
                      <span className={classNames('flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition', on ? 'border-rose bg-rose text-white' : 'border-rose-light bg-ivory group-hover:border-rose')}>
                        {on && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className={classNames('flex-1', on ? 'text-rose-deep' : 'text-ink-soft group-hover:text-ink')}>{o.label}</span>
                      {count !== null && <span className="text-xs text-ink-faint">{count}</span>}
                    </button>
                  </li>
                );
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterSidebar({ filters, onToggle, onClear, activeCount }) {
  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <p className="font-display text-2xl">Refine</p>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-[11px] uppercase tracking-[0.18em] text-rose-deep hover:underline">
            Clear all ({activeCount})
          </button>
        )}
      </div>
      {FILTER_GROUPS.map((g, i) => (
        <Group key={g.key} group={g} selected={filters[g.key]} onToggle={onToggle} defaultOpen={i < 4 || filters[g.key].length > 0} />
      ))}
    </div>
  );
}
