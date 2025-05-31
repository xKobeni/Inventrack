import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = 'http://localhost:5001'; // backend URL

// Create axios instance with default config
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

const useAuthStore = create(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // Login action
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          
          console.log('Attempting login with:', credentials);
          const { data } = await api.post('/auth/login', credentials);
          console.log('Login response:', data);

          // Store user data and token
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Debug: Verify storage
          console.log('Stored auth data:', {
            user: data.user,
            token: data.token,
            isAuthenticated: true
          });

          return data;
        } catch (error) {
          console.error('Login error:', error.response?.data || error.message);
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear localStorage
        localStorage.removeItem('auth-storage');
      },

      // Register action
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data } = await api.post('/auth/register', userData);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      // Check if user is authenticated
      checkAuth: () => {
        const storedAuth = localStorage.getItem('auth-storage');
        if (storedAuth) {
          const { state } = JSON.parse(storedAuth);
          if (state.token && state.user) {
            set({
              user: state.user,
              token: state.token,
              isAuthenticated: true,
            });
            return true;
          }
        }
        return false;
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
