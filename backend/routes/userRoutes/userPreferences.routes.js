import { Router } from "express";
import {
    getUserPreferencesController,
    updateUserPreferencesController
} from "../../controllers/userController/userPreferences.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { auditMiddleware } from "../../middleware/audit.middleware.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// User preferences routes
router.get("/", getUserPreferencesController);
router.put("/", auditMiddleware('UPDATE_PREFERENCES'), updateUserPreferencesController);

export default router; 