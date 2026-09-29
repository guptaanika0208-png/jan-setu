import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jansetu_access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const persistTokens = (tokenResponse) => {
    localStorage.setItem("jansetu_access_token", tokenResponse.access_token);
    localStorage.setItem("jansetu_refresh_token", tokenResponse.refresh_token);
  };

  const login = async (phone_number, password) => {
    const { data } = await authApi.login({ phone_number, password });
    persistTokens(data);
    const me = await authApi.me();
    setUser(me.data);
    return me.data;
  };

  const loginWithOtp = async (phone_number, otp, purpose = "login") => {
    const { data } = await authApi.verifyOtp({ phone_number, otp, purpose });
    persistTokens(data);
    const me = await authApi.me();
    setUser(me.data);
    return me.data;
  };

  const signup = async (payload) => {
    await authApi.signup(payload);
    await authApi.requestOtp({ phone_number: payload.phone_number, purpose: "signup" });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, loginWithOtp, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
