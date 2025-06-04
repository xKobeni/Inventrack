import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:5001';

// Request queue for handling concurrent requests
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    const { request, resolve, reject } = this.queue.shift();
    try {
      const response = await request();
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      this.process();
    }
  }
}

// Exponential backoff utility
const exponentialBackoff = async (fn, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429) { // Rate limit error
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable secure cookie handling
});

// Request queue instance
const requestQueue = new RequestQueue();

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Add security headers
    config.headers['X-Content-Type-Options'] = 'nosniff';
    config.headers['X-Frame-Options'] = 'DENY';
    config.headers['X-XSS-Protection'] = '1; mode=block';
    config.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    
    // Add token if available
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

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { toast } = useToast();

    if (error.response) {
      // Handle rate limiting
      if (error.response.status === 429) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many requests. Please try again later.",
          variant: "destructive",
        });
      }

      // Handle CORS errors
      if (error.response.status === 0) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your connection.",
          variant: "destructive",
        });
      }

      // Handle other errors
      if (error.response.status >= 500) {
        toast({
          title: "Server Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    }

    return Promise.reject(error);
  }
);

// Secure request wrapper
const secureRequest = async (config) => {
  return requestQueue.add(() => exponentialBackoff(() => api(config)));
};

// API methods with security features
export const apiClient = {
  get: (url, config = {}) => secureRequest({ ...config, method: 'get', url }),
  post: (url, data, config = {}) => secureRequest({ ...config, method: 'post', url, data }),
  put: (url, data, config = {}) => secureRequest({ ...config, method: 'put', url, data }),
  delete: (url, config = {}) => secureRequest({ ...config, method: 'delete', url }),
  patch: (url, data, config = {}) => secureRequest({ ...config, method: 'patch', url, data }),
}; 