import { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../models/department.models.js';

// Get all departments (admin only)
export const fetchAllDepartments = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to view all departments.'
            });
        }

        const departments = await getAllDepartments();
        
        res.status(200).json({
            success: true,
            message: 'Departments retrieved successfully',
            data: {
                departments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving departments',
            error: error.message
        });
    }
};

// Get department by ID
export const fetchDepartmentById = async (req, res) => {
    try {
        const departmentId = req.params.id;
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to view department details.'
            });
        }

        const department = await getDepartmentById(departmentId);
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department retrieved successfully',
            data: {
                department
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving department',
            error: error.message
        });
    }
};

// Create new department (admin only)
export const createNewDepartment = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to create a department.'
            });
        }

        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

        const department = await createDepartment(name.trim());
        
        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: {
                department
            }
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400).json({
                success: false,
                message: 'Department name already exists'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error creating department',
                error: error.message
            });
        }
    }
};

// Update department (admin only)
export const updateExistingDepartment = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to update a department.'
            });
        }

        const departmentId = req.params.id;
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

        const department = await updateDepartment(departmentId, name.trim());
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: {
                department
            }
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400).json({
                success: false,
                message: 'Department name already exists'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error updating department',
                error: error.message
            });
        }
    }
};

// Delete department (admin only)
export const deleteExistingDepartment = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to delete a department.'
            });
        }

        const departmentId = req.params.id;
        const department = await deleteDepartment(departmentId);
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully',
            data: {
                department
            }
        });
    } catch (error) {
        if (error.code === '23503') { // Foreign key violation
            res.status(400).json({
                success: false,
                message: 'Cannot delete department as it is referenced by other records'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error deleting department',
                error: error.message
            });
        }
    }
};
