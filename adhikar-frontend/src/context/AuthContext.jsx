import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuthService, mockProfileService } from '../data/mockService';
import { DEMO_PROFILES } from '../data/mockProfiles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session from localStorage or set default Arun Kumar for demonstration
    const storedUser = mockAuthService.getCurrentUser();
    const storedToken = localStorage.getItem('adhikar_demo_token');

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    } else {
      // Pre-seed demo user so reviewer can explore all authenticated features right away
      const defaultProfile = DEMO_PROFILES[0];
      const demoUser = {
        id: defaultProfile.id,
        name: defaultProfile.name,
        email: defaultProfile.email
      };
      const demoToken = 'demo_initial_token_' + Date.now();
      localStorage.setItem('adhikar_demo_user', JSON.stringify(demoUser));
      localStorage.setItem('adhikar_demo_token', demoToken);
      setUser(demoUser);
      setToken(demoToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await mockAuthService.login(email, password);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (name, email, password) => {
    return await mockAuthService.register(name, email, password);
  };

  const logout = () => {
    mockAuthService.logout();
    setUser(null);
    setToken(null);
  };

  const switchDemoUser = (profileKey) => {
    const profile = mockProfileService.setPresetProfile(profileKey);
    setUser({ id: profile.id, name: profile.name, email: profile.email });
    setToken('demo_token_' + Date.now());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
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
