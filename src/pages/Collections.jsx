import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageBanner from '../components/common/PageBanner';
import SmartImage from '../components/common/SmartImage';
import Reveal from '../components/common/Reveal';
import { COLLECTIONS } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { classNames } from '../utils/format';

export default function Collections() {
  return (
    <>
      <PageBanner image="collectionsPageBanner" eyebrow="Curated collections" title="Collections" copy="Six stories told in gold — from featherlight everyday pieces to heirloom bridal statements." crumbs={[['Collections']]} />
      {COLLECTIONS.map((c, i) => {
        const count = PRODUCTS.filter((p) => p.collection.includes(c.slug)).length;
        const flip = i % 2 === 1;
        return (
          <section key={c.slug} className="w-full bg-ivory">
            <div className={classNames('grid w-full items-stretch lg:grid-cols-2', flip && 'lg:[&>*:first-child]:order-2')}>
              <div className="relative h-[60vh] min-h-[380px] overflow-hidden lg:h-[640px]">
                <SmartImage name={c.image} width={1600} sizes="(min-width:1024px) 50vw, 100vw" className="blend-all absolute inset-0 h-full w-full" />
              </div>
              <Reveal className="shell flex flex-col justify-center py-14 lg:px-16 xl:px-24">
                <p className="font-display text-6xl italic text-rose-light">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="heading-lg mt-2">{c.name}</h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">{c.copy}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink-faint">{count} designs</p>
                <Link to={`/products?collection=${c.slug}`} className="btn-primary mt-8 self-start">
                  Explore {c.name} <ArrowRight size={15} />
                </Link>
              </Reveal>
            </div>
          </section>
        );
      })}
    </>
  );
}
