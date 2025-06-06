import rateLimit from 'express-rate-limit';

// Helper function to check if user is authenticated
const isAuthenticated = (req) => {
  return req.user && req.user.id;
};

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    skip: (req) => isAuthenticated(req) // Skip rate limiting for authenticated users
});

// Stricter limiter for authentication routes
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after an hour'
    },
    // Don't skip for auth routes as these are for unauthenticated users
});

// Limiter for password reset requests
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again after an hour'
    },
    // Don't skip for password reset as these are for unauthenticated users
}); 