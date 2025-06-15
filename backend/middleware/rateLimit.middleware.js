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

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    keyGenerator: generateKey,
    skip: (req) => isAuthenticated(req), // Skip rate limiting for authenticated users
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for authentication routes
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after an hour'
    },
    keyGenerator: generateKey,
    standardHeaders: true,
    legacyHeaders: false,
    // Add additional security headers
    handler: (req, res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again after an hour'
        });
    }
});

// Limiter for password reset requests
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again after an hour'
    },
    keyGenerator: generateKey,
    standardHeaders: true,
    legacyHeaders: false,
    // Add additional security headers
    handler: (req, res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.status(429).json({
            success: false,
            message: 'Too many password reset attempts, please try again after an hour'
        });
    }
});

// Limiter for registration attempts
export const registrationLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 50, // Limit each IP to 50 registration attempts per day
    message: {
        success: false,
        message: 'Too many registration attempts, please try again tomorrow'
    },
    keyGenerator: generateKey,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.status(429).json({
            success: false,
            message: 'Too many registration attempts, please try again tomorrow'
        });
    }
}); 