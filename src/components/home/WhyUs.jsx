import { motion } from 'framer-motion';
import SectionHeading from '../common/SectionHeading';
import { StaggerGroup, fadeUp } from '../common/Reveal';
import Icon from '../common/Icon';
import { WHY_US } from '../../data/content';
import { BRAND } from '../../data/brand';

export default function WhyUs() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-ivory via-cream to-ivory section-y">
      <div className="shell">
        <SectionHeading eyebrow={`The ${BRAND.name} promise`} title={`Why ${BRAND.name}`} copy="Certainty in every gram. Care for every lifetime." align="center" />
        <StaggerGroup className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {WHY_US.map((w) => (
            <motion.div key={w.title} variants={fadeUp} whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-[26px] border border-rose-light/60 bg-ivory/80 p-5 text-center backdrop-blur transition-shadow duration-500 hover:shadow-rose-lg sm:p-8">
              <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-rose via-rose-light to-gold transition-transform duration-500 group-hover:scale-x-100" />
              <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-ivory to-champagne/70 text-rose-deep ring-1 ring-rose-light transition-transform duration-500 group-hover:rotate-[10deg]">
                <Icon name={w.icon} size={26} strokeWidth={1.4} />
              </span>
              <h3 className="mt-5 font-display text-xl leading-tight sm:text-2xl">{w.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft sm:text-sm">{w.copy}</p>
            </motion.div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
