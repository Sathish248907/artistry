import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { UIProvider } from './context/UIContext';
import { ShopProvider } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import AppRoutes from './routes/AppRoutes';

// '/' locally, '/artistry' on GitHub Pages (set via VITE_BASE at build time)
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export default function App() {
  return (
    <BrowserRouter basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MotionConfig reducedMotion="user">
        <UIProvider>
          <NotificationsProvider>
            <AuthProvider>
              <ShopProvider>
                <AppRoutes />
              </ShopProvider>
            </AuthProvider>
          </NotificationsProvider>
        </UIProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}
