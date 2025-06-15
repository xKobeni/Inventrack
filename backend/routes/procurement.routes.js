import { Router } from 'express';
import {
    fetchAllProcurementRequests,
    fetchProcurementRequestById,
    createNewProcurementRequest,
    updateExistingProcurementRequest,
    deleteExistingProcurementRequest,
    fetchMyProcurementRequests,
    fetchProcurementRequestsByDepartment
} from '../controllers/procurement.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { 
    procurementValidation, 
    procurementUpdateValidation, 
    procurementIdValidation 
} from '../middleware/validation.js';
import { procurementLimiter } from "../middleware/endpointRateLimiters.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all procurement requests (admin and GSO staff only)
router.get('/', procurementLimiter.view, fetchAllProcurementRequests);

// Get my procurement requests (all authenticated users)
router.get('/my-requests', procurementLimiter.view, fetchMyProcurementRequests);

// Get procurement requests by department (admin and GSO staff only)
router.get('/department/:departmentId', procurementLimiter.view, fetchProcurementRequestsByDepartment);

// Get procurement request by ID (admin and GSO staff only)
router.get('/:id', procurementLimiter.view, procurementIdValidation, fetchProcurementRequestById);

// Create new procurement request (all authenticated users)
router.post('/', procurementLimiter.modify, procurementValidation, createNewProcurementRequest);

// Update procurement request (admin and GSO staff only)
router.put('/:id', procurementLimiter.modify, [...procurementIdValidation, ...procurementUpdateValidation], updateExistingProcurementRequest);

// Delete procurement request (admin and GSO staff only)
router.delete('/:id', procurementLimiter.modify, procurementIdValidation, deleteExistingProcurementRequest);

export default router;
