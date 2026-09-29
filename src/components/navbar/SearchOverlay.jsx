import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Search, Sparkles, TrendingUp, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import useDebounce from '../../hooks/useDebounce';
import useLocalStorage from '../../hooks/useLocalStorage';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import { searchEverything } from '../../utils/search';
import { POPULAR_SEARCHES } from '../../data/content';
import { CATEGORIES } from '../../data/categories';
import { PRODUCTS } from '../../data/products';
import SmartImage from '../common/SmartImage';
import { EASE } from '../common/Reveal';
import { formatINR } from '../../utils/format';
import { productPrice } from '../../utils/pricing';

function ProductHit({ p, onPick, i }) {
  return (
    <motion.li initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.35, ease: EASE }}>
      <Link to={`/product/${p.slug}`} onClick={onPick} className="group flex items-center gap-4 rounded-2xl p-2 transition hover:bg-rose-blush/60">
        <SmartImage name={p.image} width={200} sizes="80px" className="h-20 w-20 shrink-0 rounded-xl" zoom />
        <div className="min-w-0">
          <p className="truncate font-display text-lg text-ink group-hover:text-rose-deep">{p.name}</p>
          <p className="text-xs text-ink-faint">
            {p.purity} · {p.weight} g
          </p>
          <p className="mt-0.5 text-sm font-medium text-rose-deep">{formatINR(productPrice(p))}</p>
        </div>
      </Link>
    </motion.li>
  );
}

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useLocalStorage('ph.recentSearches', ['temple necklace', 'gold coin 10g']);
  const debounced = useDebounce(q, 160);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  useLockBodyScroll(searchOpen);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    const onKey = (e) => e.key === 'Escape' && closeSearch();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [searchOpen, closeSearch]);

  const results = useMemo(() => (debounced.trim() ? searchEverything(debounced) : null), [debounced]);
  const suggestions = useMemo(() => [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 4), []);

  const remember = (term) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => [t, ...prev.filter((x) => x !== t)].slice(0, 6));
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    remember(q);
    closeSearch();
    navigate(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  const pick = () => {
    remember(q);
    closeSearch();
  };

  return createPortal(
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[85] flex flex-col bg-ivory/[0.98] backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-ivory to-transparent" />
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="shell relative pt-6 lg:pt-10">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Search the collection</p>
              <button onClick={closeSearch} className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-light/70 bg-ivory text-ink-soft transition hover:rotate-90 hover:text-rose-deep" aria-label="Close search">
                <X size={19} />
              </button>
            </div>
            <form onSubmit={submit} className="mt-6 flex items-center gap-4 border-b-2 border-rose-light pb-4 focus-within:border-rose">
              <Search className="shrink-0 text-rose" size={28} strokeWidth={1.5} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “gold necklace”, “jhumka” or “22K bangles”"
                className="w-full bg-transparent font-display text-3xl text-ink placeholder:text-ink-faint/70 focus:outline-none sm:text-4xl lg:text-5xl"
                aria-label="Search products"
              />
              {q && (
                <button type="button" onClick={() => setQ('')} className="shrink-0 text-xs uppercase tracking-[0.2em] text-ink-faint hover:text-rose-deep">
                  Clear
                </button>
              )}
            </form>
          </motion.div>

          <div className="shell relative mt-8 flex-1 overflow-y-auto pb-24">
            {!results ? (
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr_1.4fr]">
                <div>
                  <p className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                    <Clock size={14} className="text-rose" /> Recent searches
                  </p>
                  {recent.length ? (
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <button key={r} onClick={() => setQ(r)} className="chip">
                          {r}
                        </button>
                      ))}
                      <button onClick={() => setRecent([])} className="px-2 text-[11px] uppercase tracking-[0.18em] text-ink-faint hover:text-rose-deep">
                        Clear all
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-faint">Nothing yet — start typing.</p>
                  )}
                  <p className="mb-4 mt-10 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                    <TrendingUp size={14} className="text-rose" /> Popular searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((r) => (
                      <button key={r} onClick={() => setQ(r)} className="chip">
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">Browse categories</p>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {CATEGORIES.map((c) => (
                      <li key={c.slug}>
                        <Link to={`/products?category=${c.slug}`} onClick={closeSearch} className="font-display text-xl text-ink transition hover:text-rose-deep">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                    <Sparkles size={14} className="text-rose" /> Most loved right now
                  </p>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {suggestions.map((p, i) => (
                      <ProductHit key={p.id} p={p} i={i} onPick={pick} />
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid gap-10 lg:grid-cols-[1fr_2.2fr]">
                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">Categories</p>
                    {results.categories.length ? (
                      <div className="flex flex-wrap gap-2">
                        {results.categories.map((c) => (
                          <Link key={c.slug} to={`/products?category=${c.slug}`} onClick={pick} className="chip">
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-ink-faint">No matching categories</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">Collections</p>
                    {results.collections.length ? (
                      <ul className="space-y-2">
                        {results.collections.map((c) => (
                          <li key={c.to}>
                            <Link to={c.to} onClick={pick} className="font-display text-xl text-ink hover:text-rose-deep">
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-ink-faint">No matching collections</p>
                    )}
                  </div>
                  {recent.length > 0 && (
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                        <Clock size={13} className="text-rose" /> Recent searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button key={r} onClick={() => setQ(r)} className="chip">
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                      <TrendingUp size={13} className="text-rose" /> Popular searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.slice(0, 5).map((r) => (
                        <button key={r} onClick={() => setQ(r)} className="chip">
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
                      Products <span className="text-ink-faint">({results.total})</span>
                    </p>
                    <button onClick={submit} className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-rose-deep">
                      View all <ArrowRight size={13} />
                    </button>
                  </div>
                  {results.products.length ? (
                    <ul className="grid gap-1 sm:grid-cols-2">
                      {results.products.map((p, i) => (
                        <ProductHit key={p.id} p={p} i={i} onPick={pick} />
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-rose-light p-10 text-center">
                      <p className="font-display text-2xl">No pieces match “{debounced}”</p>
                      <p className="mt-2 text-sm text-ink-soft">Try a broader term, or let our designers create it for you.</p>
                      <Link to="/customize" onClick={closeSearch} className="btn-outline mt-6">
                        Design it custom
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
