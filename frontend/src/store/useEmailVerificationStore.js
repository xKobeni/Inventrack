import { create } from 'zustand';
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

const useEmailVerificationStore = create((set, get) => ({
    // State
    isVerifying: false,
    verificationError: null,
    verificationSuccess: false,
    isRequestingVerification: false,
    requestError: null,
    requestSuccess: false,

    // Actions
    verifyEmail: async (token) => {
        try {
            set({ isVerifying: true, verificationError: null, verificationSuccess: false });
            
            const response = await axios.post(`${API_URL}/auth/verify/confirm`, { token });
            
            set({ 
                isVerifying: false, 
                verificationSuccess: true,
                verificationError: null 
            });
            
            return response.data;
        } catch (error) {
            set({ 
                isVerifying: false, 
                verificationError: error.response?.data?.message || 'Failed to verify email',
                verificationSuccess: false 
            });
            throw error;
        }
    },

    requestVerification: async (email) => {
        try {
            set({ isRequestingVerification: true, requestError: null, requestSuccess: false });
            
            const response = await axios.post(`${API_URL}/auth/verify/request`, { email });
            
            set({ 
                isRequestingVerification: false, 
                requestSuccess: true,
                requestError: null 
            });
            
            return response.data;
        } catch (error) {
            set({ 
                isRequestingVerification: false, 
                requestError: error.response?.data?.message || 'Failed to request verification',
                requestSuccess: false 
            });
            throw error;
        }
    },

    resetVerificationState: () => {
        set({
            isVerifying: false,
            verificationError: null,
            verificationSuccess: false,
            isRequestingVerification: false,
            requestError: null,
            requestSuccess: false
        });
    }
}));

export default useEmailVerificationStore; 