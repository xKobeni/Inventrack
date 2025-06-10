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
    updateAnyUserProfile,
    deleteAnyUserAccount
} from "../../controllers/userController/user.controller.js";
import {
    bulkUpdateUsersController,
    bulkDeleteUsersController,
    bulkActivateUsersController,
    bulkDeactivateUsersController
} from "../../controllers/userController/bulkUser.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { updateProfileValidation, adminUpdateUserValidation, userIdValidation } from "../../middleware/validation.js";
import { bulkUserValidation, bulkUpdateValidation } from "../../middleware/validation.js";
import { apiLimiter } from "../../middleware/rateLimit.middleware.js";
import { auditMiddleware } from "../../middleware/audit.middleware.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply rate limiting to all routes
router.use(apiLimiter);

// User profile routes
router.get("/profile", auditMiddleware('VIEW_PROFILE'), getUserProfile);
router.put("/profile", updateProfileValidation, auditMiddleware('UPDATE_PROFILE'), updateUserProfile);
router.delete("/profile", auditMiddleware('DELETE_PROFILE'), deleteUserAccount);
router.post("/profile/deactivate", auditMiddleware('DEACTIVATE_PROFILE'), deactivateUserAccount);
router.post("/profile/activate", auditMiddleware('ACTIVATE_PROFILE'), activateUserAccount);

// Admin only routes
router.get("/", auditMiddleware('VIEW_ALL_USERS'), fetchAllUsers);
router.get("/:id", userIdValidation, auditMiddleware('VIEW_USER'), fetchUserById);
router.put("/:id", userIdValidation, adminUpdateUserValidation, auditMiddleware('UPDATE_USER'), updateAnyUserProfile);
router.post("/:id/deactivate", userIdValidation, auditMiddleware('DEACTIVATE_USER'), deactivateAnyUserAccount);
router.post("/:id/activate", userIdValidation, auditMiddleware('ACTIVATE_USER'), activateAnyUserAccount);
router.delete("/:id", userIdValidation, auditMiddleware('DELETE_USER'), deleteAnyUserAccount);

// Bulk operations (admin only)
router.put("/bulk/update", bulkUpdateValidation, auditMiddleware('BULK_UPDATE_USERS'), bulkUpdateUsersController);
router.delete("/bulk/delete", bulkUserValidation, auditMiddleware('BULK_DELETE_USERS'), bulkDeleteUsersController);
router.post("/bulk/activate", bulkUserValidation, auditMiddleware('BULK_ACTIVATE_USERS'), bulkActivateUsersController);
router.post("/bulk/deactivate", bulkUserValidation, auditMiddleware('BULK_DEACTIVATE_USERS'), bulkDeactivateUsersController);

export default router;
