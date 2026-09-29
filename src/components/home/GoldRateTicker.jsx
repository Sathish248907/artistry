import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import GoldRateChart from './GoldRateChart';
import Reveal, { StaggerGroup, fadeUp } from '../common/Reveal';
import { GOLD_RATES } from '../../data/goldRates';
import { formatNumber, formatTime, classNames } from '../../utils/format';
import { BRAND } from '../../data/brand';

const FACTORS = { '24K': 1, '22K': 0.916, '18K': 0.75 };

export default function GoldRateTicker() {
  const [purity, setPurity] = useState('22K');
  const [days, setDays] = useState(30);
  const r = GOLD_RATES.rates[purity];
  const change = r.per10g - r.prev;
  const pct = ((change / r.prev) * 100).toFixed(2);
  const up = change >= 0;

  return (
    <section id="gold-rate" className="relative w-full scroll-mt-24 overflow-hidden bg-gradient-to-br from-ivory via-cream to-champagne/60 section-y">
      <div className="shell relative grid gap-10 xl:grid-cols-[1fr_1.15fr] xl:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-rose/60" /> Live board · {GOLD_RATES.city}
            </p>
            <h2 className="heading-lg mt-3">Today’s Gold Rate</h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
              <Clock size={14} className="text-rose" /> Last updated today at {formatTime(GOLD_RATES.updatedAt)} · Indicative, per 10 grams
            </p>
          </Reveal>

          <StaggerGroup className="mt-8 grid gap-3 sm:grid-cols-3">
            {Object.entries(GOLD_RATES.rates).map(([k, v]) => {
              const d = v.per10g - v.prev;
              const on = purity === k;
              return (
                <motion.button
                  key={k}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  onClick={() => setPurity(k)}
                  aria-pressed={on}
                  className={classNames(
                    'relative overflow-hidden rounded-3xl border p-5 text-left transition-colors duration-300',
                    on ? 'border-rose bg-ivory shadow-rose-lg' : 'border-rose-light/70 bg-ivory/70 hover:bg-rose-blush',
                  )}
                >
                  {on && <motion.span layoutId="rate-active" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose via-rose-light to-gold" />}
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-rose-deep">{v.label}</p>
                  <p className="mt-3 font-display text-[32px] leading-none text-ink">₹{formatNumber(v.per10g)}</p>
                  <p className="mt-1 text-xs text-ink-faint">per 10g · {v.fineness} fineness</p>
                  <p className={classNames('mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', d >= 0 ? 'bg-rose-blush text-rose-deep' : 'bg-rose-blush text-rose-deep')}>
                    {d >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {d >= 0 ? '+' : '–'}₹{formatNumber(Math.abs(d))}
                  </p>
                </motion.button>
              );
            })}
          </StaggerGroup>

          <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/gold-rates" className="btn-primary">
              View Gold Rate <ArrowRight size={15} />
            </Link>
            <p className="text-xs text-ink-soft">Every product price on {BRAND.name} updates automatically with this board.</p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="rounded-[28px] border border-rose-light/60 bg-ivory/80 p-5 shadow-soft backdrop-blur sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">{purity} gold price trend</p>
              <p className="mt-2 font-display text-4xl text-ink">₹{formatNumber(r.per10g)}</p>
              <p className={classNames('mt-1 text-sm font-medium', up ? 'text-rose-deep' : 'text-rose-deep')}>
                Today’s change {up ? '▲' : '▼'} ₹{formatNumber(Math.abs(change))} ({up ? '+' : ''}
                {pct}%)
              </p>
            </div>
            <div className="flex rounded-full border border-rose-light/70 bg-cream p-1 text-xs" role="tablist" aria-label="Range">
              {[7, 15, 30].map((d) => (
                <button key={d} role="tab" aria-selected={days === d} onClick={() => setDays(d)} className={classNames('rounded-full px-3.5 py-1.5 transition', days === d ? 'bg-ivory text-rose-deep shadow-soft' : 'text-ink-soft')}>
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <GoldRateChart data={GOLD_RATES.history} factor={FACTORS[purity]} days={days} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
