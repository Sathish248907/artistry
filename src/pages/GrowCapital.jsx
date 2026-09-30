import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Coins, ExternalLink, Headphones, LineChart, Repeat, ShieldCheck, Truck } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import SectionHeading from '../components/common/SectionHeading';
import Reveal, { EASE, StaggerGroup, fadeUp } from '../components/common/Reveal';
import CoinArt from '../components/goldCoins/CoinArt';
import { GROW_CAPITAL as GC } from '../data/growCapital';
import { MEGA_MENU } from '../data/navigation';
import { classNames } from '../utils/format';

const ICONS = { Coins, ShieldCheck, Repeat, LineChart, Truck, Headphones };
const EXTERNAL = { href: GC.url, target: '_blank', rel: 'noopener noreferrer' };
const panel = MEGA_MENU.find((m) => m.id === 'grow-capital')?.panel;

/** Primary call-to-action: always opens growcapital.app in a new tab. */
function ExploreButton({ className, size = 'lg' }) {
  return (
    <a {...EXTERNAL} className={classNames('btn-primary group', size === 'sm' && '!px-5 !py-3', className)} aria-label={`${GC.cta} (opens the Grow Capital website in a new tab)`}>
      {GC.cta} <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}

export default function GrowCapital() {
  const [open, setOpen] = useState(0);

  return (
    <>
      {/* Hero — light, no photograph; coin artwork on the right */}
      <section className="relative w-full overflow-hidden bg-ivory">
        <div className="shell grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }}>
            <Breadcrumbs items={[['Grow Capital']]} />
            <p className="eyebrow mt-8 flex items-center gap-3">
              <span className="h-px w-8 bg-rose/60" /> {GC.name} · Partner platform
            </p>
            <h1 className="heading-xl mt-3">{GC.title}</h1>
            <p className="mt-3 font-display text-2xl italic text-rose-deep">{GC.tagline}</p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">{GC.copy}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ExploreButton />
              <a href="#how-it-works" className="btn-outline">
                How it works
              </a>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint">
              <ExternalLink size={12} /> Opens growcapital.app in a new tab
            </p>
          </motion.div>

          <div className="relative mx-auto h-[300px] w-full max-w-[460px] sm:h-[360px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_55%,rgba(227,190,104,0.28),rgba(232,196,196,0.16)_45%,transparent_75%)]" />
            {[
              { motif: 'mark', size: 200, left: '28%', top: '18%', d: 0 },
              { motif: 'mark', shape: 'bar', size: 130, left: '2%', top: '50%', d: 0.9 },
              { motif: 'lotus', size: 110, left: '66%', top: '58%', d: 1.5 },
            ].map((c, i) => (
              <motion.div
                key={i}
                className="absolute drop-shadow-[0_18px_22px_rgba(140,95,25,0.28)]"
                style={{ left: c.left, top: c.top }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                transition={{ opacity: { duration: 0.7, delay: 0.2 * i }, scale: { duration: 0.7, delay: 0.2 * i }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: c.d } }}
              >
                <CoinArt motif={c.motif} shape={c.shape} size={c.size} weight={c.shape === 'bar' ? 10 : 1} />
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-rose-light/70 bg-ivory px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-rose-deep">
              Real gold · from ₹10
            </motion.div>
          </div>
        </div>
      </section>

      {/* The four themes */}
      <section className="w-full bg-ivory pb-6 pt-4">
        <StaggerGroup className="shell grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(panel?.cards || []).map((c) => (
            <motion.a
              key={c.title}
              variants={fadeUp}
              {...EXTERNAL}
              aria-label={`${c.title} — ${GC.name} (opens in a new tab)`}
              className="group flex h-full flex-col rounded-3xl border border-rose-light/60 bg-ivory p-6 transition-all duration-300 hover:-translate-y-1 hover:border-rose hover:shadow-rose-lg"
            >
              <span className="flex items-center justify-between">
                <span className="font-display text-2xl text-ink transition-colors group-hover:text-rose-deep">{c.title}</span>
                <ExternalLink size={14} className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <span className="mt-2 text-sm leading-relaxed text-ink-soft">{c.copy}</span>
            </motion.a>
          ))}
        </StaggerGroup>
      </section>

      {/* What the platform offers */}
      <section className="w-full bg-ivory section-y">
        <div className="shell">
          <SectionHeading eyebrow="What you get" title="Real gold and silver, owned in grams" copy="Key features of the Grow Capital platform, as described on growcapital.app." />
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GC.facts.map((f) => {
              const I = ICONS[f.icon];
              return (
                <motion.div key={f.title} variants={fadeUp} className="rounded-3xl border border-rose-light/60 bg-ivory p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-blush text-rose">
                    <I size={19} strokeWidth={1.6} />
                  </span>
                  <p className="mt-4 font-display text-2xl">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.copy}</p>
                </motion.div>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="w-full scroll-mt-24 bg-ivory pb-16 lg:pb-24">
        <div className="shell">
          <SectionHeading eyebrow="How it works" title="Four simple steps" align="center" />
          <StaggerGroup className="relative grid gap-6 md:grid-cols-4">
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-6 hidden h-px bg-rose-light md:block" />
            {GC.steps.map(([t, c], i) => (
              <motion.div key={t} variants={fadeUp} className="relative flex flex-col items-center text-center">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-rose bg-ivory font-display text-lg text-rose-deep">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-4 font-display text-2xl">{t}</p>
                <p className="mt-1 max-w-[240px] text-sm leading-relaxed text-ink-soft">{c}</p>
              </motion.div>
            ))}
          </StaggerGroup>
          <Reveal className="mt-10 flex justify-center">
            <ExploreButton />
          </Reveal>
        </div>
      </section>

      {/* Artistry + Grow Capital */}
      <section className="w-full border-y border-rose-light/50 bg-ivory py-14 lg:py-20">
        <div className="shell grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-rose/60" /> Artistry × Grow Capital
            </p>
            <h2 className="heading-lg mt-3">Grow in grams today, wear it as gold tomorrow</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Build your gold gram by gram on Grow Capital, and when you are ready for something to wear, bring gold to any Artistry boutique — we exchange old gold at today’s rate, and every piece we sell is priced transparently to the live board.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ExploreButton />
              <Link to="/gold-rates" className="btn-outline">
                Today’s gold rate
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-rose-light/60 bg-ivory p-2">
            {GC.faqs.map(([q, a], i) => (
              <div key={q} className={classNames('border-rose-light/50', i > 0 && 'border-t')}>
                <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-ink" aria-expanded={open === i}>
                  {q}
                  <ChevronRight size={16} className={classNames('shrink-0 text-rose transition-transform', open === i && 'rotate-90')} />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden px-5 pb-4 text-sm leading-relaxed text-ink-soft">
                      {a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Final CTA + disclaimer */}
      <section className="w-full bg-ivory py-16 lg:py-24">
        <Reveal className="shell flex flex-col items-center text-center">
          <p className="eyebrow">Ready to begin?</p>
          <h2 className="heading-lg mt-3">Visit Grow Capital</h2>
          <p className="mt-3 max-w-lg text-[15px] text-ink-soft">Open an account in minutes and start with as little as ₹10.</p>
          <ExploreButton className="mt-8" />
          <p className="mt-10 max-w-2xl text-[11px] leading-relaxed text-ink-faint">{GC.disclaimer}</p>
        </Reveal>
      </section>
    </>
  );
}
