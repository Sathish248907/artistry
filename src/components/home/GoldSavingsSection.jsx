import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Reveal, { StaggerGroup, fadeUp } from '../common/Reveal';
import { SAVINGS_PLANS } from '../../data/content';
import { formatINR } from '../../utils/format';

export default function GoldSavingsSection() {
  const [monthly, setMonthly] = useState(10000);
  const paid = monthly * 11;
  const value = monthly * 12;

  return (
    <section className="relative w-full overflow-hidden bg-cream">
      {/* Full-bleed photographic band */}
      <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <SmartImage name="goldSavings" width={2400} className="blend-band absolute inset-0 h-full w-full" position="70% 50%" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent md:bg-gradient-to-r md:from-cream md:via-cream/70 md:to-transparent" />
        <div className="shell relative flex h-full items-end pb-10 md:items-center md:pb-0">
          <Reveal className="max-w-xl">
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-rose" /> Gold savings
            </p>
            <h2 className="heading-xl mt-4">
              Save Today. <span className="block italic text-gradient">Own Gold Tomorrow.</span>
            </h2>
            <div className="mt-8 max-w-md rounded-3xl border border-rose-light/60 bg-ivory/85 p-5 backdrop-blur">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="monthly" className="text-ink-soft">
                  Monthly instalment
                </label>
                <span className="font-display text-2xl text-rose-deep">{formatINR(monthly)}</span>
              </div>
              <input id="monthly" type="range" min={2000} max={50000} step={1000} value={monthly} onChange={(e) => setMonthly(+e.target.value)} className="mt-3 w-full accent-[#B76E79]" />
              <div className="mt-3 flex justify-between text-xs text-ink-soft">
                <span>You pay {formatINR(paid)} (11 months)</span>
                <span className="font-medium text-ink">You redeem {formatINR(value)}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="shell -mt-2 pb-16 pt-4 lg:pb-24">
        <StaggerGroup className="grid gap-4 lg:grid-cols-3">
          {SAVINGS_PLANS.map((p, i) => (
            <motion.div key={p.id} variants={fadeUp} whileHover={{ y: -6 }} className={`relative overflow-hidden rounded-[28px] border p-7 transition-shadow hover:shadow-rose-lg ${i === 0 ? 'border-rose bg-gradient-to-br from-ivory via-ivory to-champagne/50' : 'border-rose-light/60 bg-ivory'}`}>
              <span className="rounded-full bg-rose-blush px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-rose-deep">{p.tag}</span>
              <h3 className="mt-5 font-display text-3xl">{p.name}</h3>
              <p className="mt-1 text-sm font-medium text-rose-deep">{p.highlight}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.copy}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-ink-soft">
                    <Check size={15} className="text-rose" /> {pt}
                  </li>
                ))}
              </ul>
              <span className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full border border-rose-light/50" />
            </motion.div>
          ))}
        </StaggerGroup>
        <Reveal className="mt-10 flex justify-center">
          <Link to="/account?tab=savings" className="btn-primary">
            Explore Gold Savings <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
