import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Gift, Heart, Landmark, PartyPopper, RotateCcw, Sparkles, Sun, User } from 'lucide-react';
import Reveal, { EASE, stagger } from '../common/Reveal';
import ProductCard from '../product/ProductCard';
import { FINDER_POOL } from '../../data/home';
import { classNames } from '../../utils/format';

const STEPS = [
  {
    key: 'purpose',
    q: 'What are you shopping for?',
    options: [
      { id: 'myself', label: 'Myself', icon: User },
      { id: 'wedding', label: 'Wedding', icon: Heart },
      { id: 'gift', label: 'Gift', icon: Gift },
      { id: 'everyday', label: 'Everyday', icon: Sun },
      { id: 'festival', label: 'Festival', icon: PartyPopper },
    ],
  },
  {
    key: 'piece',
    q: 'Choose jewellery',
    options: [
      { id: 'rings', label: 'Ring' },
      { id: 'necklaces', label: 'Necklace' },
      { id: 'earrings', label: 'Earrings' },
      { id: 'bangles', label: 'Bangle' },
      { id: 'bracelets', label: 'Bracelet' },
    ],
  },
  {
    key: 'style',
    q: 'Choose your style',
    options: [
      { id: 'traditional', label: 'Traditional', icon: Landmark },
      { id: 'modern', label: 'Modern', icon: Sparkles },
      { id: 'minimal', label: 'Minimal', icon: Sun },
      { id: 'statement', label: 'Statement', icon: Heart },
    ],
  },
];

const PURPOSE_OCCASIONS = { wedding: ['wedding', 'engagement'], gift: ['gifting', 'birthday', 'anniversary'], everyday: ['everyday'], festival: ['festival'], myself: [] };
const STYLE_TYPES = { traditional: ['traditional', 'temple'], modern: ['contemporary'], minimal: ['daily-wear', 'office-wear'], statement: ['temple', 'traditional', 'contemporary'] };

function recommend({ purpose, piece, style }) {
  const scored = FINDER_POOL.map((p) => {
    let s = 0;
    if (p.categories.includes(piece)) s += 10;
    if (PURPOSE_OCCASIONS[purpose]?.some((o) => p.occasion.includes(o))) s += 4;
    if (STYLE_TYPES[style]?.includes(p.type)) s += 3;
    if (style === 'statement' && p.weight > 12) s += 3;
    if (style === 'minimal' && p.weight < 8) s += 2;
    return { p, s: s + p.rating / 10 };
  });
  return scored.sort((a, b) => b.s - a.s).slice(0, 4).map((x) => x.p);
}

export default function JewelleryFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const done = step >= STEPS.length;
  const results = useMemo(() => (done ? recommend(answers) : []), [done, answers]);

  const choose = (key, id) => {
    setAnswers((a) => ({ ...a, [key]: id }));
    setTimeout(() => setStep((s) => s + 1), 220);
  };
  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const label = (key) => STEPS.find((s) => s.key === key)?.options.find((o) => o.id === answers[key])?.label;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-ivory via-ivory to-peach section-y">
      <div className="shell relative">
        <Reveal className="flex flex-col items-center text-center">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-rose/60" /> Personal stylist <span className="h-px w-8 bg-rose/60" />
          </p>
          <h2 className="heading-lg mt-3">Find Jewellery Made for You</h2>
          <p className="mt-3 max-w-lg text-[15px] text-ink-soft">Three quick questions. One curated edit, chosen just for you.</p>
        </Reveal>

        {/* Progress */}
        <div className="mx-auto mt-10 flex max-w-xl items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i >= step}
                className={classNames('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm transition', i < step || done ? 'border-rose bg-rose text-white' : i === step ? 'border-rose bg-ivory text-rose-deep' : 'border-rose-light bg-ivory/60 text-ink-faint')}
                aria-label={`Step ${i + 1}`}
              >
                {i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 bg-rose-light">
                  <motion.div className="h-full bg-rose" animate={{ width: i < step ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 min-h-[260px]">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.45, ease: EASE }} className="flex flex-col items-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h3 className="mt-2 text-center font-display text-3xl sm:text-4xl">{STEPS[step].q}</h3>
                <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="mt-8 flex flex-wrap justify-center gap-3">
                  {STEPS[step].options.map((o) => {
                    const I = o.icon;
                    const on = answers[STEPS[step].key] === o.id;
                    return (
                      <motion.button
                        key={o.id}
                        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => choose(STEPS[step].key, o.id)}
                        className={classNames('flex min-w-[130px] flex-col items-center gap-3 rounded-3xl border px-6 py-6 transition-colors sm:min-w-[150px]', on ? 'border-rose bg-ivory shadow-rose-lg' : 'border-rose-light/70 bg-ivory/70 hover:border-rose hover:bg-rose-blush')}
                      >
                        {I && (
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-blush text-rose">
                            <I size={20} strokeWidth={1.6} />
                          </span>
                        )}
                        <span className="font-display text-xl text-ink">{o.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
                {step > 0 && (
                  <button onClick={() => setStep((s) => s - 1)} className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-soft hover:text-rose-deep">
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
                  <div>
                    <h3 className="font-display text-3xl sm:text-4xl">Jewellery Selected For You</h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      {label('style')} {label('piece')?.toLowerCase()} pieces for {label('purpose')?.toLowerCase()} — hand-picked from our current collection.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={reset} className="btn-outline">
                      <RotateCcw size={14} /> Start over
                    </button>
                    <Link to={`/products?category=${answers.piece}`} className="btn-primary">
                      See all <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
                <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
