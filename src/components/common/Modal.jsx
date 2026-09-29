import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import useMediaQuery from '../../hooks/useMediaQuery';
import { classNames } from '../../utils/format';

/**
 * Centered dialog on desktop, swipe-dismissable bottom sheet on mobile.
 * `variant="drawer"` slides in from the right on every breakpoint.
 */
export default function Modal({ open, onClose, children, title, size = 'lg', variant = 'dialog', className, hideClose }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const drawer = variant === 'drawer';
  const sheet = !drawer && isMobile;
  const widths = { sm: 'md:max-w-md', md: 'md:max-w-2xl', lg: 'md:max-w-5xl', xl: 'md:max-w-6xl' };

  const panelMotion = drawer
    ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
    : sheet
      ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
      : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.98 } };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-[#4A3835]/25 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div
            className={classNames(
              'pointer-events-none absolute inset-0 flex',
              drawer ? 'justify-end' : sheet ? 'items-end' : 'items-center justify-center p-6',
            )}
          >
            <motion.div
              {...panelMotion}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
              drag={sheet ? 'y' : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => sheet && info.offset.y > 120 && onClose()}
              className={classNames(
                'pointer-events-auto relative flex w-full flex-col overflow-hidden bg-ivory shadow-rose-lg',
                drawer && 'h-full max-w-md border-l border-rose-light/50',
                sheet && 'max-h-[92vh] rounded-t-[28px]',
                !drawer && !sheet && classNames('max-h-[90vh] rounded-[28px] border border-rose-light/50', widths[size]),
                className,
              )}
            >
              {sheet && <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-rose-light" />}
              {!hideClose && (
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-rose-light/60 bg-ivory/90 text-ink-soft transition hover:rotate-90 hover:text-rose-deep"
                >
                  <X size={18} />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
