import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from '../navbar/TopBar';
import Navbar from '../navbar/Navbar';
import SearchOverlay from '../navbar/SearchOverlay';
import MobileMenu from '../navbar/MobileMenu';
import MobileBottomNav from '../navbar/MobileBottomNav';
import NotificationPanel from '../navbar/NotificationPanel';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import QuickViewModal from '../product/QuickViewModal';
import CompareTray from '../product/CompareTray';
import Toaster from '../common/Toast';
import Loader from '../common/Loader';
import ScrollToTop from '../common/ScrollToTop';

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen w-full flex-col bg-ivory">
      <ScrollToTop />
      <TopBar />
      <Navbar />
      <main className="w-full flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<Loader full />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileBottomNav />
      <SearchOverlay />
      <MobileMenu />
      <NotificationPanel />
      <CartDrawer />
      <QuickViewModal />
      <CompareTray />
      <Toaster />
    </div>
  );
}
