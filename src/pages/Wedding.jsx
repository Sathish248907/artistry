import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, CalendarHeart, Crown, Gem, Sparkles } from 'lucide-react';
import PageBanner from '../components/common/PageBanner';
import SmartImage from '../components/common/SmartImage';
import SectionHeading from '../components/common/SectionHeading';
import Reveal, { StaggerGroup, fadeUp } from '../components/common/Reveal';
import ProductGrid from '../components/product/ProductGrid';
import { PRODUCTS } from '../data/products';
import { BRIDAL_EDIT } from '../data/home';

const RITUALS = [
  ['Roka & Engagement', 'Bands and cocktail rings for the first promise.'],
  ['Haldi & Mehendi', 'Light floral gold that loves colour and celebration.'],
  ['Pheras', 'Temple necklaces, rani haars and the full bridal set.'],
  ['Reception', 'Contemporary chokers and statement jhumkas.'],
];

export default function Wedding() {
  const wedding = PRODUCTS.filter((p) => p.collection.includes('wedding') || p.occasion.includes('wedding'));
  return (
    <>
      <PageBanner image="weddingPageBanner" eyebrow="The wedding edit" title="Begin Your Forever With Gold" copy="Heirloom 22K bridal jewellery for every ritual, with private bridal lounges and a dedicated trousseau stylist." crumbs={[['Wedding']]}>
        <div className="flex flex-wrap gap-3">
          <Link to="/appointment" className="btn-primary"><CalendarHeart size={15} /> Book bridal consultation</Link>
          <Link to="/customize?style=bridal" className="btn-outline">Design your bridal set</Link>
        </div>
      </PageBanner>

      <section className="w-full bg-ivory section-y">
        <div className="shell grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="blend-all overflow-hidden">
              <SmartImage name="bridalAccent2" width={1200} sizes="(min-width:1024px) 45vw, 100vw" className="aspect-[4/5] w-full" />
            </div>
            <div className="absolute bottom-6 right-4 rounded-2xl border border-rose-light/60 bg-ivory/90 p-5 backdrop-blur sm:right-10">
              <p className="font-display text-4xl text-rose-deep">2,400+</p>
              <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">brides dressed this season</p>
            </div>
          </Reveal>
          <div>
            <SectionHeading eyebrow="For every ritual" title="A trousseau, thoughtfully planned" copy="Our stylists map each ceremony to the right pieces — balancing heirlooms you’ll keep forever with lighter gold you’ll wear again." />
            <StaggerGroup className="grid gap-3 sm:grid-cols-2">
              {RITUALS.map(([t, c], i) => (
                <motion.div key={t} variants={fadeUp} className="rounded-2xl border border-rose-light/60 bg-ivory p-5">
                  <span className="font-display text-lg italic text-rose">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-1 font-display text-2xl">{t}</p>
                  <p className="mt-1 text-sm text-ink-soft">{c}</p>
                </motion.div>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      <section className="w-full bg-gradient-to-r from-ivory via-cream to-champagne/50 py-12">
        <StaggerGroup className="shell grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {BRIDAL_EDIT.map((b) => (
            <motion.div key={b.name} variants={fadeUp}>
              <Link to={b.to} className="group flex h-full flex-col justify-between rounded-2xl border border-rose-light/70 bg-ivory/80 p-5 transition hover:border-rose hover:bg-rose-blush">
                <Crown size={18} className="text-rose" />
                <span className="mt-6 block font-display text-xl">{b.name}</span>
                <span className="mt-1 flex items-center justify-between text-xs text-ink-faint">{b.note}<ArrowUpRight size={14} className="text-rose transition group-hover:-translate-y-0.5" /></span>
              </Link>
            </motion.div>
          ))}
        </StaggerGroup>
      </section>

      <section className="w-full bg-ivory section-y">
        <div className="shell">
          <SectionHeading eyebrow="Wedding collection" title="Bridal Favourites" action={{ label: 'Shop all wedding', to: '/products?collection=wedding' }} />
          <ProductGrid products={wedding} />
        </div>
      </section>

      <section className="w-full bg-gradient-to-br from-ivory via-ivory to-peach py-16">
        <div className="shell grid gap-6 md:grid-cols-3">
          {[
            [Gem, 'Bridal lounge', 'Private try-on suites with refreshments and family seating.', '/appointment'],
            [Sparkles, 'Heirloom redesign', 'Transform family gold into your own bridal pieces.', '/customize?style=bridal'],
            [Crown, 'Wedding gold coins', 'Shagun coins with twin-ring and saat phere motifs.', '/gold-coins?cat=wedding'],
          ].map(([I, t, c, to]) => (
            <Link key={t} to={to} className="group rounded-3xl bg-ivory/80 p-7 transition hover:bg-rose-blush hover:shadow-rose-lg">
              <I size={22} className="text-rose" />
              <p className="mt-4 font-display text-3xl">{t}</p>
              <p className="mt-2 text-sm text-ink-soft">{c}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-rose-deep">Discover <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
