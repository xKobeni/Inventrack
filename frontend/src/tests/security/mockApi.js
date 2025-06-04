// Mock API responses for security testing
const mockResponses = {
  // Authentication endpoints
  '/api/test/auth/token': {
    success: true,
    message: 'Token validation successful'
  },
  '/api/test/auth/session': {
    success: true,
    message: 'Session validation successful'
  },
  '/api/test/auth/password': {
    success: true,
    message: 'Password validation successful'
  },

  // Network security endpoints
  '/api/test/rate-limit': {
    success: true,
    message: 'Rate limit test successful'
  },
  '/api/test/ssl': {
    success: true,
    message: 'SSL/TLS verification successful'
  },

  // Data security endpoints
  '/api/test/xss': {
    success: true,
    message: 'XSS test successful'
  },
  '/api/test/csrf': {
    success: true,
    message: 'CSRF test successful'
  },
  '/api/test/sql-injection': {
    success: true,
    message: 'SQL injection test successful'
  },

  // Headers and policies endpoints
  '/api/test/headers': {
    success: true,
    message: 'Security headers test successful'
  },
  '/api/test/csp': {
    success: true,
    message: 'CSP test successful'
  },

  // Input validation endpoints
  '/api/test/input': {
    success: true,
    message: 'Input validation test successful'
  },
  '/api/test/file-upload': {
    success: true,
    message: 'File upload test successful'
  },
  '/api/test/queue': {
    success: true,
    message: 'Queue test successful'
  }
};

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API client for testing
export const mockApiClient = {
  get: async (url) => {
    await delay(500); // Simulate network delay
    if (mockResponses[url]) {
      return { data: mockResponses[url] };
    }
    throw new Error('Not found');
  },

  post: async (url, data) => {
    await delay(500);
    
    // Handle different test scenarios
    switch (url) {
      case '/api/test/xss':
        if (data.data.includes('<script>')) {
          throw { response: { status: 400, data: 'XSS attempt blocked' } };
        }
        break;

      case '/api/test/sql-injection':
        if (data.query?.includes("' OR '1'='1")) {
          throw { response: { status: 400, data: 'SQL injection attempt blocked' } };
        }
        break;

      case '/api/test/csrf':
        if (!data.csrfToken) {
          throw { response: { status: 403, data: 'CSRF token missing' } };
        }
        break;

      case '/api/test/file-upload':
        if (data.file?.type === 'application/x-msdownload') {
          throw { response: { status: 400, data: 'Malicious file type blocked' } };
        }
        if (data.file?.size > 5000000) {
          throw { response: { status: 400, data: 'File size exceeds limit' } };
        }
        break;

      case '/api/test/input':
        if (data.input?.length > 1000) {
          throw { response: { status: 400, data: 'Input length exceeds limit' } };
        }
        break;

      case '/api/test/auth/token':
        if (data.token === 'expired-token-456') {
          throw { response: { status: 401, data: 'Token expired' } };
        }
        if (data.token === 'invalid-token-789') {
          throw { response: { status: 401, data: 'Invalid token' } };
        }
        break;
    }

    if (mockResponses[url]) {
      return { data: mockResponses[url] };
    }
    throw new Error('Not found');
  },

  // Add more HTTP methods as needed
  put: async (url) => {
    await delay(500);
    if (mockResponses[url]) {
      return { data: mockResponses[url] };
    }
    throw new Error('Not found');
  },

  delete: async (url) => {
    await delay(500);
    if (mockResponses[url]) {
      return { data: mockResponses[url] };
    }
    throw new Error('Not found');
  }
}; 