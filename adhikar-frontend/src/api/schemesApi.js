/**
 * Government Schemes API Service
 * Interacts with backend scheme catalog and authenticated eligibility engine.
 */
import { apiClient } from './client';
import { mockSchemesService } from '../data/mockService';

export const schemesApi = {
  /**
   * Fetch all cataloged schemes from SQLite database.
   */
  async getAllSchemes() {
    return await apiClient(
      '/api/schemes',
      { method: 'GET' },
      {
        demoFallbackFn: () => mockSchemesService.getAllSchemes()
      }
    );
  },

  /**
   * Fetch detailed metadata and structured requirements for a single scheme.
   */
  async getSchemeById(id) {
    return await apiClient(
      `/api/schemes/${encodeURIComponent(id)}`,
      { method: 'GET' },
      {
        demoFallbackFn: () => mockSchemesService.getSchemeById(id)
      }
    );
  },

  /**
   * Fetch structured required document checklist for a scheme.
   */
  async getSchemeDocuments(id) {
    return await apiClient(
      `/api/schemes/${encodeURIComponent(id)}/documents`,
      { method: 'GET' },
      {
        demoFallbackFn: () => mockSchemesService.getSchemeDocuments(id)
      }
    );
  },

  /**
   * Execute authenticated citizen eligibility matching engine on the backend.
   */
  async getMatchedSchemes(currentProfile = null) {
    return await apiClient(
      '/api/schemes/matched',
      { method: 'GET' },
      {
        requiresAuth: true,
        demoFallbackFn: () => mockSchemesService.evaluateMatchedSchemes(currentProfile)
      }
    );
  }
};
