import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";

dotenv.config(); // Load environment variables from .env file
const app = express();

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet()); // Security middleware for HTTP headers
app.use(morgan("dev")); // Logging middleware

// Import routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/departments", departmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.name || "Internal Server Error",
        message: err.message || "An unexpected error occurred"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Not Found",
        message: "The requested resource was not found"
    });
});

export default app;