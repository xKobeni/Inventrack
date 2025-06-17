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

const useInventoryStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  },

  fetchItems: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/inventory', { params });
      set({ 
        items: data.data.items,
        pagination: {
          currentPage: data.data.pagination?.current_page || 1,
          totalPages: data.data.pagination?.total_pages || 1,
          totalItems: data.data.pagination?.total_items || data.data.items.length,
          itemsPerPage: data.data.pagination?.items_per_page || 10
        },
        isLoading: false 
      });
      return data.data.items;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch inventory items';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  addItem: async (itemData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/inventory', itemData);
      set({ 
        items: [...get().items, data.data.item],
        isLoading: false 
      });
      return data.data.item;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add inventory item';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateItem: async (itemId, itemData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/inventory/${itemId}`, itemData);
      const currentItems = get().items;
      set({ 
        items: currentItems.map(item => 
          item.item_id === itemId ? data.data.item : item
        ),
        isLoading: false 
      });
      return data.data.item;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update inventory item';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.delete(`/inventory/${itemId}`);
      const currentItems = get().items;
      set({ 
        items: currentItems.filter(item => item.item_id !== itemId),
        isLoading: false 
      });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete inventory item';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useInventoryStore; 
