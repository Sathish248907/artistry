import { PRODUCTS } from '../data/products';
import { CATEGORIES, COLLECTIONS } from '../data/categories';
import { COIN_CATEGORIES } from '../data/coins';

const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[’']/g, '').replace(/[^a-z0-9\s]/g, ' ');
// Light synonym map so shoppers find pieces the way they talk about them.
const SYNONYMS = { jhumka: 'jhumkas earrings', jhumki: 'jhumkas earrings', kada: 'kada bangles', mens: 'men', chain: 'chains', ring: 'rings', necklace: 'necklaces', bangle: 'bangles', earring: 'earrings', pendant: 'pendants', bracelet: 'bracelets', coin: 'coins', bridal: 'wedding' };

const tokens = (q) => norm(q).split(/\s+/).filter(Boolean);

function haystack(p) {
  return norm(`${p.name} ${p.categories.join(' ')} ${p.tags.join(' ')} ${p.purity} gold ${p.type}`);
}

export function searchProducts(query, list = PRODUCTS) {
  const ts = tokens(query);
  if (!ts.length) return list;
  return list
    .map((p) => {
      const hay = haystack(p);
      const name = norm(p.name);
      let score = 0;
      const all = ts.every((t) => {
        const alts = [t, ...(SYNONYMS[t] ? SYNONYMS[t].split(' ') : [])];
        const hit = alts.some((a) => hay.includes(a));
        if (hit) score += alts.some((a) => name.includes(a)) ? 3 : 1;
        return hit;
      });
      return all ? { p, score: score + p.rating / 10 } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

export function searchEverything(query) {
  const ts = tokens(query).filter((t) => t !== 'gold');
  const matchText = (s) => {
    const n = norm(s);
    return ts.length > 0 && ts.some((t) => n.includes(t) || (SYNONYMS[t] || '').split(' ').some((a) => a && n.includes(a)));
  };
  const allHits = searchProducts(query);
  let collections = [
    ...COLLECTIONS.filter((c) => matchText(`${c.name} ${c.copy}`)).map((c) => ({ ...c, to: `/products?collection=${c.slug}` })),
    ...COIN_CATEGORIES.filter((c) => matchText(`${c.name} coin`)).map((c) => ({ ...c, to: `/gold-coins?cat=${c.slug}` })),
  ];
  // No collection named after the query? Surface the collections the matching pieces belong to.
  if (!collections.length) {
    const slugs = [...new Set(allHits.flatMap((p) => p.collection))];
    collections = COLLECTIONS.filter((c) => slugs.includes(c.slug))
      .slice(0, 4)
      .map((c) => ({ ...c, to: `/products?collection=${c.slug}&q=${encodeURIComponent(query)}` }));
  }
  return {
    products: allHits.slice(0, 8),
    total: allHits.length,
    categories: CATEGORIES.filter((c) => matchText(`${c.name} ${c.slug}`)),
    collections,
  };
}
