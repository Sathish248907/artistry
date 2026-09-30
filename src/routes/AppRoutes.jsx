import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
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

export default function AppRoutes() {
  return (
    <Routes>
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
