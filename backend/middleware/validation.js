import { body, validationResult, param } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: "Validation Error",
            message: errors.array()
        });
    }
    next();
};

// User registration validation
export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    validate
];

// Login validation
export const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

// User profile update validation
export const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    validate
];

// Admin user update validation
export const adminUpdateUserValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be either "user" or "admin"'),
    validate
];

// User ID parameter validation
export const userIdValidation = [
    param('id')
        .isInt()
        .withMessage('User ID must be a valid integer'),
    validate
];

// Department validation
export const departmentValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department name must be between 2 and 100 characters long')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Department name can only contain letters, numbers, spaces, hyphens, and underscores'),
    validate
];

// Department update validation
export const departmentUpdateValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department name must be between 2 and 100 characters long')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Department name can only contain letters, numbers, spaces, hyphens, and underscores'),
    validate
];

// Department ID parameter validation
export const departmentIdValidation = [
    param('id')
        .isInt()
        .withMessage('Department ID must be a valid integer'),
    validate
];
