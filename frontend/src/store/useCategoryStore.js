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
  (error) => Promise.reject(error)
);

const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/inventory/categories');
      set({ categories: data.data.categories, isLoading: false });
      return data.data.categories;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch categories';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  addCategory: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/inventory/categories', { name });
      set({ categories: [...get().categories, data.data.category], isLoading: false });
      return data.data.category;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add category';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateCategory: async (categoryId, name) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/inventory/categories/${categoryId}`, { name });
      set({
        categories: get().categories.map(cat =>
          cat.category_id === categoryId ? data.data.category : cat
        ),
        isLoading: false
      });
      return data.data.category;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update category';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteCategory: async (categoryId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/inventory/categories/${categoryId}`);
      set({
        categories: get().categories.filter(cat => cat.category_id !== categoryId),
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete category';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCategoryStore; 