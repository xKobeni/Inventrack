import rateLimit from 'express-rate-limit';

// Helper function to check if user is authenticated
const isAuthenticated = (req) => {
  return req.user && req.user.id;
};

// Helper function to generate rate limit key
const generateKey = (req) => {
  // If user is authenticated, use their ID
  if (isAuthenticated(req)) {
    return `user_${req.user.id}`;
  }
  // If not authenticated, use IP
  return req.realIP || req.ip;
};

// Inventory endpoints rate limiters
export const inventoryLimiter = {
  // For GET requests (viewing inventory)
  get: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes
    message: {
      success: false,
      message: 'Too many inventory view requests, please try again later'
    },
    keyGenerator: generateKey,
    skip: (req) => isAuthenticated(req) // Skip for authenticated users
  }),
  
  // For POST/PUT/DELETE requests (modifying inventory)
  modify: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // 50 requests per 15 minutes
    message: {
      success: false,
      message: 'Too many inventory modification requests, please try again later'
    },
    keyGenerator: generateKey
  })
};

// Procurement endpoints rate limiters
export const procurementLimiter = {
  // For viewing procurement requests
  view: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
      success: false,
      message: 'Too many procurement view requests, please try again later'
    },
    keyGenerator: generateKey,
    skip: (req) => isAuthenticated(req)
  }),
  
  // For creating/modifying procurement requests
  modify: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
      success: false,
      message: 'Too many procurement modification requests, please try again later'
    },
    keyGenerator: generateKey
  })
};

// Department endpoints rate limiters
export const departmentLimiter = {
  // For viewing departments
  view: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
      success: false,
      message: 'Too many department view requests, please try again later'
    },
    keyGenerator: generateKey,
    skip: (req) => isAuthenticated(req)
  }),
  
  // For modifying departments (admin operations)
  modify: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
      success: false,
      message: 'Too many department modification requests, please try again later'
    },
    keyGenerator: generateKey
  })
};

// Incident reports rate limiters
export const incidentReportLimiter = {
  // For viewing incident reports
  view: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
      success: false,
      message: 'Too many incident report view requests, please try again later'
    },
    keyGenerator: generateKey,
    skip: (req) => isAuthenticated(req)
  }),
  
  // For creating/modifying incident reports
  modify: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
      success: false,
      message: 'Too many incident report modification requests, please try again later'
    },
    keyGenerator: generateKey
  })
};

// User preferences rate limiter
export const userPreferencesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many preference update requests, please try again later'
  },
  keyGenerator: generateKey
});

// Session management rate limiter
export const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many session requests, please try again later'
  },
  keyGenerator: generateKey
}); 