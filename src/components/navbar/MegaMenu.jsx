import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Icon from '../common/Icon';
import { EASE } from '../common/Reveal';
import { GOLD_RATES } from '../../data/goldRates';
import { formatNumber } from '../../utils/format';

/** External partner panel (Grow Capital): intro + CTA on the left, information cards on the right. */
function ExternalPanel({ menu }) {
  const { panel, href, label } = menu;
  const linkProps = { href, target: '_blank', rel: 'noopener noreferrer' };
  return (
    <div className="shell grid grid-cols-12 gap-10 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="col-span-4 flex flex-col justify-center">
        <p className="eyebrow">{panel.eyebrow}</p>
        <p className="mt-3 font-display text-4xl leading-tight text-ink">{panel.title}</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">{panel.copy}</p>
        <a {...linkProps} className="btn-primary mt-7 self-start" aria-label={`${panel.cta} (opens the Grow Capital website in a new tab)`}>
          {panel.cta} <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </a>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint">
          <ExternalLink size={12} /> Opens growcapital.app in a new tab
        </p>
      </motion.div>
      <ul className="col-span-8 grid grid-cols-2 gap-4" aria-label={`${label} highlights`}>
        {panel.cards.map((c, i) => (
          <motion.li key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.35, ease: EASE }}>
            <a
              {...linkProps}
              className="group flex h-full gap-4 rounded-2xl border border-rose-light/60 bg-ivory p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose hover:shadow-rose-lg"
              aria-label={`${c.title} — ${label} (opens in a new tab)`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-blush text-rose transition-colors duration-300 group-hover:bg-rose group-hover:text-white">
                <Icon name={c.icon} size={19} strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-display text-xl text-ink transition-colors duration-300 group-hover:text-rose-deep">
                  {c.title}
                  <ExternalLink size={13} className="text-ink-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{c.copy}</span>
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

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
        {menu.panel ? (
          <motion.div key={menu.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ExternalPanel menu={menu} />
          </motion.div>
        ) : (
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}
