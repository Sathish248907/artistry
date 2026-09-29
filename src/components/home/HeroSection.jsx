import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BadgeCheck, ChevronDown, Gem, RefreshCcw } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import { EASE } from '../common/Reveal';
import { BRAND } from '../../data/brand';

const line = {
  hidden: { y: '110%' },
  show: (i) => ({ y: 0, transition: { duration: 1.1, ease: EASE, delay: 0.35 + i * 0.14 } }),
};

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-[88svh] min-h-[560px] w-full overflow-hidden bg-cream lg:h-[92vh]">
      {/* Full-bleed photograph: edge to edge, covers the section */}
      <div className="blend-hero absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <motion.div className="h-full w-full" initial={{ scale: 1.14 }} animate={{ scale: 1 }} transition={{ duration: 2.6, ease: EASE }}>
          <SmartImage name="hero" priority width={2400} className="h-[112%] w-full" />
        </motion.div>
      </motion.div>
      </div>

      {/* Soft ivory/rose veil for legibility — never dark */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ivory via-ivory/80 via-45% to-transparent to-80% md:bg-gradient-to-r md:from-ivory/95 md:via-ivory/45 md:via-30% md:to-transparent md:to-60%" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ivory to-transparent" />

      <motion.div style={{ y: textY, opacity: fade }} className="shell relative z-10 flex h-full flex-col justify-end pb-24 md:justify-center md:pb-0">
        <div className="max-w-4xl">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} className="eyebrow flex items-center gap-3">
            <span className="h-px w-10 bg-rose" /> BIS Hallmarked · Since {BRAND.since}
          </motion.p>
          <h1 className="mt-5 font-display md:max-w-[52vw] lg:max-w-[44vw] text-[44px] font-medium leading-[1.02] text-ink sm:text-6xl lg:text-7xl xl:text-[84px] 2xl:text-[96px]">
            {BRAND.heroLines.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-1">
                <motion.span custom={i} variants={line} initial="hidden" animate="show" className={i === 1 ? 'block italic text-gradient' : 'block'}>
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8, ease: EASE }} className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-soft sm:text-base">
            Discover exquisite gold jewellery crafted to celebrate life’s most precious moments.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1, ease: EASE }} className="mt-9 flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary group">
              <span>Shop Gold</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link to="/collections" className="btn-outline">
              Explore Collection
            </Link>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.3 }} className="mt-10 hidden flex-wrap gap-x-8 gap-y-3 text-xs text-ink-soft sm:flex">
            {[
              [BadgeCheck, 'HUID hallmarked gold'],
              [RefreshCcw, 'Lifetime exchange'],
              [Gem, 'Handcrafted by karigars'],
            ].map(([I, t]) => (
              <li key={t} className="flex items-center gap-2">
                <I size={15} className="text-rose" /> {t}
              </li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      <motion.a
        href="#gold-rate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-luxe text-rose-deep"
        aria-label="Scroll to content"
      >
        Scroll
        <span className="flex h-10 w-6 justify-center rounded-full border border-rose/50 pt-2">
          <motion.span animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={12} />
          </motion.span>
        </span>
      </motion.a>
    </section>
  );
}
