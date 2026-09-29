import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, PackageCheck, Scale } from 'lucide-react';
import Reveal, { StaggerGroup, fadeUp } from '../common/Reveal';
import CoinArt from './CoinArt';
import { COIN_CATEGORIES, COINS, coinPrice } from '../../data/coins';
import { formatINR } from '../../utils/format';

// Original coin artwork composed on the page colour — real gold, no foreign-mint photography.
const SHOWCASE = [
  { motif: 'diya', size: 128, style: { left: '6%', top: '8%' }, delay: 0.4, rotate: -8 },
  { motif: 'mark', shape: 'bar', size: 170, style: { right: '4%', top: '2%' }, delay: 1.1, rotate: 10 },
  { motif: 'om', size: 158, style: { left: '2%', bottom: '6%' }, delay: 1.8, rotate: 6 },
  { motif: 'mark', size: 122, style: { right: '8%', bottom: '10%' }, delay: 0.9, rotate: -6 },
];

export default function GoldCoinSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-champagne/50 via-cream to-ivory">
      <div className="grid w-full lg:grid-cols-2">
        <div className="relative h-[440px] overflow-hidden sm:h-[520px] lg:h-auto lg:min-h-[640px]">
          {/* Warm gold glow that fades into the page — no hard edges */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_52%,rgba(227,190,104,0.30),rgba(232,196,196,0.18)_45%,transparent_75%)]" />
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 scale-[0.72] sm:scale-[0.88] lg:scale-100">
            {SHOWCASE.map((c, i) => (
              <motion.div
                key={i}
                className="absolute drop-shadow-[0_18px_22px_rgba(140,95,25,0.28)]"
                style={c.style}
                initial={{ opacity: 0, scale: 0.8, rotate: c.rotate * 2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: c.rotate }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}>
                  <CoinArt motif={c.motif} shape={c.shape} size={c.size} weight={c.shape === 'bar' ? 10 : 5} />
                </motion.div>
              </motion.div>
            ))}
            {/* Hero coin */}
            {/* Static wrapper does the centring; Framer Motion owns the transform on the inner layers */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="drop-shadow-[0_30px_36px_rgba(140,95,25,0.38)]"
                animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              >
                <CoinArt motif="lotus" size={300} weight={10} />
              </motion.div>
              <div className="mx-auto mt-4 h-5 w-48 rounded-[50%] bg-[#8A6516]/15 blur-md" />
            </motion.div>
            </div>
          </div>
        </div>

        <div className="shell flex flex-col justify-center py-14 lg:py-20 lg:pl-12">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-rose" /> 24K Gold Coins & Bars
            </p>
            <h2 className="heading-lg mt-3">
              Pure Gold. <span className="italic text-gradient">Precious Gifts.</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              999.9 fine gold, minted and assayed, sealed in tamper-proof packs. The most auspicious way to invest, bless and celebrate.
            </p>
          </Reveal>
          <StaggerGroup className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              [BadgeCheck, 'Purity', '24K · 999.9 fine'],
              [Scale, 'Weights', '1 g to 100 g'],
              [PackageCheck, 'Certification', 'BIS hallmark + assay card'],
            ].map(([I, t, s]) => (
              <motion.div key={t} variants={fadeUp} className="rounded-2xl border border-rose-light/60 bg-ivory/80 p-4">
                <I size={18} className="text-rose" />
                <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-ink-faint">{t}</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{s}</p>
              </motion.div>
            ))}
          </StaggerGroup>
          <Reveal delay={0.1} className="mt-8">
            <Link to="/gold-coins" className="btn-primary">
              Shop Gold Coins <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Category tiles — full width */}
      <StaggerGroup className="shell grid grid-cols-2 gap-3 py-12 sm:gap-4 md:grid-cols-3 xl:grid-cols-6 lg:py-16">
        {COIN_CATEGORIES.map((c, i) => {
          const sample = COINS.find((x) => x.cat === c.slug);
          const minW = Math.min(...COINS.filter((x) => x.cat === c.slug).flatMap((x) => x.weights));
          return (
            <motion.div key={c.slug} variants={fadeUp}>
              <Link to={`/gold-coins?cat=${c.slug}`} className="group relative flex h-full flex-col items-center overflow-hidden rounded-[24px] border border-rose-light/60 bg-ivory p-5 text-center transition duration-500 hover:-translate-y-1 hover:border-rose hover:shadow-rose-lg">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ivory to-transparent" />
                <motion.div className="relative" whileHover={{ rotateY: 180 }} transition={{ duration: 1 }} style={{ transformStyle: 'preserve-3d' }}>
                  <CoinArt motif={c.motif} size={112} weight={minW} shape={i === 0 ? 'round' : undefined} />
                </motion.div>
                <h3 className="relative mt-4 font-display text-xl leading-tight">{c.name}</h3>
                <p className="mt-1 text-xs text-ink-faint">{c.copy}</p>
                <div className="mt-4 w-full space-y-1 border-t border-rose-light/50 pt-3 text-[11px] text-ink-soft">
                  <p className="flex justify-between"><span>Purity</span><span className="text-ink">999.9</span></p>
                  <p className="flex justify-between"><span>From</span><span className="text-ink">{minW} g</span></p>
                  <p className="flex justify-between"><span>Price</span><span className="font-medium text-rose-deep">{formatINR(coinPrice(minW))}</span></p>
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-rose">{sample?.certification.split(' + ')[0]}</p>
              </Link>
            </motion.div>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
