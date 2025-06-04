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
