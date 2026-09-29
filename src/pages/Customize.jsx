import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, PenTool, ShieldCheck, Sparkles } from 'lucide-react';
import PageBanner from '../components/common/PageBanner';
import CustomDesignWizard from '../components/customize/CustomDesignWizard';
import { StaggerGroup, fadeUp } from '../components/common/Reveal';

const PROMISES = [
  [PenTool, 'Hand sketch + CAD render', 'See your piece in 3D before a gram of gold is cast.'],
  [MessageCircle, 'A dedicated designer', 'One expert guides you from idea to delivery on WhatsApp.'],
  [ShieldCheck, 'Pay after approval', 'No payment until you love the final design.'],
  [Sparkles, 'Hallmarked & insured', 'BIS HUID certified and delivered fully insured.'],
];

export default function Customize() {
  const [params] = useSearchParams();
  return (
    <>
      <PageBanner image="pageBanner_customize" eyebrow="Custom jewellery studio" title="Designed Especially For You" copy="Turn your idea into a jewellery piece that belongs only to you — engraved names, heirloom redesigns and bespoke bridal sets." crumbs={[['Customize']]} />
      <section className="w-full bg-ivory py-14 lg:py-20">
        <div className="shell">
          <CustomDesignWizard key={params.toString()} />
        </div>
      </section>
      <section className="w-full bg-gradient-to-r from-ivory via-cream to-champagne/50 py-14">
        <StaggerGroup className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(([I, t, c]) => (
            <motion.div key={t} variants={fadeUp} className="rounded-3xl border border-rose-light/60 bg-ivory/80 p-6">
              <I size={22} className="text-rose" strokeWidth={1.5} />
              <p className="mt-4 font-display text-2xl">{t}</p>
              <p className="mt-1 text-sm text-ink-soft">{c}</p>
            </motion.div>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}
