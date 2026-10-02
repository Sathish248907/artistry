import { COINS } from './coins';
import { slugify } from '../utils/format';

/*
  Product catalogue (mock). Each product owns exactly one photograph (`image` key) that is not used
  by any other product or section. `categories` lets one piece appear under several category filters.
*/
const RAW = [
  // Rings
  { image: 'prod_1', name: 'Champa Cluster Ring', category: 'rings', purity: '22K', weight: 5.42, makingPct: 14, stoneValue: 6800, type: 'traditional', occasion: ['engagement', 'festival'], collection: ['festive', 'best-sellers'], gender: 'women', rating: 4.8, reviews: 212 },
  { image: 'prod_2', name: 'Tara Stacking Ring Trio', category: 'rings', purity: '18K', weight: 4.1, makingPct: 16, stoneValue: 9400, type: 'contemporary', occasion: ['everyday', 'birthday'], collection: ['new-arrivals', 'everyday'], gender: 'women', rating: 4.7, reviews: 96, isNew: true },
  { image: 'prod_3', name: 'Gulabi Halo Cocktail Ring', category: 'rings', purity: '18K', weight: 4.86, makingPct: 15, stoneValue: 14200, type: 'contemporary', occasion: ['anniversary', 'engagement'], collection: ['new-arrivals', 'offers'], gender: 'women', rating: 4.9, reviews: 58, isNew: true, discountPct: 12 },
  { image: 'prod_4', name: 'Prem Heart Ring', category: 'rings', purity: '18K', weight: 3.24, makingPct: 15, stoneValue: 7600, type: 'daily-wear', occasion: ['anniversary', 'gifting', 'birthday'], collection: ['best-sellers', 'everyday'], gender: 'women', rating: 4.8, reviews: 341 },
  { image: 'prod_5', name: 'Vansh Engraved Signet Ring', categories: ['rings', 'mens'], purity: '22K', weight: 8.65, makingPct: 10, type: 'office-wear', occasion: ['gifting', 'birthday'], collection: ['heritage'], gender: 'men', rating: 4.7, reviews: 87 },
  { image: 'pspare1', name: 'Saath Wedding Band Pair', categories: ['rings', 'mens'], purity: '22K', weight: 9.8, makingPct: 9, type: 'daily-wear', occasion: ['wedding', 'engagement', 'anniversary'], collection: ['wedding', 'best-sellers'], gender: 'unisex', rating: 4.9, reviews: 403 },
  { image: 'pspare2', name: 'Raja Onyx Signet Ring', categories: ['rings', 'mens'], purity: '22K', weight: 10.2, makingPct: 11, stoneValue: 2400, type: 'contemporary', occasion: ['gifting', 'festival'], collection: ['new-arrivals'], gender: 'men', rating: 4.6, reviews: 44, isNew: true },

  // Earrings
  { image: 'prod_6', name: 'Noor Classic Hoops', category: 'earrings', purity: '22K', weight: 6.1, makingPct: 11, type: 'daily-wear', occasion: ['everyday', 'gifting'], collection: ['everyday', 'best-sellers'], gender: 'women', rating: 4.8, reviews: 522 },
  { image: 'prod_7', name: 'Boond Teardrop Studs', category: 'earrings', purity: '22K', weight: 3.2, makingPct: 12, type: 'office-wear', occasion: ['everyday', 'birthday'], collection: ['everyday'], gender: 'women', rating: 4.7, reviews: 188 },
  { image: 'prod_8', name: 'Chandra Bezel Studs', category: 'earrings', purity: '18K', weight: 2.4, makingPct: 15, stoneValue: 8800, type: 'contemporary', occasion: ['birthday', 'gifting', 'anniversary'], collection: ['new-arrivals', 'offers'], gender: 'women', rating: 4.8, reviews: 73, isNew: true, discountPct: 15 },
  { image: 'prod_9', name: 'Aarohi Filigree Jhumkas', category: 'earrings', purity: '18K', weight: 7.35, makingPct: 16, type: 'traditional', occasion: ['festival', 'wedding'], collection: ['festive', 'best-sellers'], gender: 'women', rating: 4.9, reviews: 614 },
  { image: 'prod_10', name: 'Surya Temple Studs', category: 'earrings', purity: '22K', weight: 8.9, makingPct: 15, type: 'temple', occasion: ['festival', 'wedding'], collection: ['heritage', 'festive'], gender: 'women', rating: 4.8, reviews: 157 },
  { image: 'pspare3', name: 'Keri Paisley Jhumkas', category: 'earrings', purity: '22K', weight: 12.6, makingPct: 16, stoneValue: 3200, type: 'temple', occasion: ['wedding', 'festival'], collection: ['heritage', 'wedding'], gender: 'women', rating: 4.9, reviews: 229 },
  { image: 'pspare4', name: 'Gumbad Dome Hoops', category: 'earrings', purity: '22K', weight: 9.4, makingPct: 12, type: 'contemporary', occasion: ['everyday', 'festival'], collection: ['new-arrivals'], gender: 'women', rating: 4.6, reviews: 38, isNew: true },
  { image: 'pspare9', name: 'Jugnu Stone Huggies', category: 'earrings', purity: '18K', weight: 2.9, makingPct: 15, stoneValue: 4600, type: 'office-wear', occasion: ['everyday', 'birthday'], collection: ['everyday', 'offers'], gender: 'women', rating: 4.7, reviews: 112, discountPct: 10 },

  // Necklaces & sets
  { image: 'prod_11', name: 'Kahani Charm Necklace', category: 'necklaces', purity: '18K', weight: 8.2, makingPct: 14, type: 'contemporary', occasion: ['birthday', 'gifting'], collection: ['new-arrivals'], gender: 'women', rating: 4.7, reviews: 64, isNew: true },
  { image: 'prod_12', name: 'Lehar Layered Necklace', category: 'necklaces', purity: '22K', weight: 14.6, makingPct: 12, type: 'daily-wear', occasion: ['everyday', 'anniversary'], collection: ['everyday', 'best-sellers'], gender: 'women', rating: 4.8, reviews: 290 },
  { image: 'prod_13', name: 'Sutra Fine Layer Set', categories: ['necklaces', 'sets'], purity: '18K', weight: 9.7, makingPct: 15, type: 'office-wear', occasion: ['everyday', 'gifting'], collection: ['everyday'], gender: 'women', rating: 4.6, reviews: 81 },
  { image: 'prod_14', name: 'Devi Temple Necklace Set', categories: ['necklaces', 'sets'], purity: '22K', weight: 48.5, makingPct: 18, stoneValue: 12400, type: 'temple', occasion: ['wedding', 'festival'], collection: ['wedding', 'heritage'], gender: 'women', rating: 5.0, reviews: 142, availability: 'made-to-order' },
  { image: 'prod_15', name: 'Jaal Mesh Choker Set', categories: ['necklaces', 'sets'], purity: '22K', weight: 38.2, makingPct: 16, type: 'contemporary', occasion: ['wedding', 'anniversary'], collection: ['wedding', 'new-arrivals'], gender: 'women', rating: 4.8, reviews: 67, isNew: true },

  // Bangles
  { image: 'prod_16', name: 'Mehr Filigree Bangle', category: 'bangles', purity: '22K', weight: 16.4, makingPct: 15, type: 'traditional', occasion: ['festival', 'wedding'], collection: ['festive', 'offers'], gender: 'women', rating: 4.8, reviews: 176, discountPct: 20 },
  { image: 'prod_17', name: 'Saral Plain Bangle', category: 'bangles', purity: '22K', weight: 12.8, makingPct: 8, type: 'daily-wear', occasion: ['everyday', 'gifting'], collection: ['everyday', 'best-sellers'], gender: 'women', rating: 4.9, reviews: 708 },
  { image: 'prod_18', name: 'Rani Ruby Bangle Pair', category: 'bangles', purity: '22K', weight: 32.6, makingPct: 17, stoneValue: 9800, type: 'traditional', occasion: ['wedding', 'festival'], collection: ['wedding', 'heritage'], gender: 'women', rating: 4.9, reviews: 118 },
  { image: 'prod_19', name: 'Mogra Pearl Bangles', category: 'bangles', purity: '22K', weight: 24.2, makingPct: 16, stoneValue: 5200, type: 'traditional', occasion: ['wedding', 'anniversary'], collection: ['festive', 'new-arrivals'], gender: 'women', rating: 4.8, reviews: 52, isNew: true },
  { image: 'pspare5', name: 'Utsav Stone Bangle Set', category: 'bangles', purity: '22K', weight: 42.8, makingPct: 17, stoneValue: 7400, type: 'temple', occasion: ['wedding', 'festival'], collection: ['wedding', 'festive'], gender: 'women', rating: 4.9, reviews: 95, availability: 'made-to-order' },
  { image: 'pspare6', name: 'Shaurya Bold Kada', categories: ['bangles', 'mens'], purity: '22K', weight: 28.4, makingPct: 10, type: 'contemporary', occasion: ['festival', 'gifting'], collection: ['best-sellers'], gender: 'men', rating: 4.8, reviews: 201 },

  // Chains
  { image: 'prod_20', name: 'Kadi Link Chain', category: 'chains', purity: '22K', weight: 18.6, makingPct: 9, type: 'daily-wear', occasion: ['everyday', 'gifting'], collection: ['best-sellers', 'everyday'], gender: 'unisex', rating: 4.8, reviews: 377 },
  { image: 'prod_21', name: 'Resham Fine Chain Duo', category: 'chains', purity: '22K', weight: 7.4, makingPct: 10, type: 'office-wear', occasion: ['everyday', 'birthday'], collection: ['everyday', 'offers'], gender: 'women', rating: 4.7, reviews: 150, discountPct: 10 },
  { image: 'prod_22', name: 'Veer Herringbone Chain', categories: ['chains', 'mens'], purity: '22K', weight: 22.5, makingPct: 10, type: 'contemporary', occasion: ['festival', 'gifting'], collection: ['new-arrivals'], gender: 'men', rating: 4.8, reviews: 91, isNew: true },
  { image: 'pspare10', name: 'Sitara Charm Chain', category: 'chains', purity: '18K', weight: 6.2, makingPct: 14, type: 'contemporary', occasion: ['birthday', 'gifting'], collection: ['new-arrivals'], gender: 'women', rating: 4.6, reviews: 29, isNew: true },

  // Bracelets
  { image: 'prod_23', name: 'Jhilmil Stone Bracelet', category: 'bracelets', purity: '18K', weight: 8.8, makingPct: 15, stoneValue: 11800, type: 'contemporary', occasion: ['anniversary', 'birthday'], collection: ['new-arrivals', 'best-sellers'], gender: 'women', rating: 4.8, reviews: 104, isNew: true },
  { image: 'prod_24', name: 'Gulmohar Curb Bracelet', category: 'bracelets', purity: '18K', weight: 11.6, makingPct: 13, stoneValue: 6200, type: 'contemporary', occasion: ['gifting', 'anniversary'], collection: ['offers'], gender: 'unisex', rating: 4.7, reviews: 66, discountPct: 15 },
  { image: 'prod_25', name: 'Naam Petite ID Bracelet', categories: ['bracelets', 'kids'], purity: '22K', weight: 3.6, makingPct: 12, type: 'daily-wear', occasion: ['birthday', 'gifting'], collection: ['everyday'], gender: 'kids', rating: 4.9, reviews: 233, personalisable: true },
  { image: 'pspare7', name: 'Dor Classic Link Bracelet', category: 'bracelets', purity: '22K', weight: 9.9, makingPct: 10, type: 'daily-wear', occasion: ['everyday', 'gifting'], collection: ['everyday', 'best-sellers'], gender: 'unisex', rating: 4.8, reviews: 312 },

  // Pendants
  { image: 'prod_26', name: 'Dil Open-Heart Pendant', category: 'pendants', purity: '18K', weight: 4.2, makingPct: 15, type: 'daily-wear', occasion: ['anniversary', 'birthday', 'gifting'], collection: ['best-sellers'], gender: 'women', rating: 4.8, reviews: 256 },
  { image: 'prod_27', name: 'Pyaar Petite Heart Pendant', category: 'pendants', purity: '18K', weight: 2.8, makingPct: 16, type: 'office-wear', occasion: ['gifting', 'birthday'], collection: ['everyday', 'offers'], gender: 'women', rating: 4.7, reviews: 142, discountPct: 10 },
  { image: 'prod_28', name: 'Kalash Heritage Pendant', category: 'pendants', purity: '22K', weight: 11.3, makingPct: 15, type: 'temple', occasion: ['festival', 'wedding'], collection: ['heritage', 'festive'], gender: 'women', rating: 4.9, reviews: 88 },
];

const DESCRIPTIONS = {
  traditional: 'Rooted in centuries-old Indian goldsmithing, finished by hand for a warm, lustrous glow.',
  temple: 'Inspired by South Indian temple architecture, with deity-inspired motifs hand-chased in relief.',
  contemporary: 'Clean lines and sculptural volume designed for the modern Indian wardrobe.',
  'daily-wear': 'Lightweight and comfortable enough to wear every day, from breakfast to late dinners.',
  'office-wear': 'Understated polish that moves easily between boardroom and celebrations.',
};

export const PRODUCTS = RAW.map((p, i) => {
  const categories = p.categories || [p.category];
  const slug = slugify(p.name);
  const createdDaysAgo = p.isNew ? 3 + i : 40 + i * 7;
  return {
    id: `p${String(i + 1).padStart(3, '0')}`,
    code: `PH${categories[0].slice(0, 2).toUpperCase()}${String(1040 + i * 7)}`,
    slug,
    ...p,
    category: categories[0],
    categories,
    availability: p.availability || (i % 11 === 6 ? 'low-stock' : 'in-stock'),
    description: `${p.name} in BIS hallmarked ${p.purity} gold. ${DESCRIPTIONS[p.type]}`,
    tags: [p.type, ...p.occasion, ...p.collection, p.gender, p.purity].filter(Boolean),
    popularity: Math.round(p.reviews * p.rating),
    createdAt: new Date(Date.now() - createdDaysAgo * 864e5).toISOString(),
    certification: 'BIS Hallmark (HUID)',
  };
});

export const productBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const productById = (id) => PRODUCTS.find((p) => p.id === id);

// Gold coins join the cart as product-like items so pricing stays in one place.
export const coinVariantId = (coin, weight) => (weight === coin.weight ? coin.id : `${coin.id}-${weight}g`);

export const COIN_ITEMS = COINS.flatMap((c) =>
  c.weights.map((w) => ({
    id: coinVariantId(c, w),
    slug: c.id,
    name: `${c.name} · ${w}g`,
    code: c.code,
    purity: '24K',
    weight: w,
    makingPct: 4.5,
    isCoin: true,
    coin: c,
    category: 'coins',
    categories: ['coins'],
    availability: c.inStock ? 'in-stock' : 'out-of-stock',
    certification: c.certification,
  })),
);

export const findItem = (id) => productById(id) || COIN_ITEMS.find((c) => c.id === id);

/**
 * The SKU an item has in the Artistry backend (see scripts/export-catalog.mjs and the backend's
 * import:storefront script). Coins share a code across weights, so their weight is part of the SKU.
 */
export const storefrontSku = (item) => (item.isCoin ? `${item.code}-${item.weight}G` : item.code).toUpperCase();

/** The storefront item for a backend SKU. */
export const itemBySku = (sku) => {
  const code = String(sku || '').toUpperCase();
  return PRODUCTS.find((p) => storefrontSku(p) === code) || COIN_ITEMS.find((c) => storefrontSku(c) === code) || null;
};

export const FILTER_OPTIONS = {
  purity: ['24K', '22K', '18K'],
  weight: [
    { id: '0-5', label: 'Under 5 g' },
    { id: '5-10', label: '5 – 10 g' },
    { id: '10-20', label: '10 – 20 g' },
    { id: '20-999', label: 'Above 20 g' },
  ],
  price: [
    { id: '0-50000', label: 'Under ₹50,000' },
    { id: '50000-150000', label: '₹50,000 – ₹1,50,000' },
    { id: '150000-400000', label: '₹1,50,000 – ₹4,00,000' },
    { id: '400000-999999999', label: 'Above ₹4,00,000' },
  ],
  type: [
    { id: 'daily-wear', label: 'Daily Wear' },
    { id: 'traditional', label: 'Traditional' },
    { id: 'temple', label: 'Temple' },
    { id: 'contemporary', label: 'Contemporary' },
    { id: 'office-wear', label: 'Office Wear' },
  ],
  occasion: ['wedding', 'engagement', 'festival', 'birthday', 'anniversary', 'everyday', 'gifting'],
  collection: [
    { id: 'new-arrivals', label: 'New Arrivals' },
    { id: 'best-sellers', label: 'Best Sellers' },
    { id: 'festive', label: 'Festive' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'heritage', label: 'Heritage' },
    { id: 'everyday', label: 'Everyday' },
    { id: 'offers', label: 'Offers' },
  ],
  gender: [
    { id: 'women', label: 'Women' },
    { id: 'men', label: 'Men' },
    { id: 'unisex', label: 'Unisex' },
    { id: 'kids', label: 'Kids' },
  ],
  availability: [
    { id: 'in-stock', label: 'In Stock' },
    { id: 'low-stock', label: 'Few Left' },
    { id: 'made-to-order', label: 'Made to Order' },
  ],
};

export const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'popularity', label: 'Popularity' },
];
