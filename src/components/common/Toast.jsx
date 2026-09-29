import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Heart, Info, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const ICONS = { success: CheckCircle2, love: Heart, neutral: Info };

export default function Toaster() {
  const { toasts, dismissToast } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-auto md:left-auto md:right-6 md:top-24 md:items-end" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.tone] || CheckCircle2;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-rose-light/60 bg-ivory/95 p-4 shadow-rose-lg backdrop-blur"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-blush text-rose">
                <Icon size={16} fill={t.tone === 'love' ? 'currentColor' : 'none'} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.body && <p className="mt-0.5 truncate text-xs text-ink-soft">{t.body}</p>}
                {t.action && (
                  <button
                    onClick={() => {
                      t.action.onClick();
                      dismissToast(t.id);
                    }}
                    className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-rose-deep underline-offset-4 hover:underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button onClick={() => dismissToast(t.id)} className="text-ink-faint hover:text-ink" aria-label="Dismiss">
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
