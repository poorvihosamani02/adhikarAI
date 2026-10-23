/**
 * Citizen Profile API Service
 * Interacts with backend SQLite profiles table via JWT Bearer authentication.
 */
import { apiClient } from './client';
import { mockProfileService } from '../data/mockService';

export const profileApi = {
  /**
   * Retrieve currently authenticated citizen profile from SQLite database.
   */
  async getProfile() {
    return await apiClient(
      '/api/profile',
      { method: 'GET' },
      {
        requiresAuth: true,
        demoFallbackFn: () => mockProfileService.getProfile()
      }
    );
  },

  /**
   * Create or update the citizen profile in SQLite database.
   */
  async saveProfile(profileData) {
    const payload = {
      name: profileData.name,
      age: profileData.age !== '' && profileData.age !== null ? Number(profileData.age) : null,
      gender: profileData.gender || null,
      annual_income: profileData.annual_income !== '' && profileData.annual_income !== null ? Number(profileData.annual_income) : null,
      annualIncome: profileData.annual_income !== '' && profileData.annual_income !== null ? Number(profileData.annual_income) : null,
      category: profileData.category || null,
      state: profileData.state || null,
      education_level: profileData.education_level || null,
      educationLevel: profileData.education_level || null,
      course: profileData.course || null,
      occupation: profileData.occupation || null,
      is_minority: Boolean(profileData.is_minority),
      isMinority: Boolean(profileData.is_minority),
      is_bpl: Boolean(profileData.is_bpl),
      isBPL: Boolean(profileData.is_bpl)
    };

    return await apiClient(
      '/api/profile',
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      },
      {
        requiresAuth: true,
        demoFallbackFn: () => mockProfileService.saveProfile(profileData)
      }
    );
  }
};
