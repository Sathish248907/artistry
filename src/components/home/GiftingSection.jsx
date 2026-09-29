import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Gift } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Reveal, { StaggerGroup, fadeUp } from '../common/Reveal';
import { GIFT_CATEGORIES } from '../../data/categories';

export default function GiftingSection() {
  return (
    <section className="w-full bg-ivory">
      {/* Full-bleed hero band */}
      <div className="relative h-[64vh] min-h-[460px] w-full overflow-hidden">
        <SmartImage name="gifting" width={2400} className="blend-band absolute inset-0 h-full w-full" position="65% 50%" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/30 to-transparent md:bg-gradient-to-r md:from-ivory/95 md:via-ivory/50 md:to-transparent" />
        <div className="shell relative flex h-full items-end pb-12 md:items-center md:pb-0">
          <Reveal className="max-w-xl">
            <p className="eyebrow flex items-center gap-3">
              <Gift size={14} /> The gifting studio
            </p>
            <h2 className="heading-xl mt-4">Make Every Gift Meaningful</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">Complimentary gift wrapping, handwritten notes and a 30-day exchange promise on every gift.</p>
            <Link to="/gifts" className="btn-primary mt-8">
              Explore Gifts <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </div>

      <StaggerGroup className="shell grid grid-cols-2 gap-3 pb-16 pt-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-6 lg:pb-24">
        {GIFT_CATEGORIES.map((g) => (
          <motion.div key={g.slug} variants={fadeUp}>
            <Link to={`/gifts?for=${g.slug}`} className="group relative block overflow-hidden rounded-[24px] border border-rose-light/50 bg-ivory transition duration-500 hover:border-rose hover:shadow-rose-lg">
              <SmartImage name={g.image} width={600} sizes="(min-width:1280px) 16vw, 50vw" zoom className="aspect-[4/5] w-full" />
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-display text-xl">{g.name}</h3>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">{g.budget}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-blush text-rose-deep transition group-hover:bg-rose group-hover:text-white">
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </StaggerGroup>
    </section>
  );
}
