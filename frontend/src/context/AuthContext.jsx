import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLoginUser } from '../api/authApi';
import { useDemoMode } from './DemoModeContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { isDemoMode } = useDemoMode();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('adhikar_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLoginUser({ email, password }, isDemoMode);
      if (response && response.user) {
        setUser(response.user);
        localStorage.setItem('adhikar_auth_user', JSON.stringify(response.user));
        return response.user;
      }
      throw new Error('Invalid login response from server.');
    } catch (err) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const mockLogin = () => {
    const mockCitizen = {
      id: 'CITIZEN_DEMO_01',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.in',
      role: 'citizen',
      isMock: true
    };
    setUser(mockCitizen);
    localStorage.setItem('adhikar_auth_user', JSON.stringify(mockCitizen));
    return mockCitizen;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adhikar_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        mockLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
