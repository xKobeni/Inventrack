// Test utilities for security testing

// Test result types
export const TestStatus = {
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  WARNING: 'warning'
};

// Create a test result object
export const createTestResult = (name, status, message = '', details = {}) => ({
  name,
  status,
  message,
  details,
  timestamp: new Date().toISOString()
});

// Test categories
export const TestCategory = {
  // Authentication & Authorization
  AUTH_TOKEN: 'Authentication Token',
  SESSION_MANAGEMENT: 'Session Management',
  PASSWORD_SECURITY: 'Password Security',
  
  // Network Security
  RATE_LIMITING: 'Rate Limiting',
  CORS_PROTECTION: 'CORS Protection',
  REQUEST_QUEUE: 'Request Queue',
  SSL_TLS: 'SSL/TLS Verification',
  
  // Data Security
  COOKIE_SECURITY: 'Cookie Security',
  XSS_PROTECTION: 'XSS Protection',
  CSRF_PROTECTION: 'CSRF Protection',
  SQL_INJECTION: 'SQL Injection Prevention',
  
  // Headers & Policies
  SECURITY_HEADERS: 'Security Headers',
  CONTENT_SECURITY: 'Content Security Policy',
  REFERRER_POLICY: 'Referrer Policy',
  
  // Input Validation
  INPUT_SANITIZATION: 'Input Sanitization',
  FILE_UPLOAD: 'File Upload Security',
  API_VALIDATION: 'API Input Validation'
};

// Test descriptions
export const TestDescriptions = {
  // Authentication & Authorization
  [TestCategory.AUTH_TOKEN]: 'Verifies JWT token handling, expiration, and refresh mechanisms',
  [TestCategory.SESSION_MANAGEMENT]: 'Tests session creation, validation, and secure session termination',
  [TestCategory.PASSWORD_SECURITY]: 'Validates password hashing, complexity requirements, and reset flows',
  
  // Network Security
  [TestCategory.RATE_LIMITING]: 'Tests request rate limiting, IP-based restrictions, and concurrent request handling',
  [TestCategory.CORS_PROTECTION]: 'Verifies CORS policy implementation and cross-origin request blocking',
  [TestCategory.REQUEST_QUEUE]: 'Tests request queuing, prioritization, and timeout handling',
  [TestCategory.SSL_TLS]: 'Validates SSL/TLS configuration and certificate verification',
  
  // Data Security
  [TestCategory.COOKIE_SECURITY]: 'Tests secure cookie attributes, encryption, and SameSite policy',
  [TestCategory.XSS_PROTECTION]: 'Validates XSS prevention, input sanitization, and output encoding',
  [TestCategory.CSRF_PROTECTION]: 'Tests CSRF token generation, validation, and protection mechanisms',
  [TestCategory.SQL_INJECTION]: 'Verifies SQL injection prevention and parameterized query handling',
  
  // Headers & Policies
  [TestCategory.SECURITY_HEADERS]: 'Tests implementation of security headers (HSTS, X-Frame-Options, etc.)',
  [TestCategory.CONTENT_SECURITY]: 'Validates Content Security Policy implementation and restrictions',
  [TestCategory.REFERRER_POLICY]: 'Tests referrer policy implementation and information leakage prevention',
  
  // Input Validation
  [TestCategory.INPUT_SANITIZATION]: 'Tests input validation, sanitization, and malicious input detection',
  [TestCategory.FILE_UPLOAD]: 'Validates file upload restrictions, type checking, and malware scanning',
  [TestCategory.API_VALIDATION]: 'Tests API input validation, schema enforcement, and error handling'
};

// Test data
export const TestData = {
  // Authentication
  TEST_TOKEN: 'test-token-123',
  REFRESH_TOKEN: 'refresh-token-123',
  EXPIRED_TOKEN: 'expired-token-456',
  INVALID_TOKEN: 'invalid-token-789',
  
  // Security Tests
  XSS_PAYLOAD: '<script>alert("xss")</script>',
  SQL_INJECTION: "' OR '1'='1",
  CSRF_TOKEN: 'csrf-token-abc',
  MALICIOUS_URL: 'http://malicious-site.com/api/data',
  
  // File Upload
  MALICIOUS_FILE: {
    name: 'malicious.exe',
    type: 'application/x-msdownload',
    size: 1024
  },
  VALID_FILE: {
    name: 'document.pdf',
    type: 'application/pdf',
    size: 2048
  },
  
  // Headers
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
};

// Test severity levels
export const TestSeverity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Test result formatter
export const formatTestResult = (result) => {
  const statusColors = {
    [TestStatus.PASSED]: 'bg-green-100 text-green-800',
    [TestStatus.FAILED]: 'bg-red-100 text-red-800',
    [TestStatus.RUNNING]: 'bg-yellow-100 text-yellow-800',
    [TestStatus.SKIPPED]: 'bg-gray-100 text-gray-800',
    [TestStatus.WARNING]: 'bg-orange-100 text-orange-800'
  };

  return {
    ...result,
    statusColor: statusColors[result.status] || 'bg-gray-100 text-gray-800',
    formattedTime: new Date(result.timestamp).toLocaleTimeString()
  };
}; 