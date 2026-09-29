import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Home, LayoutGrid, Search, User } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useShop } from '../../context/ShopContext';
import { classNames } from '../../utils/format';

export default function MobileBottomNav() {
  const { openSearch, setMenuOpen } = useUI();
  const { wishlist } = useShop();

  const item = 'relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium uppercase tracking-[0.12em]';
  const linkCls = ({ isActive }) => classNames(item, isActive ? 'text-rose-deep' : 'text-ink-faint');
  const dot = (
    <motion.span layoutId="bottom-nav-dot" className="absolute top-0 h-[3px] w-8 rounded-full bg-gradient-to-r from-rose to-gold" />
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-light/60 bg-ivory/95 pb-safe shadow-[0_-10px_30px_-20px_rgba(183,110,121,0.5)] backdrop-blur-xl md:hidden" aria-label="Mobile bottom">
      <div className="flex h-16 items-stretch">
        <NavLink to="/" end className={linkCls}>
          {({ isActive }) => (
            <>
              {isActive && dot}
              <Home size={20} strokeWidth={1.6} /> Home
            </>
          )}
        </NavLink>
        <button onClick={() => setMenuOpen(true)} className={classNames(item, 'text-ink-faint')}>
          <LayoutGrid size={20} strokeWidth={1.6} /> Categories
        </button>
        <button onClick={openSearch} className={classNames(item, 'text-ink-faint')}>
          <span className="-mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-rose text-white shadow-rose ring-4 ring-ivory">
            <Search size={20} />
          </span>
          Search
        </button>
        <NavLink to="/wishlist" className={linkCls}>
          {({ isActive }) => (
            <>
              {isActive && dot}
              <span className="relative">
                <Heart size={20} strokeWidth={1.6} />
                {wishlist.length > 0 && <span className="absolute -right-2 -top-1 h-4 min-w-4 rounded-full bg-rose px-1 text-[9px] leading-4 text-white">{wishlist.length}</span>}
              </span>
              Wishlist
            </>
          )}
        </NavLink>
        <NavLink to="/account" className={linkCls}>
          {({ isActive }) => (
            <>
              {isActive && dot}
              <User size={20} strokeWidth={1.6} /> Account
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
