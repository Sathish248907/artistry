import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Gem, Ruler, Video } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import AppointmentForm from '../components/appointment/AppointmentForm';
import { LogoMark } from '../components/common/Logo';
import { EASE, StaggerGroup, fadeUp } from '../components/common/Reveal';
import { STORES } from '../data/content';

const EXPECT = [
  [Gem, 'Private try-on', 'A stylist curates pieces before you arrive, based on your notes.'],
  [Ruler, 'Free sizing', 'Rings and bangles sized precisely while you wait.'],
  [Video, 'Or meet on video', 'Live video consultations with our designers, anywhere in India.'],
  [Coffee, 'No obligation', 'Complimentary refreshments — and absolutely no pressure to buy.'],
];

export default function Appointment() {
  const [params] = useSearchParams();
  const store = STORES.some((s) => s.id === params.get('store')) ? params.get('store') : '';

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-ivory via-cream to-champagne/50">
      <div className="shell relative grid gap-12 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <Breadcrumbs items={[['Book an Appointment']]} />
          <LogoMark size={56} className="mt-10" />
          <p className="eyebrow mt-6">Book an appointment</p>
          <h1 className="heading-xl mt-3">Experience Jewellery in Person</h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">Reserve a private session at your nearest boutique. Bring your ideas, heirlooms or Pinterest boards — we’ll bring the gold.</p>
          <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2">
            {EXPECT.map(([I, t, c]) => (
              <motion.div key={t} variants={fadeUp} className="rounded-2xl border border-rose-light/60 bg-ivory/70 p-5">
                <I size={20} className="text-rose" strokeWidth={1.5} />
                <p className="mt-3 font-display text-xl">{t}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{c}</p>
              </motion.div>
            ))}
          </StaggerGroup>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: EASE }} className="lg:pt-16">
          <AppointmentForm defaultStore={store} />
        </motion.div>
      </div>
    </section>
  );
}
