/**
 * Shared API Client for AdhikarAI.
 * Configured to communicate with the future Node.js backend.
 * Supports a transparent DEMO MODE for hackathon practice.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function apiClient(endpoint, options = {}, isDemoMode = true, fallbackDataFn = null) {
  // If demo mode is active and a fallback generator is provided, simulate network latency and return mock
  if (isDemoMode && fallbackDataFn) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return fallbackDataFn();
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      let errorMsg = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errorMsg = errorJson.message;
        if (errorJson.detail) errorMsg = errorJson.detail;
      } catch (e) {
        // Ignore json parse error
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    // When demo mode is disabled, errors MUST be shown rather than silently masked
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}
