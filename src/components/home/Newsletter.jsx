import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Reveal from '../common/Reveal';
import { LogoMark } from '../common/Logo';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState('error');
      return;
    }
    setState('done');
  };

  return (
    <section className="relative w-full overflow-hidden border-t border-rose-light/60 bg-ivory py-16 lg:py-24">
      <div className="shell relative grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="flex items-start gap-5">
          <LogoMark size={64} className="hidden shrink-0 sm:block" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-luxe text-rose-deep">The Golden Circle</p>
            <h2 className="heading-lg mt-3 text-ink">Welcome to the Golden Circle</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink/80">Discover new collections, exclusive offers and jewellery inspiration.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <AnimatePresence mode="wait">
            {state === 'done' ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-full border border-rose-light bg-ivory p-3 pr-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose text-white">
                  <Check size={20} />
                </span>
                <p className="text-sm text-ink">You’re in. Look out for a welcome gift in your inbox.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:rounded-full sm:border sm:border-rose-light sm:bg-ivory sm:p-2">
                <label htmlFor="nl-email" className="sr-only">Email address</label>
                <input
                  id="nl-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setState('idle');
                  }}
                  placeholder="Your email address"
                  className="w-full rounded-full border border-rose-light bg-ivory px-6 sm:border-0 py-4 text-sm text-ink placeholder:text-ink-faint focus:outline-none sm:bg-transparent sm:py-3"
                />
                <button className="btn-primary shrink-0">
                  Subscribe <ArrowRight size={15} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          {state === 'error' && <p className="mt-2 pl-4 text-xs text-rose-deep">Please enter a valid email address.</p>}
          <p className="mt-3 pl-4 text-[11px] text-ink/70">By subscribing you agree to receive marketing emails. Unsubscribe anytime.</p>
        </Reveal>
      </div>
    </section>
  );
}
