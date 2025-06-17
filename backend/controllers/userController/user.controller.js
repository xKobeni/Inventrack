import { getUserByEmail, updateUser, deleteUser, activateUser, deactivateUser, getUserById, getAllUsers, softDeleteUser, restoreUser } from '../../models/userModels/user.models.js';
import bcrypt from 'bcrypt';

// Get all users (admin only)
export const fetchAllUsers = async (req, res) => {
    try {
        // Check if user is admin 
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to view all users.'
            });
        }

        // Get query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role;
        const isActive = req.query.is_active;
        const isDeleted = req.query.is_deleted;
        const sortBy = req.query.sort_by || 'created_at';
        const sortOrder = req.query.sort_order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get users with pagination and filters
        const { users, total } = await getAllUsers({
            limit,
            offset,
            search,
            role,
            isActive,
            isDeleted,
            sortBy,
            sortOrder
        });
        
        // Remove sensitive information from response
        const sanitizedUsers = users.map(user => ({
            id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            is_deleted: user.is_deleted,
            deleted_at: user.deleted_at,
            created_at: user.created_at,
            profile_picture: user.profile_picture ? `data:${user.profile_picture_type};base64,${user.profile_picture.toString('base64')}` : null,
            department_id: user.department_id,
            department_name: user.department_name || null
        }));

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: sanitizedUsers,
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
            message: 'Error retrieving users',
            error: error.message
        });
    }
};

// Get user by ID
export const fetchUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Check if user is admin or requesting their own profile
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own profile.'
            });
        }

        const user = await getUserById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active,
                    department_id: user.department_id,
                    department_name: user.department_name || null
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user',
            error: error.message
        });
    }
};

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const user = await getUserByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Convert binary image data to base64 if it exists
        let profilePicture = null;
        if (user.profile_picture) {
            profilePicture = `data:${user.profile_picture_type};base64,${user.profile_picture.toString('base64')}`;
        }

        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active,
                    profile_picture: profilePicture,
                    department_id: user.department_id,
                    department_name: user.department_name || null
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user profile',
            error: error.message
        });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const { name, email, password, profile_picture, profile_picture_type } = req.body;

        // If password is provided, hash it
        let hashedPassword;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const updatedUser = await updateUser(userId, {
            name,
            email,
            password: hashedPassword,
            profile_picture,
            profile_picture_type
        });

        // Convert binary image data to base64 if it exists
        let profilePicture = null;
        if (updatedUser.profile_picture) {
            profilePicture = `data:${updatedUser.profile_picture_type};base64,${updatedUser.profile_picture.toString('base64')}`;
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    profile_picture: profilePicture
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// Delete user account
export const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const deletedUser = await deleteUser(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: {
                user: {
                    id: deletedUser.id,
                    name: deletedUser.name,
                    email: deletedUser.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// Deactivate user account
export const deactivateUserAccount = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const deactivatedUser = await deactivateUser(userId);

        res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            data: {
                user: {
                    id: deactivatedUser.id,
                    name: deactivatedUser.name,
                    email: deactivatedUser.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deactivating user',
            error: error.message
        });
    }
};

// Activate user account
export const activateUserAccount = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const activatedUser = await activateUser(userId);

        if (!activatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User activated successfully',
            data: {
                user: {
                    id: activatedUser.user_id,
                    name: activatedUser.name,
                    email: activatedUser.email,
                    role: activatedUser.role,
                    is_active: activatedUser.is_active
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error activating user',
            error: error.message
        });
    }
};

// Delete any user (admin only)
export const deleteAnyUserAccount = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
    const userId = req.params.id;
    const deletedUser = await deleteUser(userId);
    if (!deletedUser) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: {
            user: {
                id: deletedUser.user_id,
                name: deletedUser.name,
                email: deletedUser.email
            }
        }
    });
};

// Deactivate any user (admin only)
export const deactivateAnyUserAccount = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
    const userId = req.params.id;
    const deactivatedUser = await deactivateUser(userId);
    if (!deactivatedUser) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: {
            user: {
                id: deactivatedUser.user_id,
                name: deactivatedUser.name,
                email: deactivatedUser.email,
                is_active: deactivatedUser.is_active
            }
        }
    });
};

// Activate any user (admin only)
export const activateAnyUserAccount = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
    const userId = req.params.id;
    const activatedUser = await activateUser(userId);
    if (!activatedUser) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
    res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: {
            user: {
                id: activatedUser.user_id,
                name: activatedUser.name,
                email: activatedUser.email,
                is_active: activatedUser.is_active
            }
        }
    });
};

// Update any user profile (admin only)
export const updateAnyUserProfile = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
    const userId = req.params.id;
    const { name, email, password, role, profile_picture, profile_picture_type, department_id } = req.body;

    let hashedPassword;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await updateUser(userId, {
        name,
        email,
        password: hashedPassword,
        role,
        profile_picture,
        profile_picture_type,
        department_id
    });

    if (!updatedUser) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Convert binary image data to base64 if it exists
    let profilePicture = null;
    if (updatedUser.profile_picture) {
        profilePicture = `data:${updatedUser.profile_picture_type};base64,${updatedUser.profile_picture.toString('base64')}`;
    }

    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
            user: {
                id: updatedUser.user_id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                is_active: updatedUser.is_active,
                profile_picture: profilePicture
            }
        }
    });
};

// Soft delete user (admin only)
export const softDeleteUserAccount = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to soft delete users.'
            });
        }

        const userId = req.params.id;
        const deletedUser = await softDeleteUser(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User soft deleted successfully',
            data: {
                user: {
                    id: deletedUser.user_id,
                    name: deletedUser.name,
                    email: deletedUser.email,
                    is_deleted: deletedUser.is_deleted,
                    deleted_at: deletedUser.deleted_at
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error soft deleting user',
            error: error.message
        });
    }
};

// Restore soft deleted user (admin only)
export const restoreUserAccount = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You must be an admin to restore users.'
            });
        }

        const userId = req.params.id;
        const restoredUser = await restoreUser(userId);

        if (!restoredUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User restored successfully',
            data: {
                user: {
                    id: restoredUser.user_id,
                    name: restoredUser.name,
                    email: restoredUser.email,
                    is_deleted: restoredUser.is_deleted,
                    deleted_at: restoredUser.deleted_at
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error restoring user',
            error: error.message
        });
    }
};

// Change password for authenticated user
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required.'
            });
        }
        // Get user from DB
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        // Update password
        await updateUser(userId, { password: hashedPassword });
        return res.status(200).json({
            success: true,
            message: 'Password changed successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error changing password.',
            error: error.message
        });
    }
};
