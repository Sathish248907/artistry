import SectionHeading from '../common/SectionHeading';
import { StaggerGroup } from '../common/Reveal';
import CategoryCard from './CategoryCard';
import { CATEGORIES } from '../../data/categories';

export default function CategoryGrid() {
  return (
    <section className="w-full bg-ivory section-y">
      <div className="shell">
        <SectionHeading
          eyebrow="Shop by category"
          title="Explore Our Gold"
          copy="Twelve ways to wear hallmarked gold — from featherlight everyday pieces to heirloom statements."
          action={{ label: 'View all jewellery', to: '/products' }}
        />
        <StaggerGroup className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6" step={0.05}>
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.slug} category={c} index={i} />
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
