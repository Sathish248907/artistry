import { motion } from 'framer-motion';
import { Heart, Instagram } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Reveal, { StaggerGroup, fadeUp } from '../common/Reveal';
import { INSTAGRAM } from '../../data/content';
import { BRAND } from '../../data/brand';

// Masonry via CSS columns — full-bleed, each tile a unique photograph with its own aspect.
const HEIGHTS = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[4/5]'];

export default function InstagramGallery() {
  return (
    <section className="w-full bg-ivory pb-16 pt-14 lg:pb-24 lg:pt-20">
      <Reveal className="shell mb-10 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-ivory to-champagne text-rose-deep">
          <Instagram size={24} strokeWidth={1.5} />
        </span>
        <h2 className="heading-lg mt-4">Follow Our Golden Story</h2>
        <a href="#instagram" onClick={(e) => e.preventDefault()} className="mt-2 text-sm font-medium text-rose-deep hover:underline">
          {BRAND.instagram}
        </a>
      </Reveal>
      <StaggerGroup className="w-full columns-2 gap-2 px-2 sm:columns-3 lg:columns-5" step={0.05}>
        {INSTAGRAM.map((post, i) => (
          <motion.a key={post.id} variants={fadeUp} href="#instagram" onClick={(e) => e.preventDefault()} className="group relative mb-2 block break-inside-avoid overflow-hidden rounded-2xl" aria-label="Instagram post">
            <SmartImage name={post.image} width={700} sizes="(min-width:1024px) 20vw, 50vw" zoom className={`${HEIGHTS[i]} w-full`} />
            <span className="absolute inset-0 flex items-center justify-center gap-2 bg-rose/0 text-sm font-medium text-white opacity-0 transition duration-500 group-hover:bg-rose/35 group-hover:opacity-100">
              <Heart size={16} fill="currentColor" /> {post.likes.toLocaleString('en-IN')}
            </span>
          </motion.a>
        ))}
      </StaggerGroup>
    </section>
  );
}
