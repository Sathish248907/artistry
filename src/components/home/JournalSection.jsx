import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import SectionHeading from '../common/SectionHeading';
import { StaggerGroup, fadeUp } from '../common/Reveal';
import { JOURNAL } from '../../data/content';
import { formatDate, classNames } from '../../utils/format';

export function JournalCard({ article, featured = false }) {
  return (
    <motion.article variants={fadeUp} className={classNames('group relative', featured && 'md:col-span-2 md:row-span-2')}>
      <a href={`#${article.slug}`} onClick={(e) => e.preventDefault()} className="flex h-full flex-col">
        <div className={classNames('relative overflow-hidden rounded-[24px]', featured ? 'aspect-[4/5] md:aspect-auto md:flex-1' : 'aspect-[4/3]')}>
          <SmartImage name={article.image} width={featured ? 1400 : 800} sizes={featured ? '(min-width:768px) 50vw, 100vw' : '(min-width:1024px) 25vw, 50vw'} zoom className="absolute inset-0 h-full w-full" />
          <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-rose-deep">{article.category}</span>
          <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-rose-deep opacity-0 transition duration-500 group-hover:opacity-100">
            <ArrowUpRight size={17} />
          </span>
        </div>
        <div className="pt-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            {formatDate(article.date)} · {article.readTime}
          </p>
          <h3 className={classNames('mt-2 font-display leading-snug text-ink transition group-hover:text-rose-deep', featured ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl')}>{article.title}</h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">{article.excerpt}</p>
        </div>
      </a>
    </motion.article>
  );
}

export default function JournalSection() {
  return (
    <section className="w-full bg-gradient-to-b from-ivory to-ivory section-y">
      <div className="shell">
        <SectionHeading eyebrow="The gold journal" title="Stories, Guides & Gold Wisdom" copy="Expert advice from our gemmologists, stylists and master karigars." action={{ label: 'Visit the journal', to: '/collections' }} />
        <StaggerGroup className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNAL.map((a) => (
            <JournalCard key={a.slug} article={a} featured={false} />
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
