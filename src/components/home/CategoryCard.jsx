import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import { fadeUp } from '../common/Reveal';
import { PRODUCTS } from '../../data/products';

export default function CategoryCard({ category, index }) {
  const count = PRODUCTS.filter((p) => p.categories.includes(category.slug)).length;
  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/products?category=${category.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] ring-1 ring-rose-light/40 transition-all duration-500 hover:shadow-rose-lg hover:ring-2 hover:ring-rose"
      >
        <SmartImage name={category.image} width={800} sizes="(min-width:1536px) 16vw, (min-width:1024px) 25vw, 50vw" zoom className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-rose/0 transition-colors duration-500 group-hover:bg-rose/10" />
        <span className="absolute left-4 top-4 rounded-full bg-ivory/85 px-2.5 py-0.5 font-display text-sm italic text-rose-deep">{String(index + 1).padStart(2, '0')}</span>
        <span className="absolute right-4 top-4 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-ivory/90 text-rose-deep opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
          <ArrowUpRight size={16} />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className="font-display text-[22px] leading-tight text-ink transition-transform duration-500 group-hover:-translate-y-1 sm:text-[26px]">{category.name}</h3>
          <div className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr]">
            <p className="overflow-hidden text-xs text-ink-soft">{category.blurb}</p>
          </div>
          <p className="mt-1.5 text-[10.5px] font-medium uppercase tracking-[0.2em] text-rose-deep">{count > 0 ? `${count} designs` : 'Made to order'}</p>
        </div>
      </Link>
    </motion.div>
  );
}
