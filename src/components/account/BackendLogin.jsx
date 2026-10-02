import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/format';

/**
 * Sign in or create an account on the Artistry backend (email + password, email confirmed by a 6-digit code).
 * Used by the Account page and the first checkout step when the backend is connected.
 */
export default function BackendLogin({ onDone, intro = 'Sign in to place orders, track deliveries and manage returns.' }) {
  const { login, register, verifyEmail, resendOtp } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | register | verify
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value }));
  const fieldError = (name) => error?.fields?.[name];

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setMode('verify');
        setInfo('Your email is not verified yet. Enter the code we sent you, or send a new one.');
      } else {
        setError(err);
      }
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'signin') return run(async () => onDone?.(await login(form.email.trim(), form.password)));
    if (mode === 'register') {
      return run(async () => {
        const message = await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone, password: form.password });
        setInfo(message);
        setMode('verify');
      });
    }
    return run(async () => onDone?.(await verifyEmail(form.email.trim(), otp)));
  };

  return (
    <form onSubmit={submit} className="max-w-md" noValidate aria-busy={busy}>
      {mode !== 'verify' && (
        <div className="mb-5 flex gap-2" role="tablist" aria-label="Account">
          {[['signin', 'Sign in'], ['register', 'Create account']].map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={mode === key} onClick={() => { setMode(key); setError(null); setInfo(''); }} className={classNames('chip', mode === key && 'chip-active')}>
              {label}
            </button>
          ))}
        </div>
      )}
      {mode !== 'verify' && <p className="text-sm text-ink-soft">{intro}</p>}
      {info && <p className="mt-3 rounded-xl bg-rose-blush/60 px-4 py-3 text-sm text-ink" role="status">{info}</p>}
      {error && !Object.keys(error.fields || {}).length && <p className="mt-3 text-sm text-rose-deep" role="alert">{error.message}</p>}

      {mode === 'register' && (
        <>
          <label className="label mt-5" htmlFor="acc-name">Full name</label>
          <input id="acc-name" value={form.name} onChange={set('name')} autoComplete="name" className="input" />
          {fieldError('name') && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{fieldError('name')}</p>}
        </>
      )}

      {mode !== 'verify' ? (
        <>
          <label className="label mt-4" htmlFor="acc-email">Email</label>
          <input id="acc-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" className="input" />
          {fieldError('email') && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{fieldError('email')}</p>}

          {mode === 'register' && (
            <>
              <label className="label mt-4" htmlFor="acc-phone">Mobile (optional)</label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-xl border border-rose-light/70 bg-cream px-3 text-sm text-ink-soft">+91</span>
                <input id="acc-phone" value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel-national" className="input" placeholder="98XXXXXXXX" />
              </div>
              {fieldError('phone') && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{fieldError('phone')}</p>}
            </>
          )}

          <label className="label mt-4" htmlFor="acc-password">Password</label>
          <input id="acc-password" type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} className="input" />
          {mode === 'register' && !fieldError('password') && <p className="mt-1.5 text-xs text-ink-faint">At least 8 characters, with a letter and a number.</p>}
          {fieldError('password') && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{fieldError('password')}</p>}
        </>
      ) : (
        <>
          <label className="label mt-5" htmlFor="acc-otp">Code sent to {form.email}</label>
          <input id="acc-otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus className="input tracking-[0.6em]" placeholder="••••••" />
          {fieldError('otp') && <p className="mt-1.5 text-xs text-rose-deep" role="alert">{fieldError('otp')}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
            <button type="button" disabled={busy} onClick={() => run(async () => setInfo(await resendOtp(form.email.trim())))} className="text-rose-deep hover:underline">Send a new code</button>
            <button type="button" onClick={() => { setMode('signin'); setError(null); setInfo(''); }} className="text-rose-deep hover:underline">Use a different email</button>
          </div>
        </>
      )}

      <button className="btn-primary mt-5" disabled={busy || (mode === 'verify' ? otp.length !== 6 : !form.email || !form.password || (mode === 'register' && !form.name))}>
        {busy && <Loader2 size={15} className="animate-spin" />} {mode === 'signin' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Verify & continue'}
      </button>
    </form>
  );
}
