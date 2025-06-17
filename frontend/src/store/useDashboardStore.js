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

const useDashboardStore = create((set) => ({
  // State
  isLoading: false,
  error: null,
  dashboardData: null,
  systemStats: null,
  recentActivities: null,
  departmentStats: null,
  inventoryStats: null,
  procurementStats: null,
  userActivityStats: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Fetch all dashboard data
  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/dashboard/stats');
      set({ dashboardData: data.data });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch individual statistics
  fetchSystemStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/dashboard/system');
      set({ systemStats: data.data });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch system stats';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecentActivities: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/dashboard/activities');
      set({ recentActivities: data.data });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch recent activities';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDepartmentStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/dashboard/departments');
      set({ departmentStats: data.data });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch department stats';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInventoryStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/dashboard/inventory');
      set({ inventoryStats: data.data });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch inventory stats';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProcurementStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/dashboard/procurement');
      set({ procurementStats: data.data });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch procurement stats';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserActivityStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/dashboard/user-activity');
      set({ userActivityStats: data.data });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user activity stats';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDashboardStore;
