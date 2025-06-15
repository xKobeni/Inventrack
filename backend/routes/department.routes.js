import { Router } from 'express';
import {
    fetchAllDepartments,
    fetchDepartmentById,
    createNewDepartment,
    updateExistingDepartment,
    deleteExistingDepartment,
    activateExistingDepartment,
    deactivateExistingDepartment
} from '../controllers/department.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { 
    departmentValidation, 
    departmentUpdateValidation, 
    departmentIdValidation 
} from '../middleware/validation.js';
import { auditMiddleware } from "../middleware/audit.middleware.js";
import { departmentLimiter } from "../middleware/endpointRateLimiters.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all departments (admin only)
router.get('/', departmentLimiter.view, fetchAllDepartments);

// Get department by ID (admin only)
router.get('/:id', departmentLimiter.view, departmentIdValidation, fetchDepartmentById);

// Create new department (admin only)
router.post('/', departmentLimiter.modify, departmentValidation, auditMiddleware('CREATE_DEPARTMENT'), createNewDepartment);

// Update department (admin only)
router.put('/:id', departmentLimiter.modify, [...departmentIdValidation, ...departmentUpdateValidation], auditMiddleware('UPDATE_DEPARTMENT'), updateExistingDepartment);

// Delete department (admin only)
router.delete('/:id', departmentLimiter.modify, departmentIdValidation, auditMiddleware('DELETE_DEPARTMENT'), deleteExistingDepartment);

// Activate department (admin only)
router.put('/:id/activate', departmentLimiter.modify, departmentIdValidation, auditMiddleware('ACTIVATE_DEPARTMENT'), activateExistingDepartment);

// Deactivate department (admin only)
router.put('/:id/deactivate', departmentLimiter.modify, departmentIdValidation, auditMiddleware('DEACTIVATE_DEPARTMENT'), deactivateExistingDepartment);

export default router;
