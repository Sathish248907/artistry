import { motion } from 'framer-motion';
import SmartImage from './SmartImage';
import Breadcrumbs from './Breadcrumbs';
import { EASE } from './Reveal';

/**
 * Full-bleed page header: photo on the right, copy on the left.
 * By default the photo is rose-gold graded and feathered into the page; `tone={false}` keeps its
 * original colours and `blend={false}` keeps crisp edges (used on the Wedding page).
 */
export default function PageBanner({ image, eyebrow, title, copy, crumbs = [], children, tone = true, blend = true }) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-cream via-ivory to-ivory">
      <div className="grid w-full lg:grid-cols-[1.05fr_1fr]">
        <div className="shell relative z-10 flex flex-col justify-center py-12 lg:py-20">
          <Breadcrumbs items={crumbs} />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }}>
            {eyebrow && <p className="eyebrow mt-8">{eyebrow}</p>}
            <h1 className="heading-xl mt-3">{title}</h1>
            {copy && <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">{copy}</p>}
            {children && <div className="mt-8">{children}</div>}
          </motion.div>
        </div>
        <div className="relative h-56 sm:h-72 lg:h-auto lg:min-h-[440px]">
          <div className={`${blend ? 'blend-all ' : ''}absolute inset-0 overflow-hidden`}>
            <motion.div className="absolute inset-0" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: EASE }}>
              <SmartImage name={image} tone={tone} priority sizes="(min-width:1024px) 50vw, 100vw" className="h-full w-full" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
