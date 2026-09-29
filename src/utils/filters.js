import { productPrice } from './pricing';
import { searchProducts } from './search';

// Filter state lives in the URL (?category=rings,bangles&purity=22K&sort=newest) so results are shareable.
export const FILTER_KEYS = ['category', 'price', 'purity', 'weight', 'type', 'occasion', 'collection', 'gender', 'availability'];

export function readFilters(searchParams) {
  const f = {};
  FILTER_KEYS.forEach((k) => {
    const v = searchParams.get(k);
    f[k] = v ? v.split(',').filter(Boolean) : [];
  });
  f.sort = searchParams.get('sort') || 'relevance';
  f.q = searchParams.get('q') || '';
  return f;
}

const inRange = (value, ranges) =>
  ranges.some((r) => {
    const [min, max] = r.split('-').map(Number);
    return value >= min && value < max;
  });

export function applyFilters(list, f) {
  let out = f.q ? searchProducts(f.q, list) : list;
  out = out.filter((p) => {
    if (f.category.length && !p.categories.some((c) => f.category.includes(c))) return false;
    if (f.purity.length && !f.purity.includes(p.purity)) return false;
    if (f.type.length && !f.type.includes(p.type)) return false;
    if (f.occasion.length && !p.occasion.some((o) => f.occasion.includes(o))) return false;
    if (f.collection.length && !p.collection.some((c) => f.collection.includes(c))) return false;
    if (f.gender.length && !f.gender.includes(p.gender)) return false;
    if (f.availability.length && !f.availability.includes(p.availability)) return false;
    if (f.weight.length && !inRange(p.weight, f.weight)) return false;
    if (f.price.length && !inRange(productPrice(p), f.price)) return false;
    return true;
  });

  const sorted = [...out];
  switch (f.sort) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'price-asc':
      sorted.sort((a, b) => productPrice(a) - productPrice(b));
      break;
    case 'price-desc':
      sorted.sort((a, b) => productPrice(b) - productPrice(a));
      break;
    case 'popularity':
      sorted.sort((a, b) => b.popularity - a.popularity);
      break;
    default:
      break;
  }
  return sorted;
}

export const activeFilterCount = (f) => FILTER_KEYS.reduce((n, k) => n + f[k].length, 0);
