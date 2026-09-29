import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Rating from '../common/Rating';
import SectionHeading from '../common/SectionHeading';
import { EASE } from '../common/Reveal';
import { TESTIMONIALS } from '../../data/content';
import { classNames } from '../../utils/format';

export default function ReviewCarousel() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const n = TESTIMONIALS.length;

  const go = (d) => {
    setDir(d);
    setI((x) => (x + d + n) % n);
  };

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => go(1), 6500);
    return () => clearInterval(t);
  }, [paused, i]);

  const t = TESTIMONIALS[i];

  return (
    <section className="w-full bg-ivory section-y" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="shell">
        <SectionHeading eyebrow="Customer stories" title="Loved Across India" copy="4.8 average from 12,000+ verified reviews." action={{ label: 'Read all reviews', to: '/products?sort=popularity' }} />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-rose-light/60 bg-gradient-to-br from-ivory via-cream to-ivory">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={t.id}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.6, ease: EASE }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => Math.abs(info.offset.x) > 60 && go(info.offset.x < 0 ? 1 : -1)}
                className="grid cursor-grab active:cursor-grabbing md:grid-cols-[0.8fr_1.2fr]"
              >
                <div className="relative h-72 md:h-full md:min-h-[440px]">
                  <SmartImage name={t.image} width={800} sizes="(min-width:768px) 30vw, 100vw" className="absolute inset-0 h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-transparent md:bg-gradient-to-l md:from-ivory" />
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <Quote size={40} className="text-rose-light" strokeWidth={1} />
                  <Rating value={t.rating} size={15} />
                  <p className="mt-5 font-display text-2xl leading-snug text-ink sm:text-[28px]">“{t.review}”</p>
                  <div className="mt-7">
                    <p className="font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-ink-faint">{t.city} · Verified buyer</p>
                    <p className="mt-3 inline-flex rounded-full bg-ivory/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-rose-deep">Purchased: {t.purchase}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3">
            {TESTIMONIALS.map((x, idx) => (
              <button
                key={x.id}
                onClick={() => {
                  setDir(idx > i ? 1 : -1);
                  setI(idx);
                }}
                className={classNames('flex items-center gap-4 rounded-2xl border p-3 text-left transition', idx === i ? 'border-rose bg-rose-blush/70 shadow-rose' : 'border-rose-light/50 bg-ivory hover:bg-rose-blush/30')}
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
                  <span className="absolute inset-0 flex items-center justify-center bg-rose-blush font-display text-lg text-rose-deep">{x.name.charAt(0)}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{x.name}</span>
                  <span className="block truncate text-xs text-ink-faint">{x.purchase}</span>
                </span>
                {idx === i && (
                  <span className="h-1 w-12 overflow-hidden rounded-full bg-ivory">
                    {!paused && <motion.span key={i} className="block h-full bg-rose" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 6.5, ease: 'linear' }} />}
                  </span>
                )}
              </button>
            ))}
            <div className="mt-2 flex gap-2">
              <button onClick={() => go(-1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-light bg-ivory text-rose-deep transition hover:bg-rose hover:text-white" aria-label="Previous review">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => go(1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-light bg-ivory text-rose-deep transition hover:bg-rose hover:text-white" aria-label="Next review">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
