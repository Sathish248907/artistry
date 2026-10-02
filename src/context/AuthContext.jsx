import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { sendOtp, verifyOtp as verifyOtpCode, signOutOtp, isOtpConfigured } from '../services/otp';
import { backendConfigured, getToken, setToken, shopApi, shopRequest } from '../admin/api';

/**
 * Customer sign-in. Two modes:
 *
 *   No backend (VITE_BACKEND_URL empty) — the original storefront: mobile OTP, profile kept on this device.
 *   Backend connected                  — real customer accounts on the Artistry backend: email + password,
 *                                        email verified by OTP. Cart, checkout and orders then run on the backend.
 */
const AuthContext = createContext(null);

const displayPhone = (e164) => e164.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');

// Placeholder name older sessions were given before the name & city step existed
const LEGACY_NAME = 'Artistry Member';

/** A profile is complete once the customer has given their name, city and email. */
export const isProfileComplete = (u) => Boolean(u && u.name && u.name !== LEGACY_NAME && u.city && u.email);

/** The backend user in the shape the storefront components already use. */
const fromBackend = (u) =>
  u && {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    mobile: u.phone ? `+91 ${u.phone.slice(0, 5)} ${u.phone.slice(5)}` : '',
    city: '',
    role: u.role,
    verified: u.isVerified,
    backend: true,
  };

function DeviceAuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('ph.user', null);
  // Name, city & email per mobile number, so a returning customer on this device is not asked again
  const [profiles, setProfiles] = useLocalStorage('ph.profiles', {});

  // Sends a real SMS via Firebase when configured; demo mode otherwise. Throws OtpError with a friendly message.
  const requestOtp = (mobile) => sendOtp(mobile);

  const verifyOtp = async (_mobile, otp) => {
    const res = await verifyOtpCode(otp);
    const mobile = displayPhone(res.phone);
    const saved = profiles[mobile] || {};
    const next = {
      id: res.uid,
      name: saved.name || '',
      city: saved.city || '',
      mobile,
      email: saved.email || '',
      verified: !res.demo,
    };
    setUser(next);
    return next;
  };

  /** Save the customer's name, city and email (asked right after OTP verification, editable from My Profile). */
  const updateProfile = ({ name, city, email }) => {
    if (!user) return null;
    const next = {
      ...user,
      name: name.trim().replace(/\s+/g, ' '),
      city: city.trim().replace(/\s+/g, ' '),
      email: email.trim().toLowerCase(),
    };
    setUser(next);
    setProfiles((all) => ({ ...all, [next.mobile]: { name: next.name, city: next.city, email: next.email } }));
    return next;
  };

  const logout = async () => {
    await signOutOtp();
    setUser(null);
  };

  const value = { user, profileComplete: isProfileComplete(user), requestOtp, verifyOtp, updateProfile, logout, otpLive: isOtpConfigured(), backend: false, status: 'ready' };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function BackendAuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState(getToken('customer') ? 'checking' : 'ready');

  // Restore the session from a saved token
  useEffect(() => {
    if (!getToken('customer')) return undefined;
    let cancelled = false;
    shopApi('/auth/me')
      .then(({ user }) => !cancelled && setAccount(user))
      .catch(() => {
        if (!cancelled) setToken(null, 'customer');
      })
      .finally(() => !cancelled && setStatus('ready'));
    return () => {
      cancelled = true;
    };
  }, []);

  // The API client fires this when the backend rejects the token
  useEffect(() => {
    const onSignedOut = () => setAccount(null);
    window.addEventListener('customer:signed-out', onSignedOut);
    return () => window.removeEventListener('customer:signed-out', onSignedOut);
  }, []);

  const startSession = useCallback(({ user, token }) => {
    setToken(token, 'customer');
    setAccount(user);
    return fromBackend(user);
  }, []);

  /** Throws ApiError; code EMAIL_NOT_VERIFIED means the account needs its email OTP first. */
  const login = useCallback(async (email, password) => startSession(await shopApi('/auth/login', { method: 'POST', body: { email, password }, auth: false })), [startSession]);

  /** Creates the account and emails the OTP. Resolves with the backend's message. */
  const register = useCallback(async ({ name, email, phone, password }) => (await shopRequest('/auth/register', { method: 'POST', body: { name, email, phone: phone || undefined, password }, auth: false })).message, []);

  const verifyEmail = useCallback(async (email, otp) => startSession(await shopApi('/auth/verify-email', { method: 'POST', body: { email, otp }, auth: false })), [startSession]);

  const resendOtp = useCallback(async (email) => (await shopRequest('/auth/resend-otp', { method: 'POST', body: { email }, auth: false })).message, []);

  const updateAccount = useCallback(async ({ name, phone }) => {
    const { user } = await shopApi('/users/profile', { method: 'PUT', body: { name, phone } });
    setAccount(user);
    return fromBackend(user);
  }, []);

  const logout = useCallback(async () => {
    shopRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    setToken(null, 'customer');
    setAccount(null);
  }, []);

  const user = useMemo(() => fromBackend(account), [account]);
  const value = {
    user,
    profileComplete: Boolean(user && user.name && user.email),
    backend: true,
    status,
    login,
    register,
    verifyEmail,
    resendOtp,
    updateAccount,
    logout,
    // The mobile-OTP functions do not exist in this mode
    requestOtp: null,
    verifyOtp: null,
    updateProfile: null,
    otpLive: false,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }) {
  return backendConfigured ? <BackendAuthProvider>{children}</BackendAuthProvider> : <DeviceAuthProvider>{children}</DeviceAuthProvider>;
}

export const useAuth = () => useContext(AuthContext);
