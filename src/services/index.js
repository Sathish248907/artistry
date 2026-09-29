import { mock, http, useRemote } from './apiClient';
import { PRODUCTS, productBySlug } from '../data/products';
import { CATEGORIES, COLLECTIONS } from '../data/categories';
import { GOLD_RATES, CITY_RATES } from '../data/goldRates';
import { COINS, COIN_CATEGORIES } from '../data/coins';
import { STORES, TESTIMONIALS, NOTIFICATIONS } from '../data/content';

const pick = (remote, local) => (useRemote ? remote() : local());
const uid = (p) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

export const authService = {
  login: (mobile) => pick(() => http('/auth/otp', { method: 'POST', body: { mobile } }), () => mock({ otpSent: true, mobile })),
  verifyOtp: (mobile, otp) =>
    pick(
      () => http('/auth/verify', { method: 'POST', body: { mobile, otp } }),
      () => mock({ token: 'mock-token', user: { id: 'u1', name: 'Priya Sharma', mobile, email: 'priya.sharma@example.com' } }),
    ),
  logout: () => pick(() => http('/auth/logout', { method: 'POST' }), () => mock({ ok: true })),
};

export const productService = {
  list: (params) => pick(() => http(`/products?${new URLSearchParams(params)}`), () => mock(PRODUCTS, { ms: 120 })),
  get: (slug) => pick(() => http(`/products/${slug}`), () => mock(productBySlug(slug))),
  search: (q) =>
    pick(
      () => http(`/search?q=${encodeURIComponent(q)}`),
      () => mock(PRODUCTS.filter((p) => `${p.name} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()))),
    ),
};

export const categoryService = {
  list: () => pick(() => http('/categories'), () => mock(CATEGORIES)),
  collections: () => pick(() => http('/collections'), () => mock(COLLECTIONS)),
};

export const goldRateService = {
  today: () => pick(() => http('/gold-rates/today'), () => mock(GOLD_RATES, { ms: 150 })),
  cities: () => pick(() => http('/gold-rates/cities'), () => mock(CITY_RATES)),
};

export const cartService = {
  sync: (items) => pick(() => http('/cart', { method: 'PUT', body: { items } }), () => mock({ items })),
};

export const wishlistService = {
  sync: (ids) => pick(() => http('/wishlist', { method: 'PUT', body: { ids } }), () => mock({ ids })),
  share: (ids) => pick(() => http('/wishlist/share', { method: 'POST', body: { ids } }), () => mock({ url: `${window.location.origin}${import.meta.env.BASE_URL}wishlist?ids=${ids.join(',')}` })),
};

export const orderService = {
  list: () =>
    pick(
      () => http('/orders'),
      () =>
        mock([
          { id: 'PH-240918-7731', date: '2026-09-18', status: 'Shipped', total: 84520, items: 1, eta: '2026-09-30' },
          { id: 'PH-240802-1204', date: '2026-08-02', status: 'Delivered', total: 32650, items: 2 },
          { id: 'PH-240611-9082', date: '2026-06-11', status: 'Delivered', total: 146900, items: 1 },
        ]),
    ),
  place: (payload) => pick(() => http('/orders', { method: 'POST', body: payload }), () => mock({ id: uid('PH'), ...payload }, { ms: 900 })),
};

export const paymentService = {
  methods: () => pick(() => http('/payments/methods'), () => mock(['upi', 'credit', 'debit', 'netbanking', 'wallet'])),
  pay: (orderId, method) => pick(() => http('/payments', { method: 'POST', body: { orderId, method } }), () => mock({ status: 'success', ref: uid('TXN') }, { ms: 1100 })),
};

export const customerService = {
  profile: () => pick(() => http('/me'), () => mock({ name: 'Priya Sharma', email: 'priya.sharma@example.com', mobile: '+91 98200 12345', city: 'Mumbai', tier: 'Golden Circle' })),
  addresses: () =>
    pick(
      () => http('/me/addresses'),
      () =>
        mock([
          { id: 'a1', label: 'Home', name: 'Priya Sharma', line: '902, Seabreeze Towers, Carter Road, Bandra West', city: 'Mumbai', pincode: '400050', phone: '+91 98200 12345', default: true },
          { id: 'a2', label: 'Office', name: 'Priya Sharma', line: '5th Floor, One BKC, Bandra Kurla Complex', city: 'Mumbai', pincode: '400051', phone: '+91 98200 12345' },
        ]),
    ),
};

export const reviewService = {
  list: () => pick(() => http('/reviews'), () => mock(TESTIMONIALS)),
};

export const offerService = {
  validate: (code) => pick(() => http(`/offers/${code}`), () => mock({ valid: code.toUpperCase() === 'GOLDEN10', code: code.toUpperCase() })),
};

export const appointmentService = {
  book: (payload) => pick(() => http('/appointments', { method: 'POST', body: payload }), () => mock({ id: uid('APT'), ...payload }, { ms: 700 })),
};

export const storeService = {
  list: () => pick(() => http('/stores'), () => mock(STORES)),
};

export const notificationService = {
  list: () => pick(() => http('/notifications'), () => mock(NOTIFICATIONS)),
};

export const goldCoinService = {
  list: () => pick(() => http('/gold-coins'), () => mock(COINS)),
  categories: () => pick(() => http('/gold-coins/categories'), () => mock(COIN_CATEGORIES)),
};

export const customDesignService = {
  request: (payload) => pick(() => http('/custom-designs', { method: 'POST', body: payload }), () => mock({ id: uid('CD'), status: 'Received', ...payload }, { ms: 800 })),
  list: () =>
    pick(
      () => http('/custom-designs'),
      () => mock([{ id: 'CD-8K21', piece: 'Name Pendant', purity: '22K', status: 'Design approved', updated: '2026-09-21' }]),
    ),
};
