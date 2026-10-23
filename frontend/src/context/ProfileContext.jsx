import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile as apiGetProfile, saveProfile as apiSaveProfile } from '../api/profileApi';
import { useDemoMode } from './DemoModeContext';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const { isDemoMode } = useDemoMode();
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('adhikar_demo_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiGetProfile(isDemoMode);
        if (data && data.profile) {
          setProfile(data.profile);
        } else if (data && !data.profile) {
          setProfile(data);
        }
      } catch (e) {
        // Handle error gracefully if server is unreachable
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemoMode]);

  const updateProfile = async (newProfileData) => {
    setLoading(true);
    try {
      const result = await apiSaveProfile(newProfileData, isDemoMode);
      setProfile(newProfileData);
      localStorage.setItem('adhikar_demo_profile', JSON.stringify(newProfileData));
      return result;
    } finally {
      setLoading(false);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem('adhikar_demo_profile');
  };

  const hasProfile = Boolean(profile && profile.age && profile.annualIncome);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile,
        loading,
        updateProfile,
        clearProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
