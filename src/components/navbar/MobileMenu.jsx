import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarHeart, ChevronDown, ExternalLink, Heart, MapPin, Phone, User } from 'lucide-react';
import Modal from '../common/Modal';
import Logo from '../common/Logo';
import Icon from '../common/Icon';
import { MEGA_MENU } from '../../data/navigation';
import { useUI } from '../../context/UIContext';
import { BRAND } from '../../data/brand';
import { classNames } from '../../utils/format';

export default function MobileMenu() {
  const { menuOpen, setMenuOpen } = useUI();
  const [open, setOpen] = useState('gold');
  const close = () => setMenuOpen(false);

  return (
    <Modal open={menuOpen} onClose={close} variant="drawer" title="Menu" className="!max-w-[420px] sm:!max-w-md">
      <div className="flex h-full flex-col">
        <div className="border-b border-rose-light/50 bg-gradient-to-r from-ivory to-cream px-5 py-5">
          <Logo onClick={close} />
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-3" aria-label="Mobile">
          {MEGA_MENU.map((item) => {
            const expandable = Boolean(item.columns || item.panel);
            const isOpen = open === item.id;
            return (
              <div key={item.id} className="border-b border-rose-light/40">
                {item.external ? (
                  // Label opens the external site; the chevron toggles the info panel
                  <div className="flex items-center justify-between">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center gap-2 py-4"
                      aria-label={`${item.label} (opens the Grow Capital website in a new tab)`}
                    >
                      <span className="font-display text-2xl text-ink">{item.label}</span>
                      <ExternalLink size={15} className="text-ink-faint" />
                    </a>
                    <button
                      onClick={() => setOpen(isOpen ? null : item.id)}
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-label={`${isOpen ? 'Hide' : 'Show'} ${item.label} details`}
                    >
                      <ChevronDown size={18} className={classNames('text-rose transition-transform duration-300', isOpen && 'rotate-180')} />
                    </button>
                  </div>
                ) : expandable ? (
                  <button onClick={() => setOpen(isOpen ? null : item.id)} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={isOpen}>
                    <span className="font-display text-2xl text-ink">{item.label}</span>
                    <ChevronDown size={18} className={classNames('text-rose transition-transform duration-300', isOpen && 'rotate-180')} />
                  </button>
                ) : (
                  <Link to={item.to} onClick={close} className="flex items-center justify-between py-4">
                    <span className="font-display text-2xl text-ink">{item.label}</span>
                    {item.badge && <span className="rounded-full bg-rose-blush px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-rose-deep">{item.badge}</span>}
                  </Link>
                )}
                <AnimatePresence initial={false}>
                  {expandable && isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      {item.panel ? (
                        <div className="pb-5">
                          <p className="font-display text-xl text-ink">{item.panel.title}</p>
                          <p className="mt-1 text-sm text-ink-soft">{item.panel.copy}</p>
                          <ul className="mt-4 space-y-2">
                            {item.panel.cards.map((c) => (
                              <li key={c.title}>
                                <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-xl border border-rose-light/60 bg-ivory px-4 py-3" aria-label={`${c.title} (opens in a new tab)`}>
                                  <span className="mt-0.5 text-rose"><Icon name={c.icon} size={16} strokeWidth={1.6} /></span>
                                  <span>
                                    <span className="block text-sm font-medium text-ink">{c.title}</span>
                                    <span className="block text-xs leading-relaxed text-ink-soft">{c.copy}</span>
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                          <a href={item.href} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full" aria-label={`${item.panel.cta} (opens the Grow Capital website in a new tab)`}>
                            {item.panel.cta} <ArrowRight size={15} />
                          </a>
                        </div>
                      ) : (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pb-5">
                        {item.columns.flatMap((c) => c.links).map(([label, to]) => (
                          <Link key={label} to={to} onClick={close} className="text-sm text-ink-soft hover:text-rose-deep">
                            {label}
                          </Link>
                        ))}
                      </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
        <div className="grid grid-cols-2 gap-2 border-t border-rose-light/50 bg-cream p-5 pb-safe text-sm">
          {[
            [User, 'My Account', '/account'],
            [Heart, 'Wishlist', '/wishlist'],
            [MapPin, 'Find a Store', '/stores'],
            [CalendarHeart, 'Appointment', '/appointment'],
          ].map(([I, label, to]) => (
            <Link key={label} to={to} onClick={close} className="flex items-center gap-2 rounded-xl border border-rose-light/60 bg-ivory px-3 py-3 text-ink-soft">
              <I size={16} className="text-rose" /> {label}
            </Link>
          ))}
          <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="col-span-2 mt-1 flex items-center justify-center gap-2 text-xs text-ink-faint">
            <Phone size={13} /> Concierge {BRAND.phone}
          </a>
        </div>
      </div>
    </Modal>
  );
}
