import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { sendOtp, verifyOtp as verifyOtpCode, signOutOtp, isOtpConfigured } from '../services/otp';

const AuthContext = createContext(null);

const displayPhone = (e164) => e164.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');

// Placeholder name older sessions were given before the name & city step existed
const LEGACY_NAME = 'Artistry Member';

/** A profile is complete once the customer has given their name, city and email. */
export const isProfileComplete = (u) => Boolean(u && u.name && u.name !== LEGACY_NAME && u.city && u.email);

export function AuthProvider({ children }) {
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

  const value = { user, profileComplete: isProfileComplete(user), requestOtp, verifyOtp, updateProfile, logout, otpLive: isOtpConfigured() };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
