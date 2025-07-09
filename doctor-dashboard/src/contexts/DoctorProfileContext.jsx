import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getCurrentUser } from '../services/authService';

// Create the context
const DoctorProfileContext = createContext();

// Custom hook to use the context
export const useDoctorProfile = () => {
  const context = useContext(DoctorProfileContext);
  if (!context) {
    throw new Error('useDoctorProfile must be used within a DoctorProfileProvider');
  }
  return context;
};

// Provider component
export const DoctorProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 DoctorProfileContext: Fetching profile data...');
      const response = await api.get('/profile/me');
      const userData = response.data;
      
      console.log('✅ DoctorProfileContext: Profile data fetched:', userData);
      setProfileData(userData);
      
      // Update localStorage as well
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = { 
          ...currentUser, 
          ...userData,
          profilePicture: userData.profilePicture 
        };
        localStorage.setItem('doctorAuthUser', JSON.stringify(updatedUser));
      }
      
    } catch (err) {
      console.error('❌ DoctorProfileContext: Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async (updateData) => {
    try {
      console.log('💾 DoctorProfileContext: Updating profile...', updateData);
      const response = await api.put('/profile/me', updateData);
      
      // Update local state
      setProfileData(prev => ({ ...prev, ...response.data }));
      
      // Update localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = { 
          ...currentUser, 
          ...response.data,
          profilePicture: response.data.profilePicture 
        };
        localStorage.setItem('doctorAuthUser', JSON.stringify(updatedUser));
        // Dispatch event to notify other components
        window.dispatchEvent(new Event("doctorAuthChange"));
      }
      
      console.log('✅ DoctorProfileContext: Profile updated successfully');
      return response.data;
      
    } catch (err) {
      console.error('❌ DoctorProfileContext: Error updating profile:', err);
      throw err;
    }
  };

  // Update profile picture
  const updateProfilePicture = async (file) => {
    try {
      console.log('📸 DoctorProfileContext: Updating profile picture...');
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/profile/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update local state
      setProfileData(prev => ({ 
        ...prev, 
        profilePicture: response.data.profilePicture 
      }));
      
      // Update localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = { 
          ...currentUser, 
          profilePicture: response.data.profilePicture 
        };
        localStorage.setItem('doctorAuthUser', JSON.stringify(updatedUser));
        // Dispatch event to notify other components
        window.dispatchEvent(new Event("doctorAuthChange"));
      }
      
      console.log('✅ DoctorProfileContext: Profile picture updated successfully');
      return response.data;
      
    } catch (err) {
      console.error('❌ DoctorProfileContext: Error updating profile picture:', err);
      throw err;
    }
  };

  // Refresh profile data
  const refreshProfile = () => {
    fetchProfile();
  };

  // Load profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('🔄 DoctorProfileContext: Auth change detected, refreshing profile...');
      fetchProfile();
    };

    window.addEventListener('doctorAuthChange', handleAuthChange);
    return () => window.removeEventListener('doctorAuthChange', handleAuthChange);
  }, []);

  const value = {
    profileData,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateProfilePicture,
    refreshProfile,
    // Computed values for easy access
    fullName: profileData ? `${profileData.firstName} ${profileData.lastName}` : '',
    displayName: profileData ? `Dr. ${profileData.firstName} ${profileData.lastName}` : '',
    profilePicture: profileData?.profilePicture || null,
    isAcceptingPatients: profileData?.doctorInfo?.isAcceptingPatients !== false,
  };

  return (
    <DoctorProfileContext.Provider value={value}>
      {children}
    </DoctorProfileContext.Provider>
  );
};

export default DoctorProfileContext;
