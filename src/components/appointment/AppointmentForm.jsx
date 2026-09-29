import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { STORES } from '../../data/content';
import { CATEGORIES } from '../../data/categories';
import { appointmentService } from '../../services';
import { formatDate } from '../../utils/format';

const TIMES = ['11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM', '5:00 PM', '6:30 PM'];
const today = new Date().toISOString().slice(0, 10);

const EMPTY = { name: '', mobile: '', email: '', city: '', store: '', category: '', date: '', time: '', message: '' };

export default function AppointmentForm({ defaultStore = '' }) {
  const [form, setForm] = useState({ ...EMPTY, store: defaultStore });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [booking, setBooking] = useState(null);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name';
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g, '').slice(-10))) e.mobile = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.store) e.store = 'Choose a boutique';
    if (!form.date) e.date = 'Pick a date';
    if (!form.time) e.time = 'Pick a time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    const res = await appointmentService.book(form);
    setBooking(res);
    setStatus('done');
  };

  const field = (k, label, props = {}) => (
    <div>
      <label htmlFor={`apt-${k}`} className="label">
        {label}
      </label>
      <input id={`apt-${k}`} value={form[k]} onChange={set(k)} className="input" aria-invalid={Boolean(errors[k])} {...props} />
      {errors[k] && <p className="mt-1 text-xs text-rose-deep">{errors[k]}</p>}
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {status === 'done' ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center rounded-[28px] border border-rose-light/60 bg-ivory p-10 text-center shadow-soft">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-rose text-white">
            <CalendarCheck size={28} />
          </motion.span>
          <h3 className="mt-5 font-display text-3xl">We’ll see you soon, {form.name.split(' ')[0]}</h3>
          <p className="mt-2 text-sm text-ink-soft">
            {formatDate(form.date, { weekday: 'long', day: 'numeric', month: 'long' })} at {form.time} · {STORES.find((s) => s.id === form.store)?.name}
          </p>
          <p className="mt-1 text-xs text-ink-faint">Reference {booking?.id}. A confirmation has been sent by SMS{form.email && ' and email'}.</p>
          <button
            onClick={() => {
              setForm({ ...EMPTY });
              setStatus('idle');
            }}
            className="btn-outline mt-7"
          >
            Book another
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-[28px] border border-rose-light/60 bg-ivory/90 p-6 shadow-soft backdrop-blur sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {field('name', 'Name', { autoComplete: 'name', placeholder: 'Your full name' })}
            {field('mobile', 'Mobile', { inputMode: 'tel', autoComplete: 'tel', placeholder: '98XXXXXXXX' })}
            {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'Optional' })}
            {field('city', 'City', { placeholder: 'e.g. Mumbai' })}
            <div>
              <label htmlFor="apt-store" className="label">Store</label>
              <select id="apt-store" value={form.store} onChange={set('store')} className="input" aria-invalid={Boolean(errors.store)}>
                <option value="">Select a boutique</option>
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>{s.area}, {s.city}</option>
                ))}
                <option value="virtual">Virtual video consultation</option>
              </select>
              {errors.store && <p className="mt-1 text-xs text-rose-deep">{errors.store}</p>}
            </div>
            <div>
              <label htmlFor="apt-category" className="label">Jewellery category</label>
              <select id="apt-category" value={form.category} onChange={set('category')} className="input">
                <option value="">Any / not sure</option>
                <option value="bridal">Bridal Jewellery</option>
                <option value="custom">Custom Design</option>
                <option value="coins">Gold Coins</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            {field('date', 'Date', { type: 'date', min: today })}
            <div>
              <span className="label">Time</span>
              <div className="grid grid-cols-3 gap-1.5">
                {TIMES.map((t) => (
                  <button type="button" key={t} onClick={() => set('time')({ target: { value: t } })} className={`rounded-lg border px-1 py-2.5 text-[11px] transition ${form.time === t ? 'border-rose bg-rose-blush text-rose-deep' : 'border-rose-light/70 text-ink-soft hover:border-rose'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {errors.time && <p className="mt-1 text-xs text-rose-deep">{errors.time}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="apt-message" className="label">Message</label>
              <textarea id="apt-message" value={form.message} onChange={set('message')} rows={3} className="input resize-none" placeholder="Tell us about the occasion, budget or pieces you love" />
            </div>
          </div>
          <button disabled={status === 'loading'} className="btn-primary mt-6 w-full sm:w-auto">
            {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />} Book Appointment
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
