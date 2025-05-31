import { Router } from "express";
import { 
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    deactivateUserAccount,
    activateUserAccount,
    fetchAllUsers,
    fetchUserById,
    deactivateAnyUserAccount,
    activateAnyUserAccount,
    updateAnyUserProfile
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all users (admin only)
router.get("/", fetchAllUsers);

// Get user by ID
router.get("/:id", fetchUserById);

// Get current user profile
router.get("/profile/me", getUserProfile);

// Update user profile
router.put("/profile/me", updateUserProfile);

// Delete user account
router.delete("/profile/me", deleteUserAccount);

// Deactivate user account
router.post("/profile/me/deactivate", deactivateUserAccount);

// Activate user account
router.post("/profile/me/activate", activateUserAccount);

// Deactivate any user (admin only)
router.post('/:id/deactivate', deactivateAnyUserAccount);

// Activate any user (admin only)
router.post('/:id/activate', activateAnyUserAccount);

// Update any user profile (admin only)
router.put('/:id', updateAnyUserProfile);

export default router;
