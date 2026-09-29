import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Reveal from '../common/Reveal';

export default function NewArrivalsBanner() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section ref={ref} className="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-champagne">
      <div className="blend-band absolute inset-0 overflow-hidden">
      <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
        <SmartImage name="newArrivals" width={2400} className="h-full w-full" position="70% 30%" />
      </motion.div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ivory/80 via-ivory/30 via-40% to-transparent to-75% md:bg-gradient-to-r md:from-ivory/75 md:via-ivory/25 md:via-35% md:to-transparent md:to-60%" />
      <div className="shell relative flex h-full items-end pb-20 md:items-center md:pb-0">
        <Reveal className="max-w-xl">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-rose" /> Just landed · Autumn 2026
          </p>
          <h2 className="heading-xl mt-4">New Arrivals</h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">Discover the latest expressions of timeless craftsmanship.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link to="/products?collection=new-arrivals" className="btn-primary">
              Explore New Arrivals <ArrowRight size={15} />
            </Link>
            <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">12 new designs</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
