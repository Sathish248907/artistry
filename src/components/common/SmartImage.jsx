import { useState } from 'react';
import { imageAlt, imageFocus, imageSrcSet, imageUrl } from '../../data/images';
import { classNames } from '../../utils/format';

export const TONE_FILTER = 'sepia(0.3) saturate(0.75)';

// Product photos (prod_*, pspare*) and the gold coins photography always show true colours
// so shoppers see the real metal.
export const isProductImage = (name) => /^(prod_|pspare|goldCoins$)/.test(name || '');

/**
 * Catalogue-aware image. Always covers its box (object-fit: cover), fades in when decoded,
 * and falls back to a soft rose placeholder if the CDN fails. Editorial/banner photos get a
 * rose-gold grade (`tone`) so they blend with the theme; product photos are never graded.
 */
export default function SmartImage({
  name,
  alt,
  width = 1200,
  sizes = '100vw',
  className = '',
  imgClassName = '',
  priority = false,
  position,
  zoom = false,
  tone: toneProp = true,
  style,
}) {
  const tone = toneProp && !isProductImage(name);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  // Only default to `relative` when the caller hasn't positioned the box — Tailwind emits
  // `relative` after `absolute`, so adding both would silently pull an overlay image into flow.
  const positioned = /\b(absolute|fixed|sticky)\b/.test(className);

  return (
    <div className={classNames(!positioned && 'relative', 'overflow-hidden bg-gradient-to-br from-ivory to-champagne/60', className)} style={style}>
      {!failed && (
        <img
          src={imageUrl(name, width)}
          srcSet={imageSrcSet(name)}
          sizes={sizes}
          alt={alt ?? imageAlt(name)}
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ objectPosition: position || imageFocus(name), filter: tone ? TONE_FILTER : undefined }}
          className={classNames(
            'h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
            zoom && 'group-hover:scale-[1.07]',
            imgClassName,
          )}
        />
      )}
      {tone && !failed && (
        <>
          {/* Rose-gold grade: recolours every photo into the single palette while keeping its light and detail */}
          <div className="pointer-events-none absolute inset-0 bg-rose opacity-[0.35] mix-blend-color" />
          <div className="pointer-events-none absolute inset-0 bg-ivory opacity-[0.08]" />
        </>
      )}
      {!loaded && !failed && <div className="absolute inset-0 animate-pulse bg-rose-blush" />}
    </div>
  );
}
