import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  secure: true, // Only send cookies over HTTPS
  sameSite: 'strict', // Protect against CSRF
  path: '/', // Cookie is available for all paths
  expires: 7, // 7 days
};

export const cookieManager = {
  // Set a secure cookie
  set: (name, value, options = {}) => {
    Cookies.set(name, value, { ...COOKIE_OPTIONS, ...options });
  },

  // Get a cookie value
  get: (name) => {
    return Cookies.get(name);
  },

  // Remove a cookie
  remove: (name, options = {}) => {
    Cookies.remove(name, { ...COOKIE_OPTIONS, ...options });
  },

  // Set authentication cookies
  setAuthCookies: (accessToken, refreshToken) => {
    cookieManager.set('access_token', accessToken, {
      expires: 1, // 1 day for access token
    });
    cookieManager.set('refresh_token', refreshToken, {
      expires: 7, // 7 days for refresh token
    });
  },

  // Clear authentication cookies
  clearAuthCookies: () => {
    cookieManager.remove('access_token');
    cookieManager.remove('refresh_token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!cookieManager.get('access_token');
  },

  // Get access token
  getAccessToken: () => {
    return cookieManager.get('access_token');
  },

  // Get refresh token
  getRefreshToken: () => {
    return cookieManager.get('refresh_token');
  },
}; 