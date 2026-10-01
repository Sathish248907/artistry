import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Check, CreditCard, Home, Loader2, MapPin, Plus, Smartphone, Store, Truck, Wallet, Zap } from 'lucide-react';
import { isProfileComplete, useAuth } from '../../context/AuthContext';
import ProfileDetailsForm from '../account/ProfileDetailsForm';
import { customerService } from '../../services';
import { STORES } from '../../data/content';
import { addBusinessDays, classNames, formatDate, formatINR } from '../../utils/format';

export const STEPS = ['Login', 'Address', 'Delivery', 'Payment', 'Confirmation'];

export function Stepper({ step }) {
  return (
    <ol className="flex items-center">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <motion.span animate={{ scale: i === step ? 1.1 : 1 }} className={classNames('flex h-9 w-9 items-center justify-center rounded-full border text-sm', i < step ? 'border-rose bg-rose text-white' : i === step ? 'border-rose bg-ivory text-rose-deep shadow-rose' : 'border-rose-light bg-ivory/60 text-ink-faint')}>
              {i < step ? <Check size={15} /> : i + 1}
            </motion.span>
            <span className={classNames('hidden text-[10px] uppercase tracking-[0.14em] sm:block', i <= step ? 'text-rose-deep' : 'text-ink-faint')}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="mx-2 mb-0 h-px flex-1 bg-rose-light sm:mb-5">
              <motion.div className="h-full bg-rose" animate={{ width: i < step ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export function LoginStep({ onDone }) {
  const { user, profileComplete, requestOtp, verifyOtp, otpLive } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Resend countdown after an SMS goes out
  useEffect(() => {
    if (!cooldown) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Mobile verified but name, city & email not given yet → ask for them before continuing
  if (user && !profileComplete) return <ProfileDetailsForm onDone={onDone} />;

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-light/60 bg-rose-blush/40 p-5">
        <div>
          <p className="text-sm text-ink-soft">Signed in as</p>
          <p className="font-display text-2xl">{user.name}</p>
          <p className="text-xs text-ink-faint">{user.mobile}{user.verified && ' · verified'} · {user.city}</p>
        </div>
        <button onClick={onDone} className="btn-primary">Continue</button>
      </div>
    );
  }

  const send = async (e) => {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) return setErr('Enter a valid 10-digit mobile number');
    setErr('');
    setBusy(true);
    try {
      await requestOtp(mobile);
      setSent(true);
      setOtp('');
      setCooldown(30);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };
  const verify = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setErr('Enter the 6-digit OTP');
    setErr('');
    setBusy(true);
    try {
      const signedIn = await verifyOtp(mobile, otp);
      // New customers see the name, city & email form next; returning ones go straight on
      if (isProfileComplete(signedIn)) onDone();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={sent ? verify : send} className="max-w-md" aria-busy={busy}>
      <p className="text-sm text-ink-soft">Sign in with your mobile to track orders and earn Golden Circle points.</p>
      <label className="label mt-5" htmlFor="co-mobile">Mobile number</label>
      <div className="flex gap-2">
        <span className="flex items-center rounded-xl border border-rose-light/70 bg-cream px-3 text-sm text-ink-soft">+91</span>
        <input id="co-mobile" value={mobile} disabled={sent} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="tel" autoComplete="tel-national" className="input" placeholder="98XXXXXXXX" />
      </div>
      {sent && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <label className="label mt-4" htmlFor="co-otp">Enter the OTP sent to +91 {mobile}</label>
          <input id="co-otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus className="input tracking-[0.6em]" placeholder="••••••" />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-faint">
            {otpLive ? <span>SMS sent — it can take up to a minute to arrive.</span> : <span>Demo mode: any 6 digits work.</span>}
            <button type="button" onClick={send} disabled={busy || cooldown > 0} className="text-rose-deep underline-offset-2 hover:underline disabled:no-underline disabled:opacity-60">
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
            <button type="button" onClick={() => { setSent(false); setOtp(''); setErr(''); }} className="text-rose-deep underline-offset-2 hover:underline">
              Change number
            </button>
          </div>
        </motion.div>
      )}
      {err && <p className="mt-2 text-xs text-rose-deep" role="alert">{err}</p>}
      {/* Invisible reCAPTCHA anchor for Firebase Phone Auth */}
      <div id="otp-recaptcha" />
      <button disabled={busy} className="btn-primary mt-5">
        {busy && <Loader2 size={15} className="animate-spin" />} {sent ? 'Verify & Continue' : 'Send OTP'}
      </button>
    </form>
  );
}

const EMPTY_ADDR = { label: 'Home', name: '', line: '', city: '', pincode: '', phone: '' };

export function AddressStep({ value, onChange, onDone }) {
  const [list, setList] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_ADDR);
  const [err, setErr] = useState('');

  useEffect(() => {
    customerService.addresses().then((a) => {
      setList(a);
      if (!value) onChange(a.find((x) => x.default) || a[0]);
    });
  }, []);

  const save = (e) => {
    e.preventDefault();
    if (!form.name || !form.line || !form.city || !/^\d{6}$/.test(form.pincode) || !/^\d{10}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      setErr('Please complete all fields with a valid pincode and phone.');
      return;
    }
    const a = { ...form, id: `a${Date.now()}` };
    setList((l) => [...l, a]);
    onChange(a);
    setAdding(false);
    setForm(EMPTY_ADDR);
    setErr('');
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((a) => (
          <button key={a.id} onClick={() => onChange(a)} className={classNames('rounded-2xl border p-5 text-left transition', value?.id === a.id ? 'border-rose bg-ivory shadow-rose' : 'border-rose-light/60 bg-ivory/70 hover:border-rose')}>
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-rose-deep"><Home size={13} /> {a.label}</span>
              <span className={classNames('flex h-5 w-5 items-center justify-center rounded-full border', value?.id === a.id ? 'border-rose bg-rose text-white' : 'border-rose-light')}>{value?.id === a.id && <Check size={11} />}</span>
            </span>
            <span className="mt-3 block font-medium text-ink">{a.name}</span>
            <span className="mt-1 block text-sm text-ink-soft">{a.line}, {a.city} {a.pincode}</span>
            <span className="mt-1 block text-xs text-ink-faint">{a.phone}</span>
          </button>
        ))}
        <button onClick={() => setAdding(true)} className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-rose-light text-sm text-rose-deep hover:bg-rose-blush">
          <Plus size={18} /> Add new address
        </button>
      </div>
      {adding && (
        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={save} className="mt-5 grid gap-3 rounded-2xl border border-rose-light/60 bg-ivory p-5 sm:grid-cols-2">
          {[['name', 'Full name'], ['phone', 'Phone'], ['line', 'House, street, area'], ['city', 'City'], ['pincode', 'Pincode'], ['label', 'Label (Home / Office)']].map(([k, l]) => (
            <div key={k} className={k === 'line' ? 'sm:col-span-2' : ''}>
              <label className="label" htmlFor={`addr-${k}`}>{l}</label>
              <input id={`addr-${k}`} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="input" />
            </div>
          ))}
          {err && <p className="text-xs text-rose-deep sm:col-span-2">{err}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button className="btn-primary">Save address</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-outline">Cancel</button>
          </div>
        </motion.form>
      )}
      <button onClick={onDone} disabled={!value} className="btn-primary mt-6">Deliver here</button>
    </div>
  );
}

export const DELIVERY_OPTIONS = [
  { id: 'standard', icon: Truck, title: 'Insured standard delivery', note: 'Tamper-proof packaging, OTP-verified handover', days: 4, fee: 0 },
  { id: 'express', icon: Zap, title: 'Express delivery', note: 'Priority dispatch in metro cities', days: 2, fee: 500 },
  { id: 'pickup', icon: Store, title: 'Pick up at boutique', note: 'Try on and collect — ready in 24 hours', days: 1, fee: 0 },
];

export function DeliveryStep({ value, onChange, store, onStore, onDone }) {
  return (
    <div>
      <div className="space-y-3">
        {DELIVERY_OPTIONS.map((o) => {
          const I = o.icon;
          const on = value === o.id;
          return (
            <button key={o.id} onClick={() => onChange(o.id)} className={classNames('flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition', on ? 'border-rose bg-ivory shadow-rose' : 'border-rose-light/60 bg-ivory/70 hover:border-rose')}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-blush text-rose"><I size={18} /></span>
              <span className="flex-1">
                <span className="block font-medium text-ink">{o.title}</span>
                <span className="text-xs text-ink-soft">{o.note} · by {formatDate(addBusinessDays(o.days), { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </span>
              <span className="text-sm font-medium text-ink">{o.fee ? formatINR(o.fee) : 'Free'}</span>
            </button>
          );
        })}
      </div>
      {value === 'pickup' && (
        <div className="mt-4">
          <label className="label" htmlFor="pickup-store">Choose boutique</label>
          <select id="pickup-store" value={store} onChange={(e) => onStore(e.target.value)} className="input">
            {STORES.map((s) => <option key={s.id} value={s.id}>{s.area}, {s.city}</option>)}
          </select>
        </div>
      )}
      <button onClick={onDone} className="btn-primary mt-6">Continue to payment</button>
    </div>
  );
}

export const PAYMENT_METHODS = [
  { id: 'upi', icon: Smartphone, label: 'UPI' },
  { id: 'credit', icon: CreditCard, label: 'Credit Card' },
  { id: 'debit', icon: CreditCard, label: 'Debit Card' },
  { id: 'netbanking', icon: Building2, label: 'Net Banking' },
  { id: 'wallet', icon: Wallet, label: 'Wallet' },
];

export function PaymentStep({ method, onMethod, total, onPay, busy }) {
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '' });
  const [bank, setBank] = useState('');
  const [wallet, setWallet] = useState('');
  const [err, setErr] = useState('');

  const pay = () => {
    if (method === 'upi' && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi)) return setErr('Enter a valid UPI ID, e.g. name@okbank');
    if ((method === 'credit' || method === 'debit') && (card.number.replace(/\s/g, '').length < 15 || !/^\d{2}\/\d{2}$/.test(card.exp) || card.cvv.length < 3 || !card.name)) return setErr('Please complete your card details');
    if (method === 'netbanking' && !bank) return setErr('Choose your bank');
    if (method === 'wallet' && !wallet) return setErr('Choose a wallet');
    setErr('');
    onPay();
  };

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PAYMENT_METHODS.map((m) => {
          const I = m.icon;
          return (
            <button key={m.id} onClick={() => { onMethod(m.id); setErr(''); }} className={classNames('flex flex-col items-center gap-2 rounded-2xl border p-4 text-xs transition', method === m.id ? 'border-rose bg-ivory text-rose-deep shadow-rose' : 'border-rose-light/60 bg-ivory/70 text-ink-soft hover:border-rose')}>
              <I size={20} /> {m.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-rose-light/60 bg-ivory p-5">
        {method === 'upi' && (
          <div>
            <label className="label" htmlFor="pay-upi">UPI ID</label>
            <input id="pay-upi" value={upi} onChange={(e) => setUpi(e.target.value.trim())} className="input" placeholder="yourname@okbank" />
            <div className="mt-3 flex flex-wrap gap-2">
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((a) => <span key={a} className="chip">{a}</span>)}
            </div>
          </div>
        )}
        {(method === 'credit' || method === 'debit') && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="pay-card">Card number</label>
              <input id="pay-card" value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: fmtCard(e.target.value) }))} inputMode="numeric" autoComplete="cc-number" className="input tracking-wider" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="pay-name">Name on card</label>
              <input id="pay-name" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} autoComplete="cc-name" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="pay-exp">Expiry (MM/YY)</label>
              <input id="pay-exp" value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: e.target.value.replace(/[^\d/]/g, '').slice(0, 5) }))} autoComplete="cc-exp" className="input" placeholder="08/29" />
            </div>
            <div>
              <label className="label" htmlFor="pay-cvv">CVV</label>
              <input id="pay-cvv" type="password" value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} autoComplete="cc-csc" className="input" placeholder="•••" />
            </div>
            {method === 'credit' && <p className="text-xs text-ink-faint sm:col-span-2">No-cost EMI available on 3 & 6 months for orders above ₹25,000.</p>}
          </div>
        )}
        {method === 'netbanking' && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Other banks'].map((b) => (
              <button key={b} onClick={() => setBank(b)} className={classNames('rounded-xl border px-3 py-3 text-sm transition', bank === b ? 'border-rose bg-rose-blush text-rose-deep' : 'border-rose-light/70 text-ink-soft hover:border-rose')}>{b}</button>
            ))}
          </div>
        )}
        {method === 'wallet' && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {['Paytm', 'Amazon Pay', 'MobiKwik', 'Freecharge'].map((w) => (
              <button key={w} onClick={() => setWallet(w)} className={classNames('rounded-xl border px-3 py-3 text-sm transition', wallet === w ? 'border-rose bg-rose-blush text-rose-deep' : 'border-rose-light/70 text-ink-soft hover:border-rose')}>{w}</button>
            ))}
          </div>
        )}
        {err && <p className="mt-3 text-xs text-rose-deep">{err}</p>}
      </div>
      <button onClick={pay} disabled={busy} className="btn-primary mt-6 w-full sm:w-auto">
        {busy && <Loader2 size={15} className="animate-spin" />} Pay {formatINR(total)} securely
      </button>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint"><MapPin size={12} /> Payments are processed on a PCI-DSS compliant gateway. We never store card details.</p>
    </div>
  );
}
