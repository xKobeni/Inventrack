import { 
    getAllDepartments, 
    getDepartmentById, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment,
    activateDepartment,
    deactivateDepartment 
} from '../models/department.models.js';

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

        // Get query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const isActive = req.query.is_active === undefined ? undefined : req.query.is_active === 'true';
        const sortBy = req.query.sort_by || 'name';
        const sortOrder = req.query.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // Calculate offset
        const offset = (page - 1) * limit;

        const { departments, total } = await getAllDepartments({
            limit,
            offset,
            search,
            isActive,
            sortBy,
            sortOrder
        });
        
        res.status(200).json({
            success: true,
            message: 'Departments retrieved successfully',
            data: {
                departments,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_items: total,
                    items_per_page: limit
                }
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

        // Convert binary logo data to base64 if it exists
        if (department.logo) {
            department.logo = department.logo.toString('base64');
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

        const {
            name,
            description,
            contact_email,
            contact_number,
            head_user_id,
            logo,
            logo_type,
            is_active
        } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

        const department = await createDepartment({
            name: name.trim(),
            description,
            contact_email,
            contact_number,
            head_user_id,
            logo,
            logo_type,
            is_active
        });
        
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
        const {
            name,
            description,
            contact_email,
            contact_number,
            head_user_id,
            logo,
            logo_type,
            is_active
        } = req.body;

        if (name && name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Department name cannot be empty'
            });
        }

        const department = await updateDepartment(departmentId, {
            name: name?.trim(),
            description,
            contact_email,
            contact_number,
            head_user_id,
            logo,
            logo_type,
            is_active
        });
        
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

// Activate department (admin only)
export const activateExistingDepartment = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to activate a department.'
            });
        }

        const departmentId = req.params.id;
        const department = await activateDepartment(departmentId);
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department activated successfully',
            data: {
                department
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error activating department',
            error: error.message
        });
    }
};

// Deactivate department (admin only)
export const deactivateExistingDepartment = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to deactivate a department.'
            });
        }

        const departmentId = req.params.id;
        const department = await deactivateDepartment(departmentId);
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department deactivated successfully',
            data: {
                department
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deactivating department',
            error: error.message
        });
    }
};
