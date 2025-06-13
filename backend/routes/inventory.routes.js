import { Router } from 'express';
import {
    fetchAllInventoryItems,
    fetchInventoryItemById,
    createNewInventoryItem,
    updateExistingInventoryItem,
    deleteExistingInventoryItem
} from '../controllers/inventory.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { 
    inventoryValidation, 
    inventoryUpdateValidation, 
    inventoryIdValidation 
} from '../middleware/validation.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all inventory items (admin and GSO staff only)
router.get('/', fetchAllInventoryItems);

// Get inventory item by ID (admin and GSO staff only)
router.get('/:id', inventoryIdValidation, fetchInventoryItemById);

// Create new inventory item (admin and GSO staff only)
router.post('/', inventoryValidation, createNewInventoryItem);

// Update inventory item (admin and GSO staff only)
router.put('/:id', [...inventoryIdValidation, ...inventoryUpdateValidation], updateExistingInventoryItem);

// Delete inventory item (admin and GSO staff only)
router.delete('/:id', inventoryIdValidation, deleteExistingInventoryItem);

export default router;
