import { Router } from "express";
import { login, registerUser, logout } from "../controllers/auth.controller.js";
import { registerValidation, loginValidation } from "../middleware/validation.js";

const router = Router();

// Route for user login
router.post("/login", loginValidation, login);
// Route for user registration
router.post("/register", registerValidation, registerUser);
// Route for user logout
router.post("/logout", logout);

export default router;

