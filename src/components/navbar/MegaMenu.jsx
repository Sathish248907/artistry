import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import { EASE } from '../common/Reveal';
import { GOLD_RATES } from '../../data/goldRates';
import { formatNumber } from '../../utils/format';

export default function MegaMenu({ menu, onEnter, onLeave }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
      transition={{ duration: 0.35, ease: EASE }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full hidden w-full border-t border-rose-light/40 bg-gradient-to-b from-ivory to-cream shadow-[0_30px_60px_-30px_rgba(183,110,121,0.5)] xl:block"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={menu.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="shell grid grid-cols-12 gap-10 py-10"
        >
          <div className="col-span-8 grid grid-cols-3 gap-10">
            {menu.columns.map((col, ci) => (
              <motion.div key={col.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * ci, duration: 0.4, ease: EASE }}>
                <p className="eyebrow mb-5">{col.title}</p>
                <ul className="space-y-3.5">
                  {col.links.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="group inline-flex items-center gap-2 font-display text-[19px] text-ink transition hover:text-rose-deep">
                        <span className="h-px w-0 bg-rose transition-all duration-300 group-hover:w-4" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="col-span-4 flex gap-5">
            {menu.feature && (
              <Link to={menu.feature.to} className="group relative block h-[300px] flex-1 overflow-hidden rounded-3xl">
                <SmartImage name={menu.feature.image} width={700} sizes="30vw" zoom className="absolute inset-0 h-full w-full" />
                <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-ivory/90 p-4 backdrop-blur">
                  <p className="font-display text-2xl text-ink">{menu.feature.title}</p>
                  <p className="mt-1 text-xs text-ink-soft">{menu.feature.copy}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-rose-deep">
                    Explore <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}
            {menu.id === 'gold' && (
              <div className="flex w-44 flex-col justify-between rounded-3xl border border-rose-light/60 bg-ivory p-5">
                <p className="eyebrow">Live Rate</p>
                {['24K', '22K', '18K'].map((k) => (
                  <div key={k}>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">{k}</p>
                    <p className="font-display text-2xl text-ink">₹{formatNumber(GOLD_RATES.rates[k].per10g / 10)}<span className="text-sm text-ink-faint">/g</span></p>
                  </div>
                ))}
                <Link to="/gold-rates" className="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-deep hover:underline">
                  Full rates →
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
