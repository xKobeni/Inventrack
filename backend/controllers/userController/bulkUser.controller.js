import {
    bulkUpdateUsers,
    bulkDeleteUsers,
    bulkActivateUsers,
    bulkDeactivateUsers
} from '../../models/userModels/user.models.js';

// Bulk update users
export const bulkUpdateUsersController = async (req, res) => {
    try {
        const { userIds, updateData } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user IDs provided'
            });
        }

        const updatedUsers = await bulkUpdateUsers(userIds, updateData);

        res.status(200).json({
            success: true,
            message: 'Users updated successfully',
            data: {
                updated_count: updatedUsers.length,
                users: updatedUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating users',
            error: error.message
        });
    }
};

// Bulk delete users
export const bulkDeleteUsersController = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user IDs provided'
            });
        }

        const deletedUsers = await bulkDeleteUsers(userIds);

        res.status(200).json({
            success: true,
            message: 'Users deleted successfully',
            data: {
                deleted_count: deletedUsers.length,
                users: deletedUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting users',
            error: error.message
        });
    }
};

// Bulk activate users
export const bulkActivateUsersController = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user IDs provided'
            });
        }

        const activatedUsers = await bulkActivateUsers(userIds);

        res.status(200).json({
            success: true,
            message: 'Users activated successfully',
            data: {
                activated_count: activatedUsers.length,
                users: activatedUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error activating users',
            error: error.message
        });
    }
};

// Bulk deactivate users
export const bulkDeactivateUsersController = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user IDs provided'
            });
        }

        const deactivatedUsers = await bulkDeactivateUsers(userIds);

        res.status(200).json({
            success: true,
            message: 'Users deactivated successfully',
            data: {
                deactivated_count: deactivatedUsers.length,
                users: deactivatedUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deactivating users',
            error: error.message
        });
    }
}; 