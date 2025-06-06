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

const useManageUserStore = create((set, get) => ({

  users: [],
  isLoading: false,
  error: null,

  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  },

  fetchUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/users', { params });
      set({ 
        users: data.data.users,
        pagination: {
          currentPage: data.data.pagination.current_page,
          totalPages: data.data.pagination.total_pages,
          totalItems: data.data.pagination.total_items,
          itemsPerPage: data.data.pagination.items_per_page
        },
        isLoading: false 
      });
      return data.data.users;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  addUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', userData);
      const newUser = {
        id: data.user.id,
        name: userData.name,
        email: data.user.email,
        role: data.user.role,
        is_active: true
      };
      set({ users: [...get().users, newUser], isLoading: false });
      return newUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add user';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateUser: async (userId, userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/users/${userId}`, userData);
      const currentUsers = get().users;
      set({ 
        users: currentUsers.map(user => 
          user.id === userId ? data.data.user : user
        ),
        isLoading: false 
      });
      return data.data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/users/${userId}`);
      const currentUsers = get().users;
      set({ 
        users: currentUsers.filter(user => user.id !== userId),
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  activateUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/users/${userId}/activate`);
      const currentUsers = get().users;
      set({ 
        users: currentUsers.map(user => 
          user.id === userId ? { ...user, is_active: true } : user
        ),
        isLoading: false 
      });
      return data.data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to activate user';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deactivateUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/users/${userId}/deactivate`);
      const currentUsers = get().users;
      set({ 
        users: currentUsers.map(user => 
          user.id === userId ? { ...user, is_active: false } : user
        ),
        isLoading: false 
      });
      return data.data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deactivate user';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  editUser: async (userId, userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/users/${userId}`, userData);
      const currentUsers = get().users;
      set({ 
        users: currentUsers.map(user => 
          user.id === userId ? data.data.user : user
        ),
        isLoading: false 
      });
      return data.data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to edit user';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useManageUserStore;