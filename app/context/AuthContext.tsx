import React, { createContext, useContext, useState } from 'react';
import { MOCK_USER } from '../data/mockData';

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // auto-login for dev

  function login(email: string, password: string): boolean {
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }

  function logout() {
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
