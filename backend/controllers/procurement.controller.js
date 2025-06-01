import {
    getAllProcurementRequests,
    getProcurementRequestById,
    createProcurementRequest,
    updateProcurementRequest,
    deleteProcurementRequest,
    getProcurementRequestsByUser,
    getProcurementRequestsByDepartment
} from '../models/procurement.model.js';

// Get all procurement requests
export const fetchAllProcurementRequests = async (req, res) => {
    try {
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to view procurement requests.'
            });
        }

        const requests = await getAllProcurementRequests();
        
        res.status(200).json({
            success: true,
            message: 'Procurement requests retrieved successfully',
            data: {
                requests
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving procurement requests',
            error: error.message
        });
    }
};

// Get procurement request by ID
export const fetchProcurementRequestById = async (req, res) => {
    try {
        const requestId = req.params.id;
        
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to view procurement requests.'
            });
        }

        const request = await getProcurementRequestById(requestId);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Procurement request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Procurement request retrieved successfully',
            data: {
                request
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving procurement request',
            error: error.message
        });
    }
};

// Create new procurement request
export const createNewProcurementRequest = async (req, res) => {
    try {
        console.log('Creating procurement request with user:', req.user);
        
        const requestData = {
            ...req.body,
            requested_by: req.user.id  // Make sure we're using the correct user ID property
        };

        // Validate required fields
        const requiredFields = ['department_id', 'justification', 'items'];
        const missingFields = requiredFields.filter(field => !requestData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate items array
        if (!Array.isArray(requestData.items) || requestData.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required and must not be empty'
            });
        }

        console.log('Request data being sent to model:', requestData);

        const request = await createProcurementRequest(requestData);
        
        res.status(201).json({
            success: true,
            message: 'Procurement request created successfully',
            data: {
                request
            }
        });
    } catch (error) {
        console.error('Error in createNewProcurementRequest:', error);
        if (error.code === '23503') { // Foreign key violation
            res.status(400).json({
                success: false,
                message: 'Invalid department ID or item ID'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error creating procurement request',
                error: error.message
            });
        }
    }
};

// Update procurement request
export const updateExistingProcurementRequest = async (req, res) => {
    try {
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to update procurement requests.'
            });
        }

        const requestId = req.params.id;
        const requestData = {
            ...req.body,
            reviewed_by: req.user.user_id
        };

        const request = await updateProcurementRequest(requestId, requestData);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Procurement request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Procurement request updated successfully',
            data: {
                request
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
                message: 'Error updating procurement request',
                error: error.message
            });
        }
    }
};

// Delete procurement request
export const deleteExistingProcurementRequest = async (req, res) => {
    try {
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to delete procurement requests.'
            });
        }

        const requestId = req.params.id;

        // First check if the request exists
        const existingRequest = await getProcurementRequestById(requestId);
        if (!existingRequest) {
            return res.status(404).json({
                success: false,
                message: 'Procurement request not found'
            });
        }

        // Check if the request is already approved or denied
        if (existingRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a request that has already been reviewed'
            });
        }

        const request = await deleteProcurementRequest(requestId);
        
        res.status(200).json({
            success: true,
            message: 'Procurement request deleted successfully',
            data: {
                request
            }
        });
    } catch (error) {
        console.error('Error in deleteExistingProcurementRequest:', error);
        
        if (error.code === '23503') { // Foreign key violation
            res.status(400).json({
                success: false,
                message: 'Cannot delete this request as it is referenced by other records'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error deleting procurement request',
                error: error.message
            });
        }
    }
};

// Get procurement requests by current user
export const fetchMyProcurementRequests = async (req, res) => {
    try {
        // Debug: Log user information
        console.log('Current user:', {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        });

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                debug: {
                    user: req.user
                }
            });
        }

        const userId = req.user.id;
        const requests = await getProcurementRequestsByUser(userId);
        
        // Debug: Log the query results
        console.log('Query results:', {
            userId,
            requestCount: requests.length,
            firstRequest: requests[0]
        });

        res.status(200).json({
            success: true,
            message: 'Your procurement requests retrieved successfully',
            data: {
                requests,
                debug: {
                    userId,
                    requestCount: requests.length,
                    userRole: req.user.role
                }
            }
        });
    } catch (error) {
        console.error('Error in fetchMyProcurementRequests:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving your procurement requests',
            error: error.message,
            debug: {
                user: req.user,
                error: error.stack
            }
        });
    }
};

// Get procurement requests by department
export const fetchProcurementRequestsByDepartment = async (req, res) => {
    try {
        // Check if user has access
        if (!['admin', 'gso_staff'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin or GSO staff to view procurement requests.'
            });
        }

        const departmentId = req.params.departmentId;
        const requests = await getProcurementRequestsByDepartment(departmentId);
        
        res.status(200).json({
            success: true,
            message: 'Procurement requests retrieved successfully',
            data: {
                requests
            }
        });
    } catch (error) {
        console.error('Error in fetchProcurementRequestsByDepartment:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving procurement requests',
            error: error.message
        });
    }
};
