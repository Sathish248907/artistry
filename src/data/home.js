import { PRODUCTS } from './products';

// Homepage curation. Trending pieces are excluded from the Jewellery Finder so no photo repeats on the page.
const TRENDING_IMAGES = ['prod_9', 'prod_16', 'prod_12', 'prod_3', 'prod_6', 'prod_19', 'prod_23', 'prod_26', 'prod_17', 'prod_1'];

export const TRENDING = TRENDING_IMAGES.map((img) => PRODUCTS.find((p) => p.image === img)).filter(Boolean);
export const FINDER_POOL = PRODUCTS.filter((p) => !TRENDING_IMAGES.includes(p.image));

export const BRIDAL_EDIT = [
  { name: 'Bridal Necklaces', to: '/products?collection=wedding&category=necklaces', note: 'Haars, chokers & rani haars' },
  { name: 'Bangles', to: '/products?collection=wedding&category=bangles', note: 'Kadas & chooda sets' },
  { name: 'Earrings', to: '/products?collection=wedding&category=earrings', note: 'Jhumkas & chandbalis' },
  { name: 'Rings', to: '/products?collection=wedding&category=rings', note: 'Bands for the vows' },
  { name: 'Maang Tikka', to: '/customize?style=bridal', note: 'Made to order in 22K' },
  { name: 'Bridal Sets', to: '/products?collection=wedding&category=sets', note: 'Complete coordinated looks' },
];
