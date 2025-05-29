import { body, validationResult } from 'express-validator';

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

// Product validation
export const productValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Product description is required'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Product category is required'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a positive integer'),
    validate
]; 