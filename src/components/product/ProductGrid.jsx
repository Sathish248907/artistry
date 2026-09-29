import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { stagger } from '../common/Reveal';

/** 2 cols mobile · 3 cols tablet · 4 cols desktop (5 on ultra-wide screens). Re-staggers when results change. */
export default function ProductGrid({ products, withSidebar = false }) {
  return (
    <motion.div
      key={products.map((p) => p.id).join()}
      variants={stagger(0.05)}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 ${withSidebar ? 'xl:grid-cols-4 3xl:grid-cols-5' : 'lg:grid-cols-4 3xl:grid-cols-5'}`}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </motion.div>
  );
}
