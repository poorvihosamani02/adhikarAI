/**
 * Authentication API Service
 * Connects frontend login/registration directly to Node.js backend.
 */
import { apiClient, setAuthSession, clearAuthSession, AUTH_STORAGE_KEYS } from './client';
import { mockAuthService } from '../data/mockService';

export const authApi = {
  /**
   * Log in with email and password against Node.js backend.
   */
  async login(email, password) {
    const data = await apiClient(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      },
      {
        demoFallbackFn: () => mockAuthService.login(email, password)
      }
    );

    if (data?.token && data?.user) {
      setAuthSession(data.token, data.user);
    }
    return data;
  },

  /**
   * Register a new user against Node.js backend.
   */
  async register(name, email, password) {
    return await apiClient(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      },
      {
        demoFallbackFn: () => mockAuthService.register(name, email, password)
      }
    );
  },

  /**
   * Clear session.
   */
  logout() {
    clearAuthSession();
    localStorage.removeItem(AUTH_STORAGE_KEYS.IS_DEMO);
    mockAuthService.logout();
  },

  /**
   * Get cached user if present.
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
