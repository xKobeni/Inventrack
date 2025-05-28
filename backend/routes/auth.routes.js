import express from "express";
import { Router } from "express";
import { login, registerUser, logout } from "../controllers/auth.controller.js";

const app = express();
const router = Router();

// Route for user login
router.post("/login", login);
// Route for user registration
router.post("/register", registerUser);
// Route for user logout
router.post("/logout", logout);


export default router; // Export the router for use in the main app

