import { CATALOGUE } from './imageCatalogue';

// Every visual slot on the site has its own key → its own photograph. Keys are never shared between sections.
const CDN = 'https://images.unsplash.com/';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFAF9"/><stop offset="1" stop-color="#FBF1F0"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="200" cy="230" r="54" fill="none" stroke="#B76E79" stroke-width="2" opacity=".5"/><circle cx="200" cy="230" r="40" fill="none" stroke="#E8C4C4" stroke-width="1" opacity=".5"/></svg>`,
  );

export const hasImage = (key) => Boolean(CATALOGUE[key]);

export function imageUrl(key, width = 1200, { height, quality = 78 } = {}) {
  const entry = CATALOGUE[key];
  if (!entry) return FALLBACK;
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(width), q: String(quality) });
  if (height) params.set('h', String(height));
  return `${CDN}${entry.path}?${params.toString()}`;
}

export function imageSrcSet(key, widths = [480, 800, 1200, 1600, 2200]) {
  if (!CATALOGUE[key]) return undefined;
  return widths.map((w) => `${imageUrl(key, w)} ${w}w`).join(', ');
}

export const imageAlt = (key, fallback = '') => CATALOGUE[key]?.alt || fallback;
export const imageFocus = (key) => CATALOGUE[key]?.focus || 'center';
