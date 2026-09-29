import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarClock, Check, Loader2, Sparkles } from 'lucide-react';
import DesignPreview from './DesignPreview';
import { EASE } from '../common/Reveal';
import { customDesignService } from '../../services';
import { priceBreakup } from '../../utils/pricing';
import { addBusinessDays, classNames, formatDate, formatINR } from '../../utils/format';

const TYPES = [
  { id: 'ring', label: 'Ring', weight: 5, note: 'Bands, signets & cocktail rings' },
  { id: 'necklace', label: 'Necklace', weight: 18, note: 'Chokers, haars & name chains' },
  { id: 'bangle', label: 'Bangle', weight: 14, note: 'Kadas & engraved bangles' },
  { id: 'bracelet', label: 'Bracelet', weight: 9, note: 'ID plates & link bracelets' },
  { id: 'pendant', label: 'Pendant', weight: 4, note: 'Initials, motifs & lockets' },
];
const PURITIES = [
  { id: '22K', label: '22K Gold', note: '91.6% pure · rich yellow, traditional choice' },
  { id: '18K', label: '18K Gold', note: '75% pure · stronger, ideal for fine detailing' },
];
const STYLES = [
  { id: 'traditional', label: 'Traditional', factor: 1.2, making: 15, note: 'Filigree, granulation & gemstone accents' },
  { id: 'modern', label: 'Modern', factor: 1, making: 14, note: 'Geometric forms, clean polished planes' },
  { id: 'minimal', label: 'Minimal', factor: 0.8, making: 12, note: 'Featherlight, understated everyday gold' },
  { id: 'bridal', label: 'Bridal', factor: 1.6, making: 18, note: 'Kundan-inspired florals, heirloom scale' },
];
const STEPS = ['Choose Jewellery', 'Choose Gold', 'Choose Design', 'Personalisation', 'Request Design'];

function OptionCard({ on, onClick, title, note, children }) {
  return (
    <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={onClick} className={classNames('relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors', on ? 'border-rose bg-ivory shadow-rose' : 'border-rose-light/70 bg-ivory/70 hover:border-rose')}>
      {children}
      <span className="flex-1">
        <span className="block font-display text-xl text-ink">{title}</span>
        <span className="text-xs text-ink-soft">{note}</span>
      </span>
      <span className={classNames('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', on ? 'border-rose bg-rose text-white' : 'border-rose-light')}>{on && <Check size={13} />}</span>
    </motion.button>
  );
}

export default function CustomDesignWizard() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    type: TYPES.some((t) => t.id === params.get('type')) ? params.get('type') : 'ring',
    purity: params.get('purity') === '18K' ? '18K' : '22K',
    style: STYLES.some((s) => s.id === params.get('style')) ? params.get('style') : 'traditional',
    name: params.get('text') || '',
    initials: '',
    date: '',
    message: '',
    contactName: '',
    mobile: '',
  });
  const [status, setStatus] = useState('idle');
  const [request, setRequest] = useState(null);
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));

  const type = TYPES.find((t) => t.id === d.type);
  const style = STYLES.find((s) => s.id === d.style);
  const weight = +(type.weight * style.factor).toFixed(2);
  const engraving = d.name || d.initials || d.date ? 1500 : 0;
  const estimate = useMemo(() => priceBreakup({ purity: d.purity, weight, makingPct: style.making }).total + engraving, [d.purity, weight, style.making, engraving]);
  const deliveryDays = d.style === 'bridal' ? 28 : 18;
  const previewText = d.name || d.initials || (d.date ? formatDate(d.date, { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.') : '');

  const mobileOk = /^[6-9]\d{9}$/.test(d.mobile);
  const canNext = step !== 4 || (d.contactName.trim().length > 1 && mobileOk);

  const submit = async () => {
    setStatus('loading');
    const res = await customDesignService.request({ ...d, weight, estimate });
    setRequest(res);
    setStatus('done');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,0.8fr)] xl:gap-14 [&>*]:min-w-0">
      <div>
        {/* Stepper */}
        <ol className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center gap-2">
              <button onClick={() => i < step && status !== 'done' && setStep(i)} disabled={i > step} className={classNames('flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-xs transition', i === step ? 'border-rose bg-rose-blush text-rose-deep' : i < step ? 'border-rose/40 bg-ivory text-ink' : 'border-rose-light/60 bg-ivory/60 text-ink-faint')}>
                <span className={classNames('flex h-6 w-6 items-center justify-center rounded-full text-[11px]', i < step ? 'bg-rose text-white' : i === step ? 'bg-ivory text-rose-deep' : 'bg-rose-blush/50')}>{i < step ? <Check size={12} /> : i + 1}</span>
                {s}
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-4 bg-rose-light" />}
            </li>
          ))}
        </ol>

        <div className="mt-8 min-h-[420px]">
          <AnimatePresence mode="wait">
            {status === 'done' ? (
              <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-rose-light/60 bg-ivory p-8 text-center sm:p-12">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose text-white">
                  <Sparkles size={26} />
                </motion.span>
                <h3 className="mt-5 font-display text-4xl">Your design request is in</h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">Request {request?.id}. A designer will call {d.contactName.split(' ')[0]} within 24 hours and share a hand sketch and CAD render for approval — no payment until you approve.</p>
                <button onClick={() => { setStatus('idle'); setStep(0); }} className="btn-outline mt-8">Design another piece</button>
              </motion.div>
            ) : (
              <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: EASE }}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Step {step + 1} of 5</p>
                <h2 className="mt-2 font-display text-4xl">{STEPS[step]}</h2>

                {step === 0 && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {TYPES.map((t) => (
                      <OptionCard key={t.id} on={d.type === t.id} onClick={() => set('type', t.id)} title={t.label} note={t.note}>
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-blush">
                          <DesignPreview type={t.id} purity={d.purity} style="minimal" text="" size={56} />
                        </span>
                      </OptionCard>
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {PURITIES.map((p) => (
                      <OptionCard key={p.id} on={d.purity === p.id} onClick={() => set('purity', p.id)} title={p.label} note={p.note}>
                        <span className={classNames('h-14 w-14 shrink-0 rounded-full', p.id === '22K' ? 'bg-gradient-to-br from-[#FBE4DF] via-[#D99A99] to-[#A9646C]' : 'bg-gradient-to-br from-[#FDEDEA] via-[#E7B8B6] to-[#C08589]')} />
                      </OptionCard>
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {STYLES.map((s) => (
                      <OptionCard key={s.id} on={d.style === s.id} onClick={() => set('style', s.id)} title={s.label} note={s.note}>
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-blush">
                          <DesignPreview type={d.type} purity={d.purity} style={s.id} text="" size={56} />
                        </span>
                      </OptionCard>
                    ))}
                  </div>
                )}
                {step === 3 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="cd-name">Name</label>
                      <input id="cd-name" maxLength={14} value={d.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="e.g. Aanya" />
                    </div>
                    <div>
                      <label className="label" htmlFor="cd-initials">Initials</label>
                      <input id="cd-initials" maxLength={3} value={d.initials} onChange={(e) => set('initials', e.target.value.toUpperCase())} className="input" placeholder="e.g. A&R" />
                    </div>
                    <div>
                      <label className="label" htmlFor="cd-date">Special date</label>
                      <input id="cd-date" type="date" value={d.date} onChange={(e) => set('date', e.target.value)} className="input" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="cd-msg">Message for our designers</label>
                      <textarea id="cd-msg" rows={4} value={d.message} onChange={(e) => set('message', e.target.value)} className="input resize-none" placeholder="Inspiration, references, stones you love, budget…" />
                    </div>
                    <p className="text-xs text-ink-faint sm:col-span-2">The preview engraves your name first, then initials, then the date. Hand engraving adds ₹1,500.</p>
                  </div>
                )}
                {step === 4 && (
                  <div className="mt-6 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ['Piece', `${d.purity} ${style.label} ${type.label}`],
                        ['Estimated weight', `${weight} g`],
                        ['Engraving', previewText || 'None'],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-2xl border border-rose-light/60 bg-ivory p-4">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">{k}</p>
                          <p className="mt-1 text-sm font-medium capitalize text-ink">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label" htmlFor="cd-cname">Your name</label>
                        <input id="cd-cname" value={d.contactName} onChange={(e) => set('contactName', e.target.value)} className="input" placeholder="Full name" />
                      </div>
                      <div>
                        <label className="label" htmlFor="cd-mobile">Mobile</label>
                        <input id="cd-mobile" inputMode="tel" value={d.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} className="input" placeholder="10-digit mobile" />
                        {d.mobile.length === 10 && !mobileOk && <p className="mt-1 text-xs text-rose-deep">Enter a valid Indian mobile number</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-10 flex items-center justify-between">
                  <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink-soft hover:text-rose-deep disabled:opacity-30">
                    <ArrowLeft size={14} /> Back
                  </button>
                  {step < 4 ? (
                    <button onClick={() => setStep((s) => s + 1)} className="btn-primary">
                      Continue <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button onClick={submit} disabled={!canNext || status === 'loading'} className="btn-primary">
                      {status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Request Custom Design
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[32px] border border-rose-light/60 bg-gradient-to-br from-ivory via-cream to-champagne/60 shadow-soft">
          <div className="flex items-center justify-between px-6 pt-5">
            <span className="rounded-full bg-ivory/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-rose-deep">Design preview</span>
            <span className="text-xs capitalize text-ink-soft">{d.purity} · {d.style}</span>
          </div>
          <div className="mx-auto flex aspect-square w-full max-w-[360px] items-center justify-center p-6">
            <DesignPreview type={d.type} purity={d.purity} style={d.style} text={previewText} size={340} />
          </div>
          <div className="grid grid-cols-2 border-t border-rose-light/60 bg-ivory/70">
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">Estimated price</p>
              <p className="mt-1 font-display text-3xl text-rose-deep">{formatINR(estimate)}</p>
              <p className="text-[11px] text-ink-faint">± 8% after final CAD · incl. GST</p>
            </div>
            <div className="border-l border-rose-light/60 p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">Estimated delivery</p>
              <p className="mt-1 flex items-center gap-2 font-display text-2xl text-ink"><CalendarClock size={18} className="text-rose" /> {formatDate(addBusinessDays(deliveryDays), { day: 'numeric', month: 'short' })}</p>
              <p className="text-[11px] text-ink-faint">{deliveryDays} working days after approval</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
