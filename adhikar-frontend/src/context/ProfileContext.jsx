import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProfileService } from '../data/mockService';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const reloadProfile = async () => {
    setLoading(true);
    try {
      const res = await mockProfileService.getProfile();
      setProfile(res.profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      reloadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const saveProfile = async (formData) => {
    const res = await mockProfileService.saveProfile(formData);
    setProfile(res.profile);
    return res;
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
