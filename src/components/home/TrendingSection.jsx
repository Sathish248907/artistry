import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';
import { StaggerGroup } from '../common/Reveal';
import ProductCard from '../product/ProductCard';
import { TRENDING } from '../../data/home';

export default function TrendingSection() {
  const track = useRef(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
  };

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const scroll = (dir) => {
    const el = track.current;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="w-full bg-ivory pb-6 pt-14 sm:pt-16 lg:pb-8 lg:pt-24">
      <div className="shell">
        <SectionHeading eyebrow="Most loved this week" title="Trending in Gold" copy="The pieces our clients are adding to cart right now — each priced live to today’s rate." action={{ label: 'Shop best sellers', to: '/products?collection=best-sellers' }} />
      </div>
      <StaggerGroup className="w-full" amount={0.05}>
        <div ref={track} onScroll={update} className="no-scrollbar snap-x-mandatory flex w-full scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:scroll-px-6 lg:scroll-px-10 xl:scroll-px-14 2xl:scroll-px-20 sm:gap-5 sm:px-6 lg:gap-6 lg:px-10 xl:px-14 2xl:px-20">
          {TRENDING.map((p) => (
            <ProductCard key={p.id} product={p} variant="carousel" />
          ))}
        </div>
      </StaggerGroup>
      <div className="shell mt-6 flex items-center gap-6">
        <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-rose-light/40">
          <div className="absolute inset-y-0 left-0 w-1/4 rounded-full bg-gradient-to-r from-rose to-gold transition-transform duration-300" style={{ transform: `translateX(${progress * 300}%)` }} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} disabled={edges.start} className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-light bg-ivory text-rose-deep transition hover:bg-rose hover:text-white disabled:opacity-40 disabled:hover:bg-ivory disabled:hover:text-rose-deep" aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll(1)} disabled={edges.end} className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-light bg-ivory text-rose-deep transition hover:bg-rose hover:text-white disabled:opacity-40 disabled:hover:bg-ivory disabled:hover:text-rose-deep" aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
