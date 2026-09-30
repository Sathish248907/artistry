// Copies dist/index.html to dist/<route>/index.html for every app route so GitHub Pages
// serves deep links with HTTP 200 (404.html remains the fallback for anything unknown).
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const STATIC_ROUTES = [
  'products', 'gold-coins', 'customize', 'collections', 'wedding', 'gifts', 'gold-rates',
  'cart', 'checkout', 'wishlist', 'account', 'stores', 'appointment', 'grow-capital',
];

// Product slugs mirror slugify() in src/utils/format.js, applied to product names in src/data/products.js
const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const products = readFileSync('src/data/products.js', 'utf8');
const raw = products.slice(products.indexOf('const RAW = ['), products.indexOf('];', products.indexOf('const RAW = [')));
const slugs = [...raw.matchAll(/name: '([^']+)'/g)].map((m) => `product/${slugify(m[1])}`);

const dist = 'dist';
const routes = [...STATIC_ROUTES, ...slugs];
for (const route of routes) {
  mkdirSync(join(dist, route), { recursive: true });
  copyFileSync(join(dist, 'index.html'), join(dist, route, 'index.html'));
}
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
console.log(`SPA route pages written: ${routes.length}`);
