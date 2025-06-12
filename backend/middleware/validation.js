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
    body('name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .isIn(['admin', 'department_rep', 'gso_staff'])
        .withMessage('Role must be one of: admin, department_rep, gso_staff'),
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
    body('profile_picture')
        .optional()
        .custom((value, { req }) => {
            if (!value) return true;
            // Accept base64 string
            if (typeof value !== 'string') {
                throw new Error('Profile picture must be a base64-encoded string');
            }
            // Check if it's valid base64
            const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
            if (!base64Pattern.test(value)) {
                throw new Error('Profile picture must be a valid base64 string');
            }
            // Check file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            const sizeInBytes = Math.ceil((value.length * 3) / 4); // base64 to bytes
            if (sizeInBytes > maxSize) {
                throw new Error('Profile picture size must not exceed 5MB');
            }
            return true;
        }),
    body('profile_picture_type')
        .optional()
        .isIn(['image/jpeg', 'image/png', 'image/gif'])
        .withMessage('Profile picture must be a JPEG, PNG, or GIF image'),
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
        .isIn(['user', 'admin', 'department_rep', 'gso_staff'])
        .withMessage('Role must be either "user", "admin", "department_rep", or "gso_staff"'),
    body('profile_picture')
        .optional()
        .custom((value, { req }) => {
            if (!value) return true;
            // Accept base64 string
            if (typeof value !== 'string') {
                throw new Error('Profile picture must be a base64-encoded string');
            }
            // Check if it's valid base64
            const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
            if (!base64Pattern.test(value)) {
                throw new Error('Profile picture must be a valid base64 string');
            }
            // Check file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            const sizeInBytes = Math.ceil((value.length * 3) / 4); // base64 to bytes
            if (sizeInBytes > maxSize) {
                throw new Error('Profile picture size must not exceed 5MB');
            }
            return true;
        }),
    body('profile_picture_type')
        .optional()
        .isIn(['image/jpeg', 'image/png', 'image/gif'])
        .withMessage('Profile picture must be a JPEG, PNG, or GIF image'),
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

// Inventory validation
export const inventoryValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Item name must be between 2 and 100 characters long')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Item name can only contain letters, numbers, spaces, hyphens, and underscores'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must not exceed 100 characters'),
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer'),
    body('unit')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Unit must be between 1 and 20 characters'),
    body('condition')
        .optional()
        .isIn(['new', 'used', 'damaged', 'maintenance'])
        .withMessage('Condition must be one of: new, used, damaged, maintenance'),
    body('status')
        .optional()
        .isIn(['available', 'unavailable', 'reserved', 'maintenance'])
        .withMessage('Status must be one of: available, unavailable, reserved, maintenance'),
    body('expiration_date')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === '') return true;
            return /^\d{4}-\d{2}-\d{2}$/.test(value);
        })
        .withMessage('Expiration date must be null or a valid date in YYYY-MM-DD format'),
    body('department_id')
        .isInt()
        .withMessage('Department ID must be a valid integer'),
    validate
];

// Inventory update validation
export const inventoryUpdateValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Item name must be between 2 and 100 characters long')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Item name can only contain letters, numbers, spaces, hyphens, and underscores'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must not exceed 100 characters'),
    body('quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer'),
    body('unit')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Unit must be between 1 and 20 characters'),
    body('condition')
        .optional()
        .isIn(['new', 'used', 'damaged', 'maintenance'])
        .withMessage('Condition must be one of: new, used, damaged, maintenance'),
    body('status')
        .optional()
        .isIn(['available', 'unavailable', 'reserved', 'maintenance'])
        .withMessage('Status must be one of: available, unavailable, reserved, maintenance'),
    body('expiration_date')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === '') return true;
            return /^\d{4}-\d{2}-\d{2}$/.test(value);
        })
        .withMessage('Expiration date must be null or a valid date in YYYY-MM-DD format'),
    body('department_id')
        .optional()
        .isInt()
        .withMessage('Department ID must be a valid integer'),
    validate
];

// Inventory ID parameter validation
export const inventoryIdValidation = [
    param('id')
        .isInt()
        .withMessage('Inventory item ID must be a valid integer'),
    validate
];

// Procurement validation
export const procurementValidation = [
    body('department_id')
        .isInt()
        .withMessage('Department ID must be a valid integer'),
    body('justification')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Justification must be between 10 and 1000 characters'),
    body('priority')
        .optional()
        .isIn(['high', 'medium', 'low'])
        .withMessage('Priority must be one of: high, medium, low'),
    body('required_by_date')
        .optional()
        .isISO8601()
        .withMessage('Required by date must be a valid date'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must not exceed 100 characters'),
    body('subcategory')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Subcategory must not exceed 100 characters'),
    body('items')
        .isArray()
        .withMessage('Items must be an array')
        .notEmpty()
        .withMessage('Items array cannot be empty'),
    body('items.*.item_id')
        .isInt()
        .withMessage('Item ID must be a valid integer'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    validate
];

// Procurement update validation
export const procurementUpdateValidation = [
    body('status')
        .optional()
        .isIn(['pending', 'approved', 'denied'])
        .withMessage('Status must be one of: pending, approved, denied'),
    body('justification')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Justification must be between 10 and 1000 characters'),
    body('priority')
        .optional()
        .isIn(['high', 'medium', 'low'])
        .withMessage('Priority must be one of: high, medium, low'),
    body('required_by_date')
        .optional()
        .isISO8601()
        .withMessage('Required by date must be a valid date'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must not exceed 100 characters'),
    body('subcategory')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Subcategory must not exceed 100 characters'),
    validate
];

// Procurement ID parameter validation
export const procurementIdValidation = [
    param('id')
        .isInt()
        .withMessage('Procurement request ID must be a valid integer'),
    validate
];

// Incident Report validation
export const incidentReportValidation = [
    body('item_id')
        .optional()
        .isInt()
        .withMessage('Item ID must be a valid integer'),
    body('custom_item')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Custom item name must be between 2 and 100 characters'),
    body('type')
        .isIn(['damage', 'loss', 'maintenance'])
        .withMessage('Type must be one of: damage, loss, maintenance'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body()
        .custom((value, { req }) => {
            if (!req.body.item_id && !req.body.custom_item) {
                throw new Error('Either item_id or custom_item must be provided');
            }
            return true;
        }),
    validate
];

// Incident Report update validation
export const incidentReportUpdateValidation = [
    body('status')
        .isIn(['open', 'resolved'])
        .withMessage('Status must be either open or resolved'),
    validate
];

// Incident Report ID parameter validation
export const incidentReportIdValidation = [
    param('id')
        .isInt()
        .withMessage('Report ID must be a valid integer'),
    validate
];

// Item ID parameter validation
export const itemIdValidation = [
    param('itemId')
        .isInt()
        .withMessage('Item ID must be a valid integer'),
    validate
];

// Bulk user operations validation
export const bulkUserValidation = [
    body('userIds')
        .isArray()
        .withMessage('userIds must be an array')
        .notEmpty()
        .withMessage('userIds array cannot be empty'),
    body('userIds.*')
        .isInt()
        .withMessage('Each userId must be an integer'),
    validate
];

// Bulk update validation
export const bulkUpdateValidation = [
    body('userIds')
        .isArray()
        .withMessage('userIds must be an array')
        .notEmpty()
        .withMessage('userIds array cannot be empty'),
    body('userIds.*')
        .isInt()
        .withMessage('Each userId must be an integer'),
    body('updateData')
        .isObject()
        .withMessage('updateData must be an object'),
    body('updateData.name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    body('updateData.email')
        .optional()
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('updateData.role')
        .optional()
        .isIn(['admin', 'gso_staff', 'department_rep'])
        .withMessage('Invalid role'),
    body('updateData.is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean'),
    validate
];

// Email verification request validation
export const emailVerificationRequestValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email'),
    validate
];

// Email verification confirmation validation
export const emailVerificationConfirmValidation = [
    body('token')
        .notEmpty()
        .withMessage('Verification token is required'),
    validate
];
