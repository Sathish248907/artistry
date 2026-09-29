import { motion } from 'framer-motion';
import { LogoMark } from './Logo';

export default function Loader({ label = 'Polishing your gold…', full = false }) {
  return (
    <div className={full ? 'flex min-h-[70vh] w-full items-center justify-center bg-ivory' : 'flex w-full items-center justify-center py-20'}>
      <div className="flex flex-col items-center gap-4">
        <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
          <LogoMark size={56} />
        </motion.div>
        <div className="relative h-px w-32 overflow-hidden bg-rose-light/50">
          <motion.span
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-rose to-transparent"
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-[11px] uppercase tracking-luxe text-ink-faint">{label}</p>
      </div>
    </div>
  );
}
