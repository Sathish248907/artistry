import { motion } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export const stagger = (step = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

/** Scroll-triggered reveal. Children animate once when ~15% visible. */
export default function Reveal({ as = 'div', children, className, delay = 0, y = 28, amount = 0.15, ...rest }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.85, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}

/** Staggered grid container — pair with <motion.div variants={fadeUp}> children. */
export function StaggerGroup({ as = 'div', children, className, step = 0.07, amount = 0.1 }) {
  const M = motion[as];
  return (
    <M className={className} variants={stagger(step)} initial="hidden" whileInView="show" viewport={{ once: true, amount }}>
      {children}
    </M>
  );
}
