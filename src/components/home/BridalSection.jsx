import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Reveal, { StaggerGroup, fadeUp } from '../common/Reveal';
import { BRIDAL_EDIT } from '../../data/home';

export default function BridalSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);
  const accentY = useTransform(scrollYProgress, [0, 1], ['12%', '-12%']);

  return (
    <section ref={ref} className="relative z-10 -mt-24 w-full overflow-hidden lg:-mt-32">
      <div className="grid w-full lg:grid-cols-[1.25fr_1fr]">
        {/* Cinematic bride image bleeding off the left edge */}
        <div className="relative h-[62vh] min-h-[420px] overflow-hidden lg:h-auto lg:min-h-[820px]">
          <div className="blend-split-r absolute inset-0 overflow-hidden">
            <motion.div style={{ scale }} className="absolute inset-0">
            <SmartImage name="bridal" width={2000} sizes="(min-width:1024px) 56vw, 100vw" className="h-full w-full" />
            </motion.div>
          </div>
          <motion.div style={{ y: accentY }} className="absolute bottom-10 right-8 hidden w-[34%] max-w-[260px] overflow-hidden rounded-t-full border-[6px] border-ivory shadow-rose-lg xl:block">
            <SmartImage name="bridalAccent1" width={600} sizes="260px" className="aspect-[3/4] w-full" />
          </motion.div>
        </div>

        <div className="relative flex flex-col justify-center px-4 py-14 sm:px-6 lg:py-20 lg:pl-8 lg:pr-10 xl:pr-14 2xl:pr-20">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-rose" /> The Wedding Edit
            </p>
            <h2 className="mt-4 font-display text-5xl leading-[1.02] sm:text-6xl 2xl:text-7xl">
              Begin Your Forever <span className="italic text-gradient">With Gold</span>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              Heirloom 22K bridal jewellery, hand-finished for every ritual — from haldi to vidaai. Book a private bridal lounge session and design your trousseau with our stylists.
            </p>
          </Reveal>

          <StaggerGroup className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {BRIDAL_EDIT.map((b, i) => (
              <motion.div key={b.name} variants={fadeUp}>
                <Link to={b.to} className="group flex items-center justify-between gap-4 rounded-2xl border border-rose-light/70 bg-ivory/70 px-5 py-4 backdrop-blur transition hover:border-rose hover:bg-rose-blush">
                  <span className="flex items-center gap-4">
                    <span className="font-display text-lg italic text-rose">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="block font-display text-xl text-ink">{b.name}</span>
                      <span className="text-xs text-ink-faint">{b.note}</span>
                    </span>
                  </span>
                  <ArrowUpRight size={17} className="shrink-0 text-rose transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            ))}
          </StaggerGroup>

          <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-5">
            <Link to="/wedding" className="btn-primary">
              Explore Wedding Collection <ArrowRight size={15} />
            </Link>
            <Link to="/appointment" className="btn-ghost text-[12px]">
              Book bridal consultation
            </Link>
          </Reveal>

          <Reveal delay={0.2} className="mt-10 flex items-center gap-4 rounded-2xl border border-rose-light/60 bg-ivory/60 p-3 pr-5 xl:hidden">
            <SmartImage name="bridalAccent1" width={300} sizes="80px" className="h-20 w-20 shrink-0 rounded-xl" />
            <p className="text-sm text-ink-soft">Mehendi-ready bangles and rings, sized in-store at no extra cost.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
