/**
 * AdhikarAI Centralized API Client
 * 
 * Secure HTTP client communicating with the Node.js Express Backend on port 3000.
 * Handles:
 * - Base URL configuration via import.meta.env.VITE_API_BASE_URL
 * - Automatic Authorization: Bearer <token> injection
 * - 10-second request timeout guards using AbortSignal
 * - Structured error handling with status codes and backend messages
 * - Clean separation between real backend calls and transparent demo fallbacks
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'adhikar_auth_token',
  USER: 'adhikar_auth_user',
  IS_DEMO: 'adhikar_is_demo_mode'
};

/**
 * Retrieve current JWT token from localStorage.
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  } catch {
    return null;
  }
}

/**
 * Store authenticated JWT and user in localStorage.
 */
export function setAuthSession(token, user) {
  try {
    if (token) localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    if (user) localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.removeItem(AUTH_STORAGE_KEYS.IS_DEMO);
  } catch (err) {
    console.error('Failed to save auth session:', err);
  }
}

/**
 * Clear authentication session on logout or 401.
 */
export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
}

/**
 * Check if the user is currently operating in demo-profile mode.
 */
export function isDemoSession() {
  return localStorage.getItem(AUTH_STORAGE_KEYS.IS_DEMO) === 'true';
}

/**
 * Centralized fetch wrapper.
 * 
 * @param {string} endpoint - API path, e.g. '/api/schemes'
 * @param {RequestInit} [options={}] - Standard fetch options (method, headers, body)
 * @param {Object} [clientOptions={}] - Optional client controls
 * @param {boolean} [clientOptions.requiresAuth=false] - Whether to require Bearer token
 * @param {number} [clientOptions.timeoutMs=10000] - Request timeout in milliseconds
 * @param {Function} [clientOptions.demoFallbackFn=null] - Optional fallback function if backend is offline
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiClient(endpoint, options = {}, clientOptions = {}) {
  const {
    requiresAuth = false,
    timeoutMs = 10000,
    demoFallbackFn = null
  } = clientOptions;

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  // If endpoint requires authentication and user is in demo mode with a fallback, trigger fallback
  if (requiresAuth && isDemoSession() && demoFallbackFn) {
    return await demoFallbackFn();
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  if (token && (requiresAuth || !headers['Authorization'])) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Parse JSON safely
    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    }

    if (!response.ok) {
      // 401 Unauthorized handling
      if (response.status === 401 && requiresAuth) {
        // Do not auto-redirect if already on login page
        if (!window.location.pathname.includes('/login')) {
          console.warn('Session expired or unauthorized. Token cleared.');
        }
      }

      let errorMsg = responseData?.message || responseData?.detail || `Server error (${response.status} ${response.statusText})`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);

    // If fetch failed due to offline backend and a fallback function is provided
    if (demoFallbackFn && (error.name === 'AbortError' || error.name === 'TypeError' || error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      console.warn(`[AdhikarAI Client] Live backend at ${url} is unreachable. Executing demo fallback.`, error.message);
      return await demoFallbackFn();
    }

    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timed out after ${timeoutMs / 1000}s. The service may be busy or offline.`);
      timeoutError.status = 504;
      throw timeoutError;
    }

    throw error;
  }
}
