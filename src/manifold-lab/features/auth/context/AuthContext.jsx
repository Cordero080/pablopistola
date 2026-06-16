import React, { createContext, useContext } from "react";

const AuthContext = createContext(null);

const noop = () => {};
const noopAsync = async () => {};

const stubValue = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: noopAsync,
  signup: noopAsync,
  logout: noop,
  addUnlockedNoetechs: noop,
  unlockedAnimations: [],
  setUnlockedAnimations: noop,
  isAnimationUnlocked: () => false,
  getUnlockedAnimationsForNoetech: () => [],
  addUnlockedAnimations: noop,
};

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={stubValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
