import { 
    getAllInventoryItems, 
    getInventoryItemById, 
    createInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem 
} from '../models/inventory.models.js';

// Get all inventory items
export const fetchAllInventoryItems = async (req, res) => {
    try {
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to view inventory items.'
            });
        }

        const items = await getAllInventoryItems();
        
        res.status(200).json({
            success: true,
            message: 'Inventory items retrieved successfully',
            data: {
                items
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving inventory items',
            error: error.message
        });
    }
};

// Get inventory item by ID
export const fetchInventoryItemById = async (req, res) => {
    try {
        const itemId = req.params.id;
        
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to view inventory items.'
            });
        }

        const item = await getInventoryItemById(itemId);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inventory item retrieved successfully',
            data: {
                item
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving inventory item',
            error: error.message
        });
    }
};

// Create new inventory item
export const createNewInventoryItem = async (req, res) => {
    try {
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to create inventory items.'
            });
        }

        const itemData = {
            ...req.body,
            created_by: req.user.user_id
        };

        // Validate required fields
        const requiredFields = ['name', 'quantity', 'unit', 'department_id'];
        const missingFields = requiredFields.filter(field => !itemData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const item = await createInventoryItem(itemData);
        
        res.status(201).json({
            success: true,
            message: 'Inventory item created successfully',
            data: {
                item
            }
        });
    } catch (error) {
        if (error.code === '23503') { // Foreign key violation
            res.status(400).json({
                success: false,
                message: 'Invalid department ID or user ID'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error creating inventory item',
                error: error.message
            });
        }
    }
};

// Update inventory item
export const updateExistingInventoryItem = async (req, res) => {
    try {
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to update inventory items.'
            });
        }

        const itemId = req.params.id;
        const itemData = req.body;

        // Validate required fields
        const requiredFields = ['name', 'quantity', 'unit', 'department_id'];
        const missingFields = requiredFields.filter(field => !itemData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const item = await updateInventoryItem(itemId, itemData);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inventory item updated successfully',
            data: {
                item
            }
        });
    } catch (error) {
        if (error.code === '23503') { // Foreign key violation
            res.status(400).json({
                success: false,
                message: 'Invalid department ID'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error updating inventory item',
                error: error.message
            });
        }
    }
};

// Delete inventory item
export const deleteExistingInventoryItem = async (req, res) => {
    try {
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to delete inventory items.'
            });
        }

        const itemId = req.params.id;
        const item = await deleteInventoryItem(itemId);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inventory item deleted successfully',
            data: {
                item
            }
        });
    } catch (error) {
        if (error.code === '23503') { // Foreign key violation
            res.status(400).json({
                success: false,
                message: 'Cannot delete inventory item as it is referenced by other records'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error deleting inventory item',
                error: error.message
            });
        }
    }
};
