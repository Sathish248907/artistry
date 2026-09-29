import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import PageBanner from '../components/common/PageBanner';
import ProductGrid from '../components/product/ProductGrid';
import FilterSidebar, { FILTER_GROUPS } from '../components/product/FilterSidebar';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { PRODUCTS, SORTS } from '../data/products';
import { categoryBySlug, COLLECTIONS } from '../data/categories';
import { FILTER_KEYS, activeFilterCount, applyFilters, readFilters } from '../utils/filters';
import { classNames } from '../utils/format';

function headingFor(f) {
  if (f.q) return { title: `Results for “${f.q}”`, copy: 'Hallmarked gold pieces matching your search.' };
  if (f.category.length === 1) {
    const c = categoryBySlug(f.category[0]);
    if (c) return { title: c.name, copy: `${c.blurb}. Every piece BIS hallmarked and priced live to today’s gold rate.` };
  }
  if (f.collection.length === 1) {
    if (f.collection[0] === 'offers') return { title: 'Offers', copy: 'Up to 25% off making charges on selected designs — gold value always at today’s rate.' };
    const c = COLLECTIONS.find((x) => x.slug === f.collection[0]);
    if (c) return { title: c.name, copy: c.copy };
  }
  if (f.occasion.length === 1) return { title: `${f.occasion[0][0].toUpperCase()}${f.occasion[0].slice(1)} Jewellery`, copy: 'Curated gold for the moment that matters.' };
  return { title: 'All Gold Jewellery', copy: 'Explore hallmarked 22K and 18K gold — rings, earrings, necklaces, bangles and more.' };
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const filters = useMemo(() => readFilters(params), [params]);
  const results = useMemo(() => applyFilters(PRODUCTS, filters), [filters]);
  const count = activeFilterCount(filters);
  const head = headingFor(filters);

  const update = (mutate) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next, { replace: true });
  };

  const toggle = (key, id) =>
    update((next) => {
      const cur = next.get(key)?.split(',').filter(Boolean) || [];
      const vals = cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id];
      if (vals.length) next.set(key, vals.join(','));
      else next.delete(key);
    });

  const clearAll = () =>
    update((next) => {
      FILTER_KEYS.forEach((k) => next.delete(k));
      next.delete('q');
    });

  const chips = FILTER_GROUPS.flatMap((g) => filters[g.key].map((id) => ({ key: g.key, id, label: g.options.find((o) => o.id === id)?.label || id })));

  return (
    <>
      <PageBanner image="pageBanner_products" eyebrow={`${results.length} designs`} title={head.title} copy={head.copy} crumbs={filters.category.length === 1 ? [['Jewellery', '/products'], [categoryBySlug(filters.category[0])?.name || 'Category']] : [['Jewellery']]} />

      <section className="w-full bg-ivory pb-24 pt-8">
        {/* Toolbar */}
        <div className="shell sticky top-[66px] z-30 -mx-0 mb-6 flex items-center justify-between gap-3 border-b border-rose-light/40 bg-ivory/95 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawer(true)} className="chip lg:hidden">
              <SlidersHorizontal size={14} /> Filters {count > 0 && <span className="rounded-full bg-rose px-1.5 text-[10px] text-white">{count}</span>}
            </button>
            <p className="hidden text-sm text-ink-soft sm:block">
              Showing <span className="font-medium text-ink">{results.length}</span> of {PRODUCTS.length} pieces
            </p>
          </div>
          <label className="relative flex items-center gap-2 text-sm">
            <span className="hidden text-ink-soft sm:inline">Sort by</span>
            <select
              value={filters.sort}
              onChange={(e) => update((n) => (e.target.value === 'relevance' ? n.delete('sort') : n.set('sort', e.target.value)))}
              className="appearance-none rounded-full border border-rose-light/70 bg-ivory py-2 pl-4 pr-9 text-sm text-ink focus:border-rose focus:outline-none"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 text-rose" />
          </label>
        </div>

        <div className="shell grid gap-10 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[140px] max-h-[calc(100vh-160px)] overflow-y-auto pr-2">
              <FilterSidebar filters={filters} onToggle={toggle} onClear={clearAll} activeCount={count} />
            </div>
          </aside>

          <div className="min-w-0">
            <AnimatePresence>
              {chips.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 flex flex-wrap items-center gap-2">
                  {filters.q && (
                    <button onClick={() => update((n) => n.delete('q'))} className="chip chip-active">
                      “{filters.q}” <X size={12} />
                    </button>
                  )}
                  {chips.map((c) => (
                    <button key={`${c.key}-${c.id}`} onClick={() => toggle(c.key, c.id)} className="chip chip-active">
                      {c.label} <X size={12} />
                    </button>
                  ))}
                  <button onClick={clearAll} className="px-2 text-[11px] uppercase tracking-[0.16em] text-ink-faint hover:text-rose-deep">
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {results.length ? (
              <ProductGrid products={results} withSidebar />
            ) : (
              <EmptyState
                title={filters.category.length ? 'Made to order for you' : 'No pieces match these filters'}
                copy={filters.category.length ? 'This edit is crafted on request at our karkhana. Share your idea and our designers will send a sketch within 48 hours.' : 'Try removing a filter or two — or let our designers create exactly what you have in mind.'}
                action={{ label: 'Design it custom', to: '/customize' }}
                secondary={{ label: 'Book an appointment', to: '/appointment' }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer (bottom sheet) */}
      <Modal open={drawer} onClose={() => setDrawer(false)} size="md" title="Filters">
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
            <FilterSidebar filters={filters} onToggle={toggle} onClear={clearAll} activeCount={count} />
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-rose-light/60 bg-cream p-4 pb-safe">
            <button onClick={clearAll} className="btn-outline">Clear</button>
            <button onClick={() => setDrawer(false)} className={classNames('btn-primary')}>
              Show {results.length}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
