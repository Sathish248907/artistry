import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { sendOtp, verifyOtp as verifyOtpCode, signOutOtp, isOtpConfigured } from '../services/otp';

const AuthContext = createContext(null);

const displayPhone = (e164) => e164.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('ph.user', null);

  // Sends a real SMS via Firebase when configured; demo mode otherwise. Throws OtpError with a friendly message.
  const requestOtp = (mobile) => sendOtp(mobile);

  const verifyOtp = async (_mobile, otp) => {
    const res = await verifyOtpCode(otp);
    const next = {
      id: res.uid,
      name: user?.name || 'Artistry Member',
      mobile: displayPhone(res.phone),
      email: user?.email || '',
      verified: !res.demo,
    };
    setUser(next);
    return next;
  };

  const logout = async () => {
    await signOutOtp();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, requestOtp, verifyOtp, logout, otpLive: isOtpConfigured() }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
