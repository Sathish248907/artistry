import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import Home from '../pages/Home';

// Home is eager for first paint; everything else is code-split per route.
const Products = lazy(() => import('../pages/Products'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const GoldCoins = lazy(() => import('../pages/GoldCoins'));
const Customize = lazy(() => import('../pages/Customize'));
const Collections = lazy(() => import('../pages/Collections'));
const Wedding = lazy(() => import('../pages/Wedding'));
const Gifts = lazy(() => import('../pages/Gifts'));
const GoldRates = lazy(() => import('../pages/GoldRates'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Account = lazy(() => import('../pages/Account'));
const StoreLocator = lazy(() => import('../pages/StoreLocator'));
const Appointment = lazy(() => import('../pages/Appointment'));
const GrowCapital = lazy(() => import('../pages/GrowCapital'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin area (inventory and gold rates). It has its own frame and is only downloaded when someone opens /admin.
const AdminLayout = lazy(() => import('../admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../admin/pages/Dashboard'));
const AdminInventory = lazy(() => import('../admin/pages/InventoryList'));
const AdminStock = lazy(() => import('../admin/pages/StockAdjustment'));
const AdminHistory = lazy(() => import('../admin/pages/InventoryHistory'));
const AdminLowStock = lazy(() => import('../admin/pages/LowStock'));
const AdminGoldRates = lazy(() => import('../admin/pages/GoldRates'));
const AdminGoldRateHistory = lazy(() => import('../admin/pages/GoldRateHistory'));
const AdminCharges = lazy(() => import('../admin/pages/Charges'));
const AdminCalculator = lazy(() => import('../admin/pages/PriceCalculator'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="admin"
        element={
          <Suspense fallback={<Loader full />}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="stock" element={<AdminStock />} />
        <Route path="history" element={<AdminHistory />} />
        <Route path="low-stock" element={<AdminLowStock />} />
        <Route path="gold-rates" element={<AdminGoldRates />} />
        <Route path="gold-rate-history" element={<AdminGoldRateHistory />} />
        <Route path="charges" element={<AdminCharges />} />
        <Route path="calculator" element={<AdminCalculator />} />
        <Route path="*" element={<AdminDashboard />} />
      </Route>

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:slug" element={<ProductDetails />} />
        <Route path="gold-coins" element={<GoldCoins />} />
        <Route path="customize" element={<Customize />} />
        <Route path="collections" element={<Collections />} />
        <Route path="wedding" element={<Wedding />} />
        <Route path="gifts" element={<Gifts />} />
        <Route path="gold-rates" element={<GoldRates />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="account" element={<Account />} />
        <Route path="stores" element={<StoreLocator />} />
        <Route path="appointment" element={<Appointment />} />
        <Route path="grow-capital" element={<GrowCapital />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
