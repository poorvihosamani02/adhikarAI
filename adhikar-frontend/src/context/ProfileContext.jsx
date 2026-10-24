import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileApi } from '../api/profileApi';
import { mockProfileService } from '../data/mockService';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export const calculateProfileCompleteness = (prof) => {
  if (!prof) return 0;
  // Core 6 demographic fields required for statutory welfare scheme matching
  const coreFields = ['age', 'gender', 'state', 'category', 'annual_income', 'occupation'];
  let filled = 0;
  for (const field of coreFields) {
    const val = prof[field];
    if (val !== undefined && val !== null) {
      const str = String(val).trim();
      if (str !== '' && str !== 'null' && str !== 'undefined') {
        if (field === 'age') {
          if (Number(val) > 0) filled++;
        } else if (field === 'annual_income') {
          if (!isNaN(Number(val)) && Number(val) >= 0) filled++;
        } else {
          filled++;
        }
      }
    }
  }
  return Math.round((filled / coreFields.length) * 100);
};

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
      } else {
        setProfile(formData);
      }
      return res;
    }
  };

  const updateProfile = (updated) => {
    setProfile(prev => ({ ...(prev || {}), ...updated }));
  };

  const loadPreset = (presetKey) => {
    const preset = mockProfileService.setPresetProfile(presetKey);
    setProfile(preset);
  };

  const clearProfile = () => {
    localStorage.removeItem('adhikar_demo_profile');
    setProfile(null);
  };

  const completenessPercent = calculateProfileCompleteness(profile);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile: !!profile && completenessPercent > 0,
        completenessPercent,
        loading,
        error,
        saveProfile,
        updateProfile,
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
