import { Router } from "express";
import { login, registerUser, logout } from "../controllers/authController/auth.controller.js";
import { requestPasswordReset, resetPassword } from "../controllers/authController/passwordReset.controller.js";
import { registerValidation, loginValidation } from "../middleware/validation.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimit.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Authentication routes
router.post("/login", authLimiter, loginValidation, login);
router.post("/register", registerValidation, registerUser);
router.post("/logout", authMiddleware, logout);

// Password reset routes
router.post("/password/reset-request", passwordResetLimiter, requestPasswordReset);
router.post("/password/reset", passwordResetLimiter, resetPassword);

export default router;

