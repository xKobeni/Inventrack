import { Router } from 'express';
import {
    fetchAllInventoryItems,
    fetchInventoryItemById,
    createNewInventoryItem,
    updateExistingInventoryItem,
    deleteExistingInventoryItem,
    fetchAllCategories,
    fetchCategoryById,
    createNewCategory,
    updateExistingCategory,
    deleteExistingCategory
} from '../controllers/inventory.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { 
    inventoryValidation, 
    inventoryUpdateValidation, 
    inventoryIdValidation,
    categoryValidation,
    categoryIdValidation
} from '../middleware/validation.js';
import { inventoryLimiter } from '../middleware/endpointRateLimiters.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Category Routes (must come before inventory item routes with :id parameter)
// Get all categories (admin and GSO staff only)
router.get('/categories', inventoryLimiter.get, fetchAllCategories);

// Get category by ID (admin and GSO staff only)
router.get('/categories/:id', inventoryLimiter.get, categoryIdValidation, fetchCategoryById);

// Create new category (admin and GSO staff only)
router.post('/categories', inventoryLimiter.modify, categoryValidation, createNewCategory);

// Update category (admin and GSO staff only)
router.put('/categories/:id', inventoryLimiter.modify, [...categoryIdValidation, ...categoryValidation], updateExistingCategory);

// Delete category (admin and GSO staff only)
router.delete('/categories/:id', inventoryLimiter.modify, categoryIdValidation, deleteExistingCategory);

// Inventory Item Routes
// Get all inventory items (admin and GSO staff only)
router.get('/', inventoryLimiter.get, fetchAllInventoryItems);

// Get inventory item by ID (admin and GSO staff only)
router.get('/:id', inventoryLimiter.get, inventoryIdValidation, fetchInventoryItemById);

// Create new inventory item (admin and GSO staff only)
router.post('/', inventoryLimiter.modify, inventoryValidation, createNewInventoryItem);

// Update inventory item (admin and GSO staff only)
router.put('/:id', inventoryLimiter.modify, [...inventoryIdValidation, ...inventoryUpdateValidation], updateExistingInventoryItem);

// Delete inventory item (admin and GSO staff only)
router.delete('/:id', inventoryLimiter.modify, inventoryIdValidation, deleteExistingInventoryItem);

export default router;
