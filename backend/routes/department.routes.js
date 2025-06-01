import { Router } from 'express';
import {
    fetchAllDepartments,
    fetchDepartmentById,
    createNewDepartment,
    updateExistingDepartment,
    deleteExistingDepartment
} from '../controllers/department.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { 
    departmentValidation, 
    departmentUpdateValidation, 
    departmentIdValidation 
} from '../middleware/validation.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all departments (admin only)
router.get('/', fetchAllDepartments);

// Get department by ID (admin only)
router.get('/:id', departmentIdValidation, fetchDepartmentById);

// Create new department (admin only)
router.post('/', departmentValidation, createNewDepartment);

// Update department (admin only)
router.put('/:id', [...departmentIdValidation, ...departmentUpdateValidation], updateExistingDepartment);

// Delete department (admin only)
router.delete('/:id', departmentIdValidation, deleteExistingDepartment);

export default router;
