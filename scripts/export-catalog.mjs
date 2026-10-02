/**
 * Export the storefront's built-in catalogue (jewellery and gold coins) as JSON for the backend's
 * `npm run import:storefront`, so every item on the website has a matching product in the backend.
 *
 *   node scripts/export-catalog.mjs --out ../catalog.json
 *
 * Prices are not exported: the backend calculates them from its own gold rates, the making percentage
 * and the stone value, with the same formula the storefront uses.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outIndex = process.argv.indexOf('--out');
const out = resolve(outIndex > 0 ? process.argv[outIndex + 1] : 'catalog-export.json');

const bundled = await build({
  stdin: {
    contents: [
      "export { PRODUCTS, COIN_ITEMS, storefrontSku } from './src/data/products.js';",
      "export { CATEGORIES, COLLECTIONS } from './src/data/categories.js';",
      "export { imageUrl } from './src/data/images.js';",
    ].join('\n'),
    resolveDir: root,
    loader: 'js',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent',
});
const data = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

const STOCK = { 'in-stock': 10, 'low-stock': 3, 'made-to-order': 5, 'out-of-stock': 0 };
const categoryName = (slug) => (slug === 'coins' ? 'Gold Coins' : data.CATEGORIES.find((c) => c.slug === slug)?.name || slug);

const products = data.PRODUCTS.map((p) => ({
  kind: 'jewellery',
  sku: data.storefrontSku(p),
  storefrontId: p.id,
  name: p.name,
  slug: p.slug,
  category: p.category,
  description: p.description,
  goldPurity: p.purity,
  goldWeight: p.weight,
  makingPercentage: p.makingPct,
  stoneCharges: p.stoneValue || 0,
  gender: p.gender,
  occasion: p.occasion,
  collections: p.collection,
  tags: p.tags,
  isNewArrival: Boolean(p.isNew),
  isBestSeller: p.collection.includes('best-sellers'),
  isFeatured: p.collection.includes('best-sellers') && p.rating >= 4.8,
  stockQuantity: STOCK[p.availability] ?? 10,
  image: data.imageUrl(p.image, 900),
}));

const coins = data.COIN_ITEMS.map((c) => ({
  kind: 'coin',
  sku: data.storefrontSku(c),
  storefrontId: c.id,
  name: c.name,
  slug: `${c.slug}-${c.weight}g`,
  category: 'coins',
  description: `${c.coin.name}, ${c.weight} g of 24K 999.9 gold. ${c.certification}.`,
  goldPurity: '24K',
  goldWeight: c.weight,
  makingPercentage: c.makingPct,
  stoneCharges: 0,
  gender: 'Unisex',
  occasion: [],
  collections: [],
  tags: ['coin', c.coin.category.toLowerCase()],
  isNewArrival: false,
  isBestSeller: false,
  isFeatured: false,
  stockQuantity: c.availability === 'out-of-stock' ? 0 : 25,
  image: '',
}));

const usedCategories = [...new Set([...products, ...coins].map((i) => i.category))];
const catalog = {
  exportedAt: new Date().toISOString(),
  categories: usedCategories.map((slug, index) => ({ slug, name: categoryName(slug), displayOrder: index + 1 })),
  collections: data.COLLECTIONS.map((c, index) => ({ slug: c.slug, name: c.name, description: c.copy, displayOrder: index + 1 })),
  items: [...products, ...coins],
};

writeFileSync(out, JSON.stringify(catalog, null, 2));
console.log(`Exported ${products.length} jewellery items and ${coins.length} coin weights to ${out}`);
