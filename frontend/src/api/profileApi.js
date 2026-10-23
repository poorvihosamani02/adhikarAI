import { apiClient } from './client';

const DEMO_PROFILE_KEY = 'adhikar_demo_profile';

export async function getProfile(isDemoMode = true) {
  return apiClient(
    '/api/profile',
    { method: 'GET' },
    isDemoMode,
    () => {
      const stored = localStorage.getItem(DEMO_PROFILE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    }
  );
}

export async function saveProfile(profileData, isDemoMode = true) {
  return apiClient(
    '/api/profile',
    {
      method: 'POST',
      body: JSON.stringify(profileData)
    },
    isDemoMode,
    () => {
      localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profileData));
      return {
        status: 'success',
        is_mock: true,
        profile: profileData,
        message: 'Profile saved to temporary demo storage.'
      };
    }
  );
}
