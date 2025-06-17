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

// Add response interceptor to handle unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear preferences from store
      useUserPreferencesStore.getState().clearPreferences();
    }
    return Promise.reject(error);
  }
);

const useUserPreferencesStore = create((set) => ({
  // State
  preferences: null,
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearPreferences: () => set({ preferences: null, error: null }),

  // Get user preferences
  getPreferences: async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth-storage') 
        ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
        : null;

      if (!token) {
        throw new Error('User not authenticated');
      }

      set({ isLoading: true, error: null });
      const { data } = await api.get('/preferences');
      set({ preferences: data.data.preferences });
      
      // Apply theme and language on load
      if (data.data.preferences) {
        const { theme, language } = data.data.preferences;
        if (theme) {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(theme);
        }
        if (language) {
          document.documentElement.lang = language;
        }
      }
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get preferences';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth-storage') 
        ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
        : null;

      if (!token) {
        throw new Error('User not authenticated');
      }

      set({ isLoading: true, error: null });
      const { data } = await api.put('/preferences', preferences);
      set({ preferences: data.data.preferences });
      
      // Apply theme and language changes immediately
      if (preferences.theme) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(preferences.theme);
      }
      if (preferences.language) {
        document.documentElement.lang = preferences.language;
      }
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update preferences';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useUserPreferencesStore;
