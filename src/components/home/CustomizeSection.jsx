import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PenLine } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import Reveal, { StaggerGroup, fadeUp } from '../common/Reveal';
import DesignPreview from '../customize/DesignPreview';
import { classNames } from '../../utils/format';

const STEPS = ['Choose Jewellery', 'Choose Design', 'Personalise', 'Approve Design', 'Craft'];

const OPTIONS = [
  { label: 'Custom Ring', type: 'ring', style: 'traditional' },
  { label: 'Custom Necklace', type: 'necklace', style: 'traditional' },
  { label: 'Custom Bangle', type: 'bangle', style: 'traditional' },
  { label: 'Custom Bracelet', type: 'bracelet', style: 'modern' },
  { label: 'Custom Pendant', type: 'pendant', style: 'modern' },
  { label: 'Custom Wedding Jewellery', type: 'necklace', style: 'bridal' },
  { label: 'Name Engraving', type: 'ring', style: 'minimal' },
  { label: 'Initial Jewellery', type: 'pendant', style: 'minimal' },
];

export default function CustomizeSection() {
  const [opt, setOpt] = useState(OPTIONS[4]);
  const [text, setText] = useState('Meera');
  const [purity, setPurity] = useState('22K');

  const initialOnly = opt.label === 'Initial Jewellery';
  const shown = initialOnly ? text.slice(0, 1).toUpperCase() : text;

  return (
    <section className="relative w-full overflow-hidden bg-ivory">
      <div className="grid w-full xl:grid-cols-[0.9fr_1.1fr]">
        {/* Image bleeds to the left edge */}
        <div className="relative h-[52vh] min-h-[380px] xl:h-auto">
          <SmartImage name="customize" width={1600} sizes="(min-width:1280px) 45vw, 100vw" className="blend-y absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-transparent xl:bg-gradient-to-l xl:from-ivory xl:via-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-ivory/90 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-rose-deep shadow-soft sm:left-6 lg:left-10">
            <PenLine size={14} /> Sketch to heirloom
          </div>
        </div>

        <div className="shell py-14 xl:py-24 xl:pl-12">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-rose" /> Customize your jewellery
            </p>
            <h2 className="heading-lg mt-3">Designed Especially For You</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">Turn your idea into a jewellery piece that belongs only to you.</p>
          </Reveal>

          {/* Process */}
          <StaggerGroup className="relative mt-10 grid grid-cols-5 gap-2">
            <div className="absolute left-[10%] right-[10%] top-5 h-px bg-rose-light" />
            {STEPS.map((s, i) => (
              <motion.div key={s} variants={fadeUp} className="relative flex flex-col items-center text-center">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-rose bg-ivory font-display text-sm text-rose-deep">{String(i + 1).padStart(2, '0')}</span>
                <span className="mt-2 text-[10px] font-medium uppercase leading-tight tracking-[0.1em] text-ink-soft sm:text-[11px] sm:tracking-[0.14em]">{s}</span>
              </motion.div>
            ))}
          </StaggerGroup>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            {/* Options + personalisation */}
            <Reveal>
              <p className="label">What would you like to create?</p>
              <div className="flex flex-wrap gap-2">
                {OPTIONS.map((o) => (
                  <button key={o.label} onClick={() => setOpt(o)} className={classNames('chip', opt.label === o.label && 'chip-active')}>
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
                <div>
                  <label htmlFor="engrave" className="label">
                    {initialOnly ? 'Your initial' : 'Name or word to engrave'}
                  </label>
                  <input id="engrave" value={text} maxLength={14} onChange={(e) => setText(e.target.value)} className="input" placeholder="e.g. Meera" />
                </div>
                <div>
                  <span className="label">Gold</span>
                  <div className="flex rounded-xl border border-rose-light/70 bg-ivory p-1">
                    {['22K', '18K'].map((k) => (
                      <button key={k} onClick={() => setPurity(k)} className={classNames('rounded-lg px-3 py-2 text-sm transition', purity === k ? 'bg-rose-blush text-rose-deep' : 'text-ink-soft')}>
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Link to={`/customize?type=${opt.type}&style=${opt.style}&purity=${purity}&text=${encodeURIComponent(text)}`} className="btn-primary mt-8">
                Start Custom Design <ArrowRight size={15} />
              </Link>
            </Reveal>

            {/* Live preview */}
            <Reveal delay={0.1} className="relative flex flex-col items-center justify-center rounded-[28px] border border-rose-light/60 bg-gradient-to-br from-ivory via-cream to-champagne/60 p-6">
              <span className="absolute left-4 top-4 rounded-full bg-ivory/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-rose-deep">Live preview</span>
              <div className="flex aspect-square w-full max-w-[300px] items-center justify-center">
                <DesignPreview type={opt.type} style={opt.style} purity={purity} text={shown} />
              </div>
              <p className="text-center text-xs text-ink-soft">
                {opt.label} · {purity} gold · {opt.style}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
