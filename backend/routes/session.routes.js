import { Router } from "express";
import {
    getActiveSessionsController,
    logoutSessionController,
    logoutAllSessionsController,
    createSessionController,
    logoutSessionByIdController,
    getSessionByIdController
} from "../controllers/authController/session.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { auditMiddleware } from "../middleware/audit.middleware.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Session management routes
router.get("/", auditMiddleware('VIEW_SESSIONS'), getActiveSessionsController);
router.get("/:sessionId", auditMiddleware('VIEW_SESSIONS'), getSessionByIdController);
router.post("/", auditMiddleware('CREATE_SESSION'), createSessionController);
router.delete("/current", auditMiddleware('LOGOUT_SESSION'), logoutSessionController);
router.delete("/:sessionId", auditMiddleware('LOGOUT_SESSION'), logoutSessionByIdController);
router.delete("/all", auditMiddleware('LOGOUT_ALL_SESSIONS'), logoutAllSessionsController);

export default router; 