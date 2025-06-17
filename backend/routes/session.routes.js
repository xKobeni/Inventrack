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

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Session management routes
router.get("/", getActiveSessionsController);
router.get("/:sessionId", getSessionByIdController);
router.post("/", createSessionController);
router.delete("/current", logoutSessionController);
router.delete("/:sessionId", logoutSessionByIdController);
router.delete("/all", logoutAllSessionsController);

export default router; 