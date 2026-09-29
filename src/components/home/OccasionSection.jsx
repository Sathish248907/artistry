import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import SectionHeading from '../common/SectionHeading';
import { EASE } from '../common/Reveal';
import { OCCASIONS } from '../../data/categories';
import { classNames } from '../../utils/format';

/**
 * Desktop: an expanding accordion of seven full-height panels spanning the viewport.
 * Mobile: a swipeable row of tall cards.
 */
export default function OccasionSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="w-full bg-gradient-to-b from-ivory via-ivory to-cream section-y">
      <div className="shell">
        <SectionHeading eyebrow="Shop by occasion" title="Jewellery for Every Moment" copy="Every milestone deserves its own gold. Choose the moment — we’ll bring the jewellery." align="center" />
      </div>

      {/* Desktop accordion — edge to edge */}
      <div className="hidden h-[620px] w-full gap-2 px-2 lg:flex">
        {OCCASIONS.map((o, i) => {
          const on = active === i;
          return (
            <motion.div
              key={o.slug}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              animate={{ flex: on ? 4.2 : 1 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="relative min-w-0 overflow-hidden rounded-[26px]"
            >
              <Link to={`/products?occasion=${o.slug}`} className="group absolute inset-0 block" aria-label={`Shop ${o.name} jewellery`}>
                <SmartImage name={o.image} width={1400} sizes="45vw" priority className="h-full w-full" imgClassName={classNames('transition-transform duration-[1400ms]', on ? 'scale-100' : 'scale-110')} />
                <div className={classNames('absolute inset-0 transition-all duration-700', on ? 'bg-gradient-to-t from-ivory via-ivory/20 to-transparent' : 'bg-ivory/30')} />
                {!on && (
                  <span className="absolute bottom-8 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap rounded-full bg-ivory/85 px-2 py-4 font-display text-xl text-ink [writing-mode:vertical-rl]">
                    {o.name}
                  </span>
                )}
                <AnimatePresence>
                  {on && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.6, ease: EASE } }} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="absolute inset-x-0 bottom-0 p-8">
                      <p className="eyebrow">{String(i + 1).padStart(2, '0')} / {String(OCCASIONS.length).padStart(2, '0')}</p>
                      <h3 className="mt-2 font-display text-5xl text-ink">{o.name}</h3>
                      <p className="mt-2 text-sm text-ink-soft">{o.copy}</p>
                      <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-ivory/90 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-rose-deep shadow-soft transition group-hover:bg-rose-blush">
                        Shop {o.name} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile / tablet swipe row */}
      <div className="no-scrollbar snap-x-mandatory flex w-full gap-3 overflow-x-auto px-4 pb-2 sm:px-6 lg:hidden">
        {OCCASIONS.map((o) => (
          <Link key={o.slug} to={`/products?occasion=${o.slug}`} className="group relative h-[440px] w-[70vw] shrink-0 snap-start overflow-hidden rounded-[24px] sm:w-[44vw]">
            <SmartImage name={o.image} width={800} sizes="70vw" className="h-full w-full" zoom />
            <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-display text-3xl">{o.name}</h3>
              <p className="text-xs text-ink-soft">{o.copy}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
