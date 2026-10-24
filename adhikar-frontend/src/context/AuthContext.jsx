import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { mockProfileService } from '../data/mockService';
import { DEMO_PROFILES } from '../data/mockProfiles';
import { AUTH_STORAGE_KEYS } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for real authenticated session
    const realToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    const realUserRaw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    const demoFlag = localStorage.getItem(AUTH_STORAGE_KEYS.IS_DEMO);

    if (realToken && realUserRaw && demoFlag !== 'true') {
      try {
        const parsedUser = JSON.parse(realUserRaw);
        setUser(parsedUser);
        setToken(realToken);
        setIsDemo(false);
        setLoading(false);
        return;
      } catch (e) {
        console.warn('Failed to parse saved user:', e);
      }
    }

    // 2. Check for existing demo session
    if (demoFlag === 'true') {
      const demoUserRaw = localStorage.getItem('adhikar_demo_user');
      const demoToken = localStorage.getItem('adhikar_demo_token');
      if (demoUserRaw && demoToken) {
        try {
          setUser(JSON.parse(demoUserRaw));
          setToken(demoToken);
          setIsDemo(true);
          setLoading(false);
          return;
        } catch {
          // fallback to default demo
        }
      }
    }

    // 3. Unauthenticated guest by default
    setUser(null);
    setToken(null);
    setIsDemo(false);
    setLoading(false);
  }, []);

  /**
   * Real login against Node.js backend (or mock fallback).
   * Clears any stale demo profile so fresh users start with 0% profile setup.
   */
  const login = async (email, password) => {
    localStorage.removeItem('adhikar_demo_profile');
    const res = await authApi.login(email, password);
    if (res?.token && res?.user) {
      setUser(res.user);
      setToken(res.token);
      setIsDemo(Boolean(res.is_demo));
    }
    return res;
  };

  /**
   * Real registration against Node.js backend.
   * Clears any stale demo profile so new accounts start with 0% profile setup.
   */
  const register = async (name, email, password) => {
    localStorage.removeItem('adhikar_demo_profile');
    return await authApi.register(name, email, password);
  };

  /**
   * Logout clears both real JWT session and demo session and demo profile.
   */
  const logout = () => {
    authApi.logout();
    localStorage.removeItem('adhikar_demo_user');
    localStorage.removeItem('adhikar_demo_token');
    localStorage.removeItem('adhikar_demo_profile');
    localStorage.removeItem(AUTH_STORAGE_KEYS.IS_DEMO);
    setUser(null);
    setToken(null);
    setIsDemo(false);
  };

  /**
   * One-click demo citizen switcher for reviewer evaluation.
   */
  const switchDemoUser = (profileKey) => {
    const profile = mockProfileService.setPresetProfile(profileKey);
    const demoUser = { id: profile.id, name: profile.name, email: profile.email };
    const demoToken = 'demo_token_' + Date.now();

    // Mark as demo session
    localStorage.setItem(AUTH_STORAGE_KEYS.IS_DEMO, 'true');
    localStorage.setItem('adhikar_demo_user', JSON.stringify(demoUser));
    localStorage.setItem('adhikar_demo_token', demoToken);

    // Remove real auth token so demo calls don't pollute backend
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);

    setUser(demoUser);
    setToken(demoToken);
    setIsDemo(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isDemo,
        loading,
        login,
        register,
        logout,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
