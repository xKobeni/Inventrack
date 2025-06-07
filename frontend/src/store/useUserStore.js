import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage') 
      ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const useUserStore = create((set) => ({
  // State
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Update profile
  updateProfile: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.put('/users/profile', userData);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // Update profile picture
  updateProfilePicture: async (file) => {
    try {
      set({ isLoading: true, error: null });

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must not exceed 5MB');
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        throw new Error('Only JPEG, PNG, and GIF images are allowed');
      }

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;
      
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Image = base64Data.split(',')[1];
      
      const { data } = await api.put('/users/profile', {
        profile_picture: base64Image,
        profile_picture_type: file.type
      });

      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile picture';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.put('/users/change-password', passwordData);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useUserStore;
