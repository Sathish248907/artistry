import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Coimbatore', 'Kochi', 'Jaipur', 'Lucknow', 'Madurai', 'Surat', 'Chandigarh'];

const NAME_OK = /^[\p{L}][\p{L}\s.'-]{1,59}$/u;
const CITY_OK = /^[\p{L}][\p{L}\s.'-]{1,39}$/u;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Name, city and email form. Shown right after a customer verifies their mobile number
 * (they cannot continue without it) and reused for editing from My Profile.
 */
export default function ProfileDetailsForm({ onDone, onCancel, submitLabel = 'Save & Continue', intro = true }) {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name && user.name !== 'Artistry Member' ? user.name : '');
  const [city, setCity] = useState(user?.city || '');
  const [email, setEmail] = useState(user?.email || '');
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!NAME_OK.test(name.trim())) next.name = 'Enter your full name (letters only, at least 2 characters)';
    if (!CITY_OK.test(city.trim())) next.city = 'Enter your city';
    if (!EMAIL_OK.test(email.trim())) next.email = 'Enter a valid email address';
    setErrors(next);
    if (Object.keys(next).length) return;
    const saved = updateProfile({ name, city, email });
    onDone?.(saved);
  };

  return (
    <form onSubmit={submit} className="max-w-md" noValidate>
      {intro && (
        <>
          <p className="flex items-center gap-2 text-xs text-rose-deep">
            <BadgeCheck size={15} /> {user?.mobile} verified
          </p>
          <p className="mt-2 text-sm text-ink-soft">One last step — tell us your name, city and email so we can personalise your account and send order updates.</p>
        </>
      )}

      <label className="label mt-5" htmlFor="pd-name">Full name</label>
      <input id="pd-name" value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} autoComplete="name" autoFocus className="input" placeholder="Your name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'pd-name-err' : undefined} />
      {errors.name && <p id="pd-name-err" className="mt-1.5 text-xs text-rose-deep" role="alert">{errors.name}</p>}

      <label className="label mt-4" htmlFor="pd-city">City</label>
      <input id="pd-city" list="pd-city-list" value={city} onChange={(e) => setCity(e.target.value.slice(0, 40))} autoComplete="address-level2" className="input" placeholder="Your city" aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'pd-city-err' : undefined} />
      <datalist id="pd-city-list">
        {CITIES.map((c) => <option key={c} value={c} />)}
      </datalist>
      {errors.city && <p id="pd-city-err" className="mt-1.5 text-xs text-rose-deep" role="alert">{errors.city}</p>}

      <label className="label mt-4" htmlFor="pd-email">Email</label>
      <input id="pd-email" type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} inputMode="email" autoComplete="email" className="input" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'pd-email-err' : undefined} />
      {errors.email && <p id="pd-email-err" className="mt-1.5 text-xs text-rose-deep" role="alert">{errors.email}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button className="btn-primary">{submitLabel}</button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-[11px] uppercase tracking-[0.18em] text-ink-soft hover:text-rose-deep">Cancel</button>
        ) : (
          <button type="button" onClick={logout} className="text-[11px] text-rose-deep underline-offset-2 hover:underline">Use a different number</button>
        )}
      </div>
    </form>
  );
}
