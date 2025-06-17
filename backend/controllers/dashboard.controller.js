import {
    getSystemStats,
    getRecentActivities,
    getDepartmentStats,
    getInventoryStats,
    getProcurementStats,
    getUserActivityStats
} from '../models/dashboard.model.js';

// Get overall dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin access required.'
            });
        }

        // Get all statistics in parallel
        const [
            systemStats,
            recentActivities,
            departmentStats,
            inventoryStats,
            procurementStats,
            userActivityStats
        ] = await Promise.all([
            getSystemStats(),
            getRecentActivities(10),
            getDepartmentStats(),
            getInventoryStats(),
            getProcurementStats(),
            getUserActivityStats(30)
        ]);

        res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: {
                system: systemStats,
                recent_activities: recentActivities,
                departments: departmentStats,
                inventory: inventoryStats,
                procurement: procurementStats,
                user_activity: userActivityStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving dashboard statistics',
            error: error.message
        });
    }
};

// Get system statistics
export const getSystemStatistics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin access required.'
            });
        }

        const stats = await getSystemStats();
        res.status(200).json({
            success: true,
            message: 'System statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving system statistics',
            error: error.message
        });
    }
};

// Get recent activities
export const getRecentSystemActivities = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin access required.'
            });
        }

        const limit = parseInt(req.query.limit) || 10;
        const activities = await getRecentActivities(limit);
        res.status(200).json({
            success: true,
            message: 'Recent activities retrieved successfully',
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving recent activities',
            error: error.message
        });
    }
};

// Get department statistics
export const getDepartmentStatistics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin access required.'
            });
        }

        const stats = await getDepartmentStats();
        res.status(200).json({
            success: true,
            message: 'Department statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving department statistics',
            error: error.message
        });
    }
};

// Get inventory statistics
export const getInventoryStatistics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin access required.'
            });
        }

        const stats = await getInventoryStats();
        res.status(200).json({
            success: true,
            message: 'Inventory statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving inventory statistics',
            error: error.message
        });
    }
};

// Get procurement statistics
export const getProcurementStatistics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin access required.'
            });
        }

        const stats = await getProcurementStats();
        res.status(200).json({
            success: true,
            message: 'Procurement statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving procurement statistics',
            error: error.message
        });
    }
};

// Get user activity statistics
export const getUserActivityStatistics = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin access required.'
            });
        }

        const days = parseInt(req.query.days) || 30;
        const stats = await getUserActivityStats(days);
        res.status(200).json({
            success: true,
            message: 'User activity statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user activity statistics',
            error: error.message
        });
    }
};
