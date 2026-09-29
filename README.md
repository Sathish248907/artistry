# Artistry — Fine Gold Jewellery storefront

A light, rose-gold, full-bleed React storefront for an Indian gold jewellery brand: live-rate pricing, gold coins, a custom-design studio, bridal, gifting, store locator, appointments, cart, checkout and account.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

Requires Node 18+. Stack: React 18, Vite 5, Tailwind CSS 3, Framer Motion 11, React Router 6, Lucide icons.

## Rebranding

Everything brand-specific lives in `src/data/brand.js` (name, descriptor, tagline, contact details). Store names, coin inscriptions, the logo wordmark and page copy all read from it. Colours and fonts are tokens in `tailwind.config.js`.

## Structure

```
src/
  components/
    common/       SmartImage, Modal (dialog / drawer / bottom sheet), Toast, Loader, Reveal, Logo, PageBanner…
    layout/       Layout (page transitions, global overlays), Footer
    navbar/       TopBar, Navbar, MegaMenu, SearchOverlay, MobileMenu, MobileBottomNav, NotificationPanel
    home/         Hero, GoldRateTicker + GoldRateChart, CategoryGrid, Occasions, Trending, NewArrivals, Bridal,
                  Customize, GoldSavings, JewelleryFinder, Gifting, Store/Appointment sections, WhyUs,
                  ReviewCarousel, Journal, InstagramGallery, Newsletter
    product/      ProductCard, ProductGrid, FilterSidebar, QuickViewModal, WishlistButton, ProductGallery,
                  PriceBreakup, CompareTray
    goldCoins/    CoinArt (original SVG coin artwork), GoldCoinCard, GoldCoinSection
    customize/    CustomDesignWizard, DesignPreview (live SVG preview)
    cart/ checkout/ store/ appointment/
  pages/          Home, Products, ProductDetails, GoldCoins, Customize, Collections, Wedding, Gifts, GoldRates,
                  Cart, Checkout, Wishlist, Account, StoreLocator, Appointment, NotFound
  data/           Mock catalogue: products, coins, categories, gold rates, stores, content, image catalogue
  services/       API layer (apiClient + one service per domain)
  context/        UIContext (overlays, toasts), ShopContext (cart, wishlist, compare, alerts), AuthContext
  hooks/ utils/ routes/
```

## Backend hand-off

`src/services/index.js` exposes `authService`, `productService`, `categoryService`, `goldRateService`, `cartService`, `wishlistService`, `orderService`, `paymentService`, `customerService`, `reviewService`, `offerService`, `appointmentService`, `storeService`, `notificationService`, `goldCoinService` and `customDesignService`. Each call resolves from mock JSON today; set `VITE_API_BASE_URL` and the same calls go to `fetch` against your API (see `services/apiClient.js`).

Pricing is computed in one place (`src/utils/pricing.js`): gold value at the board rate × weight + making charges + gemstone value + 3% GST. Gold rates in `src/data/goldRates.js` are indicative mock values.

## Imagery

Photographs are free-licence images from [Unsplash](https://unsplash.com/license), served from the Unsplash CDN and listed in `src/data/imageCatalogue.js`. Each visual slot has its own key and no photo is shared between keys. Gold coins are original SVG artwork. Before launch, replace the photography with the brand's own shoot, keeping the same keys, and self-host the files.

## Demo notes

- Checkout / account login: any valid Indian mobile number, then any 6-digit OTP.
- Coupon code: `GOLDEN10` (10% off making charges).
- Cart, wishlist, compare, recent searches and the signed-in user persist in `localStorage`.

## Deployment

Every push to `main` builds and publishes the site to GitHub Pages via `.github/workflows/deploy.yml`.
The build runs with `VITE_BASE=/<repo-name>/` so assets and routes resolve under the Pages sub-path, and
`404.html` is a copy of `index.html` so deep links (e.g. `/products`) load the app.
