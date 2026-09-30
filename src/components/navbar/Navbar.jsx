import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Heart, MapPin, Menu, Search, ShoppingBag, User } from 'lucide-react';
import Logo from '../common/Logo';
import MegaMenu from './MegaMenu';
import { MEGA_MENU } from '../../data/navigation';
import { useUI } from '../../context/UIContext';
import { useShop } from '../../context/ShopContext';
import useScrolled from '../../hooks/useScrolled';
import { classNames } from '../../utils/format';
import { NOTIFICATIONS } from '../../data/content';

function IconButton({ label, onClick, to, children, badge, className }) {
  const inner = (
    <>
      {children}
      <AnimatePresence>
        {badge > 0 && (
          <motion.span
            key={badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white ring-2 ring-ivory"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
  const cls = classNames(
    'relative flex h-10 w-10 items-center justify-center rounded-full text-rose-deep transition hover:bg-rose-blush hover:text-rose',
    className,
  );
  return to ? (
    <Link to={to} aria-label={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}

export default function Navbar() {
  const scrolled = useScrolled(40);
  const { openSearch, openCart, setMenuOpen, setNotificationsOpen } = useUI();
  const { cartCount, wishlist } = useShop();
  const [active, setActive] = useState(null);
  const closeTimer = useRef();
  const location = useLocation();
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => setActive(null), [location.pathname, location.search]);

  // Escape closes an open menu regardless of where focus is (mouse-opened menus included)
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const enter = (id) => {
    clearTimeout(closeTimer.current);
    setActive(id);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setActive(null), 140);
  };

  const hasMenu = (item) => Boolean(item.columns || item.panel);
  const activeMenu = MEGA_MENU.find((m) => m.id === active && hasMenu(m));

  // Keyboard users: focusing a nav item opens its menu; tabbing out of the header closes it.
  const onHeaderBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setActive(null);
  };

  const navItemClass = (isActive, id) =>
    classNames(
      'group relative flex items-center whitespace-nowrap px-2.5 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 2xl:px-4 2xl:tracking-[0.18em]',
      isActive || active === id ? 'text-rose-deep' : 'text-ink hover:text-rose-deep',
    );
  const underline = (id) => (
    <span
      className={classNames(
        'absolute inset-x-2.5 bottom-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-rose to-gold transition-transform duration-300 2xl:inset-x-4',
        active === id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
      )}
    />
  );

  return (
    <header
      className={classNames(
        'sticky top-0 z-50 w-full transition-all duration-500',
        scrolled ? 'bg-ivory/90 shadow-[0_10px_30px_-18px_rgba(183,110,121,0.45)] backdrop-blur-xl' : 'bg-ivory',
      )}
      onMouseLeave={leave}
      onBlur={onHeaderBlur}
    >
      <div className={classNames('shell flex items-center justify-between gap-4 transition-all duration-500', scrolled ? 'h-[66px]' : 'h-[84px]')}>
        <div className="flex items-center gap-2">
          <button className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-rose-deep hover:bg-rose-blush xl:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} strokeWidth={1.6} />
          </button>
          <Logo compact={scrolled} />
        </div>

        <nav className="hidden h-full items-stretch xl:flex" aria-label="Primary">
          {MEGA_MENU.map((item) => (
            <div key={item.id} className="relative flex items-stretch" onMouseEnter={() => enter(item.id)} onFocus={() => hasMenu(item) && enter(item.id)}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={navItemClass(false, item.id)}
                  aria-label={`${item.label} (opens the Grow Capital website in a new tab)`}
                  aria-haspopup={hasMenu(item) ? 'true' : undefined}
                  aria-expanded={hasMenu(item) ? active === item.id : undefined}
                >
                  {item.label}
                  {underline(item.id)}
                </a>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) => navItemClass(isActive, item.id)}
                  aria-haspopup={hasMenu(item) ? 'true' : undefined}
                  aria-expanded={hasMenu(item) ? active === item.id : undefined}
                >
                  {item.label}
                  {item.badge && <span className="ml-1.5 hidden whitespace-nowrap rounded-full bg-rose-blush px-1.5 py-0.5 text-[9px] tracking-[0.08em] text-rose-deep 2xl:inline">{item.badge}</span>}
                  {underline(item.id)}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <IconButton label="Search" onClick={openSearch}>
            <Search size={20} strokeWidth={1.6} />
          </IconButton>
          <IconButton label="Store locator" to="/stores" className="hidden md:flex">
            <MapPin size={20} strokeWidth={1.6} />
          </IconButton>
          <IconButton label="Notifications" onClick={() => setNotificationsOpen(true)} badge={unread} className="hidden sm:flex">
            <Bell size={20} strokeWidth={1.6} />
          </IconButton>
          <IconButton label="Account" to="/account" className="hidden md:flex">
            <User size={20} strokeWidth={1.6} />
          </IconButton>
          <IconButton label="Wishlist" to="/wishlist" badge={wishlist.length} className="hidden md:flex">
            <Heart size={20} strokeWidth={1.6} />
          </IconButton>
          <IconButton label="Cart" onClick={openCart} badge={cartCount}>
            <ShoppingBag size={20} strokeWidth={1.6} />
          </IconButton>
        </div>
      </div>

      <AnimatePresence>
        {activeMenu && <MegaMenu key="mega" menu={activeMenu} onEnter={() => enter(activeMenu.id)} onLeave={leave} />}
      </AnimatePresence>
    </header>
  );
}
