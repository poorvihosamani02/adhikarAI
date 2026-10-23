import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileApi } from '../api/profileApi';
import { mockProfileService } from '../data/mockService';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { user, isDemo, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (isDemo) {
        const res = await mockProfileService.getProfile();
        setProfile(res?.profile || null);
      } else {
        const res = await profileApi.getProfile();
        setProfile(res?.profile || null);
      }
    } catch (err) {
      console.error('Failed to load profile from backend:', err);
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isDemo]);

  useEffect(() => {
    if (isAuthenticated) {
      reloadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [isAuthenticated, isDemo, reloadProfile]);

  const saveProfile = async (formData) => {
    setError(null);
    if (isDemo) {
      const res = await mockProfileService.saveProfile(formData);
      setProfile(res.profile);
      return res;
    } else {
      const res = await profileApi.saveProfile(formData);
      if (res?.profile) {
        setProfile(res.profile);
      }
      return res;
    }
  };

  const loadPreset = (presetKey) => {
    const preset = mockProfileService.setPresetProfile(presetKey);
    setProfile(preset);
  };

  const clearProfile = () => {
    localStorage.removeItem('adhikar_demo_profile');
    setProfile(null);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile: !!profile,
        loading,
        error,
        saveProfile,
        reloadProfile,
        loadPreset,
        clearProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
