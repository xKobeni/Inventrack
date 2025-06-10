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

const useDepartmentStore = create((set, get) => ({
  departments: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  },

  fetchDepartments: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/departments', { params });
      set({ 
        departments: data.data.departments,
        pagination: {
          currentPage: data.data.pagination.current_page,
          totalPages: data.data.pagination.total_pages,
          totalItems: data.data.pagination.total_items,
          itemsPerPage: data.data.pagination.items_per_page
        },
        isLoading: false 
      });
      return data.data.departments;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch departments';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  addDepartment: async (departmentData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/departments', departmentData);
      const newDepartment = data.data.department;
      set({ 
        departments: [...get().departments, newDepartment],
        isLoading: false 
      });
      return newDepartment;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add department';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateDepartment: async (departmentId, departmentData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/departments/${departmentId}`, departmentData);
      const currentDepartments = get().departments;
      set({ 
        departments: currentDepartments.map(dept => 
          dept.department_id === departmentId ? data.data.department : dept
        ),
        isLoading: false 
      });
      return data.data.department;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update department';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteDepartment: async (departmentId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/departments/${departmentId}`);
      const currentDepartments = get().departments;
      set({ 
        departments: currentDepartments.filter(dept => dept.department_id !== departmentId),
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete department';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  activateDepartment: async (departmentId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/departments/${departmentId}/activate`);
      const currentDepartments = get().departments;
      set({ 
        departments: currentDepartments.map(dept => 
          dept.department_id === departmentId ? { ...dept, is_active: true } : dept
        ),
        isLoading: false 
      });
      return data.data.department;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to activate department';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deactivateDepartment: async (departmentId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/departments/${departmentId}/deactivate`);
      const currentDepartments = get().departments;
      set({ 
        departments: currentDepartments.map(dept => 
          dept.department_id === departmentId ? { ...dept, is_active: false } : dept
        ),
        isLoading: false 
      });
      return data.data.department;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deactivate department';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDepartmentStore;
