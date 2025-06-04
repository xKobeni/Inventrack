// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Name validation
export const validateName = (name) => {
  // At least 2 characters, only letters, spaces, and hyphens
  const nameRegex = /^[A-Za-z\s-]{2,}$/;
  return nameRegex.test(name);
};

// Phone number validation
export const validatePhone = (phone) => {
  // Basic phone number validation (adjust regex based on your requirements)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

// URL validation
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Number validation
export const validateNumber = (number, min, max) => {
  const num = Number(number);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// Required field validation
export const validateRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Date validation
export const validateDate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

// Custom validation function creator
export const createValidator = (validationFn, errorMessage) => {
  return (value) => ({
    isValid: validationFn(value),
    errorMessage: errorMessage
  });
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = values[field];
    
    // Check each rule for the field
    for (const rule of fieldRules) {
      const { isValid, errorMessage } = rule(value);
      if (!isValid) {
        errors[field] = errorMessage;
        break;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 