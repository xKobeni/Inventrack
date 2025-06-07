import { create } from "zustand";
import axios from "axios";

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

// Helper function to parse browser string
const parseBrowserString = (browserStr) => {
  try {
    // Remove quotes and split by comma
    const browsers = browserStr.replace(/"/g, '').split(',');
    // Get the first browser name
    return browsers[0].split(';')[0].trim();
  } catch (error) {
    console.warn('Failed to parse browser string:', error);
    return 'Unknown Browser';
  }
};

// Helper function to parse platform string
const parsePlatformString = (platformStr) => {
  try {
    // Remove quotes and get the platform
    return platformStr.replace(/"/g, '').trim();
  } catch (error) {
    console.warn('Failed to parse platform string:', error);
    return 'Unknown Platform';
  }
};

// Helper function to format date and time
const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Format the date
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Format the time
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Add relative time
    let relativeTime = '';
    if (diffInSeconds < 60) {
      relativeTime = 'just now';
    } else if (diffInMinutes < 60) {
      relativeTime = `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      relativeTime = `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      relativeTime = `${diffInDays}d ago`;
    }

    return {
      date: formattedDate,
      time: formattedTime,
      relative: relativeTime
    };
  } catch (error) {
    console.warn('Failed to format date:', error);
    return {
      date: 'Unknown Date',
      time: 'Unknown Time',
      relative: ''
    };
  }
};

const useUserSessionStore = create((set) => ({
  sessions: [],
  loading: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/sessions');
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch sessions');
      }

      // Get current token
      const currentToken = localStorage.getItem('auth-storage') 
        ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
        : null;

      // Transform the session data for display
      const transformedSessions = data.data.sessions.map(session => {
        // Parse device info
        const deviceInfo = session.device_info || {};
        const browser = deviceInfo.browser ? parseBrowserString(deviceInfo.browser) : 'Unknown Browser';
        const platform = deviceInfo.platform ? parsePlatformString(deviceInfo.platform) : 'Unknown Platform';
        
        // Format location
        const location = session.location_country || 'Unknown Country';
        const region = session.location_region || 'Unknown Region';

        // Format date and time
        const lastActive = formatDateTime(session.last_activity);

        // Check if this is the current session
        const isCurrent = currentToken === session.token;

        return {
          id: session.session_id,
          platform,
          browser,
          location,
          region,
          lastActive,
          current: isCurrent
        };
      });

      console.log('Transformed sessions:', transformedSessions); // Debug log
      set({ sessions: transformedSessions, loading: false });
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch sessions', 
        loading: false 
      });
      throw error;
    }
  },

  logoutSession: async () => {
    set({ loading: true, error: null });
    try {
      await api.delete('/sessions/current');
      // Refetch sessions after logout
      await useUserSessionStore.getState().fetchSessions();
    } catch (error) {
      console.error('Failed to logout session:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to logout session', 
        loading: false 
      });
      throw error;
    }
  },

  logoutAllSessions: async () => {
    set({ loading: true, error: null });
    try {
      await api.delete('/sessions/all');
      set({ sessions: [], loading: false });
    } catch (error) {
      console.error('Failed to logout all sessions:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to logout all sessions', 
        loading: false 
      });
      throw error;
    }
  },
}));

export default useUserSessionStore;
