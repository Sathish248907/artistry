import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('ph.user', null);

  const requestOtp = (mobile) => authService.login(mobile);
  const verifyOtp = async (mobile, otp) => {
    const res = await authService.verifyOtp(mobile, otp);
    setUser(res.user);
    return res.user;
  };
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, requestOtp, verifyOtp, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
